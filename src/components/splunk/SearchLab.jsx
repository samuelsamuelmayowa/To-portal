import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Command, Database, GraduationCap, Lightbulb, Play,
  Save, Search, Sparkles, Terminal, XCircle,
} from "lucide-react";
import { getLabLogs } from "../../data/splAdminState";
import { LOOKUP_CATALOG } from "../../data/splLookups";
import { SPL_COMMANDS, SPL_LESSONS } from "../../data/splLessons";
import { runSPL } from "../../utils/splEngine";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";
import { PrettyTable } from "./Viz";
import ChartSelector from "./charts/ChartSelector";
import ChartRenderer from "./charts/ChartRenderer";
import recommendChart from "./charts/chartRegistry";

const PROGRESS_KEY = "to_splunk_lesson_progress_v2";
const inputClass = "w-full rounded-xl border border-white/10 bg-[#080f22] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/70";
const initialIndex = "training_web";
const initialQuery = `index=${initialIndex}`;
const EXAMPLES = [
  { label: "Find 404 errors", query: "index=training_web status=404 | table _time endpoint status" },
  { label: "Average latency", query: "index=training_web | stats avg(response_time) as avg_ms by endpoint | sort -avg_ms" },
  { label: "HTTP statuses", query: "index=training_web | stats count by status | sort -count" },
  { label: "Traffic trends", query: "index=training_web | timechart span=1h count" },
  { label: "Login failures", query: "index=training_security action=failure | stats count by user | sort -count" },
  { label: "Application errors", query: "index=training_apps level=ERROR | stats count by service" },
  { label: "Revenue by product", query: "index=training_sales payment_status=paid | stats sum(revenue) as revenue by product | sort -revenue" },
  { label: "Extract severity (rex)", query: 'index=training_apps | rex field=_raw "(?<severity>ERROR|WARN|INFO)" | stats count by severity' },
  { label: "Enrich login audits", query: "index=training_security | lookup user_directory.csv user OUTPUT department role | stats count by department" },
  { label: "Connect sessions", query: "index=training_sessions | transaction session_id maxspan=30m | table session_id user eventcount duration" },
];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Investigations"];
function safelyLoadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]"); }
  catch { return []; }
}
const classNames = (...parts) => parts.filter(Boolean).join(" ");
function getChartKeys(rows, mode) {
  if (!rows.length) return null;
  const keys = Object.keys(rows[0]);
  const xKey = mode === "timechart" ? "_time" : keys.find((x) => x !== "count" && x !== "percent") || keys[0];
  const yKey = keys.find((k) => k !== xKey && rows.some((r) => typeof r[k] === "number" && Number.isFinite(r[k])));
  return xKey && yKey ? { xKey, yKey } : null;
}

export default function SearchLab({ onSaveSearch }) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [resultTab, setResultTab] = useState("events");
  const [activeView, setActiveView] = useState("lessons");
  const [level, setLevel] = useState("Beginner");
  const [lessonId, setLessonId] = useState(SPL_LESSONS[0].id);
  const [lessonMessage, setLessonMessage] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [lookupChoice, setLookupChoice] = useState("user_directory.csv");
  const [completed, setCompleted] = useState(safelyLoadProgress);
  const [chartType, setChartType] = useState("bar");

  const labLogs = getLabLogs();
  const availableIndexes = Object.keys(labLogs);
  const isLookupSearch = /^\|?\s*inputlookup\s+/i.test(query);
  const currentIndex = (query.match(/\bindex=([\w-]+)/i) || [])[1] || (isLookupSearch ? "" : initialIndex);
  const currentLesson = SPL_LESSONS.find((l) => l.id === lessonId) || SPL_LESSONS[0];
  const visibleLessons = SPL_LESSONS.filter((l) => l.level === level);
  const completionRate = Math.round(completed.length / SPL_LESSONS.length * 100);
  const rows = result?.results || [];
  const chartKeys = useMemo(() => getChartKeys(rows, result?.mode), [rows, result?.mode]);
  const selectedLookup = LOOKUP_CATALOG.find((x) => x.name === lookupChoice) || LOOKUP_CATALOG[0];
  const filteredCommands = useMemo(() => SPL_COMMANDS.filter((c) =>
    `${c.name} ${c.description} ${c.category}`.toLowerCase().includes(commandQuery.toLowerCase()),
  ), [commandQuery]);

  useEffect(() => {
    const handoff = sessionStorage.getItem("to_splunk_run_once");
    if (handoff) { setQuery(handoff); sessionStorage.removeItem("to_splunk_run_once"); }
  }, []);
  useEffect(() => { localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed)); }, [completed]);
  useEffect(() => {
    if (result) setChartType(recommendChart(result) || "bar");
  }, [result]);

  const loadQuery = (next) => {
    setQuery(next); setError(""); setResult(null); setLessonMessage(null);
  };
  const selectDataset = (index) => {
    loadQuery(query.match(/\bindex=[\w-]+/i) ? query.replace(/\bindex=[\w-]+/i, `index=${index}`) : `index=${index}`);
  };
  const startLesson = (lesson) => {
    setLessonId(lesson.id); setLevel(lesson.level);
    setShowHint(false); loadQuery(lesson.starter);
  };
  const runSearch = () => {
    const out = runSPL(query, labLogs);
    if (out.error) { setError(out.error); setResult(null); setLessonMessage(null); return; }
    setResult(out); setError("");
    setResultTab(out.mode === "timechart" ? "chart" : out.mode === "table" ? "table" : "events");
    let succeeded = false;
    try { succeeded = Boolean(currentLesson.check(query, out)); }
    catch { succeeded = false; }
    setLessonMessage(succeeded ? "Nice work! This exercise is complete." : "Search ran successfully. Use the exercise goal to complete this challenge.");
    if (succeeded) setCompleted((previous) => previous.includes(currentLesson.id) ? previous : [...previous, currentLesson.id]);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[335px_minmax(0,1fr)] xl:gap-6">
      <aside className="min-w-0 space-y-4">
        <GlassCard className="overflow-hidden p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-white"><GraduationCap size={19} className="text-cyan-300" /> Learning Center</div>
            <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200">{completed.length}/{SPL_LESSONS.length}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400"><span>Learning progress</span><span>{completionRate}%</span></div>
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${completionRate}%` }} /></div>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {[{ id: "lessons", label: "Guided Labs" }, { id: "commands", label: "Commands" }, { id: "lookups", label: "Lookup Tables" }].map((item) => (
              <button key={item.id} type="button" onClick={() => setActiveView(item.id)} className={classNames("rounded-xl border px-3 py-2 text-sm transition", activeView === item.id ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>{item.label}</button>
            ))}
          </div>
          {activeView === "lessons" ? (
            <>
              <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1">
                {LEVELS.map((x) => <button key={x} type="button" onClick={() => setLevel(x)} className={classNames("rounded-lg px-1 py-2 text-[11px] transition", level === x ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white")}>{x}</button>)}
              </div>
              <div className="max-h-[365px] space-y-2 overflow-y-auto pr-1">
                {visibleLessons.map((lesson) => (
                  <button key={lesson.id} type="button" onClick={() => startLesson(lesson)} className={classNames("flex w-full items-start gap-2 rounded-xl border p-3 text-left transition", lessonId === lesson.id ? "border-cyan-400/45 bg-cyan-500/10" : "border-white/10 bg-white/[0.035] hover:bg-white/10")}>
                    {completed.includes(lesson.id) ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400" /> : <ChevronRight size={17} className="mt-0.5 shrink-0 text-slate-500" />}
                    <div><p className="text-sm font-medium text-white">{lesson.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-400">{lesson.goal}</p></div>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Current challenge</p>
                <p className="mt-2 text-sm font-semibold text-white">{currentLesson.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{currentLesson.help}</p>
                <button type="button" className="mt-3 flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-100" onClick={() => setShowHint((x) => !x)}><Lightbulb size={14} /> {showHint ? "Hide hint" : "Show hint"} <ChevronDown size={13} /></button>
                {showHint && <p className="mt-2 rounded-lg bg-cyan-400/10 p-2 text-xs text-cyan-100">{currentLesson.hint}</p>}
                {lessonMessage && <p aria-live="polite" className={classNames("mt-3 text-xs", lessonMessage.startsWith("Nice") ? "text-emerald-300" : "text-amber-300")}>{lessonMessage}</p>}
              </div>
            </>
          ) : activeView === "commands" ? (
            <>
              <div className="relative mb-3"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input aria-label="Search command library" className={classNames(inputClass, "pl-9")} value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} placeholder="Find stats, eval, where..." /></div>
              <div className="max-h-[510px] space-y-2 overflow-y-auto pr-1">
                {filteredCommands.length === 0 && <p className="text-xs text-slate-400">No matching commands in this simulator.</p>}
                {filteredCommands.map((cmd) => <div key={cmd.name} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-2"><code className="text-sm font-semibold text-cyan-200">{cmd.name}</code><span className="text-[10px] text-slate-500">{cmd.category}</span></div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{cmd.description}</p>
                  <button type="button" className="mt-2 rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/20" onClick={() => loadQuery(cmd.syntax)}>Try example <ChevronRight size={12} className="inline" /></button>
                </div>)}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-slate-400">Explore preloaded educational CSV-style tables. Lookup files are simulated, not read from your device or a server.</p>
              <label className="block"><span className="mb-1 block text-xs text-slate-400">Choose reference table</span><select className={inputClass} value={lookupChoice} onChange={(e) => setLookupChoice(e.target.value)}>{LOOKUP_CATALOG.map((x) => <option value={x.name} key={x.name}>{x.name}</option>)}</select></label>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><div className="flex items-center justify-between"><b className="text-sm text-white">{selectedLookup.name}</b><span className="text-xs text-slate-400">{selectedLookup.count} rows</span></div><p className="mt-2 text-xs text-slate-400">Fields: {selectedLookup.fields.join(", ")}</p><div className="mt-3 max-w-full overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr>{selectedLookup.fields.slice(0, 3).map((f) => <th key={f} className="border-b border-white/10 px-2 py-2 text-cyan-200">{f}</th>)}</tr></thead><tbody>{selectedLookup.rows.slice(0, 4).map((r, i) => <tr key={i}>{selectedLookup.fields.slice(0, 3).map((f) => <td key={f} className="border-b border-white/5 px-2 py-2 text-slate-300">{String(r[f])}</td>)}</tr>)}</tbody></table></div></div>
              <button type="button" className="w-full rounded-xl bg-cyan-600/20 p-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-600/30" onClick={() => loadQuery(`| inputlookup ${selectedLookup.name}`)}>Load table in search console</button>
            </div>
          )}
        </GlassCard>
        <GlassCard className="p-4"><p className="flex items-center gap-2 text-sm font-semibold text-slate-100"><CircleHelp size={16} className="text-cyan-300" /> Training environment</p><p className="mt-1.5 text-xs leading-relaxed text-slate-400">These are simulated events, not live Splunk logs. Commands run locally. Open the Dictionary for additional terminology and examples.</p></GlassCard>
      </aside>

      <main className="min-w-0 space-y-5">
        <GlassCard className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><div className="flex items-center gap-2 text-base font-semibold text-white"><Terminal size={18} className="text-cyan-300" /> SPL Search Console</div><div className="mt-1 text-xs text-slate-400">Build a query, run it, and inspect each command's output.</div></div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-300">Local simulation</span>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-400"><Database size={14} /> Data index</span>
              <select className={inputClass} value={availableIndexes.includes(currentIndex) ? currentIndex : ""} onChange={(e) => selectDataset(e.target.value)}>
                {!availableIndexes.includes(currentIndex) && <option value="">{isLookupSearch ? "CSV lookup (no index)" : "Choose an index"}</option>}
                {availableIndexes.map((id) => <option key={id} value={id}>{id} ({labLogs[id].length.toLocaleString()} events)</option>)}
              </select>
            </label>
            <span className="pb-2 text-xs text-slate-400">All training data is synthetic.</span>
          </div>
          <label htmlFor="spl-search-editor" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Search Processing Language (SPL)</label>
          <textarea id="spl-search-editor" rows={3} spellCheck={false} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runSearch(); } }} className={classNames(inputClass, "min-h-[94px] resize-y font-mono text-[13px] leading-relaxed text-cyan-100")} placeholder="index=training_web | stats count by status" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><Command size={14} /> Ctrl + Enter to run</span>
            <div className="flex gap-2"><SoftButton onClick={() => onSaveSearch?.(query)} title="Add this query to Saved Searches"><Save size={15} className="mr-1 inline" /> Save</SoftButton><PrimaryButton onClick={runSearch}><Play size={15} className="mr-1 inline" /> Run Search</PrimaryButton></div>
          </div>
          {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200"><XCircle size={18} className="shrink-0" /> {error}</div>}
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-sm font-semibold text-white"><Sparkles size={16} className="text-cyan-300" /> Ready-to-try searches</p><p className="text-xs text-slate-500">Click to load, then select Run</p></div>
          <div className="flex flex-wrap gap-2">{EXAMPLES.map((ex) => <button type="button" key={ex.label} onClick={() => loadQuery(ex.query)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10">{ex.label}</button>)}</div>
        </GlassCard>

        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div><p className="text-base font-semibold text-white">Search Results</p><p className="mt-1 text-xs text-slate-400">{result ? `Index: ${result.index} · ${result.count.toLocaleString()} matched events · ${result.totalRows.toLocaleString()} result rows · ${result.elapsedMs} ms` : "Run a query to inspect events and reports."}</p></div>
            <div className="flex flex-wrap gap-1.5">{["events", "table", "chart"].map((item) => <button type="button" key={item} onClick={() => setResultTab(item)} className={classNames("rounded-lg border px-3 py-1.5 text-xs capitalize transition", resultTab === item ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300")}>{item}</button>)}</div>
          </div>
          {!result ? <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-slate-400"><Search size={24} className="text-slate-500" /><p className="text-sm">Your data will appear here when you run a search.</p></div> : rows.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">No matching rows. Try broadening your search or checking the index.</p> : (
            <div className="pt-4">
              {resultTab === "chart" && chartKeys ? <><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-400">Recommended visualization: <b className="text-cyan-200">{recommendChart(result)}</b></p><ChartSelector value={chartType} onChange={setChartType} /></div><ChartRenderer type={chartType} rows={rows} xKey={chartKeys.xKey} yKey={chartKeys.yKey} res={result} /></> : resultTab === "chart" ? <div className="py-12 text-center text-sm text-slate-400">Create an aggregation using stats or timechart to visualize numeric results.</div> : <div className="overflow-x-auto"><PrettyTable rows={rows} maxRows={100} /></div>}
              {result.truncated && <p className="mt-2 text-xs text-amber-200">Preview limited to 500 rows. Matched row count is shown above.</p>}
            </div>
          )}
        </GlassCard>

        {result && <GlassCard className="p-4 sm:p-5"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><BookOpen size={17} className="text-cyan-300" /> How Splunk processed this search</div><p className="mb-3 text-xs text-slate-400">Read the pipeline from top to bottom. Each command transforms the rows from the previous step.</p><div className="space-y-2">{result.trace.map((step, i) => <div key={`${step.command}-${i}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-semibold text-cyan-200">{i + 1}</span><div className="min-w-0 flex-1"><code className="break-all text-xs text-cyan-200">{step.command}</code><p className="mt-1 text-xs leading-relaxed text-slate-400">{step.explanation}</p></div><span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-slate-300">{step.outputRows} rows</span></div>)}</div></GlassCard>}
      </main>
    </div>
  );
}
