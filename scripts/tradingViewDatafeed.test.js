import test from "node:test";
import assert from "node:assert/strict";
import { createTradingViewDatafeed, resolutionToTimeframe } from "../src/services/tradingViewDatafeed.js";
import { aggregateMinuteBar, getBarBucketStart } from "../src/services/marketDataBars.js";

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function invoke(callbackStyleCall) {
  return new Promise((resolve, reject) => callbackStyleCall(resolve, reject));
}

test("resolution mapping exposes only backend-supported periods", () => {
  assert.deepEqual(["1", "5", "15", "30", "60", "D", "1D", "W"].map(resolutionToTimeframe), [
    "1Min", "5Min", "15Min", "30Min", "1Hour", "1Day", "1Day", "1Week",
  ]);
  assert.throws(() => resolutionToTimeframe("2"), /Unsupported chart resolution/);
});

test("onReady and search callbacks run asynchronously with TradingView-compatible results", async () => {
  const feed = createTradingViewDatafeed({
    apiBaseUrl: "http://test/api",
    fetcher: async (url) => {
      assert.match(url, /\/api\/market-data\/search\?q=apple$/);
      return jsonResponse([{ symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "stock" }]);
    },
  });
  let readyCalled = false;
  feed.onReady(() => { readyCalled = true; });
  assert.equal(readyCalled, false);
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(readyCalled, true);

  const results = await invoke((resolve) => feed.searchSymbols("apple", "", "", resolve));
  assert.deepEqual(results, [{
    symbol: "AAPL", full_name: "NASDAQ:AAPL", description: "Apple Inc.", exchange: "NASDAQ", ticker: "AAPL", type: "stock",
  }]);
});

test("resolveSymbol returns exact equity metadata and controlled errors", async () => {
  const feed = createTradingViewDatafeed({
    apiBaseUrl: "http://test/api",
    fetcher: async (url) => url.endsWith("/AAPL")
      ? jsonResponse({ symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "stock", currency: "USD" })
      : jsonResponse({ error: "not found" }, 404),
  });
  const info = await invoke((resolve) => feed.resolveSymbol("NASDAQ:AAPL", resolve, (error) => { throw new Error(error); }));
  assert.equal(info.ticker, "AAPL");
  assert.equal(info.timezone, "America/New_York");
  assert.equal(info.session, "0930-1600");
  assert.equal(info.pricescale, 100);
  assert.deepEqual(info.supported_resolutions, ["1", "5", "15", "30", "60", "D", "W"]);
  const error = await new Promise((resolve, reject) => feed.resolveSymbol("INVALID", () => reject(new Error("unexpected success")), (message) => resolve(new Error(message))));
  assert.match(error.message, /not found/i);
});

test("getBars maps requested periods, returns sorted millisecond bars, noData, and safe errors", async () => {
  const requests = [];
  const feed = createTradingViewDatafeed({
    apiBaseUrl: "http://test/api",
    fetcher: async (url) => {
      requests.push(new URL(url));
      if (url.includes("BROKEN")) return jsonResponse({ error: "down" }, 502);
      if (url.includes("EMPTY")) return jsonResponse({ symbol: "EMPTY", bars: [] });
      return jsonResponse({ symbol: "AAPL", bars: [
        { time: "2026-09-29T14:00:00Z", open: 2, high: 3, low: 1, close: 2.5, volume: 20 },
        { time: "2026-09-29T13:00:00Z", open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 },
      ] });
    },
  });
  const from = Math.floor(Date.parse("2026-09-29T00:00:00Z") / 1000);
  const to = Math.floor(Date.parse("2026-09-30T00:00:00Z") / 1000);
  const history = async (symbol, resolution, countBack = 37) => invoke((resolve, reject) =>
    feed.getBars({ ticker: symbol }, resolution, { from, to, countBack }, (bars, meta) => resolve({ bars, meta }), reject));

  for (const [resolution, timeframe] of [["1", "1Min"], ["5", "5Min"], ["60", "1Hour"], ["D", "1Day"], ["W", "1Week"]]) {
    const result = await history("AAPL", resolution);
    const query = requests.at(-1).searchParams;
    assert.equal(query.get("timeframe"), timeframe);
    assert.equal(query.get("limit"), "37");
    assert.equal(query.get("start"), new Date(from * 1000).toISOString());
    assert.equal(result.meta.noData, false);
    assert.ok(result.bars.every((bar) => Number.isInteger(bar.time) && bar.time > 1e12));
    assert.ok(result.bars[0].time <= result.bars.at(-1).time);
    if (["D", "W"].includes(resolution)) assert.equal(new Date(result.bars[0].time).toISOString().slice(11), "00:00:00.000Z");
  }
  const empty = await history("EMPTY", "1");
  assert.deepEqual(empty, { bars: [], meta: { noData: true } });
  const error = await new Promise((resolve, reject) => feed.getBars({ ticker: "BROKEN" }, "1", { from, to, countBack: 1 }, () => reject(new Error("unexpected success")), (message) => resolve(new Error(message))));
  assert.match(error.message, /temporarily unavailable/i);
});

test("minute bars aggregate on New York session boundaries and ignore extended hours and old updates", () => {
  const summerOpen = Date.parse("2026-09-30T13:30:00Z");
  assert.equal(getBarBucketStart(summerOpen + 14 * 60000, "15"), summerOpen);
  assert.equal(getBarBucketStart(summerOpen + 60 * 60000, "60"), summerOpen + 60 * 60000);
  assert.equal(getBarBucketStart(Date.parse("2026-09-30T12:00:00Z"), "5"), null);
  assert.equal(getBarBucketStart(Date.parse("2026-09-30T20:00:00Z"), "5"), null);
  assert.equal(getBarBucketStart(summerOpen, "D"), Date.parse("2026-09-30T00:00:00Z"));
  assert.equal(getBarBucketStart(Date.parse("2026-09-30T13:30:00Z"), "W"), Date.parse("2026-09-28T00:00:00Z"));
  const winterOpen = Date.parse("2026-01-05T14:30:00Z");
  assert.equal(getBarBucketStart(winterOpen, "30"), winterOpen);

  const seed = { time: summerOpen, open: 10, high: 12, low: 9, close: 11, volume: 50 };
  const update = aggregateMinuteBar(seed, { time: summerOpen + 60000, open: 11, high: 13, low: 10, close: 12, volume: 20 }, "5", summerOpen);
  assert.deepEqual(update, {
    bar: { time: summerOpen, open: 10, high: 13, low: 9, close: 12, volume: 70 },
    lastSourceTime: summerOpen + 60000,
    lastSourceBar: { time: summerOpen + 60000, open: 11, high: 13, low: 10, close: 12, volume: 20 },
  });
  const correction = aggregateMinuteBar(update.bar, { time: summerOpen + 60000, open: 11, high: 14, low: 10, close: 13, volume: 24, updated: true }, "5", update.lastSourceTime, { volume: 20 });
  assert.deepEqual(correction.bar, { time: summerOpen, open: 10, high: 14, low: 9, close: 13, volume: 74 });
  assert.equal(aggregateMinuteBar(update.bar, { time: summerOpen, open: 10, high: 12, low: 9, close: 11, volume: 50, updated: true }, "5", update.lastSourceTime), null);
  assert.equal(aggregateMinuteBar(seed, { time: summerOpen + 30000, open: 9, high: 9, low: 8, close: 8, volume: 1 }, "5", update.lastSourceTime), null);
});

test("subscribeBars routes complete aggregated bars, resets cache after reconnect, and unsubscribes by UID", async () => {
  const handlers = new Map();
  const statusHandlers = new Set();
  const stream = {
    status: "connected",
    subscribe(symbol, handler) {
      handlers.set(`${symbol}:${handlers.size}`, handler);
      const key = `${symbol}:${handlers.size - 1}`;
      return () => handlers.delete(key);
    },
    subscribeStatus(handler) {
      statusHandlers.add(handler);
      handler({ status: this.status });
      return () => statusHandlers.delete(handler);
    },
    emit(symbol, bar) { for (const [key, handler] of handlers) if (key.startsWith(`${symbol}:`)) handler(bar); },
    setStatus(status) { this.status = status; for (const handler of statusHandlers) handler({ status }); },
  };
  const feed = createTradingViewDatafeed({ apiBaseUrl: "http://test/api", fetcher: async () => jsonResponse({ bars: [] }), stream });
  const output = [];
  let resetCount = 0;
  feed.subscribeBars({ ticker: "AAPL" }, "5", (bar) => output.push(bar), "uid-1", () => { resetCount += 1; });
  stream.setStatus("reconnecting");
  stream.setStatus("connected");
  assert.equal(resetCount, 1);
  const firstMinute = Date.parse("2026-09-30T13:30:00Z");
  stream.emit("AAPL", { time: firstMinute, open: 100, high: 102, low: 99, close: 101, volume: 10 });
  stream.emit("AAPL", { time: firstMinute + 60000, open: 101, high: 104, low: 100, close: 103, volume: 15 });
  assert.deepEqual(output.at(-1), { time: firstMinute, open: 100, high: 104, low: 99, close: 103, volume: 25 });
  feed.unsubscribeBars("uid-other");
  assert.equal(handlers.size, 1);
  feed.unsubscribeBars("uid-1");
  assert.equal(handlers.size, 0);
});
