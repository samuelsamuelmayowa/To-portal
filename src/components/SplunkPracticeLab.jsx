import { useMemo, useState } from "react";
// import { internalLogs } from "./data/internalLogs";
import { internalLogs } from "../data/internalLogs";
// import Logs
import { LOGS } from "../data/logs";
import { runSPL } from "../utils/splEngine";
// import { runSPL } from "./utils/runSPL";
import { Search, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
// import { runSPL } from "../utils/runSPL";
// Autocomplete suggestions (extend anytime)
const SUGGESTIONS = [
  "index=_internal",
  "index=_internal ERROR",
  "index=_internal | stats count by sourcetype",
  "index=_internal | timechart span=15m count",
  "index=auth_logs status=FAILED",
  "index=auth_logs | stats count by user",
  "index=auth_logs | top src_ip limit=10",
  "index=web_logs status=500",
  "index=web_logs | stats count by url",
  "index=firewall_logs action=DENY",
  "index=firewall_logs | top dest_port limit=10",
];

// Guided labs (students remember because they “complete”)
const LABS = [
  {
    id: "lab-1",
    title: "Find Errors in _internal",
    goal: "Show only ERROR events from internal logs.",
    hint: "Try filtering: ERROR",
    expected: (q, res) =>
      q.includes("index=_internal") && q.toUpperCase().includes("ERROR") && res?.count > 0,
    starter: "index=_internal ERROR",
  },
  {
    id: "lab-2",
    title: "Count Events by Sourcetype",
    goal: "Return a table: count by sourcetype.",
    hint: "Use stats count by sourcetype",
    expected: (q, res) =>
      q.includes("stats count by sourcetype") && res?.mode === "table" && Array.isArray(res?.results),
    starter: "index=_internal | stats count by sourcetype",
  },
  {
    id: "lab-3",
    title: "Detect Failed Logins (SOC)",
    goal: "Find failed login attempts in auth_logs.",
    hint: "Filter status=FAILED",
    expected: (q, res) =>
      q.includes("index=auth_logs") && q.includes("status=FAILED") && res?.count > 0,
    starter: "index=auth_logs status=FAILED",
  },
  {
    id: "lab-4",
    title: "Top Attack Source IPs",
    goal: "Show top 10 src_ip in auth_logs.",
    hint: "Use: top src_ip limit=10",
    expected: (q, res) =>
      q.includes("top src_ip") && res?.mode === "table" && (res?.results?.[0]?.src_ip != null),
    starter: "index=auth_logs status=FAILED | top src_ip limit=10",
  },
  {
    id: "lab-5",
    title: "Timechart of Errors",
    goal: "Create a timechart count over time (15m).",
    hint: "timechart span=15m count",
    expected: (q, res) =>
      q.includes("timechart") && res?.mode === "timechart" && res?.results?.length > 0,
    starter: "index=_internal ERROR | timechart span=15m count",
  },
];

function MiniBarChart({ rows, xKey, yKey, height = 120 }) {
  const max = Math.max(...rows.map((r) => Number(r[yKey] || 0)), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {rows.map((r, i) => {
          const v = Number(r[yKey] || 0);
          const h = Math.round((v / max) * height);
          return (
            <div key={i} className="flex-1 min-w-[18px]">
              <div
                className="w-full rounded-md bg-cyan-600/80"
                style={{ height: h }}
                title={`${r[xKey]}: ${v}`}
              />
              <div className="mt-2 text-[10px] text-gray-400 truncate" title={String(r[xKey])}>
                {String(r[xKey])}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default function SplunkPracticeLab() {
    const [query, setQuery] = useState("index=_internal");
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("events"); // events | table | chart
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [activeLabId, setActiveLabId] = useState(LABS[0].id);
  const [labStatus, setLabStatus] = useState({ ok: false, msg: "" });

  const activeLab = useMemo(() => LABS.find((l) => l.id === activeLabId), [activeLabId]);

  const indexes = Object.keys(LOGS);

  const filteredSuggestions = useMemo(() => {
    const q = query.toLowerCase();
    return SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const runSearch = () => {
    const out = runSPL(query, LOGS);
    if (out?.error) {
      setError(out.error);
      setRes(null);
      setLabStatus({ ok: false, msg: "" });
      return;
    }

    setError("");
    setRes(out);

    // auto tab switch based on mode
    if (out.mode === "timechart") setActiveTab("chart");
    else if (out.mode === "table") setActiveTab("table");
    else setActiveTab("events");

    // lab check (optional)
    const ok = activeLab?.expected?.(query, out);
    setLabStatus(
      ok
        ? { ok: true, msg: "✅ Correct! You completed this lab." }
        : { ok: false, msg: "Not quite. Use the hint and try again." }
    );
  };

  const applySuggestion = (text) => {
    setQuery(text);
    setShowSuggestions(false);
  };

  const applyLabStarter = () => {
    setQuery(activeLab.starter);
    setShowSuggestions(false);
    setLabStatus({ ok: false, msg: "" });
  };

  const rows = res?.results || [];

  // For chart view:
  // - If timechart: x=_time y=count (or first numeric)
  // - If table/top: x=first field y=count if exists
  const chartConfig = useMemo(() => {
    if (!res) return null;

    if (res.mode === "timechart") {
      // Prefer count if present else first numeric column
      const keys = rows[0] ? Object.keys(rows[0]) : [];
      const yKey = keys.includes("count")
        ? "count"
        : keys.find((k) => k !== "_time" && typeof rows[0][k] === "number");
      return { xKey: "_time", yKey: yKey || "count" };
    }

    // table mode
    if (rows[0]) {
      const keys = Object.keys(rows[0]);
      const yKey = keys.includes("count") ? "count" : keys[1];
      const xKey = keys[0];
      return { xKey, yKey };
    }
    return null;
  }, [res, rows]);

  return (
    <div className="max-w-7xl mx-auto py-10 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🧪 Splunk Practice Lab Pro <Sparkles className="text-cyan-400" size={18} />
        </h1>
        <p className="text-gray-400 mt-1">
          Type SPL, search indexes, and practice like a real Splunk environment.
        </p>
        <div className="text-xs text-gray-400 mt-3">
          Available indexes:{" "}
          {indexes.map((idx) => (
            <span key={idx} className="text-cyan-300 mr-2">
              {idx}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Guided Labs */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 h-fit">
          <div className="font-semibold mb-2"> Guided Labs</div>

          <div className="space-y-2">
            {LABS.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setActiveLabId(l.id);
                  setLabStatus({ ok: false, msg: "" });
                }}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  activeLabId === l.id
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-gray-800 bg-black/10 hover:border-gray-700"
                }`}
              >
                <div className="text-sm font-semibold">{l.title}</div>
                <div className="text-xs text-gray-400 mt-1">{l.goal}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-black/20 border border-gray-800">
            <div className="text-sm font-semibold">Current Lab</div>
            <div className="text-xs text-gray-400 mt-1">{activeLab.goal}</div>
            <div className="text-xs text-cyan-300 mt-2">Hint: {activeLab.hint}</div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={applyLabStarter}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              >
                Insert Starter SPL
              </button>
              <button
                onClick={() => {
                  const ok = activeLab.expected?.(query, res);
                  setLabStatus(
                    ok
                      ? { ok: true, msg: "✅ Correct! You completed this lab." }
                      : { ok: false, msg: "Not quite. Use the hint and try again." }
                  );
                }}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition"
              >
                Check Answer
              </button>
            </div>

            {labStatus.msg && (
              <div
                className={`mt-3 text-xs p-2 rounded-lg border ${
                  labStatus.ok
                    ? "border-green-600 bg-green-600/10 text-green-200"
                    : "border-yellow-600 bg-yellow-600/10 text-yellow-200"
                }`}
              >
                {labStatus.ok ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> {labStatus.msg}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} /> {labStatus.msg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search + Results */}
        <div>
          {/* Search Bar */}
          <div className="relative bg-[#0f172a] border border-gray-800 p-4 rounded-2xl mb-4">
            <div className="flex items-center gap-3">
              <Search className="text-gray-400" size={18} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                className="flex-1 bg-transparent outline-none font-mono text-sm"
                placeholder='Try: index=_internal | stats count by sourcetype'
              />
              <button
                onClick={runSearch}
                className="bg-cyan-600 px-5 py-2 rounded-lg text-sm hover:bg-cyan-500 transition"
              >
                Search
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-4 right-4 mt-3 bg-[#0b1222] border border-gray-800 rounded-xl overflow-hidden z-20">
                {filteredSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applySuggestion(s)}
                    className="w-full text-left px-4 py-2 text-xs font-mono text-gray-200 hover:bg-cyan-600/20 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Errors */}
          {error && (
            <div className="mb-4 bg-red-600/20 border border-red-600 p-3 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            {["events", "table", "chart"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  activeTab === t
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-gray-800 bg-[#111827] hover:border-gray-700"
                }`}
              >
                {t === "events" ? "Events" : t === "table" ? "Table" : "Chart"}
              </button>
            ))}
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-400 mb-3">
            {res ? (
              <>
                Index: <span className="text-cyan-300">{res.index}</span> •
                Total matched: <span className="text-cyan-300">{res.count}</span> •
                Mode: <span className="text-cyan-300">{res.mode}</span>
              </>
            ) : (
              "Run a search to see results."
            )}
          </div>

          {/* Results panel */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4">
            {!res ? (
              <div className="text-sm text-gray-400">
                Try a lab on the left, or use autocomplete examples.
              </div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-gray-500">No results</div>
            ) : activeTab === "chart" && chartConfig ? (
              <>
                <div className="text-sm font-semibold mb-2">Visualization</div>
                <div className="text-xs text-gray-400 mb-3">
                  Chart: {chartConfig.yKey} by {chartConfig.xKey}
                </div>
                {/* Chart uses first 18 rows for readability */}
                <MiniBarChart
                  rows={rows.slice(0, 18).map((r) => ({
                    ...r,
                    _time: r._time
                      ? new Date(r._time).toLocaleTimeString()
                      : r[chartConfig.xKey],
                  }))}
                  xKey={chartConfig.xKey === "_time" ? "_time" : chartConfig.xKey}
                  yKey={chartConfig.yKey}
                />
              </>
            ) : (
              <>
                <div className="text-sm font-semibold mb-2">
                  {activeTab === "events" ? "Events" : "Table"}
                </div>

                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400">
                        {Object.keys(rows[0]).slice(0, 8).map((k) => (
                          <th key={k} className="pb-2 pr-4">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 50).map((row, i) => (
                        <tr key={i} className="border-t border-gray-800">
                          {Object.keys(rows[0]).slice(0, 8).map((k) => (
                            <td key={k} className="py-2 pr-4 text-gray-200">
                              {k === "_time"
                                ? new Date(row[k]).toLocaleString()
                                : String(row[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Showing first 50 rows for performance (Splunk style).
                </div>
              </>
            )}
          </div>

          {/* Student-friendly examples */}
          <div className="mt-4 text-xs text-gray-400">
            Try:
            <div className="mt-2 grid md:grid-cols-2 gap-2">
              {[
                "index=_internal ERROR",
                "index=_internal | stats count by sourcetype",
                "index=auth_logs status=FAILED | top src_ip limit=10",
                "index=web_logs status=500 | stats count by url",
                "index=_internal ERROR | timechart span=15m count",
                "index=firewall_logs action=DENY | top dest_port limit=10",
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => applySuggestion(ex)}
                  className="text-left px-3 py-2 rounded-xl bg-black/20 border border-gray-800 hover:border-gray-700 font-mono text-[11px] transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
//   const [query, setQuery] = useState("index=_internal");
//   const [results, setResults] = useState([]);
//   const [error, setError] = useState("");

//   const runSearch = () => {
//     const res = runSPL(query, LOGS);
//     if (res?.error) {
//       setError(res.error);
//       setResults([]);
//     } else {
//       setError("");
//       setResults(res);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto py-10 text-white">
//       <h1 className="text-3xl font-bold mb-2">🧪 Splunk Practice Lab</h1>
//       <p className="text-gray-400 mb-6">
//         Simulated live Splunk environment for learning SPL
//       </p>

//       {/* Search Bar */}
//       <div className="bg-[#0f172a] p-4 rounded-xl flex gap-3 mb-6">
//         <input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="flex-1 bg-transparent outline-none font-mono text-sm"
//         />
//         <button
//           onClick={runSearch}
//           className="bg-cyan-600 px-5 py-2 rounded-lg text-sm"
//         >
//           Search
//         </button>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="bg-red-600/20 border border-red-600 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Results */}
//       <div className="bg-[#1b1f2a] rounded-xl p-4">
//         <div className="text-sm text-gray-400 mb-2">
//           Showing {results.length} results
//         </div>

//         {results.length === 0 ? (
//           <p className="text-gray-500">No results</p>
//         ) : (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-gray-400 text-left">
//                 {Object.keys(results[0]).map((k) => (
//                   <th key={k} className="pb-2">{k}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((row, i) => (
//                 <tr key={i} className="border-t border-gray-700">
//                   {Object.values(row).map((v, j) => (
//                     <td key={j} className="py-2">{String(v)}</td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
}
