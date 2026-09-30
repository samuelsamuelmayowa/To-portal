import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { createChart, createSeriesMarkers, CandlestickSeries, HistogramSeries, LineSeries, ColorType } from "lightweight-charts";
import { BarChart3, ChevronDown, Expand, RotateCcw } from "lucide-react";
import marketDataStream from "../../services/marketDataStream";
import { fetchHistoricalBars, lightweightTimeKey, toLightweightTime } from "../../services/marketDataClient";
import { aggregateMinuteBar } from "../../services/marketDataBars";
import { calculateIndicators } from "../../services/chartIndicators";

const TIMEFRAMES = [
  { label: "1m", resolution: "1" }, { label: "5m", resolution: "5" }, { label: "15m", resolution: "15" },
  { label: "30m", resolution: "30" }, { label: "1h", resolution: "60" }, { label: "1D", resolution: "D" }, { label: "1W", resolution: "W" },
];
const INDICATORS = [
  ["ema9", "EMA 9", "#38bdf8"], ["ema20", "EMA 20", "#a78bfa"], ["ema50", "EMA 50", "#f59e0b"],
  ["sma20", "SMA 20", "#f472b6"], ["vwap", "VWAP", "#34d399"], ["rsi14", "RSI 14", "#fb7185"],
];

function chartData(bars, resolution) {
  return bars.map((bar) => ({ ...bar, time: toLightweightTime(bar.time, resolution) }));
}

function orderMarkers(orders, symbol, bars, resolution) {
  const points = bars.map((bar) => ({ time: toLightweightTime(bar.time, resolution), key: bar.time })).sort((a, b) => a.key - b.key);
  return orders.filter((order) => String(order.symbol || "").toUpperCase() === symbol && order.created_at && ["buy", "sell"].includes(String(order.side).toLowerCase()))
    .map((order) => {
      const timestamp = Date.parse(order.created_at);
      let nearest = null;
      for (const point of points) { if (point.key > timestamp) break; nearest = point; }
      if (!nearest) return null;
      const buy = String(order.side).toLowerCase() === "buy";
      return { time: nearest.time, position: buy ? "belowBar" : "aboveBar", color: buy ? "#34d399" : "#fb7185", shape: buy ? "arrowUp" : "arrowDown", text: buy ? "BUY" : "SELL" };
    }).filter(Boolean).sort((a, b) => lightweightTimeKey(a.time) - lightweightTimeKey(b.time));
}

export default function StockChart({ symbol, active = true, orders = [] }) {
  const hostRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);
  const markerRef = useRef(null);
  const indicatorSeriesRef = useRef({});
  const rsiPaneRef = useRef(false);
  const barsRef = useRef([]);
  const latestRealtimeRef = useRef(null);
  const updateIndicatorsRef = useRef(() => {});
  const [resolution, setResolution] = useState("5");
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [empty, setEmpty] = useState(false);
  const [volumeVisible, setVolumeVisible] = useState(true);
  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false);
  const [enabled, setEnabled] = useState({});

  const updateIndicatorData = useCallback((sourceBars = barsRef.current) => {
    const series = indicatorSeriesRef.current;
    const calculated = calculateIndicators(sourceBars, enabled);
    for (const [key, line] of Object.entries(series)) {
      const data = (calculated[key] || []).map((point) => ({ time: toLightweightTime(point.time, resolution), value: point.value }));
      line.setData(data);
    }
  }, [enabled, resolution]);
  updateIndicatorsRef.current = updateIndicatorData;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const chart = createChart(host, {
      width: host.clientWidth || 800, height: host.clientHeight || 420,
      layout: { background: { type: ColorType.Solid, color: "#0d1420" }, textColor: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" },
      grid: { vertLines: { color: "#1e293b" }, horzLines: { color: "#1e293b" } },
      rightPriceScale: { borderColor: "#334155", scaleMargins: { top: 0.08, bottom: 0.22 } },
      timeScale: { borderColor: "#334155", timeVisible: true, secondsVisible: false, rightOffset: 4 },
      crosshair: { vertLine: { color: "#64748b", labelBackgroundColor: "#334155" }, horzLine: { color: "#64748b", labelBackgroundColor: "#334155" } },
      localization: { locale: "en-US" },
    });
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e", downColor: "#f43f5e", borderUpColor: "#22c55e", borderDownColor: "#f43f5e",
      wickUpColor: "#22c55e", wickDownColor: "#f43f5e", priceLineVisible: true,
    });
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" }, priceScaleId: "volume", lastValueVisible: false, priceLineVisible: false,
    });
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    chartRef.current = chart; candleRef.current = candles; volumeRef.current = volume;
    markerRef.current = createSeriesMarkers(candles, []);
    const resize = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect?.width > 0 && rect?.height > 0) chart.applyOptions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    });
    resize.observe(host);
    return () => {
      resize.disconnect();
      markerRef.current?.detach(); markerRef.current = null;
      chart.remove(); chartRef.current = null; candleRef.current = null; volumeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return undefined;
    for (const line of Object.values(indicatorSeriesRef.current)) chart.removeSeries(line);
    indicatorSeriesRef.current = {};
    if (rsiPaneRef.current) { if (chart.panes().length > 1) chart.removePane(1); rsiPaneRef.current = false; }
    const calculated = calculateIndicators(barsRef.current, enabled);
    for (const [key, label, color] of INDICATORS) {
      if (!enabled[key]) continue;
      const isRsi = key === "rsi14";
      if (isRsi && !rsiPaneRef.current) {
        const pane = chart.addPane(); pane.setStretchFactor(0.24); rsiPaneRef.current = true;
      }
      const line = chart.addSeries(LineSeries, {
        color, lineWidth: 2, title: label, priceLineVisible: false, lastValueVisible: true,
        ...(isRsi ? { autoscaleInfoProvider: (original) => { const result = original?.(); return result ? { ...result, priceRange: { minValue: 0, maxValue: 100 } } : null; } } : {}),
      }, isRsi ? 1 : 0);
      line.setData((calculated[key] || []).map((point) => ({ time: toLightweightTime(point.time, resolution), value: point.value })));
      indicatorSeriesRef.current[key] = line;
    }
    return undefined;
  }, [enabled, resolution]);

  useEffect(() => {
    volumeRef.current?.applyOptions({ visible: volumeVisible });
  }, [volumeVisible]);

  useEffect(() => {
    markerRef.current?.setMarkers(orderMarkers(orders, symbol, bars, resolution));
  }, [orders, symbol, bars, resolution]);

  useEffect(() => {
    if (!active || !symbol) return undefined;
    const controller = new AbortController();
    let mounted = true;
    let timeout = null;
    let removeBarListener = null;
    barsRef.current = []; latestRealtimeRef.current = null;
    setLoading(true); setError(""); setEmpty(false); setBars([]);
    candleRef.current?.setData([]); volumeRef.current?.setData([]); markerRef.current?.setMarkers([]);
    timeout = setTimeout(() => controller.abort(new DOMException("Historical data request timed out.", "TimeoutError")), 15000);
    fetchHistoricalBars(symbol, resolution, { signal: controller.signal, limit: 300 })
      .then((history) => {
        if (!mounted) return;
        barsRef.current = history; setBars(history);
        if (!history.length) { setEmpty(true); return; }
        candleRef.current?.setData(chartData(history, resolution));
        volumeRef.current?.setData(history.map((bar) => ({ time: toLightweightTime(bar.time, resolution), value: bar.volume, color: bar.close >= bar.open ? "#22c55e66" : "#f43f5e66" })));
        chartRef.current?.timeScale().fitContent();
        let currentBar = history.at(-1);
        let lastSourceTime = currentBar?.time ?? -Infinity;
        const lastSourceBar = currentBar ? { ...currentBar } : null;
        removeBarListener = marketDataStream.subscribe(symbol, (minuteBar) => {
          if (!mounted) return;
          const next = aggregateMinuteBar(currentBar, minuteBar, resolution, lastSourceTime, latestRealtimeRef.current || lastSourceBar);
          if (!next || lightweightTimeKey(toLightweightTime(next.bar.time, resolution)) < lightweightTimeKey(toLightweightTime(currentBar.time, resolution))) return;
          currentBar = next.bar; lastSourceTime = next.lastSourceTime; latestRealtimeRef.current = next.lastSourceBar;
          candleRef.current?.update({ ...next.bar, time: toLightweightTime(next.bar.time, resolution) });
          volumeRef.current?.update({ time: toLightweightTime(next.bar.time, resolution), value: next.bar.volume, color: next.bar.close >= next.bar.open ? "#22c55e66" : "#f43f5e66" });
          const prior = barsRef.current;
          const last = prior.at(-1);
          barsRef.current = last?.time === next.bar.time ? [...prior.slice(0, -1), next.bar] : [...prior, next.bar].slice(-500);
          updateIndicatorsRef.current(barsRef.current);
        });
      })
      .catch((requestError) => { if (mounted && requestError.name !== "AbortError") setError(requestError.message || "Historical market data is unavailable."); })
      .finally(() => { clearTimeout(timeout); if (mounted) setLoading(false); });
    return () => { mounted = false; clearTimeout(timeout); controller.abort(); removeBarListener?.(); };
  }, [symbol, resolution, active]);

  useEffect(() => {
    if (!bars.length) return;
    updateIndicatorData(barsRef.current);
  }, [bars, updateIndicatorData]);

  const toggleIndicator = (key) => setEnabled((current) => ({ ...current, [key]: !current[key] }));
  const fit = () => chartRef.current?.timeScale().fitContent();
  const fullscreen = async () => {
    if (!hostRef.current) return;
    try { if (!document.fullscreenElement) await hostRef.current.parentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { /* Fullscreen can be unavailable in embedded browsers. */ }
  };
  const activeIndicators = useMemo(() => INDICATORS.filter(([key]) => enabled[key]).map(([, label]) => label), [enabled]);

  return <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1420]" aria-labelledby="chart-panel-title">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3"><div><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Market chart</p><h2 id="chart-panel-title" className="text-base font-semibold">{symbol} · Candles</h2></div><div className="flex flex-wrap items-center gap-2">
      <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-[#080d16] p-1" aria-label="Chart timeframe">{TIMEFRAMES.map((item) => <button key={item.resolution} type="button" aria-pressed={resolution === item.resolution} onClick={() => setResolution(item.resolution)} className={`min-h-9 shrink-0 rounded-md px-2.5 text-xs font-semibold ${resolution === item.resolution ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>{item.label}</button>)}</div>
      <button type="button" onClick={() => setVolumeVisible((value) => !value)} aria-pressed={volumeVisible} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-800 px-2.5 text-xs text-slate-300"><BarChart3 size={14} /> Volume</button>
      <div className="relative"><button type="button" onClick={() => setIndicatorMenuOpen((open) => !open)} aria-expanded={indicatorMenuOpen} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-800 px-2.5 text-xs text-slate-300">Indicators <ChevronDown size={13} /></button>{indicatorMenuOpen && <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-slate-700 bg-[#111a28] p-2 shadow-xl">{INDICATORS.map(([key, label, color]) => <label key={key} className="flex min-h-9 cursor-pointer items-center gap-2 px-2 text-xs text-slate-200"><input type="checkbox" checked={Boolean(enabled[key])} onChange={() => toggleIndicator(key)} /><span style={{ color }}>{label}</span></label>)}</div>}</div>
      <button type="button" onClick={fit} aria-label="Fit chart" title="Fit chart" className="grid size-9 place-items-center rounded-lg border border-slate-800 text-slate-300"><RotateCcw size={14} /></button><button type="button" onClick={fullscreen} aria-label="Toggle fullscreen chart" title="Fullscreen" className="grid size-9 place-items-center rounded-lg border border-slate-800 text-slate-300"><Expand size={14} /></button>
    </div></div>
    <div className="flex flex-wrap gap-2 px-4 pt-3">{activeIndicators.map((label) => <span key={label} className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] text-slate-400">{label}</span>)}</div>
    <div className="relative h-[340px] w-full sm:h-[420px]" aria-label={`${symbol} ${TIMEFRAMES.find((item) => item.resolution === resolution)?.label} candlestick chart`}>
      <div ref={hostRef} className="absolute inset-0" />
      {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-[#0d1420]/75 text-sm text-slate-300" role="status">Loading {symbol} history…</div>}
      {!loading && error && <div className="absolute inset-0 z-10 grid place-items-center bg-[#0d1420]/85 p-5 text-center"><div><p className="font-semibold text-slate-200">{error}</p><p className="mt-2 text-xs text-slate-500">Check the symbol or market-data connection, then choose another timeframe.</p></div></div>}
      {!loading && !error && empty && <div className="absolute inset-0 z-10 grid place-items-center text-sm text-slate-500">No candles are available for {symbol} at this timeframe.</div>}
    </div>
    <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2 text-[10px] text-slate-600"><span>Alpaca market data · {bars.length} historical candles</span><span>Indicators: calculated from chart bars</span></div>
  </section>;
}

StockChart.propTypes = { symbol: PropTypes.string.isRequired, active: PropTypes.bool, orders: PropTypes.arrayOf(PropTypes.object) };
