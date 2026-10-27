import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, CheckCircle2,
  CircleAlert, Clock3, Code2, FileText, LayoutDashboard, ListTodo,
  RefreshCw, Send, ShieldCheck, Wallet,
} from "lucide-react";

const API = import.meta.env.VITE_BACKEND_API;
const credits = (value) => `${Number(value || 0).toLocaleString("en-US")} TO Credits`;
const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

function authHeaders() {
  const token = localStorage.getItem("ACCESS_TOKEN");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const statusStyles = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_revision: "border-amber-200 bg-amber-50 text-amber-800",
  assigned: "border-violet-200 bg-violet-50 text-violet-800",
};
const statusNames = { completed: "Completed", needs_revision: "Needs revision", assigned: "To do" };
function Status({ value }) {
  return <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[value] || statusStyles.assigned}`}>{statusNames[value] || value}</span>;
}
function Box({ children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>;
}

export default function Workplace() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [activeId, setActiveId] = useState(null);
  const [splQuery, setSplQuery] = useState("");
  const [report, setReport] = useState("");

  const fetchWorkplace = useCallback(async () => {
    if (!localStorage.getItem("ACCESS_TOKEN")) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      setBusy(true);
      setError("");
      const response = await axios.get(`${API}/api/skill-lab/workplace`, { headers: authHeaders() });
      setData(response.data);
    } catch (requestError) {
      if (requestError.response?.status === 401) return navigate("/login", { state: { from: location.pathname } });
      setError(requestError.response?.data?.message || "Workplace could not be loaded. Check the backend deployment and Supabase migration.");
    } finally {
      setBusy(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => { fetchWorkplace(); }, [fetchWorkplace]);

  const tasks = useMemo(() => data?.tasks || [], [data]);
  const active = tasks.find((task) => task.id === activeId) || null;
  const todayTasks = tasks.filter((task) => task.assigned_for === data?.today);
  const thisMonth = data?.today?.slice(0, 7);
  const monthlyTasks = tasks.filter((task) => task.assigned_for?.startsWith(thisMonth || "none"));
  const monthlyCompleted = monthlyTasks.filter((task) => task.status === "completed").length;
  const monthlyTarget = data?.monthlyTaskTarget || 20;
  const progress = Math.min(100, Math.round((monthlyCompleted / monthlyTarget) * 100));

  const openTicket = (task) => {
    setActiveId(task.id);
    setSplQuery(task.spl_query || task.skill_lab_task_templates?.starter_query || "");
    setReport(task.submission_text || "");
    setInfo("");
    setError("");
    setTab("tasks");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const acceptOffer = async (offerId) => {
    try {
      setSaving(true);
      setError("");
      await axios.post(`${API}/api/skill-lab/offers/${offerId}/accept`, {}, { headers: authHeaders() });
      setInfo("Offer accepted. Your simulated employee account is active.");
      await fetchWorkplace();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not accept this offer.");
    } finally { setSaving(false); }
  };

  const submitTask = async () => {
    if (!active) return;
    try {
      setSaving(true);
      setError("");
      setInfo("");
      const { data: result } = await axios.post(
        `${API}/api/skill-lab/workplace/tasks/${active.id}/submit`,
        { splQuery, report },
        { headers: authHeaders() },
      );
      setInfo(result.task.status === "completed"
        ? `Ticket completed with ${result.task.score}/100 automated rubric points.`
        : `Scored ${result.task.score}/100. Review the feedback and resubmit before the deadline.`);
      await fetchWorkplace();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit this task.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/toskillab" className="flex items-center gap-3 font-bold text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-700 text-white">TO</span>
            <span>T.O. SkillLab <span className="block text-xs font-normal text-slate-500">Virtual employee workplace</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 sm:block">TRAINING SIMULATION</span>
            <button type="button" onClick={fetchWorkplace} aria-label="Refresh workplace" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"><RefreshCw size={18}/></button>
            <Link to="/toskillab" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><ArrowLeft size={15}/> Interviews</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        {error && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><CircleAlert size={20} className="shrink-0"/>{error}</div>}
        {info && <div role="status" className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 size={20} className="shrink-0"/>{info}</div>}
        {busy && !data && <div className="rounded-2xl bg-white p-12 text-center text-slate-600">Loading your virtual workplace...</div>}
        {!busy && !data && <Box><p>Unable to open SkillLab workplace.</p><button className="mt-4 rounded-xl bg-violet-700 px-4 py-2 text-white" onClick={fetchWorkplace}>Try again</button></Box>}

        {data && !data.employment && (
          <div className="mx-auto max-w-3xl space-y-6">
            <Box className="text-center">
              <BriefcaseBusiness className="mx-auto text-violet-700" size={38}/>
              <h1 className="mt-4 text-3xl font-bold">Your virtual career starts here</h1>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">Pass at least 4 of 10 interview questions and accept your offer to unlock realistic daily work tickets, progress tracking, and virtual monthly payslips.</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Simulation only — no employment contract, real salary or cash withdrawal.</p>
            </Box>
            {data.offers?.length ? data.offers.map((offer) => (
              <Box key={offer.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Pending simulated offer</p>
                    <h2 className="mt-2 text-xl font-bold">{offer.skill_lab_roles?.title || "Technology trainee"}</h2>
                    <p className="mt-1 text-sm text-slate-600">{offer.skill_lab_companies?.name || "Virtual company"} · {offer.job_level} · {credits(offer.virtual_salary)} / month</p>
                    <p className="mt-2 text-xs text-slate-500">Expires {dateLabel(offer.expires_at)}</p>
                  </div>
                  <button disabled={saving} onClick={() => acceptOffer(offer.id)} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
                    {saving ? "Accepting..." : "Accept virtual offer"} <ArrowRight size={17}/>
                  </button>
                </div>
              </Box>
            )) : <Box><p className="text-slate-600">No active offers yet. Take a SkillLab interview to apply for your virtual role.</p><Link className="mt-4 inline-flex items-center gap-2 font-semibold text-violet-700" to="/toskillab">Start interview <ArrowRight size={16}/></Link></Box>}
          </div>
        )}

        {data?.employment && <>
          <div className="mb-7 rounded-2xl bg-gradient-to-r from-[#1d1630] to-[#3e235c] p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">Employee portal · virtual office</p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome to your workplace</h1>
                <p className="mt-3 text-slate-300">{data.employment.skill_lab_roles?.title} · {data.employment.job_level} · {data.employment.skill_lab_companies?.name}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3"><span className="flex items-center gap-2 text-sm font-semibold text-emerald-200"><BadgeCheck size={17}/> Active simulated employment</span><span className="mt-1 block text-xs text-slate-300">Started {dateLabel(data.employment.started_at)}</span></div>
            </div>
            <p className="mt-6 text-xs text-slate-300">This is an educational simulation with fictional cases and non-redeemable TO Credits. It is not real paid work.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Monthly virtual salary", value: credits(data.employment.virtual_salary), icon: BriefcaseBusiness },
              { title: "Wallet balance", value: credits(data.wallet?.balance), icon: Wallet },
              { title: "Today's tickets", value: `${todayTasks.filter(t => t.status === "completed").length} / ${todayTasks.length} finished`, icon: ListTodo },
              { title: "Completed this month", value: `${monthlyCompleted} / ${monthlyTarget} target`, icon: CheckCircle2 },
            ].map(({ title, value, icon: Icon }) => <Box key={title}><div className="flex items-center justify-between text-sm text-slate-500"><span>{title}</span><Icon size={19} className="text-violet-600"/></div><div className="mt-3 text-lg font-bold tracking-tight sm:text-xl">{value}</div></Box>)}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {[{key:"dashboard",label:"Overview",icon:LayoutDashboard},{key:"tasks",label:"Work tickets",icon:ListTodo},{key:"payroll",label:"Payslips",icon:Wallet}].map(({key,label,icon:Icon}) => (
              <button key={key} onClick={() => setTab(key)} aria-pressed={tab===key}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${tab===key ? "bg-violet-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}><Icon size={16}/>{label}</button>
            ))}
          </div>

          {tab === "dashboard" && <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Box>
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Daily operations</p><h2 className="mt-1 text-xl font-bold">Today's work queue</h2></div><CalendarDays className="text-violet-700" size={24}/></div>
              <p className="mt-2 text-sm text-slate-500">{dateLabel(data.today)} · Complete tickets by their deadlines.</p>
              <div className="mt-5 space-y-3">
                {todayTasks.length ? todayTasks.map((task) => <button key={task.id} onClick={() => openTicket(task)} className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-violet-300 hover:bg-violet-50/30">
                  <span className="rounded-lg bg-violet-100 p-3 text-violet-700"><ShieldCheck size={20}/></span><span className="min-w-0 flex-1"><span className="block font-semibold">{task.skill_lab_task_templates?.title}</span><span className="mt-1 block text-xs text-slate-500">Due {dateLabel(task.due_at)}</span></span><Status value={task.status}/><ArrowRight size={16} className="hidden text-slate-400 sm:block"/>
                </button>) : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No tasks available for this role yet. Ask your administrator to seed task templates in Supabase.</p>}
              </div>
              <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700" onClick={() => setTab("tasks")}>Browse all tickets <ArrowRight size={16}/></button>
            </Box>
            <Box><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Monthly performance</p><h2 className="mt-2 text-xl font-bold">Your performance tracker</h2>
              <div className="mt-6 flex items-end justify-between"><span className="text-3xl font-bold">{progress}%</span><span className="text-sm text-slate-500">{monthlyCompleted} of {monthlyTarget} completed</span></div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{width:`${progress}%`}}/></div>
              <p className="mt-5 text-sm leading-7 text-slate-600">The virtual salary is earned through completed tasks. At the beginning of next month, the system settles up to 100% of your base virtual salary at 20 completed tasks. Uncompleted work does not earn credits.</p>
              <p className="mt-5 flex items-center gap-2 rounded-lg bg-violet-50 p-3 text-xs text-violet-800"><Clock3 size={16}/> Payroll is calculated in UTC after the month closes and processed automatically on your next workplace visit.</p>
            </Box>
          </div>}

          {tab === "tasks" && <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
            <Box className="self-start"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Assigned tickets</h2><span className="text-xs text-slate-500">Latest {tasks.length}</span></div>
              <div className="mt-5 max-h-[700px] space-y-2 overflow-auto">
                {tasks.map((task) => <button key={task.id} onClick={() => openTicket(task)} className={`w-full rounded-xl border p-4 text-left transition ${task.id === activeId ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}>
                  <p className="text-sm font-bold">{task.skill_lab_task_templates?.title}</p><p className="mt-1 text-xs text-slate-500">{dateLabel(task.assigned_for)} · {task.skill_lab_task_templates?.difficulty}</p><div className="mt-3"><Status value={task.status}/></div>
                </button>)}
                {!tasks.length && <p className="text-sm text-slate-500">Your work queue is empty. The administrator may need to add task templates.</p>}
              </div>
            </Box>
            {active ? <Box><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Case study · {active.skill_lab_task_templates?.category}</p><Status value={active.status}/></div>
              <h2 className="mt-3 text-2xl font-bold">{active.skill_lab_task_templates?.title}</h2><div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><Clock3 size={15}/> Deadline: {dateLabel(active.due_at)}</div>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">{active.skill_lab_task_templates?.brief}</p>
              <div className="mt-6"><p className="flex items-center gap-2 text-sm font-bold"><FileText size={16}/> Evidence: simulated event logs</p>
                <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200">{JSON.stringify(active.skill_lab_task_templates?.sample_logs || [], null, 2)}</pre>
              </div>
              <p className="mt-5 text-sm text-slate-600"><strong className="text-slate-900">Deliverable:</strong> {active.skill_lab_task_templates?.expected_output}</p>
              <label className="mt-6 block text-sm font-bold" htmlFor="workplace-spl">Splunk SPL query</label>
              <textarea id="workplace-spl" spellCheck={false} rows={5} value={splQuery} disabled={active.status === "completed"} onChange={(e)=>setSplQuery(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-200 focus:border-violet-500 focus:outline-none disabled:opacity-70" placeholder="index=training | stats count by ..."/>
              <label className="mt-5 block text-sm font-bold" htmlFor="workplace-report">Investigation report and recommended action</label>
              <textarea id="workplace-report" rows={6} value={report} disabled={active.status === "completed"} onChange={(e)=>setReport(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-sm leading-6 focus:border-violet-500 focus:outline-none disabled:bg-slate-50" placeholder="What did you find in the evidence? Which users or hosts are impacted? What action would you recommend?"/>
              {active.feedback && <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4"><p className="font-bold text-violet-900">Automated review · {active.score}/100</p><p className="mt-2 text-sm text-violet-900">{active.feedback.summary}</p><p className="mt-1 text-xs text-violet-700">Search checks: {active.feedback.queryChecks} · Report checks: {active.feedback.reportChecks}</p><p className="mt-2 text-xs text-violet-700">{active.feedback.writingTip}</p></div>}
              {active.status !== "completed" && <button disabled={saving || !splQuery.trim() || !report.trim() || Date.parse(active.due_at) < Date.now()} onClick={submitTask}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-sm font-bold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16}/>{saving ? "Reviewing..." : "Submit for review"}</button>}
              <p className="mt-3 text-xs text-slate-500">Reviews check the written query and report against a training rubric. Queries are not executed against a live Splunk instance.</p>
            </Box> : <Box className="self-start text-center"><Code2 size={36} className="mx-auto text-violet-600"/><h2 className="mt-3 text-xl font-bold">Choose a ticket</h2><p className="mt-2 text-sm text-slate-500">Select a task on the left to review simulated logs, write SPL, and submit your investigation report.</p></Box>}
          </div>}

          {tab === "payroll" && <Box className="mt-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Wallet & monthly payroll</p><h2 className="mt-2 text-2xl font-bold">Virtual payslips</h2></div><Wallet size={30} className="text-violet-600"/></div>
            <div className="mt-5 rounded-xl bg-violet-50 p-5"><p className="text-sm text-violet-700">Total balance</p><p className="mt-1 text-3xl font-bold text-violet-950">{credits(data.wallet?.balance)}</p><p className="mt-2 text-xs text-violet-700">Training credits only — not transferable, withdrawable, or redeemable for money.</p></div>
            <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-3">Pay month</th><th className="px-3 py-3">Completed tickets</th><th className="px-3 py-3">Credits paid</th><th className="px-3 py-3">Processed</th></tr></thead><tbody>
              {(data.payroll || []).map((row) => <tr key={row.id} className="border-b border-slate-100"><td className="px-3 py-4 font-semibold">{dateLabel(row.pay_month)}</td><td className="px-3 py-4">{row.tasks_completed}</td><td className="px-3 py-4 font-semibold text-violet-800">{credits(row.credits_paid)}</td><td className="px-3 py-4">{dateLabel(row.paid_at)}</td></tr>)}
              {!data.payroll?.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">Your first virtual payslip will appear after the current month closes.</td></tr>}
            </tbody></table></div>
          </Box>}
        </>}
      </main>
      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs text-slate-500">T.O. SkillLab · Learning experience only · No actual employment or payment</footer>
    </div>
  );
}
