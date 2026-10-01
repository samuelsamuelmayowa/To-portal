import { MARKET_DATA_API_BASE } from "./marketDataConfig.js";

export const CHART_TIMEFRAMES = [
  { label: "1m", resolution: "1", timeframe: "1Min" },
  { label: "5m", resolution: "5", timeframe: "5Min" },
  { label: "15m", resolution: "15", timeframe: "15Min" },
  { label: "30m", resolution: "30", timeframe: "30Min" },
  { label: "1h", resolution: "60", timeframe: "1Hour" },
  { label: "1D", resolution: "D", timeframe: "1Day" },
  { label: "1W", resolution: "W", timeframe: "1Week" },
];

export function resolutionToTimeframe(resolution) {
  const match = CHART_TIMEFRAMES.find((item) => item.resolution === String(resolution) || item.label === resolution);
  if (!match) throw new Error(`Unsupported timeframe: ${resolution}`);
  return match.timeframe;
}

const LOOKBACK_DAYS = {
  "1": 3,
  "5": 7,
  "15": 20,
  "30": 40,
  "60": 75,
  D: 365,
  W: 365 * 5,
};

export function getHistoricalRange(resolution, now = new Date()) {
  const match = CHART_TIMEFRAMES.find((item) => item.resolution === String(resolution) || item.label === resolution);
  if (!match) throw new Error(`Unsupported timeframe: ${resolution}`);
  const key = match.resolution;
  const end = new Date(now);
  if (!Number.isFinite(end.getTime())) throw new Error("Invalid range end time.");
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS[key]);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function normalizeMarketBar(row) {
  const milliseconds = typeof row?.time === "number" ? (row.time < 1e12 ? row.time * 1000 : row.time) : Date.parse(row?.time);
  const [open, high, low, close, volume] = [row?.open, row?.high, row?.low, row?.close, row?.volume].map(Number);
  if (!Number.isFinite(milliseconds) || [open, high, low, close, volume].some((value) => !Number.isFinite(value))) return null;
  return { time: milliseconds, open, high, low, close, volume };
}

export function normalizeStockSearchResults(rows) {
  const entries = Array.isArray(rows)
    ? rows
    : [rows?.results, rows?.assets, rows?.symbols, rows?.data, rows?.data?.results, rows?.data?.assets].find(Array.isArray) || [];
  return entries.flatMap((row) => {
    const symbol = String(row?.symbol || row?.ticker || row?.asset_symbol || "").trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9.-]{0,14}$/.test(symbol) || symbol.includes("..") || symbol.endsWith(".")) return [];
    const name = row?.name || row?.company_name || row?.description;
    const exchange = row?.exchange || row?.primary_exchange || row?.exchange_code;
    return [{
      symbol,
      name: typeof name === "string" && name.trim() ? name.trim() : symbol,
      ...(typeof exchange === "string" && exchange.trim() ? { exchange: exchange.trim() } : {}),
      type: "stock",
    }];
  });
}

export async function fetchMarketQuote(symbol, { apiBaseUrl = MARKET_DATA_API_BASE, fetcher = globalThis.fetch, signal } = {}) {
  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.-]{0,14}$/.test(cleanSymbol) || cleanSymbol.includes("..") || cleanSymbol.endsWith(".")) throw new Error("Enter a valid stock symbol.");
  const response = await fetcher(`${apiBaseUrl}/market-data/quote/${encodeURIComponent(cleanSymbol)}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(response.status === 404 ? "No market quote was found for this symbol." : "Market quotes are temporarily unavailable.");
  const payload = await response.json();
  const price = Number(payload?.price);
  const bid = Number(payload?.bid);
  const ask = Number(payload?.ask);
  const marketPrice = Number.isFinite(price) && price > 0
    ? price
    : Number.isFinite(bid) && bid > 0 && Number.isFinite(ask) && ask > 0
      ? (bid + ask) / 2
      : Number.isFinite(bid) && bid > 0 ? bid : Number.isFinite(ask) && ask > 0 ? ask : null;
  if (marketPrice == null) throw new Error(`No market price found for ${cleanSymbol}.`);
  return { ...payload, symbol: payload?.symbol || cleanSymbol, marketPrice };
}

export async function fetchHistoricalBars(symbol, resolution, { apiBaseUrl = MARKET_DATA_API_BASE, fetcher = globalThis.fetch, signal, limit = 300, now = new Date() } = {}) {
  const cleanSymbol = String(symbol || "").trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.-]{0,14}$/.test(cleanSymbol) || cleanSymbol.includes("..") || cleanSymbol.endsWith(".")) throw new Error("Enter a valid stock symbol.");
  const timeframe = resolutionToTimeframe(resolution);
  const range = getHistoricalRange(resolution, now);
  const url = new URL(`${apiBaseUrl}/market-data/bars/${encodeURIComponent(cleanSymbol)}`);
  url.searchParams.set("timeframe", timeframe);
  url.searchParams.set("start", range.start);
  url.searchParams.set("end", range.end);
  url.searchParams.set("limit", String(Math.min(300, Math.max(1, Math.floor(limit)))));
  const response = await fetcher(url, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) throw new Error(response.status === 404 ? "No market data was found for this symbol." : "Historical market data is temporarily unavailable.");
  const payload = await response.json();
  const unique = new Map();
  for (const row of Array.isArray(payload?.bars) ? payload.bars : []) {
    const bar = normalizeMarketBar(row);
    if (bar) unique.set(bar.time, bar);
  }
  return [...unique.values()].sort((a, b) => a.time - b.time);
}

export function toLightweightTime(milliseconds, resolution) {
  const date = new Date(milliseconds);
  if (["D", "W"].includes(String(resolution))) return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  return Math.floor(milliseconds / 1000);
}

export function lightweightTimeKey(time) {
  if (typeof time === "number") return time;
  if (typeof time === "string") return Math.floor(Date.parse(`${time}T00:00:00Z`) / 1000);
  return Math.floor(Date.UTC(time.year, time.month - 1, time.day) / 1000);
}
