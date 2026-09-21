import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useStateContext } from "../context/ContextProvider";

const api = import.meta.env.VITE_BACKEND_API;

const FALLBACK_ROLES = [
  { id: "analyst", title: "Splunk Analyst", description: "Search, investigate, report, and turn machine data into clear operational insight." },
  { id: "soc", title: "SOC Analyst", description: "Triage alerts, investigate threats, and communicate incidents using Splunk ES." },
  { id: "engineer", title: "Splunk Engineer", description: "Design ingestion, maintain deployments, optimize searches, and scale the platform." },
];

const LEVELS = [
  { id: "entry", name: "Entry level", detail: "0–2 years · Foundations and guided investigations" },
  { id: "mid", name: "Intermediate", detail: "2–5 years · Production scenarios and troubleshooting" },
  { id: "senior", name: "Senior", detail: "5+ years · Architecture, performance, and leadership" },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function authHeaders() {
  const token = localStorage.getItem("ACCESS_TOKEN");
  return { Authorization: `Bearer ${token}` };
}

function AppMark() {
  return (
    <Link to="/" className="flex items-center gap-3 text-white">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-PURPLE to-violet-500 font-black">TO</span>
      <span><b className="block leading-none">TO Skill Lab</b><small className="text-xs text-slate-400">Splunk Career Simulator</small></span>
    </Link>
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

  useEffect(() => {
    if (!token) return;
    axios.get(`${api}/api/skill-lab/roles`, { headers: authHeaders() })
      .then(({ data }) => {
        if (data.roles?.length) setRoles(data.roles);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (screen !== "interview" || !questions.length) return undefined;
    if (seconds <= 0) {
      if (current < questions.length - 1) {
        setCurrent((value) => value + 1);
        setSeconds(questions[current + 1]?.timeLimitSeconds || 75);
      } else {
        setScreen("lab");
      }
      return undefined;
    }
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [screen, seconds, current, questions]);

  const begin = async () => {
    if (!token || !localStorage.getItem("ACCESS_TOKEN")) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(
        `${api}/api/skill-lab/interviews/start`,
        { role, level },
        { headers: authHeaders() }
      );
      setAttemptId(data.attemptId);
      setQuestions(data.questions || []);
      setLabs(data.labs || []);
      setAnswers({});
      setLabAnswers({});
      setCurrent(0);
      setSeconds(data.questions?.[0]?.timeLimitSeconds || 75);
      setResult(null);
      setScreen("interview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      setError(requestError.response?.data?.message || "Unable to start the interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      const next = current + 1;
      setCurrent(next);
      setSeconds(questions[next]?.timeLimitSeconds || 75);
    } else {
      setScreen("lab");
    }
  };

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.post(
        `${api}/api/skill-lab/interviews/${attemptId}/submit`,
        { answers, labAnswers },
        { headers: authHeaders() }
      );
      setResult({ ...data, role, level });
      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      setError(requestError.response?.data?.message || "Unable to submit the interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="border-b border-white/10 bg-[#0b1020]/95 px-4 py-4 text-white backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between"><AppMark /><Link to="/" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10">Back to TO</Link></div>
      </header>

      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.main key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="overflow-hidden bg-[#0b1020] px-4 pb-20 pt-16 text-white md:px-8 md:pb-28 md:pt-24">
              <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-PURPLE/40 bg-PURPLE/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-fuchsia-300">Authenticated career simulation</span>
                  <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-7xl">Interview. Get hired. Complete real-world tasks.</h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Prove your Splunk knowledge, earn a virtual job offer, complete workplace assignments and build career experience.</p>
                  <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">{["Secure scoring", "Timed interview", "Practical labs", "Virtual job offers"].map((item) => <span key={item} className="rounded-full bg-white/5 px-4 py-2">✓ {item}</span>)}</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[.06] p-6 shadow-2xl">
                  <p className="text-sm text-slate-400">Career journey</p><p className="mt-2 text-2xl font-black">Candidate → Employee</p>
                  <div className="mt-6 space-y-3">{["Complete technical interview", "Solve hands-on Splunk labs", "Receive a virtual job offer", "Work and earn TO Credits"].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl bg-black/20 p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-PURPLE font-bold">{index + 1}</span><span>{item}</span></div>)}</div>
                </div>
              </div>
            </section>

            <section className="relative mx-auto -mt-10 max-w-7xl px-4 pb-20 md:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10">
                <p className="text-sm font-bold uppercase tracking-widest text-PURPLE">Build your interview</p><h2 className="mt-2 text-3xl font-black">Choose your target role</h2>
                <div className="mt-7 grid gap-4 lg:grid-cols-3">{roles.map((item) => { const id = item.slug || item.id; return <button key={id} onClick={() => setRole(id)} className={`rounded-2xl border p-5 text-left transition ${role === id ? "border-BLUE bg-violet-50 ring-2 ring-BLUE/10" : "border-slate-200 hover:border-slate-400"}`}><span className={`mb-4 grid h-10 w-10 place-items-center rounded-xl font-black ${role === id ? "bg-BLUE text-white" : "bg-slate-100"}`}>{item.title[0]}</span><b>{item.title}</b><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p></button>; })}</div>
                <h3 className="mt-9 text-lg font-bold">Experience level</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">{LEVELS.map((item) => <button key={item.id} onClick={() => setLevel(item.id)} className={`rounded-xl border px-4 py-4 text-left ${level === item.id ? "border-PURPLE bg-fuchsia-50" : "border-slate-200"}`}><b className="block">{item.name}</b><small className="text-slate-500">{item.detail}</small></button>)}</div>
                {error && <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
                <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center"><div><b>{selectedRole?.title} · {LEVELS.find((item) => item.id === level)?.name}</b><p className="mt-1 text-sm text-slate-500">Login required · Results saved securely</p></div><button onClick={begin} disabled={loading} className="rounded-xl bg-BLUE px-7 py-3.5 font-bold text-white disabled:opacity-50">{loading ? "Preparing interview..." : token ? "Start interview →" : "Login to start →"}</button></div>
              </div>
            </section>
          </motion.main>
        )}

        {screen === "interview" && questions[current] && (
          <motion.main key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
            <div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-PURPLE">TECHNICAL INTERVIEW</p><h1 className="text-2xl font-black">{selectedRole?.title}</h1></div><div className={`rounded-xl px-4 py-2 font-mono font-bold ${seconds <= 15 ? "bg-rose-100 text-rose-700" : "bg-white"}`}>00:{String(seconds).padStart(2, "0")}</div></div>
            <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-BLUE to-PURPLE" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
              <div className="flex items-center justify-between text-sm"><span className="rounded-full bg-violet-50 px-3 py-1 font-bold text-BLUE">{questions[current].category}</span><span className="text-slate-500">Question {current + 1} of {questions.length}</span></div>
              <h2 className="mt-8 text-2xl font-bold leading-9 md:text-3xl">{questions[current].prompt}</h2>
              <div className="mt-8 grid gap-3">{questions[current].options.map((option, index) => <button key={`${index}-${option}`} onClick={() => setAnswers((value) => ({ ...value, [questions[current].id]: index }))} className={`flex items-start gap-4 rounded-2xl border p-4 text-left ${answers[questions[current].id] === index ? "border-BLUE bg-violet-50 ring-2 ring-BLUE/10" : "border-slate-200 hover:border-slate-400"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${answers[questions[current].id] === index ? "bg-BLUE text-white" : "bg-slate-100"}`}>{String.fromCharCode(65 + index)}</span><span>{option}</span></button>)}</div>
              <div className="mt-8 flex justify-end"><button onClick={nextQuestion} disabled={answers[questions[current].id] === undefined} className="rounded-xl bg-BLUE px-7 py-3 font-bold text-white disabled:opacity-40">{current === questions.length - 1 ? "Continue to lab" : "Next question"} →</button></div>
            </div>
          </motion.main>
        )}

        {screen === "lab" && (
          <motion.main key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
            <div className="mb-9"><p className="text-sm font-bold text-PURPLE">HANDS-ON LAB</p><h1 className="mt-2 text-3xl font-black md:text-4xl">Show how you solve real problems.</h1><p className="mt-3 text-slate-500">Your answers will be scored securely by the TO backend.</p></div>
            <div className="grid gap-6">{labs.map((lab, labIndex) => <section key={lab.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6 md:p-8"><span className="text-xs font-bold uppercase tracking-widest text-PURPLE">Lab {labIndex + 1} · {lab.category}</span><h2 className="mt-4 text-2xl font-black">{lab.title}</h2><p className="mt-3 leading-7 text-slate-600">{lab.brief}</p>{lab.code && <pre className="mt-5 overflow-x-auto rounded-xl bg-[#101827] p-4 text-sm text-emerald-300"><code>{lab.code}</code></pre>}</div><div className="grid gap-3 p-6 md:p-8">{lab.options.map((option, index) => <button key={`${index}-${option}`} onClick={() => setLabAnswers((value) => ({ ...value, [lab.id]: index }))} className={`rounded-xl border p-4 text-left ${labAnswers[lab.id] === index ? "border-BLUE bg-violet-50" : "border-slate-200 hover:border-slate-400"}`}><b className="mr-3">{String.fromCharCode(65 + index)}.</b>{option}</button>)}</div></section>)}</div>
            {error && <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
            <div className="mt-8 flex justify-end"><button onClick={submit} disabled={loading || labs.some((lab) => labAnswers[lab.id] === undefined)} className="rounded-xl bg-BLUE px-8 py-4 font-bold text-white disabled:opacity-40">{loading ? "Scoring securely..." : "Submit interview →"}</button></div>
          </motion.main>
        )}

        {screen === "result" && result && (
          <motion.main key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
            <div className="rounded-3xl bg-[#0b1020] p-7 text-white md:p-12"><div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-fuchsia-300">Candidate readiness report</p><h1 className="mt-4 text-3xl font-black md:text-5xl">{result.outcome}</h1><p className="mt-4 text-lg text-slate-300">Your result has been saved to your TO Skill Lab career profile.</p></div><div className="grid h-44 w-44 place-items-center rounded-full border-[12px] border-PURPLE bg-white/5 text-center"><span><b className="block text-5xl">{result.score}</b><small className="text-slate-300">out of 100</small></span></div></div></div>
            {result.jobOffer ? <section className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-7 md:p-9"><p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Virtual job offer</p><h2 className="mt-3 text-3xl font-black">You have been hired!</h2><p className="mt-3 text-slate-600">{result.jobOffer.company} is offering you a <b>{result.jobOffer.job_level}</b> position with a virtual salary of <b>{money.format(result.jobOffer.virtual_salary)} TO Credits</b>.</p><p className="mt-3 text-sm text-slate-500">The next phase will let you accept this offer and receive workplace tasks.</p></section> : <section className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-7"><h2 className="text-xl font-black">Keep building your skills</h2><p className="mt-2 text-slate-600">Score at least 70% to unlock a virtual job offer.</p></section>}
            <div className="mt-7 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Assessment evidence</h2><div className="mt-5 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-slate-50 p-5"><b className="text-2xl">{result.interviewCorrect}/{result.interviewTotal}</b><span className="mt-1 block text-sm text-slate-500">Interview answers</span></div><div className="rounded-2xl bg-slate-50 p-5"><b className="text-2xl">{result.labCorrect}/{result.labTotal}</b><span className="mt-1 block text-sm text-slate-500">Practical labs</span></div></div></section><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Skill breakdown</h2><div className="mt-5 space-y-4">{result.categoryScores.map((item) => <div key={item.category}><div className="mb-2 flex justify-between text-sm"><b>{item.category}</b><span>{item.score}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-BLUE to-PURPLE" style={{ width: `${item.score}%` }} /></div></div>)}</div></section></div>
            <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-black">Interview review</h2><p className="mt-1 text-sm text-slate-500">Correct answers are revealed only after secure submission.</p></div><button onClick={() => setScreen("welcome")} className="rounded-xl bg-BLUE px-6 py-3 font-bold text-white">Return to Skill Lab</button></div><div className="mt-6 grid gap-4">{result.review.map((item, index) => <details key={item.id} className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer list-none font-semibold"><span className={`mr-3 inline-grid h-7 w-7 place-items-center rounded-full text-sm ${item.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.correct ? "✓" : "×"}</span>{index + 1}. {item.prompt}</summary><div className="ml-10 mt-4 text-sm leading-6 text-slate-600"><p><b>Correct answer:</b> {item.options?.[item.correctOption]}</p><p className="mt-2">{item.explanation}</p></div></details>)}</div></section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}