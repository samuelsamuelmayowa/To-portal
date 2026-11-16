/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Code2, Copy, LayoutDashboard, Plus, RefreshCw } from "lucide-react";
import { TRAINING_LOGS } from "../../data/splTrainingData";
import { splunkLabApi } from "../../services/splunkLabApi";
import { chartKeys, numberForPanel, evaluateStudioQuery } from "../../utils/splStudioRuntime";
import { dashboardIndex, dashboardSource, fitPosition, panelPosition, panelTypes, parseDashboardSource } from "../../utils/splDashboardDefinition";
import DashboardCanvas from "./DashboardCanvas";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";
import { MiniBarChart, PrettyTable } from "./Viz";

const control = "w-full rounded-lg border border-white/15 bg-[#100d18] px-3 py-2 text-sm outline-none focus:border-fuchsia-400";
const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const blankPanel = { title: "", type: "chart", spl: "" };
const templates = {
  "Web health": ["training_web", "status>=400", "status", "endpoint status"],
  "Sign-in monitoring": ["training_security", "action=failure", "user", "user clientip action"],
};

function PanelPreview({ panel, refreshKey }) {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    let active = true;
    const index = dashboardIndex(panel.spl);
    setPreview(null);
    if (Object.hasOwn(TRAINING_LOGS, index)) {
      setPreview({ result: evaluateStudioQuery(panel.spl, TRAINING_LOGS), sample: true });
    } else {
      splunkLabApi.search(panel.spl, { timeRange: "all", pageSize: 100 })
        .then((result) => { if (active) setPreview({ result: { ...result, results: result.rows } }); })
        .catch((error) => { if (active) setPreview({ error: error.response?.data?.message || "The panel search failed." }); });
    }
    return () => { active = false; };
  }, [panel.spl, refreshKey]);
  if (!preview) return <p className="text-sm text-slate-400">Running search…</p>;
  const { result, sample } = preview;
  const error = preview.error || result?.error;
  if (error) return <p role="alert" className="break-words text-sm text-rose-200">{error}</p>;
  const rows = result.results || [];
  let content = <p className="text-sm text-slate-400">No matching rows.</p>;
  if (panel.type === "number") {
    const number = numberForPanel(result);
    content = <><p className="text-xs text-slate-400">{number.label}</p><p className="text-4xl font-semibold tabular-nums text-fuchsia-100">{number.value.toLocaleString()}</p></>;
  } else if (panel.type === "chart" && rows.length) {
    const keys = chartKeys(result);
    content = keys ? <MiniBarChart rows={rows} {...keys}/> : <p className="text-sm text-amber-200">Use a search with numeric results, such as <code>stats count by status</code>.</p>;
  } else if (rows.length) {
    content = <PrettyTable rows={rows} maxRows={10} maxCols={8}/>;
  }
  return <div className="space-y-2">{sample && <p className="text-xs text-fuchsia-300">Browser sample data</p>}{content}</div>;
}

export default function DashboardBuilder({ saved = [], dashboards = [], onAddDashboard, onUpdateDashboard, onDeleteDashboard }) {
  const [name, setName] = useState("Untitled dashboard");
  const [layout, setLayout] = useState("grid");
  const [panels, setPanels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [panelId, setPanelId] = useState(null);
  const [panelDraft, setPanelDraft] = useState(blankPanel);
  const [catalog, setCatalog] = useState([]);
  const [mode, setMode] = useState("visual");
  const [source, setSource] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    splunkLabApi.listCatalog().then((datasets) => { if (active) setCatalog(datasets); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const selectedIndex = panels.findIndex((panel) => panel.id === panelId);
  const selectedPanel = panels[selectedIndex];
  const sourceChanged = mode === "json" && source !== dashboardSource(name, layout, panels);
  const selectPanel = (id) => {
    setPanelId(id);
    setPanelDraft(id ? panels.find((panel) => panel.id === id) || blankPanel : blankPanel);
    setError("");
  };
  const chooseDataSource = (index) => {
    if (!index) return;
    const pipeline = panelDraft.type === "chart" ? " | timechart span=1h count"
      : panelDraft.type === "number" ? " | stats count" : "";
    updateDraft("spl", `index=${index}${pipeline}`);
  };
  const loadDashboard = (dashboard, copy = false) => {
    setEditingId(copy ? null : dashboard.id || null);
    setName(copy ? `${dashboard.name.slice(0, 93)} (copy)` : dashboard.name);
    setLayout(dashboard.layout === "absolute" ? "absolute" : "grid");
    setPanels((dashboard.panels || []).map((panel) => ({ ...panel, id: copy || !panel.id ? newId() : panel.id })));
    selectPanel(null);
    setMode("visual");
    setNotice("");
    if (dashboard.id) document.getElementById("dashboard-editor-heading")?.focus();
  };
  const loadTemplate = (template) => {
    const [index, condition, group, fields] = templates[template];
    const query = `index=${index} ${condition}`;
    loadDashboard({ name: template, panels: [
      { title: "Matching events", type: "number", spl: `${query} | stats count` },
      { title: `Events by ${group}`, type: "chart", spl: `${query} | stats count by ${group} | sort -count` },
      { title: "Event details", type: "table", spl: `${query} | table _time ${fields}` },
    ] });
  };
  const updateDraft = (key, value) => setPanelDraft((previous) => ({ ...previous, [key]: value }));
  const applyPanel = (event) => {
    event.preventDefault();
    const title = panelDraft.title.trim();
    const spl = panelDraft.spl.trim();
    if (!title) return setError("Enter a panel title.");
    if (!dashboardIndex(spl)) return setError("Start the SPL with index= followed by a data source.");
    if (!selectedPanel && panels.length >= 16) return setError("This dashboard already has 16 panels.");
    const panel = {
      id: selectedPanel?.id || newId(), title, type: panelDraft.type, spl, position: selectedPanel?.position,
      savedSearchId: selectedPanel?.spl === spl ? selectedPanel.savedSearchId : undefined,
    };
    if (!selectedPanel && layout === "absolute") {
      const bottom = Math.max(0, ...panels.map((item, index) => {
        const position = panelPosition(item, index);
        return position.y + position.height;
      }));
      panel.position = fitPosition({ x: 12, y: bottom + 12, width: 576, height: 280 });
    }
    setPanels((previous) => selectedPanel ? previous.map((item) => item.id === panel.id ? panel : item) : [...previous, panel]);
    setPanelId(panel.id);
    setPanelDraft(panel);
    setError("");
  };
  const changePosition = (id, position) => {
    setPanels((previous) => previous.map((panel) => panel.id === id ? { ...panel, position } : panel));
  };
  const reorder = (offset) => {
    setPanels((previous) => {
      const next = [...previous];
      [next[selectedIndex], next[selectedIndex + offset]] = [next[selectedIndex + offset], next[selectedIndex]];
      return next;
    });
  };
  const openSource = () => {
    if (mode === "json") return;
    setSource(dashboardSource(name, layout, panels));
    setError("");
    setMode("json");
  };
  const applySource = () => {
    try {
      const definition = parseDashboardSource(source);
      setName(definition.name);
      setLayout(definition.layout);
      setPanels(definition.panels);
      setSource(dashboardSource(definition.name, definition.layout, definition.panels));
      selectPanel(null);
      setNotice("JSON applied to the dashboard.");
    } catch (sourceError) { setError(sourceError.message); }
  };
  const saveDashboard = async () => {
    if (sourceChanged) return setError("Apply the JSON changes before saving.");
    if (!name.trim() || !panels.length) return setError("Name the dashboard and add at least one panel.");
    setSaving(true);
    setError("");
    try {
      const definition = { name: name.trim(), layout, panels: panels.map((panel, index) => ({
        ...panel, position: layout === "absolute" ? panelPosition(panel, index) : panel.position,
      })) };
      const savedDashboard = editingId && onUpdateDashboard ? await onUpdateDashboard(editingId, definition) : await onAddDashboard(definition);
      if (savedDashboard?.id) setEditingId(savedDashboard.id);
      setNotice(savedDashboard?.synced === false ? "Saved in this browser. Account sync is unavailable." : "Dashboard saved.");
    } catch (saveError) { setError(saveError.response?.data?.message || "Could not save the dashboard."); }
    finally { setSaving(false); }
  };
  const changeLayout = (value) => {
    if (value === "absolute") setPanels((previous) => previous.map((panel, index) => ({ ...panel, position: panelPosition(panel, index) })));
    setLayout(value);
  };
  const dataSources = [...catalog.map(({ index, name: label }) => [index, label]), ["training_web", "Web sample"], ["training_security", "Sign-in sample"]];
  return <section className="space-y-4" aria-labelledby="dashboard-editor-heading">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="dashboard-editor-heading" tabIndex={-1} className="flex scroll-mt-24 items-center gap-2 text-xl font-semibold"><LayoutDashboard size={20} className="text-fuchsia-300"/> Dashboard Studio</h2>
      <div className="flex flex-wrap gap-2"><SoftButton disabled={saving} onClick={() => loadDashboard({ name: "Untitled dashboard" })}><Plus size={14} className="mr-1 inline"/> New</SoftButton><PrimaryButton disabled={saving} onClick={saveDashboard}>{saving ? "Saving…" : "Save dashboard"}</PrimaryButton></div>
    </header>
    <GlassCard className="space-y-3 p-4">
      <div className="flex flex-wrap gap-2">
        <SoftButton aria-pressed={mode === "visual"} disabled={mode === "visual"} onClick={() => { setMode("visual"); setError(""); }}>Visual editor</SoftButton>
        <SoftButton aria-pressed={mode === "json"} disabled={mode === "json"} onClick={openSource}><Code2 size={15} className="mr-1 inline"/> JSON source</SoftButton>
        <SoftButton onClick={() => setRefreshKey((value) => value + 1)}><RefreshCw size={14} className="mr-1 inline"/> Refresh preview</SoftButton>
      </div>
      {mode === "visual" ? <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <label className="space-y-1 text-sm">Dashboard name<input className={control} maxLength={100} value={name} onChange={(event) => setName(event.target.value)}/></label>
          <label className="space-y-1 text-sm">Layout<select className={control} value={layout} onChange={(event) => changeLayout(event.target.value)}><option value="grid">Grid · responsive rows</option><option value="absolute">Absolute · free placement</option></select></label>
        </div>
        {!panels.length && <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-400">Start with sample data</span>{Object.keys(templates).map((template) => <SoftButton key={template} onClick={() => loadTemplate(template)}>{template}</SoftButton>)}</div>}
      </div> : <div className="space-y-2">
        <label className="block text-sm">TO Analytics dashboard definition<textarea spellCheck={false} className={`${control} mt-1 min-h-64 font-mono`} value={source} onChange={(event) => setSource(event.target.value)}/></label>
        <div className="flex flex-wrap gap-2"><PrimaryButton onClick={applySource}>Apply JSON</PrimaryButton><SoftButton onClick={async () => {
          try { await navigator.clipboard.writeText(source); setNotice("JSON copied."); }
          catch { setError("Clipboard unavailable. Select and copy the JSON from the editor."); }
        }}><Copy size={14} className="mr-1 inline"/> Copy JSON</SoftButton></div>
      </div>}
      {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
      {notice && <p role="status" className="text-sm text-fuchsia-200">{notice}</p>}
    </GlassCard>
    <div className={`grid items-start gap-4 ${mode === "visual" ? "xl:grid-cols-[320px_minmax(0,1fr)]" : ""}`}>
      {mode === "visual" && <GlassCard className="p-4">
        <form className="space-y-3" onSubmit={applyPanel}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{selectedPanel ? "Edit panel" : "Add panel"}</h3>{selectedPanel && <SoftButton type="button" onClick={() => selectPanel(null)}>New panel</SoftButton>}</div>
          <label className="block text-sm">Panel title<input className={control} value={panelDraft.title} onChange={(event) => updateDraft("title", event.target.value)} maxLength={80}/></label>
          <label className="block text-sm">Visualization<select className={control} value={panelDraft.type} onChange={(event) => updateDraft("type", event.target.value)}>{Object.entries(panelTypes).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>
          <label className="block text-sm">Data source<select className={control} value={dataSources.some(([index]) => index === dashboardIndex(panelDraft.spl)) ? dashboardIndex(panelDraft.spl) : ""} onChange={(event) => chooseDataSource(event.target.value)}><option value="" disabled>Choose an index</option>{dataSources.map(([index, label]) => <option key={index} value={index}>{label || index} · {index}</option>)}</select></label>
          {saved.length > 0 && <label className="block text-sm">Saved search<select className={control} value="" onChange={(event) => { const search = saved.find((item) => item.id === event.target.value); if (search) updateDraft("spl", search.spl); }}><option value="">Load saved SPL</option>{saved.map((search) => <option key={search.id} value={search.id}>{search.name}</option>)}</select></label>}
          <label className="block text-sm">SPL<textarea spellCheck={false} className={`${control} min-h-20 font-mono`} value={panelDraft.spl} maxLength={3000} onChange={(event) => updateDraft("spl", event.target.value)} placeholder="index=training_web | stats count by status"/></label>
          <PrimaryButton type="submit">{selectedPanel ? "Apply and preview" : "Add and preview"}</PrimaryButton>
          {selectedPanel && layout === "absolute" && <fieldset className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2"><legend className="text-sm">Position and size</legend>{Object.entries(panelPosition(selectedPanel, selectedIndex)).map(([field, value]) => <label key={field} className="text-xs capitalize">{field}<input type="number" step="1" className={control} key={`${selectedPanel.id}-${value}`} defaultValue={value} onBlur={(event) => {
            const input = event.target.valueAsNumber;
            const position = panelPosition(selectedPanel, selectedIndex);
            if (Number.isFinite(input)) changePosition(selectedPanel.id, fitPosition({ ...position, [field]: input }));
            event.target.value = Number.isFinite(input) ? fitPosition({ ...position, [field]: input })[field] : position[field];
          }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } }}/></label>)}</fieldset>}
          {selectedPanel && <div className="flex flex-wrap gap-2">
            {layout === "grid" && <><SoftButton type="button" disabled={selectedIndex === 0} onClick={() => reorder(-1)}>Move earlier</SoftButton><SoftButton type="button" disabled={selectedIndex === panels.length - 1} onClick={() => reorder(1)}>Move later</SoftButton></>}
            <SoftButton type="button" onClick={() => { setPanels((previous) => previous.filter((panel) => panel.id !== selectedPanel.id)); selectPanel(null); }}>Remove panel</SoftButton>
          </div>}
        </form>
      </GlassCard>}
      <GlassCard className="min-w-0 p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-semibold">Preview</h3>{layout === "absolute" && mode === "visual" && <p className="text-xs text-slate-400">Drag the top grip to move a panel and the bottom corner to resize it.</p>}</div>
        {panels.length ? <DashboardCanvas panels={panels} layout={layout} selectedId={mode === "visual" ? panelId : undefined} onSelect={mode === "visual" ? (id) => { if (id !== panelId) selectPanel(id); } : undefined} onPosition={mode === "visual" ? changePosition : undefined} renderPanel={(panel) => <PanelPreview panel={panel} refreshKey={refreshKey}/>}/> : <p className="py-10 text-center text-sm text-slate-400">Add a panel or load a sample dashboard to see results here.</p>}
      </GlassCard>
    </div>
    <GlassCard className="p-4">
      <h3 className="mb-2 font-semibold">Saved dashboards</h3>
      {!dashboards.length && <p className="text-sm text-slate-400">Your dashboards will appear here after you save them.</p>}
      <ul className="divide-y divide-white/10">{dashboards.map((dashboard) => <li key={dashboard.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
        <div className="min-w-0"><p className="break-words text-sm font-medium">{dashboard.name}</p><p className="text-xs text-slate-400">{dashboard.layout === "absolute" ? "Absolute" : "Grid"} · {dashboard.panels?.length || 0} panels</p></div>
        <div className="flex flex-wrap gap-2"><SoftButton disabled={saving} onClick={() => loadDashboard(dashboard)}>Open</SoftButton><SoftButton disabled={saving} onClick={() => loadDashboard(dashboard, true)}>Duplicate</SoftButton><SoftButton disabled={saving} onClick={() => { if (window.confirm(`Delete ${dashboard.name}?`)) { onDeleteDashboard(dashboard.id); if (editingId === dashboard.id) loadDashboard({ name: "Untitled dashboard" }); } }}>Delete</SoftButton></div>
      </li>)}</ul>
    </GlassCard>
  </section>;
}
