import marketDataStream from "./marketDataStream.js";
import { aggregateMinuteBar } from "./marketDataBars.js";
import { MARKET_DATA_API_BASE } from "./marketDataConfig.js";

const SUPPORTED_RESOLUTIONS = ["1", "5", "15", "30", "60", "D", "W"];
const MAX_BAR_LIMIT = 10000;

/** Map every advertised TradingView resolution to one backend/Alpaca timeframe. */
export function resolutionToTimeframe(resolution) {
  const mapping = {
    "1": "1Min",
    "5": "5Min",
    "15": "15Min",
    "30": "30Min",
    "60": "1Hour",
    D: "1Day",
    "1D": "1Day",
    W: "1Week",
  };
  const timeframe = mapping[String(resolution)];
  if (!timeframe) throw new Error(`Unsupported chart resolution: ${resolution}`);
  return timeframe;
}

function asyncCallback(callback, ...args) {
  setTimeout(() => callback(...args), 0);
}

function encodeSymbol(symbol) {
  const value = String(symbol || "").trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.-]{0,14}$/.test(value) || value.includes("..") || value.endsWith(".")) {
    throw new Error("Enter a valid U.S. equity symbol.");
  }
  return value;
}

function secondsToIso(value, label) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error(`Invalid chart period ${label}.`);
  const date = new Date(seconds * 1000);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid chart period ${label}.`);
  return date.toISOString();
}

function normalizeBar(bar, resolution) {
  let milliseconds = typeof bar.time === "number" ? bar.time : Date.parse(bar.time);
  if (["D", "1D", "W"].includes(String(resolution)) && Number.isFinite(milliseconds)) {
    const calendarDate = new Date(milliseconds).toISOString().slice(0, 10);
    milliseconds = Date.parse(`${calendarDate}T00:00:00.000Z`);
  }
  const values = [bar.open, bar.high, bar.low, bar.close, bar.volume].map(Number);
  if (!Number.isFinite(milliseconds) || values.some((value) => !Number.isFinite(value))) return null;
  return {
    time: milliseconds,
    open: values[0],
    high: values[1],
    low: values[2],
    close: values[3],
    volume: values[4],
  };
}

export function createTradingViewDatafeed({
  apiBaseUrl = MARKET_DATA_API_BASE,
  fetcher = globalThis.fetch,
  stream = marketDataStream,
} = {}) {
  const lastBars = new Map();
  const subscribers = new Map();
  const barCacheKey = (symbol, resolution) => `${symbol}:${resolution}`;

  async function request(path, params = {}) {
    const url = new URL(`${apiBaseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
    const response = await fetcher(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const error = new Error(response.status === 404 ? "Symbol or market data was not found." : "Market data is temporarily unavailable.");
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  return {
    onReady(callback) {
      asyncCallback(callback, {
        supported_resolutions: [...SUPPORTED_RESOLUTIONS],
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: false,
      });
    },

    searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
      Promise.resolve()
        .then(async () => {
          const query = String(userInput || "").trim();
          if (!query) return [];
          const records = await request("/market-data/search", { q: query });
          return (Array.isArray(records) ? records : [])
            .filter((record) => record?.symbol && record.type === "stock")
            .filter((record) => !exchange || !record.exchange || record.exchange === exchange)
            .filter((record) => !symbolType || record.type === symbolType)
            .map((record) => ({
              symbol: record.symbol,
              full_name: record.exchange ? `${record.exchange}:${record.symbol}` : record.symbol,
              description: record.name || record.symbol,
              exchange: record.exchange || "",
              ticker: record.symbol,
              type: record.type,
            }));
        })
        .then((results) => asyncCallback(onResultReadyCallback, results))
        .catch(() => asyncCallback(onResultReadyCallback, []));
    },

    resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
      Promise.resolve()
        .then(async () => {
          const requestedName = String(symbolName || "");
          const symbol = encodeSymbol(requestedName.includes(":") ? requestedName.split(":").pop() : requestedName);
          const record = await request(`/market-data/symbol/${encodeURIComponent(symbol)}`);
          if (!record || record.symbol !== symbol || record.type !== "stock") {
            throw new Error("This chart supports active U.S. equities only.");
          }
          if (typeof record.name !== "string" || !record.name || typeof record.currency !== "string" || !record.currency) {
            throw new Error("The backend returned incomplete symbol metadata.");
          }
          const info = {
            ticker: record.symbol,
            name: record.name,
            description: record.name,
            type: record.type,
            exchange: record.exchange || "",
            listed_exchange: record.exchange || "",
            timezone: "America/New_York",
            session: "0930-1600",
            currency_code: record.currency,
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            supported_resolutions: [...SUPPORTED_RESOLUTIONS],
            volume_precision: 0,
          };
          return info;
        })
        .then((info) => asyncCallback(onSymbolResolvedCallback, info))
        .catch((error) => asyncCallback(onResolveErrorCallback, error?.message || "Unable to resolve this symbol."));
    },

    getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
      Promise.resolve()
        .then(async () => {
          const symbol = encodeSymbol(symbolInfo?.ticker || symbolInfo?.name);
          const timeframe = resolutionToTimeframe(resolution);
          const from = secondsToIso(periodParams?.from, "start");
          const to = secondsToIso(periodParams?.to, "end");
          if (Date.parse(from) > Date.parse(to)) throw new Error("Chart period start must be before its end.");
          const requested = Number(periodParams?.countBack);
          const limit = Number.isFinite(requested) && requested > 0
            ? Math.min(MAX_BAR_LIMIT, Math.max(1, Math.ceil(requested)))
            : 300;
          const payload = await request(`/market-data/bars/${encodeURIComponent(symbol)}`, {
            timeframe,
            start: from,
            end: to,
            limit,
          });
          const bars = (Array.isArray(payload?.bars) ? payload.bars : [])
            .map((bar) => normalizeBar(bar, resolution))
            .filter((bar) => bar && bar.time >= Number(periodParams.from) * 1000 && bar.time <= Number(periodParams.to) * 1000)
            .sort((left, right) => left.time - right.time);
          if (bars.length) {
            const cacheKey = barCacheKey(symbol, resolution);
            const current = lastBars.get(cacheKey);
            const latest = bars[bars.length - 1];
            if (!current || latest.time >= current.time) lastBars.set(cacheKey, { bar: latest, sourceTime: -Infinity });
          }
          return { bars, meta: { noData: bars.length === 0 } };
        })
        .then(({ bars, meta }) => asyncCallback(onHistoryCallback, bars, meta))
        .catch((error) => asyncCallback(onErrorCallback, error?.message || "Unable to load chart history."));
    },

    subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
      const uid = String(subscriberUID || "");
      try {
        const symbol = encodeSymbol(symbolInfo?.ticker || symbolInfo?.name);
        resolutionToTimeframe(resolution);
        if (!uid) throw new Error("A unique chart subscription ID is required.");
        this.unsubscribeBars(uid);
        const cacheKey = barCacheKey(symbol, resolution);
        const cached = lastBars.get(cacheKey);
        const state = {
          symbol,
          resolution: String(resolution),
          bar: cached?.bar || null,
          lastSourceTime: cached?.sourceTime ?? -Infinity,
          lastSourceBar: cached?.sourceBar || null,
          onRealtimeCallback,
          onResetCacheNeededCallback,
          hasConnected: false,
          wasDisconnected: false,
          unsubscribeStream: null,
          unsubscribeStatus: null,
        };
        state.unsubscribeStream = stream.subscribe(symbol, (minuteBar) => {
          const next = aggregateMinuteBar(state.bar, minuteBar, state.resolution, state.lastSourceTime, state.lastSourceBar);
          if (!next) return;
          state.bar = next.bar;
          state.lastSourceTime = next.lastSourceTime;
          state.lastSourceBar = next.lastSourceBar || state.lastSourceBar;
          lastBars.set(cacheKey, { bar: next.bar, sourceTime: next.lastSourceTime, sourceBar: state.lastSourceBar });
          state.onRealtimeCallback({ ...next.bar });
        });
        state.unsubscribeStatus = stream.subscribeStatus(({ status }) => {
          if (status === "connected") {
            if (state.hasConnected && state.wasDisconnected) {
              state.wasDisconnected = false;
              state.lastSourceTime = -Infinity;
              state.lastSourceBar = null;
              state.onResetCacheNeededCallback?.();
            }
            state.hasConnected = true;
          } else if (state.hasConnected && ["reconnecting", "offline"].includes(status)) {
            state.wasDisconnected = true;
          }
        });
        subscribers.set(uid, state);
      } catch {
        onResetCacheNeededCallback?.();
      }
    },

    unsubscribeBars(subscriberUID) {
      const uid = String(subscriberUID || "");
      const state = subscribers.get(uid);
      if (!state) return;
      state.unsubscribeStream?.();
      state.unsubscribeStatus?.();
      subscribers.delete(uid);
    },
  };
}

export default createTradingViewDatafeed();
