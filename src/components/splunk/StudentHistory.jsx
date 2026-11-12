/* eslint-disable react/prop-types */
import { Clock3, Play, Trash2 } from "lucide-react";
import { GlassCard, SoftButton } from "./Glass";

export default function StudentHistory({ history = [], onClear, onRun }) {
  return <GlassCard className="p-5 sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><Clock3 size={18} className="text-cyan-300"/> Search History</h2><p className="mt-1 text-xs text-slate-400">Your last 100 searches are private to your signed-in account.</p></div><SoftButton disabled={!history.length} onClick={onClear}><Trash2 size={15} className="mr-1 inline"/> Clear History</SoftButton></div>
    {!history.length ? <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">No searches recorded yet.</p> : <div className="space-y-2">{history.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()} · {item.index || "No index"} · {item.timeRange || "all"}</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-cyan-100">{item.query}</pre>{item.error && <p className="mt-2 text-xs text-rose-200">{item.error}</p>}<p className="mt-2 text-xs text-slate-400">{item.status === "complete" ? `${(item.resultCount || 0).toLocaleString()} matched events · ${(item.resultRows || 0).toLocaleString()} result rows · ${item.elapsedMs || 0} ms` : "Search failed"}</p></div><SoftButton onClick={() => onRun?.(item.query)} title="Run this search"><Play size={15}/></SoftButton></div></article>)}</div>}
  </GlassCard>;
}
