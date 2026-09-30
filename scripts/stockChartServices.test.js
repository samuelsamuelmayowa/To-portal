import test from "node:test";
import assert from "node:assert/strict";
import { CHART_TIMEFRAMES, fetchHistoricalBars, fetchMarketQuote, getHistoricalRange, lightweightTimeKey, normalizeMarketBar, resolutionToTimeframe, toLightweightTime } from "../src/services/marketDataClient.js";
import { calculateEMA, calculateIndicators, calculateRSI, calculateSMA, calculateVWAP } from "../src/services/chartIndicators.js";
import { aggregateMinuteBar } from "../src/services/marketDataBars.js";

const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test("chart timeframes map to backend periods and validate bar timestamps", () => {
  assert.deepEqual(CHART_TIMEFRAMES.map(({ label }) => resolutionToTimeframe(label)), ["1Min", "5Min", "15Min", "30Min", "1Hour", "1Day", "1Week"]);
  assert.throws(() => resolutionToTimeframe("2m"), /Unsupported timeframe/);
  const dailyMs = Date.parse("2026-09-30T00:00:00Z");
  const time = toLightweightTime(dailyMs, "D");
  assert.deepEqual(time, { year: 2026, month: 9, day: 30 });
  assert.equal(lightweightTimeKey(time), dailyMs / 1000);
  assert.equal(toLightweightTime(dailyMs, "5"), dailyMs / 1000);
  assert.equal(normalizeMarketBar({ time: dailyMs / 1000, open: 1, high: 2, low: 1, close: 2, volume: 3 }).time, dailyMs);
  assert.equal(normalizeMarketBar({ time: "invalid", open: 1 }), null);
});

test("historical ranges are ISO UTC windows sized for trading hours and closed markets", () => {
  const now = new Date("2026-09-30T14:30:00.000Z");
  const expectedDays = [3, 7, 20, 40, 75, 365, 1825];
  CHART_TIMEFRAMES.forEach(({ resolution }, index) => {
    const range = getHistoricalRange(resolution, now);
    assert.equal(range.end, now.toISOString());
    assert.equal(range.start, new Date(now.getTime() - expectedDays[index] * 86400000).toISOString());
    assert.match(range.start, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
  });
  assert.deepEqual(getHistoricalRange("1m", now), getHistoricalRange("1", now));
  assert.ok(Date.parse(getHistoricalRange("1", now).start) <= Date.parse(now) - 3 * 86400000, "minute windows span multiple days to cover weekends and market closures");
  assert.throws(() => getHistoricalRange("2", now), /Unsupported timeframe/);
});

test("historical chart client requests a bounded backend range and sorts/deduplicates bars", async () => {
  let requested;
  const history = await fetchHistoricalBars("aapl", "15", {
    apiBaseUrl: "https://backend.example/api",
    limit: 5000,
    now: new Date("2026-09-30T14:30:00.000Z"),
    fetcher: async (url) => {
      requested = new URL(url);
      return response({ bars: [
        { time: "2026-09-30T14:05:00Z", open: 2, high: 3, low: 1, close: 2.5, volume: 10 },
        { time: "2026-09-30T14:00:00Z", open: 1, high: 2, low: 0.5, close: 1.5, volume: 5 },
        { time: "2026-09-30T14:05:00Z", open: 2, high: 4, low: 1, close: 3, volume: 12 },
      ] });
    },
  });
  assert.equal(requested.pathname, "/api/market-data/bars/AAPL");
  assert.equal(requested.searchParams.get("timeframe"), "15Min");
  assert.equal(requested.searchParams.get("limit"), "300");
  assert.equal(requested.searchParams.get("start"), "2026-09-10T14:30:00.000Z");
  assert.equal(requested.searchParams.get("end"), "2026-09-30T14:30:00.000Z");
  assert.deepEqual(history.map((bar) => bar.time), [Date.parse("2026-09-30T14:00:00Z"), Date.parse("2026-09-30T14:05:00Z")]);
  assert.equal(history[1].close, 3);
  await assert.rejects(() => fetchHistoricalBars("AAPL", "1", { fetcher: async () => response({}, 502) }), /temporarily unavailable/);
  await assert.rejects(() => fetchHistoricalBars("AAPL/../../secret", "1", { fetcher: async () => response({}) }), /valid stock symbol/);
});

test("every chart timeframe sends a complete bounded history query for AAPL, MSFT, and NVDA", async () => {
  const now = new Date("2026-09-30T14:30:00.000Z");
  for (const symbol of ["AAPL", "MSFT", "NVDA"]) {
    for (const { resolution, timeframe } of CHART_TIMEFRAMES) {
      let requested;
      const history = await fetchHistoricalBars(symbol, resolution, {
        apiBaseUrl: "https://backend.example/api",
        now,
        fetcher: async (url) => {
          requested = new URL(url);
          return response({ symbol, timeframe, bars: [{ time: "2026-09-29T04:00:00Z", open: 10, high: 12, low: 9, close: 11, volume: 100 }] });
        },
      });
      assert.equal(requested.pathname, `/api/market-data/bars/${symbol}`);
      assert.equal(requested.searchParams.get("timeframe"), timeframe);
      assert.equal(requested.searchParams.get("start"), getHistoricalRange(resolution, now).start);
      assert.equal(requested.searchParams.get("end"), now.toISOString());
      assert.equal(requested.searchParams.get("limit"), "300");
      assert.equal(history.length, 1);
      assert.deepEqual(chartTime(history[0].time, resolution), resolution === "D" || resolution === "W"
        ? { year: 2026, month: 9, day: 29 }
        : Date.parse("2026-09-29T04:00:00Z") / 1000);
    }
  }
});

function chartTime(milliseconds, resolution) {
  return toLightweightTime(milliseconds, resolution);
}

test("market quote client normalizes Alpaca price and quote fields from the backend", async () => {
  let requested;
  const quote = await fetchMarketQuote("aapl", {
    apiBaseUrl: "https://backend.example/api",
    fetcher: async (url) => {
      requested = new URL(url);
      return response({ symbol: "AAPL", source: "alpaca", price: 227.5, bid: 227.4, ask: 227.6, timestamp: "2026-09-30T14:00:00Z" });
    },
  });
  assert.equal(requested.pathname, "/api/market-data/quote/AAPL");
  assert.equal(quote.marketPrice, 227.5);
  assert.equal(quote.source, "alpaca");
  await assert.rejects(() => fetchMarketQuote("AAPL", { fetcher: async () => response({}, 503) }), /temporarily unavailable/);
  await assert.rejects(() => fetchMarketQuote("AAPL", { fetcher: async () => response({ symbol: "AAPL" }) }), /No market price/);
});

test("EMA, SMA, VWAP, and RSI use the supplied OHLCV bars", () => {
  const bars = Array.from({ length: 25 }, (_, index) => ({ time: Date.UTC(2026, 8, 30, 13, 30 + index), open: index + 1, high: index + 2, low: index, close: index + 1, volume: 100 }));
  assert.equal(calculateEMA(bars, 9).length, 17);
  assert.equal(calculateSMA(bars, 20).length, 6);
  assert.equal(calculateSMA(bars, 20).at(-1).value, 15.5);
  assert.equal(calculateVWAP(bars).length, bars.length);
  assert.equal(calculateRSI(bars, 14).at(-1).value, 100);
  assert.deepEqual(Object.keys(calculateIndicators(bars, { ema9: true, rsi14: true })), ["ema9", "rsi14"]);
});

test("stream updates aggregate into the selected interval without moving backward", () => {
  const open = Date.parse("2026-09-30T13:30:00Z");
  const history = { time: open, open: 10, high: 11, low: 9, close: 10, volume: 20 };
  const next = aggregateMinuteBar(history, { time: open + 60000, open: 10, high: 12, low: 9, close: 11, volume: 8 }, "5", open);
  assert.deepEqual(next.bar, { time: open, open: 10, high: 12, low: 9, close: 11, volume: 28 });
  assert.equal(aggregateMinuteBar(next.bar, { time: open, open: 10, high: 11, low: 9, close: 10, volume: 20 }, "5", next.lastSourceTime), null);
});
