/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Bell, ChevronDown, Mail, Play, Plus, RotateCcw, Trash2, Pencil } from "lucide-react";
import { sendSimulatedAlertEmail } from "../../services/splunkAlertEmail";
import { splunkLabApi } from "../../services/splunkLabApi";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

const control = "w-full rounded-xl border border-white/10 bg-[#080f22] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/70";
function ResultNotice({ value }) {
  if (!value) return null;
  const classes = value.error ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : value.triggered ? "border-amber-400/30 bg-amber-500/10 text-amber-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  return <div role="status" className={`rounded-xl border p-3 text-sm ${classes}`}>
    {value.error || <>{value.triggered ? "Triggered" : "Below threshold"}{Number.isFinite(value.observed) && ` · ${value.observed.toLocaleString()} ${value.metric === "resultRows" ? "result rows" : "matched events"}`}</>}
    {value.emailStatus && <p className="mt-1 text-xs">{value.emailStatus}</p>}
  </div>;
}
const defaults = { name: "", operator: ">=", threshold: "10", metric: "events", notifyOnTrigger: false, spl: "", scheduleMinutes: 0, searchWindow: "5m" };
const pageSize = 8;
const queryIndex = (query) => /^index\s*=\s*([a-z0-9_-]+)(?=\s|\||$)/i.exec(query?.trim() || "")?.[1];
const exampleQueries = {
  toa_auth: "index=toa_auth action=failure",
  toa_soc: "index=toa_soc source=vpn action=failure",
  toa_web: "index=toa_web status>=500",
};

export default function AlertBuilder({ saved = [], alerts = [], onAddAlert, onUpdateAlert, onDeleteAlert, onRunAlert, onRefresh }) {
  const [draft, setDraft] = useState(defaults);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [draftResult, setDraftResult] = useState(null);
  const [results, setResults] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    splunkLabApi.listCatalog()
      .then((datasets) => { if (active) setCatalog(datasets); })
      .catch(() => { if (active) setCatalogError(true); });
    return () => { active = false; };
  }, []);

  const availableIndexes = new Set(catalog?.map((dataset) => dataset.index));
  const filteredAlerts = alerts.filter((alert) => `${alert.name} ${alert.spl}`.toLowerCase().includes(filter.trim().toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleAlerts = filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const indexError = (spl) => {
    const index = queryIndex(spl);
    if (!index) return "Start the SPL with index= followed by a training index.";
    if (index.startsWith("training_")) return `${index} is a browser practice index. Choose a server training index from Data source.`;
    if (catalog && !availableIndexes.has(index)) return index === "toa_soc"
      ? "Start the scenario under SOC Investigation to make toa_soc available."
      : `Index ${index} is unavailable. Choose an available index from Data source.`;
    return "";
  };
  const update = (name, value) => { setDraft((p) => ({ ...p, [name]: value })); setDraftResult(null); };
  const formValues = () => ({ ...draft, name: draft.name.trim(), spl: draft.spl.trim(), threshold: Number(draft.threshold) });
  const validate = (requireName = true) => {
    const alert = formValues();
    if (requireName && (!alert.name || alert.name.length > 100)) return { error: "Enter an alert name (up to 100 characters)." };
    if (!alert.spl) return { error: "Choose a search or enter SPL." };
    const sourceError = indexError(alert.spl);
    if (sourceError) return { error: sourceError };
    if (String(draft.threshold).trim() === "") return { error: "Enter a threshold." };
    if (!Number.isInteger(alert.threshold) || alert.threshold < 0 || alert.threshold > 1000000) return { error: "Threshold must be a whole number from 0 to 1,000,000." };
    if (![">=", ">", "==", "<=", "<"].includes(alert.operator)) return { error: "Choose a supported comparison operator." };
    return { alert };
  };
  const evaluate = async (alert) => {
    const result = await splunkLabApi.search(alert.spl, { timeRange: alert.scheduleMinutes ? alert.searchWindow : "all", pageSize: 1 });
    const matchedEvents = result.matchedEvents ?? result.count;
    const observed = alert.metric === "resultRows" ? result.totalRows : matchedEvents;
    const operators = { ">=": (a, b) => a >= b, ">": (a, b) => a > b, "==": (a, b) => a === b, "<=": (a, b) => a <= b, "<": (a, b) => a < b };
    return { triggered: operators[alert.operator](observed, alert.threshold), observed, metric: alert.metric, matchedEvents, resultRows: result.totalRows };
  };
  const testDraft = async () => {
    const value = validate(false);
    if (value.error) { setDraftResult({ error: value.error }); return; }
    try { setBusyId("draft"); setDraftResult(await evaluate(value.alert)); }
    catch (error) { setDraftResult({ error: error.response?.data?.message || "The stored-data search failed." }); }
    finally { setBusyId(null); }
  };
  const saveDraft = async () => {
    const value = validate();
    if (value.error) { setDraftResult({ error: value.error }); return; }
    setBusyId("saving");
    try {
      const synced = editingId ? await onUpdateAlert?.(editingId, value.alert) : await onAddAlert(value.alert);
      if (!synced) setNotice("Saved in this browser. Sync to your account to run the alert.");
      else setNotice(value.alert.scheduleMinutes ? "Schedule saved. A running backend scheduler evaluates it automatically." : "Use Run Saved Alert to evaluate the rule on demand.");
    } finally { setBusyId(null); }
    setEditingId(null); setDraft(defaults); setSearchId(""); setDraftResult(null);
  };
  const edit = (alert) => {
    setEditingId(alert.id); setDraft({ ...defaults, name: alert.name, spl: alert.spl, operator: alert.operator, threshold: String(alert.threshold), metric: alert.metric || "events", notifyOnTrigger: Boolean(alert.notifyOnTrigger), scheduleMinutes: alert.scheduleMinutes || 0, searchWindow: alert.searchWindow || "5m" });
    setSearchId(""); setDraftResult(null); setNotice("");
    document.getElementById("splunk-alert-name")?.focus();
  };
  const runSaved = async (alert) => {
    if (busyId) return;
    setExpandedId(alert.id);
    setBusyId(alert.id);
    try {
      const result = await onRunAlert(alert.id);
      let emailStatus = !alert.notifyOnTrigger ? "Email notification is off." : !result.triggered ? "No email sent because condition was not met." : "";
      if (alert.notifyOnTrigger && result.triggered) {
        try { await sendSimulatedAlertEmail(alert, result); emailStatus = "Notification accepted for delivery to your verified account email."; }
        catch (err) { emailStatus = `Email failed: ${err.message}`; }
      }
      setResults((previous) => ({ ...previous, [alert.id]: { ...result, emailStatus } }));
    } catch (error) { setResults((previous) => ({ ...previous, [alert.id]: { error: error.response?.data?.message || "The stored-data alert search failed." } })); }
    finally { setBusyId(null); }
  };
  return <section aria-labelledby="splunk-alerts-title" className="space-y-4">
    <h2 id="splunk-alerts-title" className="flex items-center gap-2 text-xl font-semibold"><Bell size={20} className="text-fuchsia-300" aria-hidden="true"/> Splunk Alerts</h2>
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
    <GlassCard className="p-4 sm:p-5">
      <h3 className="mb-4 text-base font-semibold">{editingId ? "Edit alert" : "Create alert"}</h3>
      <div className="space-y-4">
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Alert name</span><input id="splunk-alert-name" className={control} value={draft.name} placeholder="Failed VPN sign-ins" onChange={(e) => update("name", e.target.value)} maxLength={100}/></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0"><span className="mb-1 block text-xs text-slate-400">Data source</span><select className={control} value={availableIndexes.has(queryIndex(draft.spl)) ? queryIndex(draft.spl) : ""} onChange={(e) => { if (e.target.value) { setSearchId(""); update("spl", exampleQueries[e.target.value] || `index=${e.target.value}`); } }}>
            <option value="" disabled>{catalogError ? "Catalog unavailable" : catalog ? "Choose an index" : "Loading indexes…"}</option>
            {catalog?.map((dataset) => <option key={dataset.index} value={dataset.index}>{dataset.index}</option>)}
          </select></label>
          <label className="min-w-0"><span className="mb-1 block text-xs text-slate-400">Load a saved search</span><select className={control} value={saved.some((search) => search.id === searchId) ? searchId : ""} onChange={(e) => { const search = saved.find((item) => item.id === e.target.value); setSearchId(search?.id || ""); if (search) update("spl", search.spl); }}>
            <option value="">Choose a search (optional)</option>
            {saved.map((search) => <option key={search.id} value={search.id} disabled={Boolean(indexError(search.spl))}>{search.name}{indexError(search.spl) && " · unavailable for alerts"}</option>)}
          </select></label>
        </div>
        <label className="block"><span className="mb-1 block text-xs text-slate-400">SPL query</span><textarea className={`${control} min-h-20 font-mono`} value={draft.spl} onChange={(e) => { setSearchId(""); update("spl", e.target.value); }} placeholder="index=toa_auth action=failure" maxLength={3000}/></label>
        {catalogError && <p className="text-xs text-amber-200">Could not load the index list. You can enter SPL and test it directly.</p>}
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Measure</span><select className={control} value={draft.metric} onChange={(e) => update("metric", e.target.value)}><option value="events">Matched events (before stats)</option><option value="resultRows">Result rows (after SPL)</option></select></label>
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Run every</span><select className={control} value={draft.scheduleMinutes} onChange={(e) => update("scheduleMinutes", Number(e.target.value))}><option value={0}>Manual only</option><option value={5}>5 minutes</option><option value={15}>15 minutes</option><option value={60}>60 minutes</option></select></label>
        {draft.scheduleMinutes > 0 && <label className="block"><span className="mb-1 block text-xs text-slate-400">Search window</span><select className={control} value={draft.searchWindow} onChange={(e) => update("searchWindow", e.target.value)}><option value="5m">Previous 5 minutes</option><option value="15m">Previous 15 minutes</option><option value="60m">Previous 60 minutes</option></select></label>}
        <div className="grid grid-cols-3 gap-2"><label><span className="mb-1 block text-xs text-slate-400">Operator</span><select className={control} value={draft.operator} onChange={(e) => update("operator", e.target.value)}><option value=">=">≥</option><option value=">">&gt;</option><option value="==">=</option><option value="<=">≤</option><option value="<">&lt;</option></select></label><label className="col-span-2"><span className="mb-1 block text-xs text-slate-400">Threshold</span><input type="number" min="0" max="1000000" step="1" className={control} value={draft.threshold} onChange={(e) => update("threshold", e.target.value)}/></label></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={draft.notifyOnTrigger} onChange={(e) => update("notifyOnTrigger", e.target.checked)} className="mt-1 accent-cyan-400"/><span><span className="flex items-center gap-2 font-medium"><Mail size={15}/> Email me when a manual run triggers</span>{draft.notifyOnTrigger && <span className="mt-1 block text-xs text-slate-400">Delivered to your verified account email.</span>}</span></label>
        <div className="flex gap-2"><SoftButton disabled={Boolean(busyId)} onClick={testDraft} className="flex-1"><Play size={15} className="mr-1 inline"/> {busyId === "draft" ? "Searching stored data…" : "Test without email"}</SoftButton><PrimaryButton disabled={Boolean(busyId)} onClick={saveDraft} className="flex-1">{busyId === "saving" ? "Saving…" : editingId ? "Update Alert" : "Save Alert"}</PrimaryButton></div>
        {editingId && <SoftButton onClick={() => { setEditingId(null); setDraft(defaults); setSearchId(""); setDraftResult(null); setNotice(""); }} className="flex items-center gap-1"><Plus size={15}/> New Alert</SoftButton>}
        <ResultNotice value={draftResult}/>{notice && <p role="status" className="text-sm text-cyan-200">{notice}</p>}
      </div>
    </GlassCard>
    <GlassCard className="min-w-0 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Saved alerts <span className="text-sm font-normal text-slate-400">({alerts.length})</span></h3>{onRefresh && <SoftButton onClick={onRefresh} className="flex items-center gap-2"><RotateCcw size={14}/> Refresh runs</SoftButton>}</div>
      {(alerts.length > pageSize || filter) && <label className="mb-3 block"><span className="sr-only">Filter saved alerts</span><input className={control} placeholder="Filter by alert name or SPL" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}/></label>}
      {!alerts.length ? <p className="py-6 text-sm text-slate-400">Your saved alerts will appear here.</p> : !visibleAlerts.length ? <p className="py-6 text-sm text-slate-400">No alerts match your filter.</p> : <ul className="divide-y divide-white/10 border-y border-white/10">
        {visibleAlerts.map((alert) => {
          const expanded = expandedId === alert.id;
          const unavailable = indexError(alert.spl);
          const lastRun = alert.history?.at(-1);
          return <li key={alert.id}>
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
              <button type="button" aria-expanded={expanded} aria-controls={`splunk-alert-${alert.id}`} onClick={() => setExpandedId(expanded ? null : alert.id)} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left">
                <ChevronDown size={15} className={`shrink-0 text-slate-400 ${expanded ? "" : "-rotate-90"}`} aria-hidden="true"/>
                <span className="min-w-0"><span className="block truncate text-sm font-medium">{alert.name}</span><span className="block break-words text-xs text-slate-400">{queryIndex(alert.spl) || "No index"} · {alert.scheduleMinutes ? `Every ${alert.scheduleMinutes} min` : "Manual"}{lastRun && ` · ${lastRun.error ? "Run failed" : lastRun.triggered ? "Triggered" : "Below threshold"}`}</span></span>
              </button>
              <SoftButton disabled={Boolean(busyId) || Boolean(unavailable)} onClick={() => runSaved(alert)} className="flex items-center gap-1.5" aria-label={`Run ${alert.name}`}><Play size={14}/>{busyId === alert.id ? "Running…" : "Run"}</SoftButton>
            </div>
            <div id={`splunk-alert-${alert.id}`} hidden={!expanded} className="space-y-3 pb-4 pl-6">
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-black/20 p-2 text-xs text-cyan-200">{alert.spl}</pre>
              <p className="text-xs text-slate-300">{alert.metric === "resultRows" ? "Result rows" : "Matched events"} {alert.operator} {alert.threshold}{alert.scheduleMinutes ? ` · Previous ${parseInt(alert.searchWindow || "5m", 10)} min` : ""}{alert.nextRunAt ? ` · Next run ${new Date(alert.nextRunAt).toLocaleString()}` : ""}{alert.notifyOnTrigger ? " · Manual email on" : ""}</p>
              {unavailable && <p className="text-xs text-amber-200">{unavailable} Use Edit to update this alert.</p>}
              <ResultNotice value={results[alert.id]}/>
              {alert.history?.length > 0 && <div className="space-y-1"><h4 className="text-xs font-semibold text-slate-200">Recent runs</h4>{alert.history.slice(-5).reverse().map((run, index) => <p key={`${run.ranAt}-${index}`} className="text-xs text-slate-400">{new Date(run.ranAt).toLocaleString()} · {run.scheduledFor ? "Scheduled" : "Manual"} · {run.error || `${run.triggered ? "Triggered" : "Below threshold"} · ${run.observed}`}</p>)}</div>}
              <div className="flex flex-wrap gap-2">{onUpdateAlert && <SoftButton onClick={() => edit(alert)} className="flex items-center gap-2"><Pencil size={14}/> Edit</SoftButton>}<SoftButton onClick={() => { if (window.confirm(`Delete alert ${alert.name}?`)) onDeleteAlert(alert.id); }} className="flex items-center gap-2"><Trash2 size={14}/> Delete</SoftButton></div>
            </div>
          </li>;
        })}
      </ul>}
      {totalPages > 1 && <nav aria-label="Saved alert pages" className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400"><SoftButton disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</SoftButton><span>Page {currentPage} of {totalPages}</span><SoftButton disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</SoftButton></nav>}
    </GlassCard>
    </div>
  </section>;
}
