

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  FaArrowRight,
  FaBolt,
  FaBookOpen,
  FaBrain,
  FaChartLine,
  FaCheck,
  FaCirclePlay,
  FaClock,
  FaCode,
  FaDatabase,
  FaFire,
  FaFlask,
  FaLayerGroup,
  FaLightbulb,
  FaMagnifyingGlass,
  FaRotateRight,
  FaShieldHalved,
  FaTable,
  FaTerminal,
  FaTriangleExclamation,
  FaXmark,
  FaServer,
  FaGaugeHigh,
  FaNetworkWired,
} from "react-icons/fa6";
import api from "../lib/api";

const pageMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const panelMotion = {
  hidden: { opacity: 0, scale: 0.98, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function getColumns(results) {
  const first = results?.[0] || {};
  return Object.keys(first).filter((key) => !key.startsWith("__"));
}

function getDifficultyClass(difficulty = "") {
  const level = difficulty.toLowerCase();

  if (level.includes("hard") || level.includes("advanced")) {
    return "border-rose-400/25 bg-rose-500/10 text-rose-100";
  }

  if (level.includes("medium") || level.includes("intermediate")) {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }

  return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
}

export default function SplunkPracticeLab() {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [search, setSearch] = useState("");
  const [showMobileLabs, setShowMobileLabs] = useState(false);

  const columns = useMemo(() => getColumns(results), [results]);

  const filteredLabs = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return labs;

    return labs.filter(
      (lab) =>
        lab.title?.toLowerCase().includes(term) ||
        lab.category?.toLowerCase().includes(term) ||
        lab.difficulty?.toLowerCase().includes(term) ||
        lab.index?.toLowerCase().includes(term),
    );
  }, [labs, search]);

  const totalScore = useMemo(() => {
    return attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  }, [attempts]);

  const completedQuestions = useMemo(() => {
    return attempts.filter((attempt) => attempt.correct).length;
  }, [attempts]);

  const currentLabAttempts = useMemo(() => {
    if (!selectedLab) return [];
    return attempts.filter((attempt) => attempt.labId === selectedLab.id);
  }, [attempts, selectedLab]);

  const currentQuestionAttempt = useMemo(() => {
    if (!selectedQuestion) return null;
    return attempts.find((attempt) => attempt.questionId === selectedQuestion.id);
  }, [attempts, selectedQuestion]);

  const labProgress = useMemo(() => {
    if (!selectedLab?.questions?.length) return 0;

    const correctForLab = selectedLab.questions.filter((question) =>
      attempts.some(
        (attempt) => attempt.questionId === question.id && attempt.correct,
      ),
    ).length;

    return Math.round((correctForLab / selectedLab.questions.length) * 100);
  }, [selectedLab, attempts]);

  const correctInCurrentLab = useMemo(() => {
    if (!selectedLab?.questions?.length) return 0;

    return selectedLab.questions.filter((question) =>
      attempts.some(
        (attempt) => attempt.questionId === question.id && attempt.correct,
      ),
    ).length;
  }, [selectedLab, attempts]);

  useEffect(() => {
    loadLabs();
    loadAttempts();
  }, []);

  async function loadLabs() {
    try {
      setLoadingLabs(true);

      const res = await api.get("/labs");
      const nextLabs = res.data.labs || [];

      setLabs(nextLabs);

      if (nextLabs.length) {
        await openLab(nextLabs[0].id);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load labs");
    } finally {
      setLoadingLabs(false);
    }
  }

  async function loadAttempts() {
    try {
      const res = await api.get("/splunk/attempts");
      setAttempts(res.data.attempts || []);
    } catch {
      setAttempts([]);
    }
  }

  async function openLab(labId) {
    try {
      const res = await api.get(`/labs/${labId}`);
      const lab = res.data.lab;
      const firstQuestion = lab.questions?.[0] || null;

      setSelectedLab(lab);
      setSelectedQuestion(firstQuestion);
      setQuery(firstQuestion?.starterQuery || `index=${lab.index}`);
      setResults([]);
      setActiveTab("results");
      setShowMobileLabs(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to open lab");
    }
  }

  function selectQuestion(question) {
    setSelectedQuestion(question);
    setQuery(question.starterQuery || `index=${selectedLab.index}`);
    setResults([]);
    setActiveTab("results");
  }

  async function runQuery() {
    if (!query.trim()) {
      toast.error("Write an SPL query first");
      return;
    }

    try {
      setRunning(true);

      const res = await api.post("/splunk/run", {
        query,
        earliest_time: "-7d",
        latest_time: "now",
      });

      setResults(res.data.results || []);
      setActiveTab("results");

      toast.success(
        `Query ran successfully. ${res.data.results?.length || 0} row(s) returned.`,
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to run SPL query");
    } finally {
      setRunning(false);
    }
  }

  async function submitAnswer() {
    if (!selectedLab || !selectedQuestion) return;

    try {
      setSubmitting(true);

      const res = await api.post("/splunk/submit", {
        labId: selectedLab.id,
        questionId: selectedQuestion.id,
        query,
      });

      setResults(res.data.results || []);
      setAttempts((prev) => [res.data.attempt, ...prev]);
      setActiveTab("feedback");

      if (res.data.grade.correct) {
        toast.success(`Correct! Score: ${res.data.grade.score}`);
      } else {
        toast.warning(res.data.grade.feedback);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  function resetEditor() {
    setQuery(
      selectedQuestion?.starterQuery || `index=${selectedLab?.index || "student_lab"}`,
    );
    setResults([]);
  }

  if (loadingLabs) {
    return <LoadingScreen />;
  }

  return (
    <motion.main
      variants={pageMotion}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-[#02040d] text-white"
    >
      <CyberBackground />

      <div className="relative z-10 mx-auto max-w-[1920px] px-4 py-5 sm:px-6 lg:px-8">
        <motion.header variants={fadeUp} className="mb-5">
          <HeroConsole
            labs={labs}
            selectedLab={selectedLab}
            totalScore={totalScore}
            completedQuestions={completedQuestions}
            labProgress={labProgress}
            correctInCurrentLab={correctInCurrentLab}
            setShowMobileLabs={setShowMobileLabs}
          />
        </motion.header>

        <AnimatePresence>
          {showMobileLabs && (
            <MobileLabDrawer
              labs={filteredLabs}
              selectedLab={selectedLab}
              search={search}
              setSearch={setSearch}
              openLab={openLab}
              onClose={() => setShowMobileLabs(false)}
            />
          )}
        </AnimatePresence>

        <div className="grid grid-cols-12 gap-5">
          <motion.aside
            variants={fadeUp}
            className="hidden xl:col-span-3 xl:block"
          >
            <LabLibrary
              labs={filteredLabs}
              selectedLab={selectedLab}
              search={search}
              setSearch={setSearch}
              openLab={openLab}
            />
          </motion.aside>

          <motion.section
            variants={fadeUp}
            className="col-span-12 xl:col-span-6"
          >
            <InvestigationWorkspace
              selectedLab={selectedLab}
              selectedQuestion={selectedQuestion}
              attempts={attempts}
              labProgress={labProgress}
              query={query}
              setQuery={setQuery}
              running={running}
              submitting={submitting}
              runQuery={runQuery}
              submitAnswer={submitAnswer}
              resetEditor={resetEditor}
              selectQuestion={selectQuestion}
            />
          </motion.section>

          <motion.aside
            variants={fadeUp}
            className="col-span-12 xl:col-span-3"
          >
            <OutputDeck
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              results={results}
              columns={columns}
              attempts={attempts}
              currentLabAttempts={currentLabAttempts}
              currentQuestionAttempt={currentQuestionAttempt}
            />
          </motion.aside>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </motion.main>
  );
}

function LoadingScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02040d] px-6 text-white">
      <CyberBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 shadow-2xl shadow-cyan-500/10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-200" />
        </div>

        <h1 className="mt-7 text-3xl font-black tracking-tight md:text-4xl">
          Booting Splunk Range
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-300">
          Loading investigations, student attempts, lab indexes, and the secure SPL console.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 text-left">
          {["Labs", "SPL", "Grader"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="mb-3 h-2 rounded-full bg-cyan-300/50" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">
                {item}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}

function CyberBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-cyan-500/20 blur-[150px]" />
      <div className="absolute -bottom-56 right-[-180px] h-[720px] w-[720px] rounded-full bg-blue-600/20 blur-[170px]" />
      <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[160px]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#02040d_78%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-400/10 to-transparent" />
    </div>
  );
}

function HeroConsole({
  labs,
  selectedLab,
  totalScore,
  completedQuestions,
  labProgress,
  correctInCurrentLab,
  setShowMobileLabs,
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
      <div className="absolute right-8 top-8 hidden h-40 w-40 rounded-full border border-cyan-300/10 lg:block" />
      <div className="absolute right-16 top-16 hidden h-24 w-24 rounded-full border border-cyan-300/20 lg:block" />

      <div className="relative z-10 grid gap-7 2xl:grid-cols-[1fr_720px] 2xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-200 text-slate-950">
                <FaFlask />
              </span>
              Splunk Practical Range
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              Live Training Mode
            </span>
          </div>

          <h1 className="mt-6 max-w-6xl text-4xl font-black leading-[0.98] tracking-tight text-white md:text-6xl xl:text-7xl">
            Build Real Splunk Skill Inside a SOC-Style Lab.
          </h1>

          <p className="mt-5 max-w-3xl text-sm font-medium leading-7 text-slate-300 md:text-base">
            Students choose an investigation, write SPL, run searches against safe lab data,
            submit answers, and receive instant grading feedback like a real blue-team analyst.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => setShowMobileLabs(true)}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-200 px-5 py-4 text-sm font-black text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:-translate-y-1 hover:bg-white xl:hidden"
            >
              <FaLayerGroup />
              Open Lab Library
            </button>

            <Pill icon={<FaDatabase />} label="Active Index" value={selectedLab?.index || "student_lab"} />
            <Pill icon={<FaShieldHalved />} label="Runner" value="Safe SPL" />
            <Pill icon={<FaClock />} label="Window" value="Last 7 Days" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricTile icon={<FaBookOpen />} value={labs.length} label="Total Labs" />
          <MetricTile icon={<FaCheck />} value={completedQuestions} label="Correct" />
          <MetricTile icon={<FaChartLine />} value={totalScore} label="Score" />
          <ProgressTile value={labProgress} label="Lab Progress" done={correctInCurrentLab} total={selectedLab?.questions?.length || 0} />
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, label, value }) {
  return (
    <span className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left shadow-inner shadow-white/5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
        {icon}
      </span>
      <span>
        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
          {label}
        </span>
        <span className="mt-1 block max-w-[170px] truncate text-sm font-black text-white">
          {value}
        </span>
      </span>
    </span>
  );
}

function MetricTile({ icon, value, label }) {
  return (
    <motion.div
      variants={panelMotion}
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.08]"
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />
      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          {icon}
        </div>
        <h3 className="truncate text-3xl font-black tracking-tight text-white">
          {value}
        </h3>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/35">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function ProgressTile({ value, label, done, total }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      variants={panelMotion}
      className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 shadow-xl shadow-black/20"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 88 88">
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-cyan-200 transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-black">
            {value}%
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black text-white">{label}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
            {done}/{total} cleared
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function MobileLabDrawer({ labs, selectedLab, search, setSearch, openLab, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 p-3 backdrop-blur-xl xl:hidden"
    >
      <motion.div
        initial={{ x: -28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -28, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#050816] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
              Training Range
            </p>
            <h2 className="mt-1 text-2xl font-black">Lab Library</h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white hover:text-slate-950"
          >
            <FaXmark />
          </button>
        </div>

        <div className="h-[calc(100%-81px)] overflow-y-auto p-4">
          <LabLibrary
            labs={labs}
            selectedLab={selectedLab}
            search={search}
            setSearch={setSearch}
            openLab={openLab}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function LabLibrary({ labs, selectedLab, search, setSearch, openLab }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
            Lab Library
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Choose Mission</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
            Search, select, and start a guided SOC investigation.
          </p>
        </div>

        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 sm:flex xl:hidden 2xl:flex">
          <FaNetworkWired />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-cyan-300/30">
        <FaMagnifyingGlass className="text-white/35" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labs, index, category..."
          className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
        />
      </div>

      <div className="space-y-3">
        {labs.length ? (
          labs.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              active={selectedLab?.id === lab.id}
              onClick={() => openLab(lab.id)}
            />
          ))
        ) : (
          <EmptyState
            icon={<FaMagnifyingGlass />}
            title="No labs found"
            text="Try a different keyword or clear your search."
          />
        )}
      </div>
    </div>
  );
}

function LabCard({ lab, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-[1.35rem] border p-4 text-left transition duration-300 hover:-translate-y-1 ${
        active
          ? "border-cyan-300/35 bg-cyan-200 text-slate-950 shadow-xl shadow-cyan-950/25"
          : "border-white/10 bg-black/20 text-white hover:border-cyan-300/25 hover:bg-white/[0.08]"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          active ? "bg-slate-950" : "bg-cyan-300/50"
        }`}
      />

      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="line-clamp-2 font-black leading-6">{lab.title}</p>
          <p className={`mt-2 text-xs font-bold ${active ? "text-slate-700" : "text-white/45"}`}>
            {lab.category || "Investigation"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
            active
              ? "border-slate-950/10 bg-slate-950 text-white"
              : getDifficultyClass(lab.difficulty)
          }`}
        >
          {lab.difficulty || "Lab"}
        </span>
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-2 pl-2 text-xs font-black ${active ? "text-slate-700" : "text-white/55"}`}>
        <span className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2">
          <FaClock />
          {lab.estimatedMinutes || 0} min
        </span>
        <span className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2">
          <FaBrain />
          {lab.questionCount || lab.questions?.length || 0} tasks
        </span>
      </div>

      <div className={`mt-4 flex items-center justify-between border-t pt-4 pl-2 ${active ? "border-slate-950/10" : "border-white/10"}`}>
        <span className={`text-xs font-black uppercase tracking-[0.18em] ${active ? "text-slate-700" : "text-white/35"}`}>
          Open Mission
        </span>
        <FaArrowRight className="transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function InvestigationWorkspace({
  selectedLab,
  selectedQuestion,
  attempts,
  labProgress,
  query,
  setQuery,
  running,
  submitting,
  runQuery,
  submitAnswer,
  resetEditor,
  selectQuestion,
}) {
  if (!selectedLab) {
    return (
      <CommandPanel>
        <EmptyState
          icon={<FaFlask />}
          title="No lab selected"
          text="Choose a lab from the library to begin practicing."
        />
      </CommandPanel>
    );
  }

  return (
    <div className="space-y-5">
      <CommandPanel>
        <ScenarioBrief selectedLab={selectedLab} labProgress={labProgress} />
      </CommandPanel>

      <MissionTimeline
        questions={selectedLab.questions || []}
        attempts={attempts}
        selectedQuestion={selectedQuestion}
        selectQuestion={selectQuestion}
      />

      <CommandPanel>
        {selectedQuestion ? (
          <TaskConsole
            selectedLab={selectedLab}
            selectedQuestion={selectedQuestion}
            query={query}
            setQuery={setQuery}
            running={running}
            submitting={submitting}
            runQuery={runQuery}
            submitAnswer={submitAnswer}
            resetEditor={resetEditor}
          />
        ) : (
          <EmptyState
            icon={<FaTerminal />}
            title="No task selected"
            text="Choose a task to unlock the SPL editor."
          />
        )}
      </CommandPanel>
    </div>
  );
}

function CommandPanel({ children }) {
  return (
    <motion.div
      variants={panelMotion}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur-2xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      {children}
    </motion.div>
  );
}

function ScenarioBrief({ selectedLab, labProgress }) {
  return (
    <div className="relative p-5 md:p-6">
      <div className="absolute right-5 top-5 text-8xl font-black leading-none text-white/[0.025] md:text-9xl">
        SOC
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
              <FaServer />
              Scenario Brief
            </p>
            <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider ${getDifficultyClass(selectedLab.difficulty)}`}>
              {selectedLab.difficulty || "Training"}
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight md:text-5xl">
            {selectedLab.title}
          </h2>

          <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300">
            {selectedLab.scenario}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Badge icon={<FaClock />}>{selectedLab.estimatedMinutes || 0} minutes</Badge>
            <Badge icon={<FaBrain />}>{selectedLab.questionCount || selectedLab.questions?.length || 0} tasks</Badge>
            <Badge icon={<FaDatabase />}>{selectedLab.index || "student_lab"}</Badge>
            <Badge icon={<FaChartLine />}>{labProgress}% progress</Badge>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
            Learning Goals
          </p>

          {selectedLab.learningGoals?.length > 0 ? (
            <div className="mt-4 space-y-3">
              {selectedLab.learningGoals.slice(0, 5).map((goal) => (
                <div key={goal} className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-300">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-[10px] text-cyan-100">
                    <FaCheck />
                  </span>
                  {goal}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium leading-6 text-slate-400">
              Practice searching, filtering, aggregating, and presenting investigation results.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MissionTimeline({ questions, attempts, selectedQuestion, selectQuestion }) {
  return (
    <motion.div variants={panelMotion} className="grid gap-3 md:grid-cols-3">
      {questions.map((question, index) => {
        const hasCorrectAttempt = attempts.some(
          (attempt) => attempt.questionId === question.id && attempt.correct,
        );
        const active = selectedQuestion?.id === question.id;

        return (
          <button
            key={question.id}
            onClick={() => selectQuestion(question)}
            className={`group relative overflow-hidden rounded-[1.5rem] border p-4 text-left shadow-xl shadow-black/10 transition hover:-translate-y-1 ${
              active
                ? "border-cyan-300/40 bg-cyan-200 text-slate-950"
                : "border-white/10 bg-white/[0.055] text-white backdrop-blur-2xl hover:border-cyan-300/25 hover:bg-white/[0.08]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${
                  hasCorrectAttempt
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-slate-950 text-cyan-100"
                      : "bg-cyan-300/10 text-cyan-100"
                }`}
              >
                {hasCorrectAttempt ? <FaCheck /> : index + 1}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  active ? "bg-slate-950/10 text-slate-700" : "bg-white/10 text-white/50"
                }`}
              >
                {question.points || 0} pts
              </span>
            </div>

            <h3 className="mt-4 line-clamp-2 font-black leading-6">
              {question.title}
            </h3>

            <p className={`mt-2 line-clamp-2 text-xs font-semibold leading-5 ${active ? "text-slate-700" : "text-slate-400"}`}>
              {question.task}
            </p>
          </button>
        );
      })}
    </motion.div>
  );
}

function TaskConsole({
  selectedLab,
  selectedQuestion,
  query,
  setQuery,
  running,
  submitting,
  runQuery,
  submitAnswer,
  resetEditor,
}) {
  const lineCount = query ? query.split("\n").length : 1;

  return (
    <div className="p-5 md:p-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            <FaTerminal />
            Active Task
          </p>

          <h3 className="mt-5 text-2xl font-black tracking-tight md:text-3xl">
            {selectedQuestion.title}
          </h3>

          <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
            {selectedQuestion.task}
          </p>
        </div>

        <div className="rounded-[1.35rem] border border-amber-300/15 bg-amber-300/10 p-4 text-amber-50">
          <p className="flex items-center gap-2 text-sm font-black">
            <FaLightbulb />
            Analyst Hint
          </p>
          <p className="mt-3 text-xs font-medium leading-6 text-amber-50/75">
            {selectedQuestion.hint || "Start with the lab index, then filter, aggregate, and compare your output with the task."}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#02040d] shadow-2xl shadow-black/25">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100">
              <FaCode />
            </span>
            SPL Command Editor
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-100">
              Safe Mode
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-black text-white/45">
              {lineCount} line{lineCount === 1 ? "" : "s"}
            </span>
            <button
              onClick={resetEditor}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-slate-200 transition hover:bg-white hover:text-slate-950"
            >
              <FaRotateRight />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[56px_1fr]">
          <div className="select-none border-r border-white/10 bg-black/20 py-5 text-right font-mono text-xs font-bold leading-7 text-white/20">
            {Array.from({ length: Math.max(lineCount, 8) }).map((_, index) => (
              <div key={index} className="px-3">
                {index + 1}
              </div>
            ))}
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            className="min-h-[260px] w-full resize-y bg-transparent p-5 font-mono text-sm font-semibold leading-7 text-cyan-100 outline-none placeholder:text-white/25"
            placeholder={`index=${selectedLab?.index || "student_lab"} status=failed | stats count by user | sort -count`}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          onClick={runQuery}
          disabled={running || submitting}
          className="group flex items-center justify-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-200 px-6 py-4 font-black text-slate-950 shadow-xl shadow-cyan-950/25 transition hover:-translate-y-1 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? <Spinner /> : <FaCirclePlay className="transition group-hover:scale-110" />}
          {running ? "Running SPL..." : "Run Query"}
        </button>

        <button
          onClick={submitAnswer}
          disabled={running || submitting}
          className="group flex items-center justify-center gap-3 rounded-2xl border border-blue-300/20 bg-blue-600 px-6 py-4 font-black text-white shadow-xl shadow-blue-950/30 transition hover:-translate-y-1 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Spinner /> : <FaBolt className="transition group-hover:scale-110" />}
          {submitting ? "Grading..." : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}

function OutputDeck({
  activeTab,
  setActiveTab,
  results,
  columns,
  attempts,
  currentLabAttempts,
  currentQuestionAttempt,
}) {
  return (
    <div className="sticky top-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
            Analyst Output
          </p>
          <h2 className="mt-2 text-2xl font-black">Evidence Deck</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
          <FaGaugeHigh />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-[1.25rem] border border-white/10 bg-black/25 p-2">
        <button
          onClick={() => setActiveTab("results")}
          className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
            activeTab === "results"
              ? "bg-cyan-200 text-slate-950"
              : "text-slate-300 hover:bg-white/10"
          }`}
        >
          Results
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
            activeTab === "feedback"
              ? "bg-cyan-200 text-slate-950"
              : "text-slate-300 hover:bg-white/10"
          }`}
        >
          Feedback
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "results" ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <ResultsPanel results={results} columns={columns} />
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <FeedbackPanel
              attempts={attempts}
              currentLabAttempts={currentLabAttempts}
              currentQuestionAttempt={currentQuestionAttempt}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultsPanel({ results, columns }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xl font-black">
          <FaTable className="text-cyan-100" />
          Results
        </h3>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-white/50">
          {results.length} rows
        </span>
      </div>

      {results.length ? (
        <div className="max-h-[660px] overflow-auto rounded-2xl border border-white/10 bg-[#02040d]">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-white/10 bg-cyan-200 text-slate-950">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-3 py-3 font-black">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {results.slice(0, 50).map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-white/10 odd:bg-white/[0.035] hover:bg-cyan-300/[0.07]"
                >
                  {columns.map((column) => (
                    <td key={column} className="whitespace-nowrap px-3 py-3 font-semibold text-slate-300">
                      {String(row[column] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FaTable />}
          title="No results yet"
          text="Run an SPL query to see returned rows here."
        />
      )}
    </div>
  );
}

function FeedbackPanel({ attempts, currentLabAttempts, currentQuestionAttempt }) {
  const history = currentLabAttempts.length ? currentLabAttempts : attempts;

  return (
    <div className="space-y-4">
      {currentQuestionAttempt && (
        <div
          className={`rounded-[1.5rem] border p-4 ${
            currentQuestionAttempt.correct
              ? "border-emerald-400/20 bg-emerald-500/10"
              : "border-amber-300/20 bg-amber-400/10"
          }`}
        >
          <p
            className={`text-xs font-black uppercase tracking-[0.22em] ${
              currentQuestionAttempt.correct ? "text-emerald-200" : "text-amber-100"
            }`}
          >
            Current Question
          </p>

          <h3 className="mt-3 text-2xl font-black">
            {currentQuestionAttempt.correct ? "Correct Answer" : "Needs Review"}
          </h3>

          <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
            {currentQuestionAttempt.feedback}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Score
              </p>
              <p className="mt-2 text-3xl font-black">{currentQuestionAttempt.score} pts</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Status
              </p>
              <p className="mt-2 text-sm font-black">
                {currentQuestionAttempt.correct ? "Cleared" : "Retry"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-black">
          <FaShieldHalved className="text-cyan-100" />
          Attempt History
        </h3>

        {history.length ? (
          <div className="max-h-[640px] space-y-3 overflow-y-auto pr-1">
            {history.slice(0, 8).map((attempt) => (
              <div key={attempt.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      attempt.correct
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-amber-500/15 text-amber-100"
                    }`}
                  >
                    {attempt.correct ? "Correct" : "Review"}
                  </span>

                  <span className="text-sm font-black text-white">{attempt.score} pts</span>
                </div>

                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                  {attempt.feedback}
                </p>

                {attempt.query && (
                  <pre className="mt-3 max-h-36 overflow-auto rounded-xl border border-white/10 bg-[#02040d] p-3 text-xs font-semibold leading-6 text-cyan-100">
                    {attempt.query}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FaTriangleExclamation />}
            title="No feedback yet"
            text="Submit an answer and the grader feedback will show here."
          />
        )}
      </div>
    </div>
  );
}

function Badge({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-xs font-bold text-slate-300">
      <span className="text-cyan-100">{icon}</span>
      {children}
    </span>
  );
}

function Spinner() {
  return <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl text-white/45">
        {icon}
      </div>
      <h4 className="mt-5 text-xl font-black">{title}</h4>
      <p className="mt-2 text-sm font-medium leading-7 text-slate-400">{text}</p>
    </div>
  );
}


// 
// import { useEffect, useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import { Toaster, toast } from "sonner";
// import {
//   FaArrowRight,
//   FaBookOpen,
//   FaBrain,
//   FaChartLine,
//   FaCheck,
//   FaCirclePlay,
//   FaClock,
//   FaCode,
//   FaDatabase,
//   FaFire,
//   FaFlask,
//   FaLightbulb,
//   FaMagnifyingGlass,
//   FaRotateRight,
//   FaShieldHalved,
//   FaTable,
//   FaTerminal,
//   FaTriangleExclamation,
// } from "react-icons/fa6";
// import api from "../lib/api";

// const pageMotion = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.08 } },
// };

// const fadeUp = {
//   hidden: { opacity: 0, y: 35 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
// };

// function getColumns(results) {
//   const first = results?.[0] || {};
//   return Object.keys(first).filter((key) => !key.startsWith("__"));
// }

// export default function SplunkPracticeLab() {
//   const [labs, setLabs] = useState([]);
//   const [selectedLab, setSelectedLab] = useState(null);
//   const [selectedQuestion, setSelectedQuestion] = useState(null);
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [attempts, setAttempts] = useState([]);
//   const [loadingLabs, setLoadingLabs] = useState(true);
//   const [running, setRunning] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [activeTab, setActiveTab] = useState("results");
//   const [search, setSearch] = useState("");

//   const columns = useMemo(() => getColumns(results), [results]);

//   const filteredLabs = useMemo(() => {
//     const term = search.toLowerCase();
//     return labs.filter(
//       (lab) =>
//         lab.title.toLowerCase().includes(term) ||
//         lab.category.toLowerCase().includes(term) ||
//         lab.difficulty.toLowerCase().includes(term),
//     );
//   }, [labs, search]);

//   const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
//   const completedQuestions = attempts.filter((attempt) => attempt.correct).length;

//   useEffect(() => {
//     loadLabs();
//     loadAttempts();
//   }, []);

//   async function loadLabs() {
//     try {
//       setLoadingLabs(true);
//       const res = await api.get("/labs");
//       const nextLabs = res.data.labs || [];
//       setLabs(nextLabs);

//       if (nextLabs.length) {
//         await openLab(nextLabs[0].id);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to load labs");
//     } finally {
//       setLoadingLabs(false);
//     }
//   }

//   async function loadAttempts() {
//     try {
//       const res = await api.get("/splunk/attempts");
//       setAttempts(res.data.attempts || []);
//     } catch {
//       setAttempts([]);
//     }
//   }

//   async function openLab(labId) {
//     try {
//       const res = await api.get(`/labs/${labId}`);
//       const lab = res.data.lab;
//       const firstQuestion = lab.questions?.[0] || null;

//       setSelectedLab(lab);
//       setSelectedQuestion(firstQuestion);
//       setQuery(firstQuestion?.starterQuery || `index=${lab.index}`);
//       setResults([]);
//       setActiveTab("results");
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to open lab");
//     }
//   }

//   function selectQuestion(question) {
//     setSelectedQuestion(question);
//     setQuery(question.starterQuery || `index=${selectedLab.index}`);
//     setResults([]);
//     setActiveTab("results");
//   }

//   async function runQuery() {
//     if (!query.trim()) {
//       toast.error("Write an SPL query first");
//       return;
//     }

//     try {
//       setRunning(true);
//       const res = await api.post("/splunk/run", {
//         query,
//         earliest_time: "-7d",
//         latest_time: "now",
//       });

//       setResults(res.data.results || []);
//       setActiveTab("results");
//       toast.success(`Query ran successfully. ${res.data.results?.length || 0} row(s) returned.`);
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to run SPL query");
//     } finally {
//       setRunning(false);
//     }
//   }

//   async function submitAnswer() {
//     if (!selectedLab || !selectedQuestion) return;

//     try {
//       setSubmitting(true);
//       const res = await api.post("/splunk/submit", {
//         labId: selectedLab.id,
//         questionId: selectedQuestion.id,
//         query,
//       });

//       setResults(res.data.results || []);
//       setAttempts((prev) => [res.data.attempt, ...prev]);
//       setActiveTab("feedback");

//       if (res.data.grade.correct) {
//         toast.success(`Correct! Score: ${res.data.grade.score}`);
//       } else {
//         toast.warning(res.data.grade.feedback);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to submit answer");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   function resetEditor() {
//     setQuery(selectedQuestion?.starterQuery || `index=${selectedLab?.index || "student_lab"}`);
//     setResults([]);
//   }

//   if (loadingLabs) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
//         <div className="text-center">
//           <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-white" />
//           <p className="mt-5 font-bold text-white/70">Loading Splunk labs...</p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <motion.main
//       variants={pageMotion}
//       initial="hidden"
//       animate="visible"
//       className="relative min-h-screen overflow-hidden bg-[#050816] p-4 text-white md:p-6"
//     >
//       <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/35 blur-[140px]" />
//       <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-cyan-400/20 blur-[150px]" />
//       <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

//       <div className="relative z-10 mx-auto max-w-[1700px]">
//         <motion.header variants={fadeUp} className="mb-6 rounded-[2.4rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-7">
//           <div className="grid gap-8 xl:grid-cols-[1fr_520px] xl:items-center">
//             <div>
//               <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
//                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
//                   <FaFlask />
//                 </span>
//                 <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
//                   Splunk Practical Testing Space
//                 </span>
//               </div>

//               <h1 className="mt-5 max-w-5xl text-4xl font-black tracking-tight md:text-6xl">
//                 Practice SPL Like a Real SOC Analyst.
//               </h1>

//               <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-white/60 md:text-base">
//                 Students can open a scenario, write SPL queries, run searches against your Splunk lab data, submit answers, get scores, and improve through feedback.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-2">
//               <StatCard icon={<FaBookOpen />} value={labs.length} label="Labs" />
//               <StatCard icon={<FaCheck />} value={completedQuestions} label="Correct" />
//               <StatCard icon={<FaChartLine />} value={totalScore} label="Score" />
//               <StatCard icon={<FaDatabase />} value="student_lab" label="Index" />
//             </div>
//           </div>
//         </motion.header>

//         <div className="grid grid-cols-12 gap-6">
//           <motion.aside variants={fadeUp} className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3">
//             <div className="mb-5">
//               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">Lab Library</p>
//               <h2 className="mt-2 text-2xl font-black">Choose a Challenge</h2>
//             </div>

//             <div className="mb-4 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
//               <FaMagnifyingGlass className="text-white/35" />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search labs..."
//                 className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
//               />
//             </div>

//             <div className="space-y-3">
//               {filteredLabs.map((lab) => (
//                 <button
//                   key={lab.id}
//                   onClick={() => openLab(lab.id)}
//                   className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
//                     selectedLab?.id === lab.id
//                       ? "border-cyan-300/40 bg-white text-slate-950"
//                       : "border-white/10 bg-white/5 text-white hover:bg-white/10"
//                   }`}
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="font-black leading-6">{lab.title}</p>
//                       <p className="mt-2 text-xs font-semibold opacity-60">{lab.category}</p>
//                     </div>
//                     <span className="rounded-full bg-BLUE px-3 py-1 text-xs font-black text-white">
//                       {lab.difficulty}
//                     </span>
//                   </div>

//                   <div className="mt-4 flex items-center gap-3 text-xs font-bold opacity-70">
//                     <span className="flex items-center gap-1"><FaClock /> {lab.estimatedMinutes} min</span>
//                     <span className="flex items-center gap-1"><FaBrain /> {lab.questionCount} tasks</span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </motion.aside>

//           <motion.section variants={fadeUp} className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-6 md:p-5">
//             {selectedLab && (
//               <>
//                 <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//                   <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Scenario</p>
//                   <h2 className="mt-3 text-3xl font-black">{selectedLab.title}</h2>
//                   <p className="mt-3 text-sm font-medium leading-7 text-white/60">{selectedLab.scenario}</p>

//                   <div className="mt-5 flex flex-wrap gap-3">
//                     {selectedLab.learningGoals?.map((goal) => (
//                       <span key={goal} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/65">
//                         {goal}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="mt-5 grid gap-4 md:grid-cols-3">
//                   {selectedLab.questions.map((question, index) => (
//                     <button
//                       key={question.id}
//                       onClick={() => selectQuestion(question)}
//                       className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
//                         selectedQuestion?.id === question.id
//                           ? "border-cyan-300/40 bg-white text-slate-950"
//                           : "border-white/10 bg-white/5 text-white hover:bg-white/10"
//                       }`}
//                     >
//                       <span className="flex h-9 w-9 items-center justify-center rounded-full bg-BLUE text-sm font-black text-white">{index + 1}</span>
//                       <h3 className="mt-4 font-black leading-6">{question.title}</h3>
//                       <p className="mt-2 text-xs font-semibold opacity-60">{question.points} points</p>
//                     </button>
//                   ))}
//                 </div>

//                 {selectedQuestion && (
//                   <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//                     <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
//                       <div>
//                         <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Current Task</p>
//                         <h3 className="mt-3 text-2xl font-black">{selectedQuestion.title}</h3>
//                         <p className="mt-3 text-sm font-medium leading-7 text-white/60">{selectedQuestion.task}</p>
//                       </div>

//                       <div className="rounded-2xl bg-yellow-400/10 p-4 text-yellow-100 md:max-w-xs">
//                         <p className="flex items-center gap-2 text-sm font-black"><FaLightbulb /> Hint</p>
//                         <p className="mt-2 text-xs font-medium leading-6 text-yellow-100/70">{selectedQuestion.hint}</p>
//                       </div>
//                     </div>

//                     <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#050816]">
//                       <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
//                         <div className="flex items-center gap-2 text-sm font-black text-white/70">
//                           <FaTerminal /> SPL Editor
//                         </div>
//                         <button onClick={resetEditor} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white/70 hover:bg-white hover:text-BLUE">
//                           <FaRotateRight /> Reset
//                         </button>
//                       </div>

//                       <textarea
//                         value={query}
//                         onChange={(e) => setQuery(e.target.value)}
//                         spellCheck={false}
//                         className="min-h-[190px] w-full resize-y bg-transparent p-5 font-mono text-sm font-semibold leading-7 text-cyan-100 outline-none placeholder:text-white/25"
//                         placeholder="index=student_lab status=failed | stats count by user | sort -count"
//                       />
//                     </div>

//                     <div className="mt-5 flex flex-col gap-3 sm:flex-row">
//                       <button
//                         onClick={runQuery}
//                         disabled={running || submitting}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition hover:-translate-y-1 disabled:opacity-50"
//                       >
//                         {running ? <Spinner /> : <FaCirclePlay />}
//                         {running ? "Running SPL..." : "Run Query"}
//                       </button>

//                       <button
//                         onClick={submitAnswer}
//                         disabled={running || submitting}
//                         className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-BLUE px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:opacity-90 disabled:opacity-50"
//                       >
//                         {submitting ? <Spinner /> : <FaFire />}
//                         {submitting ? "Grading..." : "Submit Answer"}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </motion.section>

//           <motion.aside variants={fadeUp} className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3 md:p-5">
//             <div className="mb-4 grid grid-cols-2 gap-3">
//               <button
//                 onClick={() => setActiveTab("results")}
//                 className={`rounded-2xl px-4 py-3 text-sm font-black ${activeTab === "results" ? "bg-white text-BLUE" : "bg-white/5 text-white"}`}
//               >
//                 Results
//               </button>
//               <button
//                 onClick={() => setActiveTab("feedback")}
//                 className={`rounded-2xl px-4 py-3 text-sm font-black ${activeTab === "feedback" ? "bg-white text-BLUE" : "bg-white/5 text-white"}`}
//               >
//                 Feedback
//               </button>
//             </div>

//             {activeTab === "results" ? (
//               <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-4">
//                 <div className="mb-4 flex items-center justify-between">
//                   <h3 className="flex items-center gap-2 text-xl font-black"><FaTable /> Results</h3>
//                   <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/50">{results.length} rows</span>
//                 </div>

//                 {results.length ? (
//                   <div className="max-h-[600px] overflow-auto rounded-2xl border border-white/10">
//                     <table className="min-w-full text-left text-xs">
//                       <thead className="sticky top-0 bg-white text-slate-950">
//                         <tr>
//                           {columns.map((column) => (
//                             <th key={column} className="whitespace-nowrap px-3 py-3 font-black">{column}</th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {results.slice(0, 30).map((row, index) => (
//                           <tr key={index} className="border-t border-white/10 odd:bg-white/[0.03]">
//                             {columns.map((column) => (
//                               <td key={column} className="whitespace-nowrap px-3 py-3 font-semibold text-white/70">{String(row[column] ?? "")}</td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <EmptyState icon={<FaTable />} title="No results yet" text="Run an SPL query to see output here." />
//                 )}
//               </div>
//             ) : (
//               <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-4">
//                 <h3 className="mb-4 flex items-center gap-2 text-xl font-black"><FaShieldHalved /> Attempts</h3>

//                 {attempts.length ? (
//                   <div className="space-y-3">
//                     {attempts.slice(0, 8).map((attempt) => (
//                       <div key={attempt.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                         <div className="flex items-center justify-between gap-3">
//                           <span className={`rounded-full px-3 py-1 text-xs font-black ${attempt.correct ? "bg-emerald-500/20 text-emerald-200" : "bg-yellow-500/20 text-yellow-100"}`}>
//                             {attempt.correct ? "Correct" : "Review"}
//                           </span>
//                           <span className="text-sm font-black text-white">{attempt.score} pts</span>
//                         </div>
//                         <p className="mt-3 text-sm font-medium leading-7 text-white/60">{attempt.feedback}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <EmptyState icon={<FaTriangleExclamation />} title="No feedback yet" text="Submit an answer to receive grading feedback." />
//                 )}
//               </div>
//             )}
//           </motion.aside>
//         </div>
//       </div>

//       <Toaster position="top-center" richColors />
//     </motion.main>
//   );
// }

// function StatCard({ icon, value, label }) {
//   return (
//     <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
//       <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">{icon}</div>
//       <h3 className="text-3xl font-black">{value}</h3>
//       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">{label}</p>
//     </div>
//   );
// }

// function Spinner() {
//   return <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
// }

// function EmptyState({ icon, title, text }) {
//   return (
//     <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
//       <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white/40">{icon}</div>
//       <h4 className="mt-5 text-xl font-black">{title}</h4>
//       <p className="mt-2 text-sm font-medium leading-7 text-white/45">{text}</p>
//     </div>
//   );
// }
