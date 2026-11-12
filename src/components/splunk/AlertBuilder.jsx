/* eslint-disable react/prop-types */
import { useState } from "react";
import { Bell, Mail, Play, RotateCcw, Trash2, Pencil } from "lucide-react";
import { sendSimulatedAlertEmail } from "../../services/splunkAlertEmail";
import { splunkLabApi } from "../../services/splunkLabApi";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

const control = "w-full rounded-xl border border-white/10 bg-[#080f22] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/70";
function ResultNotice({ value }) {
  if (!value) return null;
  const classes = value.error ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : value.triggered ? "border-amber-400/30 bg-amber-500/10 text-amber-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  return <div role="status" className={`rounded-xl border p-3 text-sm ${classes}`}>
    {value.error ? value.error : `${value.triggered ? "Triggered" : "Not triggered"} — ${value.observed.toLocaleString()} ${value.metric === "resultRows" ? "result rows" : "matched events"}.`}
    {value.emailStatus && <p className="mt-1 text-xs">{value.emailStatus}</p>}
  </div>;
}
const defaults = { name: "Buttercup failed login threshold", operator: ">=", threshold: "10", metric: "events", notifyOnTrigger: false, spl: "index=buttercup_auth action=failure" };

export default function AlertBuilder({ saved = [], alerts = [], onAddAlert, onUpdateAlert, onDeleteAlert, onRunAlert }) {
  const [draft, setDraft] = useState(defaults);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState(saved[0]?.id || "__custom__");
  const [draftResult, setDraftResult] = useState(null);
  const [results, setResults] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");
  const selectedId = saved.some((s) => s.id === searchId) ? searchId : "__custom__";
  const selectedSearch = saved.find((s) => s.id === selectedId);
  const query = selectedSearch?.spl || draft.spl;
  const update = (name, value) => { setDraft((p) => ({ ...p, [name]: value })); setDraftResult(null); };
  const formValues = () => ({ name: draft.name.trim(), spl: query.trim(), operator: draft.operator, threshold: Number(draft.threshold), metric: draft.metric, notifyOnTrigger: draft.notifyOnTrigger });
  const validate = () => {
    const alert = formValues();
    if (!alert.name || alert.name.length > 100) return { error: "Enter an alert name (up to 100 characters)." };
    if (!alert.spl) return { error: "Choose a search or enter SPL." };
    if (!/^index=buttercup_(?:web|auth|sales|prices)\b/i.test(alert.spl)) return { error: "Alerts must search an imported Buttercup index." };
    if (String(draft.threshold).trim() === "") return { error: "Enter a threshold." };
    if (!Number.isInteger(alert.threshold) || alert.threshold < 0 || alert.threshold > 1000000) return { error: "Threshold must be a whole number from 0 to 1,000,000." };
    if (![">=", ">", "==", "<=", "<"].includes(alert.operator)) return { error: "Choose a supported comparison operator." };
    return { alert };
  };
  const evaluate = async (alert) => {
    const result = await splunkLabApi.search(alert.spl, { timeRange: "all", pageSize: 1 });
    const observed = alert.metric === "resultRows" ? result.totalRows : result.count;
    const operators = { ">=": (a, b) => a >= b, ">": (a, b) => a > b, "==": (a, b) => a === b, "<=": (a, b) => a <= b, "<": (a, b) => a < b };
    return { triggered: operators[alert.operator](observed, alert.threshold), observed, metric: alert.metric, matchedEvents: result.count, resultRows: result.totalRows };
  };
  const testDraft = async () => {
    const value = validate();
    if (value.error) { setDraftResult({ error: value.error }); return; }
    try { setBusyId("draft"); setDraftResult(await evaluate(value.alert)); }
    catch (error) { setDraftResult({ error: error.response?.data?.message || "The stored-data search failed." }); }
    finally { setBusyId(null); }
  };
  const saveDraft = async () => {
    const value = validate();
    if (value.error) { setDraftResult({ error: value.error }); return; }
    if (editingId) onUpdateAlert?.(editingId, value.alert);
    else onAddAlert(value.alert);
    setNotice(`Alert ${editingId ? "updated" : "saved"}. Run it from Saved Alerts to check its condition.`);
    setEditingId(null); setDraft(defaults); setSearchId("__custom__"); setDraftResult(null);
  };
  const edit = (alert) => {
    setEditingId(alert.id); setDraft({ name: alert.name, spl: alert.spl, operator: alert.operator, threshold: String(alert.threshold), metric: alert.metric || "events", notifyOnTrigger: Boolean(alert.notifyOnTrigger) });
    setSearchId("__custom__"); setDraftResult(null); setNotice(`Editing ${alert.name}`);
  };
  const runSaved = async (alert) => {
    if (busyId) return;
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
  return <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
    <GlassCard className="p-5 sm:p-6">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold"><Bell size={18} className="text-cyan-300"/> Alert Builder</h2>
      <p className="mb-5 text-xs leading-relaxed text-slate-400">Evaluate alert thresholds against imported Buttercup records. Runs are stored with the alert, and optional email remains a manual action to your verified account address.</p>
      <div className="space-y-4">
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Alert name</span><input className={control} value={draft.name} onChange={(e) => update("name", e.target.value)} maxLength={100}/></label>
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Use saved search</span><select className={control} value={selectedId} onChange={(e) => { setSearchId(e.target.value); setDraftResult(null); }}><option value="__custom__">Write custom SPL</option>{saved.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        {selectedSearch ? <p className="break-all rounded-lg bg-white/5 p-2 font-mono text-xs text-slate-300">{selectedSearch.spl}</p> : <label className="block"><span className="mb-1 block text-xs text-slate-400">SPL query</span><textarea className={`${control} min-h-24 font-mono`} value={draft.spl} onChange={(e) => update("spl", e.target.value)} maxLength={4000}/></label>}
        <label className="block"><span className="mb-1 block text-xs text-slate-400">Measure</span><select className={control} value={draft.metric} onChange={(e) => update("metric", e.target.value)}><option value="events">Matched events (before stats)</option><option value="resultRows">Result rows (after SPL)</option></select></label>
        <div className="grid grid-cols-3 gap-2"><label><span className="mb-1 block text-xs text-slate-400">Operator</span><select className={control} value={draft.operator} onChange={(e) => update("operator", e.target.value)}><option value=">=">≥</option><option value=">">&gt;</option><option value="==">=</option><option value="<=">≤</option><option value="<">&lt;</option></select></label><label className="col-span-2"><span className="mb-1 block text-xs text-slate-400">Threshold</span><input type="number" min="0" max="1000000" step="1" className={control} value={draft.threshold} onChange={(e) => update("threshold", e.target.value)}/></label></div>
        <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm"><input type="checkbox" checked={draft.notifyOnTrigger} onChange={(e) => update("notifyOnTrigger", e.target.checked)} className="mt-1 accent-cyan-400"/><span><span className="flex items-center gap-2 font-medium"><Mail size={15}/> Email me on trigger</span><span className="mt-1 block text-xs text-slate-400">Only when you click Run on the saved alert, and only to the verified email on your signed-in account. Requires backend configuration.</span></span></label>
        <div className="flex gap-2"><SoftButton disabled={busyId === "draft"} onClick={testDraft} className="flex-1"><Play size={15} className="mr-1 inline"/> {busyId === "draft" ? "Searching stored data…" : "Test without email"}</SoftButton><PrimaryButton onClick={saveDraft} className="flex-1">{editingId ? "Update Alert" : "Save Alert"}</PrimaryButton></div>
        {editingId && <SoftButton onClick={() => { setEditingId(null); setDraft(defaults); setSearchId("__custom__"); setDraftResult(null); }} className="flex items-center gap-1"><RotateCcw size={15}/> New Alert</SoftButton>}
        <ResultNotice value={draftResult}/>{notice && <p role="status" className="text-sm text-cyan-200">{notice}</p>}
      </div>
    </GlassCard>
    <GlassCard className="h-fit p-5 sm:p-6"><h3 className="mb-4 text-lg font-semibold">Saved Alerts <span className="text-sm font-normal text-slate-400">({alerts.length})</span></h3>
      {!alerts.length ? <p className="text-sm text-slate-400">No alerts saved. Create one on the left.</p> : <div className="space-y-3">{alerts.map((alert) => <section key={alert.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h4 className="font-semibold">{alert.name}</h4><p className="mt-1 text-xs text-slate-400">{alert.metric === "resultRows" ? "Result rows" : "Matched events"} {alert.operator} {alert.threshold} · Email {alert.notifyOnTrigger ? "on" : "off"}</p></div><div className="flex gap-2"><SoftButton onClick={() => edit(alert)} title="Edit alert"><Pencil size={15}/></SoftButton><SoftButton onClick={() => { if (window.confirm(`Delete alert ${alert.name}?`)) onDeleteAlert(alert.id); }} title="Delete alert"><Trash2 size={15}/></SoftButton></div></div>
        <p className="my-3 break-all font-mono text-xs text-slate-400">{alert.spl}</p>
        {alert.history?.length > 0 && <div className="mb-3 space-y-2">{alert.history.slice(-5).reverse().map((run, index) => <p key={`${run.ranAt}-${index}`} className="text-xs text-slate-500">{new Date(run.ranAt).toLocaleString()} · {run.error ? `Error: ${run.error}` : `${run.triggered ? "Triggered" : "Not triggered"} · ${run.observed} ${run.metric}`}</p>)}</div>}
        <SoftButton disabled={Boolean(busyId)} onClick={() => runSaved(alert)} className="mb-3 flex items-center gap-2"><Play size={15}/> {busyId === alert.id ? "Running…" : "Run Saved Alert"}</SoftButton>
        <ResultNotice value={results[alert.id]}/>
      </section>)}</div>}
      <p className="mt-4 text-xs leading-relaxed text-slate-500">Alerts are evaluated when you click Run against stored tutorial records; they do not monitor live Splunk infrastructure. Email is sent only after a manual Run action and only to the verified signed-in account.</p>
    </GlassCard>
  </div>;
}
