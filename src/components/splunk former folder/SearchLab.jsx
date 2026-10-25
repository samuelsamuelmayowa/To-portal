import React, { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { LOGS } from "../../data/logs";
import { runSPL } from "../../utils/splEngine";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

import ChartSelector from "./charts/ChartSelector";
import ChartRenderer from "./charts/ChartRenderer";
import  recommendChart  from "./charts/chartRegistry";


// import ChartSelector from "@/components/splunk/charts/ChartSelector";
// import ChartRenderer from "@/components/splunk/charts/ChartRenderer";
// import { recommendChart } from "@/components/splunk/charts/chartRegistry";

import { MiniBarChart, PrettyTable } from "./Viz";

const SUGGESTIONS = [
  "index=_internal",
  "index=_internal ERROR",
  "index=_internal | stats count by sourcetype",
  "index=_internal | timechart span=15m count",
  "index=web_logs status=200 | stats count by url",
  "index=web_logs | top url limit=10",
  "index=_internal | timechart span=15m count",
];

const LABS = [
  {
    id: "lab-1",
    title: "Basic Search",
    goal: "Run a search on internal logs",
    hint: "Start with index=_internal",
    starter: "index=_internal",
    expected: (q, res) => q.includes("index=_internal") && res?.count > 0,
  },
  {
    id: "lab-2",
    title: "Build a Report (stats)",
    goal: "Create a report by sourcetype",
    hint: "Use: | stats count by sourcetype",
    starter: "index=_internal | stats count by sourcetype",
    expected: (q, res) => res?.mode === "table",
  },
  {
    id: "lab-3",
    title: "Visualize (timechart)",
    goal: "Create a time-based visualization",
    hint: "Use: | timechart span=15m count",
    starter: "index=_internal | timechart span=15m count",
    expected: (q, res) => res?.mode === "timechart",
  },
];

export default function SearchLab({ onSaveSearch }) {
  

  const [query, setQuery] = useState("index=_internal");
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("events");
  const [showHints, setShowHints] = useState(false);

  const recommendedChart = recommendChart(res);
const [chartType, setChartType] = useState(recommendedChart);
useEffect(() => {
  setChartType(recommendChart(res));
}, [res]);

  useEffect(() => {
  const runOnce = sessionStorage.getItem("to_splunk_run_once");
  if (runOnce) {
    setQuery(runOnce);
    sessionStorage.removeItem("to_splunk_run_once");
  }
}, []);
  const [activeLabId, setActiveLabId] = useState(LABS[0].id);
  const [labOk, setLabOk] = useState(null);

  const activeLab = useMemo(() => LABS.find((l) => l.id === activeLabId), [activeLabId]);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase();
    return SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const runSearch = () => {
    const out = runSPL(query, LOGS);
    if (out?.error) {
      setError(out.error);
      setRes(null);
      return;
    }
    setError("");
    setRes(out);

    const nextTab = out.mode === "timechart" ? "chart" : out.mode === "table" ? "table" : "events";
    setTab(nextTab);

    setLabOk(activeLab?.expected?.(query, out) ?? null);
  };

  const rows = res?.results || [];

  const chartConfig = useMemo(() => {
    if (!res || !rows[0]) return null;
    if (res.mode === "timechart") return { xKey: "_time", yKey: "count" };
    if (res.mode === "table") {
      const keys = Object.keys(rows[0]);
      return { xKey: keys[0], yKey: keys.includes("count") ? "count" : keys[1] };
    }
    return null;
  }, [res, rows]);

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-8">
      {/* LEFT: learning */}
      <GlassCard className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Learning Path</h3>
          <p className="text-xs text-gray-400 mt-1">
            Complete steps to master Search & Reporting basics.
          </p>
        </div>

        <div className="space-y-3">
          {LABS.map((lab) => (
            <button
              key={lab.id}
              onClick={() => {
                setActiveLabId(lab.id);
                setQuery(lab.starter);
                setLabOk(null);
              }}
              className={[
                "w-full text-left p-4 rounded-2xl border transition-all",
                activeLabId === lab.id
                  ? "bg-cyan-500/10 border-cyan-400/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
              ].join(" ")}
            >
              <div className="font-medium">{lab.title}</div>
              <div className="text-xs text-gray-400 mt-1">{lab.goal}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-black/20 border border-white/10">
          <div className="text-sm font-semibold">Current Step</div>
          <div className="text-xs text-gray-400 mt-1">{activeLab.goal}</div>
          <div className="text-xs text-cyan-200 mt-2">Hint: {activeLab.hint}</div>

          {labOk !== null && (
            <div
              className={[
                "mt-4 p-3 rounded-2xl border text-xs",
                labOk
                  ? "border-green-500/30 bg-green-500/10 text-green-200"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
              ].join(" ")}
            >
              {labOk ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Step completed
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} /> Try again (use the hint)
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* RIGHT: search + results */}
      <div className="space-y-6">
        <GlassCard className="p-5 relative">
          <div className="flex items-center gap-3">
            <Search className="text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowHints(true);
              }}
              onFocus={() => setShowHints(true)}
              onBlur={() => setTimeout(() => setShowHints(false), 150)}
              className="flex-1 bg-transparent outline-none font-mono text-sm text-cyan-100 placeholder:text-gray-500"
              placeholder="index=_internal | stats count by sourcetype"
            />
            <PrimaryButton onClick={runSearch}>Run</PrimaryButton>
            <SoftButton
              onClick={() => onSaveSearch?.(query)}
              title="Save this SPL (like Splunk saved search)"
            >
              Save
            </SoftButton>
          </div>

          {showHints && suggestions.length > 0 && (
            <div className="absolute left-5 right-5 top-[76px] bg-[#020617] border border-white/10 rounded-2xl overflow-hidden z-20">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery(s);
                    setShowHints(false);
                  }}
                  className="w-full text-left px-4 py-3 text-xs font-mono hover:bg-cyan-500/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm text-red-200">
              ❌ {error}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-sm font-semibold">Results</div>
              <div className="text-xs text-gray-400">
                {res
                  ? `Index: ${res.index} • Matched: ${res.count} • Mode: ${res.mode}`
                  : "Run a search to see results"}
              </div>
            </div>

            <div className="flex gap-2">
              {["events", "table", "chart"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "px-3 py-1.5 rounded-xl text-xs border transition",
                    tab === t
                      ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-200"
                      : "bg-white/5 border-white/10 hover:bg-white/10",
                  ].join(" ")}
                >
                  {t === "events" ? "Events" : t === "table" ? "Table" : "Chart"}
                </button>
              ))}
            </div>
          </div>

          {!res ? (
            <div className="text-sm text-gray-400">
              Tip: Use <span className="text-cyan-200 font-mono">stats</span> for reports and{" "}
              <span className="text-cyan-200 font-mono">timechart</span> for visualizations.
            </div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-400">No results</div>
          ) : tab === "chart" && chartConfig ? (
            // <MiniBarChart
            //   rows={rows.slice(0, 18).map((r) => ({
            //     ...r,
            //     _time: r._time ? new Date(r._time).toLocaleTimeString() : r[chartConfig.xKey],
            //   }))}
            //   xKey={chartConfig.xKey === "_time" ? "_time" : chartConfig.xKey}
            //   yKey={chartConfig.yKey}
            // />
            <>
  {/* Chart Controls */}
  <div className="mb-4">
    <div className="text-xs text-gray-400 mb-2">
      Recommended chart:
      <span className="text-cyan-300 ml-1">
        {recommendedChart}
      </span>
    </div>

    <ChartSelector
      value={chartType}
      onChange={setChartType}
    />
  </div>

  {/* Chart Renderer */}
  <ChartRenderer
    type={chartType}
    rows={rows}
    xKey={chartConfig.xKey}
    yKey={chartConfig.yKey}
    res={res}
  />

  <div className="mt-4 text-xs text-gray-500">
    💡 Same data, different visualization — this is how dashboards work.
  </div>
</>

          ) : (
            <PrettyTable rows={rows} />
          )}

          <div className="mt-4 text-xs text-gray-400">
            Quick examples:
            <div className="mt-2 grid md:grid-cols-2 gap-2">
              {[
                "index=_internal",
                "index=_internal ERROR",
                "index=_internal | stats count by sourcetype",
                "index=_internal | timechart span=15m count",
                "index=web_logs | top url limit=10",
                "index=web_logs | stats count by status",
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuery(ex)}
                  className="text-left px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-mono text-[11px] transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
