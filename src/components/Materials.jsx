import React, { useEffect, useMemo, useRef, useState } from "react";
import Player from "@vimeo/player";
import { NavLink } from "react-router-dom";
import NewCohortDashboard from "./NewCohortDashboard";
import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaCheck,
  FaCirclePlay,
  FaClock,
  FaDownload,
  FaFileLines,
  FaGraduationCap,
  FaLayerGroup,
  FaLock,
  FaMagnifyingGlass,
  FaMoon,
  FaNoteSticky,
  FaRotateRight,
  FaSun,
  FaVideo,
  FaXmark,
} from "react-icons/fa6";
import SplunkKnowledgePopup from "./SplunkKnowledgePopup";

/**
 * T.O Analytics · Splunk Student Campus
 *
 * One drop-in replacement for the previous CoursePortal.jsx.
 * - Old content and its cp_progress_<email> localStorage key are retained.
 * - Oct 2026 students see a new ten-session dashboard from the orientation deck.
 * - New recordings and documents remain EMPTY until published.
 * - The backend authorizes courseId "splunk-2026" or "splunk" for each account.
 * - The existing backend progress API is read-only in the supplied source;
 *   changes continue to save locally (same actual behavior as old portal).
 */

const NEW_COHORT_ID = "splunk-2026-oct";

// Student-to-cohort assignment is resolved on the server. No email allowlist
// or ?intake=2026 query parameter can grant access to the new cohort.
const LEGACY_COHORT_ID = "legacy";
const SUPPORT_EMAIL = "t.oanalyticsllc@gmail.com";
const SUPPORT_URL = `mailto:${SUPPORT_EMAIL}`;

// Original course data, including every existing Vimeo / Google Drive URL.
// Do not change historical ids without migrating stored student progress.
const legacyCourses = [
  {
    id: "splunk",
    title: "Splunk Training",
    classes: [
      {
        id: "class1",
        title: "Orientation — Intro (1 Videos)",
        videos: [
          {
            id: "v1",
            title: "To-analytics Orientation",
            url: "https://player.vimeo.com/video/1126909883",
          },
        ],
        docs: [
          {
            id: "d1",
            title: "To-analytics Orientation",
            url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
          },
        ],
      },
      {
        id: "class2",
        title: "Class 1 — Splunk  SIEM (1 Videos)",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 1",
            url: "https://player.vimeo.com/video/1127004938",
          },
        ],
        docs: [
          {
            id: "d1",
            title: "To-analytics Splunk Class 1 Intro",
            url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
          },
          {
            id: "d2",
            title: "To-analytics Splunk Class 1 Note",
            url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
          },
        ],
      },
      {
        id: "class3",
        title: "Class 2 —  Splunk Basics",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 2",
            url: "https://player.vimeo.com/video/1131114931",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "To-analytics Splunk Class 2",
            url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
          },
          {
            id: "d4",
            title: "To-analytics Splunk  Class 2 Note",
            url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
          },
        ],
      },
      {
        id: "class4",
        title: "Class 3 — Splunk SPL",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 3",
            url: "https://player.vimeo.com/video/1133357923",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "To-analytics Splunk Class 3",
            url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
          },
          {
            id: "d4",
            title: "To-analytics Splunk Class 3 Note",
            url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
          },
        ],
      },
      {
        id: "class5",
        title: "Class 4 — SPL Part 2",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 4",
            url: "https://player.vimeo.com/video/1136469770",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "To-analytics Splunk Class 4",
            url: "https://drive.google.com/file/d/1XVZBJxSCe_bj-MP93nGyJPKG3qoKjrb_/preview",
            // url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
          },
        ],
      },

      {
        id: "class6",
        title: "Class 5  — Splunk SPL  LAB",
        desc: "Creating reports, dashboards, visualizations, inputs and filters. .",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 5",
            url: "https://player.vimeo.com/video/1138152119",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "Splunk Class 5 Slides",
            url: "",
            // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
          },

          {
            id: "d3",
            title: "Splunk Class 5 Note",
            url: "https://drive.google.com/file/d/1RrF8dEuaUgyKiWhF8lQ4h-WiN9CUb4gE/preview",
            // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
          },
        ],
      },

      {
        id: "class8",
        title: "Class 6  — Splunk Knowledge Objects.",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 6",
            url: "https://player.vimeo.com/video/1140703570",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "Splunk Class 6 Slides",
            url: "https://drive.google.com/file/d/1cXBItLD6OpbOY6aDi5NGQ0-KXJbutCIS/view?usp=sharing",
          },

          {
            id: "d3",
            title: "Splunk Class 6 Note",
            url: "https://drive.google.com/file/d/1fVtS0u-mPndEiVbSGm1f2H5Qm_Dx3CzV/preview",
          },
        ],
      },

      {
        id: "class7",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 7 Splunk Lab Knowledge Objects",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 7",
            url: "https://player.vimeo.com/video/1145017764",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "",
            url: "",
          },
        ],
      },

      // https://player.vimeo.com/video/1149696096
      {
        id: "class8",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 8 Splunk Dashboard ",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 8",
            url: "https://player.vimeo.com/video/1146557656",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "T.O_Analytics_Splunk_Class_8",
            url: "https://drive.google.com/file/d/1jBaWruZc2sgrmzuLFWuwtcNMHrOiab8K/preview",
          },

          {
            id: "d3",
            title: "T.O_Analytics_Splunk_Class_8 Note",
            url: "https://drive.google.com/file/d/1EvVwiUgfR8Vl1q4MIIUPCmHnFDDKvPg4/preview",
          },

          {
            id: "d3",
            title: "T.O_Analytics_Splunk_Class_8 Assignment",
            url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
          },
        ],
      },

      {
        id: "class9",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 9 Splunk Dashboard Lab",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 9",
            url: "https://player.vimeo.com/video/1149696096",
          },
        ],
        docs: [
          {
            id: "",
            title: "",
            url: "",
          },
        ],
      },
      //

      {
        id: "class10",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 10 Certification Exam, Job & Assignment Review",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 10",
            url: "https://player.vimeo.com/video/1153292493",
          },
        ],
        docs: [
          {
            id: "",
            title: "Assignment",
            url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
          },
        ],
      },

      {
        id: "class11",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 11 Onboarding data",
        // desc: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/view?usp=sharing",
        videos: [
          {
            id: "v2",
            title: "",
            url: "https://player.vimeo.com/video/1156881908",
          },
        ],
        docs: [
          {
            id: "",
            title: "Onboarding data ",
            url: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/preview",
          },
        ],
      },

      {
        id: "class12",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 12 Data Onboarding Lab.",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "Class 12 Data Onboarding Lab",
            url: "https://player.vimeo.com/video/1158631944",
            // url: "",
          },
        ],
        docs: [
          {
            id: "dv",
            title: "Class 12 Data Onboarding Lab",
            url: "",
          },
        ],
      },

      {
        id: "class13",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 13 Data Onboarding Lab.",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "Class 13 Data Onboarding Lab",
            url: "https://player.vimeo.com/video/1161024327",

            // url: "",
          },
        ],
        docs: [
          {
            id: "dv",
            title: "Class 13 Data Onboarding Lab",
            url: "https://docs.google.com/presentation/d/16tCZ7QDzXSVXw7RnQFvKxO7mZEH1E87d/preview",
          },
        ],
      },
    ],
  },
];

// This component retains the old cohort library and its progress ids.
// New cohort curriculum and preparation live in NewCohortDashboard.jsx,
// backed by splunk2026Data.js (ten official Saturday sessions).
const newCohortLessons = [];
const milestones = [];
const deliverables = [];

// Preserve original ids for the first occurrence of each historical lesson.
// The supplied old source contains a duplicate "class8" id: make its later
// occurrence unique so it doesn't accidentally inherit the first one's status.
// Previous progress for the second duplicate cannot be recovered separately.
const seenLegacy = new Set();
const legacyLessons = legacyCourses[0].classes.map((lesson, index) => {
  const firstOccurrence = !seenLegacy.has(lesson.id);
  seenLegacy.add(lesson.id);
  return {
    ...lesson,
    key: `old-lesson-${index}`,
    progressId: firstOccurrence ? lesson.id : `${lesson.id}__session_${index + 1}`,
    number: index + 1,
    phase: index <= 9 ? "Splunk Training" : "Splunk Administration",
    topic: lesson.desc || "Recorded lesson from the previous Splunk training intake.",
  };
});

function normalizeEmail(raw) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed.trim().toLowerCase();
    return String(parsed?.email || "").trim().toLowerCase();
  } catch {
    return String(raw).trim().toLowerCase();
  }
}

function getStorageKey(email, cohortId) {
  const normalized = String(email || "").toLowerCase().trim();
  return cohortId === LEGACY_COHORT_ID
    ? `cp_progress_${normalized}`
    : `cp_progress_${cohortId}_${normalized}`;
}

function readStoredProgress(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function mapBackendProgress(data) {
  if (!Array.isArray(data)) return {};
  const mapped = {};
  data.forEach((p) => {
    if (!p?.classId) return;
    mapped[p.classId] = {
      note: p.note || "",
      time: Number(p.time) || 0,
      duration: Number(p.duration) || 0,
      completed: Boolean(p.completed),
      videoId: p.videoId || "",
    };
  });
  return mapped;
}

function percentFor(record) {
  if (record?.completed) return 100;
  if (!record?.duration) return 0;
  return Math.min(100, Math.round(((record.time || 0) / record.duration) * 100));
}

const compact = (...items) => items.filter(Boolean).join(" ");

function SectionLabel({ children, dark }) {
  return (
    <p className={compact("text-[11px] font-extrabold uppercase tracking-[0.19em]", dark ? "text-cyan-300" : "text-blue-700")}>
      {children}
    </p>
  );
}

function Ring({ percentage, dark, size = 120 }) {
  const r = 42;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${percentage}% completed`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke={dark ? "#283852" : "#dfe8f4"} strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#34b7f1" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums">{percentage}%</span>
        <span className={compact("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>complete</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, dark }) {
  return (
    <div className={compact("rounded-2xl border p-5", dark ? "border-white/10 bg-[#111f34]" : "border-slate-200 bg-white")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={compact("text-xs font-semibold", dark ? "text-slate-400" : "text-slate-500")}>{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight tabular-nums">{value}</p>
        </div>
        <span className={compact("flex h-11 w-11 items-center justify-center rounded-xl text-lg", dark ? "bg-[#1d3857] text-cyan-300" : "bg-blue-50 text-blue-700")}>
          <Icon />
        </span>
      </div>
    </div>
  );
}

function EmptyMedia({ title, description, dark }) {
  return (
    <div className={compact("rounded-2xl border border-dashed px-6 py-10 text-center", dark ? "border-white/15 bg-white/[0.025]" : "border-slate-300 bg-slate-50/70")}>
      <div className={compact("mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-xl", dark ? "bg-white/10 text-cyan-300" : "bg-blue-100 text-blue-700")}>
        <FaVideo />
      </div>
      <h3 className="mt-4 font-extrabold">{title}</h3>
      <p className={compact("mx-auto mt-2 max-w-sm text-sm leading-6", dark ? "text-slate-400" : "text-slate-500")}>{description}</p>
    </div>
  );
}

function AccessPage({ loading, email }) {
  return (
    <main className="flex min-h-[85vh] items-center justify-center bg-[#071426] px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f243b] p-9 text-center shadow-2xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl text-sky-300">
          {loading ? <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/20 border-t-sky-300" /> : <FaLock />}
        </span>
        <h1 className="mt-6 text-2xl font-black">{loading ? "Verifying student access" : "Learning portal access required"}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          {loading
            ? "Checking your student enrollment and assigned training cohort."
            : "Sign in with your enrolled student account. If you believe you should have access, contact the T.O Analytics team."}
        </p>
        {!loading && (
          <>
            {email && <p className="mt-4 break-all rounded-xl bg-white/5 p-3 text-xs text-slate-300">{email}</p>}
            <a href={SUPPORT_URL} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-extrabold text-slate-950">
              Contact support <FaArrowRight />
            </a>
            <div className="mt-4"><NavLink to="/" className="text-xs text-slate-400 underline underline-offset-4">Return to website</NavLink></div>
          </>
        )}
      </div>
    </main>
  );
}

const MENU = [
  { id: "overview", label: "Overview", icon: FaChartLine },
  { id: "lessons", label: "My classes", icon: FaBookOpen },
  { id: "roadmap", label: "Learning roadmap", icon: FaLayerGroup },
  { id: "resources", label: "Resources", icon: FaFileLines },
];

export default function CoursePortal() {
  const [auth, setAuth] = useState({ loading: true, allowed: false, email: "", cohortId: null });
  const [view, setView] = useState("overview");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLessonKey, setSelectedLessonKey] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [progress, setProgress] = useState({});
  const [toastDismissed, setToastDismissed] = useState(false);
  const [thumbnails, setThumbnails] = useState({});
  const [mutedHint, setMutedHint] = useState(false);
  const playerMountRef = useRef(null);
  const playerRef = useRef(null);
  const progressRef = useRef({});

  const isLegacy = auth.cohortId === LEGACY_COHORT_ID;
  const lessons = isLegacy ? legacyLessons : newCohortLessons;
  const storageKey = auth.cohortId ? getStorageKey(auth.email, auth.cohortId) : null;
  const selectedLesson = lessons.find((lesson) => lesson.key === selectedLessonKey) || lessons[0];
  const validVideos = (selectedLesson?.videos || []).filter((v) => Boolean(v?.url?.trim()));
  const validDocs = (selectedLesson?.docs || []).filter((doc) => Boolean(doc?.url?.trim() && doc?.title?.trim()));
  const activeVideo = validVideos.find((v) => v.id === selectedVideoId);

  const completed = lessons.filter((lesson) => progress[lesson.progressId]?.completed).length;
  const progressPercent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const allDocs = lessons.flatMap((lesson) =>
    (lesson.docs || [])
      .filter((doc) => doc?.url?.trim() && doc?.title?.trim())
      .map((doc, i) => ({ ...doc, key: `${lesson.key}-doc-${i}`, lessonTitle: lesson.title, lessonKey: lesson.key }))
  );
  const totalVideos = lessons.reduce((sum, lesson) => sum + (lesson.videos || []).filter((v) => v?.url?.trim()).length, 0);
  const hasAssignments = allDocs.some((doc) => /assignment/i.test(doc.title));
  const filteredLessons = useMemo(() => lessons.filter((lesson) =>
    `${lesson.title} ${lesson.topic} ${lesson.phase}`.toLowerCase().includes(search.trim().toLowerCase())), [lessons, search]);

  const skin = dark ? {
    shell: "bg-[#071426] text-slate-50",
    panel: "border-white/10 bg-[#102037]",
    soft: "border-white/10 bg-[#14283f]",
    muted: "text-slate-400",
    line: "border-white/10",
    input: "border-white/10 bg-[#091a2d] text-slate-100 placeholder:text-slate-500",
    hover: "hover:bg-white/[0.065]",
    action: "bg-slate-50 text-slate-950 hover:bg-sky-100",
  } : {
    shell: "bg-[#f4f7fb] text-slate-900",
    panel: "border-slate-200 bg-white",
    soft: "border-slate-200 bg-[#f7faff]",
    muted: "text-slate-500",
    line: "border-slate-200",
    input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
    hover: "hover:bg-blue-50",
    action: "bg-slate-900 text-white hover:bg-slate-800",
  };

  // ENROLLMENT ROUTING (server-authoritative):
  // 1. Check the new 2026 course enrollment first.
  // 2. If not enrolled, check the legacy "splunk" course.
  // 3. Fail closed if neither check authorizes this authenticated account.
  // The backend MUST validate the Bearer token and derive/compare the user
  // identity server-side; accepting arbitrary supplied emails is insecure.
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    const email = normalizeEmail(localStorage.getItem("user") || "");
    const token = localStorage.getItem("ACCESS_TOKEN") || "";

    if (!email || !token) {
      setAuth({ loading: false, allowed: false, email, cohortId: null });
      return () => { live = false; controller.abort(); };
    }

    setAuth({ loading: true, allowed: false, email, cohortId: null });
    const check = async (courseId) => {
      const res = await fetch("/api/check-student-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, courseId }),
        signal: controller.signal,
        cache: "no-store",
      });
      if ([400, 401, 403, 404].includes(res.status)) return false;
      if (!res.ok) throw new Error(`Enrollment check failed: ${res.status}`);
      const data = await res.json();
      return data?.allowed === true;
    };
    (async () => {
      try {
        const inNewCohort = await check("splunk-2026");
        if (inNewCohort) {
          if (live) setAuth({ loading: false, allowed: true, email, cohortId: NEW_COHORT_ID });
          return;
        }
        const inLegacyCohort = await check("splunk");
        if (live) setAuth({ loading: false, allowed: inLegacyCohort, email,
          cohortId: inLegacyCohort ? LEGACY_COHORT_ID : null });
      } catch (error) {
        if (error?.name !== "AbortError") console.error("Student enrollment verification failed", error);
        if (live) setAuth({ loading: false, allowed: false, email, cohortId: null });
      }
    })();
    return () => { live = false; controller.abort(); };
  }, []);

  // Historical backend progress remains readable, while the October 2026
  // cohort starts fresh and isolated until a cohort-aware backend is built.
  useEffect(() => {
    if (!auth.allowed || !storageKey) return;
    let live = true;
    const local = readStoredProgress(storageKey);
    progressRef.current = local;
    setProgress(local);
    setSelectedLessonKey((isLegacy ? legacyLessons : newCohortLessons)[0]?.key || null);
    setSelectedVideoId(null);

    if (isLegacy && import.meta.env.VITE_API_BASE) {
      (async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/progress/${encodeURIComponent(auth.email)}`);
          if (!res.ok) throw new Error("Failed to fetch old student progress");
          const remote = mapBackendProgress(await res.json());
          if (!live) return;
          // Locally saved changes take precedence because existing write
          // handlers never posted updates to the old backend.
          const merged = { ...remote, ...progressRef.current };
          progressRef.current = merged;
          setProgress(merged);
          localStorage.setItem(storageKey, JSON.stringify(merged));
        } catch (error) {
          console.warn("Historical backend progress unavailable; local data kept", error);
        }
      })();
    }
    return () => { live = false; };
  }, [auth.allowed, auth.email, auth.cohortId, storageKey, isLegacy]);

  function persistLessonPatch(progressId, patch) {
    if (!auth.allowed || !storageKey || !progressId) return;
    const next = {
      ...progressRef.current,
      [progressId]: { ...(progressRef.current[progressId] || {}), ...patch },
    };
    progressRef.current = next;
    localStorage.setItem(storageKey, JSON.stringify(next));
    setProgress(next);
  }

  function openLesson(lesson) {
    setSelectedLessonKey(lesson.key);
    const savedVideoId = progressRef.current[lesson.progressId]?.videoId;
    const videos = (lesson.videos || []).filter((v) => v?.url?.trim());
    const bestVideo = videos.find((v) => v.id === savedVideoId) || videos[0];
    setSelectedVideoId(bestVideo?.id || null);
    setMutedHint(false);
    setView("lessons");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetProgress() {
    if (!storageKey || !window.confirm("Reset your saved progress and notes for THIS cohort on THIS device?")) return;
    localStorage.removeItem(storageKey);
    progressRef.current = {};
    setProgress({});
    setSelectedVideoId(null);
  }

  // Vimeo player, playback resume, timed progress, and 90% auto-completion.
  useEffect(() => {
    if (!auth.allowed || view !== "lessons" || !activeVideo?.url || !playerMountRef.current || !selectedLesson) return;
    const mount = playerMountRef.current;
    const iframe = document.createElement("iframe");
    iframe.src = `${activeVideo.url.trim()}${activeVideo.url.includes("?") ? "&" : "?"}transparent=0&autoplay=0`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("title", activeVideo.title || "Splunk lesson video");
    iframe.className = "absolute inset-0 h-full w-full";
    mount.replaceChildren(iframe);

    const player = new Player(iframe);
    playerRef.current = player;
    const key = selectedLesson.progressId;
    let lastWrite = 0;
    let destroyed = false;
    const saved = progressRef.current[key];
    player.ready().then(async () => {
      if (destroyed) return;
      if (saved?.videoId === activeVideo.id && saved.time > 0 && !saved.completed) {
        await player.setCurrentTime(saved.time).catch(() => {});
      }
      await player.setVolume(1).catch(() => { if (!destroyed) setMutedHint(true); });
    }).catch(() => {});

    const onTime = ({ seconds = 0, duration = 0 }) => {
      const now = Date.now();
      if (now - lastWrite < 3000 && !(duration > 0 && seconds / duration >= 0.9)) return;
      lastWrite = now;
      const current = progressRef.current[key] || {};
      persistLessonPatch(key, {
        videoId: activeVideo.id,
        time: seconds,
        duration,
        completed: current.completed || (duration > 0 && seconds / duration >= 0.9),
      });
    };
    const onEnd = () => persistLessonPatch(key, { videoId: activeVideo.id, completed: true });
    player.on("timeupdate", onTime);
    player.on("ended", onEnd);
    return () => {
      destroyed = true;
      player.off("timeupdate", onTime);
      player.off("ended", onEnd);
      player.destroy().catch(() => {});
      if (playerRef.current === player) playerRef.current = null;
      mount.replaceChildren();
    };
    // Stable selected class key and URL are intentional player boundaries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.allowed, auth.cohortId, view, selectedLesson?.key, activeVideo?.url, activeVideo?.id]);

  // Preserve video preview thumbnails from the old portal (with a fallback).
  useEffect(() => {
    if (view !== "lessons") return;
    let live = true;
    const videos = validVideos;
    Promise.all(videos.map(async (video) => {
      if (video.thumbnail) return [video.url, video.thumbnail];
      try {
        const url = video.url.replace("player.vimeo.com/video/", "vimeo.com/");
        const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error("No thumbnail");
        const payload = await response.json();
        return [video.url, payload.thumbnail_url || null];
      } catch {
        return [video.url, null];
      }
    })).then((entries) => { if (live) setThumbnails((previous) => ({ ...previous, ...Object.fromEntries(entries) })); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedLesson?.key]);

  if (auth.loading || !auth.allowed) return <AccessPage loading={auth.loading} email={auth.email} />;

  // A separate, completely fresh student dashboard; no old videos/docs rendered.
  if (!isLegacy) return <NewCohortDashboard email={auth.email} />;

  const title = isLegacy ? "Previous Splunk Training" : "Splunk Professional Bootcamp";
  const cohortLabel = isLegacy ? "Previous intake" : "October 2026 intake";
  const featured = lessons.find((lesson) => !progress[lesson.progressId]?.completed) || lessons[0];
  const cardStyle = compact("rounded-[24px] border shadow-sm", skin.panel);

  return (
    <main className={compact("min-h-screen transition-colors duration-200", skin.shell)}>
      {/* A small utility banner; old cohort popup is deliberately not shared with the new intake. */}
      {isLegacy && <SplunkKnowledgePopup />}
      {hasAssignments && !toastDismissed && (
        <div className="fixed bottom-6 right-5 z-50 flex max-w-sm items-start gap-4 rounded-2xl border border-sky-700/10 bg-slate-950 px-5 py-4 text-white shadow-2xl">
          <FaFileLines className="mt-1 shrink-0 text-sky-300" />
          <div><p className="font-extrabold">Assignment resources available</p><p className="mt-1 text-xs leading-5 text-slate-300">View assignment documents in Resources.</p></div>
          <button onClick={() => setToastDismissed(true)} aria-label="Dismiss" className="p-1 text-slate-400 hover:text-white"><FaXmark /></button>
        </div>
      )}

      <header className={compact("border-b", skin.line, dark ? "bg-[#0a192c]" : "bg-white")}>
        <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black tracking-tight text-white">T.O</div>
            <div className="min-w-0"><p className="truncate text-[15px] font-black tracking-tight">T.O Analytics</p><p className={compact("text-[11px] font-semibold", skin.muted)}>Student learning campus</p></div>
            <span className={compact("ml-3 hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex", dark ? "bg-blue-400/10 text-sky-200" : "bg-blue-50 text-blue-700")}>{cohortLabel}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={compact("hidden max-w-[230px] truncate text-xs font-semibold md:block", skin.muted)} title={auth.email}>{auth.email}</span>
            <button type="button" onClick={() => setDark((value) => !value)}
              className={compact("flex h-10 w-10 items-center justify-center rounded-xl border", skin.line, skin.hover)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              {dark ? <FaSun /> : <FaMoon />}
            </button>
            <NavLink to="/" className={compact("rounded-xl border px-3 py-2.5 text-xs font-extrabold", skin.line, skin.hover)}>Website <span className="hidden sm:inline">↗</span></NavLink>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:px-10 lg:py-9">
        <aside className="min-w-0">
          <div className={compact("rounded-[24px] border p-4 lg:sticky lg:top-6", skin.panel)}>
            <div className={compact("mb-5 rounded-2xl p-4", dark ? "bg-[#1a3554]" : "bg-[#edf5ff]")}>
              <div className="flex items-center gap-2 text-sky-600"><FaGraduationCap /><span className="text-[11px] font-extrabold uppercase tracking-wider">Learning space</span></div>
              <h2 className="mt-2 text-base font-black leading-snug">{isLegacy ? "Your previous classes" : "Your learning journey"}</h2>
              <p className={compact("mt-2 text-xs leading-5", skin.muted)}>{isLegacy ? "Archived course library" : "14 planned training sessions"}</p>
            </div>
            <p className={compact("mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em]", skin.muted)}>Workspace</p>
            <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Student navigation">
              {MENU.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => { setView(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={compact("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm", view === id ? "bg-[#0a62d2] text-white shadow-md shadow-blue-800/10" : skin.hover, view !== id && skin.muted)}>
                  <Icon className="shrink-0" /> <span>{label}</span>
                  {view === id && <FaArrowRight className="ml-auto hidden text-[10px] lg:block" />}
                </button>
              ))}
            </nav>
            <div className={compact("mt-5 border-t pt-5", skin.line)}>
              <div className="flex items-center justify-between"><span className="text-xs font-bold">Your progress</span><span className="text-xs font-black text-[#298fd3]">{progressPercent}%</span></div>
              <div className={compact("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}><div className="h-full rounded-full bg-[#1688dc] transition-all" style={{ width: `${progressPercent}%` }} /></div>
              <p className={compact("mt-2 text-[11px]", skin.muted)}>{completed} of {lessons.length} lessons completed</p>
            </div>
            <div className={compact("mt-5 border-t pt-5", skin.line)}>
              <a href={SUPPORT_URL} className={compact("block rounded-xl border px-3 py-3 text-center text-xs font-bold", skin.line, skin.hover)}>Need help? Contact support</a>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {view === "overview" && (
            <>
              <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
                <div className="pointer-events-none absolute -right-14 -top-28 h-[310px] w-[310px] rounded-full border-[52px] border-white/[0.045]" />
                <div className="pointer-events-none absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="relative z-10 max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-sky-100"><FaGraduationCap /> {cohortLabel}</span>
                  <h1 className="mt-6 max-w-2xl text-3xl font-black leading-[1.13] tracking-tight sm:text-4xl lg:text-[42px]">{isLegacy ? "Welcome back to your learning space." : "Build your Splunk career, one skill at a time."}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">{isLegacy ? "All your existing recordings, lesson materials, notes and progress are still here." : "Learn the fundamentals, explore administration, prepare for certifications and complete a hands-on capstone project."}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button onClick={() => openLesson(featured)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#083269] transition hover:bg-blue-50">{completed ? "Continue learning" : "Explore classes"} <FaArrowRight /></button>
                    <button onClick={() => setView("roadmap")} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">View roadmap</button>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning statistics">
                <StatCard icon={FaLayerGroup} value={lessons.length} label={isLegacy ? "Archived lessons" : "Planned sessions"} dark={dark} />
                <StatCard icon={FaVideo} value={totalVideos} label="Available videos" dark={dark} />
                <StatCard icon={FaCheck} value={completed} label="Completed lessons" dark={dark} />
                <StatCard icon={FaFileLines} value={allDocs.length} label="Available documents" dark={dark} />
              </section>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
                <section className={compact(cardStyle, "p-6 sm:p-7")}>
                  <SectionLabel dark={dark}>Your next step</SectionLabel>
                  <h2 className="mt-3 text-xl font-black tracking-tight">{featured.title}</h2>
                  <p className={compact("mt-3 text-sm leading-6", skin.muted)}>{featured.topic}</p>
                  <div className={compact("mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4", skin.soft)}>
                    <div><p className="text-xs font-extrabold">Lesson {featured.number} of {lessons.length}</p><p className={compact("mt-1 text-xs", skin.muted)}>{(featured.videos || []).some(v => v?.url) ? "Recording available" : "Materials not published yet"}</p></div>
                    <button onClick={() => openLesson(featured)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700">Open lesson <FaArrowRight /></button>
                  </div>
                  <div className="mt-7 flex items-center justify-between"><h3 className="text-base font-black">Learning path</h3><button onClick={() => setView("lessons")} className="text-xs font-bold text-blue-500 hover:underline">All classes →</button></div>
                  <div className="mt-4 space-y-3">
                    {(isLegacy ? [
                      { name: "Your archived recordings", detail: "Revisit lessons and training materials", count: lessons.length },
                      { name: "Review and practice", detail: "Take notes and track your own progress", count: allDocs.length },
                    ] : [
                      { name: "Splunk Foundations", detail: "14 Nov – 19 Dec 2026", count: 6 },
                      { name: "Splunk Backend Administration", detail: "9 Jan – 27 Feb 2027", count: 8 },
                    ]).map((step, i) => (
                      <div key={step.name} className={compact("flex items-center gap-4 rounded-2xl border p-4", skin.soft)}>
                        <span className={compact("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black", i ? "bg-sky-500/10 text-sky-500" : "bg-blue-600 text-white")}>{String(i + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{step.name}</p><p className={compact("mt-1 text-xs", skin.muted)}>{step.detail}</p></div>
                        <span className={compact("shrink-0 text-xs font-bold", skin.muted)}>{step.count} {isLegacy ? "items" : "sessions"}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className={compact(cardStyle, "flex flex-col p-6 sm:p-7")}>
                  <SectionLabel dark={dark}>Progress summary</SectionLabel>
                  <div className="mt-5 flex justify-center"><Ring percentage={progressPercent} dark={dark} size={155} /></div>
                  <p className={compact("mt-5 text-center text-sm leading-6", skin.muted)}>Track every lesson from your dedicated learning dashboard.</p>
                  <div className={compact("mt-5 grid grid-cols-2 gap-3 border-t pt-5", skin.line)}><div><p className="text-2xl font-black">{completed}</p><p className={compact("text-xs", skin.muted)}>Completed</p></div><div><p className="text-2xl font-black">{lessons.length - completed}</p><p className={compact("text-xs", skin.muted)}>Remaining</p></div></div>
                  <button onClick={() => setView("roadmap")} className={compact("mt-auto pt-5 text-left text-xs font-extrabold", dark ? "text-sky-300" : "text-blue-700")}>Explore training milestones →</button>
                </section>
              </div>
              {!isLegacy && (
                <section className={compact(cardStyle, "p-6 sm:p-7")}>
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><SectionLabel dark={dark}>Training schedule</SectionLabel><h2 className="mt-2 text-xl font-black">Important program dates</h2></div><button onClick={() => setView("roadmap")} className="text-xs font-bold text-blue-500">Full schedule →</button></div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">{[milestones[0], milestones[1], milestones[3]].map((milestone) => <div key={milestone.name} className={compact("rounded-2xl border p-4", skin.soft)}><p className="text-xs font-extrabold text-blue-500">{milestone.short}</p><h3 className="mt-2 text-sm font-black">{milestone.name}</h3><p className={compact("mt-2 text-xs leading-5", skin.muted)}>{milestone.category}</p></div>)}</div>
                </section>
              )}
              {!isLegacy && (
                <section className={compact(cardStyle, "p-6 sm:p-7")}>
                  <SectionLabel dark={dark}>Orientation details</SectionLabel>
                  <h2 className="mt-2 text-xl font-black">About your enrollment</h2>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Program tuition</p><p className="mt-2 text-2xl font-black">$3,500</p><p className={compact("mt-1 text-xs", skin.muted)}>Published course fee</p></div>
                    <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Payment method</p><p className="mt-2 text-lg font-black">Zelle</p><p className="mt-1 break-all text-xs text-blue-500">{SUPPORT_EMAIL}</p></div>
                    <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Certification focus</p><p className="mt-2 text-sm font-black leading-6">Core Power User<br />Enterprise Certified Admin</p></div>
                  </div>
                </section>
              )}
            </>
          )}

          {view === "lessons" && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4"><div><SectionLabel dark={dark}>Course library</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">My classes</h1><p className={compact("mt-2 text-sm", skin.muted)}>Videos, resources, progress tracking and personal notes in one place.</p></div><span className={compact("rounded-full border px-4 py-2 text-xs font-extrabold", skin.line)}>{lessons.length} classes</span></div>
              <div className="grid gap-5 xl:grid-cols-[minmax(245px,0.85fr)_minmax(0,1.6fr)]">
                <section className={compact(cardStyle, "self-start p-4")}>
                  <label className={compact("flex items-center gap-3 rounded-xl border px-3 py-3", skin.input)}>
                    <FaMagnifyingGlass className={skin.muted} />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your classes..." aria-label="Search classes" className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:font-medium" />
                  </label>
                  <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
                    {filteredLessons.map((lesson) => {
                      const selected = lesson.key === selectedLesson.key;
                      const itemProgress = progress[lesson.progressId];
                      const mediaReady = (lesson.videos || []).some((v) => v?.url?.trim());
                      return <button key={lesson.key} onClick={() => openLesson(lesson)} className={compact("w-full rounded-xl border p-3.5 text-left transition", selected ? dark ? "border-blue-400/40 bg-[#1c3b60]" : "border-blue-300 bg-blue-50" : compact(skin.line, skin.hover))}>
                        <div className="flex items-start gap-3"><span className={compact("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black", itemProgress?.completed ? "bg-emerald-500/15 text-emerald-500" : selected ? "bg-blue-600 text-white" : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600")}>{itemProgress?.completed ? <FaCheck /> : String(lesson.number).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold leading-5">{lesson.title}</h3><p className={compact("mt-1.5 text-[11px]", skin.muted)}>{mediaReady ? "Video available" : "Awaiting lesson recording"}</p><div className={compact("mt-3 h-1.5 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-200")}><div className="h-full rounded-full bg-blue-500" style={{ width: `${percentFor(itemProgress)}%` }} /></div></div></div>
                      </button>;
                    })}
                    {!filteredLessons.length && <p className={compact("px-3 py-6 text-center text-sm", skin.muted)}>No classes match your search.</p>}
                  </div>
                </section>

                <section className="min-w-0 space-y-5">
                  <div className={compact(cardStyle, "p-5 sm:p-6")}>
                    <div className="flex flex-wrap items-center gap-2"><SectionLabel dark={dark}>Lesson {selectedLesson.number}</SectionLabel><span className={compact("rounded-full px-2.5 py-1 text-[10px] font-black", dark ? "bg-sky-400/10 text-sky-300" : "bg-blue-50 text-blue-700")}>{selectedLesson.phase}</span></div>
                    <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{selectedLesson.title}</h2>
                    <p className={compact("mt-3 text-sm leading-6", skin.muted)}>{selectedLesson.topic}</p>
                    <div className={compact("mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4", skin.line)}><span className={compact("text-xs font-semibold", skin.muted)}>{progress[selectedLesson.progressId]?.completed ? "✓ Completed" : "Not completed yet"}</span><button disabled={!isLegacy && validVideos.length === 0 && validDocs.length === 0} title={!isLegacy && validVideos.length === 0 && validDocs.length === 0 ? "Available when the lesson is published" : "Update lesson completion"} onClick={() => persistLessonPatch(selectedLesson.progressId, { completed: !progress[selectedLesson.progressId]?.completed })} className={compact("disabled:cursor-not-allowed disabled:opacity-40","inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition", progress[selectedLesson.progressId]?.completed ? dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700")}><FaCheck /> {progress[selectedLesson.progressId]?.completed ? "Mark as incomplete" : "Mark completed"}</button></div>
                  </div>
                  <div className={compact(cardStyle, "overflow-hidden p-4 sm:p-5")}>
                    <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-black">Lesson recording</h3><span className={compact("text-xs font-semibold", skin.muted)}>{validVideos.length} videos</span></div>
                    {validVideos.length ? (
                      <>
                        <div className="grid gap-2 sm:grid-cols-2">{validVideos.map((video, index) => <button key={`${video.id}-${index}`} onClick={() => setSelectedVideoId(video.id)} className={compact("overflow-hidden rounded-xl border text-left", selectedVideoId === video.id ? dark ? "border-blue-400 bg-[#203e5f]" : "border-blue-400 bg-blue-50" : skin.line)}><div className="relative flex h-24 items-center justify-center overflow-hidden bg-[#0d2c55] text-3xl text-white"><FaCirclePlay className="relative z-10" />{thumbnails[video.url] && <img src={thumbnails[video.url]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}</div><p className="p-3 text-xs font-extrabold leading-5">{video.title || `Recording ${index + 1}`}</p></button>)}</div>
                        <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-black">{activeVideo ? <div ref={playerMountRef} className="absolute inset-0" /> : <div className="flex h-full items-center justify-center text-sm text-white/60">Select a recording</div>}</div>
                        {mutedHint && <p className="mt-2 text-xs text-amber-500">Your browser may require you to enable video sound manually.</p>}
                        <p className={compact("mt-3 text-xs", skin.muted)}>Video position is remembered on this device. A lesson is automatically completed after 90% watched.</p>
                      </>
                    ) : <EmptyMedia title="Recording coming soon" description="The lesson is planned for this intake. Your trainer will add the recording when it is published." dark={dark} />}
                  </div>
                  <div className={compact(cardStyle, "p-5 sm:p-6")}><div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-base font-black"><FaFileLines className="text-blue-500" /> Class materials</h3><span className={compact("text-xs", skin.muted)}>{validDocs.length} files</span></div>{validDocs.length ? <div className="space-y-2">{validDocs.map((doc, index) => <a key={`${selectedLesson.key}-${index}`} href={doc.url.trim()} target="_blank" rel="noreferrer" className={compact("flex items-center justify-between gap-3 rounded-xl border p-3 text-xs font-bold", skin.line, skin.hover)}><span className="min-w-0 truncate">{doc.title}</span><FaDownload className="shrink-0 text-blue-500" /></a>)}</div> : <p className={compact("text-sm leading-6", skin.muted)}>No documents published for this lesson yet.</p>}</div>
                  <div className={compact(cardStyle, "p-5 sm:p-6")}><h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-blue-500" /> Personal lesson notes</h3><p className={compact("mt-2 text-xs", skin.muted)}>Notes are private to this account and stored in this browser.</p><textarea value={progress[selectedLesson.progressId]?.note || ""} onChange={(event) => persistLessonPatch(selectedLesson.progressId, { note: event.target.value })} placeholder="Write down concepts, SPL commands, questions, or practice ideas..." className={compact("mt-4 h-40 w-full resize-y rounded-xl border p-4 text-sm leading-6 outline-none focus:border-blue-400", skin.input)} /><p className={compact("mt-2 text-right text-[11px]", skin.muted)}>Autosaved on this device</p></div>
                </section>
              </div>
            </>
          )}

          {view === "roadmap" && (
            <>
              <div><SectionLabel dark={dark}>Your program</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">Training roadmap</h1><p className={compact("mt-2 max-w-2xl text-sm leading-7", skin.muted)}>{isLegacy ? "Review your course lessons and available learning materials." : "A structured path from first-time Splunk user to practical administration and certification preparation."}</p></div>
              {!isLegacy ? (
                <>
                  <div className={compact(cardStyle, "p-6 sm:p-8")}><h2 className="text-xl font-black">Program milestones</h2><div className="mt-7 space-y-0">{milestones.map((item, index) => <div key={item.name} className="flex gap-4 sm:gap-5"><div className="flex flex-col items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c66d2] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>{index !== milestones.length - 1 && <span className={compact("my-1 w-px flex-1", dark ? "bg-white/15" : "bg-slate-200")} />}</div><div className={compact("min-w-0 flex-1 pb-8", index === milestones.length - 1 && "pb-0")}><p className="text-xs font-bold text-blue-500">{item.date}</p><h3 className="mt-1 text-base font-black">{item.name}</h3><p className={compact("mt-1 text-xs font-semibold", skin.muted)}>{item.category}</p><p className={compact("mt-3 text-sm leading-6", skin.muted)}>{item.description}</p></div></div>)}</div></div>
                  <div className={compact(cardStyle, "p-6 sm:p-8")}><h2 className="text-xl font-black">What you'll work on</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{deliverables.map((item) => <div key={item} className={compact("flex gap-3 rounded-xl border p-4", skin.soft)}><FaCheck className="mt-1 shrink-0 text-emerald-500" /><span className="text-sm font-semibold leading-6">{item}</span></div>)}</div></div>
                </>
              ) : (
                <div className={compact(cardStyle, "p-6")}><h2 className="text-xl font-black">Your recorded syllabus</h2><div className="mt-5 space-y-3">{lessons.map((lesson) => <button key={lesson.key} onClick={() => openLesson(lesson)} className={compact("flex w-full items-center gap-3 rounded-xl border p-4 text-left", skin.soft, skin.hover)}><span className="font-black text-blue-500">{String(lesson.number).padStart(2, "0")}</span><span className="flex-1 text-sm font-bold">{lesson.title}</span><FaArrowRight className="text-blue-500" /></button>)}</div></div>
              )}
            </>
          )}

          {view === "resources" && (
            <>
              <div><SectionLabel dark={dark}>Learning materials</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">Resource library</h1><p className={compact("mt-2 text-sm", skin.muted)}>Access the documents and assignments published for your own cohort.</p></div>
              <div className={compact(cardStyle, "p-6 sm:p-7")}>
                {allDocs.length ? <div className="space-y-3">{allDocs.map((doc) => <div key={doc.key} className={compact("flex flex-wrap items-center gap-4 rounded-xl border p-4", skin.soft)}><span className={compact("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", dark ? "bg-white/10 text-sky-300" : "bg-blue-100 text-blue-700")}><FaFileLines /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold">{doc.title}</h3><p className={compact("mt-1 text-xs", skin.muted)}>{doc.lessonTitle}</p></div><a href={doc.url.trim()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700">Open <FaArrowRight /></a></div>)}</div> : <EmptyMedia title="Resources will appear here" description="Once your trainer uploads lesson slides, worksheets and assignments, the documents will be listed in this library." dark={dark} />}
              </div>
            </>
          )}

          <footer className={compact("flex flex-wrap items-center justify-between gap-4 border-t py-5 text-xs", skin.line, skin.muted)}>
            <div><strong className={dark ? "text-white" : "text-slate-800"}>T.O Analytics LLC</strong><span className="mx-2">·</span>{title}</div>
            <div className="flex flex-wrap items-center gap-4"><span>Saved on this device</span><a href={SUPPORT_URL} className="hover:text-blue-500">Support</a><button onClick={resetProgress} className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600"><FaRotateRight /> Reset my progress</button></div>
          </footer>
        </div>
      </div>
    </main>
  );
}




// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Player from "@vimeo/player";
// import { NavLink, useLocation } from "react-router-dom";
// import {
//   FaArrowRight,
//   FaBookOpen,
//   FaChartLine,
//   FaCheck,
//   FaCirclePlay,
//   FaClock,
//   FaDownload,
//   FaFileLines,
//   FaGraduationCap,
//   FaLayerGroup,
//   FaLock,
//   FaMagnifyingGlass,
//   FaMoon,
//   FaNoteSticky,
//   FaRotateRight,
//   FaSun,
//   FaVideo,
//   FaXmark,
// } from "react-icons/fa6";
// import SplunkKnowledgePopup from "./SplunkKnowledgePopup";

// /**
//  * T.O Analytics · Splunk Student Campus
//  *
//  * One drop-in replacement for the previous CoursePortal.jsx.
//  * - Old content and its cp_progress_<email> localStorage key are retained.
//  * - Oct 2026 students see a separate fourteen-session PLANNED curriculum.
//  * - New materials are intentionally EMPTY until you publish real URLs.
//  * - The existing access API must assign cohortId on the SERVER, never in JS.
//  * - The existing backend progress API is read-only in the supplied source;
//  *   changes continue to save locally (same actual behavior as old portal).
//  */

// const NEW_COHORT_ID = "splunk-2026-oct";

// // QUICK SETUP: Keep this list identical to the one in MyCourses.jsx.
// // This is only a temporary UI gate for an EMPTY curriculum, NOT secure authorization.
// const OCTOBER_2026_EMAILS = new Set([
//   "samuelsamuelmayowa@gmail.com", // test account (can also access previous intake)
//   "spheremessage@gmail.com",
//   "tomideolulana@gmail.com"
//   // "anotherstudent@example.com",
// ]);
// const LEGACY_COHORT_ID = "legacy";
// const SUPPORT_EMAIL = "t.oanalyticsllc@gmail.com";
// const SUPPORT_URL = `mailto:${SUPPORT_EMAIL}`;

// // Original course data, including every existing Vimeo / Google Drive URL.
// // Do not change historical ids without migrating stored student progress.
// const legacyCourses = [
//   {
//     id: "splunk",
//     title: "Splunk Training",
//     classes: [
//       {
//         id: "class1",
//         title: "Orientation — Intro (1 Videos)",
//         videos: [
//           {
//             id: "v1",
//             title: "To-analytics Orientation",
//             url: "https://player.vimeo.com/video/1126909883",
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "To-analytics Orientation",
//             url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
//           },
//         ],
//       },
//       {
//         id: "class2",
//         title: "Class 1 — Splunk  SIEM (1 Videos)",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 1",
//             url: "https://player.vimeo.com/video/1127004938",
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "To-analytics Splunk Class 1 Intro",
//             url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
//           },
//           {
//             id: "d2",
//             title: "To-analytics Splunk Class 1 Note",
//             url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
//           },
//         ],
//       },
//       {
//         id: "class3",
//         title: "Class 2 —  Splunk Basics",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 2",
//             url: "https://player.vimeo.com/video/1131114931",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 2",
//             url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
//           },
//           {
//             id: "d4",
//             title: "To-analytics Splunk  Class 2 Note",
//             url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
//           },
//         ],
//       },
//       {
//         id: "class4",
//         title: "Class 3 — Splunk SPL",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 3",
//             url: "https://player.vimeo.com/video/1133357923",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 3",
//             url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//           {
//             id: "d4",
//             title: "To-analytics Splunk Class 3 Note",
//             url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
//           },
//         ],
//       },
//       {
//         id: "class5",
//         title: "Class 4 — SPL Part 2",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 4",
//             url: "https://player.vimeo.com/video/1136469770",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 4",
//             url: "https://drive.google.com/file/d/1XVZBJxSCe_bj-MP93nGyJPKG3qoKjrb_/preview",
//             // url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//         ],
//       },

//       {
//         id: "class6",
//         title: "Class 5  — Splunk SPL  LAB",
//         desc: "Creating reports, dashboards, visualizations, inputs and filters. .",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 5",
//             url: "https://player.vimeo.com/video/1138152119",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Splunk Class 5 Slides",
//             url: "",
//             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
//           },

//           {
//             id: "d3",
//             title: "Splunk Class 5 Note",
//             url: "https://drive.google.com/file/d/1RrF8dEuaUgyKiWhF8lQ4h-WiN9CUb4gE/preview",
//             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
//           },
//         ],
//       },

//       {
//         id: "class8",
//         title: "Class 6  — Splunk Knowledge Objects.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 6",
//             url: "https://player.vimeo.com/video/1140703570",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Splunk Class 6 Slides",
//             url: "https://drive.google.com/file/d/1cXBItLD6OpbOY6aDi5NGQ0-KXJbutCIS/view?usp=sharing",
//           },

//           {
//             id: "d3",
//             title: "Splunk Class 6 Note",
//             url: "https://drive.google.com/file/d/1fVtS0u-mPndEiVbSGm1f2H5Qm_Dx3CzV/preview",
//           },
//         ],
//       },

//       {
//         id: "class7",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 7 Splunk Lab Knowledge Objects",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 7",
//             url: "https://player.vimeo.com/video/1145017764",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "",
//             url: "",
//           },
//         ],
//       },

//       // https://player.vimeo.com/video/1149696096
//       {
//         id: "class8",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 8 Splunk Dashboard ",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 8",
//             url: "https://player.vimeo.com/video/1146557656",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8",
//             url: "https://drive.google.com/file/d/1jBaWruZc2sgrmzuLFWuwtcNMHrOiab8K/preview",
//           },

//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8 Note",
//             url: "https://drive.google.com/file/d/1EvVwiUgfR8Vl1q4MIIUPCmHnFDDKvPg4/preview",
//           },

//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8 Assignment",
//             url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
//           },
//         ],
//       },

//       {
//         id: "class9",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 9 Splunk Dashboard Lab",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 9",
//             url: "https://player.vimeo.com/video/1149696096",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "",
//             url: "",
//           },
//         ],
//       },
//       //

//       {
//         id: "class10",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 10 Certification Exam, Job & Assignment Review",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 10",
//             url: "https://player.vimeo.com/video/1153292493",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "Assignment",
//             url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
//           },
//         ],
//       },

//       {
//         id: "class11",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 11 Onboarding data",
//         // desc: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/view?usp=sharing",
//         videos: [
//           {
//             id: "v2",
//             title: "",
//             url: "https://player.vimeo.com/video/1156881908",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "Onboarding data ",
//             url: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/preview",
//           },
//         ],
//       },

//       {
//         id: "class12",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 12 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 12 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1158631944",
//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 12 Data Onboarding Lab",
//             url: "",
//           },
//         ],
//       },

//       {
//         id: "class13",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 13 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 13 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1161024327",

//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 13 Data Onboarding Lab",
//             url: "https://docs.google.com/presentation/d/16tCZ7QDzXSVXw7RnQFvKxO7mZEH1E87d/preview",
//           },
//         ],
//       },
//     ],
//   },
// ];

// const newCohortLessons = [
//   { id: "oct26-f01", title: "Introduction to Splunk", phase: "Foundations", topic: "What Splunk does, use cases, and core concepts." },
//   { id: "oct26-f02", title: "Splunk Basics & Architecture", phase: "Foundations", topic: "Components, platform architecture, and navigation." },
//   { id: "oct26-f03", title: "Searching & Reporting", phase: "Foundations", topic: "Exploring machine data and creating useful searches." },
//   { id: "oct26-f04", title: "Search Processing Language (SPL)", phase: "Foundations", topic: "Build practical searches using basic SPL commands." },
//   { id: "oct26-f05", title: "Fields & Knowledge Objects", phase: "Foundations", topic: "Working with extracted fields and reusable search knowledge." },
//   { id: "oct26-f06", title: "Dashboards, Visualizations & Alerts", phase: "Foundations", topic: "Turn search results into reports, dashboards, and monitoring alerts." },
//   { id: "oct26-a01", title: "Distributed Splunk Architecture", phase: "Administration", topic: "Understand the components of a distributed Splunk deployment." },
//   { id: "oct26-a02", title: "Data Inputs & Indexing", phase: "Administration", topic: "Understand data collection, indexing, and data management." },
//   { id: "oct26-a03", title: "Forwarding & Data Onboarding", phase: "Administration", topic: "Plan forwarding and onboard data into Splunk." },
//   { id: "oct26-a04", title: "Platform & User Management", phase: "Administration", topic: "Review administration workflows and platform settings." },
//   { id: "oct26-a05", title: "Security & Access Control", phase: "Administration", topic: "Explore users, roles, and secure access." },
//   { id: "oct26-a06", title: "Advanced SPL & Optimization", phase: "Administration", topic: "Improve searches and query performance." },
//   { id: "oct26-a07", title: "Performance Tuning & Troubleshooting", phase: "Administration", topic: "Investigate and maintain platform health." },
//   { id: "oct26-a08", title: "Final Capstone Project", phase: "Administration", topic: "Distributed deployment, forwarding, data onboarding, dashboards, and alerts." },
// ].map((lesson, index) => ({
//   ...lesson,
//   key: lesson.id,
//   progressId: lesson.id,
//   number: index + 1,
//   // Attach official released Vimeo/Drive content here later.
//   videos: lesson.videos || [],
//   docs: lesson.docs || [],
// }));

// const milestones = [
//   { date: "31 Oct 2026", short: "Oct 31", name: "Orientation", category: "Welcome", description: "Meet the program, trainers, expectations and certification goals." },
//   { date: "14 Nov – 19 Dec 2026", short: "Nov 14 – Dec 19", name: "Splunk Foundations", category: "Phase 01", description: "Introduction, searching and reporting, basic SPL, fields and knowledge objects." },
//   { date: "Two-week break", short: "After Foundations", name: "Power User Certification", category: "Exam preparation", description: "Preparation period for the Splunk Core Power User Certification Exam." },
//   { date: "9 Jan – 27 Feb 2027", short: "Jan 9 – Feb 27", name: "Splunk Backend Administration", category: "Phase 02", description: "Distributed architecture, data onboarding, management, performance tuning, and troubleshooting." },
//   { date: "Two-week break", short: "After Administration", name: "Enterprise Admin Certification", category: "Exam preparation", description: "Preparation period for the Splunk Enterprise Certified Admin Exam." },
//   { date: "13 Mar 2027", short: "Mar 13", name: "Interview Preparation", category: "Career readiness", description: "Interview practice and preparation for the next career step." },
// ];

// const deliverables = [
//   "Weekly assignments and hands-on Splunk search tasks",
//   "Dashboards, reports, and alert practice",
//   "Distributed Splunk deployment capstone",
//   "Forwarding and data onboarding exercises",
//   "Certification and interview preparation",
// ];

// // Preserve original ids for the first occurrence of each historical lesson.
// // The supplied old source contains a duplicate "class8" id: make its later
// // occurrence unique so it doesn't accidentally inherit the first one's status.
// // Previous progress for the second duplicate cannot be recovered separately.
// const seenLegacy = new Set();
// const legacyLessons = legacyCourses[0].classes.map((lesson, index) => {
//   const firstOccurrence = !seenLegacy.has(lesson.id);
//   seenLegacy.add(lesson.id);
//   return {
//     ...lesson,
//     key: `old-lesson-${index}`,
//     progressId: firstOccurrence ? lesson.id : `${lesson.id}__session_${index + 1}`,
//     number: index + 1,
//     phase: index <= 9 ? "Splunk Training" : "Splunk Administration",
//     topic: lesson.desc || "Recorded lesson from the previous Splunk training intake.",
//   };
// });

// function normalizeEmail(raw) {
//   if (!raw) return "";
//   try {
//     const parsed = JSON.parse(raw);
//     if (typeof parsed === "string") return parsed.trim().toLowerCase();
//     return String(parsed?.email || "").trim().toLowerCase();
//   } catch {
//     return String(raw).trim().toLowerCase();
//   }
// }

// function getStorageKey(email, cohortId) {
//   const normalized = String(email || "").toLowerCase().trim();
//   return cohortId === LEGACY_COHORT_ID
//     ? `cp_progress_${normalized}`
//     : `cp_progress_${cohortId}_${normalized}`;
// }

// function readStoredProgress(key) {
//   try {
//     const saved = JSON.parse(localStorage.getItem(key) || "{}");
//     return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
//   } catch {
//     return {};
//   }
// }

// function mapBackendProgress(data) {
//   if (!Array.isArray(data)) return {};
//   const mapped = {};
//   data.forEach((p) => {
//     if (!p?.classId) return;
//     mapped[p.classId] = {
//       note: p.note || "",
//       time: Number(p.time) || 0,
//       duration: Number(p.duration) || 0,
//       completed: Boolean(p.completed),
//       videoId: p.videoId || "",
//     };
//   });
//   return mapped;
// }

// function percentFor(record) {
//   if (record?.completed) return 100;
//   if (!record?.duration) return 0;
//   return Math.min(100, Math.round(((record.time || 0) / record.duration) * 100));
// }

// const compact = (...items) => items.filter(Boolean).join(" ");

// function SectionLabel({ children, dark }) {
//   return (
//     <p className={compact("text-[11px] font-extrabold uppercase tracking-[0.19em]", dark ? "text-cyan-300" : "text-blue-700")}>
//       {children}
//     </p>
//   );
// }

// function Ring({ percentage, dark, size = 120 }) {
//   const r = 42;
//   return (
//     <div className="relative shrink-0" style={{ width: size, height: size }}>
//       <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${percentage}% completed`}>
//         <circle cx="50" cy="50" r={r} fill="none" stroke={dark ? "#283852" : "#dfe8f4"} strokeWidth="8" />
//         <circle cx="50" cy="50" r={r} fill="none" stroke="#34b7f1" strokeWidth="8" strokeLinecap="round"
//           strokeDasharray={`${(percentage / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`} />
//       </svg>
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <span className="text-2xl font-black tabular-nums">{percentage}%</span>
//         <span className={compact("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>complete</span>
//       </div>
//     </div>
//   );
// }

// function StatCard({ icon: Icon, value, label, dark }) {
//   return (
//     <div className={compact("rounded-2xl border p-5", dark ? "border-white/10 bg-[#111f34]" : "border-slate-200 bg-white")}>
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <p className={compact("text-xs font-semibold", dark ? "text-slate-400" : "text-slate-500")}>{label}</p>
//           <p className="mt-2 text-3xl font-black tracking-tight tabular-nums">{value}</p>
//         </div>
//         <span className={compact("flex h-11 w-11 items-center justify-center rounded-xl text-lg", dark ? "bg-[#1d3857] text-cyan-300" : "bg-blue-50 text-blue-700")}>
//           <Icon />
//         </span>
//       </div>
//     </div>
//   );
// }

// function EmptyMedia({ title, description, dark }) {
//   return (
//     <div className={compact("rounded-2xl border border-dashed px-6 py-10 text-center", dark ? "border-white/15 bg-white/[0.025]" : "border-slate-300 bg-slate-50/70")}>
//       <div className={compact("mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-xl", dark ? "bg-white/10 text-cyan-300" : "bg-blue-100 text-blue-700")}>
//         <FaVideo />
//       </div>
//       <h3 className="mt-4 font-extrabold">{title}</h3>
//       <p className={compact("mx-auto mt-2 max-w-sm text-sm leading-6", dark ? "text-slate-400" : "text-slate-500")}>{description}</p>
//     </div>
//   );
// }

// function AccessPage({ loading, email }) {
//   return (
//     <main className="flex min-h-[85vh] items-center justify-center bg-[#071426] px-6 py-16 text-white">
//       <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f243b] p-9 text-center shadow-2xl">
//         <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl text-sky-300">
//           {loading ? <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/20 border-t-sky-300" /> : <FaLock />}
//         </span>
//         <h1 className="mt-6 text-2xl font-black">{loading ? "Verifying student access" : "Learning portal access required"}</h1>
//         <p className="mt-3 text-sm leading-7 text-slate-300">
//           {loading
//             ? "Checking your student enrollment and assigned training cohort."
//             : "Sign in with your enrolled student account. If you believe you should have access, contact the T.O Analytics team."}
//         </p>
//         {!loading && (
//           <>
//             {email && <p className="mt-4 break-all rounded-xl bg-white/5 p-3 text-xs text-slate-300">{email}</p>}
//             <a href={SUPPORT_URL} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-extrabold text-slate-950">
//               Contact support <FaArrowRight />
//             </a>
//             <div className="mt-4"><NavLink to="/" className="text-xs text-slate-400 underline underline-offset-4">Return to website</NavLink></div>
//           </>
//         )}
//       </div>
//     </main>
//   );
// }

// const MENU = [
//   { id: "overview", label: "Overview", icon: FaChartLine },
//   { id: "lessons", label: "My classes", icon: FaBookOpen },
//   { id: "roadmap", label: "Learning roadmap", icon: FaLayerGroup },
//   { id: "resources", label: "Resources", icon: FaFileLines },
// ];

// export default function CoursePortal() {
//   // Query string determines which course card the student clicked.
//   const location = useLocation();
//   const viewingOctober2026 = new URLSearchParams(location.search).get("intake") === "2026";

//   const [auth, setAuth] = useState({ loading: true, allowed: false, email: "", cohortId: null });
//   const [view, setView] = useState("overview");
//   const [dark, setDark] = useState(false);
//   const [search, setSearch] = useState("");
//   const [selectedLessonKey, setSelectedLessonKey] = useState(null);
//   const [selectedVideoId, setSelectedVideoId] = useState(null);
//   const [progress, setProgress] = useState({});
//   const [toastDismissed, setToastDismissed] = useState(false);
//   const [thumbnails, setThumbnails] = useState({});
//   const [mutedHint, setMutedHint] = useState(false);
//   const playerMountRef = useRef(null);
//   const playerRef = useRef(null);
//   const progressRef = useRef({});

//   const isLegacy = auth.cohortId === LEGACY_COHORT_ID;
//   const lessons = isLegacy ? legacyLessons : newCohortLessons;
//   const storageKey = auth.cohortId ? getStorageKey(auth.email, auth.cohortId) : null;
//   const selectedLesson = lessons.find((lesson) => lesson.key === selectedLessonKey) || lessons[0];
//   const validVideos = (selectedLesson?.videos || []).filter((v) => Boolean(v?.url?.trim()));
//   const validDocs = (selectedLesson?.docs || []).filter((doc) => Boolean(doc?.url?.trim() && doc?.title?.trim()));
//   const activeVideo = validVideos.find((v) => v.id === selectedVideoId);

//   const completed = lessons.filter((lesson) => progress[lesson.progressId]?.completed).length;
//   const progressPercent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
//   const allDocs = lessons.flatMap((lesson) =>
//     (lesson.docs || [])
//       .filter((doc) => doc?.url?.trim() && doc?.title?.trim())
//       .map((doc, i) => ({ ...doc, key: `${lesson.key}-doc-${i}`, lessonTitle: lesson.title, lessonKey: lesson.key }))
//   );
//   const totalVideos = lessons.reduce((sum, lesson) => sum + (lesson.videos || []).filter((v) => v?.url?.trim()).length, 0);
//   const hasAssignments = allDocs.some((doc) => /assignment/i.test(doc.title));
//   const filteredLessons = useMemo(() => lessons.filter((lesson) =>
//     `${lesson.title} ${lesson.topic} ${lesson.phase}`.toLowerCase().includes(search.trim().toLowerCase())), [lessons, search]);

//   const skin = dark ? {
//     shell: "bg-[#071426] text-slate-50",
//     panel: "border-white/10 bg-[#102037]",
//     soft: "border-white/10 bg-[#14283f]",
//     muted: "text-slate-400",
//     line: "border-white/10",
//     input: "border-white/10 bg-[#091a2d] text-slate-100 placeholder:text-slate-500",
//     hover: "hover:bg-white/[0.065]",
//     action: "bg-slate-50 text-slate-950 hover:bg-sky-100",
//   } : {
//     shell: "bg-[#f4f7fb] text-slate-900",
//     panel: "border-slate-200 bg-white",
//     soft: "border-slate-200 bg-[#f7faff]",
//     muted: "text-slate-500",
//     line: "border-slate-200",
//     input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
//     hover: "hover:bg-blue-50",
//     action: "bg-slate-900 text-white hover:bg-slate-800",
//   };

//   // Enrollment/cohort assignment is controlled by the verified backend response.
//   // Missing cohortId is treated as LEGACY solely for backward compatibility.
//   useEffect(() => {
//     let live = true;
//     const email = normalizeEmail(localStorage.getItem("user") || "");
//     if (!email) {
//       setAuth({ loading: false, allowed: false, email: "", cohortId: null });
//       return;
//     }
//     // October 2026 only displays the published roadmap and EMPTY lesson slots.
//     // It deliberately bypasses the old Splunk course lookup, because these
//     // students have not yet been added to that backend course.
//     // Do NOT use this shortcut for private videos, paid files or other sensitive data.
//     if (viewingOctober2026) {
//       const allowed = OCTOBER_2026_EMAILS.has(email);
//       setAuth({ loading: false, allowed, email, cohortId: allowed ? NEW_COHORT_ID : null });
//       return;
//     }

//     // Previous intake: keep the existing server access check unchanged.
//     setAuth({ loading: true, allowed: false, email, cohortId: null });
//     const verify = async () => {
//       try {
//         const res = await fetch("/api/check-student-access", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, courseId: "splunk" }),
//         });
//         const data = await res.json();
//         if (!res.ok || data?.allowed !== true) throw new Error(data?.error || "Access not granted");
//         const cohortId = data.cohortId ?? LEGACY_COHORT_ID;
//         // Unknown assignments are rejected rather than showing the wrong student content.
//         if (![LEGACY_COHORT_ID, NEW_COHORT_ID].includes(cohortId)) {
//           throw new Error(`Unknown assigned cohort: ${cohortId}`);
//         }
//         if (live) setAuth({ loading: false, allowed: true, email, cohortId });
//       } catch (error) {
//         console.error("Student access check failed", error);
//         if (live) setAuth({ loading: false, allowed: false, email, cohortId: null });
//       }
//     };
//     verify();
//     return () => { live = false; };
//   }, [viewingOctober2026]);

//   // Historical backend progress remains readable, while the October 2026
//   // cohort starts fresh and isolated until a cohort-aware backend is built.
//   useEffect(() => {
//     if (!auth.allowed || !storageKey) return;
//     let live = true;
//     const local = readStoredProgress(storageKey);
//     progressRef.current = local;
//     setProgress(local);
//     setSelectedLessonKey((isLegacy ? legacyLessons : newCohortLessons)[0]?.key || null);
//     setSelectedVideoId(null);

//     if (isLegacy && import.meta.env.VITE_API_BASE) {
//       (async () => {
//         try {
//           const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/progress/${encodeURIComponent(auth.email)}`);
//           if (!res.ok) throw new Error("Failed to fetch old student progress");
//           const remote = mapBackendProgress(await res.json());
//           if (!live) return;
//           // Locally saved changes take precedence because existing write
//           // handlers never posted updates to the old backend.
//           const merged = { ...remote, ...progressRef.current };
//           progressRef.current = merged;
//           setProgress(merged);
//           localStorage.setItem(storageKey, JSON.stringify(merged));
//         } catch (error) {
//           console.warn("Historical backend progress unavailable; local data kept", error);
//         }
//       })();
//     }
//     return () => { live = false; };
//   }, [auth.allowed, auth.email, auth.cohortId, storageKey, isLegacy]);

//   function persistLessonPatch(progressId, patch) {
//     if (!auth.allowed || !storageKey || !progressId) return;
//     const next = {
//       ...progressRef.current,
//       [progressId]: { ...(progressRef.current[progressId] || {}), ...patch },
//     };
//     progressRef.current = next;
//     localStorage.setItem(storageKey, JSON.stringify(next));
//     setProgress(next);
//   }

//   function openLesson(lesson) {
//     setSelectedLessonKey(lesson.key);
//     const savedVideoId = progressRef.current[lesson.progressId]?.videoId;
//     const videos = (lesson.videos || []).filter((v) => v?.url?.trim());
//     const bestVideo = videos.find((v) => v.id === savedVideoId) || videos[0];
//     setSelectedVideoId(bestVideo?.id || null);
//     setMutedHint(false);
//     setView("lessons");
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   function resetProgress() {
//     if (!storageKey || !window.confirm("Reset your saved progress and notes for THIS cohort on THIS device?")) return;
//     localStorage.removeItem(storageKey);
//     progressRef.current = {};
//     setProgress({});
//     setSelectedVideoId(null);
//   }

//   // Vimeo player, playback resume, timed progress, and 90% auto-completion.
//   useEffect(() => {
//     if (!auth.allowed || view !== "lessons" || !activeVideo?.url || !playerMountRef.current || !selectedLesson) return;
//     const mount = playerMountRef.current;
//     const iframe = document.createElement("iframe");
//     iframe.src = `${activeVideo.url.trim()}${activeVideo.url.includes("?") ? "&" : "?"}transparent=0&autoplay=0`;
//     iframe.allow = "autoplay; fullscreen; picture-in-picture";
//     iframe.setAttribute("allowfullscreen", "");
//     iframe.setAttribute("title", activeVideo.title || "Splunk lesson video");
//     iframe.className = "absolute inset-0 h-full w-full";
//     mount.replaceChildren(iframe);

//     const player = new Player(iframe);
//     playerRef.current = player;
//     const key = selectedLesson.progressId;
//     let lastWrite = 0;
//     let destroyed = false;
//     const saved = progressRef.current[key];
//     player.ready().then(async () => {
//       if (destroyed) return;
//       if (saved?.videoId === activeVideo.id && saved.time > 0 && !saved.completed) {
//         await player.setCurrentTime(saved.time).catch(() => {});
//       }
//       await player.setVolume(1).catch(() => { if (!destroyed) setMutedHint(true); });
//     }).catch(() => {});

//     const onTime = ({ seconds = 0, duration = 0 }) => {
//       const now = Date.now();
//       if (now - lastWrite < 3000 && !(duration > 0 && seconds / duration >= 0.9)) return;
//       lastWrite = now;
//       const current = progressRef.current[key] || {};
//       persistLessonPatch(key, {
//         videoId: activeVideo.id,
//         time: seconds,
//         duration,
//         completed: current.completed || (duration > 0 && seconds / duration >= 0.9),
//       });
//     };
//     const onEnd = () => persistLessonPatch(key, { videoId: activeVideo.id, completed: true });
//     player.on("timeupdate", onTime);
//     player.on("ended", onEnd);
//     return () => {
//       destroyed = true;
//       player.off("timeupdate", onTime);
//       player.off("ended", onEnd);
//       player.destroy().catch(() => {});
//       if (playerRef.current === player) playerRef.current = null;
//       mount.replaceChildren();
//     };
//     // Stable selected class key and URL are intentional player boundaries.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [auth.allowed, auth.cohortId, view, selectedLesson?.key, activeVideo?.url, activeVideo?.id]);

//   // Preserve video preview thumbnails from the old portal (with a fallback).
//   useEffect(() => {
//     if (view !== "lessons") return;
//     let live = true;
//     const videos = validVideos;
//     Promise.all(videos.map(async (video) => {
//       if (video.thumbnail) return [video.url, video.thumbnail];
//       try {
//         const url = video.url.replace("player.vimeo.com/video/", "vimeo.com/");
//         const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
//         if (!response.ok) throw new Error("No thumbnail");
//         const payload = await response.json();
//         return [video.url, payload.thumbnail_url || null];
//       } catch {
//         return [video.url, null];
//       }
//     })).then((entries) => { if (live) setThumbnails((previous) => ({ ...previous, ...Object.fromEntries(entries) })); });
//     return () => { live = false; };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [view, selectedLesson?.key]);

//   if (auth.loading || !auth.allowed) return <AccessPage loading={auth.loading} email={auth.email} />;

//   const title = isLegacy ? "Previous Splunk Training" : "Splunk Professional Bootcamp";
//   const cohortLabel = isLegacy ? "Previous intake" : "October 2026 intake";
//   const featured = lessons.find((lesson) => !progress[lesson.progressId]?.completed) || lessons[0];
//   const cardStyle = compact("rounded-[24px] border shadow-sm", skin.panel);

//   return (
//     <main className={compact("min-h-screen transition-colors duration-200", skin.shell)}>
//       {/* A small utility banner; old cohort popup is deliberately not shared with the new intake. */}
//       {isLegacy && <SplunkKnowledgePopup />}
//       {hasAssignments && !toastDismissed && (
//         <div className="fixed bottom-6 right-5 z-50 flex max-w-sm items-start gap-4 rounded-2xl border border-sky-700/10 bg-slate-950 px-5 py-4 text-white shadow-2xl">
//           <FaFileLines className="mt-1 shrink-0 text-sky-300" />
//           <div><p className="font-extrabold">Assignment resources available</p><p className="mt-1 text-xs leading-5 text-slate-300">View assignment documents in Resources.</p></div>
//           <button onClick={() => setToastDismissed(true)} aria-label="Dismiss" className="p-1 text-slate-400 hover:text-white"><FaXmark /></button>
//         </div>
//       )}

//       <header className={compact("border-b", skin.line, dark ? "bg-[#0a192c]" : "bg-white")}>
//         <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
//           <div className="flex min-w-0 items-center gap-3">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black tracking-tight text-white">T.O</div>
//             <div className="min-w-0"><p className="truncate text-[15px] font-black tracking-tight">T.O Analytics</p><p className={compact("text-[11px] font-semibold", skin.muted)}>Student learning campus</p></div>
//             <span className={compact("ml-3 hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex", dark ? "bg-blue-400/10 text-sky-200" : "bg-blue-50 text-blue-700")}>{cohortLabel}</span>
//           </div>
//           <div className="flex items-center gap-2 sm:gap-3">
//             <span className={compact("hidden max-w-[230px] truncate text-xs font-semibold md:block", skin.muted)} title={auth.email}>{auth.email}</span>
//             <button type="button" onClick={() => setDark((value) => !value)}
//               className={compact("flex h-10 w-10 items-center justify-center rounded-xl border", skin.line, skin.hover)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
//               {dark ? <FaSun /> : <FaMoon />}
//             </button>
//             <NavLink to="/" className={compact("rounded-xl border px-3 py-2.5 text-xs font-extrabold", skin.line, skin.hover)}>Website <span className="hidden sm:inline">↗</span></NavLink>
//           </div>
//         </div>
//       </header>

//       <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:px-10 lg:py-9">
//         <aside className="min-w-0">
//           <div className={compact("rounded-[24px] border p-4 lg:sticky lg:top-6", skin.panel)}>
//             <div className={compact("mb-5 rounded-2xl p-4", dark ? "bg-[#1a3554]" : "bg-[#edf5ff]")}>
//               <div className="flex items-center gap-2 text-sky-600"><FaGraduationCap /><span className="text-[11px] font-extrabold uppercase tracking-wider">Learning space</span></div>
//               <h2 className="mt-2 text-base font-black leading-snug">{isLegacy ? "Your previous classes" : "Your learning journey"}</h2>
//               <p className={compact("mt-2 text-xs leading-5", skin.muted)}>{isLegacy ? "Archived course library" : "14 planned training sessions"}</p>
//             </div>
//             <p className={compact("mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em]", skin.muted)}>Workspace</p>
//             <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Student navigation">
//               {MENU.map(({ id, label, icon: Icon }) => (
//                 <button key={id} type="button" onClick={() => { setView(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
//                   className={compact("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm", view === id ? "bg-[#0a62d2] text-white shadow-md shadow-blue-800/10" : skin.hover, view !== id && skin.muted)}>
//                   <Icon className="shrink-0" /> <span>{label}</span>
//                   {view === id && <FaArrowRight className="ml-auto hidden text-[10px] lg:block" />}
//                 </button>
//               ))}
//             </nav>
//             <div className={compact("mt-5 border-t pt-5", skin.line)}>
//               <div className="flex items-center justify-between"><span className="text-xs font-bold">Your progress</span><span className="text-xs font-black text-[#298fd3]">{progressPercent}%</span></div>
//               <div className={compact("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}><div className="h-full rounded-full bg-[#1688dc] transition-all" style={{ width: `${progressPercent}%` }} /></div>
//               <p className={compact("mt-2 text-[11px]", skin.muted)}>{completed} of {lessons.length} lessons completed</p>
//             </div>
//             <div className={compact("mt-5 border-t pt-5", skin.line)}>
//               <a href={SUPPORT_URL} className={compact("block rounded-xl border px-3 py-3 text-center text-xs font-bold", skin.line, skin.hover)}>Need help? Contact support</a>
//             </div>
//           </div>
//         </aside>

//         <div className="min-w-0 space-y-6">
//           {view === "overview" && (
//             <>
//               <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
//                 <div className="pointer-events-none absolute -right-14 -top-28 h-[310px] w-[310px] rounded-full border-[52px] border-white/[0.045]" />
//                 <div className="pointer-events-none absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
//                 <div className="relative z-10 max-w-3xl">
//                   <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-sky-100"><FaGraduationCap /> {cohortLabel}</span>
//                   <h1 className="mt-6 max-w-2xl text-3xl font-black leading-[1.13] tracking-tight sm:text-4xl lg:text-[42px]">{isLegacy ? "Welcome back to your learning space." : "Build your Splunk career, one skill at a time."}</h1>
//                   <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">{isLegacy ? "All your existing recordings, lesson materials, notes and progress are still here." : "Learn the fundamentals, explore administration, prepare for certifications and complete a hands-on capstone project."}</p>
//                   <div className="mt-7 flex flex-wrap gap-3">
//                     <button onClick={() => openLesson(featured)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#083269] transition hover:bg-blue-50">{completed ? "Continue learning" : "Explore classes"} <FaArrowRight /></button>
//                     <button onClick={() => setView("roadmap")} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">View roadmap</button>
//                   </div>
//                 </div>
//               </section>

//               <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning statistics">
//                 <StatCard icon={FaLayerGroup} value={lessons.length} label={isLegacy ? "Archived lessons" : "Planned sessions"} dark={dark} />
//                 <StatCard icon={FaVideo} value={totalVideos} label="Available videos" dark={dark} />
//                 <StatCard icon={FaCheck} value={completed} label="Completed lessons" dark={dark} />
//                 <StatCard icon={FaFileLines} value={allDocs.length} label="Available documents" dark={dark} />
//               </section>

//               <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
//                 <section className={compact(cardStyle, "p-6 sm:p-7")}>
//                   <SectionLabel dark={dark}>Your next step</SectionLabel>
//                   <h2 className="mt-3 text-xl font-black tracking-tight">{featured.title}</h2>
//                   <p className={compact("mt-3 text-sm leading-6", skin.muted)}>{featured.topic}</p>
//                   <div className={compact("mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4", skin.soft)}>
//                     <div><p className="text-xs font-extrabold">Lesson {featured.number} of {lessons.length}</p><p className={compact("mt-1 text-xs", skin.muted)}>{(featured.videos || []).some(v => v?.url) ? "Recording available" : "Materials not published yet"}</p></div>
//                     <button onClick={() => openLesson(featured)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700">Open lesson <FaArrowRight /></button>
//                   </div>
//                   <div className="mt-7 flex items-center justify-between"><h3 className="text-base font-black">Learning path</h3><button onClick={() => setView("lessons")} className="text-xs font-bold text-blue-500 hover:underline">All classes →</button></div>
//                   <div className="mt-4 space-y-3">
//                     {(isLegacy ? [
//                       { name: "Your archived recordings", detail: "Revisit lessons and training materials", count: lessons.length },
//                       { name: "Review and practice", detail: "Take notes and track your own progress", count: allDocs.length },
//                     ] : [
//                       { name: "Splunk Foundations", detail: "14 Nov – 19 Dec 2026", count: 6 },
//                       { name: "Splunk Backend Administration", detail: "9 Jan – 27 Feb 2027", count: 8 },
//                     ]).map((step, i) => (
//                       <div key={step.name} className={compact("flex items-center gap-4 rounded-2xl border p-4", skin.soft)}>
//                         <span className={compact("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black", i ? "bg-sky-500/10 text-sky-500" : "bg-blue-600 text-white")}>{String(i + 1).padStart(2, "0")}</span>
//                         <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{step.name}</p><p className={compact("mt-1 text-xs", skin.muted)}>{step.detail}</p></div>
//                         <span className={compact("shrink-0 text-xs font-bold", skin.muted)}>{step.count} {isLegacy ? "items" : "sessions"}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </section>
//                 <section className={compact(cardStyle, "flex flex-col p-6 sm:p-7")}>
//                   <SectionLabel dark={dark}>Progress summary</SectionLabel>
//                   <div className="mt-5 flex justify-center"><Ring percentage={progressPercent} dark={dark} size={155} /></div>
//                   <p className={compact("mt-5 text-center text-sm leading-6", skin.muted)}>Track every lesson from your dedicated learning dashboard.</p>
//                   <div className={compact("mt-5 grid grid-cols-2 gap-3 border-t pt-5", skin.line)}><div><p className="text-2xl font-black">{completed}</p><p className={compact("text-xs", skin.muted)}>Completed</p></div><div><p className="text-2xl font-black">{lessons.length - completed}</p><p className={compact("text-xs", skin.muted)}>Remaining</p></div></div>
//                   <button onClick={() => setView("roadmap")} className={compact("mt-auto pt-5 text-left text-xs font-extrabold", dark ? "text-sky-300" : "text-blue-700")}>Explore training milestones →</button>
//                 </section>
//               </div>
//               {!isLegacy && (
//                 <section className={compact(cardStyle, "p-6 sm:p-7")}>
//                   <div className="flex flex-wrap items-center justify-between gap-3"><div><SectionLabel dark={dark}>Training schedule</SectionLabel><h2 className="mt-2 text-xl font-black">Important program dates</h2></div><button onClick={() => setView("roadmap")} className="text-xs font-bold text-blue-500">Full schedule →</button></div>
//                   <div className="mt-5 grid gap-3 md:grid-cols-3">{[milestones[0], milestones[1], milestones[3]].map((milestone) => <div key={milestone.name} className={compact("rounded-2xl border p-4", skin.soft)}><p className="text-xs font-extrabold text-blue-500">{milestone.short}</p><h3 className="mt-2 text-sm font-black">{milestone.name}</h3><p className={compact("mt-2 text-xs leading-5", skin.muted)}>{milestone.category}</p></div>)}</div>
//                 </section>
//               )}
//               {!isLegacy && (
//                 <section className={compact(cardStyle, "p-6 sm:p-7")}>
//                   <SectionLabel dark={dark}>Orientation details</SectionLabel>
//                   <h2 className="mt-2 text-xl font-black">About your enrollment</h2>
//                   <div className="mt-5 grid gap-3 md:grid-cols-3">
//                     <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Program tuition</p><p className="mt-2 text-2xl font-black">$3,500</p><p className={compact("mt-1 text-xs", skin.muted)}>Published course fee</p></div>
//                     <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Payment method</p><p className="mt-2 text-lg font-black">Zelle</p><p className="mt-1 break-all text-xs text-blue-500">{SUPPORT_EMAIL}</p></div>
//                     <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Certification focus</p><p className="mt-2 text-sm font-black leading-6">Core Power User<br />Enterprise Certified Admin</p></div>
//                   </div>
//                 </section>
//               )}
//             </>
//           )}

//           {view === "lessons" && (
//             <>
//               <div className="flex flex-wrap items-end justify-between gap-4"><div><SectionLabel dark={dark}>Course library</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">My classes</h1><p className={compact("mt-2 text-sm", skin.muted)}>Videos, resources, progress tracking and personal notes in one place.</p></div><span className={compact("rounded-full border px-4 py-2 text-xs font-extrabold", skin.line)}>{lessons.length} classes</span></div>
//               <div className="grid gap-5 xl:grid-cols-[minmax(245px,0.85fr)_minmax(0,1.6fr)]">
//                 <section className={compact(cardStyle, "self-start p-4")}>
//                   <label className={compact("flex items-center gap-3 rounded-xl border px-3 py-3", skin.input)}>
//                     <FaMagnifyingGlass className={skin.muted} />
//                     <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your classes..." aria-label="Search classes" className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:font-medium" />
//                   </label>
//                   <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
//                     {filteredLessons.map((lesson) => {
//                       const selected = lesson.key === selectedLesson.key;
//                       const itemProgress = progress[lesson.progressId];
//                       const mediaReady = (lesson.videos || []).some((v) => v?.url?.trim());
//                       return <button key={lesson.key} onClick={() => openLesson(lesson)} className={compact("w-full rounded-xl border p-3.5 text-left transition", selected ? dark ? "border-blue-400/40 bg-[#1c3b60]" : "border-blue-300 bg-blue-50" : compact(skin.line, skin.hover))}>
//                         <div className="flex items-start gap-3"><span className={compact("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black", itemProgress?.completed ? "bg-emerald-500/15 text-emerald-500" : selected ? "bg-blue-600 text-white" : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600")}>{itemProgress?.completed ? <FaCheck /> : String(lesson.number).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold leading-5">{lesson.title}</h3><p className={compact("mt-1.5 text-[11px]", skin.muted)}>{mediaReady ? "Video available" : "Awaiting lesson recording"}</p><div className={compact("mt-3 h-1.5 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-200")}><div className="h-full rounded-full bg-blue-500" style={{ width: `${percentFor(itemProgress)}%` }} /></div></div></div>
//                       </button>;
//                     })}
//                     {!filteredLessons.length && <p className={compact("px-3 py-6 text-center text-sm", skin.muted)}>No classes match your search.</p>}
//                   </div>
//                 </section>

//                 <section className="min-w-0 space-y-5">
//                   <div className={compact(cardStyle, "p-5 sm:p-6")}>
//                     <div className="flex flex-wrap items-center gap-2"><SectionLabel dark={dark}>Lesson {selectedLesson.number}</SectionLabel><span className={compact("rounded-full px-2.5 py-1 text-[10px] font-black", dark ? "bg-sky-400/10 text-sky-300" : "bg-blue-50 text-blue-700")}>{selectedLesson.phase}</span></div>
//                     <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{selectedLesson.title}</h2>
//                     <p className={compact("mt-3 text-sm leading-6", skin.muted)}>{selectedLesson.topic}</p>
//                     <div className={compact("mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4", skin.line)}><span className={compact("text-xs font-semibold", skin.muted)}>{progress[selectedLesson.progressId]?.completed ? "✓ Completed" : "Not completed yet"}</span><button disabled={!isLegacy && validVideos.length === 0 && validDocs.length === 0} title={!isLegacy && validVideos.length === 0 && validDocs.length === 0 ? "Available when the lesson is published" : "Update lesson completion"} onClick={() => persistLessonPatch(selectedLesson.progressId, { completed: !progress[selectedLesson.progressId]?.completed })} className={compact("disabled:cursor-not-allowed disabled:opacity-40","inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition", progress[selectedLesson.progressId]?.completed ? dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700")}><FaCheck /> {progress[selectedLesson.progressId]?.completed ? "Mark as incomplete" : "Mark completed"}</button></div>
//                   </div>
//                   <div className={compact(cardStyle, "overflow-hidden p-4 sm:p-5")}>
//                     <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-black">Lesson recording</h3><span className={compact("text-xs font-semibold", skin.muted)}>{validVideos.length} videos</span></div>
//                     {validVideos.length ? (
//                       <>
//                         <div className="grid gap-2 sm:grid-cols-2">{validVideos.map((video, index) => <button key={`${video.id}-${index}`} onClick={() => setSelectedVideoId(video.id)} className={compact("overflow-hidden rounded-xl border text-left", selectedVideoId === video.id ? dark ? "border-blue-400 bg-[#203e5f]" : "border-blue-400 bg-blue-50" : skin.line)}><div className="relative flex h-24 items-center justify-center overflow-hidden bg-[#0d2c55] text-3xl text-white"><FaCirclePlay className="relative z-10" />{thumbnails[video.url] && <img src={thumbnails[video.url]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}</div><p className="p-3 text-xs font-extrabold leading-5">{video.title || `Recording ${index + 1}`}</p></button>)}</div>
//                         <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-black">{activeVideo ? <div ref={playerMountRef} className="absolute inset-0" /> : <div className="flex h-full items-center justify-center text-sm text-white/60">Select a recording</div>}</div>
//                         {mutedHint && <p className="mt-2 text-xs text-amber-500">Your browser may require you to enable video sound manually.</p>}
//                         <p className={compact("mt-3 text-xs", skin.muted)}>Video position is remembered on this device. A lesson is automatically completed after 90% watched.</p>
//                       </>
//                     ) : <EmptyMedia title="Recording coming soon" description="The lesson is planned for this intake. Your trainer will add the recording when it is published." dark={dark} />}
//                   </div>
//                   <div className={compact(cardStyle, "p-5 sm:p-6")}><div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-base font-black"><FaFileLines className="text-blue-500" /> Class materials</h3><span className={compact("text-xs", skin.muted)}>{validDocs.length} files</span></div>{validDocs.length ? <div className="space-y-2">{validDocs.map((doc, index) => <a key={`${selectedLesson.key}-${index}`} href={doc.url.trim()} target="_blank" rel="noreferrer" className={compact("flex items-center justify-between gap-3 rounded-xl border p-3 text-xs font-bold", skin.line, skin.hover)}><span className="min-w-0 truncate">{doc.title}</span><FaDownload className="shrink-0 text-blue-500" /></a>)}</div> : <p className={compact("text-sm leading-6", skin.muted)}>No documents published for this lesson yet.</p>}</div>
//                   <div className={compact(cardStyle, "p-5 sm:p-6")}><h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-blue-500" /> Personal lesson notes</h3><p className={compact("mt-2 text-xs", skin.muted)}>Notes are private to this account and stored in this browser.</p><textarea value={progress[selectedLesson.progressId]?.note || ""} onChange={(event) => persistLessonPatch(selectedLesson.progressId, { note: event.target.value })} placeholder="Write down concepts, SPL commands, questions, or practice ideas..." className={compact("mt-4 h-40 w-full resize-y rounded-xl border p-4 text-sm leading-6 outline-none focus:border-blue-400", skin.input)} /><p className={compact("mt-2 text-right text-[11px]", skin.muted)}>Autosaved on this device</p></div>
//                 </section>
//               </div>
//             </>
//           )}

//           {view === "roadmap" && (
//             <>
//               <div><SectionLabel dark={dark}>Your program</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">Training roadmap</h1><p className={compact("mt-2 max-w-2xl text-sm leading-7", skin.muted)}>{isLegacy ? "Review your course lessons and available learning materials." : "A structured path from first-time Splunk user to practical administration and certification preparation."}</p></div>
//               {!isLegacy ? (
//                 <>
//                   <div className={compact(cardStyle, "p-6 sm:p-8")}><h2 className="text-xl font-black">Program milestones</h2><div className="mt-7 space-y-0">{milestones.map((item, index) => <div key={item.name} className="flex gap-4 sm:gap-5"><div className="flex flex-col items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c66d2] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>{index !== milestones.length - 1 && <span className={compact("my-1 w-px flex-1", dark ? "bg-white/15" : "bg-slate-200")} />}</div><div className={compact("min-w-0 flex-1 pb-8", index === milestones.length - 1 && "pb-0")}><p className="text-xs font-bold text-blue-500">{item.date}</p><h3 className="mt-1 text-base font-black">{item.name}</h3><p className={compact("mt-1 text-xs font-semibold", skin.muted)}>{item.category}</p><p className={compact("mt-3 text-sm leading-6", skin.muted)}>{item.description}</p></div></div>)}</div></div>
//                   <div className={compact(cardStyle, "p-6 sm:p-8")}><h2 className="text-xl font-black">What you'll work on</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{deliverables.map((item) => <div key={item} className={compact("flex gap-3 rounded-xl border p-4", skin.soft)}><FaCheck className="mt-1 shrink-0 text-emerald-500" /><span className="text-sm font-semibold leading-6">{item}</span></div>)}</div></div>
//                 </>
//               ) : (
//                 <div className={compact(cardStyle, "p-6")}><h2 className="text-xl font-black">Your recorded syllabus</h2><div className="mt-5 space-y-3">{lessons.map((lesson) => <button key={lesson.key} onClick={() => openLesson(lesson)} className={compact("flex w-full items-center gap-3 rounded-xl border p-4 text-left", skin.soft, skin.hover)}><span className="font-black text-blue-500">{String(lesson.number).padStart(2, "0")}</span><span className="flex-1 text-sm font-bold">{lesson.title}</span><FaArrowRight className="text-blue-500" /></button>)}</div></div>
//               )}
//             </>
//           )}

//           {view === "resources" && (
//             <>
//               <div><SectionLabel dark={dark}>Learning materials</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">Resource library</h1><p className={compact("mt-2 text-sm", skin.muted)}>Access the documents and assignments published for your own cohort.</p></div>
//               <div className={compact(cardStyle, "p-6 sm:p-7")}>
//                 {allDocs.length ? <div className="space-y-3">{allDocs.map((doc) => <div key={doc.key} className={compact("flex flex-wrap items-center gap-4 rounded-xl border p-4", skin.soft)}><span className={compact("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", dark ? "bg-white/10 text-sky-300" : "bg-blue-100 text-blue-700")}><FaFileLines /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold">{doc.title}</h3><p className={compact("mt-1 text-xs", skin.muted)}>{doc.lessonTitle}</p></div><a href={doc.url.trim()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700">Open <FaArrowRight /></a></div>)}</div> : <EmptyMedia title="Resources will appear here" description="Once your trainer uploads lesson slides, worksheets and assignments, the documents will be listed in this library." dark={dark} />}
//               </div>
//             </>
//           )}

//           <footer className={compact("flex flex-wrap items-center justify-between gap-4 border-t py-5 text-xs", skin.line, skin.muted)}>
//             <div><strong className={dark ? "text-white" : "text-slate-800"}>T.O Analytics LLC</strong><span className="mx-2">·</span>{title}</div>
//             <div className="flex flex-wrap items-center gap-4"><span>Saved on this device</span><a href={SUPPORT_URL} className="hover:text-blue-500">Support</a><button onClick={resetProgress} className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600"><FaRotateRight /> Reset my progress</button></div>
//           </footer>
//         </div>
//       </div>
//     </main>
//   );
// }








































































// ----------------------------------------------NEW LEVEL UP .........................................

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Player from "@vimeo/player";
// import { NavLink } from "react-router-dom";
// import {
//   FaArrowRight,
//   FaBookOpen,
//   FaChartLine,
//   FaCheck,
//   FaCirclePlay,
//   FaClock,
//   FaDownload,
//   FaFileLines,
//   FaGraduationCap,
//   FaLayerGroup,
//   FaLock,
//   FaMagnifyingGlass,
//   FaMoon,
//   FaNoteSticky,
//   FaRotateRight,
//   FaSun,
//   FaVideo,
//   FaXmark,
// } from "react-icons/fa6";
// import SplunkKnowledgePopup from "./SplunkKnowledgePopup";

// /**
//  * T.O Analytics · Splunk Student Campus
//  *
//  * One drop-in replacement for the previous CoursePortal.jsx.
//  * - Old content and its cp_progress_<email> localStorage key are retained.
//  * - Oct 2026 students see a separate fourteen-session PLANNED curriculum.
//  * - New materials are intentionally EMPTY until you publish real URLs.
//  * - The existing access API must assign cohortId on the SERVER, never in JS.
//  * - The existing backend progress API is read-only in the supplied source;
//  *   changes continue to save locally (same actual behavior as old portal).
//  */

// const NEW_COHORT_ID = "splunk-2026-oct";
// const LEGACY_COHORT_ID = "legacy";
// const SUPPORT_EMAIL = "t.oanalyticsllc@gmail.com";
// const SUPPORT_URL = `mailto:${SUPPORT_EMAIL}`;

// // Original course data, including every existing Vimeo / Google Drive URL.
// // Do not change historical ids without migrating stored student progress.
// const legacyCourses = [
//   {
//     id: "splunk",
//     title: "Splunk Training",
//     classes: [
//       {
//         id: "class1",
//         title: "Orientation — Intro (1 Videos)",
//         videos: [
//           {
//             id: "v1",
//             title: "To-analytics Orientation",
//             url: "https://player.vimeo.com/video/1126909883",
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "To-analytics Orientation",
//             url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
//           },
//         ],
//       },
//       {
//         id: "class2",
//         title: "Class 1 — Splunk  SIEM (1 Videos)",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 1",
//             url: "https://player.vimeo.com/video/1127004938",
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "To-analytics Splunk Class 1 Intro",
//             url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
//           },
//           {
//             id: "d2",
//             title: "To-analytics Splunk Class 1 Note",
//             url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
//           },
//         ],
//       },
//       {
//         id: "class3",
//         title: "Class 2 —  Splunk Basics",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 2",
//             url: "https://player.vimeo.com/video/1131114931",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 2",
//             url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
//           },
//           {
//             id: "d4",
//             title: "To-analytics Splunk  Class 2 Note",
//             url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
//           },
//         ],
//       },
//       {
//         id: "class4",
//         title: "Class 3 — Splunk SPL",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 3",
//             url: "https://player.vimeo.com/video/1133357923",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 3",
//             url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//           {
//             id: "d4",
//             title: "To-analytics Splunk Class 3 Note",
//             url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
//           },
//         ],
//       },
//       {
//         id: "class5",
//         title: "Class 4 — SPL Part 2",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 4",
//             url: "https://player.vimeo.com/video/1136469770",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 4",
//             url: "https://drive.google.com/file/d/1XVZBJxSCe_bj-MP93nGyJPKG3qoKjrb_/preview",
//             // url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//         ],
//       },

//       {
//         id: "class6",
//         title: "Class 5  — Splunk SPL  LAB",
//         desc: "Creating reports, dashboards, visualizations, inputs and filters. .",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 5",
//             url: "https://player.vimeo.com/video/1138152119",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Splunk Class 5 Slides",
//             url: "",
//             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
//           },

//           {
//             id: "d3",
//             title: "Splunk Class 5 Note",
//             url: "https://drive.google.com/file/d/1RrF8dEuaUgyKiWhF8lQ4h-WiN9CUb4gE/preview",
//             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
//           },
//         ],
//       },

//       {
//         id: "class8",
//         title: "Class 6  — Splunk Knowledge Objects.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 6",
//             url: "https://player.vimeo.com/video/1140703570",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Splunk Class 6 Slides",
//             url: "https://drive.google.com/file/d/1cXBItLD6OpbOY6aDi5NGQ0-KXJbutCIS/view?usp=sharing",
//           },

//           {
//             id: "d3",
//             title: "Splunk Class 6 Note",
//             url: "https://drive.google.com/file/d/1fVtS0u-mPndEiVbSGm1f2H5Qm_Dx3CzV/preview",
//           },
//         ],
//       },

//       {
//         id: "class7",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 7 Splunk Lab Knowledge Objects",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 7",
//             url: "https://player.vimeo.com/video/1145017764",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "",
//             url: "",
//           },
//         ],
//       },

//       // https://player.vimeo.com/video/1149696096
//       {
//         id: "class8",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 8 Splunk Dashboard ",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 8",
//             url: "https://player.vimeo.com/video/1146557656",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8",
//             url: "https://drive.google.com/file/d/1jBaWruZc2sgrmzuLFWuwtcNMHrOiab8K/preview",
//           },

//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8 Note",
//             url: "https://drive.google.com/file/d/1EvVwiUgfR8Vl1q4MIIUPCmHnFDDKvPg4/preview",
//           },

//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8 Assignment",
//             url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
//           },
//         ],
//       },

//       {
//         id: "class9",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 9 Splunk Dashboard Lab",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 9",
//             url: "https://player.vimeo.com/video/1149696096",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "",
//             url: "",
//           },
//         ],
//       },
//       //

//       {
//         id: "class10",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 10 Certification Exam, Job & Assignment Review",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 10",
//             url: "https://player.vimeo.com/video/1153292493",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "Assignment",
//             url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
//           },
//         ],
//       },

//       {
//         id: "class11",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 11 Onboarding data",
//         // desc: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/view?usp=sharing",
//         videos: [
//           {
//             id: "v2",
//             title: "",
//             url: "https://player.vimeo.com/video/1156881908",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "Onboarding data ",
//             url: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/preview",
//           },
//         ],
//       },

//       {
//         id: "class12",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 12 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 12 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1158631944",
//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 12 Data Onboarding Lab",
//             url: "",
//           },
//         ],
//       },

//       {
//         id: "class13",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 13 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 13 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1161024327",

//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 13 Data Onboarding Lab",
//             url: "https://docs.google.com/presentation/d/16tCZ7QDzXSVXw7RnQFvKxO7mZEH1E87d/preview",
//           },
//         ],
//       },
//     ],
//   },
// ];

// const newCohortLessons = [
//   { id: "oct26-f01", title: "Introduction to Splunk", phase: "Foundations", topic: "What Splunk does, use cases, and core concepts." },
//   { id: "oct26-f02", title: "Splunk Basics & Architecture", phase: "Foundations", topic: "Components, platform architecture, and navigation." },
//   { id: "oct26-f03", title: "Searching & Reporting", phase: "Foundations", topic: "Exploring machine data and creating useful searches." },
//   { id: "oct26-f04", title: "Search Processing Language (SPL)", phase: "Foundations", topic: "Build practical searches using basic SPL commands." },
//   { id: "oct26-f05", title: "Fields & Knowledge Objects", phase: "Foundations", topic: "Working with extracted fields and reusable search knowledge." },
//   { id: "oct26-f06", title: "Dashboards, Visualizations & Alerts", phase: "Foundations", topic: "Turn search results into reports, dashboards, and monitoring alerts." },
//   { id: "oct26-a01", title: "Distributed Splunk Architecture", phase: "Administration", topic: "Understand the components of a distributed Splunk deployment." },
//   { id: "oct26-a02", title: "Data Inputs & Indexing", phase: "Administration", topic: "Understand data collection, indexing, and data management." },
//   { id: "oct26-a03", title: "Forwarding & Data Onboarding", phase: "Administration", topic: "Plan forwarding and onboard data into Splunk." },
//   { id: "oct26-a04", title: "Platform & User Management", phase: "Administration", topic: "Review administration workflows and platform settings." },
//   { id: "oct26-a05", title: "Security & Access Control", phase: "Administration", topic: "Explore users, roles, and secure access." },
//   { id: "oct26-a06", title: "Advanced SPL & Optimization", phase: "Administration", topic: "Improve searches and query performance." },
//   { id: "oct26-a07", title: "Performance Tuning & Troubleshooting", phase: "Administration", topic: "Investigate and maintain platform health." },
//   { id: "oct26-a08", title: "Final Capstone Project", phase: "Administration", topic: "Distributed deployment, forwarding, data onboarding, dashboards, and alerts." },
// ].map((lesson, index) => ({
//   ...lesson,
//   key: lesson.id,
//   progressId: lesson.id,
//   number: index + 1,
//   // Attach official released Vimeo/Drive content here later.
//   videos: lesson.videos || [],
//   docs: lesson.docs || [],
// }));

// const milestones = [
//   { date: "31 Oct 2026", short: "Oct 31", name: "Orientation", category: "Welcome", description: "Meet the program, trainers, expectations and certification goals." },
//   { date: "14 Nov – 19 Dec 2026", short: "Nov 14 – Dec 19", name: "Splunk Foundations", category: "Phase 01", description: "Introduction, searching and reporting, basic SPL, fields and knowledge objects." },
//   { date: "Two-week break", short: "After Foundations", name: "Power User Certification", category: "Exam preparation", description: "Preparation period for the Splunk Core Power User Certification Exam." },
//   { date: "9 Jan – 27 Feb 2027", short: "Jan 9 – Feb 27", name: "Splunk Backend Administration", category: "Phase 02", description: "Distributed architecture, data onboarding, management, performance tuning, and troubleshooting." },
//   { date: "Two-week break", short: "After Administration", name: "Enterprise Admin Certification", category: "Exam preparation", description: "Preparation period for the Splunk Enterprise Certified Admin Exam." },
//   { date: "13 Mar 2027", short: "Mar 13", name: "Interview Preparation", category: "Career readiness", description: "Interview practice and preparation for the next career step." },
// ];

// const deliverables = [
//   "Weekly assignments and hands-on Splunk search tasks",
//   "Dashboards, reports, and alert practice",
//   "Distributed Splunk deployment capstone",
//   "Forwarding and data onboarding exercises",
//   "Certification and interview preparation",
// ];

// // Preserve original ids for the first occurrence of each historical lesson.
// // The supplied old source contains a duplicate "class8" id: make its later
// // occurrence unique so it doesn't accidentally inherit the first one's status.
// // Previous progress for the second duplicate cannot be recovered separately.
// const seenLegacy = new Set();
// const legacyLessons = legacyCourses[0].classes.map((lesson, index) => {
//   const firstOccurrence = !seenLegacy.has(lesson.id);
//   seenLegacy.add(lesson.id);
//   return {
//     ...lesson,
//     key: `old-lesson-${index}`,
//     progressId: firstOccurrence ? lesson.id : `${lesson.id}__session_${index + 1}`,
//     number: index + 1,
//     phase: index <= 9 ? "Splunk Training" : "Splunk Administration",
//     topic: lesson.desc || "Recorded lesson from the previous Splunk training intake.",
//   };
// });

// function normalizeEmail(raw) {
//   if (!raw) return "";
//   try {
//     const parsed = JSON.parse(raw);
//     if (typeof parsed === "string") return parsed.trim().toLowerCase();
//     return String(parsed?.email || "").trim().toLowerCase();
//   } catch {
//     return String(raw).trim().toLowerCase();
//   }
// }

// function getStorageKey(email, cohortId) {
//   const normalized = String(email || "").toLowerCase().trim();
//   return cohortId === LEGACY_COHORT_ID
//     ? `cp_progress_${normalized}`
//     : `cp_progress_${cohortId}_${normalized}`;
// }

// function readStoredProgress(key) {
//   try {
//     const saved = JSON.parse(localStorage.getItem(key) || "{}");
//     return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
//   } catch {
//     return {};
//   }
// }

// function mapBackendProgress(data) {
//   if (!Array.isArray(data)) return {};
//   const mapped = {};
//   data.forEach((p) => {
//     if (!p?.classId) return;
//     mapped[p.classId] = {
//       note: p.note || "",
//       time: Number(p.time) || 0,
//       duration: Number(p.duration) || 0,
//       completed: Boolean(p.completed),
//       videoId: p.videoId || "",
//     };
//   });
//   return mapped;
// }

// function percentFor(record) {
//   if (record?.completed) return 100;
//   if (!record?.duration) return 0;
//   return Math.min(100, Math.round(((record.time || 0) / record.duration) * 100));
// }

// const compact = (...items) => items.filter(Boolean).join(" ");

// function SectionLabel({ children, dark }) {
//   return (
//     <p className={compact("text-[11px] font-extrabold uppercase tracking-[0.19em]", dark ? "text-cyan-300" : "text-blue-700")}>
//       {children}
//     </p>
//   );
// }

// function Ring({ percentage, dark, size = 120 }) {
//   const r = 42;
//   return (
//     <div className="relative shrink-0" style={{ width: size, height: size }}>
//       <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${percentage}% completed`}>
//         <circle cx="50" cy="50" r={r} fill="none" stroke={dark ? "#283852" : "#dfe8f4"} strokeWidth="8" />
//         <circle cx="50" cy="50" r={r} fill="none" stroke="#34b7f1" strokeWidth="8" strokeLinecap="round"
//           strokeDasharray={`${(percentage / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`} />
//       </svg>
//       <div className="absolute inset-0 flex flex-col items-center justify-center">
//         <span className="text-2xl font-black tabular-nums">{percentage}%</span>
//         <span className={compact("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>complete</span>
//       </div>
//     </div>
//   );
// }

// function StatCard({ icon: Icon, value, label, dark }) {
//   return (
//     <div className={compact("rounded-2xl border p-5", dark ? "border-white/10 bg-[#111f34]" : "border-slate-200 bg-white")}>
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <p className={compact("text-xs font-semibold", dark ? "text-slate-400" : "text-slate-500")}>{label}</p>
//           <p className="mt-2 text-3xl font-black tracking-tight tabular-nums">{value}</p>
//         </div>
//         <span className={compact("flex h-11 w-11 items-center justify-center rounded-xl text-lg", dark ? "bg-[#1d3857] text-cyan-300" : "bg-blue-50 text-blue-700")}>
//           <Icon />
//         </span>
//       </div>
//     </div>
//   );
// }

// function EmptyMedia({ title, description, dark }) {
//   return (
//     <div className={compact("rounded-2xl border border-dashed px-6 py-10 text-center", dark ? "border-white/15 bg-white/[0.025]" : "border-slate-300 bg-slate-50/70")}>
//       <div className={compact("mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-xl", dark ? "bg-white/10 text-cyan-300" : "bg-blue-100 text-blue-700")}>
//         <FaVideo />
//       </div>
//       <h3 className="mt-4 font-extrabold">{title}</h3>
//       <p className={compact("mx-auto mt-2 max-w-sm text-sm leading-6", dark ? "text-slate-400" : "text-slate-500")}>{description}</p>
//     </div>
//   );
// }

// function AccessPage({ loading, email }) {
//   return (
//     <main className="flex min-h-[85vh] items-center justify-center bg-[#071426] px-6 py-16 text-white">
//       <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f243b] p-9 text-center shadow-2xl">
//         <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl text-sky-300">
//           {loading ? <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/20 border-t-sky-300" /> : <FaLock />}
//         </span>
//         <h1 className="mt-6 text-2xl font-black">{loading ? "Verifying student access" : "Learning portal access required"}</h1>
//         <p className="mt-3 text-sm leading-7 text-slate-300">
//           {loading
//             ? "Checking your student enrollment and assigned training cohort."
//             : "Sign in with your enrolled student account. If you believe you should have access, contact the T.O Analytics team."}
//         </p>
//         {!loading && (
//           <>
//             {email && <p className="mt-4 break-all rounded-xl bg-white/5 p-3 text-xs text-slate-300">{email}</p>}
//             <a href={SUPPORT_URL} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-extrabold text-slate-950">
//               Contact support <FaArrowRight />
//             </a>
//             <div className="mt-4"><NavLink to="/" className="text-xs text-slate-400 underline underline-offset-4">Return to website</NavLink></div>
//           </>
//         )}
//       </div>
//     </main>
//   );
// }

// const MENU = [
//   { id: "overview", label: "Overview", icon: FaChartLine },
//   { id: "lessons", label: "My classes", icon: FaBookOpen },
//   { id: "roadmap", label: "Learning roadmap", icon: FaLayerGroup },
//   { id: "resources", label: "Resources", icon: FaFileLines },
// ];

// export default function CoursePortal() {
//   const [auth, setAuth] = useState({ loading: true, allowed: false, email: "", cohortId: null });
//   const [view, setView] = useState("overview");
//   const [dark, setDark] = useState(false);
//   const [search, setSearch] = useState("");
//   const [selectedLessonKey, setSelectedLessonKey] = useState(null);
//   const [selectedVideoId, setSelectedVideoId] = useState(null);
//   const [progress, setProgress] = useState({});
//   const [toastDismissed, setToastDismissed] = useState(false);
//   const [thumbnails, setThumbnails] = useState({});
//   const [mutedHint, setMutedHint] = useState(false);
//   const playerMountRef = useRef(null);
//   const playerRef = useRef(null);
//   const progressRef = useRef({});

//   const isLegacy = auth.cohortId === LEGACY_COHORT_ID;
//   const lessons = isLegacy ? legacyLessons : newCohortLessons;
//   const storageKey = auth.cohortId ? getStorageKey(auth.email, auth.cohortId) : null;
//   const selectedLesson = lessons.find((lesson) => lesson.key === selectedLessonKey) || lessons[0];
//   const validVideos = (selectedLesson?.videos || []).filter((v) => Boolean(v?.url?.trim()));
//   const validDocs = (selectedLesson?.docs || []).filter((doc) => Boolean(doc?.url?.trim() && doc?.title?.trim()));
//   const activeVideo = validVideos.find((v) => v.id === selectedVideoId);

//   const completed = lessons.filter((lesson) => progress[lesson.progressId]?.completed).length;
//   const progressPercent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
//   const allDocs = lessons.flatMap((lesson) =>
//     (lesson.docs || [])
//       .filter((doc) => doc?.url?.trim() && doc?.title?.trim())
//       .map((doc, i) => ({ ...doc, key: `${lesson.key}-doc-${i}`, lessonTitle: lesson.title, lessonKey: lesson.key }))
//   );
//   const totalVideos = lessons.reduce((sum, lesson) => sum + (lesson.videos || []).filter((v) => v?.url?.trim()).length, 0);
//   const hasAssignments = allDocs.some((doc) => /assignment/i.test(doc.title));
//   const filteredLessons = useMemo(() => lessons.filter((lesson) =>
//     `${lesson.title} ${lesson.topic} ${lesson.phase}`.toLowerCase().includes(search.trim().toLowerCase())), [lessons, search]);

//   const skin = dark ? {
//     shell: "bg-[#071426] text-slate-50",
//     panel: "border-white/10 bg-[#102037]",
//     soft: "border-white/10 bg-[#14283f]",
//     muted: "text-slate-400",
//     line: "border-white/10",
//     input: "border-white/10 bg-[#091a2d] text-slate-100 placeholder:text-slate-500",
//     hover: "hover:bg-white/[0.065]",
//     action: "bg-slate-50 text-slate-950 hover:bg-sky-100",
//   } : {
//     shell: "bg-[#f4f7fb] text-slate-900",
//     panel: "border-slate-200 bg-white",
//     soft: "border-slate-200 bg-[#f7faff]",
//     muted: "text-slate-500",
//     line: "border-slate-200",
//     input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
//     hover: "hover:bg-blue-50",
//     action: "bg-slate-900 text-white hover:bg-slate-800",
//   };

//   // Enrollment/cohort assignment is controlled by the verified backend response.
//   // Missing cohortId is treated as LEGACY solely for backward compatibility.
//   useEffect(() => {
//     let live = true;
//     const email = normalizeEmail(localStorage.getItem("user") || "");
//     if (!email) {
//       setAuth({ loading: false, allowed: false, email: "", cohortId: null });
//       return;
//     }
//     setAuth({ loading: true, allowed: false, email, cohortId: null });
//     const verify = async () => {
//       try {
//         const res = await fetch("/api/check-student-access", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, courseId: "splunk" }),
//         });
//         const data = await res.json();
//         if (!res.ok || data?.allowed !== true) throw new Error(data?.error || "Access not granted");
//         const cohortId = data.cohortId ?? LEGACY_COHORT_ID;
//         // Unknown assignments are rejected rather than showing the wrong student content.
//         if (![LEGACY_COHORT_ID, NEW_COHORT_ID].includes(cohortId)) {
//           throw new Error(`Unknown assigned cohort: ${cohortId}`);
//         }
//         if (live) setAuth({ loading: false, allowed: true, email, cohortId });
//       } catch (error) {
//         console.error("Student access check failed", error);
//         if (live) setAuth({ loading: false, allowed: false, email, cohortId: null });
//       }
//     };
//     verify();
//     return () => { live = false; };
//   }, []);

//   // Historical backend progress remains readable, while the October 2026
//   // cohort starts fresh and isolated until a cohort-aware backend is built.
//   useEffect(() => {
//     if (!auth.allowed || !storageKey) return;
//     let live = true;
//     const local = readStoredProgress(storageKey);
//     progressRef.current = local;
//     setProgress(local);
//     setSelectedLessonKey((isLegacy ? legacyLessons : newCohortLessons)[0]?.key || null);
//     setSelectedVideoId(null);

//     if (isLegacy && import.meta.env.VITE_API_BASE) {
//       (async () => {
//         try {
//           const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/progress/${encodeURIComponent(auth.email)}`);
//           if (!res.ok) throw new Error("Failed to fetch old student progress");
//           const remote = mapBackendProgress(await res.json());
//           if (!live) return;
//           // Locally saved changes take precedence because existing write
//           // handlers never posted updates to the old backend.
//           const merged = { ...remote, ...progressRef.current };
//           progressRef.current = merged;
//           setProgress(merged);
//           localStorage.setItem(storageKey, JSON.stringify(merged));
//         } catch (error) {
//           console.warn("Historical backend progress unavailable; local data kept", error);
//         }
//       })();
//     }
//     return () => { live = false; };
//   }, [auth.allowed, auth.email, auth.cohortId, storageKey, isLegacy]);

//   function persistLessonPatch(progressId, patch) {
//     if (!auth.allowed || !storageKey || !progressId) return;
//     const next = {
//       ...progressRef.current,
//       [progressId]: { ...(progressRef.current[progressId] || {}), ...patch },
//     };
//     progressRef.current = next;
//     localStorage.setItem(storageKey, JSON.stringify(next));
//     setProgress(next);
//   }

//   function openLesson(lesson) {
//     setSelectedLessonKey(lesson.key);
//     const savedVideoId = progressRef.current[lesson.progressId]?.videoId;
//     const videos = (lesson.videos || []).filter((v) => v?.url?.trim());
//     const bestVideo = videos.find((v) => v.id === savedVideoId) || videos[0];
//     setSelectedVideoId(bestVideo?.id || null);
//     setMutedHint(false);
//     setView("lessons");
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   function resetProgress() {
//     if (!storageKey || !window.confirm("Reset your saved progress and notes for THIS cohort on THIS device?")) return;
//     localStorage.removeItem(storageKey);
//     progressRef.current = {};
//     setProgress({});
//     setSelectedVideoId(null);
//   }

//   // Vimeo player, playback resume, timed progress, and 90% auto-completion.
//   useEffect(() => {
//     if (!auth.allowed || view !== "lessons" || !activeVideo?.url || !playerMountRef.current || !selectedLesson) return;
//     const mount = playerMountRef.current;
//     const iframe = document.createElement("iframe");
//     iframe.src = `${activeVideo.url.trim()}${activeVideo.url.includes("?") ? "&" : "?"}transparent=0&autoplay=0`;
//     iframe.allow = "autoplay; fullscreen; picture-in-picture";
//     iframe.setAttribute("allowfullscreen", "");
//     iframe.setAttribute("title", activeVideo.title || "Splunk lesson video");
//     iframe.className = "absolute inset-0 h-full w-full";
//     mount.replaceChildren(iframe);

//     const player = new Player(iframe);
//     playerRef.current = player;
//     const key = selectedLesson.progressId;
//     let lastWrite = 0;
//     let destroyed = false;
//     const saved = progressRef.current[key];
//     player.ready().then(async () => {
//       if (destroyed) return;
//       if (saved?.videoId === activeVideo.id && saved.time > 0 && !saved.completed) {
//         await player.setCurrentTime(saved.time).catch(() => {});
//       }
//       await player.setVolume(1).catch(() => { if (!destroyed) setMutedHint(true); });
//     }).catch(() => {});

//     const onTime = ({ seconds = 0, duration = 0 }) => {
//       const now = Date.now();
//       if (now - lastWrite < 3000 && !(duration > 0 && seconds / duration >= 0.9)) return;
//       lastWrite = now;
//       const current = progressRef.current[key] || {};
//       persistLessonPatch(key, {
//         videoId: activeVideo.id,
//         time: seconds,
//         duration,
//         completed: current.completed || (duration > 0 && seconds / duration >= 0.9),
//       });
//     };
//     const onEnd = () => persistLessonPatch(key, { videoId: activeVideo.id, completed: true });
//     player.on("timeupdate", onTime);
//     player.on("ended", onEnd);
//     return () => {
//       destroyed = true;
//       player.off("timeupdate", onTime);
//       player.off("ended", onEnd);
//       player.destroy().catch(() => {});
//       if (playerRef.current === player) playerRef.current = null;
//       mount.replaceChildren();
//     };
//     // Stable selected class key and URL are intentional player boundaries.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [auth.allowed, auth.cohortId, view, selectedLesson?.key, activeVideo?.url, activeVideo?.id]);

//   // Preserve video preview thumbnails from the old portal (with a fallback).
//   useEffect(() => {
//     if (view !== "lessons") return;
//     let live = true;
//     const videos = validVideos;
//     Promise.all(videos.map(async (video) => {
//       if (video.thumbnail) return [video.url, video.thumbnail];
//       try {
//         const url = video.url.replace("player.vimeo.com/video/", "vimeo.com/");
//         const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
//         if (!response.ok) throw new Error("No thumbnail");
//         const payload = await response.json();
//         return [video.url, payload.thumbnail_url || null];
//       } catch {
//         return [video.url, null];
//       }
//     })).then((entries) => { if (live) setThumbnails((previous) => ({ ...previous, ...Object.fromEntries(entries) })); });
//     return () => { live = false; };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [view, selectedLesson?.key]);

//   if (auth.loading || !auth.allowed) return <AccessPage loading={auth.loading} email={auth.email} />;

//   const title = isLegacy ? "Previous Splunk Training" : "Splunk Professional Bootcamp";
//   const cohortLabel = isLegacy ? "Previous intake" : "October 2026 intake";
//   const featured = lessons.find((lesson) => !progress[lesson.progressId]?.completed) || lessons[0];
//   const cardStyle = compact("rounded-[24px] border shadow-sm", skin.panel);

//   return (
//     <main className={compact("min-h-screen transition-colors duration-200", skin.shell)}>
//       {/* A small utility banner; old cohort popup is deliberately not shared with the new intake. */}
//       {isLegacy && <SplunkKnowledgePopup />}
//       {hasAssignments && !toastDismissed && (
//         <div className="fixed bottom-6 right-5 z-50 flex max-w-sm items-start gap-4 rounded-2xl border border-sky-700/10 bg-slate-950 px-5 py-4 text-white shadow-2xl">
//           <FaFileLines className="mt-1 shrink-0 text-sky-300" />
//           <div><p className="font-extrabold">Assignment resources available</p><p className="mt-1 text-xs leading-5 text-slate-300">View assignment documents in Resources.</p></div>
//           <button onClick={() => setToastDismissed(true)} aria-label="Dismiss" className="p-1 text-slate-400 hover:text-white"><FaXmark /></button>
//         </div>
//       )}

//       <header className={compact("border-b", skin.line, dark ? "bg-[#0a192c]" : "bg-white")}>
//         <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
//           <div className="flex min-w-0 items-center gap-3">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black tracking-tight text-white">T.O</div>
//             <div className="min-w-0"><p className="truncate text-[15px] font-black tracking-tight">T.O Analytics</p><p className={compact("text-[11px] font-semibold", skin.muted)}>Student learning campus</p></div>
//             <span className={compact("ml-3 hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex", dark ? "bg-blue-400/10 text-sky-200" : "bg-blue-50 text-blue-700")}>{cohortLabel}</span>
//           </div>
//           <div className="flex items-center gap-2 sm:gap-3">
//             <span className={compact("hidden max-w-[230px] truncate text-xs font-semibold md:block", skin.muted)} title={auth.email}>{auth.email}</span>
//             <button type="button" onClick={() => setDark((value) => !value)}
//               className={compact("flex h-10 w-10 items-center justify-center rounded-xl border", skin.line, skin.hover)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
//               {dark ? <FaSun /> : <FaMoon />}
//             </button>
//             <NavLink to="/" className={compact("rounded-xl border px-3 py-2.5 text-xs font-extrabold", skin.line, skin.hover)}>Website <span className="hidden sm:inline">↗</span></NavLink>
//           </div>
//         </div>
//       </header>

//       <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:px-10 lg:py-9">
//         <aside className="min-w-0">
//           <div className={compact("rounded-[24px] border p-4 lg:sticky lg:top-6", skin.panel)}>
//             <div className={compact("mb-5 rounded-2xl p-4", dark ? "bg-[#1a3554]" : "bg-[#edf5ff]")}>
//               <div className="flex items-center gap-2 text-sky-600"><FaGraduationCap /><span className="text-[11px] font-extrabold uppercase tracking-wider">Learning space</span></div>
//               <h2 className="mt-2 text-base font-black leading-snug">{isLegacy ? "Your previous classes" : "Your learning journey"}</h2>
//               <p className={compact("mt-2 text-xs leading-5", skin.muted)}>{isLegacy ? "Archived course library" : "14 planned training sessions"}</p>
//             </div>
//             <p className={compact("mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em]", skin.muted)}>Workspace</p>
//             <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Student navigation">
//               {MENU.map(({ id, label, icon: Icon }) => (
//                 <button key={id} type="button" onClick={() => { setView(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
//                   className={compact("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm", view === id ? "bg-[#0a62d2] text-white shadow-md shadow-blue-800/10" : skin.hover, view !== id && skin.muted)}>
//                   <Icon className="shrink-0" /> <span>{label}</span>
//                   {view === id && <FaArrowRight className="ml-auto hidden text-[10px] lg:block" />}
//                 </button>
//               ))}
//             </nav>
//             <div className={compact("mt-5 border-t pt-5", skin.line)}>
//               <div className="flex items-center justify-between"><span className="text-xs font-bold">Your progress</span><span className="text-xs font-black text-[#298fd3]">{progressPercent}%</span></div>
//               <div className={compact("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}><div className="h-full rounded-full bg-[#1688dc] transition-all" style={{ width: `${progressPercent}%` }} /></div>
//               <p className={compact("mt-2 text-[11px]", skin.muted)}>{completed} of {lessons.length} lessons completed</p>
//             </div>
//             <div className={compact("mt-5 border-t pt-5", skin.line)}>
//               <a href={SUPPORT_URL} className={compact("block rounded-xl border px-3 py-3 text-center text-xs font-bold", skin.line, skin.hover)}>Need help? Contact support</a>
//             </div>
//           </div>
//         </aside>

//         <div className="min-w-0 space-y-6">
//           {view === "overview" && (
//             <>
//               <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
//                 <div className="pointer-events-none absolute -right-14 -top-28 h-[310px] w-[310px] rounded-full border-[52px] border-white/[0.045]" />
//                 <div className="pointer-events-none absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
//                 <div className="relative z-10 max-w-3xl">
//                   <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-sky-100"><FaGraduationCap /> {cohortLabel}</span>
//                   <h1 className="mt-6 max-w-2xl text-3xl font-black leading-[1.13] tracking-tight sm:text-4xl lg:text-[42px]">{isLegacy ? "Welcome back to your learning space." : "Build your Splunk career, one skill at a time."}</h1>
//                   <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">{isLegacy ? "All your existing recordings, lesson materials, notes and progress are still here." : "Learn the fundamentals, explore administration, prepare for certifications and complete a hands-on capstone project."}</p>
//                   <div className="mt-7 flex flex-wrap gap-3">
//                     <button onClick={() => openLesson(featured)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#083269] transition hover:bg-blue-50">{completed ? "Continue learning" : "Explore classes"} <FaArrowRight /></button>
//                     <button onClick={() => setView("roadmap")} className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">View roadmap</button>
//                   </div>
//                 </div>
//               </section>

//               <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning statistics">
//                 <StatCard icon={FaLayerGroup} value={lessons.length} label={isLegacy ? "Archived lessons" : "Planned sessions"} dark={dark} />
//                 <StatCard icon={FaVideo} value={totalVideos} label="Available videos" dark={dark} />
//                 <StatCard icon={FaCheck} value={completed} label="Completed lessons" dark={dark} />
//                 <StatCard icon={FaFileLines} value={allDocs.length} label="Available documents" dark={dark} />
//               </section>

//               <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
//                 <section className={compact(cardStyle, "p-6 sm:p-7")}>
//                   <SectionLabel dark={dark}>Your next step</SectionLabel>
//                   <h2 className="mt-3 text-xl font-black tracking-tight">{featured.title}</h2>
//                   <p className={compact("mt-3 text-sm leading-6", skin.muted)}>{featured.topic}</p>
//                   <div className={compact("mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4", skin.soft)}>
//                     <div><p className="text-xs font-extrabold">Lesson {featured.number} of {lessons.length}</p><p className={compact("mt-1 text-xs", skin.muted)}>{(featured.videos || []).some(v => v?.url) ? "Recording available" : "Materials not published yet"}</p></div>
//                     <button onClick={() => openLesson(featured)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700">Open lesson <FaArrowRight /></button>
//                   </div>
//                   <div className="mt-7 flex items-center justify-between"><h3 className="text-base font-black">Learning path</h3><button onClick={() => setView("lessons")} className="text-xs font-bold text-blue-500 hover:underline">All classes →</button></div>
//                   <div className="mt-4 space-y-3">
//                     {(isLegacy ? [
//                       { name: "Your archived recordings", detail: "Revisit lessons and training materials", count: lessons.length },
//                       { name: "Review and practice", detail: "Take notes and track your own progress", count: allDocs.length },
//                     ] : [
//                       { name: "Splunk Foundations", detail: "14 Nov – 19 Dec 2026", count: 6 },
//                       { name: "Splunk Backend Administration", detail: "9 Jan – 27 Feb 2027", count: 8 },
//                     ]).map((step, i) => (
//                       <div key={step.name} className={compact("flex items-center gap-4 rounded-2xl border p-4", skin.soft)}>
//                         <span className={compact("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black", i ? "bg-sky-500/10 text-sky-500" : "bg-blue-600 text-white")}>{String(i + 1).padStart(2, "0")}</span>
//                         <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{step.name}</p><p className={compact("mt-1 text-xs", skin.muted)}>{step.detail}</p></div>
//                         <span className={compact("shrink-0 text-xs font-bold", skin.muted)}>{step.count} {isLegacy ? "items" : "sessions"}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </section>
//                 <section className={compact(cardStyle, "flex flex-col p-6 sm:p-7")}>
//                   <SectionLabel dark={dark}>Progress summary</SectionLabel>
//                   <div className="mt-5 flex justify-center"><Ring percentage={progressPercent} dark={dark} size={155} /></div>
//                   <p className={compact("mt-5 text-center text-sm leading-6", skin.muted)}>Track every lesson from your dedicated learning dashboard.</p>
//                   <div className={compact("mt-5 grid grid-cols-2 gap-3 border-t pt-5", skin.line)}><div><p className="text-2xl font-black">{completed}</p><p className={compact("text-xs", skin.muted)}>Completed</p></div><div><p className="text-2xl font-black">{lessons.length - completed}</p><p className={compact("text-xs", skin.muted)}>Remaining</p></div></div>
//                   <button onClick={() => setView("roadmap")} className={compact("mt-auto pt-5 text-left text-xs font-extrabold", dark ? "text-sky-300" : "text-blue-700")}>Explore training milestones →</button>
//                 </section>
//               </div>
//               {!isLegacy && (
//                 <section className={compact(cardStyle, "p-6 sm:p-7")}>
//                   <div className="flex flex-wrap items-center justify-between gap-3"><div><SectionLabel dark={dark}>Training schedule</SectionLabel><h2 className="mt-2 text-xl font-black">Important program dates</h2></div><button onClick={() => setView("roadmap")} className="text-xs font-bold text-blue-500">Full schedule →</button></div>
//                   <div className="mt-5 grid gap-3 md:grid-cols-3">{[milestones[0], milestones[1], milestones[3]].map((milestone) => <div key={milestone.name} className={compact("rounded-2xl border p-4", skin.soft)}><p className="text-xs font-extrabold text-blue-500">{milestone.short}</p><h3 className="mt-2 text-sm font-black">{milestone.name}</h3><p className={compact("mt-2 text-xs leading-5", skin.muted)}>{milestone.category}</p></div>)}</div>
//                 </section>
//               )}
//               {!isLegacy && (
//                 <section className={compact(cardStyle, "p-6 sm:p-7")}>
//                   <SectionLabel dark={dark}>Orientation details</SectionLabel>
//                   <h2 className="mt-2 text-xl font-black">About your enrollment</h2>
//                   <div className="mt-5 grid gap-3 md:grid-cols-3">
//                     <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Program tuition</p><p className="mt-2 text-2xl font-black">$3,500</p><p className={compact("mt-1 text-xs", skin.muted)}>Published course fee</p></div>
//                     <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Payment method</p><p className="mt-2 text-lg font-black">Zelle</p><p className="mt-1 break-all text-xs text-blue-500">{SUPPORT_EMAIL}</p></div>
//                     <div className={compact("rounded-2xl border p-4", skin.soft)}><p className={compact("text-xs font-semibold", skin.muted)}>Certification focus</p><p className="mt-2 text-sm font-black leading-6">Core Power User<br />Enterprise Certified Admin</p></div>
//                   </div>
//                 </section>
//               )}
//             </>
//           )}

//           {view === "lessons" && (
//             <>
//               <div className="flex flex-wrap items-end justify-between gap-4"><div><SectionLabel dark={dark}>Course library</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">My classes</h1><p className={compact("mt-2 text-sm", skin.muted)}>Videos, resources, progress tracking and personal notes in one place.</p></div><span className={compact("rounded-full border px-4 py-2 text-xs font-extrabold", skin.line)}>{lessons.length} classes</span></div>
//               <div className="grid gap-5 xl:grid-cols-[minmax(245px,0.85fr)_minmax(0,1.6fr)]">
//                 <section className={compact(cardStyle, "self-start p-4")}>
//                   <label className={compact("flex items-center gap-3 rounded-xl border px-3 py-3", skin.input)}>
//                     <FaMagnifyingGlass className={skin.muted} />
//                     <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your classes..." aria-label="Search classes" className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:font-medium" />
//                   </label>
//                   <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
//                     {filteredLessons.map((lesson) => {
//                       const selected = lesson.key === selectedLesson.key;
//                       const itemProgress = progress[lesson.progressId];
//                       const mediaReady = (lesson.videos || []).some((v) => v?.url?.trim());
//                       return <button key={lesson.key} onClick={() => openLesson(lesson)} className={compact("w-full rounded-xl border p-3.5 text-left transition", selected ? dark ? "border-blue-400/40 bg-[#1c3b60]" : "border-blue-300 bg-blue-50" : compact(skin.line, skin.hover))}>
//                         <div className="flex items-start gap-3"><span className={compact("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black", itemProgress?.completed ? "bg-emerald-500/15 text-emerald-500" : selected ? "bg-blue-600 text-white" : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600")}>{itemProgress?.completed ? <FaCheck /> : String(lesson.number).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold leading-5">{lesson.title}</h3><p className={compact("mt-1.5 text-[11px]", skin.muted)}>{mediaReady ? "Video available" : "Awaiting lesson recording"}</p><div className={compact("mt-3 h-1.5 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-200")}><div className="h-full rounded-full bg-blue-500" style={{ width: `${percentFor(itemProgress)}%` }} /></div></div></div>
//                       </button>;
//                     })}
//                     {!filteredLessons.length && <p className={compact("px-3 py-6 text-center text-sm", skin.muted)}>No classes match your search.</p>}
//                   </div>
//                 </section>

//                 <section className="min-w-0 space-y-5">
//                   <div className={compact(cardStyle, "p-5 sm:p-6")}>
//                     <div className="flex flex-wrap items-center gap-2"><SectionLabel dark={dark}>Lesson {selectedLesson.number}</SectionLabel><span className={compact("rounded-full px-2.5 py-1 text-[10px] font-black", dark ? "bg-sky-400/10 text-sky-300" : "bg-blue-50 text-blue-700")}>{selectedLesson.phase}</span></div>
//                     <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{selectedLesson.title}</h2>
//                     <p className={compact("mt-3 text-sm leading-6", skin.muted)}>{selectedLesson.topic}</p>
//                     <div className={compact("mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4", skin.line)}><span className={compact("text-xs font-semibold", skin.muted)}>{progress[selectedLesson.progressId]?.completed ? "✓ Completed" : "Not completed yet"}</span><button onClick={() => persistLessonPatch(selectedLesson.progressId, { completed: !progress[selectedLesson.progressId]?.completed })} className={compact("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition", progress[selectedLesson.progressId]?.completed ? dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700")}><FaCheck /> {progress[selectedLesson.progressId]?.completed ? "Mark as incomplete" : "Mark completed"}</button></div>
//                   </div>
//                   <div className={compact(cardStyle, "overflow-hidden p-4 sm:p-5")}>
//                     <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-black">Lesson recording</h3><span className={compact("text-xs font-semibold", skin.muted)}>{validVideos.length} videos</span></div>
//                     {validVideos.length ? (
//                       <>
//                         <div className="grid gap-2 sm:grid-cols-2">{validVideos.map((video, index) => <button key={`${video.id}-${index}`} onClick={() => setSelectedVideoId(video.id)} className={compact("overflow-hidden rounded-xl border text-left", selectedVideoId === video.id ? dark ? "border-blue-400 bg-[#203e5f]" : "border-blue-400 bg-blue-50" : skin.line)}><div className="relative flex h-24 items-center justify-center overflow-hidden bg-[#0d2c55] text-3xl text-white"><FaCirclePlay className="relative z-10" />{thumbnails[video.url] && <img src={thumbnails[video.url]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}</div><p className="p-3 text-xs font-extrabold leading-5">{video.title || `Recording ${index + 1}`}</p></button>)}</div>
//                         <div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-black">{activeVideo ? <div ref={playerMountRef} className="absolute inset-0" /> : <div className="flex h-full items-center justify-center text-sm text-white/60">Select a recording</div>}</div>
//                         {mutedHint && <p className="mt-2 text-xs text-amber-500">Your browser may require you to enable video sound manually.</p>}
//                         <p className={compact("mt-3 text-xs", skin.muted)}>Video position is remembered on this device. A lesson is automatically completed after 90% watched.</p>
//                       </>
//                     ) : <EmptyMedia title="Recording coming soon" description="The lesson is planned for this intake. Your trainer will add the recording when it is published." dark={dark} />}
//                   </div>
//                   <div className={compact(cardStyle, "p-5 sm:p-6")}><div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-base font-black"><FaFileLines className="text-blue-500" /> Class materials</h3><span className={compact("text-xs", skin.muted)}>{validDocs.length} files</span></div>{validDocs.length ? <div className="space-y-2">{validDocs.map((doc, index) => <a key={`${selectedLesson.key}-${index}`} href={doc.url.trim()} target="_blank" rel="noreferrer" className={compact("flex items-center justify-between gap-3 rounded-xl border p-3 text-xs font-bold", skin.line, skin.hover)}><span className="min-w-0 truncate">{doc.title}</span><FaDownload className="shrink-0 text-blue-500" /></a>)}</div> : <p className={compact("text-sm leading-6", skin.muted)}>No documents published for this lesson yet.</p>}</div>
//                   <div className={compact(cardStyle, "p-5 sm:p-6")}><h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-blue-500" /> Personal lesson notes</h3><p className={compact("mt-2 text-xs", skin.muted)}>Notes are private to this account and stored in this browser.</p><textarea value={progress[selectedLesson.progressId]?.note || ""} onChange={(event) => persistLessonPatch(selectedLesson.progressId, { note: event.target.value })} placeholder="Write down concepts, SPL commands, questions, or practice ideas..." className={compact("mt-4 h-40 w-full resize-y rounded-xl border p-4 text-sm leading-6 outline-none focus:border-blue-400", skin.input)} /><p className={compact("mt-2 text-right text-[11px]", skin.muted)}>Autosaved on this device</p></div>
//                 </section>
//               </div>
//             </>
//           )}

//           {view === "roadmap" && (
//             <>
//               <div><SectionLabel dark={dark}>Your program</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">Training roadmap</h1><p className={compact("mt-2 max-w-2xl text-sm leading-7", skin.muted)}>{isLegacy ? "Review your course lessons and available learning materials." : "A structured path from first-time Splunk user to practical administration and certification preparation."}</p></div>
//               {!isLegacy ? (
//                 <>
//                   <div className={compact(cardStyle, "p-6 sm:p-8")}><h2 className="text-xl font-black">Program milestones</h2><div className="mt-7 space-y-0">{milestones.map((item, index) => <div key={item.name} className="flex gap-4 sm:gap-5"><div className="flex flex-col items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c66d2] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>{index !== milestones.length - 1 && <span className={compact("my-1 w-px flex-1", dark ? "bg-white/15" : "bg-slate-200")} />}</div><div className={compact("min-w-0 flex-1 pb-8", index === milestones.length - 1 && "pb-0")}><p className="text-xs font-bold text-blue-500">{item.date}</p><h3 className="mt-1 text-base font-black">{item.name}</h3><p className={compact("mt-1 text-xs font-semibold", skin.muted)}>{item.category}</p><p className={compact("mt-3 text-sm leading-6", skin.muted)}>{item.description}</p></div></div>)}</div></div>
//                   <div className={compact(cardStyle, "p-6 sm:p-8")}><h2 className="text-xl font-black">What you'll work on</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{deliverables.map((item) => <div key={item} className={compact("flex gap-3 rounded-xl border p-4", skin.soft)}><FaCheck className="mt-1 shrink-0 text-emerald-500" /><span className="text-sm font-semibold leading-6">{item}</span></div>)}</div></div>
//                 </>
//               ) : (
//                 <div className={compact(cardStyle, "p-6")}><h2 className="text-xl font-black">Your recorded syllabus</h2><div className="mt-5 space-y-3">{lessons.map((lesson) => <button key={lesson.key} onClick={() => openLesson(lesson)} className={compact("flex w-full items-center gap-3 rounded-xl border p-4 text-left", skin.soft, skin.hover)}><span className="font-black text-blue-500">{String(lesson.number).padStart(2, "0")}</span><span className="flex-1 text-sm font-bold">{lesson.title}</span><FaArrowRight className="text-blue-500" /></button>)}</div></div>
//               )}
//             </>
//           )}

//           {view === "resources" && (
//             <>
//               <div><SectionLabel dark={dark}>Learning materials</SectionLabel><h1 className="mt-2 text-3xl font-black tracking-tight">Resource library</h1><p className={compact("mt-2 text-sm", skin.muted)}>Access the documents and assignments published for your own cohort.</p></div>
//               <div className={compact(cardStyle, "p-6 sm:p-7")}>
//                 {allDocs.length ? <div className="space-y-3">{allDocs.map((doc) => <div key={doc.key} className={compact("flex flex-wrap items-center gap-4 rounded-xl border p-4", skin.soft)}><span className={compact("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", dark ? "bg-white/10 text-sky-300" : "bg-blue-100 text-blue-700")}><FaFileLines /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold">{doc.title}</h3><p className={compact("mt-1 text-xs", skin.muted)}>{doc.lessonTitle}</p></div><a href={doc.url.trim()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700">Open <FaArrowRight /></a></div>)}</div> : <EmptyMedia title="Resources will appear here" description="Once your trainer uploads lesson slides, worksheets and assignments, the documents will be listed in this library." dark={dark} />}
//               </div>
//             </>
//           )}

//           <footer className={compact("flex flex-wrap items-center justify-between gap-4 border-t py-5 text-xs", skin.line, skin.muted)}>
//             <div><strong className={dark ? "text-white" : "text-slate-800"}>T.O Analytics LLC</strong><span className="mx-2">·</span>{title}</div>
//             <div className="flex flex-wrap items-center gap-4"><span>Saved on this device</span><a href={SUPPORT_URL} className="hover:text-blue-500">Support</a><button onClick={resetProgress} className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600"><FaRotateRight /> Reset my progress</button></div>
//           </footer>
//         </div>
//       </div>
//     </main>
//   );
// }
// // END ...............................................
// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import Player from "@vimeo/player";
// // import { NavLink } from "react-router-dom";
// // import {
// //   FaArrowRight,
// //   FaBookOpen,
// //   FaChartLine,
// //   FaCheck,
// //   FaCirclePlay,
// //   FaClock,
// //   FaDownload,
// //   FaFileLines,
// //   FaGraduationCap,
// //   FaLayerGroup,
// //   FaLock,
// //   FaMagnifyingGlass,
// //   FaMoon,
// //   FaNoteSticky,
// //   FaRotateRight,
// //   FaShieldHalved,
// //   FaSun,
// //   FaVideo,
// //   FaXmark,
// // } from "react-icons/fa6";

// // import SplunkKnowledgePopup from "./SplunkKnowledgePopup";

// // const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

// // /*
// //   KEEP YOUR EXISTING:
// //   const allowedEmails = [...]
// //   const sampleCourses = [...]
// // */
// // // const allowedEmails = [
// // //   "sammmyayo@gmail.com",
// // //   "Sammmyayo@gmail.com",
// // //   "kewizle.k@gmail.com",
// // //   "kewizlek@gmail.com",
// // //   "pamelaabina24@gmail.com",
// // //   "Pamelaabina24@gmail.com",
// // //   "basseyvera018@gmail.com",
// // //   "Kewizle.k@gmail.com",
// // //   "Davidayeni63@gmail.com",
// // //   "Adesh25416@gmail.com",
// // //   "davidayeni63@gmail.com",
// // //   "adesh25416@gmail.com",
// // //   "codeverseprogramming23@gmail.com",
// // //   "ooolajuyigbe@gmail.com",
// // //   "fadeleolutola@gmail.com",
// // //   "jahdek76@gmail.com",
// // //   "samuelsamuelmayowa@gmail.com",
// // //   "adenusitimi@gmail.com",
// // //   "oluwaferanmiolulana@gmail.com",
// // //   "oluwaferanmi.olulana@gmail.com",
// // //   "tomideolulana@gmail.com",
// // //   "randommayowa@gmail.com",
// // //   "yinkalola51@gmail.com",
// // //   "toanalyticsllc@gmail.com",
// // //   "kevwe_oberiko@yahoo.com",
// // //   "denisgsam@gmail.com",
// // //   "fpasamuelmayowa51@gmail.com",
// // //   "oluwatiroyeamoye@gmail.com",
// // //   "trbanjo@gmail.com",
// // //   "emanfrimpong@gmail.com",
// // //   "dipeoluolatunji@gmail.com",
// // //   "lybertyudochuu@gmail.com",
// // // ];



// // const sampleCourses = [
// //   {
// //     id: "splunk",
// //     title: "Splunk Training",
// //     classes: [
// //       {
// //         id: "class1",
// //         title: "Orientation — Intro (1 Videos)",
// //         videos: [
// //           {
// //             id: "v1",
// //             title: "To-analytics Orientation",
// //             url: "https://player.vimeo.com/video/1126909883",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d1",
// //             title: "To-analytics Orientation",
// //             url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
// //           },
// //         ],
// //       },
// //       {
// //         id: "class2",
// //         title: "Class 1 — Splunk  SIEM (1 Videos)",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 1",
// //             url: "https://player.vimeo.com/video/1127004938",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d1",
// //             title: "To-analytics Splunk Class 1 Intro",
// //             url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
// //           },
// //           {
// //             id: "d2",
// //             title: "To-analytics Splunk Class 1 Note",
// //             url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
// //           },
// //         ],
// //       },
// //       {
// //         id: "class3",
// //         title: "Class 2 —  Splunk Basics",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 2",
// //             url: "https://player.vimeo.com/video/1131114931",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "To-analytics Splunk Class 2",
// //             url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
// //           },
// //           {
// //             id: "d4",
// //             title: "To-analytics Splunk  Class 2 Note",
// //             url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
// //           },
// //         ],
// //       },
// //       {
// //         id: "class4",
// //         title: "Class 3 — Splunk SPL",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 3",
// //             url: "https://player.vimeo.com/video/1133357923",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "To-analytics Splunk Class 3",
// //             url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
// //           },
// //           {
// //             id: "d4",
// //             title: "To-analytics Splunk Class 3 Note",
// //             url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
// //           },
// //         ],
// //       },
// //       {
// //         id: "class5",
// //         title: "Class 4 — SPL Part 2",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 4",
// //             url: "https://player.vimeo.com/video/1136469770",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "To-analytics Splunk Class 4",
// //             url: "https://drive.google.com/file/d/1XVZBJxSCe_bj-MP93nGyJPKG3qoKjrb_/preview",
// //             // url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
// //           },
// //         ],
// //       },

// //       {
// //         id: "class6",
// //         title: "Class 5  — Splunk SPL  LAB",
// //         desc: "Creating reports, dashboards, visualizations, inputs and filters. .",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 5",
// //             url: "https://player.vimeo.com/video/1138152119",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "Splunk Class 5 Slides",
// //             url: "",
// //             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
// //           },

// //           {
// //             id: "d3",
// //             title: "Splunk Class 5 Note",
// //             url: "https://drive.google.com/file/d/1RrF8dEuaUgyKiWhF8lQ4h-WiN9CUb4gE/preview",
// //             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
// //           },
// //         ],
// //       },

// //       {
// //         id: "class8",
// //         title: "Class 6  — Splunk Knowledge Objects.",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 6",
// //             url: "https://player.vimeo.com/video/1140703570",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "Splunk Class 6 Slides",
// //             url: "https://drive.google.com/file/d/1cXBItLD6OpbOY6aDi5NGQ0-KXJbutCIS/view?usp=sharing",
// //           },

// //           {
// //             id: "d3",
// //             title: "Splunk Class 6 Note",
// //             url: "https://drive.google.com/file/d/1fVtS0u-mPndEiVbSGm1f2H5Qm_Dx3CzV/preview",
// //           },
// //         ],
// //       },

// //       {
// //         id: "class7",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 7 Splunk Lab Knowledge Objects",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 7",
// //             url: "https://player.vimeo.com/video/1145017764",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "",
// //             url: "",
// //           },
// //         ],
// //       },

// //       // https://player.vimeo.com/video/1149696096
// //       {
// //         id: "class8",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 8 Splunk Dashboard ",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 8",
// //             url: "https://player.vimeo.com/video/1146557656",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "T.O_Analytics_Splunk_Class_8",
// //             url: "https://drive.google.com/file/d/1jBaWruZc2sgrmzuLFWuwtcNMHrOiab8K/preview",
// //           },

// //           {
// //             id: "d3",
// //             title: "T.O_Analytics_Splunk_Class_8 Note",
// //             url: "https://drive.google.com/file/d/1EvVwiUgfR8Vl1q4MIIUPCmHnFDDKvPg4/preview",
// //           },

// //           {
// //             id: "d3",
// //             title: "T.O_Analytics_Splunk_Class_8 Assignment",
// //             url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
// //           },
// //         ],
// //       },

// //       {
// //         id: "class9",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 9 Splunk Dashboard Lab",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 9",
// //             url: "https://player.vimeo.com/video/1149696096",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "",
// //             title: "",
// //             url: "",
// //           },
// //         ],
// //       },
// //       //

// //       {
// //         id: "class10",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 10 Certification Exam, Job & Assignment Review",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 10",
// //             url: "https://player.vimeo.com/video/1153292493",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "",
// //             title: "Assignment",
// //             url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
// //           },
// //         ],
// //       },

// //       {
// //         id: "class11",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 11 Onboarding data",
// //         // desc: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/view?usp=sharing",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "",
// //             url: "https://player.vimeo.com/video/1156881908",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "",
// //             title: "Onboarding data ",
// //             url: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/preview",
// //           },
// //         ],
// //       },

// //       {
// //         id: "class12",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 12 Data Onboarding Lab.",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "Class 12 Data Onboarding Lab",
// //             url: "https://player.vimeo.com/video/1158631944",
// //             // url: "",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "dv",
// //             title: "Class 12 Data Onboarding Lab",
// //             url: "",
// //           },
// //         ],
// //       },

// //       {
// //         id: "class13",
// //         // title: "Class 7  —  Splunk Dashboard",
// //         title: "Class 13 Data Onboarding Lab.",
// //         desc: "",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "Class 13 Data Onboarding Lab",
// //             url: "https://player.vimeo.com/video/1161024327",

// //             // url: "",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "dv",
// //             title: "Class 13 Data Onboarding Lab",
// //             url: "https://docs.google.com/presentation/d/16tCZ7QDzXSVXw7RnQFvKxO7mZEH1E87d/preview",
// //           },
// //         ],
// //       },
// //     ],
// //   },
// // ];

// // const fullSplunkSyllabus = sampleCourses
// //   .find((c) => c.id === "splunk")
// //   .classes.map((cls, index) => ({
// //     week: index + 1,
// //     title: cls.title,
// //     desc: cls.desc || "Session content delivered in the sample course.",
// //     videos: cls.videos || [],
// //     docs: cls.docs || [],
// //   }));

// // function storageProgressKey(email) {
// //   return `cp_progress_${(email || "").toLowerCase().trim()}`;
// // }

// // function normalizeEmail(raw) {
// //   try {
// //     if (!raw) return "";

// //     const parsed = JSON.parse(raw);
// //     return (parsed?.email || raw).toLowerCase().trim();
// //   } catch {
// //     return (raw || "").toLowerCase().trim();
// //   }
// // }

// // function getClassProgress(progress) {
// //   if (!progress) return 0;

// //   if (progress.completed) return 100;

// //   if (progress.time && progress.duration) {
// //     return Math.min((progress.time / progress.duration) * 100, 100);
// //   }

// //   return progress.time ? 12 : 0;
// // }

// // function AssignmentToast({ show, onClose }) {
// //   if (!show) return null;

// //   return (
// //     <div className="fixed bottom-6 right-6 z-50 w-[92%] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
// //       <button
// //         onClick={onClose}
// //         className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white hover:text-slate-950"
// //       >
// //         <FaXmark />
// //       </button>

// //       <div className="flex gap-4 pr-8">
// //         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-BLUE text-white">
// //           <FaFileLines />
// //         </div>

// //         <div>
// //           <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
// //             New Assignment
// //           </p>
// //           <h2 className="mt-1 text-lg font-black">
// //             New assignment has been released!
// //           </h2>
// //           <p className="mt-2 text-sm leading-6 text-white/60">
// //             Open your materials section to view the latest assignment document.
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function AccessDenied({ userEmail }) {
// //   return (
// //     <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-16 text-white">
// //       <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-BLUE/35 blur-[140px]" />
// //       <div className="absolute bottom-[-220px] right-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/20 blur-[150px]" />
// //       <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

// //       <div className="relative z-10 w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10">
// //         <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/15 text-3xl text-red-300">
// //           <FaLock />
// //         </div>

// //         <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-red-300">
// //           Access Denied
// //         </p>

// //         <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
// //           Learning Portal Locked
// //         </h1>

// //         <p className="mx-auto mt-5 max-w-md text-base font-medium leading-8 text-white/65">
// //           This page is restricted to authorized T.O Analytics members only.
// //           Please log in with an approved student account.
// //         </p>

// //         <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
// //           <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
// //             Current Account
// //           </p>
// //           <p className="mt-2 break-all text-sm font-bold text-white/80">
// //             {userEmail || "No account detected"}
// //           </p>
// //         </div>

// //         <div className="mt-8 flex flex-col gap-3 sm:flex-row">
// //           {/* <NavLink
// //             to="/login"
// //             className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition hover:-translate-y-1"
// //           >
// //             Login
// //           </NavLink> */}

// //           <NavLink
// //             to="/"
// //             className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-BLUE"
// //           >
// //             please contact the admin for support ,t.oanalyticsllc@gmail.com
// //           </NavLink>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }

// // function SyllabusSection({ onSelectClass }) {
// //   return (
// //     <div className="space-y-5">
// //       {fullSplunkSyllabus.map((week, index) => {
// //         const validVideos = (week.videos || []).filter((v) => v?.url);
// //         const validDocs = (week.docs || []).filter((d) => d?.url && d?.title);

// //         return (
// //           <div
// //             key={index}
// //             className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.09]"
// //           >
// //             <div className="absolute right-5 top-5 text-7xl font-black text-white/[0.03]">
// //               {week.week}
// //             </div>

// //             <div className="relative z-10 flex gap-4">
// //               <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-BLUE text-lg font-black text-white">
// //                 {week.week}
// //               </div>

// //               <div className="flex-1">
// //                 <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
// //                   Week {week.week}
// //                 </p>

// //                 <h3 className="mt-2 text-xl font-black text-white">
// //                   {week.title}
// //                 </h3>

// //                 <p className="mt-2 text-sm font-medium leading-7 text-white/55">
// //                   {week.desc}
// //                 </p>

// //                 <div className="mt-5 grid gap-3 md:grid-cols-2">
// //                   <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
// //                     <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
// //                       <FaVideo className="text-cyan-200" />
// //                       Videos
// //                     </div>

// //                     {validVideos.length ? (
// //                       <div className="space-y-2">
// //                         {validVideos.map((video, i) => (
// //                           <a
// //                             key={i}
// //                             href={video.url}
// //                             target="_blank"
// //                             rel="noreferrer"
// //                             className="block rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white hover:text-BLUE"
// //                           >
// //                             {video.title || "Class Video"}
// //                           </a>
// //                         ))}
// //                       </div>
// //                     ) : (
// //                       <p className="text-xs font-semibold text-white/35">
// //                         No videos attached yet
// //                       </p>
// //                     )}
// //                   </div>

// //                   <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
// //                     <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
// //                       <FaFileLines className="text-cyan-200" />
// //                       Documents
// //                     </div>

// //                     {validDocs.length ? (
// //                       <div className="space-y-2">
// //                         {validDocs.map((doc, i) => (
// //                           <a
// //                             key={i}
// //                             href={doc.url}
// //                             target="_blank"
// //                             rel="noreferrer"
// //                             className="block rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white hover:text-BLUE"
// //                           >
// //                             {doc.title}
// //                           </a>
// //                         ))}
// //                       </div>
// //                     ) : (
// //                       <p className="text-xs font-semibold text-white/35">
// //                         No documents attached yet
// //                       </p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <button
// //                   onClick={() => onSelectClass(index)}
// //                   className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-BLUE transition hover:-translate-y-1"
// //                 >
// //                   Open Week {week.week}
// //                   <FaArrowRight />
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // }

// // export default function CoursePortal() {
// //   const [showNewAssignmentAlert, setShowNewAssignmentAlert] = useState(true);
// //   const [darkMode, setDarkMode] = useState(true);

// //   const [courses] = useState(sampleCourses);
// //   const [selectedCourse, setSelectedCourse] = useState(sampleCourses[0]);
// //   const [selectedClass, setSelectedClass] = useState(
// //     sampleCourses[0].classes[0],
// //   );
// //   const [selectedVideo, setSelectedVideo] = useState(null);

// //   const [showSyllabus, setShowSyllabus] = useState(false);
// //   const [classSearch, setClassSearch] = useState("");
// //   const [thumbnails, setThumbnails] = useState({});
// //   const [loadingThumbs, setLoadingThumbs] = useState(false);

// //   // const [userEmail, setUserEmail] = useState("");
// //   // const [isAllowed, setIsAllowed] = useState(false);
// //   // const [progressState, setProgressState] = useState({});


// //   const [userEmail, setUserEmail] = useState("");
// // const [isAllowed, setIsAllowed] = useState(false);
// // const [checkingAccess, setCheckingAccess] = useState(true);
// // const [progressState, setProgressState] = useState({});
// //   const [isMutedHint, setIsMutedHint] = useState(false);

// //   const playerRef = useRef(null);
// //   const vimeoPlayerRef = useRef(null);

// //   const selectedClassVideos = useMemo(
// //     () => (selectedClass?.videos || []).filter((v) => v?.url),
// //     [selectedClass],
// //   );

// //   const selectedClassDocs = useMemo(
// //     () => (selectedClass?.docs || []).filter((d) => d?.title && d?.url),
// //     [selectedClass],
// //   );

// //   const filteredClasses = useMemo(() => {
// //     const search = classSearch.toLowerCase();

// //     return selectedCourse.classes.filter((item) =>
// //       item.title.toLowerCase().includes(search),
// //     );
// //   }, [selectedCourse, classSearch]);

// //   const completedCount = useMemo(() => {
// //     return selectedCourse.classes.filter(
// //       (item) => progressState[item.id]?.completed,
// //     ).length;
// //   }, [selectedCourse, progressState]);

// //   const totalClasses = selectedCourse.classes.length;
// //   const totalVideos = selectedCourse.classes.reduce(
// //     (sum, item) =>
// //       sum + (item.videos || []).filter((video) => video?.url).length,
// //     0,
// //   );

// //   const courseProgress = totalClasses
// //     ? Math.round((completedCount / totalClasses) * 100)
// //     : 0;

// //   // useEffect(() => {
// //   //   const rawUser = localStorage.getItem("user") || "";
// //   //   const normalized = normalizeEmail(rawUser);

// //   //   setUserEmail(normalized);

// //   //   setIsAllowed(
// //   //     allowedEmails
// //   //       .map((email) => email.toLowerCase().trim())
// //   //       .includes(normalized),
// //   //   );

// //   //   async function fetchProgress() {
// //   //     if (!normalized) return;

// //   //     try {
// //   //       const res = await fetch(
// //   //         `${import.meta.env.VITE_API_BASE}/api/progress/${normalized}`,
// //   //       );

// //   //       if (!res.ok) throw new Error("Failed to fetch backend progress");

// //   //       const data = await res.json();

// //   //       const mapped = {};
// //   //       data.forEach((p) => {
// //   //         mapped[p.classId] = {
// //   //           note: p.note || "",
// //   //           time: p.time || 0,
// //   //           duration: p.duration || 0,
// //   //           completed: p.completed || false,
// //   //           videoId: p.videoId || "",
// //   //         };
// //   //       });

// //   //       setProgressState(mapped);
// //   //       localStorage.setItem(
// //   //         storageProgressKey(normalized),
// //   //         JSON.stringify(mapped),
// //   //       );
// //   //     } catch (err) {
// //   //       try {
// //   //         const saved = JSON.parse(
// //   //           localStorage.getItem(storageProgressKey(normalized)) || "{}",
// //   //         );
// //   //         setProgressState(saved || {});
// //   //       } catch {
// //   //         setProgressState({});
// //   //       }
// //   //     }
// //   //   }

// //   //   fetchProgress();
// //   // }, []);


// //   useEffect(() => {
// //   let componentIsActive = true;

// //   const rawUser = localStorage.getItem("user") || "";
// //   const normalized = normalizeEmail(rawUser);

// //   setUserEmail(normalized);

// //   async function checkStudentAccess() {
// //     if (!normalized) {
// //       if (componentIsActive) {
// //         setIsAllowed(false);
// //         setCheckingAccess(false);
// //       }

// //       return;
// //     }

// //     try {
// //       const response = await fetch("/api/check-student-access", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           email: normalized,
// //           courseId: "splunk",
// //         }),
// //       });

// //       let result = null;

// //       try {
// //         result = await response.json();
// //       } catch {
// //         result = null;
// //       }

// //       if (!response.ok) {
// //         throw new Error(
// //           result?.error || "Unable to check student access.",
// //         );
// //       }

// //       if (componentIsActive) {
// //         setIsAllowed(result?.allowed === true);
// //       }
// //     } catch (error) {
// //       console.error("Student access check failed:", error);

// //       if (componentIsActive) {
// //         setIsAllowed(false);
// //       }
// //     } finally {
// //       if (componentIsActive) {
// //         setCheckingAccess(false);
// //       }
// //     }
// //   }

// //   async function fetchProgress() {
// //     if (!normalized) return;

// //     try {
// //       const apiBase = import.meta.env.VITE_API_BASE;

// //       if (!apiBase) {
// //         throw new Error("Progress API is not configured.");
// //       }

// //       const response = await fetch(
// //         `${apiBase}/api/progress/${encodeURIComponent(normalized)}`,
// //       );

// //       if (!response.ok) {
// //         throw new Error("Failed to fetch backend progress.");
// //       }

// //       const data = await response.json();

// //       const mapped = {};

// //       if (Array.isArray(data)) {
// //         data.forEach((progress) => {
// //           mapped[progress.classId] = {
// //             note: progress.note || "",
// //             time: progress.time || 0,
// //             duration: progress.duration || 0,
// //             completed: progress.completed || false,
// //             videoId: progress.videoId || "",
// //           };
// //         });
// //       }

// //       if (componentIsActive) {
// //         setProgressState(mapped);
// //       }

// //       localStorage.setItem(
// //         storageProgressKey(normalized),
// //         JSON.stringify(mapped),
// //       );
// //     } catch (error) {
// //       console.warn(
// //         "Backend progress unavailable. Using local progress:",
// //         error,
// //       );

// //       try {
// //         const saved = JSON.parse(
// //           localStorage.getItem(storageProgressKey(normalized)) || "{}",
// //         );

// //         if (componentIsActive) {
// //           setProgressState(saved || {});
// //         }
// //       } catch {
// //         if (componentIsActive) {
// //           setProgressState({});
// //         }
// //       }
// //     }
// //   }

// //   checkStudentAccess();
// //   fetchProgress();

// //   return () => {
// //     componentIsActive = false;
// //   };
// // }, []);

// //   useEffect(() => {
// //     async function fetchThumbs() {
// //       setLoadingThumbs(true);

// //       const vmap = {};
// //       const videos = selectedClassVideos;

// //       await Promise.all(
// //         videos.map(async (video) => {
// //           if (video.thumbnail) {
// //             vmap[video.id] = video.thumbnail;
// //             return;
// //           }

// //           try {
// //             const videoUrl = video.url.includes("vimeo.com")
// //               ? video.url.replace("player.", "")
// //               : video.url;

// //             const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
// //               videoUrl,
// //             )}`;

// //             const res = await fetch(oembed);

// //             if (!res.ok) throw new Error("No oEmbed");

// //             const data = await res.json();
// //             vmap[video.id] = data.thumbnail_url || null;
// //           } catch {
// //             vmap[video.id] = null;
// //           }
// //         }),
// //       );

// //       setThumbnails(vmap);
// //       setLoadingThumbs(false);
// //     }

// //     fetchThumbs();
// //   }, [selectedClassVideos]);

// //   useEffect(() => {
// //     if (!selectedVideo) {
// //       if (playerRef.current) playerRef.current.innerHTML = "";
// //       return;
// //     }

// //     if (vimeoPlayerRef.current) {
// //       try {
// //         vimeoPlayerRef.current.unload?.();
// //         vimeoPlayerRef.current.destroy?.();
// //       } catch {}
// //       vimeoPlayerRef.current = null;
// //     }

// //     const iframe = document.createElement("iframe");
// //     iframe.setAttribute("src", `${selectedVideo.url}?transparent=0&autoplay=0`);
// //     iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
// //     iframe.setAttribute("frameborder", "0");
// //     iframe.className = "h-full w-full";

// //     if (playerRef.current) {
// //       playerRef.current.innerHTML = "";
// //       playerRef.current.appendChild(iframe);
// //     }

// //     const player = new Player(iframe);
// //     vimeoPlayerRef.current = player;

// //     player.setVolume(1).catch(() => setIsMutedHint(true));

// //     try {
// //       const saved = JSON.parse(
// //         localStorage.getItem(storageProgressKey(userEmail)) || "{}",
// //       );

// //       const cls = saved[selectedClass.id] || {};

// //       if (cls.videoId === selectedVideo.id && cls.time > 0) {
// //         player
// //           .ready()
// //           .then(() => player.setCurrentTime(cls.time).catch(() => {}));
// //       }
// //     } catch {}

// //     const interval = setInterval(async () => {
// //       try {
// //         const time = await player.getCurrentTime();
// //         const duration = await player.getDuration();

// //         updateVideoProgress(selectedClass.id, selectedVideo.id, time, duration);
// //       } catch {}
// //     }, 3000);

// //     const onPlay = () => setIsMutedHint(false);
// //     player.on("play", onPlay);

// //     return () => {
// //       clearInterval(interval);

// //       try {
// //         player.off("play", onPlay);
// //         player.unload?.();
// //         player.destroy?.();
// //       } catch {}

// //       vimeoPlayerRef.current = null;
// //     };
// //   }, [selectedVideo, selectedClass, userEmail]);

// //   useEffect(() => {
// //     setSelectedVideo(null);

// //     try {
// //       const saved = JSON.parse(
// //         localStorage.getItem(storageProgressKey(userEmail)) || "{}",
// //       );

// //       const cls = saved[selectedClass.id] || {};

// //       if (cls.videoId) {
// //         const found = selectedClass.videos.find((v) => v.id === cls.videoId);
// //         if (found) setSelectedVideo(found);
// //       }
// //     } catch {}
// //   }, [selectedClass, userEmail]);

// //   useEffect(() => {
// //     document.documentElement.classList.toggle("dark", darkMode);
// //   }, [darkMode]);

// //   function updateVideoProgress(classId, videoId, timeSec, durationSec) {
// //     const email = userEmail || "anonymous";
// //     const key = storageProgressKey(email);
// //     const prev = JSON.parse(localStorage.getItem(key) || "{}");

// //     prev[classId] = {
// //       ...(prev[classId] || {}),
// //       videoId,
// //       time: timeSec,
// //       duration: durationSec,
// //       completed:
// //         durationSec > 0 && timeSec / durationSec >= 0.9
// //           ? true
// //           : prev[classId]?.completed || false,
// //     };

// //     localStorage.setItem(key, JSON.stringify(prev));
// //     setProgressState(prev);
// //   }

// //   function markClassCompleted(classId) {
// //     const email = userEmail || "anonymous";
// //     const key = storageProgressKey(email);
// //     const prev = JSON.parse(localStorage.getItem(key) || "{}");

// //     prev[classId] = {
// //       ...(prev[classId] || {}),
// //       completed: true,
// //     };

// //     localStorage.setItem(key, JSON.stringify(prev));
// //     setProgressState(prev);
// //   }

// //   function updateNote(note) {
// //     const email = userEmail || "anonymous";
// //     const key = storageProgressKey(email);
// //     const prev = JSON.parse(localStorage.getItem(key) || "{}");

// //     prev[selectedClass.id] = {
// //       ...(prev[selectedClass.id] || {}),
// //       note,
// //     };

// //     localStorage.setItem(key, JSON.stringify(prev));
// //     setProgressState(prev);
// //   }

// //   function resetProgress() {
// //     localStorage.removeItem(storageProgressKey(userEmail));
// //     setProgressState({});
// //   }

// //   function handleSelectClass(classItem) {
// //     setSelectedClass(classItem);
// //     setShowSyllabus(false);
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   }


// //   if (checkingAccess) {
// //   return (
// //     <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 text-white">
// //       <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-BLUE/30 blur-[140px]" />

// //       <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-purple-500/20 blur-[150px]" />

// //       <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl">
// //         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
// //           <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-300" />
// //         </div>

// //         <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
// //           Student verification
// //         </p>

// //         <h1 className="mt-3 text-2xl font-black">
// //           Checking your portal access
// //         </h1>

// //         <p className="mt-3 text-sm leading-6 text-white/55">
// //           Please wait while your student account is being verified.
// //         </p>
// //       </div>
// //     </main>
// //   );
// // }

// // if (!isAllowed) {
// //   return <AccessDenied userEmail={userEmail} />;
// // }
 
// //   return (
// //     <main className="relative min-h-screen overflow-hidden bg-[#050816] p-4 text-white md:p-6">
// //       <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/35 blur-[140px]" />
// //       <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-cyan-400/20 blur-[150px]" />
// //       <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[170px]" />
// //       <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

// //       <AssignmentToast
// //         show={showNewAssignmentAlert}
// //         onClose={() => setShowNewAssignmentAlert(false)}
// //       />

// //       <SplunkKnowledgePopup />

// //       <div className="relative z-10 mx-auto max-w-[1600px]">
// //         {/* HEADER */}
// //         <header className="student-dashboard-header mb-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-6">
// //           <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
// //             <div className="min-w-0">
// //               <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
// //                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
// //                   <FaGraduationCap />
// //                 </span>
// //                 <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/70 sm:text-xs sm:tracking-[0.25em]">
// //                   T.O Analytics Learning Portal
// //                 </span>
// //               </div>

// //               <h1 className="mt-5 text-3xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
// //                 Professional Splunk Bootcamp Dashboard
// //               </h1>

// //               <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-white/55 md:text-base">
// //                 Watch classes, track progress, open documents, review syllabus,
// //                 and write personal notes from one advanced student portal.
// //               </p>
// //             </div>

// //             <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch xl:w-auto xl:items-center">
// //               <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-1 xl:flex-none">
// //                 <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
// //                   Signed in as
// //                 </p>
// //                 <p className="mt-1 break-all text-sm font-bold text-white/80">
// //                   {userEmail}
// //                 </p>
// //               </div>


// //               <button
// //                 onClick={() => setDarkMode((prev) => !prev)}
// //                 className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white hover:text-BLUE sm:w-auto"
// //               >
// //                 {darkMode ? <FaSun /> : <FaMoon />}
// //                 {darkMode ? "Light Mode" : "Dark Mode"}
// //               </button>
// //             </div>
// //           </div>

// //           <div className="mt-6 grid gap-4 md:grid-cols-4">
// //             <PortalStat
// //               icon={<FaLayerGroup />}
// //               value={totalClasses}
// //               label="Classes"
// //             />
// //             <PortalStat icon={<FaVideo />} value={totalVideos} label="Videos" />
// //             <PortalStat
// //               icon={<FaCheck />}
// //               value={`${completedCount}/${totalClasses}`}
// //               label="Completed"
// //             />
// //             <PortalStat
// //               icon={<FaChartLine />}
// //               value={`${courseProgress}%`}
// //               label="Progress"
// //             />
// //           </div>
// //         </header>

// //         <div className="grid grid-cols-12 gap-6">
// //           {/* LEFT SIDEBAR */}
// //           <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3">
// //             <div className="mb-5">
// //               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
// //                 Navigation
// //               </p>
// //               <h2 className="mt-2 text-2xl font-black">Course Menu</h2>
// //             </div>

// //             <button
// //               onClick={() => {
// //                 setShowSyllabus(true);
// //                 setSelectedVideo(null);
// //               }}
// //               className={`mb-4 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left font-black transition ${
// //                 showSyllabus
// //                   ? "bg-white text-BLUE"
// //                   : "bg-white/5 text-white hover:bg-white/10"
// //               }`}
// //             >
// //               <span className="flex items-center gap-3">
// //                 <FaBookOpen />
// //                 Full Syllabus
// //               </span>
// //               <FaArrowRight />
// //             </button>

// //             <div className="mb-4 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
// //               <FaMagnifyingGlass className="text-white/35" />
// //               <input
// //                 value={classSearch}
// //                 onChange={(e) => setClassSearch(e.target.value)}
// //                 placeholder="Search classes..."
// //                 className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
// //               />
// //             </div>

// //             <div className="space-y-4">
// //               {courses.map((course) => (
// //                 <div key={course.id}>
// //                   <button
// //                     onClick={() => {
// //                       setSelectedCourse(course);
// //                       setSelectedClass(course.classes[0]);
// //                       setShowSyllabus(false);
// //                     }}
// //                     className={`w-full rounded-2xl px-4 py-4 text-left font-black transition ${
// //                       selectedCourse.id === course.id
// //                         ? "bg-BLUE text-white"
// //                         : "bg-white/5 text-white hover:bg-white/10"
// //                     }`}
// //                   >
// //                     {course.title}
// //                   </button>

// //                   {selectedCourse.id === course.id && (
// //                     <div className="mt-3 max-h-[560px] space-y-3 overflow-y-auto pr-1">
// //                       {filteredClasses.map((classItem, index) => {
// //                         const progress = progressState[classItem.id];
// //                         const percent = getClassProgress(progress);

// //                         return (
// //                           <button
// //                             key={`${classItem.id}-${index}`}
// //                             onClick={() => handleSelectClass(classItem)}
// //                             className={`w-full rounded-2xl border p-4 text-left transition ${
// //                               selectedClass.id === classItem.id && !showSyllabus
// //                                 ? "border-cyan-300/30 bg-white text-slate-950"
// //                                 : "border-white/10 bg-white/5 text-white hover:bg-white/10"
// //                             }`}
// //                           >
// //                             <div className="flex items-start gap-3">
// //                               <span
// //                                 className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
// //                                   progress?.completed
// //                                     ? "bg-emerald-500 text-white"
// //                                     : selectedClass.id === classItem.id &&
// //                                         !showSyllabus
// //                                       ? "bg-BLUE text-white"
// //                                       : "bg-white/10 text-white"
// //                                 }`}
// //                               >
// //                                 {progress?.completed ? <FaCheck /> : index + 1}
// //                               </span>

// //                               <div className="flex-1">
// //                                 <p className="text-sm font-black leading-6">
// //                                   {classItem.title}
// //                                 </p>

// //                                 <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
// //                                   <div
// //                                     className={`h-full rounded-full ${
// //                                       progress?.completed
// //                                         ? "bg-emerald-500"
// //                                         : "bg-BLUE"
// //                                     }`}
// //                                     style={{
// //                                       width: `${Math.max(percent, 5)}%`,
// //                                     }}
// //                                   />
// //                                 </div>

// //                                 <p className="mt-2 text-xs font-semibold opacity-60">
// //                                   {Math.round(percent)}% completed
// //                                 </p>
// //                               </div>
// //                             </div>
// //                           </button>
// //                         );
// //                       })}
// //                     </div>
// //                   )}
// //                 </div>
// //               ))}
// //             </div>

// //             <div className="mt-6 border-t border-white/10 pt-5">
// //               <button
// //                 onClick={resetProgress}
// //                 className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white"
// //               >
// //                 <FaRotateRight />
// //                 Reset My Progress
// //               </button>
// //             </div>
// //           </aside>

// //           {/* CENTER MAIN */}
// //           <section className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-6 md:p-5">
// //             {showSyllabus ? (
// //               <>
// //                 <div className="mb-6 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
// //                   <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
// //                     Complete Roadmap
// //                   </p>
// //                   <h2 className="mt-3 text-3xl font-black">
// //                     Full Splunk Training Syllabus
// //                   </h2>
// //                   <p className="mt-3 text-sm font-medium leading-7 text-white/55">
// //                     Review the full training structure, weekly roadmap, videos
// //                     and supporting documents.
// //                   </p>
// //                 </div>

// //                 <SyllabusSection
// //                   onSelectClass={(index) =>
// //                     handleSelectClass(selectedCourse.classes[index])
// //                   }
// //                 />
// //               </>
// //             ) : (
// //               <>
// //                 <div className="mb-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
// //                   <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
// //                     Current Class
// //                   </p>

// //                   <h2 className="mt-3 text-3xl font-black">
// //                     {selectedClass.title}
// //                   </h2>

// //                   <p className="mt-3 text-sm font-medium leading-7 text-white/55">
// //                     Select a video below to continue your lesson. Your watch
// //                     progress is saved automatically.
// //                   </p>
// //                 </div>

// //                 <div className="grid gap-4 md:grid-cols-2">
// //                   {selectedClassVideos.length ? (
// //                     selectedClassVideos.map((video) => (
// //                       <button
// //                         key={video.id}
// //                         onClick={() => setSelectedVideo(video)}
// //                         className={`group overflow-hidden rounded-[1.6rem] border text-left transition hover:-translate-y-1 ${
// //                           selectedVideo?.id === video.id
// //                             ? "border-cyan-300/40 bg-white text-slate-950"
// //                             : "border-white/10 bg-white/5 text-white hover:bg-white/10"
// //                         }`}
// //                       >
// //                         <div className="relative h-44 overflow-hidden bg-black">
// //                           {thumbnails[video.id] ? (
// //                             <img
// //                               src={thumbnails[video.id]}
// //                               alt={video.title}
// //                               className="h-full w-full object-cover opacity-80 transition group-hover:scale-110 group-hover:opacity-100"
// //                             />
// //                           ) : (
// //                             <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/35">
// //                               {loadingThumbs
// //                                 ? "Loading thumbnail..."
// //                                 : "No thumbnail"}
// //                             </div>
// //                           )}

// //                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

// //                           <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-BLUE">
// //                             <FaCirclePlay />
// //                           </div>
// //                         </div>

// //                         <div className="p-4">
// //                           <h4 className="font-black leading-6">
// //                             {video.title || "Class Video"}
// //                           </h4>
// //                           <p className="mt-2 text-xs font-semibold opacity-55">
// //                             Vimeo Video Lesson
// //                           </p>
// //                         </div>
// //                       </button>
// //                     ))
// //                   ) : (
// //                     <div className="col-span-2 rounded-[1.7rem] border border-white/10 bg-white/5 p-8 text-center">
// //                       <FaVideo className="mx-auto text-4xl text-white/30" />
// //                       <h3 className="mt-5 text-2xl font-black">
// //                         No video available yet
// //                       </h3>
// //                       <p className="mt-2 text-sm text-white/50">
// //                         This class does not currently have a video attached.
// //                       </p>
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black shadow-2xl">
// //                   <div
// //                     ref={playerRef}
// //                     className="flex h-[260px] w-full items-center justify-center bg-black text-sm font-bold text-white/40 md:h-[460px]"
// //                   >
// //                     Choose a video to start
// //                   </div>
// //                 </div>

// //                 <div className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
// //                   <div>
// //                     <p className="text-sm font-black text-white">
// //                       {selectedVideo?.title || "No video selected"}
// //                     </p>

// //                     {isMutedHint && (
// //                       <p className="mt-1 text-xs font-semibold text-yellow-200">
// //                         Browser blocked volume control. Press play manually if
// //                         needed.
// //                       </p>
// //                     )}
// //                   </div>

// //                   <button
// //                     onClick={() => markClassCompleted(selectedClass.id)}
// //                     className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-emerald-400"
// //                   >
// //                     Mark Completed
// //                   </button>
// //                 </div>
// //               </>
// //             )}
// //           </section>

// //           {/* RIGHT SIDE */}
// //           <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3 md:p-5">
// //             <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
// //               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
// //                 Class Materials
// //               </p>

// //               <h3 className="mt-3 text-2xl font-black">Resources</h3>

// //               <div className="mt-5 space-y-3">
// //                 {showSyllabus ? (
// //                   <p className="text-sm font-medium leading-7 text-white/50">
// //                     Select a class from the syllabus or course menu to see
// //                     documents here.
// //                   </p>
// //                 ) : selectedClassDocs.length ? (
// //                   selectedClassDocs.map((doc, index) => (
// //                     <a
// //                       key={`${doc.id}-${index}`}
// //                       href={doc.url}
// //                       target="_blank"
// //                       rel="noreferrer"
// //                       className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white hover:text-BLUE"
// //                     >
// //                       <span className="flex items-center gap-3 text-sm font-black">
// //                         <FaFileLines />
// //                         {doc.title}
// //                       </span>

// //                       <FaDownload className="opacity-50 transition group-hover:opacity-100" />
// //                     </a>
// //                   ))
// //                 ) : (
// //                   <p className="text-sm font-medium leading-7 text-white/50">
// //                     No documents available currently.
// //                   </p>
// //                 )}
// //               </div>
// //             </div>

// //             <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
// //               <div className="mb-4 flex items-center gap-3">
// //                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-BLUE">
// //                   <FaNoteSticky />
// //                 </div>

// //                 <div>
// //                   <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
// //                     Personal
// //                   </p>
// //                   <h4 className="text-xl font-black">Notes</h4>
// //                 </div>
// //               </div>

// //               <textarea
// //                 className="h-48 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
// //                 placeholder="Write your notes for this class..."
// //                 value={progressState[selectedClass.id]?.note || ""}
// //                 onChange={(e) => updateNote(e.target.value)}
// //               />
// //             </div>

// //             <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
// //               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
// //                 Progress Summary
// //               </p>

// //               <h3 className="mt-3 text-4xl font-black">{courseProgress}%</h3>

// //               <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
// //                 <div
// //                   className="h-full rounded-full bg-BLUE"
// //                   style={{ width: `${courseProgress}%` }}
// //                 />
// //               </div>

// //               <div className="mt-5 grid grid-cols-2 gap-3">
// //                 <MiniSummary label="Completed" value={completedCount} />
// //                 <MiniSummary
// //                   label="Remaining"
// //                   value={totalClasses - completedCount}
// //                 />
// //               </div>
// //             </div>
// //           </aside>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }

// // function PortalStat({ icon, value, label }) {
// //   return (
// //     <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
// //       <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
// //         {icon}
// //       </div>

// //       <h3 className="text-3xl font-black">{value}</h3>
// //       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">
// //         {label}
// //       </p>
// //     </div>
// //   );
// // }

// // function MiniSummary({ label, value }) {
// //   return (
// //     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
// //       <p className="text-xs font-black uppercase tracking-widest text-white/35">
// //         {label}
// //       </p>
// //       <p className="mt-2 text-2xl font-black text-white">{value}</p>
// //     </div>
// //   );
// // }
