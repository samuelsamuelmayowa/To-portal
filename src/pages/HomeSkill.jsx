import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStateContext } from "../context/ContextProvider";
import HERO_ART from "../assets/images/skill-lab-interview-hero.png";

gsap.registerPlugin(ScrollTrigger);

const api = import.meta.env.VITE_BACKEND_API;
const FALLBACK_ROLES = [
  { id: "analyst", title: "Splunk Analyst", description: "Search, investigate, report, and turn machine data into operational insight.", icon: "⌁" },
  { id: "soc", title: "SOC Analyst", description: "Triage alerts, investigate threats, and communicate incidents using Splunk ES.", icon: "◇" },
  { id: "engineer", title: "Splunk Engineer", description: "Design ingestion, maintain deployments, optimize searches, and scale the platform.", icon: "⌘" },
];
const LEVELS = [
  { id: "entry", name: "Entry level", years: "0–2 years", detail: "Foundations and guided investigations" },
  { id: "mid", name: "Intermediate", years: "2–5 years", detail: "Production scenarios and troubleshooting" },
  { id: "senior", name: "Senior", years: "5+ years", detail: "Architecture, performance, and leadership" },
];
const JOURNEY = [
  ["01", "Technical interview", "Answer role-specific questions under realistic time pressure."],
  ["02", "Hands-on lab", "Investigate practical scenarios and choose the strongest response."],
  ["03", "Readiness report", "See your score, skill gaps, explanations, and next steps."],
  ["04", "Virtual career", "Unlock an offer, workplace tasks, and TO Credits."],
];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function authHeaders() {
  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function AppMark() {
  return (
    <Link to="/" className="flex items-center gap-3 text-white" aria-label="TO Analytics home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black shadow-lg shadow-violet-950/30">TO</span>
      <span><b className="block leading-none">TO Skill Lab</b><small className="text-xs text-slate-400">Career Interview Simulator</small></span>
    </Link>
  );
}

function ProgressRail({ step }) {
  const items = ["Interview", "Practical lab", "Results"];
  return (
    <div className="mb-8 grid grid-cols-3 gap-2" aria-label="Interview progress">
      {items.map((item, index) => (
        <div key={item}>
          <div className={`h-1.5 rounded-full ${index <= step ? "bg-gradient-to-r from-blue-500 to-violet-500" : "bg-slate-200"}`} />
          <span className={`mt-2 hidden text-xs font-semibold sm:block ${index <= step ? "text-violet-700" : "text-slate-400"}`}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomeSkill() {
  const root = useRef(null);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = useMemo(() => roles.find((item) => (item.slug || item.id) === role) || roles[0], [roles, role]);
  const selectedLevel = LEVELS.find((item) => item.id === level);

  useLayoutEffect(() => {
    if (screen !== "welcome" || !root.current) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-copy] > *", { y: 28, opacity: 0, duration: 0.75, stagger: 0.1 })
        .from("[data-hero-art]", { x: 40, opacity: 0, scale: 0.96, duration: 1 }, "-=.65")
        .from("[data-float-card]", { y: 18, opacity: 0, duration: 0.55, stagger: 0.12 }, "-=.55");
      gsap.to("[data-hero-art]", { y: -12, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.utils.toArray("[data-reveal]").forEach((element) => {
        gsap.from(element, { opacity: 0, y: 42, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 84%", once: true } });
      });
      gsap.from("[data-journey-card]", { opacity: 0, y: 34, stagger: 0.12, duration: 0.65, scrollTrigger: { trigger: "[data-journey-grid]", start: "top 82%", once: true } });
    }, root);
    return () => context.revert();
  }, [screen]);

  useEffect(() => {
    if (!token) return;
    axios.get(`${api}/api/skill-lab/roles`, { headers: authHeaders() })
      .then(({ data }) => data.roles?.length && setRoles(data.roles))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (screen !== "interview" || !questions.length) return undefined;
    if (seconds <= 0) {
      if (current < questions.length - 1) {
        const next = current + 1;
        setCurrent(next);
        setSeconds(Math.min(questions[next]?.timeLimitSeconds || 75, Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))));
      } else setScreen("lab");
      return undefined;
    }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, seconds, current, questions, expiresAt]);

  const begin = async () => {
    if (!token || !localStorage.getItem("ACCESS_TOKEN")) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      setLoading(true); setError("");
      const { data } = await axios.post(`${api}/api/skill-lab/interviews/start`, { role, level }, { headers: authHeaders() });
      setAttemptId(data.attemptId); setExpiresAt(data.expiresAt); setQuestions(data.questions || []); setLabs(data.labs || []);
      setAnswers({}); setLabAnswers({}); setCurrent(0); setSeconds(data.questions?.[0]?.timeLimitSeconds || 75); setResult(null); setScreen("interview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      if (requestError.response?.status === 401) return navigate("/login", { state: { from: location.pathname } });
      setError(requestError.response?.data?.message || "Unable to start the interview. Please try again.");
    } finally { setLoading(false); }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      const next = current + 1;
      setCurrent(next); setSeconds(questions[next]?.timeLimitSeconds || 75);
    } else setScreen("lab");
  };

  const submit = async () => {
    try {
      setLoading(true); setError("");
      const { data } = await axios.post(`${api}/api/skill-lab/interviews/${attemptId}/submit`, { answers, labAnswers }, { headers: authHeaders() });
      setResult({ ...data, role, level }); setScreen("result"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      if (requestError.response?.status === 401) return navigate("/login", { state: { from: location.pathname } });
      setError(requestError.response?.data?.message || "Unable to submit the interview.");
    } finally { setLoading(false); }
  };

  return (
    <div ref={root} className="min-h-screen bg-[#f7f8fc] text-slate-950 selection:bg-violet-300/40">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090d1b]/90 px-4 py-4 text-white backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between"><AppMark /><Link to="/" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold transition hover:bg-white/10">Back to TO</Link></div>
      </header>

      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.main key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="relative isolate overflow-hidden bg-[#090d1b] px-4 pb-28 pt-16 text-white md:px-8 md:pb-36 md:pt-24">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_35%,rgba(99,102,241,.22),transparent_34%),radial-gradient(circle_at_10%_20%,rgba(217,70,239,.12),transparent_28%)]" />
              <div className="absolute inset-0 -z-10 opacity-[.08] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:48px_48px]" />
              <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.92fr_1.08fr]">
                <div data-hero-copy>
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-violet-200"><i className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />Career simulation now live</span>
                  <h1 className="mt-7 text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-6xl xl:text-7xl">Don’t just prepare.<span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Prove you can do the job.</span></h1>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Enter a realistic Splunk interview, solve workplace scenarios, receive evidence-based feedback, and build a virtual career profile.</p>
                  <div className="mt-9 flex flex-wrap gap-3"><button onClick={() => document.querySelector("#interview-builder")?.scrollIntoView({ behavior: "smooth" })} className="rounded-xl bg-white px-6 py-3.5 font-black text-slate-950 shadow-xl shadow-violet-950/30 transition hover:-translate-y-0.5">Build my interview →</button><a href="#how-it-works" className="rounded-xl border border-white/15 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">See how it works</a></div>
                  <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">{["Secure scoring", "Role-specific", "Practical labs"].map((item) => <span key={item} className="flex items-center gap-2"><b className="text-emerald-400">✓</b>{item}</span>)}</div>
                </div>
                <div className="relative min-h-[390px] lg:min-h-[560px]">
                  <div className="absolute inset-6 rounded-full bg-violet-500/20 blur-3xl" />
                  <img data-hero-art src={HERO_ART} alt="Candidate completing a technical interview at an analytics workstation" className="relative z-10 h-full w-full rounded-[2rem] object-cover shadow-2xl shadow-black/40" />
                  <div data-float-card className="absolute -left-3 bottom-7 z-20 rounded-2xl border border-white/15 bg-[#11182d]/90 p-4 shadow-xl backdrop-blur md:left-0"><small className="text-slate-400">Candidate readiness</small><div className="mt-1 flex items-end gap-3"><b className="text-3xl">86%</b><span className="mb-1 text-xs font-bold text-emerald-400">Strong hire ↑</span></div></div>
                  <div data-float-card className="absolute right-0 top-5 z-20 rounded-2xl border border-white/15 bg-[#11182d]/90 p-4 shadow-xl backdrop-blur"><small className="text-slate-400">Live stage</small><b className="mt-1 block">Technical interview</b></div>
                </div>
              </div>
            </section>

            <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
              <div data-reveal className="max-w-2xl"><p className="text-sm font-black uppercase tracking-[.2em] text-violet-700">From learner to candidate</p><h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">A career journey that feels earned.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Each stage produces evidence you can review, improve, and carry into your next attempt.</p></div>
              <div data-journey-grid className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{JOURNEY.map(([number, title, detail]) => <article data-journey-card key={number} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="text-sm font-black text-violet-600">{number}</span><h3 className="mt-10 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p><div className="mt-7 h-1 w-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 transition-all group-hover:w-20" /></article>)}</div>
            </section>

            <section id="interview-builder" className="px-4 pb-24 md:px-8 md:pb-32">
              <div data-reveal className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
                <div className="grid lg:grid-cols-[.65fr_1.35fr]">
                  <aside className="bg-[#10162a] p-7 text-white md:p-10"><p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Interview builder</p><h2 className="mt-4 text-3xl font-black">Choose the job you want to practice for.</h2><p className="mt-4 leading-7 text-slate-400">Your role and experience level control the questions, difficulty, and practical scenarios.</p><div className="mt-10 space-y-4 text-sm">{["10 timed questions", "2 practical labs", "Secure readiness score", "Detailed answer review"].map((item) => <div key={item} className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-400/15 text-emerald-400">✓</span>{item}</div>)}</div></aside>
                  <div className="p-6 md:p-10">
                    <p className="text-sm font-black uppercase tracking-widest text-violet-700">1. Select a role</p>
                    <div className="mt-5 grid gap-3 xl:grid-cols-3">{roles.map((item, index) => { const id = item.slug || item.id; return <button type="button" key={id} onClick={() => setRole(id)} aria-pressed={role === id} className={`rounded-2xl border p-5 text-left transition ${role === id ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 hover:border-slate-400"}`}><span className={`grid h-11 w-11 place-items-center rounded-xl text-xl font-black ${role === id ? "bg-violet-600 text-white" : "bg-slate-100"}`}>{item.icon || FALLBACK_ROLES[index]?.icon || "◇"}</span><b className="mt-5 block">{item.title}</b><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p></button>; })}</div>
                    <p className="mt-9 text-sm font-black uppercase tracking-widest text-violet-700">2. Select your level</p>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">{LEVELS.map((item) => <button type="button" key={item.id} onClick={() => setLevel(item.id)} aria-pressed={level === item.id} className={`rounded-2xl border p-4 text-left transition ${level === item.id ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100" : "border-slate-200 hover:border-slate-400"}`}><b className="block">{item.name}</b><span className="mt-1 block text-xs font-bold text-blue-600">{item.years}</span><small className="mt-2 block leading-5 text-slate-500">{item.detail}</small></button>)}</div>
                    {error && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
                    <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center"><div><b>{selectedRole?.title} · {selectedLevel?.name}</b><p className="mt-1 text-sm text-slate-500">Login required · Results saved securely</p></div><button type="button" onClick={begin} disabled={loading} className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-3.5 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Preparing interview…" : token ? "Enter interview room →" : "Login to begin →"}</button></div>
                  </div>
                </div>
              </div>
            </section>
          </motion.main>
        )}

        {screen === "interview" && questions[current] && (
          <motion.main key={`interview-${current}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
            <ProgressRail step={0} />
            <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-violet-700">Technical interview</p><h1 className="mt-2 text-2xl font-black">{selectedRole?.title}</h1></div><div className={`rounded-xl border px-4 py-2 font-mono text-lg font-black ${seconds <= 15 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white"}`} aria-live="polite">00:{String(seconds).padStart(2, "0")}</div></div>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50"><div className="h-1.5 bg-slate-100"><div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div><div className="p-6 md:p-10"><div className="flex items-center justify-between gap-4 text-sm"><span className="rounded-full bg-violet-50 px-3 py-1 font-bold text-violet-700">{questions[current].category}</span><span className="text-slate-500">Question {current + 1} of {questions.length}</span></div><h2 className="mt-8 text-2xl font-black leading-9 md:text-3xl">{questions[current].prompt}</h2><div className="mt-8 grid gap-3">{questions[current].options.map((option, index) => { const active = answers[questions[current].id] === index; return <button type="button" key={`${index}-${option}`} onClick={() => setAnswers((value) => ({ ...value, [questions[current].id]: index }))} className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${active ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${active ? "bg-violet-600 text-white" : "bg-slate-100"}`}>{String.fromCharCode(65 + index)}</span><span className="pt-1">{option}</span></button>; })}</div><div className="mt-8 flex justify-end"><button type="button" onClick={nextQuestion} disabled={answers[questions[current].id] === undefined} className="rounded-xl bg-slate-950 px-7 py-3 font-black text-white disabled:opacity-35">{current === questions.length - 1 ? "Continue to lab" : "Next question"} →</button></div></div></div>
          </motion.main>
        )}

        {screen === "lab" && (
          <motion.main key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
            <ProgressRail step={1} /><div className="mb-9"><p className="text-xs font-black uppercase tracking-[.2em] text-violet-700">Hands-on assessment</p><h1 className="mt-3 text-3xl font-black md:text-5xl">Think like you’re already on the team.</h1><p className="mt-4 text-slate-600">Read the evidence, choose the strongest response, and submit when every scenario is complete.</p></div>
            <div className="grid gap-6">{labs.map((lab, labIndex) => <section key={lab.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6 md:p-8"><span className="text-xs font-black uppercase tracking-widest text-violet-700">Scenario {labIndex + 1} · {lab.category}</span><h2 className="mt-4 text-2xl font-black">{lab.title}</h2><p className="mt-3 leading-7 text-slate-600">{lab.brief}</p>{lab.code && <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#0d1424] p-5 text-sm text-emerald-300"><code>{lab.code}</code></pre>}</div><div className="grid gap-3 p-6 md:p-8">{lab.options.map((option, index) => { const active = labAnswers[lab.id] === index; return <button type="button" key={`${index}-${option}`} onClick={() => setLabAnswers((value) => ({ ...value, [lab.id]: index }))} className={`rounded-xl border p-4 text-left transition ${active ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-400"}`}><b className="mr-3">{String.fromCharCode(65 + index)}.</b>{option}</button>; })}</div></section>)}</div>
            {error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}<div className="mt-8 flex justify-end"><button type="button" onClick={submit} disabled={loading || labs.some((lab) => labAnswers[lab.id] === undefined)} className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 font-black text-white shadow-lg disabled:opacity-40">{loading ? "Scoring securely…" : "Submit assessment →"}</button></div>
          </motion.main>
        )}

        {screen === "result" && result && (
          <motion.main key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
            <ProgressRail step={2} /><section className="overflow-hidden rounded-[2rem] bg-[#0b1020] p-7 text-white shadow-2xl md:p-12"><div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-violet-300">Candidate readiness report</p><h1 className="mt-4 text-3xl font-black md:text-5xl">{result.outcome}</h1><p className="mt-4 text-lg text-slate-300">Your result is saved to your TO Skill Lab career profile.</p></div><div className="grid h-44 w-44 place-items-center rounded-full border-[12px] border-violet-500 bg-white/5 text-center"><span><b className="block text-5xl">{result.score}</b><small className="text-slate-300">out of 100</small></span></div></div></section>
            {result.jobOffer ? <section className="mt-7 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7 md:p-9"><p className="text-xs font-black uppercase tracking-widest text-emerald-700">Virtual job offer</p><h2 className="mt-3 text-3xl font-black">You have been hired!</h2><p className="mt-3 text-slate-600">{result.jobOffer.company} is offering you a <b>{result.jobOffer.job_level}</b> position with a virtual salary of <b>{money.format(result.jobOffer.virtual_salary)} TO Credits</b>.</p><p className="mt-3 text-xs text-slate-500">This simulated offer and currency are for learning and are not real employment or cash payment.</p></section> : <section className="mt-7 rounded-[2rem] border border-amber-200 bg-amber-50 p-7"><h2 className="text-xl font-black">Keep building your skills</h2><p className="mt-2 text-slate-600">Score at least 70% to unlock a virtual job offer.</p></section>}
            <div className="mt-7 grid gap-6 lg:grid-cols-2"><section className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Assessment evidence</h2><div className="mt-5 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-slate-50 p-5"><b className="text-2xl">{result.interviewCorrect}/{result.interviewTotal}</b><span className="mt-1 block text-sm text-slate-500">Interview answers</span></div><div className="rounded-2xl bg-slate-50 p-5"><b className="text-2xl">{result.labCorrect}/{result.labTotal}</b><span className="mt-1 block text-sm text-slate-500">Practical labs</span></div></div></section><section className="rounded-[2rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Skill breakdown</h2><div className="mt-5 space-y-4">{result.categoryScores?.map((item) => <div key={item.category}><div className="mb-2 flex justify-between text-sm"><b>{item.category}</b><span>{item.score}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${item.score}%` }} /></div></div>)}</div></section></div>
            <section className="mt-7 rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-black">Interview review</h2><p className="mt-1 text-sm text-slate-500">Correct answers are revealed after secure submission.</p></div><button type="button" onClick={() => setScreen("welcome")} className="rounded-xl bg-slate-950 px-6 py-3 font-black text-white">Return to Skill Lab</button></div><div className="mt-6 grid gap-4">{result.review?.map((item, index) => <details key={item.id} className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer list-none font-semibold"><span className={`mr-3 inline-grid h-7 w-7 place-items-center rounded-full text-sm ${item.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.correct ? "✓" : "×"}</span>{index + 1}. {item.prompt}</summary><div className="ml-10 mt-4 text-sm leading-6 text-slate-600"><p><b>Correct answer:</b> {item.options?.[item.correctOption]}</p><p className="mt-2">{item.explanation}</p></div></details>)}</div></section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
