import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const QUESTION_TIME = 75;

const roles = [
  {
    id: "analyst",
    title: "Splunk Analyst",
    description: "Search, investigate, report, and turn machine data into clear operational insight.",
    salary: { entry: [55000, 72000], mid: [73000, 98000], senior: [99000, 128000] },
  },
  {
    id: "soc",
    title: "SOC Analyst",
    description: "Triage alerts, investigate threats, and communicate incidents using Splunk ES.",
    salary: { entry: [58000, 76000], mid: [77000, 102000], senior: [103000, 134000] },
  },
  {
    id: "engineer",
    title: "Splunk Engineer",
    description: "Design ingestion, maintain deployments, optimize searches, and scale the platform.",
    salary: { entry: [70000, 90000], mid: [91000, 122000], senior: [123000, 158000] },
  },
];

const levels = [
  { id: "entry", name: "Entry level", detail: "0–2 years · Foundations and guided investigations" },
  { id: "mid", name: "Intermediate", detail: "2–5 years · Production scenarios and troubleshooting" },
  { id: "senior", name: "Senior", detail: "5+ years · Architecture, performance, and leadership" },
];

const questions = [
  {
    id: 1,
    category: "SPL fundamentals",
    difficulty: "Entry",
    prompt: "Which SPL command groups events by one or more fields and calculates aggregate values?",
    options: ["stats", "table", "fields", "rename"],
    answer: 0,
    explanation: "The stats command calculates aggregate statistics, such as count, sum, and average, grouped by fields.",
  },
  {
    id: 2,
    category: "Search optimization",
    difficulty: "Entry",
    prompt: "Which search is normally the most efficient starting point?",
    options: [
      "search * | where index=\"security\"",
      "index=security sourcetype=firewall action=blocked",
      "* | regex _raw=\"blocked\"",
      "index=* | search action=blocked",
    ],
    answer: 1,
    explanation: "Filtering by index, sourcetype, and indexed fields as early as possible reduces the events Splunk must process.",
  },
  {
    id: 3,
    category: "Data onboarding",
    difficulty: "Intermediate",
    prompt: "What is the primary purpose of props.conf?",
    options: [
      "Manage user roles",
      "Configure parsing, line breaking, timestamps, and field-related behavior",
      "Store license usage",
      "Define index retention only",
    ],
    answer: 1,
    explanation: "props.conf controls how Splunk processes and interprets data, including timestamp recognition and event breaking.",
  },
  {
    id: 4,
    category: "Architecture",
    difficulty: "Intermediate",
    prompt: "In a distributed Splunk deployment, which component normally stores indexed data and executes search commands against it?",
    options: ["Deployment server", "Indexer", "License manager", "Universal forwarder"],
    answer: 1,
    explanation: "Indexers transform incoming data into events, store the indexes, and search their local indexed data.",
  },
  {
    id: 5,
    category: "Security investigation",
    difficulty: "Intermediate",
    prompt: "You need to find users with more than 10 failed logins from at least 3 source IPs in 15 minutes. Which approach is strongest?",
    options: [
      "Use head 10 after searching failures",
      "Use transaction for every event in the index",
      "Use bin _time span=15m, then stats count and dc(src_ip) by user and _time",
      "Export all events to a spreadsheet",
    ],
    answer: 2,
    explanation: "Time-bucketing with bin and aggregation with stats is efficient and directly measures event count and distinct IP count.",
  },
  {
    id: 6,
    category: "Knowledge objects",
    difficulty: "Entry",
    prompt: "What does a data model primarily provide in Splunk?",
    options: [
      "A structured, reusable representation of datasets for reporting and Pivot",
      "A replacement for all indexes",
      "A method for installing forwarders",
      "An external backup of raw data",
    ],
    answer: 0,
    explanation: "Data models organize related datasets and make them reusable in Pivot, reports, and accelerated searches.",
  },
  {
    id: 7,
    category: "Performance",
    difficulty: "Advanced",
    prompt: "A dashboard search scans 30 days of data and is repeatedly slow. What should you investigate first?",
    options: [
      "Increase every user's role permissions",
      "Narrow the base search and verify index-time filters before considering acceleration",
      "Add more panels to distribute the load",
      "Replace stats with transaction in every panel",
    ],
    answer: 1,
    explanation: "First reduce unnecessary data scanning and inspect the search job. Acceleration is useful only after the search is well designed.",
  },
  {
    id: 8,
    category: "Splunk ES",
    difficulty: "Advanced",
    prompt: "In Splunk Enterprise Security, what is a notable event?",
    options: [
      "Every raw event received by a forwarder",
      "A security-relevant event created when correlation-search conditions are met",
      "A deleted index bucket",
      "A scheduled PDF export",
    ],
    answer: 1,
    explanation: "Correlation searches create notable events for conditions analysts should triage and investigate.",
  },
  {
    id: 9,
    category: "Troubleshooting",
    difficulty: "Advanced",
    prompt: "A forwarder is connected but events are not searchable. Which sequence is the best investigation path?",
    options: [
      "Restart every Splunk component immediately",
      "Check inputs, internal logs, routing/output configuration, index existence, and search-time permissions",
      "Delete fishbucket and indexes",
      "Create an unrelated dashboard",
    ],
    answer: 1,
    explanation: "A controlled end-to-end check isolates collection, forwarding, indexing, and permission problems without destructive action.",
  },
  {
    id: 10,
    category: "Governance",
    difficulty: "Intermediate",
    prompt: "Why should teams use role-based access control and least privilege in Splunk?",
    options: [
      "To make searches use more memory",
      "To limit access to sensitive data and administrative capabilities",
      "To avoid creating indexes",
      "To make all users administrators",
    ],
    answer: 1,
    explanation: "Least privilege restricts data and capabilities to what a user's responsibilities require, reducing security and compliance risk.",
  },
];

const labs = [
  {
    id: "bruteforce",
    category: "Practical investigation",
    title: "Detect a credential attack",
    brief: "The SOC sees repeated authentication failures followed by a success. Choose the SPL that best identifies suspicious accounts.",
    code: "index=auth (action=failure OR action=success) earliest=-30m",
    options: [
      "| table user",
      "| stats count(eval(action=\"failure\")) as failures count(eval(action=\"success\")) as successes dc(src_ip) as sources by user | where failures >= 5 AND successes >= 1",
      "| dedup action | head 1",
    ],
    answer: 1,
    explanation: "Conditional aggregation produces the failure, success, and source diversity evidence required for triage.",
  },
  {
    id: "health",
    category: "Platform operations",
    title: "Investigate ingestion delay",
    brief: "A critical source stopped appearing in dashboards. What should you check first?",
    code: "index=_internal source=*metrics.log group=per_sourcetype_thruput",
    options: [
      "Confirm latest event time, source throughput, forwarder connectivity, and queue warnings",
      "Delete and recreate the production index",
      "Give every learner admin access",
    ],
    answer: 0,
    explanation: "Freshness, throughput, connectivity, and queues establish where the data flow stopped without risking indexed data.",
  },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function outcomeFor(score) {
  if (score >= 85) return { label: "Strong hire recommendation", tone: "emerald", message: "You demonstrated strong practical judgment and interview readiness." };
  if (score >= 70) return { label: "Recommended to progress", tone: "blue", message: "You are ready for a technical follow-up, with a few areas to strengthen." };
  if (score >= 50) return { label: "Nearly job-ready", tone: "amber", message: "Your foundation is promising. Targeted practice should improve consistency." };
  return { label: "More practice recommended", tone: "rose", message: "Build confidence in the highlighted topics before a formal interview." };
}

function salaryFor(roleId, levelId, score) {
  const role = roles.find((item) => item.id === roleId) || roles[0];
  const base = role.salary[levelId] || role.salary.entry;
  const multiplier = score >= 85 ? 1.08 : score >= 70 ? 1 : score >= 50 ? 0.92 : 0.84;
  return base.map((amount) => Math.round((amount * multiplier) / 1000) * 1000);
}

function AppMark() {
  return (
    <Link to="/" className="flex items-center gap-3 text-white">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-PURPLE to-violet-500 font-black">TO</span>
      <span><b className="block leading-none">TO Skill Lab</b><small className="text-xs text-slate-400">Splunk Interview Studio</small></span>
    </Link>
  );
}

function HomeSkill() {
  const [screen, setScreen] = useState("welcome");
  const [role, setRole] = useState("analyst");
  const [level, setLevel] = useState("entry");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [labAnswers, setLabAnswers] = useState({});
  const [seconds, setSeconds] = useState(QUESTION_TIME);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("toSkillLabLatestResult");
    if (saved) {
      try { setResult(JSON.parse(saved)); } catch { localStorage.removeItem("toSkillLabLatestResult"); }
    }
  }, []);

  useEffect(() => {
    if (screen !== "interview") return undefined;
    if (seconds <= 0) {
      setCurrent((value) => Math.min(value + 1, questions.length - 1));
      setSeconds(QUESTION_TIME);
      if (current === questions.length - 1) setScreen("lab");
      return undefined;
    }
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [screen, seconds, current]);

  const selectedRole = useMemo(() => roles.find((item) => item.id === role), [role]);

  const begin = () => {
    setAnswers({});
    setLabAnswers({});
    setCurrent(0);
    setSeconds(QUESTION_TIME);
    setResult(null);
    setScreen("interview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      setSeconds(QUESTION_TIME);
    } else {
      setScreen("lab");
    }
  };

  const submit = () => {
    const interviewCorrect = questions.filter((question) => answers[question.id] === question.answer).length;
    const labCorrect = labs.filter((lab) => labAnswers[lab.id] === lab.answer).length;
    const score = Math.round(((interviewCorrect + labCorrect * 2) / (questions.length + labs.length * 2)) * 100);
    const categoryScores = [...new Set(questions.map((item) => item.category))].map((category) => {
      const group = questions.filter((item) => item.category === category);
      const correct = group.filter((item) => answers[item.id] === item.answer).length;
      return { category, score: Math.round((correct / group.length) * 100) };
    });
    const completed = {
      score,
      role,
      level,
      interviewCorrect,
      labCorrect,
      categoryScores,
      salary: salaryFor(role, level, score),
      completedAt: new Date().toISOString(),
      answers,
      labAnswers,
    };
    setResult(completed);
    localStorage.setItem("toSkillLabLatestResult", JSON.stringify(completed));
    setScreen("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nav = (
    <header className="border-b border-white/10 bg-[#0b1020]/95 px-4 py-4 text-white backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <AppMark />
        <div className="flex items-center gap-3">
          {result && screen === "welcome" && <button onClick={() => setScreen("result")} className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 sm:block">Latest result</button>}
          <Link to="/" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10">Back to TO</Link>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {nav}
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.main key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="overflow-hidden bg-[#0b1020] px-4 pb-20 pt-16 text-white md:px-8 md:pb-28 md:pt-24">
              <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-PURPLE/40 bg-PURPLE/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-fuchsia-300">Free career simulation</span>
                  <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-7xl">Prove your Splunk skills before the real interview.</h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Practice realistic technical questions, solve hands-on incident scenarios, and receive an evidence-based readiness report with role and salary guidance.</p>
                  <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                    {["12 scored challenges", "Timed interview", "Practical labs", "Instant feedback"].map((item) => <span key={item} className="rounded-full bg-white/5 px-4 py-2">✓ {item}</span>)}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[.06] p-5 shadow-2xl backdrop-blur md:p-7">
                  <div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Candidate preview</p><p className="mt-1 font-bold">Splunk Analyst Assessment</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">LIVE</span></div>
                  <div className="my-6 grid grid-cols-3 gap-3">
                    {[['84%', 'Readiness'], ['10', 'Questions'], ['2', 'Labs']].map(([value, label]) => <div key={label} className="rounded-2xl bg-black/20 p-4 text-center"><b className="text-xl">{value}</b><small className="mt-1 block text-slate-400">{label}</small></div>)}
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-PURPLE/20 to-violet-500/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">Example outcome</p><p className="mt-2 text-xl font-bold">Recommended to progress</p><p className="mt-2 text-sm text-slate-300">Estimated US market range: $73k–$98k</p></div>
                </div>
              </div>
            </section>

            <section className="relative mx-auto -mt-10 max-w-7xl px-4 pb-20 md:px-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10">
                <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-widest text-PURPLE">Build your interview</p><h2 className="mt-2 text-3xl font-black">Choose your target role</h2><p className="mt-2 text-slate-500">Your role and experience level shape the career result and salary benchmark.</p></div>
                <div className="mt-7 grid gap-4 lg:grid-cols-3">
                  {roles.map((item) => <button key={item.id} onClick={() => setRole(item.id)} className={`rounded-2xl border p-5 text-left transition ${role === item.id ? 'border-BLUE bg-violet-50 ring-2 ring-BLUE/10' : 'border-slate-200 hover:border-slate-400'}`}><span className={`mb-4 grid h-10 w-10 place-items-center rounded-xl font-black ${role === item.id ? 'bg-BLUE text-white' : 'bg-slate-100'}`}>{item.title[0]}</span><b>{item.title}</b><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p></button>)}
                </div>
                <h3 className="mt-9 text-lg font-bold">Experience level</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">{levels.map((item) => <button key={item.id} onClick={() => setLevel(item.id)} className={`rounded-xl border px-4 py-4 text-left ${level === item.id ? 'border-PURPLE bg-fuchsia-50' : 'border-slate-200'}`}><b className="block">{item.name}</b><small className="text-slate-500">{item.detail}</small></button>)}</div>
                <div className="mt-8 flex flex-col justify-between gap-5 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center"><div><b>{selectedRole.title} · {levels.find((item) => item.id === level)?.name}</b><p className="mt-1 text-sm text-slate-500">About 15 minutes · Progress saved when completed</p></div><button onClick={begin} className="rounded-xl bg-BLUE px-7 py-3.5 font-bold text-white shadow-lg shadow-BLUE/20 hover:brightness-110">Start free interview →</button></div>
              </div>
            </section>
          </motion.main>
        )}

        {screen === "interview" && (
          <motion.main key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-PURPLE">TECHNICAL INTERVIEW</p><h1 className="text-2xl font-black">{selectedRole.title}</h1></div><div className={`rounded-xl px-4 py-2 font-mono font-bold ${seconds <= 15 ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-700'}`}>00:{String(seconds).padStart(2, '0')}</div></div>
            <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-BLUE to-PURPLE transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
              <div className="flex items-center justify-between text-sm"><span className="rounded-full bg-violet-50 px-3 py-1 font-bold text-BLUE">{questions[current].category}</span><span className="text-slate-500">Question {current + 1} of {questions.length}</span></div>
              <h2 className="mt-8 text-2xl font-bold leading-9 md:text-3xl">{questions[current].prompt}</h2>
              <div className="mt-8 grid gap-3">{questions[current].options.map((option, index) => <button key={option} onClick={() => setAnswers((value) => ({ ...value, [questions[current].id]: index }))} className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition md:p-5 ${answers[questions[current].id] === index ? 'border-BLUE bg-violet-50 ring-2 ring-BLUE/10' : 'border-slate-200 hover:border-slate-400'}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${answers[questions[current].id] === index ? 'bg-BLUE text-white' : 'bg-slate-100'}`}>{String.fromCharCode(65 + index)}</span><span>{option}</span></button>)}</div>
              <div className="mt-8 flex items-center justify-between"><button onClick={() => { if (current > 0) { setCurrent((v) => v - 1); setSeconds(QUESTION_TIME); } }} disabled={current === 0} className="px-4 py-3 font-semibold text-slate-500 disabled:opacity-30">← Previous</button><button onClick={nextQuestion} disabled={answers[questions[current].id] === undefined} className="rounded-xl bg-BLUE px-7 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{current === questions.length - 1 ? 'Continue to lab' : 'Next question'} →</button></div>
            </div>
          </motion.main>
        )}

        {screen === "lab" && (
          <motion.main key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
            <div className="mb-9"><p className="text-sm font-bold text-PURPLE">HANDS-ON LAB</p><h1 className="mt-2 text-3xl font-black md:text-4xl">Show how you solve real problems.</h1><p className="mt-3 text-slate-500">Each lab carries twice the weight of one interview question.</p></div>
            <div className="grid gap-6">{labs.map((lab, labIndex) => <section key={lab.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-widest text-PURPLE">Lab {labIndex + 1} · {lab.category}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">20 points</span></div><h2 className="mt-4 text-2xl font-black">{lab.title}</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">{lab.brief}</p><pre className="mt-5 overflow-x-auto rounded-xl bg-[#101827] p-4 text-sm text-emerald-300"><code>{lab.code}</code></pre></div><div className="grid gap-3 p-6 md:p-8">{lab.options.map((option, index) => <button key={option} onClick={() => setLabAnswers((value) => ({ ...value, [lab.id]: index }))} className={`rounded-xl border p-4 text-left ${labAnswers[lab.id] === index ? 'border-BLUE bg-violet-50' : 'border-slate-200 hover:border-slate-400'}`}><b className="mr-3">{String.fromCharCode(65 + index)}.</b>{option}</button>)}</div></section>)}</div>
            <div className="mt-8 flex justify-end"><button onClick={submit} disabled={labs.some((lab) => labAnswers[lab.id] === undefined)} className="rounded-xl bg-BLUE px-8 py-4 font-bold text-white shadow-xl disabled:opacity-40">Score my interview →</button></div>
          </motion.main>
        )}

        {screen === "result" && result && (
          <motion.main key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
            {(() => { const outcome = outcomeFor(result.score); const resultRole = roles.find((item) => item.id === result.role); return <>
              <div className="rounded-3xl bg-[#0b1020] p-7 text-white md:p-12"><div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-fuchsia-300">Candidate readiness report</p><h1 className="mt-4 text-3xl font-black md:text-5xl">{outcome.label}</h1><p className="mt-4 max-w-2xl text-lg text-slate-300">{outcome.message}</p><div className="mt-7 flex flex-wrap gap-3"><span className="rounded-full bg-white/10 px-4 py-2">{resultRole?.title}</span><span className="rounded-full bg-white/10 px-4 py-2">{levels.find((item) => item.id === result.level)?.name}</span></div></div><div className="grid h-44 w-44 place-items-center rounded-full border-[12px] border-PURPLE bg-white/5 text-center"><span><b className="block text-5xl">{result.score}</b><small className="text-slate-300">out of 100</small></span></div></div></div>
              <div className="mt-7 grid gap-6 lg:grid-cols-3"><section className="rounded-3xl border border-slate-200 bg-white p-6 lg:col-span-2"><h2 className="text-xl font-black">Skill breakdown</h2><div className="mt-6 grid gap-5">{result.categoryScores.map((item) => <div key={item.category}><div className="mb-2 flex justify-between text-sm"><b>{item.category}</b><span>{item.score}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-BLUE to-PURPLE" style={{ width: `${item.score}%` }} /></div></div>)}</div></section><section className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-sm font-bold uppercase tracking-widest text-PURPLE">Estimated salary</p><p className="mt-4 text-3xl font-black">{money.format(result.salary[0])}–{money.format(result.salary[1])}</p><p className="mt-2 text-sm text-slate-500">Estimated annual US base-salary range for this role and demonstrated readiness.</p><div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">This is a career-planning estimate, not a company offer or guarantee. Location, certification, experience, and employer affect actual pay.</div></section></div>
              <div className="mt-7 grid gap-6 lg:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><h2 className="text-xl font-black">Assessment evidence</h2><div className="mt-5 grid grid-cols-2 gap-4"><div className="rounded-2xl bg-slate-50 p-5"><b className="text-2xl">{result.interviewCorrect}/{questions.length}</b><span className="mt-1 block text-sm text-slate-500">Interview answers</span></div><div className="rounded-2xl bg-slate-50 p-5"><b className="text-2xl">{result.labCorrect}/{labs.length}</b><span className="mt-1 block text-sm text-slate-500">Practical labs</span></div></div><h3 className="mt-7 font-bold">Recommended next step</h3><p className="mt-2 leading-7 text-slate-600">{result.score >= 70 ? 'Prepare two project stories using the STAR method, then practise explaining SPL choices aloud for a technical panel.' : 'Review the weakest categories below, repeat the practical labs, and retake the simulation after focused study.'}</p></section><section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><h2 className="text-xl font-black">Priority learning plan</h2><div className="mt-5 space-y-3">{[...result.categoryScores].sort((a,b) => a.score-b.score).slice(0,3).map((item, index) => <div key={item.category} className="flex gap-4 rounded-2xl bg-slate-50 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-BLUE font-bold text-white">{index+1}</span><div><b>{item.category}</b><p className="mt-1 text-sm text-slate-500">Review core concepts and complete one focused practice search.</p></div></div>)}</div></section></div>
              <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-xl font-black">Question review</h2><p className="mt-1 text-sm text-slate-500">Understand the reasoning—not only the correct option.</p></div><button onClick={() => { setScreen('welcome'); window.scrollTo({top:0, behavior:'smooth'}); }} className="rounded-xl bg-BLUE px-6 py-3 font-bold text-white">Retake assessment</button></div><div className="mt-6 grid gap-4">{questions.map((question, index) => { const correct = result.answers[question.id] === question.answer; return <details key={question.id} className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer list-none font-semibold"><span className={`mr-3 inline-grid h-7 w-7 place-items-center rounded-full text-sm ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{correct ? '✓' : '×'}</span>{index + 1}. {question.prompt}</summary><div className="ml-10 mt-4 text-sm leading-6 text-slate-600"><p><b>Correct answer:</b> {question.options[question.answer]}</p><p className="mt-2">{question.explanation}</p></div></details>})}</div></section>
            </>; })()}
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomeSkill;
