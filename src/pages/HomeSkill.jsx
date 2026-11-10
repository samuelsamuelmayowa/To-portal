import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Calculator,
  Coins,
  Database,
  LockKeyhole,
  TrendingUp,
  BarChart3,
  Sparkles,
  Code2,
  FileCheck2,
  LogIn,
  RotateCcw,
  ServerCog,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { useStateContext } from "../context/ContextProvider";
import { cookieAuthApi } from "../lib/cookieAuth";

// T.O. SkillLab — career salary and growth update.
// Existing assessment API endpoints, payloads, response fields, and auth flow are preserved.
// Salary benchmarks are illustrative UI planning values, not live market data or real wages.
const API = import.meta.env.VITE_BACKEND_API;

const FALLBACK_ROLES = [
  {
    id: "analyst",
    title: "Splunk Analyst",
    description: "Search, investigate, report, and turn machine data into operational insight.",
  },
  {
    id: "soc",
    title: "SOC Analyst",
    description: "Triage alerts, investigate threats, and communicate incidents using Splunk ES.",
  },
  {
    id: "engineer",
    title: "Splunk Engineer",
    description: "Design ingestion, maintain deployments, optimize searches, and scale the platform.",
  },
];

const LEVELS = [
  { id: "entry", name: "Entry level", years: "0–2 years", detail: "Guided fundamentals" },
  { id: "mid", name: "Intermediate", years: "2–5 years", detail: "Applied scenarios" },
  { id: "senior", name: "Senior", years: "5+ years", detail: "Advanced decisions" },
];


// UI-only illustrative benchmarks supplied by the project owner. Do not use for payroll,
// employment offers, or balances: authoritative awards always come from the backend.
const CAREER_SALARIES = {
  analyst: { title: "Splunk Analyst", annualUSD: 76273, credits: { entry: 4000, mid: 6000, senior: 9000 } },
  soc: { title: "SOC Analyst", annualUSD: 106862, credits: { entry: 4500, mid: 7000, senior: 10000 } },
  splunk_admin: { title: "Splunk Administrator", annualUSD: 94914, credits: { entry: 4500, mid: 7000, senior: 10000 } },
  engineer: { title: "Splunk Engineer", annualUSD: 124920, credits: { entry: 5500, mid: 8500, senior: 12000 } },
  cyber: { title: "Cybersecurity Analyst", annualUSD: 129180, credits: { entry: 5000, mid: 8000, senior: 12000 } },
  backend: { title: "Backend Developer", annualUSD: 136567, credits: { entry: 5500, mid: 8500, senior: 12000 } },
  accountant: { title: "Accountant", annualUSD: 83680, credits: { entry: 3500, mid: 5500, senior: 8500 } },
  financial: { title: "Financial Analyst", annualUSD: 103570, credits: { entry: 4500, mid: 7000, senior: 10500 } },
  trading: { title: "Trading Analyst", annualUSD: 78660, credits: { entry: 4000, mid: 6500, senior: 10000 } },
};

// These future roles are display-only until interviews and role IDs exist in the backend.
const FUTURE_TRACKS = [
  { id: "splunk_admin", title: "Splunk Administrator", description: "Manage Splunk deployments, users, data inputs, and search performance.", icon: ServerCog },
  { id: "cyber", title: "Cybersecurity Analyst", description: "Investigate security alerts, assess exposure, and report on risk.", icon: ShieldCheck },
  { id: "backend", title: "Backend Developer", description: "Build APIs, manage databases, debug services, and design reliable systems.", icon: Database },
  { id: "accountant", title: "Accounting", description: "Practice bookkeeping, reconciliation, financial reporting, and controls.", icon: Calculator },
  { id: "financial", title: "Financial Analyst", description: "Work with financial models, budgets, forecasting, and performance reports.", icon: BarChart3 },
  { id: "trading", title: "Trading Analyst", description: "Practice market research, simulated portfolio reporting, and risk analysis.", icon: TrendingUp },
];

const GROWTH_SKILLS = {
  entry: "Guided tasks, core tools, and accurate documentation",
  mid: "Independent investigations, reliable delivery, and collaboration",
  senior: "Complex decisions, advanced problem-solving, and mentorship",
};

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const formatUSD = (amount) => USD.format(amount);

// Resolve salary metadata without changing the IDs sent to the existing backend.
function salaryKeyForRole(item) {
  const value = [item?.slug, item?.id, item?.title, item?.name].filter(Boolean).join(" ").toLowerCase();
  if (/\bsoc\b|security operations center/.test(value)) return "soc";
  if (/splunk engineer|\bengineer\b/.test(value)) return "engineer";
  if (/splunk administrator|splunk admin|\badministrator\b/.test(value)) return "splunk_admin";
  if (/splunk analyst|\banalyst\b/.test(value) && !/cybersecurity|financial|trading/.test(value)) return "analyst";
  if (/cybersecurity/.test(value)) return "cyber";
  if (/backend/.test(value)) return "backend";
  if (/account/.test(value)) return "accountant";
  if (/financial/.test(value)) return "financial";
  if (/trading/.test(value)) return "trading";
  return null;
}

const ACTIVE_SALARY_KEYS = new Set(["analyst", "soc", "engineer"]);

const STAGES = [
  { title: "Technical interview", detail: "Role-specific, timed questions", icon: ClipboardCheck },
  { title: "Practical scenarios", detail: "Evidence-based workplace situations", icon: Code2 },
  { title: "Readiness report", detail: "Score breakdown and answer review", icon: FileCheck2 },
];

const CURRENCY = { format: (amount) => `${Number(amount || 0).toLocaleString("en-US")} TO Credits` };

const cx = (...parts) => parts.filter(Boolean).join(" ");

const roleId = (item) => item?.slug || item?.id;

const authHeaders = () => ({});

function roleIcon(id) {
  const value = typeof id === "string" ? { id } : id;
  const key = salaryKeyForRole(value);
  if (key === "soc") return ShieldCheck;
  if (key === "engineer") return ServerCog;
  return TerminalSquare;
}

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(value || 0));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function getQuestionSeconds(question, expiresAt) {
  const limit = Number(question?.timeLimitSeconds) || 75;
  const deadline = expiresAt ? Date.parse(expiresAt) : NaN;
  if (!Number.isFinite(deadline)) return limit;
  return Math.max(0, Math.min(limit, Math.ceil((deadline - Date.now()) / 1000)));
}

function Label({ children, dark = false }) {
  return (
    <p className={cx("text-[11px] font-bold uppercase tracking-[0.16em]", dark ? "text-fuchsia-300" : "text-violet-700")}>
      {children}
    </p>
  );
}

function BrandMark({ compact = false }) {
  // Put the real image at public/logo.png or set VITE_TO_ANALYTICS_LOGO to its public URL.
  // If missing, retain the existing branded TO monogram instead of a broken image.
  const [broken, setBroken] = useState(false);
  const src = import.meta.env.VITE_TO_ANALYTICS_LOGO || "/logo.png";
  return (
    <span className={cx("grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-violet-700 text-sm font-extrabold text-white", compact ? "h-9 w-9" : "h-10 w-10")}>
      {broken ? "TO" : <img src={src} alt="T.O. Analytics logo" className="h-full w-full object-contain bg-white p-1" onError={() => setBroken(true)} />}
    </span>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1344px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label="T.O. Analytics home">
          <BrandMark />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold tracking-tight text-slate-950">T.O. Analytics</span>
            <span className="block text-xs text-slate-500">Skill Lab · Career simulation</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
            Training environment
          </span>
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 sm:px-4 sm:text-sm">
            <ArrowLeft size={15} aria-hidden="true" /> Back to site
          </Link>
        </div>
      </div>
    </header>
  );
}

function StageRail({ step }) {
  const names = ["Interview", "Practical", "Results"];
  return (
    <nav className="grid grid-cols-3 gap-2" aria-label="Assessment progress">
      {names.map((name, index) => (
        <div key={name} aria-current={index === step ? "step" : undefined}>
          <div className={cx("h-1 rounded-full", index <= step ? "bg-violet-600" : "bg-slate-200")} />
          <span className={cx("mt-2 block text-[11px] font-semibold sm:text-xs", index <= step ? "text-slate-900" : "text-slate-400")}>
            {String(index + 1).padStart(2, "0")} · {name}
          </span>
        </div>
      ))}
    </nav>
  );
}

function AlertMessage({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-800">
      <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      {children}
    </div>
  );
}


function SalaryDetail({ label, value, primary = false }) {
  return (
    <div className={cx("min-w-0 rounded-lg border px-3 py-2.5", primary ? "border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50" : "border-slate-200 bg-slate-50/80")}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cx("mt-1 text-sm font-extrabold tabular-nums", primary ? "text-violet-800" : "text-slate-800")}>{value}</p>
    </div>
  );
}

function ActiveRoleCard({ item, selected, level, onSelect }) {
  const key = salaryKeyForRole(item);
  const salary = CAREER_SALARIES[key];
  const Icon = roleIcon(item);
  const levelName = LEVELS.find((entry) => entry.id === level)?.name || "Entry level";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cx("flex h-full min-w-0 flex-col rounded-2xl border p-4 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:p-5", selected ? "border-violet-600 bg-violet-50/50 ring-1 ring-violet-600" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md")}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-xl", selected ? "bg-gradient-to-br from-fuchsia-600 to-violet-700 text-white" : "bg-violet-50 text-violet-700")}><Icon size={21} /></span>
        <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border", selected ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 text-transparent")}><Check size={12} /></span>
      </div>
      <span className="mt-4 block font-bold text-slate-950">{item.title}</span>
      <span className="mt-1 block min-h-[52px] text-xs leading-5 text-slate-600">{item.description}</span>
      {salary && (
        <div className="mt-4 grid w-full gap-2 border-t border-slate-200/90 pt-4">
          <SalaryDetail label="Estimated U.S. annual salary" value={`${formatUSD(salary.annualUSD)}/year`} />
          <SalaryDetail label="T.O. SkillLab virtual salary" value={`${CURRENCY.format(salary.credits[level])}/month`} primary />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-semibold">
            <span className="rounded-full bg-white px-2.5 py-1 text-violet-800 ring-1 ring-violet-200">{levelName}</span>
            <span className="inline-flex items-center gap-1 text-fuchsia-700">Career Growth <TrendingUp size={13} /></span>
          </div>
        </div>
      )}
    </button>
  );
}

function FutureRoleCard({ item, level }) {
  const salary = CAREER_SALARIES[item.id];
  const levelName = LEVELS.find((entry) => entry.id === level)?.name || "Entry level";
  const Icon = item.icon;
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-200/70 text-slate-600"><Icon size={21} /></span>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600"><LockKeyhole size={11} /> Coming soon</span>
      </div>
      <h4 className="mt-4 font-bold text-slate-800">{item.title}</h4>
      {item.id === "accountant" && <p className="mt-0.5 text-[11px] font-semibold text-violet-700">Accountant career track</p>}
      <p className="mt-1 min-h-[52px] text-xs leading-5 text-slate-500">{item.description}</p>
      <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4">
        <SalaryDetail label="Estimated U.S. annual salary" value={`${formatUSD(salary.annualUSD)}/year`} />
        <SalaryDetail label="Planned virtual monthly salary" value={`${CURRENCY.format(salary.credits[level])}/month`} primary />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-semibold text-slate-500">
          <span className="rounded-full bg-white px-2.5 py-1 text-violet-800 ring-1 ring-violet-200">{levelName}</span>
          <span className="inline-flex items-center gap-1">Career Growth <TrendingUp size={13} /></span>
        </div>
      </div>
    </article>
  );
}

function SalaryPreview({ role, level }) {
  const key = salaryKeyForRole(role);
  const salary = CAREER_SALARIES[key];
  if (!salary) return null;
  const levelName = LEVELS.find((item) => item.id === level)?.name || "Entry level";
  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-950 via-[#281446] to-fuchsia-950 p-5 text-white shadow-sm sm:p-7" aria-label="Interactive virtual salary preview" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-fuchsia-300">Selected career & salary preview</p><h3 className="mt-2 text-xl font-bold">{role?.title} <span className="text-violet-300">/ {levelName}</span></h3></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-violet-100"><Coins size={15} /> Learning currency</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200">Illustrative U.S. annual benchmark</p><p className="mt-2 text-2xl font-bold tabular-nums">{formatUSD(salary.annualUSD)}<span className="text-sm font-normal text-violet-200">/year</span></p></div>
        <div className="rounded-xl border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/25 to-violet-500/25 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-fuchsia-100">T.O. SkillLab virtual salary</p><p className="mt-2 text-2xl font-extrabold tabular-nums">{Number(salary.credits[level]).toLocaleString("en-US")} <span className="text-sm font-bold text-fuchsia-100">TO Credits/month</span></p></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Career stage progression">
        {LEVELS.map((item, index) => (
          <span key={item.id} className="inline-flex items-center gap-2">
            <span className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", item.id === level ? "bg-fuchsia-400 text-slate-950" : "border border-white/20 bg-white/10 text-violet-100")}>{index + 1}. {item.name}</span>
            {index < LEVELS.length - 1 && <ArrowRight size={13} className="text-violet-300" aria-hidden="true" />}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-violet-200">Illustrative salaries for career exploration, not verified live compensation data. TO Credits are fictional, cannot be withdrawn, and have no cash value. Actual simulated awards come from your account's backend records.</p>
    </section>
  );
}

function CareerGrowth({ role, level }) {
  const key = salaryKeyForRole(role);
  const salary = CAREER_SALARIES[key];
  if (!salary) return null;
  const roleName = role?.title || salary.title;
  return (
    <section className="mx-auto max-w-[1344px] px-4 pb-14 sm:px-6 lg:px-10 lg:pb-20" aria-labelledby="career-growth-title">
      <Label>Career progression</Label>
      <h2 id="career-growth-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your Career. <span className="text-violet-700">Your Growth.</span></h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">Explore realistic career pathways, practice real workplace responsibilities, and advance through the T.O. SkillLab virtual employment experience.</p>
      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {LEVELS.map((item, index) => (
          <article key={item.id} className={cx("rounded-2xl border bg-white p-5 shadow-sm sm:p-6", item.id === level ? "border-violet-500 ring-1 ring-violet-400" : "border-slate-200")}>
            <div className="flex items-center justify-between gap-3"><span className={cx("grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold", item.id === level ? "bg-violet-700 text-white" : "bg-violet-50 text-violet-700")}>0{index + 1}</span>{item.id === level && <span className="rounded-full bg-fuchsia-50 px-2 py-1 text-[10px] font-bold text-fuchsia-800">Selected stage</span>}</div>
            <h3 className="mt-5 text-base font-bold text-slate-900">{item.id === "entry" ? "Junior" : item.id === "mid" ? "Mid-level" : "Senior"} {roleName}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{item.years}</p>
            <p className="mt-5 text-2xl font-extrabold text-violet-800 tabular-nums">{Number(salary.credits[item.id]).toLocaleString("en-US")}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">TO Credits/month · virtual</p>
            <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-semibold text-slate-900">Skills & expectations</p><p className="mt-1 text-sm leading-6 text-slate-600">{GROWTH_SKILLS[item.id]}.</p></div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-fuchsia-700"><TrendingUp size={15} /> {index < LEVELS.length - 1 ? "Progress through demonstrated skill" : "Leadership & advanced ownership"}</div>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Career stages and credit amounts are illustrative previews; progression is not automatic and depends on implemented simulation rules.</p>
    </section>
  );
}

function CreditsExplainer() {
  return (
    <section className="border-t border-violet-100 bg-white py-14 lg:py-20" aria-labelledby="credits-section-title">
      <div className="mx-auto grid max-w-[1344px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
        <div>
          <Label>TO Credits · virtual economy</Label>
          <h2 id="credits-section-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Earn. Learn. <span className="text-violet-700">Advance.</span></h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">TO Credits represent fictional earnings in your simulated workplace. As T.O. SkillLab grows, optional learning features may include advanced interview sessions, practical labs, AI coaching, and career reports.</p>
          <p className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-xs leading-6 text-violet-900"><strong>Important:</strong> TO Credits are not money, have no cash value, and cannot be withdrawn or exchanged for real currency. Learning-feature redemptions are proposals, not confirmed available functionality.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: BriefcaseBusiness, title: "Simulated earnings", detail: "Learn how workplace performance and a fictional payslip could work." },
            { icon: BookOpen, title: "Advanced sessions", detail: "Proposed practice interviews and specialized learning tracks." },
            { icon: Code2, title: "Practical labs", detail: "Planned hands-on workplace exercises and scenarios." },
            { icon: Sparkles, title: "AI coaching & reports", detail: "Potential future feedback and development insights." },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-[#faf9ff] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon size={19} /></span><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-600">{detail}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeSkill() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useStateContext();

  const [screen, setScreen] = useState("welcome");
  const [role, setRole] = useState("analyst");
  const [level, setLevel] = useState("entry");
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const [attemptId, setAttemptId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [labAnswers, setLabAnswers] = useState({});
  const [seconds, setSeconds] = useState(75);
  const [result, setResult] = useState(null);
  const [employment, setEmployment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = useMemo(
    () => roles.find((item) => roleId(item) === role) || roles[0],
    [roles, role],
  );
  const selectedLevel = LEVELS.find((item) => item.id === level) || LEVELS[0];
  const question = questions[current];

  useEffect(() => {
    if (!token) return;
    cookieAuthApi.get(`${API}/api/skill-lab/profile`, { headers: authHeaders() })
      .then(({ data }) => setEmployment(data.employment || null))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    cookieAuthApi
      .get(`${API}/api/skill-lab/roles`, { headers: authHeaders() })
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data?.roles) || !data.roles.length) return;
        const active = data.roles.filter((item) => ACTIVE_SALARY_KEYS.has(salaryKeyForRole(item)));
        if (!active.length) return;
        setRoles(active);
        setRole((previous) => active.some((item) => roleId(item) === previous) ? previous : roleId(active[0]));
      })
      .catch(() => {
        // Keep the visible fallback roles if the optional roles endpoint is unavailable.
      });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (screen !== "interview" || !questions.length) return undefined;
    if (seconds <= 0) {
      if (current < questions.length - 1) {
        const next = current + 1;
        setCurrent(next);
        setSeconds(getQuestionSeconds(questions[next], expiresAt));
      } else {
        setScreen("lab");
      }
      return undefined;
    }
    const timer = window.setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, seconds, current, questions, expiresAt]);

  const begin = async () => {
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await cookieAuthApi.post(
        `${API}/api/skill-lab/interviews/start`,
        { role, level },
        { headers: authHeaders() },
      );
      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];
      const nextLabs = Array.isArray(data.labs) ? data.labs : [];
      setAttemptId(data.attemptId);
      setExpiresAt(data.expiresAt);
      setQuestions(nextQuestions);
      setLabs(nextLabs);
      setAnswers({});
      setLabAnswers({});
      setCurrent(0);
      setSeconds(getQuestionSeconds(nextQuestions[0], data.expiresAt));
      setResult(null);
      setScreen(nextQuestions.length ? "interview" : "lab");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      setError(requestError.response?.data?.message || "Unable to start the assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      const next = current + 1;
      setCurrent(next);
      setSeconds(getQuestionSeconds(questions[next], expiresAt));
    } else {
      setScreen("lab");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!attemptId) {
      setError("No active assessment found. Please start a new attempt.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await cookieAuthApi.post(
        `${API}/api/skill-lab/interviews/${attemptId}/submit`,
        { answers, labAnswers },
        { headers: authHeaders() },
      );
      setResult({ ...data, role, level });
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      setError(requestError.response?.data?.message || "Unable to submit the assessment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7fb] font-sans text-slate-900 selection:bg-violet-100">
      <AppHeader />

      {screen === "welcome" && (
        <main>
          <section className="bg-[radial-gradient(ellipse_at_top_right,_#302047_0%,_#181126_57%,_#120f1e_100%)] text-white">
            <div className="mx-auto grid max-w-[1344px] gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:px-10 lg:py-24">
              <div>
                <Label dark>Career readiness platform</Label>
                <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.09] tracking-[-0.045em] sm:text-5xl xl:text-[62px]">
                  Prepare for the work.<br />Prove what you know.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                  Practice role-specific Splunk interviews and workplace scenarios in a structured assessment environment. Review your answers and identify where to improve.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link to={token ? "/toskillab/workplace" : "/login"} state={token ? undefined : { from: "/toskillab/workplace" }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/50 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
                    {employment ? "Enter workplace" : token ? "Workspace access" : "Login to workspace"} <BriefcaseBusiness size={17} />
                  </Link>
                  <a href="#configure-assessment" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-fuchsia-400">
                    Configure assessment <ArrowRight size={17} aria-hidden="true" />
                  </a>
                  <a href="#assessment-process" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5">
                    How it works <ChevronRight size={16} aria-hidden="true" />
                  </a>
                </div>
                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium text-slate-400 sm:text-sm">
                  <span className="flex items-center gap-2"><Check size={15} className="text-fuchsia-400" /> Role-specific questions</span>
                  <span className="flex items-center gap-2"><Check size={15} className="text-fuchsia-400" /> Practical scenarios</span>
                  <span className="flex items-center gap-2"><Check size={15} className="text-fuchsia-400" /> Answer review</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#231a35] shadow-[0_30px_80px_rgba(0,0,0,.22)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2.5 text-sm font-semibold"><TerminalSquare size={18} className="text-fuchsia-400" /> Assessment workspace</div>
                  <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview</span>
                </div>
                <div className="space-y-6 p-5 sm:p-7">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Selected track</span>
                      <p className="mt-2 text-sm font-semibold">{selectedRole?.title}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Experience level</span>
                      <p className="mt-2 text-sm font-semibold">{selectedLevel.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Assessment flow</p>
                    <div className="space-y-0">
                      {STAGES.map(({ title, detail, icon: Icon }, index) => (
                        <div key={title} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-fuchsia-300"><Icon size={18} /></span>
                            {index < STAGES.length - 1 && <span className="my-1 h-7 w-px bg-white/10" />}
                          </div>
                          <div className="pt-1.5">
                            <p className="text-sm font-semibold">{title}</p>
                            <p className="mt-1 text-xs text-slate-400">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-3 text-xs leading-5 text-slate-300">
                    This is an educational simulation. It does not constitute a real employment interview or job offer.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="configure-assessment" className="mx-auto max-w-[1344px] scroll-mt-24 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
            <div className="mb-8 max-w-2xl">
              <Label>Assessment setup</Label>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Build your practice session</h2>
              <p className="mt-3 leading-7 text-slate-600">Choose the position and experience level you want to practice. Your selections determine the assessment content.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_48px_rgba(15,23,42,.04)]">
              <div className="border-b border-slate-200 p-5 sm:p-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">01 / Select a role</h3>
                  <span className="hidden text-xs text-slate-500 sm:block">Choose one specialization</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {roles.map((item) => (
                    <ActiveRoleCard key={roleId(item)} item={item} selected={role === roleId(item)} level={level} onSelect={() => setRole(roleId(item))} />
                  ))}
                </div>
                <div className="mt-9 border-t border-slate-100 pt-7">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div><h4 className="text-base font-bold text-slate-900">Future Career Tracks</h4><p className="mt-1 text-sm text-slate-500">Explore what is coming next. These roles are not open for interviews yet.</p></div>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">6 coming soon</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {FUTURE_TRACKS.map((item) => <FutureRoleCard key={item.id} item={item} level={level} />)}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <h3 className="mb-5 text-lg font-semibold">02 / Select experience level</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {LEVELS.map((item) => {
                    const selected = level === item.id;
                    return (
                      <button type="button" key={item.id} onClick={() => setLevel(item.id)} aria-pressed={selected}
                        className={cx("flex min-h-[112px] items-start justify-between gap-3 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600", selected ? "border-violet-600 bg-violet-50/50 ring-1 ring-violet-600" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50")}>
                        <span><b className="block text-sm">{item.name}</b><span className="mt-1 block text-xs font-semibold text-violet-800">{item.years}</span><span className="mt-2 block text-xs text-slate-500">{item.detail}</span></span>
                        <span className={cx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border", selected ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 text-transparent")}><Check size={12} /></span>
                      </button>
                    );
                  })}
                </div>

                <SalaryPreview role={selectedRole} level={level} />

                {error && <div className="mt-6"><AlertMessage>{error}</AlertMessage></div>}

                <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ready to begin</span>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedRole?.title} <span className="text-slate-400">/</span> {selectedLevel.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Sign-in required. Assessment results are submitted to your existing backend.</p>
                  </div>
                  <button type="button" onClick={begin} disabled={loading} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50 sm:w-auto">
                    {loading ? "Preparing assessment…" : token ? "Start assessment" : "Sign in to start"}
                    {token ? <ArrowRight size={17} /> : <LogIn size={17} />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <CareerGrowth role={selectedRole} level={level} />

          <CreditsExplainer />

          <section id="assessment-process" className="border-t border-slate-200 bg-white py-14 lg:py-20">
            <div className="mx-auto max-w-[1344px] px-4 sm:px-6 lg:px-10">
              <Label>How it works</Label>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">A clear, three-stage process</h2>
              <div className="mt-9 grid gap-4 md:grid-cols-3">
                {STAGES.map(({ title, detail, icon: Icon }, index) => (
                  <div key={title} className="rounded-xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between"><Icon size={22} className="text-violet-800" /><span className="text-xs font-semibold text-slate-400">0{index + 1}</span></div>
                    <h3 className="mt-7 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{detail}.</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
                <div><h3 className="text-base font-bold text-slate-900">From interview preparation to virtual employment</h3><p className="mt-1 text-sm leading-6 text-slate-600">Complete the assessment, review your score, and — if eligible — receive a simulated offer. An accepted offer can lead to the role-based workplace when your backend grants access.</p></div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-800">
                  <span className="rounded-lg bg-white px-3 py-2">Interview</span><ArrowRight size={14}/>
                  <span className="rounded-lg bg-white px-3 py-2">Result</span><ArrowRight size={14}/>
                  <span className="rounded-lg bg-white px-3 py-2">Virtual offer</span><ArrowRight size={14}/>
                  <span className="rounded-lg bg-white px-3 py-2">Workspace</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {screen === "interview" && (
        <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <StageRail step={0} />
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div><Label>Stage 01 · Technical interview</Label><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{selectedRole?.title}</h1><p className="mt-2 text-sm text-slate-500">{selectedLevel.name} · Timed practice assessment</p></div>
            <div className={cx("flex items-center gap-3 rounded-xl border bg-white px-5 py-3", seconds <= 15 ? "border-rose-300 text-rose-700" : "border-slate-200 text-slate-900")} aria-live="off">
              <Clock3 size={20} aria-hidden="true" /><span className="font-mono text-xl font-semibold tabular-nums">{formatTime(seconds)}</span>
            </div>
          </div>
          <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1 bg-slate-100"><div className="h-full bg-violet-600 transition-[width]" style={{ width: questions.length ? `${((current + 1) / questions.length) * 100}%` : "0%" }} /></div>
              {question ? (
                <div className="p-6 sm:p-9">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="rounded-md bg-violet-50 px-3 py-1.5 font-semibold text-violet-800">{question.category || "Technical knowledge"}</span>
                    <span className="font-semibold text-slate-500">Question {current + 1} / {questions.length}</span>
                  </div>
                  <h2 className="mt-8 max-w-3xl text-xl font-semibold leading-8 tracking-tight sm:text-2xl">{question.prompt}</h2>
                  <p className="mt-3 text-sm text-slate-500">Select the most appropriate answer.</p>
                  <div className="mt-7 space-y-3">
                    {(question.options || []).map((option, index) => {
                      const selected = answers[question.id] === index;
                      return (
                        <button type="button" key={`${index}-${option}`} onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: index }))} aria-pressed={selected}
                          className={cx("flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:px-5", selected ? "border-violet-600 bg-violet-50/60 ring-1 ring-violet-600" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50")}>
                          <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold", selected ? "bg-violet-800 text-white" : "bg-slate-100 text-slate-600")}>{String.fromCharCode(65 + index)}</span>
                          <span className="pt-0.5">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-9 flex justify-end border-t border-slate-100 pt-6">
                    <button type="button" onClick={nextQuestion} disabled={answers[question.id] === undefined} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                      {current === questions.length - 1 ? "Continue to practical" : "Next question"}<ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8"><p className="text-sm text-slate-600">No interview questions were provided for this attempt.</p><button onClick={() => setScreen("lab")} className="mt-5 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Continue to practical</button></div>
              )}
            </section>
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><Label>Current session</Label><p className="mt-4 text-sm font-semibold">{selectedRole?.title}</p><p className="mt-1 text-sm text-slate-500">{selectedLevel.name}</p><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Interview progress</p><p className="mt-1 text-2xl font-semibold tabular-nums">{questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0}%</p></div></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-3"><BookOpen className="shrink-0 text-violet-800" size={19} /><p className="text-sm leading-6 text-slate-600">Your assessment moves to practical scenarios after the technical interview.</p></div></div>
            </aside>
          </div>
        </main>
      )}

      {screen === "lab" && (
        <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <StageRail step={1} />
          <div className="mt-10"><Label>Stage 02 · Practical assessment</Label><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Apply your judgment</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Review the evidence presented in each scenario and select the strongest response.</p></div>
          <div className="mt-8 space-y-5">
            {labs.map((lab, labIndex) => (
              <section key={lab.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3"><Label>Scenario {String(labIndex + 1).padStart(2, "0")}</Label><span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{lab.category || "Practical"}</span></div>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">{lab.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{lab.brief}</p>
                  {lab.code && <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-700 bg-[#191325] p-5 font-mono text-xs leading-7 text-violet-200 sm:text-sm"><code>{lab.code}</code></pre>}
                </div>
                <div className="grid gap-3 p-6 sm:p-8">
                  {(lab.options || []).map((option, index) => {
                    const selected = labAnswers[lab.id] === index;
                    return (
                      <button type="button" key={`${index}-${option}`} onClick={() => setLabAnswers((previous) => ({ ...previous, [lab.id]: index }))} aria-pressed={selected}
                        className={cx("flex w-full items-start gap-4 rounded-xl border p-4 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600", selected ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50")}>
                        <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold", selected ? "bg-violet-800 text-white" : "bg-slate-100 text-slate-600")}>{String.fromCharCode(65 + index)}</span>
                        <span className="pt-0.5">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          {error && <div className="mt-5"><AlertMessage>{error}</AlertMessage></div>}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div><p className="font-semibold">Ready to submit?</p><p className="mt-1 text-sm text-slate-500">Review all scenario answers before submitting your assessment.</p></div>
            <button type="button" onClick={submit} disabled={loading || labs.some((lab) => labAnswers[lab.id] === undefined)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
              {loading ? "Submitting assessment…" : "Submit assessment"}<ArrowRight size={17} />
            </button>
          </div>
        </main>
      )}

      {screen === "result" && result && (
        <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
          <StageRail step={2} />
          <section className="mt-10 overflow-hidden rounded-2xl bg-[#181126] p-6 text-white sm:p-10">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
              <div><Label dark>Assessment complete</Label><h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{result.outcome || "Readiness report"}</h1><p className="mt-3 max-w-xl leading-7 text-slate-300">Review your assessment performance and use the feedback to plan your next practice session.</p></div>
              <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-[9px] border-violet-500/80 bg-white/5 text-center"><span className="text-4xl font-semibold tabular-nums">{result.score ?? "—"}</span><span className="mt-1 text-xs text-slate-300">out of 100</span></div>
            </div>
          </section>
          {result.jobOffer ? (
            <section className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:p-8">
              <Label>Virtual career milestone</Label><h2 className="mt-3 text-2xl font-semibold tracking-tight">Simulated job offer unlocked</h2>
              <p className="mt-3 leading-7 text-slate-700">{result.jobOffer.company} has offered you a simulated <strong>{result.jobOffer.job_level}</strong> role with <strong>{CURRENCY.format(result.jobOffer.virtual_salary || 0)} / month</strong> in virtual salary.</p>
              <Link to="/toskillab/workplace" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white hover:bg-violet-800">Accept offer & enter workplace <ArrowRight size={16}/></Link>
              <p className="mt-3 text-xs leading-5 text-slate-600">For training only. This is not real employment or a cash payment.</p>
            </section>
          ) : (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Keep developing your skills</h2><p className="mt-2 text-sm leading-6 text-slate-600">At least 4 correct interview answers out of 10 are required to unlock the simulated job offer.</p></section>
          )}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"><h2 className="text-lg font-semibold">Assessment evidence</h2><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-5"><p className="text-2xl font-semibold tabular-nums">{result.interviewCorrect ?? "—"}/{result.interviewTotal ?? "—"}</p><p className="mt-2 text-xs text-slate-600">Interview answers</p></div><div className="rounded-xl bg-slate-50 p-5"><p className="text-2xl font-semibold tabular-nums">{result.labCorrect ?? "—"}/{result.labTotal ?? "—"}</p><p className="mt-2 text-xs text-slate-600">Practical scenarios</p></div></div></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"><h2 className="text-lg font-semibold">Skill breakdown</h2><div className="mt-5 space-y-5">{result.categoryScores?.length ? result.categoryScores.map((item, index) => { const score = Math.max(0, Math.min(100, Number(item.score) || 0)); return <div key={`${item.category}-${index}`}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><b className="font-semibold">{item.category}</b><span className="font-semibold tabular-nums text-slate-600">{score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${score}%` }} /></div></div>; }) : <p className="text-sm text-slate-500">No category breakdown is available for this attempt.</p>}</div></section>
          </div>
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">Answer review</h2><p className="mt-1 text-sm text-slate-500">Expand a question to read the expected response and explanation.</p></div><button type="button" onClick={() => { setScreen("welcome"); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"><RotateCcw size={16} /> New practice session</button></div>
            <div className="mt-6 space-y-3">{result.review?.length ? result.review.map((item, index) => (
              <details key={item.id || index} className="group rounded-xl border border-slate-200 px-4 py-4 sm:px-5">
                <summary className="flex cursor-pointer list-none items-start gap-3 font-semibold leading-6 marker:hidden"><span className={cx("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs", item.correct ? "bg-violet-100 text-violet-800" : "bg-rose-100 text-rose-700")}>{item.correct ? <Check size={14} /> : "×"}</span><span className="flex-1 text-sm">{index + 1}. {item.prompt}</span><ChevronRight size={16} className="mt-1 shrink-0 text-slate-400 transition group-open:rotate-90" /></summary>
                <div className="ml-9 mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600"><p><strong className="text-slate-900">Expected answer:</strong> {item.options?.[item.correctOption] || "Not available"}</p>{item.explanation && <p className="mt-2">{item.explanation}</p>}</div>
              </details>
            )) : <p className="text-sm text-slate-500">No detailed answer review is available for this attempt.</p>}</div>
          </section>
        </main>
      )}

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-[1344px] flex-col items-center justify-center gap-3">
          <BrandMark compact />
          <p className="font-semibold text-slate-800">T.O. Analytics Skill Lab</p>
          <p>Educational career simulation · Your growth. Your skills. Your next opportunity.</p>
          <p>TO Credits are fictional and cannot be exchanged for real money.</p>
        </div>
      </footer>
    </div>
  );
}

// import { useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   ArrowLeft,
//   ArrowRight,
//   BookOpen,
//   BriefcaseBusiness,
//   Check,
//   CheckCircle2,
//   ChevronRight,
//   CircleAlert,
//   ClipboardCheck,
//   Clock3,
//   Code2,
//   FileCheck2,
//   LogIn,
//   RotateCcw,
//   SearchCheck,
//   ServerCog,
//   ShieldCheck,
//   TerminalSquare,
// } from "lucide-react";
// import { useStateContext } from "../context/ContextProvider";

// // Complete drop-in redesign of the HomeSkill / TO Skill Lab page.
// // Existing API endpoints, request bodies, response fields, and auth flow are preserved.
// const API = import.meta.env.VITE_BACKEND_API;

// const FALLBACK_ROLES = [
//   {
//     id: "analyst",
//     title: "Splunk Analyst",
//     description: "Search, investigate, report, and turn machine data into operational insight.",
//   },
//   {
//     id: "soc",
//     title: "SOC Analyst",
//     description: "Triage alerts, investigate threats, and communicate incidents using Splunk ES.",
//   },
//   {
//     id: "engineer",
//     title: "Splunk Engineer",
//     description: "Design ingestion, maintain deployments, optimize searches, and scale the platform.",
//   },
// ];

// const LEVELS = [
//   { id: "entry", name: "Entry level", years: "0–2 years", detail: "Guided fundamentals" },
//   { id: "mid", name: "Intermediate", years: "2–5 years", detail: "Applied scenarios" },
//   { id: "senior", name: "Senior", years: "5+ years", detail: "Advanced decisions" },
// ];

// const STAGES = [
//   { title: "Technical interview", detail: "Role-specific, timed questions", icon: ClipboardCheck },
//   { title: "Practical scenarios", detail: "Evidence-based workplace situations", icon: Code2 },
//   { title: "Readiness report", detail: "Score breakdown and answer review", icon: FileCheck2 },
// ];

// const CURRENCY = { format: (amount) => `${Number(amount || 0).toLocaleString("en-US")} TO Credits` };

// const cx = (...parts) => parts.filter(Boolean).join(" ");

// const roleId = (item) => item?.slug || item?.id;

// function authHeaders() {
//   const accessToken = localStorage.getItem("ACCESS_TOKEN");
//   return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
// }

// function roleIcon(id) {
//   if (id === "soc") return ShieldCheck;
//   if (id === "engineer") return ServerCog;
//   return TerminalSquare;
// }

// function formatTime(value) {
//   const seconds = Math.max(0, Math.floor(value || 0));
//   return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
// }

// function getQuestionSeconds(question, expiresAt) {
//   const limit = Number(question?.timeLimitSeconds) || 75;
//   const deadline = expiresAt ? Date.parse(expiresAt) : NaN;
//   if (!Number.isFinite(deadline)) return limit;
//   return Math.max(0, Math.min(limit, Math.ceil((deadline - Date.now()) / 1000)));
// }

// function Label({ children, dark = false }) {
//   return (
//     <p className={cx("text-[11px] font-bold uppercase tracking-[0.16em]", dark ? "text-fuchsia-300" : "text-violet-700")}>
//       {children}
//     </p>
//   );
// }

// function AppHeader() {
//   return (
//     <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
//       <div className="mx-auto flex h-[72px] w-full max-w-[1344px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
//         <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label="T.O. Analytics home">
//           <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-violet-700 text-sm font-extrabold tracking-tight text-white">
//             TO
//           </span>
//           <span className="min-w-0">
//             <span className="block truncate text-[15px] font-bold tracking-tight text-slate-950">T.O. Analytics</span>
//             <span className="block text-xs text-slate-500">Skill Lab · Career simulation</span>
//           </span>
//         </Link>
//         <div className="flex items-center gap-3">
//           <span className="hidden items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 sm:inline-flex">
//             <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
//             Training environment
//           </span>
//           <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 sm:px-4 sm:text-sm">
//             <ArrowLeft size={15} aria-hidden="true" /> Back to site
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }

// function StageRail({ step }) {
//   const names = ["Interview", "Practical", "Results"];
//   return (
//     <nav className="grid grid-cols-3 gap-2" aria-label="Assessment progress">
//       {names.map((name, index) => (
//         <div key={name} aria-current={index === step ? "step" : undefined}>
//           <div className={cx("h-1 rounded-full", index <= step ? "bg-violet-600" : "bg-slate-200")} />
//           <span className={cx("mt-2 block text-[11px] font-semibold sm:text-xs", index <= step ? "text-slate-900" : "text-slate-400")}>
//             {String(index + 1).padStart(2, "0")} · {name}
//           </span>
//         </div>
//       ))}
//     </nav>
//   );
// }

// function AlertMessage({ children }) {
//   if (!children) return null;
//   return (
//     <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-800">
//       <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
//       {children}
//     </div>
//   );
// }

// export default function HomeSkill() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { token } = useStateContext();

//   const [screen, setScreen] = useState("welcome");
//   const [role, setRole] = useState("analyst");
//   const [level, setLevel] = useState("entry");
//   const [roles, setRoles] = useState(FALLBACK_ROLES);
//   const [attemptId, setAttemptId] = useState(null);
//   const [expiresAt, setExpiresAt] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [labs, setLabs] = useState([]);
//   const [current, setCurrent] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [labAnswers, setLabAnswers] = useState({});
//   const [seconds, setSeconds] = useState(75);
//   const [result, setResult] = useState(null);
//   const [employment, setEmployment] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const selectedRole = useMemo(
//     () => roles.find((item) => roleId(item) === role) || roles[0],
//     [roles, role],
//   );
//   const selectedLevel = LEVELS.find((item) => item.id === level) || LEVELS[0];
//   const question = questions[current];

//   useEffect(() => {
//     if (!token) return;
//     axios.get(`${API}/api/skill-lab/profile`, { headers: authHeaders() })
//       .then(({ data }) => setEmployment(data.employment || null))
//       .catch(() => {});
//   }, [token]);

//   useEffect(() => {
//     if (!token) return;
//     let cancelled = false;
//     axios
//       .get(`${API}/api/skill-lab/roles`, { headers: authHeaders() })
//       .then(({ data }) => {
//         if (cancelled || !Array.isArray(data?.roles) || !data.roles.length) return;
//         setRoles(data.roles);
//       })
//       .catch(() => {
//         // Keep the visible fallback roles if the optional roles endpoint is unavailable.
//       });
//     return () => { cancelled = true; };
//   }, [token]);

//   useEffect(() => {
//     if (screen !== "interview" || !questions.length) return undefined;
//     if (seconds <= 0) {
//       if (current < questions.length - 1) {
//         const next = current + 1;
//         setCurrent(next);
//         setSeconds(getQuestionSeconds(questions[next], expiresAt));
//       } else {
//         setScreen("lab");
//       }
//       return undefined;
//     }
//     const timer = window.setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
//     return () => window.clearTimeout(timer);
//   }, [screen, seconds, current, questions, expiresAt]);

//   const begin = async () => {
//     if (!token || !localStorage.getItem("ACCESS_TOKEN")) {
//       navigate("/login", { state: { from: location.pathname } });
//       return;
//     }
//     try {
//       setLoading(true);
//       setError("");
//       const { data } = await axios.post(
//         `${API}/api/skill-lab/interviews/start`,
//         { role, level },
//         { headers: authHeaders() },
//       );
//       const nextQuestions = Array.isArray(data.questions) ? data.questions : [];
//       const nextLabs = Array.isArray(data.labs) ? data.labs : [];
//       setAttemptId(data.attemptId);
//       setExpiresAt(data.expiresAt);
//       setQuestions(nextQuestions);
//       setLabs(nextLabs);
//       setAnswers({});
//       setLabAnswers({});
//       setCurrent(0);
//       setSeconds(getQuestionSeconds(nextQuestions[0], data.expiresAt));
//       setResult(null);
//       setScreen(nextQuestions.length ? "interview" : "lab");
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (requestError) {
//       if (requestError.response?.status === 401) {
//         navigate("/login", { state: { from: location.pathname } });
//         return;
//       }
//       setError(requestError.response?.data?.message || "Unable to start the assessment. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nextQuestion = () => {
//     if (current < questions.length - 1) {
//       const next = current + 1;
//       setCurrent(next);
//       setSeconds(getQuestionSeconds(questions[next], expiresAt));
//     } else {
//       setScreen("lab");
//     }
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const submit = async () => {
//     if (!attemptId) {
//       setError("No active assessment found. Please start a new attempt.");
//       return;
//     }
//     try {
//       setLoading(true);
//       setError("");
//       const { data } = await axios.post(
//         `${API}/api/skill-lab/interviews/${attemptId}/submit`,
//         { answers, labAnswers },
//         { headers: authHeaders() },
//       );
//       setResult({ ...data, role, level });
//       setScreen("result");
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     } catch (requestError) {
//       if (requestError.response?.status === 401) {
//         navigate("/login", { state: { from: location.pathname } });
//         return;
//       }
//       setError(requestError.response?.data?.message || "Unable to submit the assessment.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f8f7fb] font-sans text-slate-900 selection:bg-violet-100">
//       <AppHeader />

//       {screen === "welcome" && (
//         <main>
//           <section className="bg-[radial-gradient(ellipse_at_top_right,_#302047_0%,_#181126_57%,_#120f1e_100%)] text-white">
//             <div className="mx-auto grid max-w-[1344px] gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:px-10 lg:py-24">
//               <div>
//                 <Label dark>Career readiness platform</Label>
//                 <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.09] tracking-[-0.045em] sm:text-5xl xl:text-[62px]">
//                   Prepare for the work.<br />Prove what you know.
//                 </h1>
//                 <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
//                   Practice role-specific Splunk interviews and workplace scenarios in a structured assessment environment. Review your answers and identify where to improve.
//                 </p>
//                 <div className="mt-9 flex flex-wrap items-center gap-3">
//                   {employment && <Link to="/toskillab/workplace" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-900 hover:bg-emerald-300">Enter workplace <BriefcaseBusiness size={17}/></Link>}
//                   <a href="#configure-assessment" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-fuchsia-400">
//                     Configure assessment <ArrowRight size={17} aria-hidden="true" />
//                   </a>
//                   <a href="#assessment-process" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5">
//                     How it works <ChevronRight size={16} aria-hidden="true" />
//                   </a>
//                 </div>
//                 <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium text-slate-400 sm:text-sm">
//                   <span className="flex items-center gap-2"><Check size={15} className="text-fuchsia-400" /> Role-specific questions</span>
//                   <span className="flex items-center gap-2"><Check size={15} className="text-fuchsia-400" /> Practical scenarios</span>
//                   <span className="flex items-center gap-2"><Check size={15} className="text-fuchsia-400" /> Answer review</span>
//                 </div>
//               </div>

//               <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#231a35] shadow-[0_30px_80px_rgba(0,0,0,.22)]">
//                 <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
//                   <div className="flex items-center gap-2.5 text-sm font-semibold"><TerminalSquare size={18} className="text-fuchsia-400" /> Assessment workspace</div>
//                   <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview</span>
//                 </div>
//                 <div className="space-y-6 p-5 sm:p-7">
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
//                       <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Selected track</span>
//                       <p className="mt-2 text-sm font-semibold">{selectedRole?.title}</p>
//                     </div>
//                     <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
//                       <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Experience level</span>
//                       <p className="mt-2 text-sm font-semibold">{selectedLevel.name}</p>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Assessment flow</p>
//                     <div className="space-y-0">
//                       {STAGES.map(({ title, detail, icon: Icon }, index) => (
//                         <div key={title} className="flex gap-4">
//                           <div className="flex flex-col items-center">
//                             <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-fuchsia-300"><Icon size={18} /></span>
//                             {index < STAGES.length - 1 && <span className="my-1 h-7 w-px bg-white/10" />}
//                           </div>
//                           <div className="pt-1.5">
//                             <p className="text-sm font-semibold">{title}</p>
//                             <p className="mt-1 text-xs text-slate-400">{detail}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-3 text-xs leading-5 text-slate-300">
//                     This is an educational simulation. It does not constitute a real employment interview or job offer.
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section id="configure-assessment" className="mx-auto max-w-[1344px] scroll-mt-24 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
//             <div className="mb-8 max-w-2xl">
//               <Label>Assessment setup</Label>
//               <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Build your practice session</h2>
//               <p className="mt-3 leading-7 text-slate-600">Choose the position and experience level you want to practice. Your selections determine the assessment content.</p>
//             </div>

//             <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_48px_rgba(15,23,42,.04)]">
//               <div className="border-b border-slate-200 p-5 sm:p-8">
//                 <div className="mb-5 flex items-center justify-between gap-4">
//                   <h3 className="text-lg font-semibold">01 / Select a role</h3>
//                   <span className="hidden text-xs text-slate-500 sm:block">Choose one specialization</span>
//                 </div>
//                 <div className="grid gap-3 md:grid-cols-3">
//                   {roles.map((item) => {
//                     const id = roleId(item);
//                     const Icon = roleIcon(id);
//                     const selected = role === id;
//                     return (
//                       <button key={id} type="button" onClick={() => setRole(id)} aria-pressed={selected}
//                         className={cx("relative rounded-xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600", selected ? "border-violet-600 bg-violet-50/50 ring-1 ring-violet-600" : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50")}>
//                         <div className="mb-5 flex items-start justify-between">
//                           <span className={cx("grid h-11 w-11 place-items-center rounded-lg", selected ? "bg-violet-800 text-white" : "bg-slate-100 text-slate-700")}><Icon size={21} /></span>
//                           <span className={cx("grid h-5 w-5 place-items-center rounded-full border", selected ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 text-transparent")}><Check size={12} /></span>
//                         </div>
//                         <span className="block font-semibold text-slate-950">{item.title}</span>
//                         <span className="mt-2 block text-sm leading-6 text-slate-500">{item.description}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="p-5 sm:p-8">
//                 <h3 className="mb-5 text-lg font-semibold">02 / Select experience level</h3>
//                 <div className="grid gap-3 md:grid-cols-3">
//                   {LEVELS.map((item) => {
//                     const selected = level === item.id;
//                     return (
//                       <button type="button" key={item.id} onClick={() => setLevel(item.id)} aria-pressed={selected}
//                         className={cx("flex min-h-[112px] items-start justify-between gap-3 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600", selected ? "border-violet-600 bg-violet-50/50 ring-1 ring-violet-600" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50")}>
//                         <span><b className="block text-sm">{item.name}</b><span className="mt-1 block text-xs font-semibold text-violet-800">{item.years}</span><span className="mt-2 block text-xs text-slate-500">{item.detail}</span></span>
//                         <span className={cx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border", selected ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 text-transparent")}><Check size={12} /></span>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {error && <div className="mt-6"><AlertMessage>{error}</AlertMessage></div>}

//                 <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center">
//                   <div>
//                     <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ready to begin</span>
//                     <p className="mt-1 text-sm font-semibold text-slate-900">{selectedRole?.title} <span className="text-slate-400">/</span> {selectedLevel.name}</p>
//                     <p className="mt-1 text-xs text-slate-500">Sign-in required. Assessment results are submitted to your existing backend.</p>
//                   </div>
//                   <button type="button" onClick={begin} disabled={loading} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-50 sm:w-auto">
//                     {loading ? "Preparing assessment…" : token ? "Start assessment" : "Sign in to start"}
//                     {token ? <ArrowRight size={17} /> : <LogIn size={17} />}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section id="assessment-process" className="border-t border-slate-200 bg-white py-14 lg:py-20">
//             <div className="mx-auto max-w-[1344px] px-4 sm:px-6 lg:px-10">
//               <Label>How it works</Label>
//               <h2 className="mt-3 text-3xl font-semibold tracking-tight">A clear, three-stage process</h2>
//               <div className="mt-9 grid gap-4 md:grid-cols-3">
//                 {STAGES.map(({ title, detail, icon: Icon }, index) => (
//                   <div key={title} className="rounded-xl border border-slate-200 bg-white p-6">
//                     <div className="flex items-center justify-between"><Icon size={22} className="text-violet-800" /><span className="text-xs font-semibold text-slate-400">0{index + 1}</span></div>
//                     <h3 className="mt-7 text-lg font-semibold">{title}</h3>
//                     <p className="mt-2 text-sm leading-6 text-slate-600">{detail}.</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </main>
//       )}

//       {screen === "interview" && (
//         <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
//           <StageRail step={0} />
//           <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
//             <div><Label>Stage 01 · Technical interview</Label><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{selectedRole?.title}</h1><p className="mt-2 text-sm text-slate-500">{selectedLevel.name} · Timed practice assessment</p></div>
//             <div className={cx("flex items-center gap-3 rounded-xl border bg-white px-5 py-3", seconds <= 15 ? "border-rose-300 text-rose-700" : "border-slate-200 text-slate-900")} aria-live="off">
//               <Clock3 size={20} aria-hidden="true" /><span className="font-mono text-xl font-semibold tabular-nums">{formatTime(seconds)}</span>
//             </div>
//           </div>
//           <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
//             <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//               <div className="h-1 bg-slate-100"><div className="h-full bg-violet-600 transition-[width]" style={{ width: questions.length ? `${((current + 1) / questions.length) * 100}%` : "0%" }} /></div>
//               {question ? (
//                 <div className="p-6 sm:p-9">
//                   <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
//                     <span className="rounded-md bg-violet-50 px-3 py-1.5 font-semibold text-violet-800">{question.category || "Technical knowledge"}</span>
//                     <span className="font-semibold text-slate-500">Question {current + 1} / {questions.length}</span>
//                   </div>
//                   <h2 className="mt-8 max-w-3xl text-xl font-semibold leading-8 tracking-tight sm:text-2xl">{question.prompt}</h2>
//                   <p className="mt-3 text-sm text-slate-500">Select the most appropriate answer.</p>
//                   <div className="mt-7 space-y-3">
//                     {(question.options || []).map((option, index) => {
//                       const selected = answers[question.id] === index;
//                       return (
//                         <button type="button" key={`${index}-${option}`} onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: index }))} aria-pressed={selected}
//                           className={cx("flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:px-5", selected ? "border-violet-600 bg-violet-50/60 ring-1 ring-violet-600" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50")}>
//                           <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold", selected ? "bg-violet-800 text-white" : "bg-slate-100 text-slate-600")}>{String.fromCharCode(65 + index)}</span>
//                           <span className="pt-0.5">{option}</span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                   <div className="mt-9 flex justify-end border-t border-slate-100 pt-6">
//                     <button type="button" onClick={nextQuestion} disabled={answers[question.id] === undefined} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
//                       {current === questions.length - 1 ? "Continue to practical" : "Next question"}<ArrowRight size={16} />
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="p-8"><p className="text-sm text-slate-600">No interview questions were provided for this attempt.</p><button onClick={() => setScreen("lab")} className="mt-5 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Continue to practical</button></div>
//               )}
//             </section>
//             <aside className="space-y-4">
//               <div className="rounded-2xl border border-slate-200 bg-white p-5"><Label>Current session</Label><p className="mt-4 text-sm font-semibold">{selectedRole?.title}</p><p className="mt-1 text-sm text-slate-500">{selectedLevel.name}</p><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Interview progress</p><p className="mt-1 text-2xl font-semibold tabular-nums">{questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0}%</p></div></div>
//               <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-3"><BookOpen className="shrink-0 text-violet-800" size={19} /><p className="text-sm leading-6 text-slate-600">Your assessment moves to practical scenarios after the technical interview.</p></div></div>
//             </aside>
//           </div>
//         </main>
//       )}

//       {screen === "lab" && (
//         <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
//           <StageRail step={1} />
//           <div className="mt-10"><Label>Stage 02 · Practical assessment</Label><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Apply your judgment</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Review the evidence presented in each scenario and select the strongest response.</p></div>
//           <div className="mt-8 space-y-5">
//             {labs.map((lab, labIndex) => (
//               <section key={lab.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//                 <div className="border-b border-slate-100 p-6 sm:p-8">
//                   <div className="flex flex-wrap items-center justify-between gap-3"><Label>Scenario {String(labIndex + 1).padStart(2, "0")}</Label><span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{lab.category || "Practical"}</span></div>
//                   <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">{lab.title}</h2>
//                   <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{lab.brief}</p>
//                   {lab.code && <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-700 bg-[#191325] p-5 font-mono text-xs leading-7 text-violet-200 sm:text-sm"><code>{lab.code}</code></pre>}
//                 </div>
//                 <div className="grid gap-3 p-6 sm:p-8">
//                   {(lab.options || []).map((option, index) => {
//                     const selected = labAnswers[lab.id] === index;
//                     return (
//                       <button type="button" key={`${index}-${option}`} onClick={() => setLabAnswers((previous) => ({ ...previous, [lab.id]: index }))} aria-pressed={selected}
//                         className={cx("flex w-full items-start gap-4 rounded-xl border p-4 text-left text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600", selected ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50")}>
//                         <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold", selected ? "bg-violet-800 text-white" : "bg-slate-100 text-slate-600")}>{String.fromCharCode(65 + index)}</span>
//                         <span className="pt-0.5">{option}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </section>
//             ))}
//           </div>
//           {error && <div className="mt-5"><AlertMessage>{error}</AlertMessage></div>}
//           <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
//             <div><p className="font-semibold">Ready to submit?</p><p className="mt-1 text-sm text-slate-500">Review all scenario answers before submitting your assessment.</p></div>
//             <button type="button" onClick={submit} disabled={loading || labs.some((lab) => labAnswers[lab.id] === undefined)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
//               {loading ? "Submitting assessment…" : "Submit assessment"}<ArrowRight size={17} />
//             </button>
//           </div>
//         </main>
//       )}

//       {screen === "result" && result && (
//         <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
//           <StageRail step={2} />
//           <section className="mt-10 overflow-hidden rounded-2xl bg-[#181126] p-6 text-white sm:p-10">
//             <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
//               <div><Label dark>Assessment complete</Label><h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{result.outcome || "Readiness report"}</h1><p className="mt-3 max-w-xl leading-7 text-slate-300">Review your assessment performance and use the feedback to plan your next practice session.</p></div>
//               <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-[9px] border-violet-500/80 bg-white/5 text-center"><span className="text-4xl font-semibold tabular-nums">{result.score ?? "—"}</span><span className="mt-1 text-xs text-slate-300">out of 100</span></div>
//             </div>
//           </section>
//           {result.jobOffer ? (
//             <section className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:p-8">
//               <Label>Virtual career milestone</Label><h2 className="mt-3 text-2xl font-semibold tracking-tight">Simulated job offer unlocked</h2>
//               <p className="mt-3 leading-7 text-slate-700">{result.jobOffer.company} has offered you a simulated <strong>{result.jobOffer.job_level}</strong> role with <strong>{CURRENCY.format(result.jobOffer.virtual_salary || 0)} / month</strong> in virtual salary.</p>
//               <Link to="/toskillab/workplace" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white hover:bg-violet-800">Accept offer & enter workplace <ArrowRight size={16}/></Link>
//               <p className="mt-3 text-xs leading-5 text-slate-600">For training only. This is not real employment or a cash payment.</p>
//             </section>
//           ) : (
//             <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Keep developing your skills</h2><p className="mt-2 text-sm leading-6 text-slate-600">At least 4 correct interview answers out of 10 are required to unlock the simulated job offer.</p></section>
//           )}
//           <div className="mt-5 grid gap-5 lg:grid-cols-2">
//             <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"><h2 className="text-lg font-semibold">Assessment evidence</h2><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-5"><p className="text-2xl font-semibold tabular-nums">{result.interviewCorrect ?? "—"}/{result.interviewTotal ?? "—"}</p><p className="mt-2 text-xs text-slate-600">Interview answers</p></div><div className="rounded-xl bg-slate-50 p-5"><p className="text-2xl font-semibold tabular-nums">{result.labCorrect ?? "—"}/{result.labTotal ?? "—"}</p><p className="mt-2 text-xs text-slate-600">Practical scenarios</p></div></div></section>
//             <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"><h2 className="text-lg font-semibold">Skill breakdown</h2><div className="mt-5 space-y-5">{result.categoryScores?.length ? result.categoryScores.map((item, index) => { const score = Math.max(0, Math.min(100, Number(item.score) || 0)); return <div key={`${item.category}-${index}`}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><b className="font-semibold">{item.category}</b><span className="font-semibold tabular-nums text-slate-600">{score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${score}%` }} /></div></div>; }) : <p className="text-sm text-slate-500">No category breakdown is available for this attempt.</p>}</div></section>
//           </div>
//           <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
//             <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">Answer review</h2><p className="mt-1 text-sm text-slate-500">Expand a question to read the expected response and explanation.</p></div><button type="button" onClick={() => { setScreen("welcome"); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"><RotateCcw size={16} /> New practice session</button></div>
//             <div className="mt-6 space-y-3">{result.review?.length ? result.review.map((item, index) => (
//               <details key={item.id || index} className="group rounded-xl border border-slate-200 px-4 py-4 sm:px-5">
//                 <summary className="flex cursor-pointer list-none items-start gap-3 font-semibold leading-6 marker:hidden"><span className={cx("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs", item.correct ? "bg-violet-100 text-violet-800" : "bg-rose-100 text-rose-700")}>{item.correct ? <Check size={14} /> : "×"}</span><span className="flex-1 text-sm">{index + 1}. {item.prompt}</span><ChevronRight size={16} className="mt-1 shrink-0 text-slate-400 transition group-open:rotate-90" /></summary>
//                 <div className="ml-9 mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600"><p><strong className="text-slate-900">Expected answer:</strong> {item.options?.[item.correctOption] || "Not available"}</p>{item.explanation && <p className="mt-2">{item.explanation}</p>}</div>
//               </details>
//             )) : <p className="text-sm text-slate-500">No detailed answer review is available for this attempt.</p>}</div>
//           </section>
//         </main>
//       )}

//       <footer className="border-t border-slate-200 bg-white px-4 py-7 text-center text-xs text-slate-500">
//         T.O. Analytics Skill Lab · Educational career simulation
//       </footer>
//     </div>
//   );
// }
