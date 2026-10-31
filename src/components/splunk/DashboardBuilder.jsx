import React, { useMemo, useState } from "react";
import { Copy, LayoutDashboard, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { getLabLogs } from "../../data/splAdminState";
import { chartKeys, evaluateStudioQuery, numberForPanel } from "../../utils/splStudioRuntime";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";
import { MiniBarChart, PrettyTable } from "./Viz";

const control = "w-full rounded-xl border border-white/10 bg-[#080f22] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/70";
const newId = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function PanelPreview({ panel, datasets }) {
  const output = useMemo(() => evaluateStudioQuery(panel.spl, datasets), [panel.spl, datasets]);
  if (output.error) return <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert">{output.error}</div>;
  const rows = output.results || [];
  if (panel.type === "number") {
    const number = numberForPanel(output);
    return <div className="rounded-xl border border-white/10 bg-white/5 p-5"><p className="text-xs text-slate-400">{number.label}</p><p className="mt-2 text-4xl font-bold text-cyan-200">{number.value.toLocaleString()}</p><p className="mt-2 text-xs text-slate-500">{output.count} matched events</p></div>;
  }
  if (panel.type === "chart") {
    const keys = chartKeys(output);
    return keys ? <MiniBarChart rows={rows.slice(0, 18)} {...keys} /> : <p className="text-sm text-amber-200">This search has no chartable numeric results. Try <code>stats count by status</code>.</p>;
  }
  return rows.length ? <PrettyTable rows={rows} maxRows={10} maxCols={8} /> : <p className="text-sm text-slate-400">No matching rows.</p>;
}

function DashboardPanels({ panels, datasets, onRemove }) {
  return <div className="grid gap-4 md:grid-cols-2">{panels.map((panel) => <section key={panel.id} className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
    <div className="mb-3 flex items-start justify-between gap-2"><div className="min-w-0"><h4 className="font-semibold text-white">{panel.title || "Panel"}</h4><p className="mt-1 break-all font-mono text-[11px] text-slate-500">{panel.spl}</p></div>{onRemove && <button type="button" title="Remove panel" aria-label={`Remove ${panel.title}`} onClick={() => onRemove(panel.id)} className="rounded-lg border border-white/10 p-2 hover:bg-white/10"><Trash2 size={15}/></button>}</div>
    <PanelPreview panel={panel} datasets={datasets}/>
  </section>)}</div>;
}

export default function DashboardBuilder({ saved = [], dashboards = [], onAddDashboard, onUpdateDashboard, onDeleteDashboard }) {
  const datasets = useMemo(() => getLabLogs(), []);
  const [name, setName] = useState("My First Dashboard");
  const [panels, setPanels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedSearch, setSelectedSearch] = useState(saved[0]?.id || "__custom__");
  const [customSPL, setCustomSPL] = useState("index=training_web | stats count by status");
  const [panelTitle, setPanelTitle] = useState("HTTP Status Codes");
  const [panelType, setPanelType] = useState("chart");
  const [notice, setNotice] = useState("");
  const [openedId, setOpenedId] = useState(null);
  const searchId = saved.some((s) => s.id === selectedSearch) ? selectedSearch : "__custom__";
  const chosen = saved.find((s) => s.id === searchId);
  const spl = chosen?.spl || customSPL;
  const opened = dashboards.find((d) => d.id === openedId);

  const addPanel = () => {
    if (!spl.trim()) return setNotice("Choose a saved search or enter your SPL query.");
    const result = evaluateStudioQuery(spl, datasets);
    if (result.error) return setNotice(`Panel query error: ${result.error}`);
    if (panels.length >= 16) return setNotice("Maximum 16 panels per training dashboard.");
    const title = panelTitle.trim().slice(0, 80) || "Untitled Panel";
    setPanels((previous) => [...previous, { id: newId(), title, type: panelType, spl: spl.trim(), sourceSearchId: chosen?.id || null }]);
    setNotice(`Added ${title}. Preview is ready.`);
  };
  const resetEditor = () => { setEditingId(null); setName("My First Dashboard"); setPanels([]); setNotice(""); };
  const saveDashboard = () => {
    if (!name.trim()) return setNotice("Enter a dashboard name.");
    if (!panels.length) return setNotice("Add at least one valid panel before saving.");
    const data = { name: name.trim().slice(0, 100), panels };
    if (editingId) onUpdateDashboard?.(editingId, data);
    else onAddDashboard(data);
    setNotice(`Dashboard ${editingId ? "updated" : "saved"}. Open it from Saved Dashboards below.`);
    setEditingId(null); setPanels([]); setName("My First Dashboard");
  };
  const editDashboard = (dash) => { setEditingId(dash.id); setName(dash.name); setPanels(Array.isArray(dash.panels) ? dash.panels.map((p) => ({ ...p, id: p.id || newId() })) : []); setNotice(`Editing ${dash.name}.`); };
  return <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
    <GlassCard className="p-5 sm:p-6">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold"><LayoutDashboard size={18} className="text-cyan-300" /> Dashboard Builder</h2>
      <p className="mb-5 text-xs leading-relaxed text-slate-400">Create panels from saved searches or your own SPL. Preview, save, reopen, edit, and reuse your dashboards.</p>
      <div className="space-y-4">
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Dashboard name</span><input className={control} value={name} maxLength={100} onChange={(e) => setName(e.target.value)}/></label>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold">Add a panel</h3>
          <label className="block"><span className="mb-1 block text-xs text-slate-400">From saved search</span><select className={control} value={searchId} onChange={(e) => setSelectedSearch(e.target.value)}><option value="__custom__">Write custom SPL</option>{saved.map((s) => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
          {!chosen ? <label className="block"><span className="mb-1 block text-xs text-slate-400">SPL query</span><textarea className={`${control} min-h-24 font-mono`} value={customSPL} onChange={(e) => setCustomSPL(e.target.value)} maxLength={4000}/></label> : <div className="break-all rounded-lg bg-white/5 p-2 font-mono text-xs text-slate-300">{chosen.spl}</div>}
          <label className="block"><span className="mb-1 block text-xs text-slate-400">Panel title</span><input className={control} value={panelTitle} maxLength={80} onChange={(e) => setPanelTitle(e.target.value)}/></label>
          <label className="block"><span className="mb-1 block text-xs text-slate-400">Panel type</span><select className={control} value={panelType} onChange={(e) => setPanelType(e.target.value)}><option value="table">Table</option><option value="chart">Bar chart</option><option value="number">Single value</option></select></label>
          <PrimaryButton onClick={addPanel} className="flex w-full items-center justify-center gap-2"><Plus size={16}/> Add Panel</PrimaryButton>
        </div>
        <div className="flex flex-wrap gap-2"><PrimaryButton onClick={saveDashboard} className="flex-1">{editingId ? "Update Dashboard" : "Save Dashboard"}</PrimaryButton><SoftButton onClick={resetEditor} title="New blank dashboard"><RotateCcw size={16}/></SoftButton></div>
        <p className="text-xs text-slate-500">Tip: <code>stats count by status</code> works well for charts.</p>
        {notice && <p role="status" className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">{notice}</p>}
      </div>
    </GlassCard>
    <div className="min-w-0 space-y-6">
      <GlassCard className="p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">Live Preview</h3><span className="text-xs text-slate-400">{panels.length} panels</span></div>{panels.length ? <DashboardPanels panels={panels} datasets={datasets} onRemove={(id) => setPanels((prev) => prev.filter((p) => p.id !== id))}/> : <p className="text-sm text-slate-400">Add a panel to see your dashboard.</p>}</GlassCard>
      <GlassCard className="p-5 sm:p-6"><h3 className="mb-4 text-lg font-semibold">Saved Dashboards <span className="text-sm font-normal text-slate-400">({dashboards.length})</span></h3>
        {!dashboards.length ? <p className="text-sm text-slate-400">No dashboards saved yet.</p> : <div className="space-y-3">{dashboards.map((d) => <div key={d.id} className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{d.name}</p><p className="text-xs text-slate-400">{Array.isArray(d.panels) ? d.panels.length : 0} panels</p></div><div className="flex flex-wrap gap-2"><SoftButton onClick={() => setOpenedId(openedId === d.id ? null : d.id)}>{openedId === d.id ? "Close" : "Open"}</SoftButton><SoftButton onClick={() => editDashboard(d)} title="Edit"><Pencil size={15}/></SoftButton><SoftButton onClick={() => { setEditingId(null); setName(`${d.name} (copy)`); setPanels((d.panels || []).map((p) => ({...p, id: newId()}))); setNotice("Copy loaded. Save to create a new dashboard."); }} title="Duplicate"><Copy size={15}/></SoftButton><SoftButton onClick={() => { if (window.confirm(`Delete dashboard '${d.name}'?`)) { onDeleteDashboard(d.id); if (openedId === d.id) setOpenedId(null); if (editingId === d.id) resetEditor(); } }} title="Delete"><Trash2 size={15}/></SoftButton></div></div>{opened?.id === d.id && <div className="mt-4 border-t border-white/10 pt-4"><DashboardPanels panels={Array.isArray(d.panels) ? d.panels : []} datasets={datasets}/></div>}</div>)}</div>}
      </GlassCard>
    </div>
  </div>;
}
