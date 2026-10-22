import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiClipboard,
  FiFileText,
  FiHome,
  FiLayers,
  FiLoader,
  FiLock,
  FiMoon,
  FiRefreshCw,
  FiShield,
  FiSun,
  FiTarget,
  FiUser,
} from "react-icons/fi";
import Quiz from "./Quiz";

// Keep your current access list. Normalize it once to remove duplicates/case issues.
const AUTHORIZED_EMAILS = new Set(
  [
    "Kewizle.k@gmail.com",
    "kewizlek@gmail.com",
    "kewizle.k@gmail.com",
    "kevwe_oberiko@yahoo.com",
    "Davidayeni63@gmail.com",
    "Adesh25416@gmail.com",
    "davidayeni63@gmail.com",
    "adesh25416@gmail.com",
    "basseyvera018@gmail.com",
    "codeverseprogramming23@gmail.com",
    "ooolajuyigbe@gmail.com",
    "fadeleolutola@gmail.com",
    "jahdek76@gmail.com",
    "samuelsamuelmayowa@gmail.com",
    "oluwaferanmiolulana@gmail.com",
    "adenusitimi@gmail.com",
    "Adenusi.timi@gmail.com",
    "tomideolulana@gmail.com",
    "yinkalola51@gmail.com",
    "toanalyticsllc@gmail.com",
    "kevwe_oberiko@yahoo.com",
    "lybertyudochuu@gmail.com",
    "denisgsam@gmail.com",
    "oluwaferanmi.olulana@gmail.com",
    "fpasamuelmayowa51@gmail.com",
    "oluwatiroyeamoye@gmail.com",
    "trbanjo@gmail.com",
    "emanfrimpong@gmail.com",
    "oluwaferanmiolulana@gmail.com",
    "randommayowa@gmail.com",
    "dipeoluolatunji@gmail.com",
    "lybertyudochuu@gmail.com",
  ].map((email) => email.trim().toLowerCase())
);

const STAFF_EMAILS = new Set([
  "toanalyticsllc@gmail.com",
  "tomideolulana@gmail.com",
]);

const QUIZZES = [
  {
    id: "power-user",
    // Keep this API value identical to the old select option.
    apiName: "T.O Analytics Power User Exam Quiz",
    title: "Power User Practice Exam",
    subtitle: "Splunk search, reports, dashboards, and knowledge objects.",
    level: "Power User",
    category: "Certification preparation",
    icon: FiBookOpen,
    tone: "blue",
  },
  {
    id: "admin",
    apiName: "T.O Analytics Splunk Admin Exam Quiz",
    title: "Splunk Admin Practice Exam",
    subtitle: "Build confidence in Splunk administration and operations.",
    level: "Administrator",
    category: "Certification preparation",
    icon: FiLayers,
    tone: "violet",
  },
  {
    id: "splk-2002",
    // The unusual en dash + hyphen is retained for your existing backend route.
    apiName: "T.O Analytics –- SPLK-2002 Practice Quiz",
    title: "SPLK-2002 Practice Quiz",
    subtitle: "Additional assessment for authorized staff accounts.",
    level: "Staff only",
    category: "Special assessment",
    icon: FiShield,
    tone: "amber",
    staffOnly: true,
  },
];

const TONES = {
  blue: {
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    line: "bg-blue-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
    line: "bg-violet-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    line: "bg-amber-500",
  },
};

function getSavedEmail() {
  try {
    return (localStorage.getItem("user") || "").trim();
  } catch {
    return "";
  }
}

function getSavedTheme() {
  try {
    return localStorage.getItem("to-quiz-dark") === "true";
  } catch {
    return false;
  }
}

function QuizCard({ quiz, selected, onSelect }) {
  const Icon = quiz.icon;
  const tone = TONES[quiz.tone];

  return (
    <button
      type="button"
      onClick={() => onSelect(quiz.id)}
      aria-pressed={selected}
      className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
        selected
          ? "border-blue-400 bg-blue-50/80 shadow-[0_8px_26px_rgba(37,99,235,0.09)] ring-1 ring-blue-200 dark:border-blue-500 dark:bg-blue-500/10 dark:ring-blue-500/20"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600"
      }`}
    >
      {selected && <span className={`absolute bottom-0 left-0 top-0 w-1 ${tone.line}`} />}
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {quiz.level}
            </span>
            {selected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                <FiCheckCircle /> Selected
              </span>
            )}
          </div>
          <h3 className="mt-1 text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
            {quiz.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {quiz.subtitle}
          </p>
        </div>
        <FiChevronRight
          size={18}
          className={`mt-2 shrink-0 transition-transform group-hover:translate-x-1 ${
            selected ? "text-blue-600 dark:text-blue-300" : "text-slate-400"
          }`}
        />
      </div>
    </button>
  );
}

export default function MainQuiz() {
  const api = (import.meta.env.VITE_HOME_OO || "").replace(/\/$/, "");
  const [userEmail] = useState(getSavedEmail);
  const normalizedEmail = userEmail.toLowerCase();
  const isAllowed = AUTHORIZED_EMAILS.has(normalizedEmail);
  const isBoss = STAFF_EMAILS.has(normalizedEmail);
  const [darkMode, setDarkMode] = useState(getSavedTheme);

  const [assignments, setAssignments] = useState([]);
  const [assignmentStatus, setAssignmentStatus] = useState("loading");

  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const quizRequest = useRef(null);

  const availableQuizzes = useMemo(
    () => QUIZZES.filter((quiz) => !quiz.staffOnly || isBoss),
    [isBoss]
  );
  const selectedQuiz = availableQuizzes.find((quiz) => quiz.id === selectedQuizId);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("to-quiz-dark", String(darkMode));
    } catch {
      // Theme still works for the current page if storage is unavailable.
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isAllowed) return;

    const controller = new AbortController();
    fetch("https://to-backendapi-v1-kctb.onrender.com/api/assignment", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load assignments");
        return response.json();
      })
      .then((result) => {
        setAssignments(Array.isArray(result.data) ? result.data : []);
        setAssignmentStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setAssignmentStatus("error");
      });

    return () => controller.abort();
  }, [isAllowed]);

  useEffect(() => () => quizRequest.current?.abort(), []);

  const loadQuiz = async (quizId) => {
    const quiz = availableQuizzes.find((item) => item.id === quizId);
    if (!quiz) return;

    quizRequest.current?.abort();
    const controller = new AbortController();
    quizRequest.current = controller;

    setSelectedQuizId(quizId);
    setQuizData(null);
    setQuizError("");
    setQuizLoading(true);

    try {
      if (!api) throw new Error("Quiz API is not configured. Check VITE_HOME_OO.");
      const response = await fetch(
        `${api}/api/quiz/${encodeURIComponent(quiz.apiName)}`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error(`Unable to load quiz (${response.status}).`);

      const data = await response.json();
      if (!data) throw new Error("The quiz returned an empty response.");
      setQuizData(data);
    } catch (error) {
      if (error.name !== "AbortError") {
        setQuizError(error.message || "Unable to load this quiz. Please try again.");
      }
    } finally {
      if (quizRequest.current === controller) setQuizLoading(false);
    }
  };

  const resetSelection = () => {
    quizRequest.current?.abort();
    setSelectedQuizId(null);
    setQuizData(null);
    setQuizLoading(false);
    setQuizError("");
  };

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-14 text-slate-900 dark:bg-slate-950 dark:text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <FiLock size={30} />
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            T.O Analytics Learning
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Quiz access restricted</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The Splunk Quiz Center is available to approved students and staff.
            Please sign in using your registered student email.
          </p>
          {userEmail && (
            <div className="mt-6 break-all rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Signed in as <strong>{userEmail}</strong>
            </div>
          )}
          <NavLink
            to="/"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiHome /> Return to home <FiArrowRight />
          </NavLink>
          <p className="mt-5 text-xs text-slate-400">
            Need access? Contact T.O Analytics administration.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900 transition-colors dark:bg-[#0a1020] dark:text-white">
      {/* Simple dashboard navigation */}
      <header className="border-b border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <FiBookOpen size={20} />
            </div>
            <div>
              {/* <div className="text-[15px] font-extrabold leading-tight tracking-tight">T.O Analytics</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Student learning portal</div> */}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink
              to="/"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
            >
              <FiArrowLeft size={16} /> Home
            </NavLink>
            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-sm font-bold text-blue-700 dark:border-slate-700 dark:bg-blue-950 dark:text-blue-200">
              {userEmail.charAt(0).toUpperCase() || <FiUser />}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* Hero: no fake progress or scores */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-[#101b42] via-[#172b69] to-[#2456c7] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-10 sm:py-10 lg:px-12"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.055]" />
          <div className="pointer-events-none absolute bottom-[-130px] right-[10%] h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-50">
              <FiAward /> Splunk certification preparation
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[43px]">
              Practice with purpose.
              <span className="block text-blue-200">Get exam-ready.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-blue-100/90 sm:text-[15px]">
              Welcome to your Splunk Quiz Center. Choose a practice assessment,
              strengthen your knowledge, and take the next step in your learning journey.
            </p>
            <a
              href="#choose-quiz"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Explore assessments <FiArrowRight />
            </a>
          </div>
          <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5 text-xs text-blue-100/85 sm:gap-6">
            <span className="inline-flex items-center gap-2"><FiCheckCircle /> Guided practice</span>
            <span className="inline-flex items-center gap-2"><FiTarget /> Certification-focused</span>
            <span className="inline-flex items-center gap-2"><FiShield /> Student access</span>
          </div>
        </motion.section>

        {/* Stats are based only on data this component actually has */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <FiClipboard size={21} />
            </div>
            <div>
              <div className="text-2xl font-extrabold leading-none">{availableQuizzes.length}</div>
              <div className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Available assessments</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
              <FiFileText size={21} />
            </div>
            <div>
              <div className="text-2xl font-extrabold leading-none">
                {assignmentStatus === "ready" ? assignments.length : "—"}
              </div>
              <div className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {assignmentStatus === "loading" ? "Loading assignments…" : assignmentStatus === "error" ? "Assignments unavailable" : "Available assignments"}
              </div>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <FiUser size={21} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold leading-tight">{isBoss ? "Staff account" : "Student account"}</div>
              <div className="mt-1.5 truncate text-xs text-slate-500 dark:text-slate-400" title={userEmail}>{userEmail}</div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.6fr)]">
          {/* Left: clickable quiz list replaces the hard-to-scan dropdown */}
          <aside id="choose-quiz" className="min-w-0 scroll-mt-6">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">Your assessments</p>
                  <h2 className="mt-1 text-xl font-extrabold tracking-tight">Choose a quiz</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {availableQuizzes.length} quizzes
                </span>
              </div>
              <div className="space-y-3">
                {availableQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    selected={selectedQuizId === quiz.id}
                    onSelect={loadQuiz}
                  />
                ))}
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <FiShield className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-300" size={18} />
                <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Select any assessment to start practicing. You can switch to another quiz whenever you need to.
                </p>
              </div>
            </div>
          </aside>

          {/* Right: quiz workspace */}
          <section className="min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <FiTarget size={19} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Practice workspace</p>
                  <h2 className="text-base font-extrabold sm:text-lg">
                    {selectedQuiz ? selectedQuiz.title : "Ready when you are"}
                  </h2>
                </div>
              </div>
              {selectedQuiz && (
                <button
                  type="button"
                  onClick={resetSelection}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiArrowLeft /> All quizzes
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!selectedQuiz ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="px-5 py-12 sm:px-8 sm:py-16"
                >
                  <div className="mx-auto max-w-md text-center">
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <FiBookOpen size={38} />
                      <span className="absolute -bottom-2 -right-2 rounded-xl bg-white p-2 text-emerald-500 shadow-md dark:bg-slate-800">
                        <FiCheckCircle size={22} />
                      </span>
                    </div>
                    <h3 className="mt-7 text-2xl font-extrabold tracking-tight">Your next step starts here</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                      Choose a Splunk practice quiz from the panel to begin. Use each assessment to check your understanding and prepare with confidence.
                    </p>
                  </div>
                  <div className="mx-auto mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
                    {[
                      ["01", "Choose", "Select your quiz"],
                      ["02", "Practice", "Work through questions"],
                      ["03", "Learn", "Review your results"],
                    ].map(([number, title, description]) => (
                      <div key={number} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
                        <span className="text-[11px] font-extrabold tracking-wider text-blue-600 dark:text-blue-300">{number}</span>
                        <div className="mt-1 text-sm font-bold">{title}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedQuiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="min-w-0 px-4 py-5 sm:px-7 sm:py-7"
                >
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      {selectedQuiz.level}
                    </span>
                    <span className="text-xs text-slate-400">{selectedQuiz.category}</span>
                  </div>

                  {quizLoading ? (
                    <div role="status" className="flex min-h-[310px] flex-col items-center justify-center text-center">
                      <FiLoader className="animate-spin text-4xl text-blue-600 dark:text-blue-300" />
                      <h3 className="mt-5 text-lg font-bold">Preparing your assessment</h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading questions from your quiz center…</p>
                    </div>
                  ) : quizError ? (
                    <div role="alert" className="flex min-h-[310px] flex-col items-center justify-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                        <FiLock size={25} />
                      </div>
                      <h3 className="mt-4 text-lg font-bold">Couldn’t open this quiz</h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{quizError}</p>
                      <button
                        type="button"
                        onClick={() => loadQuiz(selectedQuiz.id)}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <FiRefreshCw /> Try again
                      </button>
                    </div>
                  ) : quizData ? (
                    <div className="min-w-0 text-slate-800 dark:text-slate-100 [&_*]:max-w-full">
                      <Quiz data={quizData} />
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <footer className="mt-11 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>© {new Date().getFullYear()} T.O Analytics LLC. All rights reserved.</p>
          <p>Learn • Practice • Grow</p>
        </footer>
      </main>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import Quiz from "./Quiz";
// import { NavLink } from "react-router-dom";
// import { FiBookOpen, FiLock, FiLoader } from "react-icons/fi";
// import { motion, AnimatePresence } from "framer-motion";

// const MainQuiz = () => {
//   const api = import.meta.env.VITE_HOME_OO;

//   const allowedEmails = [
//     "Kewizle.k@gmail.com",
//      "kewizlek@gmail.com",
//     "kewizle.k@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "Davidayeni63@gmail.com",
//     "Adesh25416@gmail.com",
//     "davidayeni63@gmail.com",
//     "adesh25416@gmail.com",

//     "basseyvera018@gmail.com",
//     "codeverseprogramming23@gmail.com",
//     "ooolajuyigbe@gmail.com",
//     "fadeleolutola@gmail.com",
//     "jahdek76@gmail.com",
//     "samuelsamuelmayowa@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "adenusitimi@gmail.com",
//     "Adenusi.timi@gmail.com",
//     "tomideolulana@gmail.com",
//     "yinkalola51@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "lybertyudochuu@gmail.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "randommayowa@gmail.com",
//     "dipeoluolatunji@gmail.com",
//     "lybertyudochuu@gmail.com",
//   ];

//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedQuiz, setSelectedQuiz] = useState("");
//   const [quizData, setQuizData] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);
//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);
//   // ✅ Load user email from localStorage
//   useEffect(() => {
//     const email = localStorage.getItem("user");
//     setUserEmail(email);

//     if (email) {
//       const normalized = email.toLowerCase();
//       const allowed = allowedEmails.map((e) => e.toLowerCase());
//       setIsAllowed(allowed.includes(normalized));
//     }
//   }, []);

//   // ✅ Fetch assignments
//   useEffect(() => {
//     if (isAllowed) {
//       fetch("https://to-backendapi-v1-kctb.onrender.com/api/assignment")
//         .then((res) => res.json())
//         .then((data) => {
//           setAssignments(data.data || []);
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Error fetching assignments:", err);
//           setLoading(false);
//         });
//     } else {
//       setLoading(false);
//     }
//   }, [isAllowed]);

//   // ✅ Load specific quiz
//   const loadQuiz = async (quizName) => {
//     if (!quizName) return;
//     setSelectedQuiz(quizName);
//     try {
//       const res = await fetch(`${api}/api/quiz/${quizName}`);
//       const data = await res.json();
//       setQuizData(data);
//     } catch (err) {
//       console.error("Error loading quiz:", err);
//     }
//   };
//   const bossEmail = ["toanalyticsllc@gmail.com", "tomideolulana@gmail.com"];
//   const isBoss = bossEmail.includes(userEmail?.toLowerCase());
//   // 🌀 Loading Animation
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100">
//         <FiLoader className="animate-spin text-blue-500 text-6xl mb-4" />
//         <h2 className="text-lg font-semibold text-gray-600 animate-pulse">
//           Loading your quiz center...
//         </h2>
//       </div>
//     );
//   }

//   // 🚫 Access Denied
//   if (!isAllowed) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-red-50 text-center px-6"
//       >
//         <FiLock className="text-red-500 text-7xl mb-6 animate-bounce" />
//         <h1 className="text-3xl font-bold text-red-600 mb-2">
//           Access Denied 🚫
//         </h1>
//         <p className="text-gray-700 text-lg mb-4 max-w-md">
//           Only verified <span className="font-semibold">To-Analytics</span>{" "}
//           members have access to the Splunk Quiz Center.
//         </p>
//         {userEmail ? (
//           <p className="text-sm text-gray-500">
//             Your email: <span className="font-medium">{userEmail}</span>
//           </p>
//         ) : (
//           <p className="text-sm text-gray-500">
//             Please log in with your authorized account.
//           </p>
//         )}
//         <NavLink
//           to="/"
//           className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:scale-[1.03] transition-all duration-300"
//         >
//           Go Back Home
//         </NavLink>
//       </motion.div>
//     );
//   }

//   // 🎯 Main Content
//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950 py-16 px-8 text-gray-900 dark:text-gray-100">
//       {/* HEADER */}
//       <div className="max-w-7xl mx-auto mb-10 px-4">
//         <div className="dashboard-topbar bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//               Quiz Results
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               View all your past test performances
//             </p>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="text-sm text-gray-600 dark:text-gray-300">
//               {userEmail}
//             </div>


//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className="px-3 py-1 rounded-lg text-sm 
//             bg-gray-100 text-gray-800 
//             dark:bg-gray-800 dark:text-white
//             border border-gray-300 dark:border-gray-700
//             hover:bg-gray-200 dark:hover:bg-gray-700 transition"
//             >
//               {darkMode ? "Light Mode" : "Dark Mode"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* TITLE */}
//       <motion.h2
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-4xl font-extrabold mb-10 text-gray-900 dark:text-white text-center"
//       >
//         <FiBookOpen className="inline-block mb-1 mr-3 text-blue-600" />
//         Splunk Quiz Center
//       </motion.h2>

//       {/* MAIN LAYOUT */}
//       <div className="grid md:grid-cols-5 gap-10 max-w-7xl mx-auto">
//         {/* LEFT: QUIZ SELECTOR */}
//         <motion.div
//           initial={{ x: -30, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//           className="col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow"
//         >
//           <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
//             Select Your Quiz
//           </h3>

//           <select
//             value={selectedQuiz}
//             onChange={(e) => loadQuiz(e.target.value)}
//             className="p-3 w-full border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
//           >
//             <option value="">-- Choose a Quiz --</option>
            
            
          
//             {isBoss && (
//               <option value="T.O Analytics –- SPLK-2002 Practice Quiz">
//                 T.O Analytics – SPLK-2002 Practice Quiz
//               </option>
//             )}

//             <option value="T.O Analytics Power User Exam Quiz">
//               Power User Exam
//             </option>
//             <option value="T.O Analytics Splunk Admin Exam Quiz">
//               Admin Exam
//             </option>
//           </select>

//           {selectedQuiz && (
//             <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Currently Selected:
//               </p>
//               <h4 className="font-semibold text-blue-600 mt-1">
//                 {selectedQuiz}
//               </h4>
//             </div>
//           )}
//         </motion.div>

//         {/* RIGHT: QUIZ DISPLAY */}
//         <AnimatePresence>
//           {quizData && (
//             <motion.div
//               key="quiz"
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 20 }}
//               transition={{ duration: 0.6 }}
//               className="col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8"
//             >
//               {/* <Quiz data={quizData} /> */}
//               <div className="text-gray-800 dark:text-gray-100">
//                 <Quiz data={quizData} />
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* FOOTER */}
//       <div className="mt-16 text-center text-gray-400 text-sm">
//         <p>
//           © {new Date().getFullYear()}{" "}
//           <span className="font-semibold text-blue-600">T.O Analytics</span> —
//           Empowering Learners with Data Mastery.
//         </p>
//       </div>
//     </div>
//   );
