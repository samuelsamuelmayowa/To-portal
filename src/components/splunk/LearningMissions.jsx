/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { BookOpenCheck, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { splunkLabApi } from "../../services/splunkLabApi";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

const control = "w-full rounded-xl border border-white/10 bg-[#080f22] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/70";

export default function LearningMissions({ dashboards = [], onProgress }) {
  const [missions, setMissions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [dashboardId, setDashboardId] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = missions.find((mission) => mission.id === selectedId) || missions[0];

  useEffect(() => {
    let active = true;
    splunkLabApi.listMissions().then((items) => {
      if (!active) return;
      setMissions(items);
      const first = items[0];
      if (first) { setSelectedId(first.id); setQuery(first.starterSPL); }
    }).catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Sign in to load your missions."); });
    return () => { active = false; };
  }, []);

  const selectMission = (mission) => { setSelectedId(mission.id); setQuery(mission.starterSPL); setResult(null); setError(""); };
  const submit = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const response = await splunkLabApi.submitMission(selected.id, selected.id === "dashboard-builder" ? { dashboardId } : { query, timeRange: "all" });
      setResult(response);
      const refreshed = await splunkLabApi.listMissions();
      setMissions(refreshed);
      onProgress?.(refreshed.map((item) => item.progress).filter(Boolean));
    } catch (requestError) { setError(requestError.response?.data?.message || "Mission could not be submitted."); }
    finally { setBusy(false); }
  };

  return <div className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
    <GlassCard className="space-y-2 p-5">{missions.map((mission) => <button key={mission.id} type="button" onClick={() => selectMission(mission)} className={`w-full rounded-xl border p-4 text-left ${selected?.id === mission.id ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/10 bg-white/[0.03]"}`}><div className="flex items-center justify-between gap-2"><span className="text-xs uppercase tracking-wide text-cyan-200">{mission.level}</span>{mission.progress?.completed && <CheckCircle2 size={16} className="text-emerald-300"/>}</div><h3 className="mt-2 font-semibold text-white">{mission.title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{mission.scenario}</p>{mission.progress && <p className="mt-2 text-xs text-slate-500">Best score {mission.progress.bestScore}% · {mission.progress.attempts?.length || 0} attempts</p>}</button>)}</GlassCard>
    <GlassCard className="p-5 sm:p-6">{selected ? <><div className="mb-5"><h2 className="flex items-center gap-2 text-xl font-semibold"><BookOpenCheck size={19} className="text-cyan-300"/>{selected.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">{selected.scenario}</p></div><h3 className="text-sm font-semibold text-cyan-100">Instructions and learning objectives</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">{selected.objectives?.map((objective) => <li key={objective}>{objective}</li>)}</ul><p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300"><b>Expected outcome:</b> {selected.expectedOutcome}</p>
      {selected.id === "dashboard-builder" ? <label className="mt-4 block"><span className="mb-1 block text-xs text-slate-400">Dashboard to submit</span><select className={control} value={dashboardId} onChange={(event) => setDashboardId(event.target.value)}><option value="">Choose a saved dashboard</option>{dashboards.map((dashboard) => <option key={dashboard.id} value={dashboard.id}>{dashboard.name}</option>)}</select><p className="mt-2 text-xs text-slate-500">Create a dashboard with a chart panel in the Dashboards tab first.</p></label> : <label className="mt-4 block"><span className="mb-1 block text-xs text-slate-400">SPL workspace · All Time</span><textarea className={`${control} min-h-32 font-mono`} value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false}/></label>}
      <div className="mt-4 flex gap-2"><PrimaryButton disabled={busy || (selected.id === "dashboard-builder" && !dashboardId)} onClick={submit}><Play size={15} className="mr-1 inline"/>{busy ? "Checking results…" : "Submit mission"}</PrimaryButton><SoftButton onClick={() => { setQuery(selected.starterSPL); setResult(null); setError(""); }}><RotateCcw size={15} className="mr-1 inline"/>Reset</SoftButton></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
      {result && <div role="status" className={`mt-4 rounded-xl border p-4 ${result.passed ? "border-emerald-400/30 bg-emerald-500/10" : "border-amber-400/30 bg-amber-500/10"}`}><p className="font-semibold">{result.passed ? "Mission complete · 100%" : `Keep investigating · ${result.score}%`}</p><p className="mt-1 text-sm text-slate-200">{result.feedback}</p>{result.result?.rows?.length > 0 && <div className="mt-3 overflow-auto"><table className="w-full text-left text-xs"><thead><tr>{Object.keys(result.result.rows[0]).map((key) => <th key={key} className="border-b border-white/10 px-2 py-2 text-cyan-200">{key}</th>)}</tr></thead><tbody>{result.result.rows.slice(0, 10).map((row, index) => <tr key={index}>{Object.keys(result.result.rows[0]).map((key) => <td key={key} className="border-b border-white/5 px-2 py-2 text-slate-300">{String(row[key] ?? "")}</td>)}</tr>)}</tbody></table></div>}</div>}
    </> : <p className="text-sm text-slate-400">Loading missions…</p>}</GlassCard></div>;
}
