import React, { useEffect, useMemo, useRef, useState } from "react";
import Player from "@vimeo/player";
import { NavLink } from "react-router-dom";
import {
  FaArrowRight, FaBookOpen, FaChartLine, FaCheck, FaCirclePlay,
  FaClock, FaFileLines, FaGraduationCap, FaLayerGroup, FaLock,
  FaMagnifyingGlass, FaMoon, FaNoteSticky, FaRotateRight,
  FaSun, FaVideo, FaXmark, FaClipboardList,
} from "react-icons/fa6";

/* Course content is deliberately unchanged from the supplied Stock & Options portal. */
// Stock & Options content. This portal uses the same student experience as
// the Splunk portal: searchable classes, embedded Vimeo lessons, class
// materials, notes, syllabus and saved progress.
const stockCourses = [
  {
    id: "stock-options",
    title: "Stock & Options Mastery",
    classes: [
      {
        id: "stock-week1",
        title: "Week 1 — Introduction to the Stock Market",
        desc: "Understand stocks, shares, exchanges, market participants and how the stock market operates.",
        videos: [
          {
            id: "stock-v1",
            title: "Understanding How The Stock Market Works",
            url: "https://player.vimeo.com/video/1225104800",
            // url: "https://player.vimeo.com/video/1157909911",
          },
        ],
        docs: [
          {
            id: "stock-d1",
            title: "Stocks and Shares Guide",
            url:"https://drive.google.com/file/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
            // url:"https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
            // url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview",
          },
        ],
      },
      {
        id: "stock-week2",
        title:"week 2 - Penny Stocks trading",
        // title: "Week 2 — Options Trading Fundamentals",
        desc: "Learn calls, puts, contracts, strike prices, expiration dates and foundational options strategies.",
        videos: [
          {
            id: "stock-v2",
            title: "Calls vs Puts Explained",
            url: "https://player.vimeo.com/video/1227099002",
          },  
        ],
        docs: [
          {
            id: "stock-d2",
            title: "Options Trading Notes",
            url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview",
          },
        ],
      },
      {
        id: "stock-week3",
        title: "Week 3 — Technical Analysis & Indicators",
        desc: "Study candlestick patterns, market structure, RSI, MACD and common trading indicators.",
        videos: [ 
          {
            id: "stock-v2",
            title: "Calls vs Puts Explained",
            url: "https://player.vimeo.com/video/1228532691",
          },  
        ],
        docs: [

           {
            id: "stock-d2",
            title: "WEBULL APP TUTORIAL",
            url: "https://docs.google.com/presentation/d/1P4cxP8rw-ywUsIZSD9koBpZ7My5Vu9Uu/edit?usp=sharing&ouid=104718481266065502968&rtpof=true&sd=true",
          },
        ],
      },
    ],
  },
];

// Assignments are independent from weekly lessons.
// Add every new student assignment to this collection.
const stockAssignments = [
  {
    id: "stock-assignment1",
    title: "Stock Assignment",
    description:
      "Complete the stock-market analysis exercise using the instructions in the assignment document.",
    // url: "https://drive.google.com/file/d/1BO7OuUkUy__ZY4lbnZqxkqVxwxogZnv3/preview",
    url:"https://drive.google.com/file/d/1dPYZ8xpWx1HysKzDlurrya0O4LN7H13_/view?usp=sharing",
    status: "available",
  },
];

const fullStockSyllabus = stockCourses
  .find((c) => c.id === "stock-options")
  .classes.map((cls, index) => ({
    week: index + 1,
    title: cls.title,
    desc: cls.desc || "Stock and options lesson content.",
    videos: cls.videos || [],
    docs: cls.docs || [],
  }));

const COURSE = stockCourses[0];
const MENU = [
  { id: "overview", label: "Overview", Icon: FaChartLine },
  { id: "classes", label: "My classes", Icon: FaCirclePlay },
  { id: "syllabus", label: "Full syllabus", Icon: FaLayerGroup },
  { id: "assignments", label: "Assignments", Icon: FaClipboardList },
  { id: "resources", label: "Resources", Icon: FaFileLines },
];
const SUPPORT_EMAIL = "t.oanalyticsllc@gmail.com";
const cn = (...values) => values.filter(Boolean).join(" ");

function normalizeEmail(raw) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return String(typeof parsed === "string" ? parsed : parsed?.email || "").trim().toLowerCase();
  } catch {
    return String(raw).trim().toLowerCase();
  }
}
function progressKey(email) {
  // Preserve the original stock portal key so existing notes and progress survive.
  return `stock_options_progress_${String(email || "").trim().toLowerCase()}`;
}
function safeRead(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
function percentFor(record) {
  if (record?.completed) return 100;
  const duration = Number(record?.duration) || 0;
  const time = Number(record?.time) || 0;
  return duration ? Math.max(0, Math.min(100, Math.round(time / duration * 100))) : time > 0 ? 12 : 0;
}
function StatCard({ Icon, value, label, detail, dark }) {
  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", dark ? "border-white/10 bg-[#111f34]" : "border-slate-200 bg-white")}>
      <div className="flex items-start justify-between gap-3">
        <div><p className={cn("text-xs font-semibold", dark ? "text-slate-400" : "text-slate-500")}>{label}</p>
          <p className="mt-2 text-3xl font-black tabular-nums">{value}</p></div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-lg", dark ? "bg-[#1d3857] text-sky-300" : "bg-blue-50 text-blue-700")}><Icon /></div>
      </div>
      <p className={cn("mt-4 text-xs", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>
    </div>
  );
}
function ProgressRing({ value, dark }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-[156px] w-[156px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${value}% completed`}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke={dark ? "#293951" : "#e2e8f0"} strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1688dc" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums">{value}%</span>
        <span className={cn("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>completed</span>
      </div>
    </div>
  );
}
function AccessState({ loading, email }) {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#f4f7fb] px-5 py-16 text-slate-900">
      <div className="w-full max-w-lg rounded-[28px] border border-blue-100 bg-white p-9 text-center shadow-xl shadow-blue-900/10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">
          {loading ? <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-700" /> : <FaLock />}
        </span>
        <h1 className="mt-6 text-2xl font-black">{loading ? "Verifying course access" : "Stock & Options access required"}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {loading ? "Checking your student enrollment." : "This training portal is for approved Stocks & Options students. Sign in with your enrolled account or contact the training team."}
        </p>
        {!!email && !loading && <p className="mt-4 break-all rounded-xl bg-blue-50 p-3 text-xs font-semibold text-blue-900">{email}</p>}
        {!loading && <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">Contact support</a>
          <NavLink to="/dashboard" className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-bold text-blue-700">Back to dashboard</NavLink>
        </div>}
      </div>
    </main>
  );
}

export default function StockOptionsCoursePortal() {
  const [userEmail, setUserEmail] = useState("");
  const [access, setAccess] = useState({ checking: true, allowed: false });
  const [view, setView] = useState("overview");
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("to_stock_portal_theme") === "dark"; } catch { return false; }
  });
  const [search, setSearch] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(COURSE.classes[0]?.id || "");
  const [selectedVideoKey, setSelectedVideoKey] = useState(null);
  const [progress, setProgress] = useState({});
  const [assignmentNotice, setAssignmentNotice] = useState(true);
  const [resumeMessage, setResumeMessage] = useState("");
  const [muteHint, setMuteHint] = useState(false);
  const playerMount = useRef(null);
  const playerInstance = useRef(null);
  const progressRef = useRef({});
  const storageKey = progressKey(userEmail);
  const selectedClass = COURSE.classes.find((item) => item.id === selectedClassId) || COURSE.classes[0];
  const classIndex = COURSE.classes.findIndex((item) => item.id === selectedClass.id);
  const videos = (selectedClass.videos || []).filter((item) => Boolean(item.url?.trim()));
  const docs = (selectedClass.docs || []).filter((item) => Boolean(item.title?.trim() && item.url?.trim()));
  const videosIndexed = videos.map((video, index) => ({ ...video, uniqueKey: `${selectedClass.id}-${index}-${video.id}` }));
  const chosenVideo = videosIndexed.find((video) => video.uniqueKey === selectedVideoKey);
  const assignments = stockAssignments.filter((item) => item.status === "available" && item.title && item.url);
  const totalVideos = COURSE.classes.reduce((total, item) => total + (item.videos || []).filter((v) => !!v.url).length, 0);
  const done = COURSE.classes.filter((cls) => progress[cls.id]?.completed).length;
  const progressPercent = COURSE.classes.length ? Math.round(done / COURSE.classes.length * 100) : 0;
  const filteredClasses = useMemo(() => COURSE.classes.filter((item) => `${item.title} ${item.desc}`.toLowerCase().includes(search.toLowerCase().trim())), [search]);
  const resourceList = COURSE.classes.flatMap((item, i) => (item.docs || [])
    .filter((doc) => doc.title && doc.url).map((doc, j) => ({ ...doc, source: item.title, uniqueKey: `${i}-${j}` })));

  useEffect(() => {
    const email = normalizeEmail(localStorage.getItem("user") || "");
    setUserEmail(email);
    if (!email) { setAccess({ checking: false, allowed: false }); return; }
    const controller = new AbortController();
    let active = true;
    // Keep the existing stock enrollment endpoint. Your backend MUST verify the
    // authenticated identity; a browser-supplied email by itself is not proof.
    (async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN") || "";
        const response = await fetch("/api/check-student-access", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ email, courseId: "stock-options" }),
          cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Enrollment check failed: ${response.status}`);
        const data = await response.json();
        if (active) setAccess({ checking: false, allowed: data?.allowed === true });
      } catch (err) {
        if (err?.name !== "AbortError") console.error("Stocks & Options access check failed", err);
        if (active) setAccess({ checking: false, allowed: false });
      }
    })();
    return () => { active = false; controller.abort(); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem("to_stock_portal_theme", dark ? "dark" : "light"); } catch { /* ignored */ }
  }, [dark]);

  useEffect(() => {
    if (!userEmail || !access.allowed) return;
    let mounted = true;
    const localProgress = safeRead(storageKey);
    progressRef.current = localProgress;
    setProgress(localProgress);
    // Prior portal loaded backend progress if available. Merge without erasing
    // newer local notes/positions when the backend is stale.
    const apiBase = import.meta.env.VITE_API_BASE;
    if (apiBase) {
      (async () => {
        try {
          const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/progress/${encodeURIComponent(userEmail)}`);
          if (!res.ok) throw new Error(`Progress service: ${res.status}`);
          const rows = await res.json();
          if (!Array.isArray(rows) || !mounted) return;
          const remote = {};
          rows.filter((row) => COURSE.classes.some((cls) => cls.id === row.classId)).forEach((row) => {
            remote[row.classId] = { note: row.note || "", time: Number(row.time) || 0, duration: Number(row.duration) || 0,
              completed: Boolean(row.completed), videoId: row.videoId || "" };
          });
          const combined = { ...remote, ...progressRef.current };
          progressRef.current = combined;
          setProgress(combined);
          localStorage.setItem(storageKey, JSON.stringify(combined));
        } catch (err) { console.warn("Keeping locally saved stock progress", err); }
      })();
    }
    return () => { mounted = false; };
  }, [userEmail, storageKey, access.allowed]);

  function patchProgress(classId, data) {
    const next = { ...progressRef.current,
      [classId]: { ...(progressRef.current[classId] || {}), ...data } };
    progressRef.current = next;
    setProgress(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* storage unavailable */ }
  }
  function resetProgress() {
    if (!window.confirm("Reset all Stock & Options progress and notes on this browser?")) return;
    progressRef.current = {};
    setProgress({});
    try { localStorage.removeItem(storageKey); } catch { /* ignored */ }
    setSelectedVideoKey(null);
  }
  function navigate(id) {
    setView(id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openClass(id) {
    setSelectedClassId(id);
    setSelectedVideoKey(null);
    navigate("classes");
  }

  useEffect(() => {
    // Leave the old video's player before changing class/section.
    setSelectedVideoKey(null);
    setResumeMessage("");
  }, [selectedClassId]);

  useEffect(() => {
    const container = playerMount.current;
    if (!access.allowed || view !== "classes" || !chosenVideo || !container) return;
    const iframe = document.createElement("iframe");
    iframe.src = chosenVideo.url;  // Original Vimeo embed URLs, unchanged.
    iframe.title = chosenVideo.title;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.className = "h-full w-full";
    container.replaceChildren(iframe);
    const player = new Player(iframe);
    playerInstance.current = player;
    let mounted = true;
    setResumeMessage("");
    const saved = progressRef.current[selectedClass.id] || {};
    // Vimeo ID can repeat across classes. Both lesson and video id are checked.
    player.ready().then(async () => {
      if (!mounted || saved.videoId !== chosenVideo.id || !Number(saved.time)) return;
      try { await player.setCurrentTime(Number(saved.time)); if (mounted) setResumeMessage("Playback resumed from your last saved position."); } catch { /* e.g. Vimeo embed restriction */ }
    }).catch(() => {});
    player.setVolume(1).catch(() => { if (mounted) setMuteHint(true); });
    const storeTime = async () => {
      try {
        const [time, duration] = await Promise.all([player.getCurrentTime(), player.getDuration()]);
        if (!mounted) return;
        const latest = progressRef.current[selectedClass.id] || {};
        patchProgress(selectedClass.id, { videoId: chosenVideo.id, time, duration,
          completed: Boolean(latest.completed) || (duration > 0 && time / duration >= 0.9) });
      } catch { /* ignored if player not ready */ }
    };
    // Event-based saving plus a short heartbeat for browsers that miss events.
    player.on("pause", storeTime);
    player.on("ended", storeTime);
    const interval = window.setInterval(storeTime, 5000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      player.off("pause", storeTime);
      player.off("ended", storeTime);
      player.destroy().catch(() => {});
      if (playerInstance.current === player) playerInstance.current = null;
      container.replaceChildren();
    };
  // patchProgress intentionally writes via refs and does not change this effect's dependencies.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access.allowed, selectedClass.id, chosenVideo?.uniqueKey, view, storageKey]);

  const colors = dark ? {
    page: "bg-[#071426] text-slate-50", header: "border-white/10 bg-[#0a192c]", panel: "border-white/10 bg-[#102037]",
    soft: "border-white/10 bg-[#14283f]", line: "border-white/10", muted: "text-slate-400",
    hover: "hover:bg-white/[0.06]", input: "border-white/10 bg-[#0a192c] text-white placeholder:text-slate-500",
  } : {
    page: "bg-[#f4f7fb] text-slate-900", header: "border-slate-200 bg-white", panel: "border-slate-200 bg-white",
    soft: "border-slate-200 bg-[#f7faff]", line: "border-slate-200", muted: "text-slate-500",
    hover: "hover:bg-blue-50", input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
  };
  const card = cn("rounded-[24px] border shadow-sm", colors.panel);
  const soft = cn("rounded-2xl border", colors.soft);
  const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a62d2] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#084da9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500";
  const noteCount = COURSE.classes.filter((item) => (progress[item.id]?.note || "").trim()).length;

  if (access.checking || !access.allowed) return <AccessState loading={access.checking} email={userEmail} />;

  return (
    <main className={cn("min-h-screen transition-colors duration-200", colors.page)}>
      {/* SAME top bar pattern as the classic blue/navy Splunk dashboard */}
      <header className={cn("border-b", colors.header)}>
        <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black text-white">T.O</div>
            <div className="min-w-0"><p className="truncate text-[15px] font-black">T.O Analytics</p>
              <p className={cn("text-[11px] font-semibold", colors.muted)}>Student learning campus</p></div>
            <span className={cn("ml-3 hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex", dark ? "bg-sky-300/10 text-sky-200" : "bg-blue-50 text-blue-700")}>Stocks & Options</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span title={userEmail} className={cn("hidden max-w-[230px] truncate text-xs font-semibold md:block", colors.muted)}>{userEmail}</span>
            <button type="button" onClick={() => setDark((x) => !x)} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", colors.line, colors.hover)}>{dark ? <FaSun /> : <FaMoon />}</button>
            <NavLink to="/dashboard" className={cn("rounded-xl border px-3 py-2.5 text-xs font-extrabold", colors.line, colors.hover)}>Dashboard ↗</NavLink>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:px-10 lg:py-9">
        {/* Blue sidebar matches the Splunk dashboard */}
        <aside className="min-w-0">
          <div className={cn("rounded-[24px] border p-4 lg:sticky lg:top-6", colors.panel)}>
            <div className={cn("mb-5 rounded-2xl p-4", dark ? "bg-[#1a3554]" : "bg-[#edf5ff]")}>
              <div className="flex items-center gap-2 text-sky-500"><FaGraduationCap /><span className="text-[11px] font-extrabold uppercase tracking-wider">Learning space</span></div>
              <h2 className="mt-2 text-base font-black leading-snug">Your trading journey</h2>
              <p className={cn("mt-2 text-xs leading-5", colors.muted)}>Stock & Options Mastery</p>
            </div>
            <p className={cn("mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em]", colors.muted)}>Workspace</p>
            <nav aria-label="Stock course navigation" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {MENU.map(({ id, label, Icon }) => (
                <button key={id} type="button" onClick={() => navigate(id)} aria-current={view === id ? "page" : undefined}
                  className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm",
                    view === id ? "bg-[#0a62d2] text-white shadow-md shadow-blue-800/10" : cn(colors.hover, colors.muted))}>
                  <Icon className="shrink-0"/><span>{label}</span>{view === id && <FaArrowRight className="ml-auto hidden text-[10px] lg:block"/>}
                </button>
              ))}
            </nav>
            <div className={cn("mt-5 border-t pt-5", colors.line)}>
              <div className="flex justify-between"><span className="text-xs font-bold">Your progress</span><span className="text-xs font-black text-[#298fd3]">{progressPercent}%</span></div>
              <div className={cn("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}>
                <div className="h-full rounded-full bg-[#1688dc]" style={{ width: `${progressPercent}%` }}/></div>
              <p className={cn("mt-2 text-[11px]", colors.muted)}>{done} of {COURSE.classes.length} classes completed</p>
            </div>
            <div className={cn("mt-5 border-t pt-5", colors.line)}>
              <button type="button" onClick={resetProgress} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 px-3 py-3 text-xs font-extrabold text-red-500 hover:bg-red-500/10">
                <FaRotateRight /> Reset my progress</button>
            </div>
            <div className={cn("mt-5 border-t pt-5", colors.line)}>
              <a href={`mailto:${SUPPORT_EMAIL}`} className={cn("block rounded-xl border px-3 py-3 text-center text-xs font-bold", colors.line, colors.hover)}>Need help? Contact support</a>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {view === "overview" && <>
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
              <div className="pointer-events-none absolute -right-14 -top-28 h-[310px] w-[310px] rounded-full border-[52px] border-white/[0.045]"/>
              <div className="pointer-events-none absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl"/>
              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-sky-100"><FaGraduationCap/> Stocks & Options professional program</span>
                <h1 className="mt-6 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[42px]">Learn the market, one skill at a time.</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">Watch your existing market lessons, track video progress, read training documents, complete assignments and keep personal notes—all in one learning workspace.</p>
                <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => navigate("classes")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#083269] hover:bg-blue-50">Continue learning <FaArrowRight/></button>
                  <button type="button" onClick={() => navigate("syllabus")} className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white hover:bg-white/10">View syllabus</button></div>
              </div>
            </section>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Stock learning statistics">
              <StatCard Icon={FaLayerGroup} value={COURSE.classes.length} label="Available classes" detail="Current lesson library" dark={dark}/>
              <StatCard Icon={FaVideo} value={totalVideos} label="Published videos" detail="Vimeo class recordings" dark={dark}/>
              <StatCard Icon={FaCheck} value={done} label="Completed classes" detail="Based on your saved progress" dark={dark}/>
              <StatCard Icon={FaFileLines} value={resourceList.length} label="Learning documents" detail="Across all classes" dark={dark}/>
            </section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(270px,1fr)]">
              <section className={cn(card, "p-6 sm:p-7")}>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Your learning path</p>
                <h2 className="mt-2 text-xl font-black">Continue your Stock & Options course</h2>
                <p className={cn("mt-3 text-sm leading-6", colors.muted)}>Select a class to watch its lessons and access your saved notes.</p>
                <div className="mt-5 space-y-3">{COURSE.classes.map((item, i) => <button key={item.id} type="button" onClick={() => openClass(item.id)}
                  className={cn(soft, "flex w-full items-center gap-3 p-4 text-left transition", colors.hover)}>
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black", progress[item.id]?.completed ? "bg-emerald-500/15 text-emerald-500" : dark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700")}>{progress[item.id]?.completed ? <FaCheck/> : String(i + 1).padStart(2, "0")}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{item.title}</p><p className={cn("mt-1 text-xs", colors.muted)}>{percentFor(progress[item.id])}% completed</p></div>
                  <FaArrowRight className="shrink-0 text-blue-500"/>
                </button>)}</div>
              </section>
              <section className={cn(card, "flex flex-col p-6 sm:p-7")}>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Progress summary</p>
                <div className="mt-5 flex justify-center"><ProgressRing value={progressPercent} dark={dark}/></div>
                <p className={cn("mt-5 text-center text-sm leading-6", colors.muted)}>Track your completed classes and resume your videos where you left off.</p>
                <div className={cn("mt-5 grid grid-cols-2 gap-3 border-t pt-5", colors.line)}>
                  <div><p className="text-2xl font-black">{noteCount}</p><p className={cn("text-xs", colors.muted)}>Classes with notes</p></div>
                  <div><p className="text-2xl font-black">{COURSE.classes.length - done}</p><p className={cn("text-xs", colors.muted)}>Remaining</p></div>
                </div>
                <button type="button" onClick={() => navigate("classes")} className="mt-auto pt-5 text-left text-xs font-extrabold text-blue-500">Explore my classes →</button>
              </section>
            </div>
            {assignments.length > 0 && <section className={cn(card, "flex flex-wrap items-center gap-4 p-6 sm:p-7")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500"><FaClipboardList/></div>
              <div className="min-w-0 flex-1"><h2 className="text-base font-black">Assignment available</h2><p className={cn("mt-1 text-xs", colors.muted)}>{assignments[0].title} — your current course assignment</p></div>
              <button type="button" onClick={() => navigate("assignments")} className={primary}>View assignment <FaArrowRight/></button>
            </section>}
          </>}

          {view === "classes" && <>
            <div><p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Course library</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">My classes</h1>
              <p className={cn("mt-2 text-sm", colors.muted)}>Choose a week, watch the recording, open materials and take notes.</p></div>
            <div className="grid gap-5 xl:grid-cols-[minmax(230px,0.85fr)_minmax(0,1.6fr)]">
              <section className={cn(card, "self-start p-4")}>
                <label className={cn("flex items-center gap-3 rounded-xl border px-3 py-3", colors.input)}><FaMagnifyingGlass className={colors.muted}/>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..." aria-label="Search classes" className="min-w-0 w-full bg-transparent text-sm outline-none"/></label>
                <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
                  {filteredClasses.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedClassId(item.id); setSelectedVideoKey(null); }}
                    className={cn("w-full rounded-xl border p-3.5 text-left transition", item.id === selectedClassId ? dark ? "border-blue-400/40 bg-[#1c3b60]" : "border-blue-300 bg-blue-50" : cn(colors.line, colors.hover))}>
                    <div className="flex gap-3"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black", progress[item.id]?.completed ? "bg-emerald-500/15 text-emerald-500" : "bg-blue-600 text-white")}>{progress[item.id]?.completed ? <FaCheck/> : COURSE.classes.indexOf(item) + 1}</span>
                      <div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold leading-5">{item.title}</h3>
                        <p className={cn("mt-1.5 text-xs", colors.muted)}>{percentFor(progress[item.id])}% watched / complete</p>
                        <div className={cn("mt-3 h-1.5 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-200")}><div className="h-full rounded-full bg-blue-500" style={{width: `${percentFor(progress[item.id])}%`}}/></div>
                      </div>
                    </div>
                  </button>)}
                  {!filteredClasses.length && <p className={cn("p-4 text-xs", colors.muted)}>No lessons match your search.</p>}
                </div>
              </section>
              <div className="min-w-0 space-y-5">
                <section className={cn(card, "p-5 sm:p-6")}>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Week {classIndex + 1}</p>
                  <h2 className="mt-2 text-xl font-black sm:text-2xl">{selectedClass.title}</h2>
                  <p className={cn("mt-3 text-sm leading-7", colors.muted)}>{selectedClass.desc}</p>
                </section>
                <section className={cn(card, "p-5 sm:p-6")}>
                  <h3 className="mb-4 flex items-center gap-2 text-base font-black"><FaVideo className="text-blue-500"/> Video recordings</h3>
                  {videosIndexed.length ? <div className="grid gap-3 sm:grid-cols-2">{videosIndexed.map((video) =>
                    <button type="button" key={video.uniqueKey} onClick={() => setSelectedVideoKey(video.uniqueKey)}
                      className={cn("flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left transition", chosenVideo?.uniqueKey === video.uniqueKey ? dark ? "border-blue-400 bg-[#1b3a60]" : "border-blue-300 bg-blue-50" : cn(colors.line, colors.hover))}>
                      <FaCirclePlay className="shrink-0 text-2xl text-blue-500"/><span className="text-sm font-bold">{video.title}</span>
                    </button>)}</div> : <div className={cn(soft, "p-6 text-center text-sm", colors.muted)}>No video has been added to this class yet.</div>}
                  <div className="mt-5 aspect-video min-h-[210px] overflow-hidden rounded-2xl bg-black">
                    {chosenVideo ? <div ref={playerMount} className="h-full w-full"/> : <div className="flex h-full items-center justify-center px-4 text-center text-sm font-bold text-slate-400">Choose a video above to start watching</div>}
                  </div>
                  {chosenVideo && <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4", colors.soft)}>
                    <div><p className="text-sm font-extrabold">{chosenVideo.title}</p>
                      {resumeMessage && <p className="mt-1 text-xs text-emerald-500">{resumeMessage}</p>}
                      {muteHint && <p className="mt-1 text-xs text-amber-500">Use the player controls to adjust volume if needed.</p>}</div>
                    <span className={cn("text-xs", colors.muted)}>Playback saves automatically</span>
                  </div>}
                  <button type="button" onClick={() => patchProgress(selectedClass.id, {completed: true})}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700"><FaCheck/> Mark class completed</button>
                </section>
                <section className={cn(card, "p-5 sm:p-6")}>
                  <h3 className="flex items-center gap-2 text-base font-black"><FaFileLines className="text-blue-500"/> Class materials</h3>
                  {docs.length ? <div className="mt-4 space-y-2">{docs.map((doc, index) => <a key={`${selectedClass.id}-${index}`} href={doc.url} target="_blank" rel="noopener noreferrer" className={cn(soft, "flex items-center justify-between gap-3 p-4 text-sm font-bold", colors.hover)}>
                    <span>{doc.title}</span><FaArrowRight className="shrink-0 text-blue-500"/></a>)}</div>
                    : <p className={cn("mt-3 text-sm", colors.muted)}>No materials have been published for this class.</p>}
                </section>
                <section className={cn(card, "p-5 sm:p-6")}>
                  <h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-blue-500"/> Personal lesson notes</h3>
                  <p className={cn("mt-2 text-xs leading-6", colors.muted)}>Notes are saved in this browser under your student email.</p>
                  <textarea value={progress[selectedClass.id]?.note || ""} onChange={(e) => patchProgress(selectedClass.id, {note: e.target.value})}
                    placeholder="Write your trading lessons, questions and observations..." rows={6}
                    className={cn("mt-4 w-full resize-y rounded-xl border p-4 text-sm leading-6 outline-none focus:border-blue-400", colors.input)}/>
                  <p className={cn("mt-2 text-right text-[11px]", colors.muted)}>Autosaved on this device</p>
                </section>
              </div>
            </div>
          </>}

          {view === "syllabus" && <>
            <div><p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Training roadmap</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Full Stock & Options Syllabus</h1>
              <p className={cn("mt-2 text-sm", colors.muted)}>The current weekly lessons and published resources.</p></div>
            <div className="space-y-4">{fullStockSyllabus.map((week) => <section key={week.week} className={cn(card, "p-6 sm:p-7")}>
              <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">{week.week}</div>
                <div className="min-w-0 flex-1"><p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Week {week.week}</p>
                  <h2 className="mt-2 text-xl font-black">{week.title}</h2><p className={cn("mt-2 text-sm leading-7", colors.muted)}>{week.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold"><span>{week.videos.filter((v) => !!v.url).length} video(s)</span><span>·</span><span>{week.docs.filter((d) => d.title && d.url).length} document(s)</span></div>
                  <button type="button" onClick={() => openClass(COURSE.classes[week.week - 1].id)} className={cn(primary, "mt-5")}>Open week {week.week} <FaArrowRight/></button>
                </div></div>
            </section>)}</div>
          </>}

          {view === "assignments" && <>
            <div><p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Your coursework</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Assignments</h1><p className={cn("mt-2 text-sm", colors.muted)}>Assignments published for Stock & Options students.</p></div>
            {assignments.length ? assignments.map((assignment) => <section key={assignment.id} className={cn(card, "p-6 sm:p-7")}>
              <div className="flex flex-wrap items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500"><FaClipboardList/></div>
                <div className="min-w-0 flex-1"><h2 className="text-lg font-black">{assignment.title}</h2><p className={cn("mt-2 text-sm leading-7", colors.muted)}>{assignment.description}</p>
                  <a href={assignment.url} target="_blank" rel="noopener noreferrer" className={cn(primary, "mt-5")}>View assignment <FaArrowRight/></a></div>
              </div></section>) : <section className={cn(card, "p-7 text-center text-sm", colors.muted)}>No assignments available yet.</section>}
          </>}

          {view === "resources" && <>
            <div><p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Learning material</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Resources</h1><p className={cn("mt-2 text-sm", colors.muted)}>A single library of all current course documents.</p></div>
            <section className={cn(card, "p-6 sm:p-7")}>
              {resourceList.length ? <div className="space-y-3">{resourceList.map((doc) => <a key={doc.uniqueKey} href={doc.url} target="_blank" rel="noopener noreferrer"
                className={cn(soft, "flex items-center gap-3 p-4 text-left transition", colors.hover)}>
                <FaFileLines className="shrink-0 text-blue-500"/>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{doc.title}</span><span className={cn("mt-1 block text-xs", colors.muted)}>{doc.source}</span></span>
                <FaArrowRight className="shrink-0 text-blue-500"/>
              </a>)}</div> : <p className={cn("text-sm", colors.muted)}>No documents published.</p>}
            </section>
          </>}

          <footer className={cn("flex flex-wrap items-center justify-between gap-3 border-t py-5 text-xs", colors.line, colors.muted)}>
            <span><strong>T.O Analytics LLC</strong> · Stocks & Options Mastery</span>
            <span>Progress and notes saved locally · <a className="hover:text-blue-500" href={`mailto:${SUPPORT_EMAIL}`}>Support</a></span>
          </footer>
        </div>
      </div>

      {assignmentNotice && assignments.length > 0 && <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm rounded-2xl border border-blue-300/20 bg-[#0a254a] p-5 text-white shadow-2xl">
        <button type="button" onClick={() => setAssignmentNotice(false)} aria-label="Dismiss assignment notification" className="absolute right-3 top-3 rounded-full p-2 text-slate-300 hover:bg-white/10"><FaXmark/></button>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-300">Assignment available</p>
        <h2 className="mt-2 pr-6 text-base font-black">{assignments[0].title}</h2>
        <p className="mt-2 text-xs leading-6 text-slate-300">Your Stock & Options assignment is ready to view.</p>
        <button type="button" onClick={() => { setAssignmentNotice(false); navigate("assignments"); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-900">View assignment <FaArrowRight/></button>
      </div>}
    </main>
  );
}

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Player from "@vimeo/player";
// import { NavLink } from "react-router-dom";
// import {
//   FaArrowRight,
//   FaBookOpen,
//   FaChartLine,
//   FaCheck,
//   FaCirclePlay,
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

// // import DashboardDropdown from "./Dropdown";

// // import DropdownStock from "./DropdownStock "
// import AlpacaTest from "./AlpacaTest";
// // Stock & Options content. This portal uses the same student experience as
// // the Splunk portal: searchable classes, embedded Vimeo lessons, class
// // materials, notes, syllabus and saved progress.
// const stockCourses = [
//   {
//     id: "stock-options",
//     title: "Stock & Options Mastery",
//     classes: [
//       {
//         id: "stock-week1",
//         title: "Week 1 — Introduction to the Stock Market",
//         desc: "Understand stocks, shares, exchanges, market participants and how the stock market operates.",
//         videos: [
//           {
//             id: "stock-v1",
//             title: "Understanding How The Stock Market Works",
//             url: "https://player.vimeo.com/video/1225104800",
//             // url: "https://player.vimeo.com/video/1157909911",
//           },
//         ],
//         docs: [
//           {
//             id: "stock-d1",
//             title: "Stocks and Shares Guide",
//             url:"https://drive.google.com/file/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
//             // url:"https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
//             // url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview",
//           },
//         ],
//       },
//       {
//         id: "stock-week2",
//         title:"week 2 - Penny Stocks trading",
//         // title: "Week 2 — Options Trading Fundamentals",
//         desc: "Learn calls, puts, contracts, strike prices, expiration dates and foundational options strategies.",
//         videos: [
//           {
//             id: "stock-v2",
//             title: "Calls vs Puts Explained",
//             url: "https://player.vimeo.com/video/1227099002",
//           },  
//         ],
//         docs: [
//           {
//             id: "stock-d2",
//             title: "Options Trading Notes",
//             url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview",
//           },
//         ],
//       },
//       {
//         id: "stock-week3",
//         title: "Week 3 — Technical Analysis & Indicators",
//         desc: "Study candlestick patterns, market structure, RSI, MACD and common trading indicators.",
//         videos: [ 
//           {
//             id: "stock-v2",
//             title: "Calls vs Puts Explained",
//             url: "https://player.vimeo.com/video/1228532691",
//           },  
//         ],
//         docs: [

//            {
//             id: "stock-d2",
//             title: "WEBULL APP TUTORIAL",
//             url: "https://docs.google.com/presentation/d/1P4cxP8rw-ywUsIZSD9koBpZ7My5Vu9Uu/edit?usp=sharing&ouid=104718481266065502968&rtpof=true&sd=true",
//           },
//         ],
//       },
//     ],
//   },
// ];

// // Assignments are independent from weekly lessons.
// // Add every new student assignment to this collection.
// const stockAssignments = [
//   {
//     id: "stock-assignment1",
//     title: "Stock Assignment",
//     description:
//       "Complete the stock-market analysis exercise using the instructions in the assignment document.",
//     // url: "https://drive.google.com/file/d/1BO7OuUkUy__ZY4lbnZqxkqVxwxogZnv3/preview",
//     url:"https://drive.google.com/file/d/1dPYZ8xpWx1HysKzDlurrya0O4LN7H13_/view?usp=sharing",
//     status: "available",
//   },
// ];

// const fullStockSyllabus = stockCourses
//   .find((c) => c.id === "stock-options")
//   .classes.map((cls, index) => ({
//     week: index + 1,
//     title: cls.title,
//     desc: cls.desc || "Stock and options lesson content.",
//     videos: cls.videos || [],
//     docs: cls.docs || [],
//   }));

// function storageProgressKey(email) {
//   return `stock_options_progress_${(email || "").toLowerCase().trim()}`;
// }

// function normalizeEmail(raw) {
//   try {
//     if (!raw) return "";

//     const parsed = JSON.parse(raw);
//     return (parsed?.email || raw).toLowerCase().trim();
//   } catch {
//     return (raw || "").toLowerCase().trim();
//   }
// }

// function getClassProgress(progress) {
//   if (!progress) return 0;

//   if (progress.completed) return 100;

//   if (progress.time && progress.duration) {
//     return Math.min((progress.time / progress.duration) * 100, 100);
//   }

//   return progress.time ? 12 : 0;
// }

// function AssignmentToast({ show, onClose, onOpen }) {
//   if (!show) return null;

//   return (
//     <div className="fixed bottom-6 right-6 z-50 w-[92%] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
//       <button
//         onClick={onClose}
//         className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white hover:text-slate-950"
//       >
//         <FaXmark />
//       </button>

//       <div className="flex gap-4 pr-8">
//         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-BLUE text-white">
//           <FaFileLines />
//         </div>

//         <div>
//           <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
//             New Assignment
//           </p>
//           <h2 className="mt-1 text-lg font-black">
//             New assignment has been released!
//           </h2>
//           <p className="mt-2 text-sm leading-6 text-white/60">
//             Your Stock Market Analysis Assignment is ready to view.
//           </p>
//           <button
//             onClick={onOpen}
//             className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-BLUE transition hover:-translate-y-0.5"
//           >
//             View Assignment
//             <FaArrowRight />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function AccessDenied({ userEmail }) {
//   return (
//     <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-16 text-white">
//       <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-BLUE/35 blur-[140px]" />
//       <div className="absolute bottom-[-220px] right-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/20 blur-[150px]" />
//       <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

//       <div className="relative z-10 w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10">
//         <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/15 text-3xl text-red-300">
//           <FaLock />
//         </div>

//         <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-red-300">
//           Access Denied
//         </p>

//         <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
//           Learning Portal Locked
//         </h1>

//         <p className="mx-auto mt-5 max-w-md text-base font-medium leading-8 text-white/65">
//           This page is restricted to authorized T.O Analytics members only.
//           Please log in with an approved student account.
//         </p>

//         <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
//           <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
//             Current Account
//           </p>
//           <p className="mt-2 break-all text-sm font-bold text-white/80">
//             {userEmail || "No account detected"}
//           </p>
//         </div>

//         <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//           {/* <NavLink
//             to="/login"
//             className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition hover:-translate-y-1"
//           >
//             Login
//           </NavLink> */}

//           <NavLink
//             to="/"
//             className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-BLUE"
//           >
//             please contact the admin for support ,t.oanalyticsllc@gmail.com
//           </NavLink>
//         </div>
//       </div>
//     </main>
//   );
// }

// function SyllabusSection({ onSelectClass }) {
//   return (
//     <div className="space-y-5">
//       {fullStockSyllabus.map((week, index) => {
//         const validVideos = (week.videos || []).filter((v) => v?.url);
//         const validDocs = (week.docs || []).filter((d) => d?.url && d?.title);

//         return (
//           <div
//             key={index}
//             className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.09]"
//           >
//             <div className="absolute right-5 top-5 text-7xl font-black text-white/[0.03]">
//               {week.week}
//             </div>

//             <div className="relative z-10 flex gap-4">
//               <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-BLUE text-lg font-black text-white">
//                 {week.week}
//               </div>

//               <div className="flex-1">
//                 <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
//                   Week {week.week}
//                 </p>

//                 <h3 className="mt-2 text-xl font-black text-white">
//                   {week.title}
//                 </h3>

//                 <p className="mt-2 text-sm font-medium leading-7 text-white/55">
//                   {week.desc}
//                 </p>

//                 <div className="mt-5 grid gap-3 md:grid-cols-2">
//                   <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
//                     <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
//                       <FaVideo className="text-cyan-200" />
//                       Videos
//                     </div>

//                     {validVideos.length ? (
//                       <div className="space-y-2">
//                         {validVideos.map((video, i) => (
//                           <a
//                             key={i}
//                             href={video.url}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="block rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white hover:text-BLUE"
//                           >
//                             {video.title || "Class Video"}
//                           </a>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-xs font-semibold text-white/35">
//                         No videos attached yet
//                       </p>
//                     )}
//                   </div>

//                   <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
//                     <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
//                       <FaFileLines className="text-cyan-200" />
//                       Documents
//                     </div>

//                     {validDocs.length ? (
//                       <div className="space-y-2">
//                         {validDocs.map((doc, i) => (
//                           <a
//                             key={i}
//                             href={doc.url}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="block rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white hover:text-BLUE"
//                           >
//                             {doc.title}
//                           </a>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-xs font-semibold text-white/35">
//                         No documents attached yet
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => onSelectClass(index)}
//                   className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-BLUE transition hover:-translate-y-1"
//                 >
//                   Open Week {week.week}
//                   <FaArrowRight />
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default function StockOptionsCoursePortal() {
//   const [showNewAssignmentAlert, setShowNewAssignmentAlert] = useState(true);
//   const [darkMode, setDarkMode] = useState(true);

//   const [courses] = useState(stockCourses);
//   const [selectedCourse, setSelectedCourse] = useState(stockCourses[0]);
//   const [selectedClass, setSelectedClass] = useState(
//     stockCourses[0].classes[0],
//   );
//   const [selectedVideo, setSelectedVideo] = useState(null);

//   const [showSyllabus, setShowSyllabus] = useState(false);
//   const [classSearch, setClassSearch] = useState("");
//   const [thumbnails, setThumbnails] = useState({});
//   const [loadingThumbs, setLoadingThumbs] = useState(false);

//   const [userEmail, setUserEmail] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false);
//   const [checkingAccess, setCheckingAccess] = useState(true);
//   const [progressState, setProgressState] = useState({});
//   const [isMutedHint, setIsMutedHint] = useState(false);

//   const playerRef = useRef(null);
//   const vimeoPlayerRef = useRef(null);

//   const selectedClassVideos = useMemo(
//     () => (selectedClass?.videos || []).filter((v) => v?.url),
//     [selectedClass],
//   );

//   const selectedClassDocs = useMemo(
//     () => (selectedClass?.docs || []).filter((d) => d?.title && d?.url),
//     [selectedClass],
//   );

//   const courseAssignments = useMemo(
//     () =>
//       stockAssignments.filter(
//         (assignment) =>
//           assignment?.status === "available" &&
//           assignment?.title &&
//           assignment?.url,
//       ),
//     [],
//   );

//   const filteredClasses = useMemo(() => {
//     const search = classSearch.toLowerCase();

//     return selectedCourse.classes.filter((item) =>
//       item.title.toLowerCase().includes(search),
//     );
//   }, [selectedCourse, classSearch]);

//   const completedCount = useMemo(() => {
//     return selectedCourse.classes.filter(
//       (item) => progressState[item.id]?.completed,
//     ).length;
//   }, [selectedCourse, progressState]);

//   const totalClasses = selectedCourse.classes.length;
//   const totalVideos = selectedCourse.classes.reduce(
//     (sum, item) =>
//       sum + (item.videos || []).filter((video) => video?.url).length,
//     0,
//   );

//   const courseProgress = totalClasses
//     ? Math.round((completedCount / totalClasses) * 100)
//     : 0;

//   // useEffect(() => {
//   //   const rawUser = localStorage.getItem("user") || "";
//   //   const normalized = normalizeEmail(rawUser);

//   //   setUserEmail(normalized);

//   //   setIsAllowed(
//   //     allowedEmails
//   //       .map((email) => email.toLowerCase().trim())
//   //       .includes(normalized),
//   //   );

//   //   async function fetchProgress() {
//   //     if (!normalized) return;

//   //     try {
//   //       const res = await fetch(
//   //         `${import.meta.env.VITE_API_BASE}/api/progress/${normalized}`,
//   //       );

//   //       if (!res.ok) throw new Error("Failed to fetch backend progress");

//   //       const data = await res.json();

//   //       const mapped = {};
//   //       data.forEach((p) => {
//   //         mapped[p.classId] = {
//   //           note: p.note || "",
//   //           time: p.time || 0,
//   //           duration: p.duration || 0,
//   //           completed: p.completed || false,
//   //           videoId: p.videoId || "",
//   //         };
//   //       });

//   //       setProgressState(mapped);
//   //       localStorage.setItem(
//   //         storageProgressKey(normalized),
//   //         JSON.stringify(mapped),
//   //       );
//   //     } catch (err) {
//   //       try {
//   //         const saved = JSON.parse(
//   //           localStorage.getItem(storageProgressKey(normalized)) || "{}",
//   //         );
//   //         setProgressState(saved || {});
//   //       } catch {
//   //         setProgressState({});
//   //       }
//   //     }
//   //   }

//   //   fetchProgress();
//   // }, []);


//   useEffect(() => {
//   let componentIsActive = true;

//   const rawUser = localStorage.getItem("user") || "";
//   const normalized = normalizeEmail(rawUser);

//   setUserEmail(normalized);

//   async function checkStudentAccess() {
//     if (!normalized) {
//       if (componentIsActive) {
//         setIsAllowed(false);
//         setCheckingAccess(false);
//       }

//       return;
//     }

//     try {
//       const response = await fetch("/api/check-student-access", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: normalized,
//           courseId: "stock-options",
//         }),
//       });

//       let result = null;

//       try {
//         result = await response.json();
//       } catch {
//         result = null;
//       }

//       if (!response.ok) {
//         throw new Error(
//           result?.error || "Unable to check student access.",
//         );
//       }

//       if (componentIsActive) {
//         setIsAllowed(result?.allowed === true);
//       }
//     } catch (error) {
//       console.error("Student access check failed:", error);

//       if (componentIsActive) {
//         setIsAllowed(false);
//       }
//     } finally {
//       if (componentIsActive) {
//         setCheckingAccess(false);
//       }
//     }
//   }

//   async function fetchProgress() {
//     if (!normalized) return;

//     try {
//       const apiBase = import.meta.env.VITE_API_BASE;

//       if (!apiBase) {
//         throw new Error("Progress API is not configured.");
//       }

//       const response = await fetch(
//         `${apiBase}/api/progress/${encodeURIComponent(normalized)}`,
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch backend progress.");
//       }

//       const data = await response.json();

//       const mapped = {};

//       if (Array.isArray(data)) {
//         data.forEach((progress) => {
//           mapped[progress.classId] = {
//             note: progress.note || "",
//             time: progress.time || 0,
//             duration: progress.duration || 0,
//             completed: progress.completed || false,
//             videoId: progress.videoId || "",
//           };
//         });
//       }

//       if (componentIsActive) {
//         setProgressState(mapped);
//       }

//       localStorage.setItem(
//         storageProgressKey(normalized),
//         JSON.stringify(mapped),
//       );
//     } catch (error) {
//       console.warn(
//         "Backend progress unavailable. Using local progress:",
//         error,
//       );

//       try {
//         const saved = JSON.parse(
//           localStorage.getItem(storageProgressKey(normalized)) || "{}",
//         );

//         if (componentIsActive) {
//           setProgressState(saved || {});
//         }
//       } catch {
//         if (componentIsActive) {
//           setProgressState({});
//         }
//       }
//     }
//   }

//   checkStudentAccess();
//   fetchProgress();

//   return () => {
//     componentIsActive = false;
//   };
// }, []);

//   useEffect(() => {
//     async function fetchThumbs() {
//       setLoadingThumbs(true);

//       const vmap = {};
//       const videos = selectedClassVideos;

//       await Promise.all(
//         videos.map(async (video) => {
//           if (video.thumbnail) {
//             vmap[video.id] = video.thumbnail;
//             return;
//           }

//           try {
//             const videoUrl = video.url.includes("vimeo.com")
//               ? video.url.replace("player.", "")
//               : video.url;

//             const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
//               videoUrl,
//             )}`;

//             const res = await fetch(oembed);

//             if (!res.ok) throw new Error("No oEmbed");

//             const data = await res.json();
//             vmap[video.id] = data.thumbnail_url || null;
//           } catch {
//             vmap[video.id] = null;
//           }
//         }),
//       );

//       setThumbnails(vmap);
//       setLoadingThumbs(false);
//     }

//     fetchThumbs();
//   }, [selectedClassVideos]);

//   useEffect(() => {
//     if (!selectedVideo) {
//       if (playerRef.current) playerRef.current.innerHTML = "";
//       return;
//     }

//     if (vimeoPlayerRef.current) {
//       try {
//         vimeoPlayerRef.current.unload?.();
//         vimeoPlayerRef.current.destroy?.();
//       } catch {}
//       vimeoPlayerRef.current = null;
//     }

//     const iframe = document.createElement("iframe");
//     iframe.setAttribute("src", `${selectedVideo.url}?transparent=0&autoplay=0`);
//     iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
//     iframe.setAttribute("frameborder", "0");
//     iframe.className = "h-full w-full";

//     if (playerRef.current) {
//       playerRef.current.innerHTML = "";
//       playerRef.current.appendChild(iframe);
//     }

//     const player = new Player(iframe);
//     vimeoPlayerRef.current = player;

//     player.setVolume(1).catch(() => setIsMutedHint(true));

//     try {
//       const saved = JSON.parse(
//         localStorage.getItem(storageProgressKey(userEmail)) || "{}",
//       );

//       const cls = saved[selectedClass.id] || {};

//       if (cls.videoId === selectedVideo.id && cls.time > 0) {
//         player
//           .ready()
//           .then(() => player.setCurrentTime(cls.time).catch(() => {}));
//       }
//     } catch {}

//     const interval = setInterval(async () => {
//       try {
//         const time = await player.getCurrentTime();
//         const duration = await player.getDuration();

//         updateVideoProgress(selectedClass.id, selectedVideo.id, time, duration);
//       } catch {}
//     }, 3000);

//     const onPlay = () => setIsMutedHint(false);
//     player.on("play", onPlay);

//     return () => {
//       clearInterval(interval);

//       try {
//         player.off("play", onPlay);
//         player.unload?.();
//         player.destroy?.();
//       } catch {}

//       vimeoPlayerRef.current = null;
//     };
//   }, [selectedVideo, selectedClass, userEmail]);

//   useEffect(() => {
//     setSelectedVideo(null);

//     try {
//       const saved = JSON.parse(
//         localStorage.getItem(storageProgressKey(userEmail)) || "{}",
//       );

//       const cls = saved[selectedClass.id] || {};

//       if (cls.videoId) {
//         const found = selectedClass.videos.find((v) => v.id === cls.videoId);
//         if (found) setSelectedVideo(found);
//       }
//     } catch {}
//   }, [selectedClass, userEmail]);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   function updateVideoProgress(classId, videoId, timeSec, durationSec) {
//     const email = userEmail || "anonymous";
//     const key = storageProgressKey(email);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");

//     prev[classId] = {
//       ...(prev[classId] || {}),
//       videoId,
//       time: timeSec,
//       duration: durationSec,
//       completed:
//         durationSec > 0 && timeSec / durationSec >= 0.9
//           ? true
//           : prev[classId]?.completed || false,
//     };

//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function markClassCompleted(classId) {
//     const email = userEmail || "anonymous";
//     const key = storageProgressKey(email);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");

//     prev[classId] = {
//       ...(prev[classId] || {}),
//       completed: true,
//     };

//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function updateNote(note) {
//     const email = userEmail || "anonymous";
//     const key = storageProgressKey(email);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");

//     prev[selectedClass.id] = {
//       ...(prev[selectedClass.id] || {}),
//       note,
//     };

//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function resetProgress() {
//     localStorage.removeItem(storageProgressKey(userEmail));
//     setProgressState({});
//   }

//   function handleSelectClass(classItem) {
//     setSelectedClass(classItem);
//     setShowSyllabus(false);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   function openAssignment(assignment) {
//     setShowNewAssignmentAlert(false);
//     window.open(assignment.url, "_blank", "noopener,noreferrer");
//   }


//   if (checkingAccess) {
//   return (
//     <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 text-white">
//       <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-BLUE/30 blur-[140px]" />

//       <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-purple-500/20 blur-[150px]" />

//       <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl">
//         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
//           <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-300" />
//         </div>

//         <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
//           Student verification
//         </p>

//         <h1 className="mt-3 text-2xl font-black">
//           Checking your portal access
//         </h1>

//         <p className="mt-3 text-sm leading-6 text-white/55">
//           Please wait while your student account is being verified.
//         </p>
//       </div>
//     </main>
//   );
// }

// if (!isAllowed) {
//   return <AccessDenied userEmail={userEmail} />;
// }
 
//   return (
//     <main className="relative min-h-screen overflow-hidden bg-[#050816] p-4 text-white md:p-6">
//       <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/35 blur-[140px]" />
//       <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-cyan-400/20 blur-[150px]" />
//       <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[170px]" />
//       <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

//       <AssignmentToast
//         show={showNewAssignmentAlert}
//         onClose={() => setShowNewAssignmentAlert(false)}
//         onOpen={() => courseAssignments[0] && openAssignment(courseAssignments[0])}
//       />

//       <div className="relative z-10 mx-auto max-w-[1600px]">
//         {/* HEADER */}
//         <header className="student-dashboard-header mb-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-6">
//           <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
//             <div className="min-w-0">
//               <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
//                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
//                   <FaGraduationCap />
//                 </span>
//                 <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-white/70 sm:text-xs sm:tracking-[0.25em]">
//                   T.O Analytics Learning Portal
//                 </span>
//               </div>

//               <h1 className="mt-5 text-3xl font-black tracking-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
//                 Stock & Options Mastery Dashboard
//               </h1>

//               <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-white/55 md:text-base">
//                 Watch classes, track progress, open documents, review syllabus,
//                 and write personal notes from one advanced student portal.
//               </p>
//             </div>

//             <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch xl:w-auto xl:items-center">
//               <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-1 xl:flex-none">
//                 <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
//                   Signed in as
//                 </p>
//                 <p className="mt-1 break-all text-sm font-bold text-white/80">
//                   {userEmail}
//                 </p>
//               </div>
//               {/* <DropdownStock /> */}




//               <button
//                 onClick={() => setDarkMode((prev) => !prev)}
//                 className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white hover:text-BLUE sm:w-auto"
//               >
//                 {darkMode ? <FaSun /> : <FaMoon />}
//                 {darkMode ? "Light Mode" : "Dark Mode"}
//               </button>
//             </div>
//           </div>

//           <div className="mt-6 grid gap-4 md:grid-cols-4">
//             <PortalStat
//               icon={<FaLayerGroup />}
//               value={totalClasses}
//               label="Classes"
//             />
//             <PortalStat icon={<FaVideo />} value={totalVideos} label="Videos" />
//             <PortalStat
//               icon={<FaCheck />}
//               value={`${completedCount}/${totalClasses}`}
//               label="Completed"
//             />
//             <PortalStat
//               icon={<FaChartLine />}
//               value={`${courseProgress}%`}
//               label="Progress"
//             />
//           </div>
//         </header>

//         <div className="grid grid-cols-12 gap-6">
//           {/* LEFT SIDEBAR */}
//           <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3">
//             <div className="mb-5">
//               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
//                 Navigation
//               </p>
//               <h2 className="mt-2 text-2xl font-black">Course Menu</h2>
//             </div>

//             <button
//               onClick={() => {
//                 setShowSyllabus(true);
//                 setSelectedVideo(null);
//               }}
//               className={`mb-4 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left font-black transition ${
//                 showSyllabus
//                   ? "bg-white text-BLUE"
//                   : "bg-white/5 text-white hover:bg-white/10"
//               }`}
//             >
//               <span className="flex items-center gap-3">
//                 <FaBookOpen />
//                 Full Syllabus
//               </span>
//               <FaArrowRight />
//             </button>

//             <div className="mb-4 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
//               <FaMagnifyingGlass className="text-white/35" />
//               <input
//                 value={classSearch}
//                 onChange={(e) => setClassSearch(e.target.value)}
//                 placeholder="Search classes..."
//                 className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
//               />
//             </div>

//             <div className="space-y-4">
//               {courses.map((course) => (
//                 <div key={course.id}>
//                   <button
//                     onClick={() => {
//                       setSelectedCourse(course);
//                       setSelectedClass(course.classes[0]);
//                       setShowSyllabus(false);
//                     }}
//                     className={`w-full rounded-2xl px-4 py-4 text-left font-black transition ${
//                       selectedCourse.id === course.id
//                         ? "bg-BLUE text-white"
//                         : "bg-white/5 text-white hover:bg-white/10"
//                     }`}
//                   >
//                     {course.title}
//                   </button>

//                   {selectedCourse.id === course.id && (
//                     <div className="mt-3 max-h-[560px] space-y-3 overflow-y-auto pr-1">
//                       {filteredClasses.map((classItem, index) => {
//                         const progress = progressState[classItem.id];
//                         const percent = getClassProgress(progress);

//                         return (
//                           <button
//                             key={`${classItem.id}-${index}`}
//                             onClick={() => handleSelectClass(classItem)}
//                             className={`w-full rounded-2xl border p-4 text-left transition ${
//                               selectedClass.id === classItem.id && !showSyllabus
//                                 ? "border-cyan-300/30 bg-white text-slate-950"
//                                 : "border-white/10 bg-white/5 text-white hover:bg-white/10"
//                             }`}
//                           >
//                             <div className="flex items-start gap-3">
//                               <span
//                                 className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
//                                   progress?.completed
//                                     ? "bg-emerald-500 text-white"
//                                     : selectedClass.id === classItem.id &&
//                                         !showSyllabus
//                                       ? "bg-BLUE text-white"
//                                       : "bg-white/10 text-white"
//                                 }`}
//                               >
//                                 {progress?.completed ? <FaCheck /> : index + 1}
//                               </span>

//                               <div className="flex-1">
//                                 <p className="text-sm font-black leading-6">
//                                   {classItem.title}
//                                 </p>

//                                 <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
//                                   <div
//                                     className={`h-full rounded-full ${
//                                       progress?.completed
//                                         ? "bg-emerald-500"
//                                         : "bg-BLUE"
//                                     }`}
//                                     style={{
//                                       width: `${Math.max(percent, 5)}%`,
//                                     }}
//                                   />
//                                 </div>

//                                 <p className="mt-2 text-xs font-semibold opacity-60">
//                                   {Math.round(percent)}% completed
//                                 </p>
//                               </div>
//                             </div>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 border-t border-white/10 pt-5">
//               <button
//                 onClick={resetProgress}
//                 className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white"
//               >
//                 <FaRotateRight />
//                 Reset My Progress
//               </button>
//             </div>
//           </aside>

//           {/* CENTER MAIN */}
//           <section className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-6 md:p-5">
//             {showSyllabus ? (
//               <>
//                 <div className="mb-6 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//                   <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
//                     Complete Roadmap
//                   </p>
//                   <h2 className="mt-3 text-3xl font-black">
//                     Full Stock & Options Training Syllabus
//                   </h2>
//                   <p className="mt-3 text-sm font-medium leading-7 text-white/55">
//                     Review the full training structure, weekly roadmap, videos
//                     and supporting documents.
//                   </p>
//                 </div>

//                 <SyllabusSection
//                   onSelectClass={(index) =>
//                     handleSelectClass(selectedCourse.classes[index])
//                   }
//                 />
//               </>
//             ) : (
//               <>
//                 <div className="mb-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//                   <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
//                     Current Class
//                   </p>

//                   <h2 className="mt-3 text-3xl font-black">
//                     {selectedClass.title}
//                   </h2>

//                   <p className="mt-3 text-sm font-medium leading-7 text-white/55">
//                     Select a video below to continue your lesson. Your watch
//                     progress is saved automatically.
//                   </p>
//                 </div>

//                 <div className="grid gap-4 md:grid-cols-2">
//                   {selectedClassVideos.length ? (
//                     selectedClassVideos.map((video) => (
//                       <button
//                         key={video.id}
//                         onClick={() => setSelectedVideo(video)}
//                         className={`group overflow-hidden rounded-[1.6rem] border text-left transition hover:-translate-y-1 ${
//                           selectedVideo?.id === video.id
//                             ? "border-cyan-300/40 bg-white text-slate-950"
//                             : "border-white/10 bg-white/5 text-white hover:bg-white/10"
//                         }`}
//                       >
//                         <div className="relative h-44 overflow-hidden bg-black">
//                           {thumbnails[video.id] ? (
//                             <img
//                               src={thumbnails[video.id]}
//                               alt={video.title}
//                               className="h-full w-full object-cover opacity-80 transition group-hover:scale-110 group-hover:opacity-100"
//                             />
//                           ) : (
//                             <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/35">
//                               {loadingThumbs
//                                 ? "Loading thumbnail..."
//                                 : "No thumbnail"}
//                             </div>
//                           )}

//                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

//                           <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-BLUE">
//                             <FaCirclePlay />
//                           </div>
//                         </div>

//                         <div className="p-4">
//                           <h4 className="font-black leading-6">
//                             {video.title || "Class Video"}
//                           </h4>
//                           <p className="mt-2 text-xs font-semibold opacity-55">
//                             Vimeo Video Lesson
//                           </p>
//                         </div>
//                       </button>
//                     ))
//                   ) : (
//                     <div className="col-span-2 rounded-[1.7rem] border border-white/10 bg-white/5 p-8 text-center">
//                       <FaVideo className="mx-auto text-4xl text-white/30" />
//                       <h3 className="mt-5 text-2xl font-black">
//                         No video available yet
//                       </h3>
//                       <p className="mt-2 text-sm text-white/50">
//                         This class does not currently have a video attached.
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black shadow-2xl">
//                   <div
//                     ref={playerRef}
//                     className="flex h-[260px] w-full items-center justify-center bg-black text-sm font-bold text-white/40 md:h-[460px]"
//                   >
//                     Choose a video to start
//                   </div>
//                 </div>

//                 <div className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
//                   <div>
//                     <p className="text-sm font-black text-white">
//                       {selectedVideo?.title || "No video selected"}
//                     </p>

//                     {isMutedHint && (
//                       <p className="mt-1 text-xs font-semibold text-yellow-200">
//                         Browser blocked volume control. Press play manually if
//                         needed.
//                       </p>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => markClassCompleted(selectedClass.id)}
//                     className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-emerald-400"
//                   >
//                     Mark Completed
//                   </button>
//                 </div>
//               </>
//             )}
//           </section>

//           {/* RIGHT SIDE */}
//           <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3 md:p-5">
//             <div className="mb-5 rounded-[1.7rem] border border-amber-300/30 bg-amber-400/10 p-5 shadow-lg shadow-amber-950/20">
//               <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-200">
//                 Assignment Center
//               </p>

//               <h3 className="mt-3 text-2xl font-black">
//                 {courseAssignments.length
//                   ? `${courseAssignments.length} Assignment${courseAssignments.length === 1 ? "" : "s"}`
//                   : "No Assignments Yet"}
//               </h3>

//               <div className="mt-5 space-y-3">
//                 {courseAssignments.length ? (
//                   courseAssignments.map((assignment) => (
//                     <button
//                       key={assignment.id}
//                       onClick={() => openAssignment(assignment)}
//                       className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-amber-300 p-4 text-left text-slate-950 transition hover:-translate-y-1 hover:bg-white"
//                     >
//                       <span>
//                         <span className="block text-sm font-black">
//                           {assignment.title}
//                         </span>
//                         <span className="mt-1 block text-xs font-bold opacity-60">
//                           Available now — open assignment
//                         </span>
//                       </span>
//                       <FaArrowRight className="shrink-0" />
//                     </button>
//                   ))
//                 ) : (
//                   <p className="text-sm font-medium leading-7 text-white/50">
//                     New assignments will appear here when released.
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
//                 Class Materials
//               </p>

//               <h3 className="mt-3 text-2xl font-black">Resources</h3>

//               <div className="mt-5 space-y-3">
//                 {showSyllabus ? (
//                   <p className="text-sm font-medium leading-7 text-white/50">
//                     Select a class from the syllabus or course menu to see
//                     documents here.
//                   </p>
//                 ) : selectedClassDocs.length ? (
//                   selectedClassDocs.map((doc, index) => (
//                     <a
//                       key={`${doc.id}-${index}`}
//                       href={doc.url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white hover:text-BLUE"
//                     >
//                       <span className="flex items-center gap-3 text-sm font-black">
//                         {doc.type === "assignment" ? "Assignment:" : <FaFileLines />}
//                         {doc.title}
//                       </span>

//                       <FaDownload className="opacity-50 transition group-hover:opacity-100" />
//                     </a>
//                   ))
//                 ) : (
//                   <p className="text-sm font-medium leading-7 text-white/50">
//                     No documents available currently.
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//               <div className="mb-4 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-BLUE">
//                   <FaNoteSticky />
//                 </div>

//                 <div>
//                   <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
//                     Personal
//                   </p>
//                   <h4 className="text-xl font-black">Notes</h4>
//                 </div>
//               </div>

//               <textarea
//                 className="h-48 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
//                 placeholder="Write your notes for this class..."
//                 value={progressState[selectedClass.id]?.note || ""}
//                 onChange={(e) => updateNote(e.target.value)}
//               />
//             </div>

//             <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
//               <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
//                 Progress Summary
//               </p>

//               <h3 className="mt-3 text-4xl font-black">{courseProgress}%</h3>

//               <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
//                 <div
//                   className="h-full rounded-full bg-BLUE"
//                   style={{ width: `${courseProgress}%` }}
//                 />
//               </div>

//               <div className="mt-5 grid grid-cols-2 gap-3">
//                 <MiniSummary label="Completed" value={completedCount} />
//                 <MiniSummary
//                   label="Remaining"
//                   value={totalClasses - completedCount}
//                 />
//               </div>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </main>
//   );
// }

// function PortalStat({ icon, value, label }) {
//   return (
//     <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
//       <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
//         {icon}
//       </div>

//       {/* <AlpacaTest /> */}

//       <h3 className="text-3xl font-black">{value}</h3>
//       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">
//         {label}
//       </p>
//     </div>
//   );
// }

// function MiniSummary({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//       <p className="text-xs font-black uppercase tracking-widest text-white/35">
//         {label}
//       </p>
//       <p className="mt-2 text-2xl font-black text-white">{value}</p>
//     </div>
//   );
// }



