import React, { useMemo, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Database, FileCode2, Play, RotateCcw, Settings2, ShieldCheck } from "lucide-react";
import { GlassCard } from "./Glass";
import { runSPL } from "../../utils/splEngine";
import {
  addAdminIndex, addAdminInput, adminConfPreview, adminProgress,
  assignAdminRole, getAdminState, getLabLogs, saveAdminState, updateAdminRetention,
} from "../../data/splAdminState";

const inputStyle = "w-full rounded-xl border border-white/15 bg-[#070e20] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400";
const buttonStyle = "rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-40";
const labelStyle = "block mb-1 text-xs text-slate-400";

export default function AdminLab({ onOpenLab }) {
  const [state, setState] = useState(getAdminState);
  const [section, setSection] = useState("indexes");
  const [message, setMessage] = useState(null);
  const [newIndex, setNewIndex] = useState("training_ops");
  const [retentionDays, setRetentionDays] = useState("180");
  const [retentionIndex, setRetentionIndex] = useState("");
  const [inputIndex, setInputIndex] = useState("");
  const [source, setSource] = useState("/var/log/training/app.log");
  const [sourcetype, setSourcetype] = useState("training_app");
  const [host, setHost] = useState("lab-host-01");
  const [role, setRole] = useState("analyst");
  const [roleIndex, setRoleIndex] = useState("");
  const [previewTab, setPreviewTab] = useState("indexes.conf");
  const [healthResult, setHealthResult] = useState(null);
  const progress = adminProgress(state);
  const completed = progress.filter((x) => x.done).length;
  const previews = useMemo(() => adminConfPreview(state), [state]);
  const selectedInputIndex = state.indexes.some((x) => x.name === inputIndex) ? inputIndex : state.indexes[0]?.name || "";
  const selectedRetentionIndex = state.indexes.some((x) => x.name === retentionIndex) ? retentionIndex : state.indexes[0]?.name || "";
  const selectedRoleIndex = state.indexes.some((x) => x.name === roleIndex) ? roleIndex : state.indexes[0]?.name || "";
  const searchableIndex = state.inputs[0]?.index;
  const healthQuery = searchableIndex ? `index=${searchableIndex} | stats count by level` : "";
  const runHealth = () => {
    if (!healthQuery) return;
    const report = runSPL(healthQuery, getLabLogs());
    if (report.error) { setMessage({ ok: false, text: report.error }); return; }
    setHealthResult(report);
    commit(() => ({ ...state, healthCheckCompleted: true }), "Health check completed with simulated index events.");
  };
  const commit = (work, success) => {
    try { const updated = work(); saveAdminState(updated); setState(updated); setMessage({ ok: true, text: success }); }
    catch (err) { setMessage({ ok: false, text: err.message }); }
  };
  return <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
    <aside className="space-y-4">
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-white"><Settings2 className="text-cyan-300" size={20} /> Administration Lab</div>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">Practice index setup, inputs, retention, user access concepts, and troubleshooting in a safe local simulator.</p>
        <div className="mb-3 flex items-center justify-between text-xs text-slate-300"><span>Exercises completed</span><b>{completed}/{progress.length}</b></div>
        <div className="mb-4 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-400" style={{ width: `${100 * completed / progress.length}%` }} /></div>
        <div className="space-y-2">{progress.map((item) => <div key={item.id} className="flex items-start gap-2 text-sm text-slate-300">{item.done ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={16} /> : <span className="mt-1 h-3 w-3 shrink-0 rounded-full border border-slate-500" />}<span>{item.title}</span></div>)}</div>
      </GlassCard>
      <GlassCard className="p-5"><div className="flex gap-2 text-cyan-200"><ShieldCheck size={19} /><b>Simulation only</b></div><p className="mt-2 text-xs leading-relaxed text-slate-400">All configurations and events are examples. No actual file is monitored, no permissions are changed, and no real Splunk instance is connected. Browser data is not shared between devices.</p></GlassCard>
      <button type="button" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white" onClick={() => { if (window.confirm("Reset the simulated admin configuration on this browser?")) { const empty = { indexes: [], inputs: [], roles: [], healthCheckCompleted: false }; saveAdminState(empty); setState(empty); setHealthResult(null); setMessage(null); } }}><RotateCcw size={15} /> Reset admin sandbox</button>
    </aside>

    <section className="min-w-0 space-y-5">
      <GlassCard className="p-5">
        <div className="mb-5 flex flex-wrap gap-2">{[
          ["indexes", "Indexes & Retention", Database], ["inputs", "Data Onboarding", Play], ["access", "Access & Health", ShieldCheck], ["config", "Config Preview", FileCode2],
        ].map(([key, name, Icon]) => <button key={key} type="button" onClick={() => { setSection(key); setMessage(null); }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${section === key ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}><Icon size={15} />{name}</button>)}</div>
        {message && <div role="status" className={`mb-4 rounded-xl border p-3 text-sm ${message.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-amber-500/30 bg-amber-500/10 text-amber-200"}`}>{message.ok ? <CheckCircle2 size={15} className="mr-2 inline" /> : <AlertCircle size={15} className="mr-2 inline" />}{message.text}</div>}
        {section === "indexes" && <div className="space-y-5">
          <div><h3 className="text-lg font-semibold">Create a training index</h3><p className="mt-1 text-sm text-slate-400">An index is a searchable collection of event data. New indexes start empty until you configure an input.</p></div>
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end"><div><label htmlFor="admin-index" className={labelStyle}>Index name</label><input id="admin-index" className={inputStyle} value={newIndex} onChange={(e) => setNewIndex(e.target.value)} /></div><div><label htmlFor="admin-days" className={labelStyle}>Retention days</label><input id="admin-days" type="number" min="1" max="3650" className={inputStyle} value={retentionDays} onChange={(e) => setRetentionDays(e.target.value)} /></div><button type="button" className={buttonStyle} onClick={() => commit(() => addAdminIndex(state, { name: newIndex, retentionDays }), "Index created in the local sandbox. Add a simulated source in Data Onboarding.")}>Create index</button></div>
          {state.indexes.length > 0 && <div className="space-y-2">{state.indexes.map((x) => <div key={x.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm"><code className="text-cyan-200">{x.name}</code><span className="text-slate-400">{x.retentionDays} days</span></div>)}</div>}
          <div className="border-t border-white/10 pt-4"><h4 className="mb-3 text-sm font-semibold">Adjust retention policy</h4><div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end"><div><label className={labelStyle}>Index</label><select className={inputStyle} value={selectedRetentionIndex} onChange={(e) => setRetentionIndex(e.target.value)}>{state.indexes.length ? state.indexes.map((x) => <option key={x.name} value={x.name}>{x.name}</option>) : <option value="">Create an index first</option>}</select></div><div><label className={labelStyle}>Days</label><input aria-label="Retention days" className={inputStyle} type="number" min="1" max="3650" value={retentionDays} onChange={(e) => setRetentionDays(e.target.value)} /></div><button type="button" disabled={!selectedRetentionIndex} className={buttonStyle} onClick={() => commit(() => updateAdminRetention(state, selectedRetentionIndex, retentionDays), "Retention policy updated in the simulator.")}>Update</button></div></div>
        </div>}
        {section === "inputs" && <div className="space-y-4"><div><h3 className="text-lg font-semibold">Simulate a monitoring input</h3><p className="mt-1 text-sm text-slate-400">Configure a fictional log-file source, host, sourcetype and destination index. The simulator generates sample events for searching; it never accesses the path.</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelStyle}>Destination index</label><select className={inputStyle} value={selectedInputIndex} onChange={(e) => setInputIndex(e.target.value)}>{state.indexes.length ? state.indexes.map((x) => <option key={x.name} value={x.name}>{x.name}</option>) : <option value="">Create an index first</option>}</select></div><div><label className={labelStyle}>Sample log path</label><input className={inputStyle} value={source} onChange={(e) => setSource(e.target.value)} /></div><div><label className={labelStyle}>Sourcetype</label><input className={inputStyle} value={sourcetype} onChange={(e) => setSourcetype(e.target.value)} /></div><div><label className={labelStyle}>Host</label><input className={inputStyle} value={host} onChange={(e) => setHost(e.target.value)} /></div></div>
          <button className={buttonStyle} disabled={!selectedInputIndex} onClick={() => commit(() => addAdminInput(state, { index: selectedInputIndex, source, sourcetype, host }), "Sample input configured. Open Search & Reporting to inspect generated events.")}>Add simulated input</button>
          {state.inputs.map((x, i) => <div key={`${x.index}-${i}`} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-relaxed"><code className="text-cyan-200">{x.index}</code><p className="mt-1 text-slate-400">{x.source} · {x.sourcetype} · {x.host}</p></div>)}
        </div>}
        {section === "access" && <div className="space-y-5"><div><h3 className="text-lg font-semibold">Role access concepts</h3><p className="mt-1 text-sm text-slate-400">Practice associating a training role with an index. This does not enforce authorization in the browser or change real Splunk roles.</p></div><div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><div><label className={labelStyle}>Training role</label><select className={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}><option>student</option><option>analyst</option><option>reviewer</option></select></div><div><label className={labelStyle}>Index</label><select className={inputStyle} value={selectedRoleIndex} onChange={(e) => setRoleIndex(e.target.value)}>{state.indexes.length ? state.indexes.map((x) => <option key={x.name}>{x.name}</option>) : <option value="">No indexes</option>}</select></div><button disabled={!selectedRoleIndex} className={buttonStyle} onClick={() => commit(() => assignAdminRole(state, role, selectedRoleIndex), "Training role assignment saved locally.")}>Assign</button></div>
          {state.roles.length > 0 && <div className="space-y-1 rounded-xl border border-white/10 p-3">{state.roles.map((x) => <p key={`${x.role}:${x.index}`} className="text-xs text-slate-300"><span className="font-semibold text-cyan-200">{x.role}</span> → {x.index} <span className="text-slate-500">(training-only)</span></p>)}</div>}
          <div className="border-t border-white/10 pt-5"><h4 className="mb-1 font-semibold">Data health & investigation</h4><p className="mb-3 text-sm text-slate-400">Inspect the synthetic events created from your input. Search them by level, service, or host.</p><div className="flex flex-wrap gap-2"><button disabled={!searchableIndex} className={buttonStyle} onClick={runHealth}>Run health check</button><button disabled={!searchableIndex} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-cyan-200 hover:bg-white/5 disabled:opacity-40" onClick={() => onOpenLab?.(healthQuery)}>Open in Search Console</button></div>{healthResult && <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3"><p className="mb-2 text-xs text-cyan-200">Simulated event counts by level</p>{healthResult.results.map((x) => <p key={x.level} className="text-xs text-slate-300">{x.level}: {x.count} events</p>)}</div>}{!searchableIndex && <p className="mt-2 text-xs text-amber-200">Create an index and add a simulated monitor input first.</p>}</div>
        </div>}
        {section === "config" && <div><div className="mb-4 flex items-start gap-2"><BookOpen size={19} className="mt-1 shrink-0 text-cyan-300" /><div><h3 className="font-semibold">Configuration file examples</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">Educational snippets reflecting your form values. Do not deploy to a real Splunk instance without validating your environment, platform and deployment method.</p></div></div><div className="mb-3 flex flex-wrap gap-2">{Object.keys(previews).map((x) => <button type="button" key={x} className={`rounded-lg px-3 py-2 text-xs ${x === previewTab ? "bg-cyan-600 text-white" : "bg-white/10 text-slate-300"}`} onClick={() => setPreviewTab(x)}>{x}</button>)}</div><pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#080f22] p-4 font-mono text-xs leading-6 text-cyan-100">{previews[previewTab]}</pre></div>}
      </GlassCard>
    </section>
  </div>;
}
