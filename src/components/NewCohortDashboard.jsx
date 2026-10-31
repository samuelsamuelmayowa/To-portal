import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarDays,
  FaChartLine,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaCirclePlay,
  FaClock,
  FaComputer,
  FaDownload,
  FaFileLines,
  FaGraduationCap,
  FaHardDrive,
  FaLayerGroup,
  FaMagnifyingGlass,
  FaMoon,
  FaNoteSticky,
  FaRotateRight,
  FaServer,
  FaSun,
  FaVideo,
} from "react-icons/fa6";
import {
  CERTIFICATIONS,
  COHORT_ID,
  DEVELOPER_PROGRAM_URL,
  LESSONS,
  MILESTONES,
  ORIENTATION_SLIDES,
  ORIENTATION_URL,
  ORIENTATION_VIDEO,
  PREP_ITEMS,
  SERVER_URL,
  STUDY_HUB_URL,
  VM_ROLES,
  WEEKLY_CHECKINS,
  displayDate,
  easternToday,
} from "./splunk2026Data";

/**
 * T.O Analytics · Splunk Student Campus — classic UI, UPDATED program.
 * Every authenticated/enrolled Splunk student sees this SAME dashboard.
 * Its layout intentionally follows the original CoursePortal: blue/navy brand,
 * left sidebar, blue hero, progress cards, lesson library and dark/light theme.
 * The entire old class library is absent. Exactly ONE retained orientation video.
 * All 10 class recording/doc arrays are blank until new materials are published.
 * Old cp_progress_<email> keys are NOT read, modified, reset, or deleted.
 */

const MONTHS = ["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MENU = [
  { id: "overview", label: "Overview", icon: FaChartLine },
  { id: "orientation", label: "Orientation", icon: FaCirclePlay },
  { id: "lessons", label: "My classes", icon: FaBookOpen },
  { id: "roadmap", label: "Learning roadmap", icon: FaLayerGroup },
  { id: "calendar", label: "Class calendar", icon: FaCalendarDays },
  { id: "lab", label: "Personal lab", icon: FaServer },
  { id: "resources", label: "Resources", icon: FaFileLines },
];

const supportEmail = "t.oanalyticsllc@gmail.com";
const cn = (...values) => values.filter(Boolean).join(" ");

function readObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function useSavedRecords(storageKey) {
  const [items, setItems] = useState(() => readObject(storageKey));
  useEffect(() => setItems(readObject(storageKey)), [storageKey]);
  function patch(id, update) {
    setItems((previous) => {
      const next = { ...previous, [id]: { ...(previous[id] || {}), ...update } };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* private/incognito mode */ }
      return next;
    });
  }
  function reset() {
    setItems({});
    try { localStorage.removeItem(storageKey); } catch { /* storage disabled */ }
  }
  return [items, patch, reset];
}

function TextLabel({ children, dark }) {
  return <p className={cn("text-[11px] font-extrabold uppercase tracking-[0.18em]", dark ? "text-sky-300" : "text-blue-700")}>{children}</p>;
}

function Heading({ label, title, detail, dark }) {
  return <div className="mb-5">
    <TextLabel dark={dark}>{label}</TextLabel>
    <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
    {detail && <p className={cn("mt-2 max-w-3xl text-sm leading-7", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>}
  </div>;
}

function StatCard({ Icon, number, label, detail, dark }) {
  return <div className={cn("rounded-2xl border p-5 shadow-sm", dark ? "border-white/10 bg-[#111f34]" : "border-slate-200 bg-white")}>
    <div className="flex items-start justify-between gap-3">
      <div><p className={cn("text-xs font-semibold", dark ? "text-slate-400" : "text-slate-500")}>{label}</p>
        <p className="mt-2 text-3xl font-black tracking-tight tabular-nums">{number}</p></div>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg", dark ? "bg-[#1d3857] text-cyan-300" : "bg-blue-50 text-blue-700")}><Icon /></span>
    </div>
    <p className={cn("mt-4 text-[11px]", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>
  </div>;
}

function ProgressRing({ value, dark }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return <div className="relative h-[156px] w-[156px]">
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${value}% of classes completed`}>
      <circle cx="50" cy="50" r={radius} fill="none" stroke={dark ? "#293951" : "#e2e8f0"} strokeWidth="8" />
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#1688dc" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - value / 100)} />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black tabular-nums">{value}%</span>
      <span className={cn("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>completed</span></div>
  </div>;
}

function EmptyRecordings({ dark, detail = "New recordings will appear here when released by the instructor." }) {
  return <div className={cn("rounded-2xl border border-dashed px-6 py-9 text-center", dark ? "border-white/15 bg-white/[0.025]" : "border-slate-300 bg-slate-50/60")}>
    <FaVideo className={cn("mx-auto text-2xl", dark ? "text-sky-300" : "text-blue-600")} />
    <h3 className="mt-3 text-sm font-extrabold">No class recordings published yet</h3>
    <p className={cn("mx-auto mt-2 max-w-md text-xs leading-6", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>
  </div>;
}

function DateTile({ date, dark }) {
  return <div className={cn("flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl", dark ? "bg-sky-400/10 text-sky-200" : "bg-blue-50 text-blue-800")}>
    <span className="text-[9px] font-extrabold uppercase">{displayDate(date, { month: "short" })}</span>
    <span className="text-base font-black">{date.slice(-2)}</span>
  </div>;
}

function EventRows({ events, onSelect, dark }) {
  return events.length ? <div className="space-y-2">{events.map((item) =>
    <button key={item.id} type="button" onClick={() => onSelect(item.date)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition", dark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40")}>
      <DateTile date={item.date} dark={dark} />
      <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold sm:text-sm">{item.title}</span>
        <span className={cn("mt-1 block text-xs", dark ? "text-slate-400" : "text-slate-500")}>{item.detail}</span></span>
      <FaArrowRight className={cn("shrink-0 text-xs", dark ? "text-sky-300" : "text-blue-600")} />
    </button>)}</div>
    : <p className={cn("rounded-xl border border-dashed p-5 text-sm", dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>No official events scheduled for this period.</p>;
}

export default function NewCohortDashboard({ email = "" }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  // The unified program uses new keys, so 2025 progress remains untouched.
  const progressKey = `cp_progress_${COHORT_ID}_${normalizedEmail}`;
  const readinessKey = `cp_preparation_${COHORT_ID}_${normalizedEmail}`;
  const [progress, patchProgress, resetProgress] = useSavedRecords(progressKey);
  const [readiness, patchReadiness, resetReadiness] = useSavedRecords(readinessKey);
  const [view, setView] = useState("overview");
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("to_2026_portal_theme") === "dark"; } catch { return false; }
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(LESSONS[0].id);
  const [selectedDate, setSelectedDate] = useState(() => easternToday());
  const [monthIndex, setMonthIndex] = useState(() => {
    const month = easternToday().slice(0, 7);
    if (month < MONTHS[0]) return 0;
    if (month > MONTHS[MONTHS.length - 1]) return MONTHS.length - 1;
    return Math.max(0, MONTHS.indexOf(month));
  });

  useEffect(() => {
    try { localStorage.setItem("to_2026_portal_theme", dark ? "dark" : "light"); } catch { /* ignored */ }
  }, [dark]);

  const colors = dark ? {
    shell: "bg-[#071426] text-slate-50", header: "border-white/10 bg-[#0a192c]",
    panel: "border-white/10 bg-[#102037]", soft: "border-white/10 bg-[#14283f]",
    line: "border-white/10", muted: "text-slate-400", hover: "hover:bg-white/[0.065]",
    input: "border-white/10 bg-[#091a2d] text-slate-100 placeholder:text-slate-500",
  } : {
    shell: "bg-[#f4f7fb] text-slate-900", header: "border-slate-200 bg-white",
    panel: "border-slate-200 bg-white", soft: "border-slate-200 bg-[#f7faff]",
    line: "border-slate-200", muted: "text-slate-500", hover: "hover:bg-blue-50",
    input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
  };
  const card = cn("rounded-[24px] border shadow-sm", colors.panel);
  const panelSmall = cn("rounded-2xl border", colors.soft);
  const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a62d2] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#084da9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

  const today = easternToday();
  const completed = LESSONS.filter((lesson) => progress[lesson.id]?.completed).length;
  const percent = Math.round((completed / LESSONS.length) * 100);
  const readyCount = PREP_ITEMS.filter((item) => readiness[item.id]?.checked).length;
  const activeLesson = LESSONS.find((item) => item.id === selectedId) || LESSONS[0];
  const filteredLessons = LESSONS.filter((lesson) => `${lesson.title} ${lesson.description} ${lesson.evidence}`.toLowerCase().includes(query.trim().toLowerCase()));
  const month = MONTHS[monthIndex];
  const eventsThisMonth = MILESTONES.filter((item) => item.date.startsWith(month));
  const chosenEvents = MILESTONES.filter((item) => item.date === selectedDate);
  const chosenCheckin = WEEKLY_CHECKINS.includes(selectedDate);

  const calendarCells = useMemo(() => {
    const [year, mon] = month.split("-").map(Number);
    const offset = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
    const numberOfDays = new Date(Date.UTC(year, mon, 0)).getUTCDate();
    return Array.from({ length: Math.ceil((offset + numberOfDays) / 7) * 7 }, (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= numberOfDays ? `${month}-${String(day).padStart(2, "0")}` : null;
    });
  }, [month]);

  const changeView = (id) => { setView(id); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openLesson = (id) => { setSelectedId(id); changeView("lessons"); };
  const showDate = (date) => {
    setSelectedDate(date);
    const target = MONTHS.indexOf(date.slice(0, 7));
    if (target >= 0) setMonthIndex(target);
    changeView("calendar");
  };

  function resetCurrentProgram() {
    if (!window.confirm("Reset your CURRENT 2026–2027 class progress, notes and checklist on this device? Older saved course data will not be touched.")) return;
    resetProgress();
    resetReadiness();
  }

  function VideoPanel() {
    return <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      <iframe title={ORIENTATION_VIDEO.title} src={ORIENTATION_VIDEO.url}
        className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
    </div>;
  }

  function SlidesPanel() {
    return <div className={cn("overflow-hidden rounded-2xl border", colors.line)}>
      <iframe title="T.O Analytics official Splunk Orientation 2026 slides"
        src={`${ORIENTATION_SLIDES.pdf}#view=FitH`} loading="lazy"
        className="h-[440px] w-full bg-white sm:h-[660px]" />
    </div>;
  }

  return <main className={cn("min-h-screen transition-colors duration-200", colors.shell)}>
    {/* Original Campus top header and horizontal utility tools */}
    <header className={cn("border-b", colors.header)}>
      <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black tracking-tight text-white">T.O</div>
          <div className="min-w-0"><p className="truncate text-[15px] font-black tracking-tight">T.O Analytics</p>
            <p className={cn("text-[11px] font-semibold", colors.muted)}>Student learning campus</p></div>
          <span className={cn("ml-3 hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex", dark ? "bg-sky-300/10 text-sky-200" : "bg-blue-50 text-blue-700")}>Splunk 2026–2027</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span title={normalizedEmail} className={cn("hidden max-w-[230px] truncate text-xs font-semibold md:block", colors.muted)}>{normalizedEmail}</span>
          <button type="button" onClick={() => setDark((old) => !old)}
            className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", colors.line, colors.hover)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? <FaSun /> : <FaMoon />}</button>
          <NavLink to="/" className={cn("rounded-xl border px-3 py-2.5 text-xs font-extrabold", colors.line, colors.hover)}>Website ↗</NavLink>
        </div>
      </div>
    </header>

    <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:px-10 lg:py-9">
      {/* Original sticky campus sidebar */}
      <aside className="min-w-0">
        <div className={cn("rounded-[24px] border p-4 lg:sticky lg:top-6", colors.panel)}>
          <div className={cn("mb-5 rounded-2xl p-4", dark ? "bg-[#1a3554]" : "bg-[#edf5ff]")}>
            <div className="flex items-center gap-2 text-sky-500"><FaGraduationCap /><span className="text-[11px] font-extrabold uppercase tracking-wider">Learning space</span></div>
            <h2 className="mt-2 text-base font-black leading-snug">Your Splunk journey</h2>
            <p className={cn("mt-2 text-xs leading-5", colors.muted)}>One updated program · All enrolled students</p>
          </div>
          <p className={cn("mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em]", colors.muted)}>Workspace</p>
          <nav aria-label="Student navigation" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {MENU.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeView(id)}
              aria-current={view === id ? "page" : undefined}
              className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm", view === id ? "bg-[#0a62d2] text-white shadow-md shadow-blue-800/10" : cn(colors.hover, colors.muted))}>
              <Icon className="shrink-0" /><span>{label}</span>
              {view === id && <FaArrowRight className="ml-auto hidden text-[10px] lg:block" />}
            </button>)}
          </nav>
          <div className={cn("mt-5 border-t pt-5", colors.line)}>
            <div className="flex items-center justify-between"><span className="text-xs font-bold">Your progress</span>
              <span className="text-xs font-black text-[#298fd3]">{percent}%</span></div>
            <div className={cn("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}>
              <div className="h-full rounded-full bg-[#1688dc] transition-all" style={{ width: `${percent}%` }} /></div>
            <p className={cn("mt-2 text-[11px]", colors.muted)}>{completed} of {LESSONS.length} class sessions completed</p>
          </div>
          <div className={cn("mt-5 border-t pt-5", colors.line)}>
            <a href={`mailto:${supportEmail}`} className={cn("block rounded-xl border px-3 py-3 text-center text-xs font-bold", colors.line, colors.hover)}>Need help? Contact support</a>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        {view === "overview" && <>
          {/* Classic navy-to-blue original hero section */}
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
            <div className="pointer-events-none absolute -right-14 -top-28 h-[310px] w-[310px] rounded-full border-[52px] border-white/[0.045]" />
            <div className="pointer-events-none absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-sky-100"><FaGraduationCap /> 2026–2027 Splunk professional program</span>
              <h1 className="mt-6 max-w-2xl text-3xl font-black leading-[1.13] tracking-tight sm:text-4xl lg:text-[42px]">Build your Splunk career, one skill at a time.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">Start with your orientation video and the official 28-slide guide. Prepare for certifications, build your personal eight-VM lab and follow ten Saturday sessions from January to March 2027.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => changeView("orientation")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#083269] transition hover:bg-blue-50">Watch orientation <FaArrowRight /></button>
                <button onClick={() => changeView("roadmap")} className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">View roadmap</button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning statistics">
            <StatCard Icon={FaLayerGroup} number="10" label="Official sessions" detail="Jan 9 – Mar 13, 2027" dark={dark} />
            <StatCard Icon={FaVideo} number="01" label="Available recording" detail="Orientation video only" dark={dark} />
            <StatCard Icon={FaCheck} number={completed} label="Completed sessions" detail="Tracked separately for your account" dark={dark} />
            <StatCard Icon={FaFileLines} number="01" label="Official presentation" detail="28 orientation slides" dark={dark} />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
            <section className={cn(card, "p-6 sm:p-7")}>
              <TextLabel dark={dark}>Your next step</TextLabel>
              <h2 className="mt-3 text-xl font-black tracking-tight">Start with Splunk Orientation</h2>
              <p className={cn("mt-3 text-sm leading-6", colors.muted)}>Watch the single orientation video retained from the previous library and review the new official program presentation.</p>
              <div className={cn(panelSmall, "mt-5 flex flex-wrap items-center justify-between gap-3 p-4")}>
                <div><p className="text-xs font-extrabold">1 recording available</p><p className={cn("mt-1 text-xs", colors.muted)}>2026–2027 Orientation · 28 slides</p></div>
                <button onClick={() => changeView("orientation")} className={primary}>Open orientation <FaArrowRight /></button>
              </div>
              <div className="mt-7 flex items-center justify-between gap-3"><h3 className="text-base font-black">Learning path</h3><button onClick={() => changeView("roadmap")} className="text-xs font-bold text-blue-500 hover:underline">Full roadmap →</button></div>
              <div className="mt-4 space-y-3">
                {[
                  { number: "01", title: "Certification preparation", dates: "Oct – Dec 2026", detail: "Power User then Enterprise Admin" },
                  { number: "02", title: "Distributed Splunk lab", dates: "Jan – Mar 2027", detail: "10 Saturdays · eight virtual machines" },
                ].map((step) => <div key={step.number} className={cn(panelSmall, "flex items-center gap-4 p-4")}>
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black", step.number === "01" ? "bg-blue-600 text-white" : dark ? "bg-sky-500/10 text-sky-300" : "bg-blue-100 text-blue-700")}>{step.number}</span>
                  <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{step.title}</p><p className={cn("mt-1 text-xs", colors.muted)}>{step.detail}</p></div>
                  <span className={cn("shrink-0 text-[11px] font-bold", colors.muted)}>{step.dates}</span>
                </div>)}
              </div>
            </section>
            <section className={cn(card, "flex flex-col p-6 sm:p-7")}>
              <TextLabel dark={dark}>Progress summary</TextLabel>
              <div className="mt-5 flex justify-center"><ProgressRing value={percent} dark={dark} /></div>
              <p className={cn("mt-5 text-center text-sm leading-6", colors.muted)}>Track your practical class work and keep notes in your personal learning dashboard.</p>
              <div className={cn("mt-5 grid grid-cols-2 gap-3 border-t pt-5", colors.line)}>
                <div><p className="text-2xl font-black">{completed}</p><p className={cn("text-xs", colors.muted)}>Completed</p></div>
                <div><p className="text-2xl font-black">{LESSONS.length - completed}</p><p className={cn("text-xs", colors.muted)}>Remaining</p></div>
              </div>
              <button onClick={() => changeView("lessons")} className={cn("mt-auto pt-5 text-left text-xs font-extrabold", dark ? "text-sky-300" : "text-blue-700")}>Explore your 10 classes →</button>
            </section>
          </div>

          <section className={cn(card, "p-6 sm:p-7")}>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><TextLabel dark={dark}>Your official schedule</TextLabel><h2 className="mt-2 text-xl font-black">Upcoming milestones</h2></div><button onClick={() => changeView("calendar")} className="text-xs font-bold text-blue-500 hover:underline">Full calendar →</button></div>
            <div className="mt-4"><EventRows events={MILESTONES.filter((item) => item.date >= today).slice(0, 4)} onSelect={showDate} dark={dark} /></div>
            <p className={cn("mt-4 text-xs leading-6", colors.muted)}>Official classes start at 8:00 AM Eastern. Weekly check-ins are suggested outreach reminders, not booked meetings.</p>
          </section>
          <section className={cn(card, "p-6 sm:p-7")}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><TextLabel dark={dark}>Original orientation presentation</TextLabel><h2 className="mt-2 text-xl font-black">Your 2026–2027 Splunk guide</h2><p className={cn("mt-2 text-sm", colors.muted)}>28 slides covering exams, labs, virtual machines and your schedule.</p></div>
              <button className={primary} onClick={() => changeView("orientation")}>Read slides <FaArrowRight /></button></div>
            <div className={cn(panelSmall, "mt-5 flex flex-wrap items-center gap-4 p-5")}>
              <FaFileLines className="text-3xl text-blue-500" />
              <div className="min-w-0 flex-1"><p className="text-sm font-black">T.O Analytics Splunk Orientation 2026</p><p className={cn("mt-1 text-xs", colors.muted)}>Unchanged original PowerPoint · PDF preview included</p></div>
              {/* <a href={ORIENTATION_SLIDES.powerpoint} download className={cn("rounded-xl border px-4 py-2.5 text-xs font-bold", colors.line, colors.hover)}>Download PPTX</a> */}
            </div>
          </section>
        </>}

        {view === "orientation" && <>
          <Heading dark={dark} label="Start learning" title="Splunk Orientation" detail="One orientation recording and your official 2026–2027 PowerPoint. New class recordings will appear as they are published." />
          <section className={cn(card, "p-5 sm:p-7")}>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><TextLabel dark={dark}>Video library · 1 available</TextLabel><h2 className="mt-2 text-xl font-black">{ORIENTATION_VIDEO.title}</h2></div>
              <span className={cn("rounded-full px-3 py-1.5 text-xs font-extrabold", dark ? "bg-emerald-400/10 text-emerald-300" : "bg-emerald-50 text-emerald-700")}>Ready to watch</span></div>
            <div className="mt-5"><VideoPanel /></div>
            <p className={cn("mt-4 text-xs leading-6", colors.muted)}>This is the only published recording. More recordings will appear as new lessons are delivered.</p>
          </section>
          <section className={cn(card, "p-5 sm:p-7")}>
            <div className="flex flex-wrap items-start justify-between gap-4"><div><TextLabel dark={dark}>Official PowerPoint · 28 slides</TextLabel><h2 className="mt-2 text-xl font-black">T.O Analytics Splunk Orientation 2026</h2>
              <p className={cn("mt-2 text-xs", colors.muted)}>Saturday, October 31, 2026 · 8:00–10:00 AM Eastern</p></div>
              <div className="flex flex-wrap gap-2">
                {/* <a className={primary} download href={ORIENTATION_SLIDES.powerpoint}><FaDownload /> Download PPTX</a> */}
                <a href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer" className={cn("rounded-xl border px-4 py-2.5 text-xs font-extrabold", colors.line, colors.hover)}>Open PDF ↗</a></div>
            </div>
            <div className="mt-5"><SlidesPanel /></div>
            <p className={cn("mt-3 text-xs", colors.muted)}>If your device does not display the PDF preview, choose Open PDF or Download PPTX above.</p>
          </section>
        </>}

        {view === "lessons" && <>
          <div className="flex flex-wrap items-end justify-between gap-4"><Heading dark={dark} label="Course library" title="My classes" detail="Ten planned Saturday sessions with their learning objectives. Only orientation has a published video; course recordings will be released separately." />
            <span className={cn("rounded-full border px-4 py-2 text-xs font-extrabold", colors.line)}>10 classes</span></div>
          <div className="grid gap-5 xl:grid-cols-[minmax(245px,0.85fr)_minmax(0,1.6fr)]">
            <section className={cn(card, "self-start p-4")}>
              <label className={cn("flex items-center gap-3 rounded-xl border px-3 py-3", colors.input)}>
                <FaMagnifyingGlass className={colors.muted} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your classes..." aria-label="Search classes" className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:font-medium" />
              </label>
              <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
                {filteredLessons.map((lesson) => <button key={lesson.id} type="button" onClick={() => setSelectedId(lesson.id)}
                  className={cn("w-full rounded-xl border p-3.5 text-left transition", selectedId === lesson.id ? dark ? "border-blue-400/40 bg-[#1c3b60]" : "border-blue-300 bg-blue-50" : cn(colors.line, colors.hover))}>
                  <div className="flex items-start gap-3"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black", progress[lesson.id]?.completed ? "bg-emerald-500/15 text-emerald-500" : selectedId === lesson.id ? "bg-blue-600 text-white" : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600")}>
                    {progress[lesson.id]?.completed ? <FaCheck /> : String(lesson.number).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold leading-5">{lesson.title}</h3>
                      <p className={cn("mt-1.5 text-[11px]", colors.muted)}>{displayDate(lesson.date)} · {progress[lesson.id]?.completed ? "Completed" : "Recording pending"}</p>
                    </div></div>
                </button>)}
                {!filteredLessons.length && <p className={cn("px-3 py-6 text-center text-sm", colors.muted)}>No classes match your search.</p>}
              </div>
            </section>
            <div className="min-w-0 space-y-5">
              <section className={cn(card, "p-5 sm:p-6")}>
                <div className="flex flex-wrap items-center gap-3"><TextLabel dark={dark}>Class {String(activeLesson.number).padStart(2, "0")}</TextLabel>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black", dark ? "bg-sky-400/10 text-sky-300" : "bg-blue-50 text-blue-700")}>{displayDate(activeLesson.date)}</span></div>
                <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{activeLesson.title}</h2>
                <p className={cn("mt-3 text-sm leading-7", colors.muted)}>{activeLesson.description}</p>
                <p className="mt-3 flex items-center gap-2 text-xs font-extrabold text-blue-500"><FaClock /> 8:00 AM Eastern · End time not specified</p>
                <div className={cn("mt-5 border-t pt-5", colors.line)}><h3 className="text-sm font-extrabold">What you'll work on</h3>
                  <ul className="mt-3 space-y-2">{activeLesson.tasks.map((task) => <li key={task} className="flex gap-2 text-xs leading-6"><FaCheck className="mt-1 shrink-0 text-blue-500" />{task}</li>)}</ul>
                  <div className={cn(panelSmall, "mt-5 p-4 text-xs leading-6")}><strong>Expected evidence:</strong> {activeLesson.evidence}</div>
                </div>
                <label className={cn("mt-5 flex items-start gap-3 border-t pt-5 text-xs font-semibold", colors.line)}>
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-blue-600" checked={Boolean(progress[activeLesson.id]?.completed)}
                    disabled={today < activeLesson.date} onChange={(e) => patchProgress(activeLesson.id, { completed: e.target.checked })} />
                  <span>Mark class completed (self-reported) {today < activeLesson.date && <span className={colors.muted}>· Available after the scheduled date</span>}</span>
                </label>
              </section>
              <section className={cn(card, "p-5 sm:p-6")}>
                <h3 className="mb-4 flex items-center gap-2 text-base font-black"><FaVideo className="text-blue-500" /> Lesson recording</h3>
                <EmptyRecordings dark={dark} detail="No recording has been published for this class. The only available video is in the Orientation section." />
                <h3 className="mt-6 flex items-center gap-2 text-base font-black"><FaFileLines className="text-blue-500" /> Class materials</h3>
                <p className={cn("mt-3 text-sm", colors.muted)}>No class-specific documents have been published yet. The full program PowerPoint is available under Resources.</p>
              </section>
              <section className={cn(card, "p-5 sm:p-6")}>
                <h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-blue-500" /> Personal lesson notes</h3>
                <p className={cn("mt-2 text-xs leading-6", colors.muted)}>Saved in this browser for your account. Notes are not synced across devices.</p>
                <textarea value={progress[activeLesson.id]?.note || ""} onChange={(e) => patchProgress(activeLesson.id, { note: e.target.value })}
                  placeholder="Write questions, SPL commands, ideas, or lesson notes..." rows={6}
                  className={cn("mt-4 w-full resize-y rounded-xl border p-4 text-sm leading-6 outline-none focus:border-blue-400", colors.input)} />
                <p className={cn("mt-2 text-right text-[11px]", colors.muted)}>Autosaved on this device</p>
              </section>
            </div>
          </div>
        </>}

        {view === "roadmap" && <>
          <Heading dark={dark} label="Your program" title="Learning roadmap" detail="The updated program has two phases: certification preparation through December 2026, followed by ten practical classes and a capstone from January through March 2027." />
          <section className={cn(card, "p-6 sm:p-8")}>
            <h2 className="text-xl font-black">Important milestones</h2>
            <div className="mt-7 space-y-0">{MILESTONES.map((item, index) => <div key={item.id} className="flex gap-4 sm:gap-5">
              <div className="flex flex-col items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c66d2] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                {index !== MILESTONES.length - 1 && <span className={cn("my-1 w-px flex-1", dark ? "bg-white/15" : "bg-slate-200")} />}</div>
              <div className={cn("min-w-0 flex-1 pb-8", index === MILESTONES.length - 1 && "pb-0")}>
                <p className="text-xs font-bold text-blue-500">{displayDate(item.date)}</p>
                <h3 className="mt-1 text-base font-black">{item.title}</h3>
                <p className={cn("mt-2 text-sm leading-6", colors.muted)}>{item.detail}</p>
                {item.kind === "class" && <button onClick={() => openLesson(item.id)} className="mt-2 text-xs font-bold text-blue-500 hover:underline">View class →</button>}
              </div>
            </div>)}</div>
          </section>
          <section className={cn(card, "p-6 sm:p-8")}><h2 className="text-xl font-black">Certification goals</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">{CERTIFICATIONS.map((item) => <div key={item.id} className={cn(panelSmall, "p-5")}>
              <p className="text-xs font-black text-blue-500">Deadline · {displayDate(item.date)}</p><h3 className="mt-2 text-base font-black">{item.title}</h3>
              <p className={cn("mt-3 text-xs leading-6", colors.muted)}>{item.topic}</p>
              <button onClick={() => showDate(item.date)} className="mt-4 text-xs font-extrabold text-blue-500 hover:underline">Calendar date →</button>
            </div>)}</div>
          </section>
        </>}

        {view === "calendar" && <>
          <Heading dark={dark} label="2026–2027 schedule" title="Learning calendar" detail="Class dates, certification deadlines and preparation milestones are shown in Eastern Time. Weekly check-ins are suggestions to contact your instructor, not booked live classes." />
          <section className={cn(card, "p-4 sm:p-6")}>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{displayDate(`${month}-01`, { month: "long", year: "numeric" })}</h2>
              <p className={cn("mt-1 text-xs", colors.muted)}>{eventsThisMonth.length} official event(s) this month</p></div>
              <div className="flex gap-2"><button type="button" aria-label="Previous month" disabled={monthIndex === 0}
                onClick={() => setMonthIndex((n) => n - 1)} className={cn("rounded-xl border p-3 disabled:opacity-30", colors.line, colors.hover)}><FaChevronLeft /></button>
                <button type="button" aria-label="Next month" disabled={monthIndex === MONTHS.length - 1}
                  onClick={() => setMonthIndex((n) => n + 1)} className={cn("rounded-xl border p-3 disabled:opacity-30", colors.line, colors.hover)}><FaChevronRight /></button></div></div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((day) => <div key={day} className={cn("py-2 text-[10px] font-bold", colors.muted)}>{day}</div>)}
              {calendarCells.map((date, index) => {
                const events = MILESTONES.filter((item) => item.date === date);
                const checkin = WEEKLY_CHECKINS.includes(date);
                const isSelected = selectedDate === date;
                return date ? <button type="button" key={date} onClick={() => setSelectedDate(date)}
                  aria-pressed={isSelected} aria-label={`${displayDate(date)}${events.length ? `, ${events.map((item) => item.title).join(", ")}` : ""}${checkin ? ", suggested check-in" : ""}`}
                  className={cn("flex h-16 flex-col items-center justify-start rounded-lg pt-2 text-xs font-bold transition sm:h-[86px]",
                    isSelected ? "bg-[#0a62d2] text-white" : events.length ? dark ? "border border-blue-400/30 bg-blue-400/10 text-blue-100" : "border border-blue-200 bg-blue-50 text-blue-800" : dark ? "border border-white/5 text-slate-300 hover:bg-white/5" : "border border-slate-100 text-slate-700 hover:bg-slate-50") }>
                  <span>{Number(date.slice(-2))}</span>
                  {events.length > 0 && <span className={cn("mt-2 h-2 w-2 rounded-full", isSelected ? "bg-white" : events.some((item) => item.kind === "deadline") ? "bg-rose-500" : "bg-blue-600")} />}
                  {checkin && <span className={cn("mt-1 text-[8px]", isSelected ? "text-white" : colors.muted)}>Check-in</span>}
                </button> : <div key={`empty-${index}`} />;
              })}
            </div>
            <div className={cn("mt-5 flex flex-wrap gap-4 text-xs", colors.muted)}><span>🔵 Official class or milestone</span><span>🔴 Certification deadline</span><span>Check-in = suggested outreach</span></div>
            <div className={cn("mt-6 border-t pt-5", colors.line)}>
              <TextLabel dark={dark}>Selected date</TextLabel>
              <h3 className="mt-2 text-base font-black">{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
              <div className="mt-4"><EventRows events={chosenEvents} onSelect={showDate} dark={dark} />
                {chosenCheckin && <p className={cn(panelSmall, "mt-3 p-4 text-xs leading-6")}>Suggested weekly instructor check-in: send questions or a progress update. This is not a booked meeting.</p>}
              </div>
            </div>
            <div className={cn("mt-6 border-t pt-5", colors.line)}><TextLabel dark={dark}>Official dates this month</TextLabel>
              <div className="mt-3"><EventRows events={eventsThisMonth} onSelect={setSelectedDate} dark={dark} /></div>
            </div>
          </section>
        </>}

        {view === "lab" && <>
          <Heading dark={dark} label="Your hands-on environment" title="Personal Splunk lab" detail="Your orientation presentation calls for one Proxmox server running eight Linux virtual machines. Hardware is an individual student requirement, and licensing needs to be arranged before training." />
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard Icon={FaServer} number="1" label="Physical server" detail="64 GB RAM recommended" dark={dark} />
            <StatCard Icon={FaComputer} number="8" label="Virtual machines" detail="Separate Splunk roles" dark={dark} />
            <StatCard Icon={FaHardDrive} number="560 GB" label="Guest disk budget" detail="Plus host overhead" dark={dark} />
          </section>
          <section className={cn(card, "p-6 sm:p-7")}>
            <TextLabel dark={dark}>Hardware readiness</TextLabel><h2 className="mt-2 text-xl font-black">Prepare for January 9</h2>
            <p className={cn("mt-3 text-sm leading-7", colors.muted)}>Recommended target: x86-64 CPU with VT-x/AMD-V, at least eight cores, 64 GB RAM, 1 TB SSD/NVMe and wired Ethernet. Also prepare your own laptop, bootable USB media, a private IP plan and backups.</p>
            <div className="mt-5 flex flex-wrap gap-3"><a href={SERVER_URL} target="_blank" rel="noopener noreferrer" className={primary}>Instructor's server link <FaArrowRight /></a>
              <a href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer" className={cn("rounded-xl border px-4 py-2.5 text-xs font-bold", colors.line, colors.hover)}>Program information ↗</a></div>
            <p className={cn("mt-4 text-xs leading-6", colors.muted)}>Confirm RAM and storage configuration before purchase. Installing Proxmox may erase an existing disk; back up data first.</p>
          </section>
          <section className={cn(card, "p-6 sm:p-7")}><TextLabel dark={dark}>Lab architecture</TextLabel><h2 className="mt-2 text-xl font-black">How the eight VMs connect</h2>
            <div className="mt-5 grid items-center gap-3 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <div className={cn(panelSmall, "p-4")}><p className="font-black">UF1 + UF2</p><p className={cn("mt-1 text-xs", colors.muted)}>Collect logs</p></div>
              <FaArrowRight className="mx-auto rotate-90 text-blue-500 md:rotate-0" />
              <div className={cn(panelSmall, "p-4")}><p className="font-black">IDX1–IDX3</p><p className={cn("mt-1 text-xs", colors.muted)}>Store and replicate</p></div>
              <FaArrowRight className="mx-auto rotate-90 text-blue-500 md:rotate-0" />
              <div className={cn(panelSmall, "p-4")}><p className="font-black">SH1</p><p className={cn("mt-1 text-xs", colors.muted)}>Search and dashboards</p></div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className={cn(panelSmall, "p-4 text-xs")}><strong>CM1:</strong> Indexer cluster manager</div>
              <div className={cn(panelSmall, "p-4 text-xs")}><strong>MC1:</strong> Deployment server, licensing, monitoring</div></div>
            <p className={cn("mt-4 text-xs leading-6", colors.muted)}>Replication factor 2, search factor 2 are lab targets. All eight VMs on one physical server still share one hardware failure domain.</p>
          </section>
          <section className={cn(card, "overflow-hidden p-6 sm:p-7")}><h2 className="text-xl font-black">VM resource allocation</h2>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className={cn("border-b", colors.line)}><th className="py-3 pr-2">Role</th><th className="py-3 pr-2">Count</th><th className="py-3 pr-2">vCPU / VM</th><th className="py-3 pr-2">RAM / VM</th><th className="py-3">Disk / VM</th></tr></thead>
              <tbody>{VM_ROLES.map((vm) => <tr key={vm.name} className={cn("border-b", colors.line)}><td className="py-3 pr-2 font-bold">{vm.name}</td><td className="py-3 pr-2">{vm.count}</td><td className="py-3 pr-2">{vm.cpu}</td><td className="py-3 pr-2">{vm.ram} GB</td><td className="py-3">{vm.disk} GB</td></tr>)}</tbody>
              <tfoot><tr className="font-black"><td className="pt-4">Total</td><td className="pt-4">8</td><td className="pt-4">22</td><td className="pt-4">46 GB</td><td className="pt-4">560 GB</td></tr></tfoot></table></div>
            <p className={cn("mt-4 text-xs", colors.muted)}>Guest allocation only; reserve RAM and disk for Proxmox and overhead.</p>
          </section>
          <section className={cn(card, "p-6 sm:p-7")}><div className="flex flex-wrap items-center justify-between gap-2"><div><TextLabel dark={dark}>Student checklist</TextLabel><h2 className="mt-2 text-xl font-black">Your preparation tasks</h2></div><span className={cn("text-xs font-bold", colors.muted)}>{readyCount}/{PREP_ITEMS.length} ready</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{PREP_ITEMS.map((task) => <label key={task.id} className={cn(panelSmall, "flex cursor-pointer items-start gap-3 p-4 text-xs leading-6")}>
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-blue-600" checked={Boolean(readiness[task.id]?.checked)} onChange={(e) => patchReadiness(task.id, { checked: e.target.checked })} />
              <span className={readiness[task.id]?.checked ? "opacity-60 line-through" : ""}>{task.label}</span></label>)}</div>
          </section>
          <section className={cn(card, "p-6 sm:p-7")}><h2 className="text-xl font-black">Plan your Splunk licensing</h2>
            <p className={cn("mt-3 text-sm leading-7", colors.muted)}>The orientation document describes a 60-day Enterprise trial, while the scheduled practical program runs 63 days. Plan for a legitimate eligible license that covers the entire lab. Developer licenses require eligibility and approval; Splunk Free does not substitute for Enterprise cluster features.</p>
            <a className={cn(primary, "mt-5")} href={DEVELOPER_PROGRAM_URL} target="_blank" rel="noopener noreferrer">View developer program <FaArrowRight /></a>
          </section>
        </>}

        {view === "resources" && <>
          <Heading dark={dark} label="Learning materials" title="Resource library" detail="Your official 2026–2027 orientation PowerPoint, PDF preview, and introductory video are available now. New class files will appear when published." />
          <section className={cn(card, "p-6 sm:p-7")}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><TextLabel dark={dark}>Official 28-slide presentation</TextLabel><h2 className="mt-2 text-xl font-black">Splunk Orientation 2026 — Zero to Hero</h2>
              <p className={cn("mt-2 text-xs leading-6", colors.muted)}>The unchanged PowerPoint you supplied, with a PDF version for easy viewing.</p></div>
              <button className={primary} onClick={() => changeView("orientation")}>Preview materials <FaArrowRight /></button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {/* <a href={ORIENTATION_SLIDES.powerpoint} download className={cn(panelSmall, "flex items-center gap-3 p-5 text-sm font-bold", colors.hover)}><FaDownload className="text-blue-500" />Download PowerPoint (.pptx)</a> */}

              <a href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer" className={cn(panelSmall, "flex items-center gap-3 p-5 text-sm font-bold", colors.hover)}><FaFileLines className="text-blue-500" />Open PDF preview</a></div>
          </section>
          <section className={cn(card, "p-6 sm:p-7")}><h2 className="text-xl font-black">Training and preparation links</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Orientation information", "Program details and entry information", ORIENTATION_URL],
                ["T.O Analytics study hub", "Certification preparation and practice", STUDY_HUB_URL],
                ["Recommended lab server", "Instructor's hardware suggestion", SERVER_URL],
                ["Splunk developer program", "Review licensing and eligibility", DEVELOPER_PROGRAM_URL],
              ].map(([name, detail, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={cn(panelSmall, "flex items-center gap-3 p-4 transition", colors.hover)}>
                <FaArrowRight className="shrink-0 text-blue-500" /><div className="min-w-0"><h3 className="text-sm font-extrabold">{name}</h3><p className={cn("mt-1 text-xs leading-5", colors.muted)}>{detail}</p></div>
              </a>)}
            </div>
          </section>
          <section className={cn(card, "p-6 sm:p-7")}><EmptyRecordings dark={dark} detail="New class recordings, assignments and lesson slides will be published here when available." /></section>
        </>}

        <footer className={cn("flex flex-wrap items-center justify-between gap-4 border-t py-5 text-xs", colors.line, colors.muted)}>
          <div><strong className={dark ? "text-white" : "text-slate-800"}>T.O Analytics LLC</strong> · Splunk 2026–2027 Program</div>
          <div className="flex flex-wrap gap-4"><span>Notes and checklist saved locally</span><span>Official times: Eastern</span><a href={`mailto:${supportEmail}`} className="hover:text-blue-500">Support</a><button type="button" onClick={resetCurrentProgram} className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600"><FaRotateRight /> Reset current progress</button></div>
        </footer>
      </div>
    </div>
  </main>;
}

// import React, { useEffect, useMemo, useState } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FaArrowRight,
//   FaBookOpen,
//   FaCalendarDays,
//   FaChartLine,
//   FaCheck,
//   FaChevronLeft,
//   FaChevronRight,
//   FaCirclePlay,
//   FaClock,
//   FaComputer,
//   FaDownload,
//   FaFileLines,
//   FaGraduationCap,
//   FaHardDrive,
//   FaLayerGroup,
//   FaMagnifyingGlass,
//   FaMoon,
//   FaNoteSticky,
//   FaRotateRight,
//   FaServer,
//   FaSun,
//   FaVideo,
// } from "react-icons/fa6";
// import {
//   CERTIFICATIONS,
//   COHORT_ID,
//   DEVELOPER_PROGRAM_URL,
//   LESSONS,
//   MILESTONES,
//   ORIENTATION_SLIDES,
//   ORIENTATION_URL,
//   ORIENTATION_VIDEO,
//   PREP_ITEMS,
//   SERVER_URL,
//   STUDY_HUB_URL,
//   VM_ROLES,
//   WEEKLY_CHECKINS,
//   displayDate,
//   easternToday,
// } from "./splunk2026Data";

// /**
//  * T.O Analytics · Splunk Student Campus — classic UI, UPDATED program.
//  * Every authenticated/enrolled Splunk student sees this SAME dashboard.
//  * Its layout intentionally follows the original CoursePortal: blue/navy brand,
//  * left sidebar, blue hero, progress cards, lesson library and dark/light theme.
//  * The entire old class library is absent. Exactly ONE retained orientation video.
//  * All 10 class recording/doc arrays are blank until new materials are published.
//  * Old cp_progress_<email> keys are NOT read, modified, reset, or deleted.
//  */

// const MONTHS = ["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"];
// const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// const MENU = [
//   { id: "overview", label: "Overview", icon: FaChartLine },
//   { id: "orientation", label: "Orientation", icon: FaCirclePlay },
//   { id: "lessons", label: "My classes", icon: FaBookOpen },
//   { id: "roadmap", label: "Learning roadmap", icon: FaLayerGroup },
//   { id: "calendar", label: "Class calendar", icon: FaCalendarDays },
//   { id: "lab", label: "Personal lab", icon: FaServer },
//   { id: "resources", label: "Resources", icon: FaFileLines },
// ];

// const supportEmail = "t.oanalyticsllc@gmail.com";
// const cn = (...values) => values.filter(Boolean).join(" ");

// function readObject(key) {
//   try {
//     const value = JSON.parse(localStorage.getItem(key) || "{}");
//     return value && typeof value === "object" && !Array.isArray(value) ? value : {};
//   } catch {
//     return {};
//   }
// }

// function useSavedRecords(storageKey) {
//   const [items, setItems] = useState(() => readObject(storageKey));
//   useEffect(() => setItems(readObject(storageKey)), [storageKey]);
//   function patch(id, update) {
//     setItems((previous) => {
//       const next = { ...previous, [id]: { ...(previous[id] || {}), ...update } };
//       try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* private/incognito mode */ }
//       return next;
//     });
//   }
//   function reset() {
//     setItems({});
//     try { localStorage.removeItem(storageKey); } catch { /* storage disabled */ }
//   }
//   return [items, patch, reset];
// }

// function TextLabel({ children, dark }) {
//   return <p className={cn("text-[11px] font-extrabold uppercase tracking-[0.18em]", dark ? "text-sky-300" : "text-blue-700")}>{children}</p>;
// }

// function Heading({ label, title, detail, dark }) {
//   return <div className="mb-5">
//     <TextLabel dark={dark}>{label}</TextLabel>
//     <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
//     {detail && <p className={cn("mt-2 max-w-3xl text-sm leading-7", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>}
//   </div>;
// }

// function StatCard({ Icon, number, label, detail, dark }) {
//   return <div className={cn("rounded-2xl border p-5 shadow-sm", dark ? "border-white/10 bg-[#111f34]" : "border-slate-200 bg-white")}>
//     <div className="flex items-start justify-between gap-3">
//       <div><p className={cn("text-xs font-semibold", dark ? "text-slate-400" : "text-slate-500")}>{label}</p>
//         <p className="mt-2 text-3xl font-black tracking-tight tabular-nums">{number}</p></div>
//       <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg", dark ? "bg-[#1d3857] text-cyan-300" : "bg-blue-50 text-blue-700")}><Icon /></span>
//     </div>
//     <p className={cn("mt-4 text-[11px]", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>
//   </div>;
// }

// function ProgressRing({ value, dark }) {
//   const radius = 42;
//   const circumference = 2 * Math.PI * radius;
//   return <div className="relative h-[156px] w-[156px]">
//     <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${value}% of classes completed`}>
//       <circle cx="50" cy="50" r={radius} fill="none" stroke={dark ? "#293951" : "#e2e8f0"} strokeWidth="8" />
//       <circle cx="50" cy="50" r={radius} fill="none" stroke="#1688dc" strokeWidth="8" strokeLinecap="round"
//         strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - value / 100)} />
//     </svg>
//     <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black tabular-nums">{value}%</span>
//       <span className={cn("text-[10px] font-bold", dark ? "text-slate-400" : "text-slate-500")}>completed</span></div>
//   </div>;
// }

// function EmptyRecordings({ dark, detail = "New recordings will appear here when released by the instructor." }) {
//   return <div className={cn("rounded-2xl border border-dashed px-6 py-9 text-center", dark ? "border-white/15 bg-white/[0.025]" : "border-slate-300 bg-slate-50/60")}>
//     <FaVideo className={cn("mx-auto text-2xl", dark ? "text-sky-300" : "text-blue-600")} />
//     <h3 className="mt-3 text-sm font-extrabold">No class recordings published yet</h3>
//     <p className={cn("mx-auto mt-2 max-w-md text-xs leading-6", dark ? "text-slate-400" : "text-slate-500")}>{detail}</p>
//   </div>;
// }

// function DateTile({ date, dark }) {
//   return <div className={cn("flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl", dark ? "bg-sky-400/10 text-sky-200" : "bg-blue-50 text-blue-800")}>
//     <span className="text-[9px] font-extrabold uppercase">{displayDate(date, { month: "short" })}</span>
//     <span className="text-base font-black">{date.slice(-2)}</span>
//   </div>;
// }

// function EventRows({ events, onSelect, dark }) {
//   return events.length ? <div className="space-y-2">{events.map((item) =>
//     <button key={item.id} type="button" onClick={() => onSelect(item.date)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition", dark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40")}>
//       <DateTile date={item.date} dark={dark} />
//       <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold sm:text-sm">{item.title}</span>
//         <span className={cn("mt-1 block text-xs", dark ? "text-slate-400" : "text-slate-500")}>{item.detail}</span></span>
//       <FaArrowRight className={cn("shrink-0 text-xs", dark ? "text-sky-300" : "text-blue-600")} />
//     </button>)}</div>
//     : <p className={cn("rounded-xl border border-dashed p-5 text-sm", dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>No official events scheduled for this period.</p>;
// }

// export default function NewCohortDashboard({ email = "" }) {
//   const normalizedEmail = String(email || "").trim().toLowerCase();
//   // The unified program uses new keys, so 2025 progress remains untouched.
//   const progressKey = `cp_progress_${COHORT_ID}_${normalizedEmail}`;
//   const readinessKey = `cp_preparation_${COHORT_ID}_${normalizedEmail}`;
//   const [progress, patchProgress, resetProgress] = useSavedRecords(progressKey);
//   const [readiness, patchReadiness, resetReadiness] = useSavedRecords(readinessKey);
//   const [view, setView] = useState("overview");
//   const [dark, setDark] = useState(() => {
//     try { return localStorage.getItem("to_2026_portal_theme") === "dark"; } catch { return false; }
//   });
//   const [query, setQuery] = useState("");
//   const [selectedId, setSelectedId] = useState(LESSONS[0].id);
//   const [selectedDate, setSelectedDate] = useState(() => easternToday());
//   const [monthIndex, setMonthIndex] = useState(() => {
//     const month = easternToday().slice(0, 7);
//     if (month < MONTHS[0]) return 0;
//     if (month > MONTHS[MONTHS.length - 1]) return MONTHS.length - 1;
//     return Math.max(0, MONTHS.indexOf(month));
//   });

//   useEffect(() => {
//     try { localStorage.setItem("to_2026_portal_theme", dark ? "dark" : "light"); } catch { /* ignored */ }
//   }, [dark]);

//   const colors = dark ? {
//     shell: "bg-[#071426] text-slate-50", header: "border-white/10 bg-[#0a192c]",
//     panel: "border-white/10 bg-[#102037]", soft: "border-white/10 bg-[#14283f]",
//     line: "border-white/10", muted: "text-slate-400", hover: "hover:bg-white/[0.065]",
//     input: "border-white/10 bg-[#091a2d] text-slate-100 placeholder:text-slate-500",
//   } : {
//     shell: "bg-[#f4f7fb] text-slate-900", header: "border-slate-200 bg-white",
//     panel: "border-slate-200 bg-white", soft: "border-slate-200 bg-[#f7faff]",
//     line: "border-slate-200", muted: "text-slate-500", hover: "hover:bg-blue-50",
//     input: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
//   };
//   const card = cn("rounded-[24px] border shadow-sm", colors.panel);
//   const panelSmall = cn("rounded-2xl border", colors.soft);
//   const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a62d2] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#084da9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

//   const today = easternToday();
//   const completed = LESSONS.filter((lesson) => progress[lesson.id]?.completed).length;
//   const percent = Math.round((completed / LESSONS.length) * 100);
//   const readyCount = PREP_ITEMS.filter((item) => readiness[item.id]?.checked).length;
//   const activeLesson = LESSONS.find((item) => item.id === selectedId) || LESSONS[0];
//   const filteredLessons = LESSONS.filter((lesson) => `${lesson.title} ${lesson.description} ${lesson.evidence}`.toLowerCase().includes(query.trim().toLowerCase()));
//   const month = MONTHS[monthIndex];
//   const eventsThisMonth = MILESTONES.filter((item) => item.date.startsWith(month));
//   const chosenEvents = MILESTONES.filter((item) => item.date === selectedDate);
//   const chosenCheckin = WEEKLY_CHECKINS.includes(selectedDate);

//   const calendarCells = useMemo(() => {
//     const [year, mon] = month.split("-").map(Number);
//     const offset = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
//     const numberOfDays = new Date(Date.UTC(year, mon, 0)).getUTCDate();
//     return Array.from({ length: Math.ceil((offset + numberOfDays) / 7) * 7 }, (_, index) => {
//       const day = index - offset + 1;
//       return day > 0 && day <= numberOfDays ? `${month}-${String(day).padStart(2, "0")}` : null;
//     });
//   }, [month]);

//   const changeView = (id) => { setView(id); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };
//   const openLesson = (id) => { setSelectedId(id); changeView("lessons"); };
//   const showDate = (date) => {
//     setSelectedDate(date);
//     const target = MONTHS.indexOf(date.slice(0, 7));
//     if (target >= 0) setMonthIndex(target);
//     changeView("calendar");
//   };

//   function resetCurrentProgram() {
//     if (!window.confirm("Reset your CURRENT 2026–2027 class progress, notes and checklist on this device? Older saved course data will not be touched.")) return;
//     resetProgress();
//     resetReadiness();
//   }

//   function VideoPanel() {
//     return <div className="aspect-video overflow-hidden rounded-2xl bg-black">
//       <iframe title={ORIENTATION_VIDEO.title} src={ORIENTATION_VIDEO.url}
//         className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture"
//         allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
//     </div>;
//   }

//   function SlidesPanel() {
//     return <div className={cn("overflow-hidden rounded-2xl border", colors.line)}>
//       <iframe title="T.O Analytics official Splunk Orientation 2026 slides"
//         src={`${ORIENTATION_SLIDES.pdf}#view=FitH`} loading="lazy"
//         className="h-[440px] w-full bg-white sm:h-[660px]" />
//     </div>;
//   }

//   return <main className={cn("min-h-screen transition-colors duration-200", colors.shell)}>
//     {/* Original Campus top header and horizontal utility tools */}
//     <header className={cn("border-b", colors.header)}>
//       <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
//         <div className="flex min-w-0 items-center gap-3">
//           <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black tracking-tight text-white">T.O</div>
//           <div className="min-w-0"><p className="truncate text-[15px] font-black tracking-tight">T.O Analytics</p>
//             <p className={cn("text-[11px] font-semibold", colors.muted)}>Student learning campus</p></div>
//           <span className={cn("ml-3 hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline-flex", dark ? "bg-sky-300/10 text-sky-200" : "bg-blue-50 text-blue-700")}>Splunk 2026–2027</span>
//         </div>
//         <div className="flex items-center gap-2 sm:gap-3">
//           <span title={normalizedEmail} className={cn("hidden max-w-[230px] truncate text-xs font-semibold md:block", colors.muted)}>{normalizedEmail}</span>
//           <button type="button" onClick={() => setDark((old) => !old)}
//             className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", colors.line, colors.hover)}
//             aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? <FaSun /> : <FaMoon />}</button>
//           <NavLink to="/" className={cn("rounded-xl border px-3 py-2.5 text-xs font-extrabold", colors.line, colors.hover)}>Website ↗</NavLink>
//         </div>
//       </div>
//     </header>

//     <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[242px_minmax(0,1fr)] lg:px-10 lg:py-9">
//       {/* Original sticky campus sidebar */}
//       <aside className="min-w-0">
//         <div className={cn("rounded-[24px] border p-4 lg:sticky lg:top-6", colors.panel)}>
//           <div className={cn("mb-5 rounded-2xl p-4", dark ? "bg-[#1a3554]" : "bg-[#edf5ff]")}>
//             <div className="flex items-center gap-2 text-sky-500"><FaGraduationCap /><span className="text-[11px] font-extrabold uppercase tracking-wider">Learning space</span></div>
//             <h2 className="mt-2 text-base font-black leading-snug">Your Splunk journey</h2>
//             <p className={cn("mt-2 text-xs leading-5", colors.muted)}>One updated program · All enrolled students</p>
//           </div>
//           <p className={cn("mb-3 px-3 text-[10px] font-black uppercase tracking-[0.16em]", colors.muted)}>Workspace</p>
//           <nav aria-label="Student navigation" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
//             {MENU.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeView(id)}
//               aria-current={view === id ? "page" : undefined}
//               className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm", view === id ? "bg-[#0a62d2] text-white shadow-md shadow-blue-800/10" : cn(colors.hover, colors.muted))}>
//               <Icon className="shrink-0" /><span>{label}</span>
//               {view === id && <FaArrowRight className="ml-auto hidden text-[10px] lg:block" />}
//             </button>)}
//           </nav>
//           <div className={cn("mt-5 border-t pt-5", colors.line)}>
//             <div className="flex items-center justify-between"><span className="text-xs font-bold">Your progress</span>
//               <span className="text-xs font-black text-[#298fd3]">{percent}%</span></div>
//             <div className={cn("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-slate-100")}>
//               <div className="h-full rounded-full bg-[#1688dc] transition-all" style={{ width: `${percent}%` }} /></div>
//             <p className={cn("mt-2 text-[11px]", colors.muted)}>{completed} of {LESSONS.length} class sessions completed</p>
//           </div>
//           <div className={cn("mt-5 border-t pt-5", colors.line)}>
//             <a href={`mailto:${supportEmail}`} className={cn("block rounded-xl border px-3 py-3 text-center text-xs font-bold", colors.line, colors.hover)}>Need help? Contact support</a>
//           </div>
//         </div>
//       </aside>

//       <div className="min-w-0 space-y-6">
//         {view === "overview" && <>
//           {/* Classic navy-to-blue original hero section */}
//           <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
//             <div className="pointer-events-none absolute -right-14 -top-28 h-[310px] w-[310px] rounded-full border-[52px] border-white/[0.045]" />
//             <div className="pointer-events-none absolute bottom-[-130px] right-[20%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
//             <div className="relative z-10 max-w-3xl">
//               <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-sky-100"><FaGraduationCap /> 2026–2027 Splunk professional program</span>
//               <h1 className="mt-6 max-w-2xl text-3xl font-black leading-[1.13] tracking-tight sm:text-4xl lg:text-[42px]">Build your Splunk career, one skill at a time.</h1>
//               <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100/90 sm:text-base">Start with your orientation video and the official 28-slide guide. Prepare for certifications, build your personal eight-VM lab and follow ten Saturday sessions from January to March 2027.</p>
//               <div className="mt-7 flex flex-wrap gap-3">
//                 <button onClick={() => changeView("orientation")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#083269] transition hover:bg-blue-50">Watch orientation <FaArrowRight /></button>
//                 <button onClick={() => changeView("roadmap")} className="rounded-xl border border-white/30 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">View roadmap</button>
//               </div>
//             </div>
//           </section>

//           <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Learning statistics">
//             <StatCard Icon={FaLayerGroup} number="10" label="Official sessions" detail="Jan 9 – Mar 13, 2027" dark={dark} />
//             <StatCard Icon={FaVideo} number="01" label="Available recording" detail="Orientation video only" dark={dark} />
//             <StatCard Icon={FaCheck} number={completed} label="Completed sessions" detail="Tracked separately for your account" dark={dark} />
//             <StatCard Icon={FaFileLines} number="01" label="Official presentation" detail="28 orientation slides" dark={dark} />
//           </section>

//           <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
//             <section className={cn(card, "p-6 sm:p-7")}>
//               <TextLabel dark={dark}>Your next step</TextLabel>
//               <h2 className="mt-3 text-xl font-black tracking-tight">Start with Splunk Orientation</h2>
//               <p className={cn("mt-3 text-sm leading-6", colors.muted)}>Watch the single orientation video retained from the previous library and review the new official program presentation.</p>
//               <div className={cn(panelSmall, "mt-5 flex flex-wrap items-center justify-between gap-3 p-4")}>
//                 <div><p className="text-xs font-extrabold">1 recording available</p><p className={cn("mt-1 text-xs", colors.muted)}>2026–2027 Orientation · 28 slides</p></div>
//                 <button onClick={() => changeView("orientation")} className={primary}>Open orientation <FaArrowRight /></button>
//               </div>
//               <div className="mt-7 flex items-center justify-between gap-3"><h3 className="text-base font-black">Learning path</h3><button onClick={() => changeView("roadmap")} className="text-xs font-bold text-blue-500 hover:underline">Full roadmap →</button></div>
//               <div className="mt-4 space-y-3">
//                 {[
//                   { number: "01", title: "Certification preparation", dates: "Oct – Dec 2026", detail: "Power User then Enterprise Admin" },
//                   { number: "02", title: "Distributed Splunk lab", dates: "Jan – Mar 2027", detail: "10 Saturdays · eight virtual machines" },
//                 ].map((step) => <div key={step.number} className={cn(panelSmall, "flex items-center gap-4 p-4")}>
//                   <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black", step.number === "01" ? "bg-blue-600 text-white" : dark ? "bg-sky-500/10 text-sky-300" : "bg-blue-100 text-blue-700")}>{step.number}</span>
//                   <div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{step.title}</p><p className={cn("mt-1 text-xs", colors.muted)}>{step.detail}</p></div>
//                   <span className={cn("shrink-0 text-[11px] font-bold", colors.muted)}>{step.dates}</span>
//                 </div>)}
//               </div>
//             </section>
//             <section className={cn(card, "flex flex-col p-6 sm:p-7")}>
//               <TextLabel dark={dark}>Progress summary</TextLabel>
//               <div className="mt-5 flex justify-center"><ProgressRing value={percent} dark={dark} /></div>
//               <p className={cn("mt-5 text-center text-sm leading-6", colors.muted)}>Track your practical class work and keep notes in your personal learning dashboard.</p>
//               <div className={cn("mt-5 grid grid-cols-2 gap-3 border-t pt-5", colors.line)}>
//                 <div><p className="text-2xl font-black">{completed}</p><p className={cn("text-xs", colors.muted)}>Completed</p></div>
//                 <div><p className="text-2xl font-black">{LESSONS.length - completed}</p><p className={cn("text-xs", colors.muted)}>Remaining</p></div>
//               </div>
//               <button onClick={() => changeView("lessons")} className={cn("mt-auto pt-5 text-left text-xs font-extrabold", dark ? "text-sky-300" : "text-blue-700")}>Explore your 10 classes →</button>
//             </section>
//           </div>

//           <section className={cn(card, "p-6 sm:p-7")}>
//             <div className="flex flex-wrap items-center justify-between gap-3"><div><TextLabel dark={dark}>Your official schedule</TextLabel><h2 className="mt-2 text-xl font-black">Upcoming milestones</h2></div><button onClick={() => changeView("calendar")} className="text-xs font-bold text-blue-500 hover:underline">Full calendar →</button></div>
//             <div className="mt-4"><EventRows events={MILESTONES.filter((item) => item.date >= today).slice(0, 4)} onSelect={showDate} dark={dark} /></div>
//             <p className={cn("mt-4 text-xs leading-6", colors.muted)}>Official classes start at 8:00 AM Eastern. Weekly check-ins are suggested outreach reminders, not booked meetings.</p>
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}>
//             <div className="flex flex-wrap items-start justify-between gap-3"><div><TextLabel dark={dark}>Original orientation presentation</TextLabel><h2 className="mt-2 text-xl font-black">Your 2026–2027 Splunk guide</h2><p className={cn("mt-2 text-sm", colors.muted)}>28 slides covering exams, labs, virtual machines and your schedule.</p></div>
//               <button className={primary} onClick={() => changeView("orientation")}>Read slides <FaArrowRight /></button></div>
//             <div className={cn(panelSmall, "mt-5 flex flex-wrap items-center gap-4 p-5")}>
//               <FaFileLines className="text-3xl text-blue-500" />
//               <div className="min-w-0 flex-1"><p className="text-sm font-black">T.O Analytics Splunk Orientation 2026</p><p className={cn("mt-1 text-xs", colors.muted)}>Unchanged original PowerPoint · PDF preview included</p></div>
//               {/* <a href={ORIENTATION_SLIDES.powerpoint} download className={cn("rounded-xl border px-4 py-2.5 text-xs font-bold", colors.line, colors.hover)}>Download PPTX</a> */}
//             </div>
//           </section>
//         </>}

//         {view === "orientation" && <>
//           <Heading dark={dark} label="Start learning" title="Splunk Orientation" detail="One orientation recording and your official 2026–2027 PowerPoint. New class recordings will appear as they are published." />
//           <section className={cn(card, "p-5 sm:p-7")}>
//             <div className="flex flex-wrap items-center justify-between gap-3"><div><TextLabel dark={dark}>Video library · 1 available</TextLabel><h2 className="mt-2 text-xl font-black">{ORIENTATION_VIDEO.title}</h2></div>
//               <span className={cn("rounded-full px-3 py-1.5 text-xs font-extrabold", dark ? "bg-emerald-400/10 text-emerald-300" : "bg-emerald-50 text-emerald-700")}>Ready to watch</span></div>
//             <div className="mt-5"><VideoPanel /></div>
//             <p className={cn("mt-4 text-xs leading-6", colors.muted)}>This is the only published recording. More recordings will appear as new lessons are delivered.</p>
//           </section>
//           <section className={cn(card, "p-5 sm:p-7")}>
//             <div className="flex flex-wrap items-start justify-between gap-4"><div><TextLabel dark={dark}>Official PowerPoint · 28 slides</TextLabel><h2 className="mt-2 text-xl font-black">T.O Analytics Splunk Orientation 2026</h2>
//               <p className={cn("mt-2 text-xs", colors.muted)}>Saturday, October 31, 2026 · 8:00–10:00 AM Eastern</p></div>
//               <div className="flex flex-wrap gap-2">
//                 {/* <a className={primary} download href={ORIENTATION_SLIDES.powerpoint}><FaDownload /> Download PPTX</a> */}
//                 <a href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer" className={cn("rounded-xl border px-4 py-2.5 text-xs font-extrabold", colors.line, colors.hover)}>Open PDF ↗</a></div>
//             </div>
//             <div className="mt-5"><SlidesPanel /></div>
//             <p className={cn("mt-3 text-xs", colors.muted)}>If your device does not display the PDF preview, choose Open PDF or Download PPTX above.</p>
//           </section>
//         </>}

//         {view === "lessons" && <>
//           <div className="flex flex-wrap items-end justify-between gap-4"><Heading dark={dark} label="Course library" title="My classes" detail="Ten planned Saturday sessions with their learning objectives. Only orientation has a published video; course recordings will be released separately." />
//             <span className={cn("rounded-full border px-4 py-2 text-xs font-extrabold", colors.line)}>10 classes</span></div>
//           <div className="grid gap-5 xl:grid-cols-[minmax(245px,0.85fr)_minmax(0,1.6fr)]">
//             <section className={cn(card, "self-start p-4")}>
//               <label className={cn("flex items-center gap-3 rounded-xl border px-3 py-3", colors.input)}>
//                 <FaMagnifyingGlass className={colors.muted} />
//                 <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your classes..." aria-label="Search classes" className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:font-medium" />
//               </label>
//               <div className="mt-3 max-h-[640px] space-y-2 overflow-y-auto pr-1">
//                 {filteredLessons.map((lesson) => <button key={lesson.id} type="button" onClick={() => setSelectedId(lesson.id)}
//                   className={cn("w-full rounded-xl border p-3.5 text-left transition", selectedId === lesson.id ? dark ? "border-blue-400/40 bg-[#1c3b60]" : "border-blue-300 bg-blue-50" : cn(colors.line, colors.hover))}>
//                   <div className="flex items-start gap-3"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black", progress[lesson.id]?.completed ? "bg-emerald-500/15 text-emerald-500" : selectedId === lesson.id ? "bg-blue-600 text-white" : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600")}>
//                     {progress[lesson.id]?.completed ? <FaCheck /> : String(lesson.number).padStart(2, "0")}</span>
//                     <div className="min-w-0 flex-1"><h3 className="text-sm font-extrabold leading-5">{lesson.title}</h3>
//                       <p className={cn("mt-1.5 text-[11px]", colors.muted)}>{displayDate(lesson.date)} · {progress[lesson.id]?.completed ? "Completed" : "Recording pending"}</p>
//                     </div></div>
//                 </button>)}
//                 {!filteredLessons.length && <p className={cn("px-3 py-6 text-center text-sm", colors.muted)}>No classes match your search.</p>}
//               </div>
//             </section>
//             <div className="min-w-0 space-y-5">
//               <section className={cn(card, "p-5 sm:p-6")}>
//                 <div className="flex flex-wrap items-center gap-3"><TextLabel dark={dark}>Class {String(activeLesson.number).padStart(2, "0")}</TextLabel>
//                   <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black", dark ? "bg-sky-400/10 text-sky-300" : "bg-blue-50 text-blue-700")}>{displayDate(activeLesson.date)}</span></div>
//                 <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{activeLesson.title}</h2>
//                 <p className={cn("mt-3 text-sm leading-7", colors.muted)}>{activeLesson.description}</p>
//                 <p className="mt-3 flex items-center gap-2 text-xs font-extrabold text-blue-500"><FaClock /> 8:00 AM Eastern · End time not specified</p>
//                 <div className={cn("mt-5 border-t pt-5", colors.line)}><h3 className="text-sm font-extrabold">What you'll work on</h3>
//                   <ul className="mt-3 space-y-2">{activeLesson.tasks.map((task) => <li key={task} className="flex gap-2 text-xs leading-6"><FaCheck className="mt-1 shrink-0 text-blue-500" />{task}</li>)}</ul>
//                   <div className={cn(panelSmall, "mt-5 p-4 text-xs leading-6")}><strong>Expected evidence:</strong> {activeLesson.evidence}</div>
//                 </div>
//                 <label className={cn("mt-5 flex items-start gap-3 border-t pt-5 text-xs font-semibold", colors.line)}>
//                   <input type="checkbox" className="mt-0.5 h-4 w-4 accent-blue-600" checked={Boolean(progress[activeLesson.id]?.completed)}
//                     disabled={today < activeLesson.date} onChange={(e) => patchProgress(activeLesson.id, { completed: e.target.checked })} />
//                   <span>Mark class completed (self-reported) {today < activeLesson.date && <span className={colors.muted}>· Available after the scheduled date</span>}</span>
//                 </label>
//               </section>
//               <section className={cn(card, "p-5 sm:p-6")}>
//                 <h3 className="mb-4 flex items-center gap-2 text-base font-black"><FaVideo className="text-blue-500" /> Lesson recording</h3>
//                 <EmptyRecordings dark={dark} detail="No recording has been published for this class. The only available video is in the Orientation section." />
//                 <h3 className="mt-6 flex items-center gap-2 text-base font-black"><FaFileLines className="text-blue-500" /> Class materials</h3>
//                 <p className={cn("mt-3 text-sm", colors.muted)}>No class-specific documents have been published yet. The full program PowerPoint is available under Resources.</p>
//               </section>
//               <section className={cn(card, "p-5 sm:p-6")}>
//                 <h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-blue-500" /> Personal lesson notes</h3>
//                 <p className={cn("mt-2 text-xs leading-6", colors.muted)}>Saved in this browser for your account. Notes are not synced across devices.</p>
//                 <textarea value={progress[activeLesson.id]?.note || ""} onChange={(e) => patchProgress(activeLesson.id, { note: e.target.value })}
//                   placeholder="Write questions, SPL commands, ideas, or lesson notes..." rows={6}
//                   className={cn("mt-4 w-full resize-y rounded-xl border p-4 text-sm leading-6 outline-none focus:border-blue-400", colors.input)} />
//                 <p className={cn("mt-2 text-right text-[11px]", colors.muted)}>Autosaved on this device</p>
//               </section>
//             </div>
//           </div>
//         </>}

//         {view === "roadmap" && <>
//           <Heading dark={dark} label="Your program" title="Learning roadmap" detail="The updated program has two phases: certification preparation through December 2026, followed by ten practical classes and a capstone from January through March 2027." />
//           <section className={cn(card, "p-6 sm:p-8")}>
//             <h2 className="text-xl font-black">Important milestones</h2>
//             <div className="mt-7 space-y-0">{MILESTONES.map((item, index) => <div key={item.id} className="flex gap-4 sm:gap-5">
//               <div className="flex flex-col items-center"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c66d2] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
//                 {index !== MILESTONES.length - 1 && <span className={cn("my-1 w-px flex-1", dark ? "bg-white/15" : "bg-slate-200")} />}</div>
//               <div className={cn("min-w-0 flex-1 pb-8", index === MILESTONES.length - 1 && "pb-0")}>
//                 <p className="text-xs font-bold text-blue-500">{displayDate(item.date)}</p>
//                 <h3 className="mt-1 text-base font-black">{item.title}</h3>
//                 <p className={cn("mt-2 text-sm leading-6", colors.muted)}>{item.detail}</p>
//                 {item.kind === "class" && <button onClick={() => openLesson(item.id)} className="mt-2 text-xs font-bold text-blue-500 hover:underline">View class →</button>}
//               </div>
//             </div>)}</div>
//           </section>
//           <section className={cn(card, "p-6 sm:p-8")}><h2 className="text-xl font-black">Certification goals</h2>
//             <div className="mt-5 grid gap-4 md:grid-cols-2">{CERTIFICATIONS.map((item) => <div key={item.id} className={cn(panelSmall, "p-5")}>
//               <p className="text-xs font-black text-blue-500">Deadline · {displayDate(item.date)}</p><h3 className="mt-2 text-base font-black">{item.title}</h3>
//               <p className={cn("mt-3 text-xs leading-6", colors.muted)}>{item.topic}</p>
//               <button onClick={() => showDate(item.date)} className="mt-4 text-xs font-extrabold text-blue-500 hover:underline">Calendar date →</button>
//             </div>)}</div>
//           </section>
//         </>}

//         {view === "calendar" && <>
//           <Heading dark={dark} label="2026–2027 schedule" title="Learning calendar" detail="Class dates, certification deadlines and preparation milestones are shown in Eastern Time. Weekly check-ins are suggestions to contact your instructor, not booked live classes." />
//           <section className={cn(card, "p-4 sm:p-6")}>
//             <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{displayDate(`${month}-01`, { month: "long", year: "numeric" })}</h2>
//               <p className={cn("mt-1 text-xs", colors.muted)}>{eventsThisMonth.length} official event(s) this month</p></div>
//               <div className="flex gap-2"><button type="button" aria-label="Previous month" disabled={monthIndex === 0}
//                 onClick={() => setMonthIndex((n) => n - 1)} className={cn("rounded-xl border p-3 disabled:opacity-30", colors.line, colors.hover)}><FaChevronLeft /></button>
//                 <button type="button" aria-label="Next month" disabled={monthIndex === MONTHS.length - 1}
//                   onClick={() => setMonthIndex((n) => n + 1)} className={cn("rounded-xl border p-3 disabled:opacity-30", colors.line, colors.hover)}><FaChevronRight /></button></div></div>
//             <div className="mt-5 grid grid-cols-7 gap-1 text-center">
//               {WEEKDAYS.map((day) => <div key={day} className={cn("py-2 text-[10px] font-bold", colors.muted)}>{day}</div>)}
//               {calendarCells.map((date, index) => {
//                 const events = MILESTONES.filter((item) => item.date === date);
//                 const checkin = WEEKLY_CHECKINS.includes(date);
//                 const isSelected = selectedDate === date;
//                 return date ? <button type="button" key={date} onClick={() => setSelectedDate(date)}
//                   aria-pressed={isSelected} aria-label={`${displayDate(date)}${events.length ? `, ${events.map((item) => item.title).join(", ")}` : ""}${checkin ? ", suggested check-in" : ""}`}
//                   className={cn("flex h-16 flex-col items-center justify-start rounded-lg pt-2 text-xs font-bold transition sm:h-[86px]",
//                     isSelected ? "bg-[#0a62d2] text-white" : events.length ? dark ? "border border-blue-400/30 bg-blue-400/10 text-blue-100" : "border border-blue-200 bg-blue-50 text-blue-800" : dark ? "border border-white/5 text-slate-300 hover:bg-white/5" : "border border-slate-100 text-slate-700 hover:bg-slate-50") }>
//                   <span>{Number(date.slice(-2))}</span>
//                   {events.length > 0 && <span className={cn("mt-2 h-2 w-2 rounded-full", isSelected ? "bg-white" : events.some((item) => item.kind === "deadline") ? "bg-rose-500" : "bg-blue-600")} />}
//                   {checkin && <span className={cn("mt-1 text-[8px]", isSelected ? "text-white" : colors.muted)}>Check-in</span>}
//                 </button> : <div key={`empty-${index}`} />;
//               })}
//             </div>
//             <div className={cn("mt-5 flex flex-wrap gap-4 text-xs", colors.muted)}><span>🔵 Official class or milestone</span><span>🔴 Certification deadline</span><span>Check-in = suggested outreach</span></div>
//             <div className={cn("mt-6 border-t pt-5", colors.line)}>
//               <TextLabel dark={dark}>Selected date</TextLabel>
//               <h3 className="mt-2 text-base font-black">{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
//               <div className="mt-4"><EventRows events={chosenEvents} onSelect={showDate} dark={dark} />
//                 {chosenCheckin && <p className={cn(panelSmall, "mt-3 p-4 text-xs leading-6")}>Suggested weekly instructor check-in: send questions or a progress update. This is not a booked meeting.</p>}
//               </div>
//             </div>
//             <div className={cn("mt-6 border-t pt-5", colors.line)}><TextLabel dark={dark}>Official dates this month</TextLabel>
//               <div className="mt-3"><EventRows events={eventsThisMonth} onSelect={setSelectedDate} dark={dark} /></div>
//             </div>
//           </section>
//         </>}

//         {view === "lab" && <>
//           <Heading dark={dark} label="Your hands-on environment" title="Personal Splunk lab" detail="Your orientation presentation calls for one Proxmox server running eight Linux virtual machines. Hardware is an individual student requirement, and licensing needs to be arranged before training." />
//           <section className="grid gap-4 sm:grid-cols-3">
//             <StatCard Icon={FaServer} number="1" label="Physical server" detail="64 GB RAM recommended" dark={dark} />
//             <StatCard Icon={FaComputer} number="8" label="Virtual machines" detail="Separate Splunk roles" dark={dark} />
//             <StatCard Icon={FaHardDrive} number="560 GB" label="Guest disk budget" detail="Plus host overhead" dark={dark} />
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}>
//             <TextLabel dark={dark}>Hardware readiness</TextLabel><h2 className="mt-2 text-xl font-black">Prepare for January 9</h2>
//             <p className={cn("mt-3 text-sm leading-7", colors.muted)}>Recommended target: x86-64 CPU with VT-x/AMD-V, at least eight cores, 64 GB RAM, 1 TB SSD/NVMe and wired Ethernet. Also prepare your own laptop, bootable USB media, a private IP plan and backups.</p>
//             <div className="mt-5 flex flex-wrap gap-3"><a href={SERVER_URL} target="_blank" rel="noopener noreferrer" className={primary}>Instructor's server link <FaArrowRight /></a>
//               <a href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer" className={cn("rounded-xl border px-4 py-2.5 text-xs font-bold", colors.line, colors.hover)}>Program information ↗</a></div>
//             <p className={cn("mt-4 text-xs leading-6", colors.muted)}>Confirm RAM and storage configuration before purchase. Installing Proxmox may erase an existing disk; back up data first.</p>
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}><TextLabel dark={dark}>Lab architecture</TextLabel><h2 className="mt-2 text-xl font-black">How the eight VMs connect</h2>
//             <div className="mt-5 grid items-center gap-3 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr]">
//               <div className={cn(panelSmall, "p-4")}><p className="font-black">UF1 + UF2</p><p className={cn("mt-1 text-xs", colors.muted)}>Collect logs</p></div>
//               <FaArrowRight className="mx-auto rotate-90 text-blue-500 md:rotate-0" />
//               <div className={cn(panelSmall, "p-4")}><p className="font-black">IDX1–IDX3</p><p className={cn("mt-1 text-xs", colors.muted)}>Store and replicate</p></div>
//               <FaArrowRight className="mx-auto rotate-90 text-blue-500 md:rotate-0" />
//               <div className={cn(panelSmall, "p-4")}><p className="font-black">SH1</p><p className={cn("mt-1 text-xs", colors.muted)}>Search and dashboards</p></div>
//             </div>
//             <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className={cn(panelSmall, "p-4 text-xs")}><strong>CM1:</strong> Indexer cluster manager</div>
//               <div className={cn(panelSmall, "p-4 text-xs")}><strong>MC1:</strong> Deployment server, licensing, monitoring</div></div>
//             <p className={cn("mt-4 text-xs leading-6", colors.muted)}>Replication factor 2, search factor 2 are lab targets. All eight VMs on one physical server still share one hardware failure domain.</p>
//           </section>
//           <section className={cn(card, "overflow-hidden p-6 sm:p-7")}><h2 className="text-xl font-black">VM resource allocation</h2>
//             <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className={cn("border-b", colors.line)}><th className="py-3 pr-2">Role</th><th className="py-3 pr-2">Count</th><th className="py-3 pr-2">vCPU / VM</th><th className="py-3 pr-2">RAM / VM</th><th className="py-3">Disk / VM</th></tr></thead>
//               <tbody>{VM_ROLES.map((vm) => <tr key={vm.name} className={cn("border-b", colors.line)}><td className="py-3 pr-2 font-bold">{vm.name}</td><td className="py-3 pr-2">{vm.count}</td><td className="py-3 pr-2">{vm.cpu}</td><td className="py-3 pr-2">{vm.ram} GB</td><td className="py-3">{vm.disk} GB</td></tr>)}</tbody>
//               <tfoot><tr className="font-black"><td className="pt-4">Total</td><td className="pt-4">8</td><td className="pt-4">22</td><td className="pt-4">46 GB</td><td className="pt-4">560 GB</td></tr></tfoot></table></div>
//             <p className={cn("mt-4 text-xs", colors.muted)}>Guest allocation only; reserve RAM and disk for Proxmox and overhead.</p>
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}><div className="flex flex-wrap items-center justify-between gap-2"><div><TextLabel dark={dark}>Student checklist</TextLabel><h2 className="mt-2 text-xl font-black">Your preparation tasks</h2></div><span className={cn("text-xs font-bold", colors.muted)}>{readyCount}/{PREP_ITEMS.length} ready</span></div>
//             <div className="mt-5 grid gap-3 sm:grid-cols-2">{PREP_ITEMS.map((task) => <label key={task.id} className={cn(panelSmall, "flex cursor-pointer items-start gap-3 p-4 text-xs leading-6")}>
//               <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-blue-600" checked={Boolean(readiness[task.id]?.checked)} onChange={(e) => patchReadiness(task.id, { checked: e.target.checked })} />
//               <span className={readiness[task.id]?.checked ? "opacity-60 line-through" : ""}>{task.label}</span></label>)}</div>
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}><h2 className="text-xl font-black">Plan your Splunk licensing</h2>
//             <p className={cn("mt-3 text-sm leading-7", colors.muted)}>The orientation document describes a 60-day Enterprise trial, while the scheduled practical program runs 63 days. Plan for a legitimate eligible license that covers the entire lab. Developer licenses require eligibility and approval; Splunk Free does not substitute for Enterprise cluster features.</p>
//             <a className={cn(primary, "mt-5")} href={DEVELOPER_PROGRAM_URL} target="_blank" rel="noopener noreferrer">View developer program <FaArrowRight /></a>
//           </section>
//         </>}

//         {view === "resources" && <>
//           <Heading dark={dark} label="Learning materials" title="Resource library" detail="Your official 2026–2027 orientation PowerPoint, PDF preview, and introductory video are available now. New class files will appear when published." />
//           <section className={cn(card, "p-6 sm:p-7")}>
//             <div className="flex flex-wrap items-start justify-between gap-3"><div><TextLabel dark={dark}>Official 28-slide presentation</TextLabel><h2 className="mt-2 text-xl font-black">Splunk Orientation 2026 — Zero to Hero</h2>
//               <p className={cn("mt-2 text-xs leading-6", colors.muted)}>The unchanged PowerPoint you supplied, with a PDF version for easy viewing.</p></div>
//               <button className={primary} onClick={() => changeView("orientation")}>Preview materials <FaArrowRight /></button></div>
//             <div className="mt-5 grid gap-3 sm:grid-cols-2">
//               {/* <a href={ORIENTATION_SLIDES.powerpoint} download className={cn(panelSmall, "flex items-center gap-3 p-5 text-sm font-bold", colors.hover)}><FaDownload className="text-blue-500" />Download PowerPoint (.pptx)</a> */}

//               <a href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer" className={cn(panelSmall, "flex items-center gap-3 p-5 text-sm font-bold", colors.hover)}><FaFileLines className="text-blue-500" />Open PDF preview</a></div>
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}><h2 className="text-xl font-black">Training and preparation links</h2>
//             <div className="mt-5 grid gap-3 sm:grid-cols-2">
//               {[
//                 ["Orientation information", "Program details and entry information", ORIENTATION_URL],
//                 ["T.O Analytics study hub", "Certification preparation and practice", STUDY_HUB_URL],
//                 ["Recommended lab server", "Instructor's hardware suggestion", SERVER_URL],
//                 ["Splunk developer program", "Review licensing and eligibility", DEVELOPER_PROGRAM_URL],
//               ].map(([name, detail, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={cn(panelSmall, "flex items-center gap-3 p-4 transition", colors.hover)}>
//                 <FaArrowRight className="shrink-0 text-blue-500" /><div className="min-w-0"><h3 className="text-sm font-extrabold">{name}</h3><p className={cn("mt-1 text-xs leading-5", colors.muted)}>{detail}</p></div>
//               </a>)}
//             </div>
//           </section>
//           <section className={cn(card, "p-6 sm:p-7")}><EmptyRecordings dark={dark} detail="New class recordings, assignments and lesson slides will be published here when available." /></section>
//         </>}

//         <footer className={cn("flex flex-wrap items-center justify-between gap-4 border-t py-5 text-xs", colors.line, colors.muted)}>
//           <div><strong className={dark ? "text-white" : "text-slate-800"}>T.O Analytics LLC</strong> · Splunk 2026–2027 Program</div>
//           <div className="flex flex-wrap gap-4"><span>Notes and checklist saved locally</span><span>Official times: Eastern</span><a href={`mailto:${supportEmail}`} className="hover:text-blue-500">Support</a><button type="button" onClick={resetCurrentProgram} className="inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-600"><FaRotateRight /> Reset current progress</button></div>
//         </footer>
//       </div>
//     </div>
//   </main>;
// }

// // import React, { useEffect, useMemo, useState } from "react";
// // import {
// //   FaArrowRight, FaBookOpen, FaCalendarDays, FaCheck, FaChevronLeft,
// //   FaChevronRight, FaClock, FaComputer, FaDownload, FaFileLines,
// //   FaGraduationCap, FaHardDrive, FaLayerGroup, FaLink, FaListCheck,
// //   FaMoon, FaNoteSticky, FaServer, FaShieldHalved, FaSun, FaVideo,
// // } from "react-icons/fa6";
// // import {
// //   CERTIFICATIONS, COHORT_ID, DEVELOPER_PROGRAM_URL, LESSONS, MILESTONES,
// //   ORIENTATION_VIDEO, ORIENTATION_SLIDES,
// //   ORIENTATION_URL, PREP_ITEMS, SERVER_URL, STUDY_HUB_URL, VM_ROLES,
// //   WEEKLY_CHECKINS, displayDate, easternToday,
// // } from "./splunk2026Data";

// // const MENU = [
// //   ["overview", "Overview", FaLayerGroup],
// //   ["orientation", "Orientation", FaVideo],
// //   ["classes", "My classes", FaBookOpen],
// //   ["calendar", "Calendar", FaCalendarDays],
// //   ["lab", "My lab", FaServer],
// //   ["certifications", "Certifications", FaGraduationCap],
// //   ["resources", "Resources", FaFileLines],
// // ];
// // const MONTHS = ["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"];
// // const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// // const statusStyles = {
// //   class: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
// //   deadline: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-200",
// //   orientation: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
// //   reminder: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
// // };
// // const panel = "rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#182239]";
// // const muted = "text-slate-500 dark:text-slate-400";
// // const linkBase = "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500";

// // function safeLoad(key, fallback = {}) {
// //   try {
// //     const value = JSON.parse(localStorage.getItem(key) || "null");
// //     return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
// //   } catch { return fallback; }
// // }
// // function useLocalMap(key) {
// //   const [value, setValue] = useState(() => safeLoad(key));
// //   useEffect(() => { setValue(safeLoad(key)); }, [key]);
// //   const update = (id, patch) => setValue((current) => {
// //     const next = { ...current, [id]: { ...(current[id] || {}), ...patch } };
// //     try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage disabled */ }
// //     return next;
// //   });
// //   return [value, update];
// // }
// // function Label({ children }) {
// //   return <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">{children}</p>;
// // }
// // function SectionHeading({ eyebrow, title, description }) {
// //   return <div className="mb-6"><Label>{eyebrow}</Label><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>{description && <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>{description}</p>}</div>;
// // }
// // function Stat({ icon: Icon, number, name, detail }) {
// //   return <div className={`${panel} flex items-start justify-between gap-2 p-5`}>
// //     <div><p className={`text-xs font-bold ${muted}`}>{name}</p><p className="mt-2 text-3xl font-black">{number}</p><p className={`mt-2 text-[11px] ${muted}`}>{detail}</p></div>
// //     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"><Icon /></div>
// //   </div>;
// // }
// // function SmallDate({ date }) {
// //   return <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100">
// //     <span className="text-[10px] font-black uppercase">{displayDate(date, { month: "short" })}</span>
// //     <span className="text-lg font-black">{date.slice(-2)}</span>
// //   </div>;
// // }
// // function EventList({ events, selectDate, emptyMessage = "Nothing is scheduled for these dates." }) {
// //   return events.length ? <div className="space-y-2">
// //     {events.map((event) => <button key={event.id} type="button" onClick={() => selectDate?.(event.date)}
// //       className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:hover:bg-white/5">
// //       <SmallDate date={event.date} />
// //       <div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5">{event.title}</p><p className={`mt-1 text-xs ${muted}`}>{event.detail}</p></div>
// //       <span className={`hidden rounded-lg px-2 py-1 text-[10px] font-bold capitalize sm:inline ${statusStyles[event.kind] || statusStyles.reminder}`}>{event.kind}</span>
// //     </button>)}
// //   </div> : <p className={`rounded-xl border border-dashed border-slate-200 p-6 text-sm dark:border-white/10 ${muted}`}>{emptyMessage}</p>;
// // }

// // /** One Splunk dashboard for ALL enrolled students (existing and new). */
// // export default function NewCohortDashboard({ email = "" }) {
// //   const normalizedEmail = String(email).trim().toLowerCase();
// //   const storageKey = `cp_progress_${COHORT_ID}_${normalizedEmail}`;
// //   const prepKey = `cp_preparation_${COHORT_ID}_${normalizedEmail}`;
// //   const [progress, changeProgress] = useLocalMap(storageKey);
// //   const [prep, changePrep] = useLocalMap(prepKey);
// //   const [tab, setTab] = useState("overview");
// //   const [selectedLesson, setSelectedLesson] = useState(LESSONS[0].id);
// //   const [search, setSearch] = useState("");
// //   const [monthIndex, setMonthIndex] = useState(() => {
// //     const today = easternToday().slice(0, 7);
// //     return Math.max(0, Math.min(MONTHS.length - 1, MONTHS.indexOf(today) < 0 ? (today < MONTHS[0] ? 0 : 5) : MONTHS.indexOf(today)));
// //   });
// //   const [selectedDate, setSelectedDate] = useState(() => easternToday());
// //   const [dark, setDark] = useState(() => {
// //     try { return localStorage.getItem("to_2026_portal_theme") === "dark"; } catch { return false; }
// //   });
// //   useEffect(() => { try { localStorage.setItem("to_2026_portal_theme", dark ? "dark" : "light"); } catch { /* ignored */ } }, [dark]);

// //   const today = easternToday();
// //   const done = LESSONS.filter((lesson) => progress[lesson.id]?.completed).length;
// //   const ready = PREP_ITEMS.filter((item) => prep[item.id]?.checked).length;
// //   const pct = Math.round((done / LESSONS.length) * 100);
// //   const currentLesson = LESSONS.find((lesson) => lesson.id === selectedLesson) || LESSONS[0];
// //   const nextMilestone = MILESTONES.find((event) => event.date >= today);
// //   const nextClass = LESSONS.find((lesson) => lesson.date >= today);
// //   const month = MONTHS[monthIndex];
// //   const monthEvents = MILESTONES.filter((event) => event.date.startsWith(month));
// //   const filteredLessons = LESSONS.filter((lesson) => `${lesson.title} ${lesson.description} ${lesson.evidence}`.toLowerCase().includes(search.toLowerCase()));
// //   const calendarGrid = useMemo(() => {
// //     const [year, m] = month.split("-").map(Number);
// //     const first = new Date(Date.UTC(year, m - 1, 1));
// //     const offset = first.getUTCDay();
// //     const days = new Date(Date.UTC(year, m, 0)).getUTCDate();
// //     return Array.from({ length: Math.ceil((days + offset) / 7) * 7 }, (_, index) => {
// //       const day = index - offset + 1;
// //       return day >= 1 && day <= days ? `${month}-${String(day).padStart(2, "0")}` : null;
// //     });
// //   }, [month]);

// //   const openCalendar = (date) => {
// //     setSelectedDate(date);
// //     const index = MONTHS.indexOf(date.slice(0, 7));
// //     if (index >= 0) setMonthIndex(index);
// //     setTab("calendar");
// //   };
// //   const openClass = (id) => { setSelectedLesson(id); setTab("classes"); };
// //   const handleNav = (id) => { setTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
// //   const dateEvents = MILESTONES.filter((event) => event.date === selectedDate);
// //   const isCheckin = WEEKLY_CHECKINS.includes(selectedDate);

// //   return <div className={dark ? "dark" : ""}>
// //     <main className="min-h-screen bg-[#f7f6fc] text-slate-900 transition-colors dark:bg-[#0c1120] dark:text-slate-100">
// //       <header className="border-b border-violet-100 bg-white dark:border-white/10 dark:bg-[#12192b]">
// //         <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
// //           <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">T.O</div>
// //             <div><p className="text-sm font-black">T.O Analytics</p><p className={`text-[11px] ${muted}`}>Splunk Student Campus · 2026–2027</p></div></div>
// //           <div className="flex min-w-0 items-center gap-3"><span className="hidden max-w-56 truncate text-xs text-slate-500 md:block" title={normalizedEmail}>{normalizedEmail}</span>
// //             <span className="rounded-full bg-violet-100 px-3 py-1.5 text-[11px] font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">2026–2027 program</span>
// //             <button type="button" onClick={() => setDark((prev) => !prev)} aria-label="Toggle color theme" className="rounded-xl border border-slate-200 p-3 dark:border-white/10">{dark ? <FaSun /> : <FaMoon />}</button></div>
// //         </div>
// //       </header>
// //       <div className="mx-auto grid max-w-[1540px] gap-6 px-4 py-7 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10">
// //         <aside className="min-w-0"><div className={`${panel} p-4 lg:sticky lg:top-6`}>
// //           <div className="rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-900 p-4 text-white"><FaGraduationCap className="text-xl" /><h2 className="mt-3 text-base font-black">Zero to Hero</h2><p className="mt-1 text-xs text-violet-100">2026–2027 training program</p></div>
// //           <p className={`mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest ${muted}`}>Your workspace</p>
// //           <nav aria-label="Cohort dashboard sections" className="grid grid-cols-2 gap-2 lg:grid-cols-1">{MENU.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => handleNav(id)}
// //             className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm ${tab === id ? "bg-violet-700 text-white" : "text-slate-600 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-white/10"}`}><Icon className="shrink-0" />{label}</button>)}</nav>
// //           <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10"><div className="flex justify-between text-xs"><span className="font-bold">Completed sessions</span><span className="font-black text-violet-600 dark:text-violet-300">{pct}%</span></div>
// //             <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} /></div><p className={`mt-2 text-[11px] ${muted}`}>{done} of 10 · self-reported on this device</p></div>
// //         </div></aside>
// //         <div className="min-w-0 space-y-6">
// //           {tab === "overview" && <>
// //             <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2b1749] via-[#5d21a6] to-[#8438c5] p-6 text-white shadow-lg sm:p-9">
// //               <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" /><div className="relative z-10 max-w-3xl">
// //                 <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold"><FaGraduationCap /> SPLUNK TRAINING · 2026–2027</span>
// //                 <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">Welcome to your Splunk learning dashboard.</h1>
// //                 <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">Everyone follows the same updated program: prepare for both certification deadlines, get your personal lab ready, and follow the ten-Saturday hands-on curriculum. Start with the one available orientation video and your updated orientation slides. Class recordings will be published as the program progresses.</p>
// //                 <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => handleNav("classes")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-violet-800 hover:bg-violet-50">Explore 10 classes <FaArrowRight /></button><button onClick={() => handleNav("orientation")} className="rounded-xl border border-white/30 px-5 py-3 text-xs font-black hover:bg-white/10">Watch orientation video</button></div>
// //               </div>
// //             </section>
// //             <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Cohort summary">
// //               <Stat icon={FaBookOpen} number="10" name="Official classes" detail="Jan 9 – Mar 13, 2027" />
// //               <Stat icon={FaShieldHalved} number="02" name="Certification deadlines" detail="Nov 28 and Dec 19" />
// //               <Stat icon={FaComputer} number="08" name="Planned virtual machines" detail="One personal Proxmox host" />
// //               <Stat icon={FaCheck} number={`${ready}/${PREP_ITEMS.length}`} name="Readiness tasks" detail="Your personal prep checklist" />
// //             </section>
// //             {/* The only retained recording is the original orientation video. */}
// //             <section className={`${panel} overflow-hidden p-5 sm:p-7`} aria-label="Orientation video and slides">
// //               <div className="flex flex-wrap items-center justify-between gap-3">
// //                 <div><Label>Start here · One video available</Label><h2 className="mt-2 text-xl font-black">Splunk orientation &amp; 2026–2027 program guide</h2><p className={`mt-2 text-sm ${muted}`}>Watch the introductory video, then review the official 28-slide orientation presentation.</p></div>
// //                 <button type="button" onClick={() => handleNav("orientation")} className={linkBase}>Open orientation <FaArrowRight /></button>
// //               </div>
// //               <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
// //                 <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-white/10">
// //                   <iframe title={ORIENTATION_VIDEO.title} src={ORIENTATION_VIDEO.url} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
// //                 </div>
// //                 <div className="flex flex-col justify-center rounded-2xl border border-violet-100 bg-violet-50 p-5 dark:border-violet-500/20 dark:bg-violet-500/10">
// //                   <FaFileLines className="text-2xl text-violet-600 dark:text-violet-300" />
// //                   <h3 className="mt-3 text-base font-black">Splunk Orientation 2026</h3>
// //                   <p className={`mt-2 text-xs leading-6 ${muted}`}>All 28 slides: certification deadlines, lab hardware, eight virtual machines and the ten-Saturday curriculum.</p>
// //                   <button type="button" onClick={() => handleNav("orientation")} className={`${linkBase} mt-5`}>Read the slides <FaArrowRight /></button>
// //                   <a href={ORIENTATION_SLIDES.powerpoint} download className="mt-3 text-center text-xs font-bold text-violet-700 underline dark:text-violet-300">Download PowerPoint</a>
// //                 </div>
// //               </div>
// //             </section>
// //             <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
// //               <section className={`${panel} p-5 sm:p-7`}><Label>Your next milestone</Label>
// //                 {nextMilestone ? <><h2 className="mt-3 text-xl font-black">{nextMilestone.title}</h2><p className={`mt-2 text-sm ${muted}`}>{displayDate(nextMilestone.date)} · {nextMilestone.detail}</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => openCalendar(nextMilestone.date)} className={linkBase}>See the date <FaArrowRight /></button>{nextClass && <button onClick={() => openClass(nextClass.id)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">Preview next class</button>}</div></> : <p className={`mt-3 text-sm ${muted}`}>All listed milestones have passed.</p>}
// //                 <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Two program phases</Label><div className="mt-4 grid gap-3 sm:grid-cols-2">
// //                   <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="text-xs font-black text-violet-700 dark:text-violet-200">01 · Oct–Dec 2026</p><h3 className="mt-2 text-sm font-black">Certification preparation</h3><p className={`mt-2 text-xs leading-5 ${muted}`}>Study the Power User blueprint first, then Admin. Contact the instructor weekly.</p></div>
// //                   <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="text-xs font-black text-violet-700 dark:text-violet-200">02 · Jan–Mar 2027</p><h3 className="mt-2 text-sm font-black">Distributed lab build</h3><p className={`mt-2 text-xs leading-5 ${muted}`}>Ten practical Saturday sessions ending in a capstone demonstration.</p></div>
// //                 </div></div>
// //               </section>
// //               <section className={`${panel} p-5 sm:p-7`}><div className="flex items-center justify-between gap-3"><Label>Before Jan 9</Label><span className={`text-xs font-bold ${muted}`}>{ready}/{PREP_ITEMS.length} ready</span></div><h2 className="mt-2 text-xl font-black">Your preparation checklist</h2><div className="mt-5 space-y-3">{PREP_ITEMS.map((item) => <label key={item.id} className="flex cursor-pointer gap-3 text-xs leading-5"><input type="checkbox" checked={Boolean(prep[item.id]?.checked)} onChange={(event) => changePrep(item.id, { checked: event.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-violet-700" /><span className={prep[item.id]?.checked ? `text-slate-400 line-through` : ""}>{item.label}</span></label>)}</div><button onClick={() => handleNav("lab")} className="mt-6 text-xs font-bold text-violet-600 hover:underline dark:text-violet-300">View full lab requirements →</button></section>
// //             </div>
// //             <section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center justify-between gap-3"><div><Label>Official schedule</Label><h2 className="mt-2 text-xl font-black">Coming up</h2></div><button onClick={() => handleNav("calendar")} className="text-xs font-bold text-violet-600 dark:text-violet-300">Full calendar →</button></div><div className="mt-4"><EventList events={MILESTONES.filter((e) => e.date >= today).slice(0, 4)} selectDate={openCalendar} /></div><p className={`mt-4 text-xs ${muted}`}>Official class times are 8:00 AM Eastern. Weekly check-ins are suggested outreach reminders, not booked sessions.</p></section>
// //           </>}

// //           {tab === "orientation" && <>
// //             <SectionHeading eyebrow="2026–2027 Splunk training" title="Your orientation materials" description="Start with the one available video and the complete orientation presentation. This is the starting point for every enrolled student. The ten scheduled classes have no published recordings yet." />
// //             <section className={`${panel} p-5 sm:p-7`}>
// //               <div className="flex flex-wrap items-start justify-between gap-3"><div><Label>Available recording · 1 of 1</Label><h3 className="mt-2 text-xl font-black">{ORIENTATION_VIDEO.title}</h3><p className={`mt-2 text-sm ${muted}`}>An introductory Splunk orientation video retained from your existing video library.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Available to watch</span></div>
// //               <div className="mt-5 overflow-hidden rounded-2xl bg-black"><iframe title={ORIENTATION_VIDEO.title} src={ORIENTATION_VIDEO.url} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
// //               <p className={`mt-4 text-xs ${muted}`}>There are no other class recordings in the student dashboard. New class recordings can be published when ready.</p>
// //             </section>
// //             <section className={`${panel} p-5 sm:p-7`}>
// //               <div className="flex flex-wrap items-center justify-between gap-4"><div><Label>Official presentation · 28 slides</Label><h3 className="mt-2 text-xl font-black">Splunk Orientation 2026 — Zero to Hero</h3><p className={`mt-2 text-xs ${muted}`}>October 31, 2026 · 8:00–10:00 AM Eastern</p></div><div className="flex flex-wrap gap-2"><a className={linkBase} href={ORIENTATION_SLIDES.powerpoint} download><FaDownload /> Download PPTX</a><a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-white/10" href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer">Open PDF <FaArrowRight /></a></div></div>
// //               <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"><iframe title="2026–2027 Splunk orientation slides, 28-page PDF" src={`${ORIENTATION_SLIDES.pdf}#view=FitH`} className="h-[520px] w-full bg-white sm:h-[700px]" loading="lazy" /></div>
// //               <p className={`mt-3 text-xs ${muted}`}>If your browser cannot display the slides, use Open PDF or Download PPTX above.</p>
// //             </section>
// //           </>}

// //           {tab === "classes" && <>
// //             <SectionHeading eyebrow="Your curriculum" title="My classes" description="Ten planned practical sessions. All ten class recordings are currently unpublished; the only available video is in the Orientation section. You can save your own notes now." />
// //             <div className="grid gap-5 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.4fr)]">
// //               <div className={`${panel} self-start p-4`}><label className={`text-xs font-black ${muted}`} htmlFor="cohort-search">Find a class</label><input id="cohort-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search class topics..." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#101827]" />
// //                 <div className="mt-4 max-h-[650px] space-y-2 overflow-auto">{filteredLessons.map((lesson) => <button key={lesson.id} onClick={() => setSelectedLesson(lesson.id)} className={`flex w-full gap-3 rounded-xl border p-3 text-left ${selectedLesson === lesson.id ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-700 text-xs font-black text-white">{String(lesson.number).padStart(2, "0")}</span><div><p className="text-xs font-black leading-5">{lesson.title}</p><p className={`mt-1 text-[11px] ${muted}`}>{displayDate(lesson.date)} · {progress[lesson.id]?.completed ? "Completed (self-reported)" : "Scheduled"}</p></div></button>)}{filteredLessons.length === 0 && <p className={`p-4 text-xs ${muted}`}>No matching classes.</p>}</div>
// //               </div>
// //               <div className="min-w-0 space-y-4"><section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center gap-2"><Label>Class {String(currentLesson.number).padStart(2, "0")}</Label><span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{displayDate(currentLesson.date)}</span></div>
// //                 <h2 className="mt-3 text-2xl font-black">{currentLesson.title}</h2><p className={`mt-3 text-sm leading-7 ${muted}`}>{currentLesson.description}</p><p className="mt-3 flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-300"><FaClock /> 8:00 AM Eastern · End time not announced</p><div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><h3 className="text-sm font-black">What you will work on</h3><ul className="mt-3 space-y-2">{currentLesson.tasks.map((task) => <li key={task} className="flex gap-2 text-xs leading-6"><FaCheck className="mt-1 shrink-0 text-violet-600" />{task}</li>)}</ul><div className="mt-5 rounded-xl bg-violet-50 p-4 text-xs leading-6 dark:bg-violet-500/10"><strong>Expected evidence:</strong> {currentLesson.evidence}</div></div>
// //                 <label className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-5 text-xs font-bold dark:border-white/10"><input type="checkbox" className="h-4 w-4 accent-violet-700" checked={Boolean(progress[currentLesson.id]?.completed)} onChange={(event) => changeProgress(currentLesson.id, { completed: event.target.checked })} disabled={today < currentLesson.date} />Mark lab session completed (self-reported) {today < currentLesson.date && <span className={`font-normal ${muted}`}>· Available after class date</span>}</label>
// //               </section>
// //               <section className={`${panel} p-5 sm:p-7`}><h3 className="flex items-center gap-2 text-base font-black"><FaVideo className="text-violet-600" /> Class recordings</h3><div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-white/15"><p className="text-sm font-bold">No recordings published yet</p><p className={`mt-2 text-xs ${muted}`}>This class has no published recording. The one available orientation video is in the Orientation section.</p></div><h3 className="mt-6 flex items-center gap-2 text-base font-black"><FaFileLines className="text-violet-600" /> Course documents</h3><p className={`mt-3 text-xs ${muted}`}>No class documents have been published for this lesson.</p></section>
// //               <section className={`${panel} p-5 sm:p-7`}><h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-violet-600" /> My private notes</h3><p className={`mt-2 text-xs ${muted}`}>Saved in this browser for this student and cohort. They are not yet synced across devices.</p><textarea value={progress[currentLesson.id]?.note || ""} onChange={(event) => changeProgress(currentLesson.id, { note: event.target.value })} rows={6} placeholder="Write your questions, commands, practice notes or study plan..." className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#101827]" /></section></div>
// //             </div>
// //           </>}

// //           {tab === "calendar" && <><SectionHeading eyebrow="2026–2027" title="Learning calendar" description="Official classes, deadlines and preparation reminders. Times are shown in Eastern Time (America/New_York)." />
// //             <section className={`${panel} p-4 sm:p-6`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xl font-black">{displayDate(`${month}-01`, { month: "long", year: "numeric" })}</p><p className={`mt-1 text-xs ${muted}`}>{monthEvents.length} official event(s) this month</p></div><div className="flex gap-2"><button type="button" disabled={monthIndex === 0} onClick={() => setMonthIndex((m) => m - 1)} aria-label="Previous month" className="rounded-xl border border-slate-200 p-3 disabled:opacity-30 dark:border-white/10"><FaChevronLeft /></button><button type="button" disabled={monthIndex === MONTHS.length - 1} onClick={() => setMonthIndex((m) => m + 1)} aria-label="Next month" className="rounded-xl border border-slate-200 p-3 disabled:opacity-30 dark:border-white/10"><FaChevronRight /></button></div></div>
// //               <div className="mt-5 grid grid-cols-7 gap-1 text-center">{WEEKDAYS.map((d) => <div key={d} className={`py-2 text-[10px] font-bold ${muted}`}>{d}</div>)}{calendarGrid.map((date, index) => {
// //                 const events = MILESTONES.filter((event) => event.date === date);
// //                 const checkin = WEEKLY_CHECKINS.includes(date);
// //                 const selected = date && selectedDate === date;
// //                 return date ? <button key={date} type="button" onClick={() => setSelectedDate(date)} aria-pressed={selected} aria-label={`${displayDate(date)}${events.length ? `, ${events.map((e) => e.title).join(", ")}` : ""}${checkin ? ", suggested check-in" : ""}`} className={`relative flex h-16 flex-col items-center justify-start rounded-lg pt-2 text-xs font-bold transition sm:h-[86px] ${selected ? "bg-violet-700 text-white" : events.length ? "border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200" : "border border-slate-100 text-slate-700 hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"}`}><span>{Number(date.slice(-2))}</span>{events.length > 0 && <span className={`mt-2 h-2 w-2 rounded-full ${selected ? "bg-white" : events.some((e) => e.kind === "deadline") ? "bg-pink-500" : "bg-violet-600"}`} />}{checkin && <span className={`mt-1 text-[8px] ${selected ? "text-white" : "text-slate-400"}`}>Check-in</span>}</button> : <div key={`blank-${index}`} />;
// //               })}</div><div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400"><span>🟣 Official class or milestone</span><span>🩷 Certification deadline</span><span>Check-in = suggested outreach, not a meeting</span></div>
// //               <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Selected date</Label><h3 className="mt-2 text-base font-black">{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><div className="mt-4"><EventList events={dateEvents} />{isCheckin && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 dark:bg-white/5">Suggested weekly instructor check-in: send questions or progress updates. This is not a booked class.</p>}</div></div>
// //               <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Official dates this month</Label><div className="mt-3"><EventList events={monthEvents} selectDate={setSelectedDate} /></div></div>
// //             </section></>}

// //           {tab === "lab" && <><SectionHeading eyebrow="Your practical environment" title="Personal Splunk lab" description="Your orientation document calls for a personal Proxmox server with eight virtual machines. These are lab planning targets, not a claim that hardware or licensing is included in tuition." />
// //             <div className="grid gap-4 sm:grid-cols-3"><Stat icon={FaServer} name="Physical host" number="1" detail="64 GB RAM target" /><Stat icon={FaComputer} name="Virtual machines" number="8" detail="Distinct Splunk roles" /><Stat icon={FaHardDrive} name="Guest storage budget" number="560 GB" detail="Plus host overhead" /></div>
// //             <section className={`${panel} p-5 sm:p-7`}><Label>Hardware readiness</Label><h3 className="mt-2 text-xl font-black">Recommended lab host target</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>x86-64 CPU with VT-x/AMD-V, at least eight cores, 64 GB RAM, 1 TB SSD/NVMe and wired Ethernet. Prepare a separate laptop, bootable USB media and reliable local networking.</p><div className="mt-5 flex flex-wrap gap-3"><a className={linkBase} href={SERVER_URL} target="_blank" rel="noopener noreferrer">Instructor's server link <FaArrowRight /></a><a className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-white/10" href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer">Orientation page</a></div><p className={`mt-4 text-xs ${muted}`}>Confirm the exact RAM/storage configuration and purchase details before ordering. Back up the chosen disk before installing Proxmox.</p></section>
// //             <section className={`${panel} p-5 sm:p-7`}><Label>Architecture overview</Label><h3 className="mt-2 text-xl font-black">How the eight VMs work together</h3><div className="mt-5 grid items-center gap-2 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr]"><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="font-black">UF1 + UF2</p><p className={`mt-1 text-xs ${muted}`}>Collect logs</p></div><FaArrowRight className="mx-auto rotate-90 text-violet-500 md:rotate-0" /><div className="rounded-2xl bg-violet-100 p-4 dark:bg-violet-500/20"><p className="font-black">IDX1–IDX3</p><p className={`mt-1 text-xs ${muted}`}>Store and replicate</p></div><FaArrowRight className="mx-auto rotate-90 text-violet-500 md:rotate-0" /><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="font-black">SH1</p><p className={`mt-1 text-xs ${muted}`}>Search and dashboards</p></div></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10"><strong>CM1:</strong> Indexer cluster manager</div><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10"><strong>MC1:</strong> Deployment, licensing and monitoring</div></div><p className={`mt-4 text-xs leading-6 ${muted}`}>Lab target: replication factor 2, search factor 2. All VMs live on a single physical host, so physical redundancy is not provided.</p></section>
// //             <section className={`${panel} overflow-hidden p-5 sm:p-7`}><h3 className="text-xl font-black">Starting virtual machine budget</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className="border-b border-slate-200 dark:border-white/10"><th className="py-3 pr-3">Role</th><th className="py-3 pr-3">Count</th><th className="py-3 pr-3">vCPU / VM</th><th className="py-3 pr-3">RAM / VM</th><th className="py-3">Disk / VM</th></tr></thead><tbody>{VM_ROLES.map((vm) => <tr key={vm.name} className="border-b border-slate-100 dark:border-white/10"><td className="py-3 pr-3 font-bold">{vm.name}</td><td className="py-3 pr-3">{vm.count}</td><td className="py-3 pr-3">{vm.cpu}</td><td className="py-3 pr-3">{vm.ram} GB</td><td className="py-3">{vm.disk} GB</td></tr>)}</tbody><tfoot><tr className="font-black"><td className="pt-4">Total</td><td className="pt-4">8</td><td className="pt-4">22</td><td className="pt-4">46 GB</td><td className="pt-4">560 GB</td></tr></tfoot></table></div><p className={`mt-4 text-xs ${muted}`}>These are starting resource allocations. CPU oversubscription assumes light lab use; reserve host overhead.</p></section>
// //             <section className={`${panel} p-5 sm:p-7`}><h3 className="text-xl font-black">Licensing must cover the lab</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>The slides note a 60-day Enterprise trial while the scheduled lab spans 63 days. Arrange an authorized training or otherwise eligible license for the full practical period. Splunk Free is not a distributed-cluster substitute; developer-program licensing is subject to eligibility and approval.</p><a className={`${linkBase} mt-5`} href={DEVELOPER_PROGRAM_URL} target="_blank" rel="noopener noreferrer">View developer program <FaArrowRight /></a></section>
// //           </>}

// //           {tab === "certifications" && <><SectionHeading eyebrow="Phase one · Oct–Dec 2026" title="Certification preparation" description="Complete the Power User goal first, then prepare for Enterprise Admin. The dates below are the cohort's deadlines, not automatically booked exam appointments." />
// //             <div className="grid gap-5 lg:grid-cols-2">{CERTIFICATIONS.map((cert, index) => <article key={cert.id} className={`${panel} p-6 sm:p-7`}><div className="flex items-start justify-between gap-4"><div><Label>Goal {String(index + 1).padStart(2, "0")}</Label><h3 className="mt-2 text-xl font-black">{cert.title}</h3></div><FaShieldHalved className="text-xl text-violet-600" /></div><p className="mt-5 text-sm font-black text-pink-600 dark:text-pink-300">Deadline: {displayDate(cert.date)}</p><p className={`mt-3 text-sm ${muted}`}><strong>Focus:</strong> {cert.topic}</p><p className={`mt-3 text-sm leading-7 ${muted}`}>{cert.description}</p><button type="button" onClick={() => openCalendar(cert.date)} className={`${linkBase} mt-6`}>View deadline <FaArrowRight /></button></article>)}</div>
// //             <section className={`${panel} p-5 sm:p-7`}><h3 className="text-xl font-black">Weekly check-in plan</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>Through December, contact the instructor every week with your progress, difficult topics and exam questions. These are suggested outreach reminders, not scheduled live meetings. Use official exam blueprints and the T.O. Analytics study hub.</p><a href={STUDY_HUB_URL} target="_blank" rel="noopener noreferrer" className={`${linkBase} mt-5`}>Open study hub <FaArrowRight /></a></section>
// //           </>}

// //           {tab === "resources" && <><SectionHeading eyebrow="Course links" title="Student resources" description="The official orientation presentation and one orientation video are available now. The ten class recordings and class-specific documents remain unpublished." />
// //             <section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center justify-between gap-3"><div><Label>Orientation slides</Label><h3 className="mt-2 text-xl font-black">Official 2026–2027 presentation</h3><p className={`mt-2 text-xs ${muted}`}>28-slide guide from your attached PowerPoint.</p></div><button type="button" onClick={() => handleNav("orientation")} className={linkBase}>View slides <FaArrowRight /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><a className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800 transition hover:bg-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-violet-200" href={ORIENTATION_SLIDES.powerpoint} download><FaDownload className="mb-2" />Download full PowerPoint (.pptx)</a><a className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800 transition hover:bg-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-violet-200" href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer"><FaFileLines className="mb-2" />Open slide preview (.pdf)</a></div></section>
// //             <section className={`${panel} p-5 sm:p-7`}><div className="grid gap-3 sm:grid-cols-2">{[
// //               ["Orientation information", "Program overview and entry information", ORIENTATION_URL],
// //               ["T.O. Analytics study hub", "Preparation and practice materials", STUDY_HUB_URL],
// //               ["Recommended server", "Instructor-provided hardware suggestion", SERVER_URL],
// //               ["Splunk developer program", "Check license eligibility and requirements", DEVELOPER_PROGRAM_URL],
// //             ].map(([title, description, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-400 dark:border-white/10"><FaLink className="mt-1 shrink-0 text-violet-600" /><div><h3 className="text-sm font-black">{title}</h3><p className={`mt-1 text-xs leading-5 ${muted}`}>{description}</p></div><FaArrowRight className="ml-auto shrink-0 text-violet-600" /></a>)}</div>
// //               <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-7 text-center dark:border-white/15"><FaVideo className="mx-auto text-2xl text-violet-600" /><h3 className="mt-3 font-black">One orientation video · Class recordings pending</h3><p className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${muted}`}>Your orientation video and presentation are available. All ten classes start without previous recordings, slides or assignments. New class materials can be added when published.</p></div>
// //             </section></>}

// //           <footer className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs dark:border-white/10 ${muted}`}><p>© {new Date().getFullYear()} T.O Analytics LLC · 2026–2027 program</p><span>Notes & checklist saved on this device · All class start times Eastern</span></footer>
// //         </div>
// //       </div>
// //     </main>
// //   </div>;
// // }

// // // import React, { useEffect, useMemo, useState } from "react";
// // // import {
// // //   FaArrowRight, FaBookOpen, FaCalendarDays, FaCheck, FaChevronLeft,
// // //   FaChevronRight, FaClock, FaComputer, FaDownload, FaFileLines,
// // //   FaGraduationCap, FaHardDrive, FaLayerGroup, FaLink, FaListCheck,
// // //   FaMoon, FaNoteSticky, FaServer, FaShieldHalved, FaSun, FaVideo,
// // // } from "react-icons/fa6";
// // // import {
// // //   CERTIFICATIONS, COHORT_ID, DEVELOPER_PROGRAM_URL, LESSONS, MILESTONES,
// // //   ORIENTATION_VIDEO, ORIENTATION_SLIDES,
// // //   ORIENTATION_URL, PREP_ITEMS, SERVER_URL, STUDY_HUB_URL, VM_ROLES,
// // //   WEEKLY_CHECKINS, displayDate, easternToday,
// // // } from "./splunk2026Data";

// // // const MENU = [
// // //   ["overview", "Overview", FaLayerGroup],
// // //   ["orientation", "Orientation", FaVideo],
// // //   ["classes", "My classes", FaBookOpen],
// // //   ["calendar", "Calendar", FaCalendarDays],
// // //   ["lab", "My lab", FaServer],
// // //   ["certifications", "Certifications", FaGraduationCap],
// // //   ["resources", "Resources", FaFileLines],
// // // ];
// // // const MONTHS = ["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"];
// // // const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// // // const statusStyles = {
// // //   class: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
// // //   deadline: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-200",
// // //   orientation: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
// // //   reminder: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
// // // };
// // // const panel = "rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#182239]";
// // // const muted = "text-slate-500 dark:text-slate-400";
// // // const linkBase = "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500";

// // // function safeLoad(key, fallback = {}) {
// // //   try {
// // //     const value = JSON.parse(localStorage.getItem(key) || "null");
// // //     return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
// // //   } catch { return fallback; }
// // // }
// // // function useLocalMap(key) {
// // //   const [value, setValue] = useState(() => safeLoad(key));
// // //   useEffect(() => { setValue(safeLoad(key)); }, [key]);
// // //   const update = (id, patch) => setValue((current) => {
// // //     const next = { ...current, [id]: { ...(current[id] || {}), ...patch } };
// // //     try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage disabled */ }
// // //     return next;
// // //   });
// // //   return [value, update];
// // // }
// // // function Label({ children }) {
// // //   return <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">{children}</p>;
// // // }
// // // function SectionHeading({ eyebrow, title, description }) {
// // //   return <div className="mb-6"><Label>{eyebrow}</Label><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>{description && <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>{description}</p>}</div>;
// // // }
// // // function Stat({ icon: Icon, number, name, detail }) {
// // //   return <div className={`${panel} flex items-start justify-between gap-2 p-5`}>
// // //     <div><p className={`text-xs font-bold ${muted}`}>{name}</p><p className="mt-2 text-3xl font-black">{number}</p><p className={`mt-2 text-[11px] ${muted}`}>{detail}</p></div>
// // //     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"><Icon /></div>
// // //   </div>;
// // // }
// // // function SmallDate({ date }) {
// // //   return <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100">
// // //     <span className="text-[10px] font-black uppercase">{displayDate(date, { month: "short" })}</span>
// // //     <span className="text-lg font-black">{date.slice(-2)}</span>
// // //   </div>;
// // // }
// // // function EventList({ events, selectDate, emptyMessage = "Nothing is scheduled for these dates." }) {
// // //   return events.length ? <div className="space-y-2">
// // //     {events.map((event) => <button key={event.id} type="button" onClick={() => selectDate?.(event.date)}
// // //       className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:hover:bg-white/5">
// // //       <SmallDate date={event.date} />
// // //       <div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5">{event.title}</p><p className={`mt-1 text-xs ${muted}`}>{event.detail}</p></div>
// // //       <span className={`hidden rounded-lg px-2 py-1 text-[10px] font-bold capitalize sm:inline ${statusStyles[event.kind] || statusStyles.reminder}`}>{event.kind}</span>
// // //     </button>)}
// // //   </div> : <p className={`rounded-xl border border-dashed border-slate-200 p-6 text-sm dark:border-white/10 ${muted}`}>{emptyMessage}</p>;
// // // }

// // // /** Dedicated dashboard for an authenticated and server-enrolled October 2026 student. */
// // // export default function NewCohortDashboard({ email = "" }) {
// // //   const normalizedEmail = String(email).trim().toLowerCase();
// // //   const storageKey = `cp_progress_${COHORT_ID}_${normalizedEmail}`;
// // //   const prepKey = `cp_preparation_${COHORT_ID}_${normalizedEmail}`;
// // //   const [progress, changeProgress] = useLocalMap(storageKey);
// // //   const [prep, changePrep] = useLocalMap(prepKey);
// // //   const [tab, setTab] = useState("overview");
// // //   const [selectedLesson, setSelectedLesson] = useState(LESSONS[0].id);
// // //   const [search, setSearch] = useState("");
// // //   const [monthIndex, setMonthIndex] = useState(() => {
// // //     const today = easternToday().slice(0, 7);
// // //     return Math.max(0, Math.min(MONTHS.length - 1, MONTHS.indexOf(today) < 0 ? (today < MONTHS[0] ? 0 : 5) : MONTHS.indexOf(today)));
// // //   });
// // //   const [selectedDate, setSelectedDate] = useState(() => easternToday());
// // //   const [dark, setDark] = useState(() => {
// // //     try { return localStorage.getItem("to_2026_portal_theme") === "dark"; } catch { return false; }
// // //   });
// // //   useEffect(() => { try { localStorage.setItem("to_2026_portal_theme", dark ? "dark" : "light"); } catch { /* ignored */ } }, [dark]);

// // //   const today = easternToday();
// // //   const done = LESSONS.filter((lesson) => progress[lesson.id]?.completed).length;
// // //   const ready = PREP_ITEMS.filter((item) => prep[item.id]?.checked).length;
// // //   const pct = Math.round((done / LESSONS.length) * 100);
// // //   const currentLesson = LESSONS.find((lesson) => lesson.id === selectedLesson) || LESSONS[0];
// // //   const nextMilestone = MILESTONES.find((event) => event.date >= today);
// // //   const nextClass = LESSONS.find((lesson) => lesson.date >= today);
// // //   const month = MONTHS[monthIndex];
// // //   const monthEvents = MILESTONES.filter((event) => event.date.startsWith(month));
// // //   const filteredLessons = LESSONS.filter((lesson) => `${lesson.title} ${lesson.description} ${lesson.evidence}`.toLowerCase().includes(search.toLowerCase()));
// // //   const calendarGrid = useMemo(() => {
// // //     const [year, m] = month.split("-").map(Number);
// // //     const first = new Date(Date.UTC(year, m - 1, 1));
// // //     const offset = first.getUTCDay();
// // //     const days = new Date(Date.UTC(year, m, 0)).getUTCDate();
// // //     return Array.from({ length: Math.ceil((days + offset) / 7) * 7 }, (_, index) => {
// // //       const day = index - offset + 1;
// // //       return day >= 1 && day <= days ? `${month}-${String(day).padStart(2, "0")}` : null;
// // //     });
// // //   }, [month]);

// // //   const openCalendar = (date) => {
// // //     setSelectedDate(date);
// // //     const index = MONTHS.indexOf(date.slice(0, 7));
// // //     if (index >= 0) setMonthIndex(index);
// // //     setTab("calendar");
// // //   };
// // //   const openClass = (id) => { setSelectedLesson(id); setTab("classes"); };
// // //   const handleNav = (id) => { setTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
// // //   const dateEvents = MILESTONES.filter((event) => event.date === selectedDate);
// // //   const isCheckin = WEEKLY_CHECKINS.includes(selectedDate);

// // //   return <div className={dark ? "dark" : ""}>
// // //     <main className="min-h-screen bg-[#f7f6fc] text-slate-900 transition-colors dark:bg-[#0c1120] dark:text-slate-100">
// // //       <header className="border-b border-violet-100 bg-white dark:border-white/10 dark:bg-[#12192b]">
// // //         <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
// // //           <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">T.O</div>
// // //             <div><p className="text-sm font-black">T.O Analytics</p><p className={`text-[11px] ${muted}`}>Splunk Student Campus · 2026–2027</p></div></div>
// // //           <div className="flex min-w-0 items-center gap-3"><span className="hidden max-w-56 truncate text-xs text-slate-500 md:block" title={normalizedEmail}>{normalizedEmail}</span>
// // //             <span className="rounded-full bg-violet-100 px-3 py-1.5 text-[11px] font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">New cohort</span>
// // //             <button type="button" onClick={() => setDark((prev) => !prev)} aria-label="Toggle color theme" className="rounded-xl border border-slate-200 p-3 dark:border-white/10">{dark ? <FaSun /> : <FaMoon />}</button></div>
// // //         </div>
// // //       </header>
// // //       <div className="mx-auto grid max-w-[1540px] gap-6 px-4 py-7 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10">
// // //         <aside className="min-w-0"><div className={`${panel} p-4 lg:sticky lg:top-6`}>
// // //           <div className="rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-900 p-4 text-white"><FaGraduationCap className="text-xl" /><h2 className="mt-3 text-base font-black">Zero to Hero</h2><p className="mt-1 text-xs text-violet-100">2026–2027 Splunk cohort</p></div>
// // //           <p className={`mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest ${muted}`}>Your workspace</p>
// // //           <nav aria-label="Cohort dashboard sections" className="grid grid-cols-2 gap-2 lg:grid-cols-1">{MENU.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => handleNav(id)}
// // //             className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm ${tab === id ? "bg-violet-700 text-white" : "text-slate-600 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-white/10"}`}><Icon className="shrink-0" />{label}</button>)}</nav>
// // //           <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10"><div className="flex justify-between text-xs"><span className="font-bold">Completed sessions</span><span className="font-black text-violet-600 dark:text-violet-300">{pct}%</span></div>
// // //             <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} /></div><p className={`mt-2 text-[11px] ${muted}`}>{done} of 10 · self-reported on this device</p></div>
// // //         </div></aside>
// // //         <div className="min-w-0 space-y-6">
// // //           {tab === "overview" && <>
// // //             <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2b1749] via-[#5d21a6] to-[#8438c5] p-6 text-white shadow-lg sm:p-9">
// // //               <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" /><div className="relative z-10 max-w-3xl">
// // //                 <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold"><FaGraduationCap /> 2026–2027 SPLUNK COHORT</span>
// // //                 <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">Welcome to your new Splunk learning dashboard.</h1>
// // //                 <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">Prepare for both certification deadlines, get your personal lab ready, and follow the ten-Saturday hands-on curriculum. Start with the one available orientation video and your updated orientation slides. Class recordings will be published as the program progresses.</p>
// // //                 <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => handleNav("classes")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-violet-800 hover:bg-violet-50">Explore 10 classes <FaArrowRight /></button><button onClick={() => handleNav("orientation")} className="rounded-xl border border-white/30 px-5 py-3 text-xs font-black hover:bg-white/10">Watch orientation video</button></div>
// // //               </div>
// // //             </section>
// // //             <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Cohort summary">
// // //               <Stat icon={FaBookOpen} number="10" name="Official classes" detail="Jan 9 – Mar 13, 2027" />
// // //               <Stat icon={FaShieldHalved} number="02" name="Certification deadlines" detail="Nov 28 and Dec 19" />
// // //               <Stat icon={FaComputer} number="08" name="Planned virtual machines" detail="One personal Proxmox host" />
// // //               <Stat icon={FaCheck} number={`${ready}/${PREP_ITEMS.length}`} name="Readiness tasks" detail="Your personal prep checklist" />
// // //             </section>
// // //             {/* Exactly one published video for the new cohort. No legacy lesson feeds. */}
// // //             <section className={`${panel} overflow-hidden p-5 sm:p-7`} aria-label="Orientation video and slides">
// // //               <div className="flex flex-wrap items-center justify-between gap-3">
// // //                 <div><Label>Start here · One video available</Label><h2 className="mt-2 text-xl font-black">Splunk orientation &amp; 2026–2027 program guide</h2><p className={`mt-2 text-sm ${muted}`}>Watch the introductory video, then review the official 28-slide orientation presentation.</p></div>
// // //                 <button type="button" onClick={() => handleNav("orientation")} className={linkBase}>Open orientation <FaArrowRight /></button>
// // //               </div>
// // //               <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
// // //                 <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-white/10">
// // //                   <iframe title={ORIENTATION_VIDEO.title} src={ORIENTATION_VIDEO.url} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
// // //                 </div>
// // //                 <div className="flex flex-col justify-center rounded-2xl border border-violet-100 bg-violet-50 p-5 dark:border-violet-500/20 dark:bg-violet-500/10">
// // //                   <FaFileLines className="text-2xl text-violet-600 dark:text-violet-300" />
// // //                   <h3 className="mt-3 text-base font-black">Splunk Orientation 2026</h3>
// // //                   <p className={`mt-2 text-xs leading-6 ${muted}`}>All 28 slides: certification deadlines, lab hardware, eight virtual machines and the ten-Saturday curriculum.</p>
// // //                   <button type="button" onClick={() => handleNav("orientation")} className={`${linkBase} mt-5`}>Read the slides <FaArrowRight /></button>
// // //                   <a href={ORIENTATION_SLIDES.powerpoint} download className="mt-3 text-center text-xs font-bold text-violet-700 underline dark:text-violet-300">Download PowerPoint</a>
// // //                 </div>
// // //               </div>
// // //             </section>
// // //             <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
// // //               <section className={`${panel} p-5 sm:p-7`}><Label>Your next milestone</Label>
// // //                 {nextMilestone ? <><h2 className="mt-3 text-xl font-black">{nextMilestone.title}</h2><p className={`mt-2 text-sm ${muted}`}>{displayDate(nextMilestone.date)} · {nextMilestone.detail}</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => openCalendar(nextMilestone.date)} className={linkBase}>See the date <FaArrowRight /></button>{nextClass && <button onClick={() => openClass(nextClass.id)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">Preview next class</button>}</div></> : <p className={`mt-3 text-sm ${muted}`}>All listed milestones have passed.</p>}
// // //                 <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Two program phases</Label><div className="mt-4 grid gap-3 sm:grid-cols-2">
// // //                   <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="text-xs font-black text-violet-700 dark:text-violet-200">01 · Oct–Dec 2026</p><h3 className="mt-2 text-sm font-black">Certification preparation</h3><p className={`mt-2 text-xs leading-5 ${muted}`}>Study the Power User blueprint first, then Admin. Contact the instructor weekly.</p></div>
// // //                   <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="text-xs font-black text-violet-700 dark:text-violet-200">02 · Jan–Mar 2027</p><h3 className="mt-2 text-sm font-black">Distributed lab build</h3><p className={`mt-2 text-xs leading-5 ${muted}`}>Ten practical Saturday sessions ending in a capstone demonstration.</p></div>
// // //                 </div></div>
// // //               </section>
// // //               <section className={`${panel} p-5 sm:p-7`}><div className="flex items-center justify-between gap-3"><Label>Before Jan 9</Label><span className={`text-xs font-bold ${muted}`}>{ready}/{PREP_ITEMS.length} ready</span></div><h2 className="mt-2 text-xl font-black">Your preparation checklist</h2><div className="mt-5 space-y-3">{PREP_ITEMS.map((item) => <label key={item.id} className="flex cursor-pointer gap-3 text-xs leading-5"><input type="checkbox" checked={Boolean(prep[item.id]?.checked)} onChange={(event) => changePrep(item.id, { checked: event.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-violet-700" /><span className={prep[item.id]?.checked ? `text-slate-400 line-through` : ""}>{item.label}</span></label>)}</div><button onClick={() => handleNav("lab")} className="mt-6 text-xs font-bold text-violet-600 hover:underline dark:text-violet-300">View full lab requirements →</button></section>
// // //             </div>
// // //             <section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center justify-between gap-3"><div><Label>Official schedule</Label><h2 className="mt-2 text-xl font-black">Coming up</h2></div><button onClick={() => handleNav("calendar")} className="text-xs font-bold text-violet-600 dark:text-violet-300">Full calendar →</button></div><div className="mt-4"><EventList events={MILESTONES.filter((e) => e.date >= today).slice(0, 4)} selectDate={openCalendar} /></div><p className={`mt-4 text-xs ${muted}`}>Official class times are 8:00 AM Eastern. Weekly check-ins are suggested outreach reminders, not booked sessions.</p></section>
// // //           </>}

// // //           {tab === "orientation" && <>
// // //             <SectionHeading eyebrow="Welcome to the 2026–2027 cohort" title="Your orientation materials" description="Start with the one available video and the complete orientation presentation. This is the new cohort's starting point; the other class recordings have not been published." />
// // //             <section className={`${panel} p-5 sm:p-7`}>
// // //               <div className="flex flex-wrap items-start justify-between gap-3"><div><Label>Available recording · 1 of 1</Label><h3 className="mt-2 text-xl font-black">{ORIENTATION_VIDEO.title}</h3><p className={`mt-2 text-sm ${muted}`}>An introductory Splunk orientation video retained from your existing video library.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">Available to watch</span></div>
// // //               <div className="mt-5 overflow-hidden rounded-2xl bg-black"><iframe title={ORIENTATION_VIDEO.title} src={ORIENTATION_VIDEO.url} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /></div>
// // //               <p className={`mt-4 text-xs ${muted}`}>There are no additional videos in the 2026–2027 cohort library yet.</p>
// // //             </section>
// // //             <section className={`${panel} p-5 sm:p-7`}>
// // //               <div className="flex flex-wrap items-center justify-between gap-4"><div><Label>Official presentation · 28 slides</Label><h3 className="mt-2 text-xl font-black">Splunk Orientation 2026 — Zero to Hero</h3><p className={`mt-2 text-xs ${muted}`}>October 31, 2026 · 8:00–10:00 AM Eastern</p></div><div className="flex flex-wrap gap-2"><a className={linkBase} href={ORIENTATION_SLIDES.powerpoint} download><FaDownload /> Download PPTX</a><a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-white/10" href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer">Open PDF <FaArrowRight /></a></div></div>
// // //               <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"><iframe title="2026–2027 Splunk orientation slides, 28-page PDF" src={`${ORIENTATION_SLIDES.pdf}#view=FitH`} className="h-[520px] w-full bg-white sm:h-[700px]" loading="lazy" /></div>
// // //               <p className={`mt-3 text-xs ${muted}`}>If your browser cannot display the slides, use Open PDF or Download PPTX above.</p>
// // //             </section>
// // //           </>}

// // //           {tab === "classes" && <>
// // //             <SectionHeading eyebrow="Your curriculum" title="My classes" description="Ten planned practical sessions. All ten class recordings are currently unpublished; the only available video is in the Orientation section. You can save your own notes now." />
// // //             <div className="grid gap-5 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.4fr)]">
// // //               <div className={`${panel} self-start p-4`}><label className={`text-xs font-black ${muted}`} htmlFor="cohort-search">Find a class</label><input id="cohort-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search class topics..." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#101827]" />
// // //                 <div className="mt-4 max-h-[650px] space-y-2 overflow-auto">{filteredLessons.map((lesson) => <button key={lesson.id} onClick={() => setSelectedLesson(lesson.id)} className={`flex w-full gap-3 rounded-xl border p-3 text-left ${selectedLesson === lesson.id ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-700 text-xs font-black text-white">{String(lesson.number).padStart(2, "0")}</span><div><p className="text-xs font-black leading-5">{lesson.title}</p><p className={`mt-1 text-[11px] ${muted}`}>{displayDate(lesson.date)} · {progress[lesson.id]?.completed ? "Completed (self-reported)" : "Scheduled"}</p></div></button>)}{filteredLessons.length === 0 && <p className={`p-4 text-xs ${muted}`}>No matching classes.</p>}</div>
// // //               </div>
// // //               <div className="min-w-0 space-y-4"><section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center gap-2"><Label>Class {String(currentLesson.number).padStart(2, "0")}</Label><span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{displayDate(currentLesson.date)}</span></div>
// // //                 <h2 className="mt-3 text-2xl font-black">{currentLesson.title}</h2><p className={`mt-3 text-sm leading-7 ${muted}`}>{currentLesson.description}</p><p className="mt-3 flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-300"><FaClock /> 8:00 AM Eastern · End time not announced</p><div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><h3 className="text-sm font-black">What you will work on</h3><ul className="mt-3 space-y-2">{currentLesson.tasks.map((task) => <li key={task} className="flex gap-2 text-xs leading-6"><FaCheck className="mt-1 shrink-0 text-violet-600" />{task}</li>)}</ul><div className="mt-5 rounded-xl bg-violet-50 p-4 text-xs leading-6 dark:bg-violet-500/10"><strong>Expected evidence:</strong> {currentLesson.evidence}</div></div>
// // //                 <label className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-5 text-xs font-bold dark:border-white/10"><input type="checkbox" className="h-4 w-4 accent-violet-700" checked={Boolean(progress[currentLesson.id]?.completed)} onChange={(event) => changeProgress(currentLesson.id, { completed: event.target.checked })} disabled={today < currentLesson.date} />Mark lab session completed (self-reported) {today < currentLesson.date && <span className={`font-normal ${muted}`}>· Available after class date</span>}</label>
// // //               </section>
// // //               <section className={`${panel} p-5 sm:p-7`}><h3 className="flex items-center gap-2 text-base font-black"><FaVideo className="text-violet-600" /> Class recordings</h3><div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-white/15"><p className="text-sm font-bold">No recordings published yet</p><p className={`mt-2 text-xs ${muted}`}>This class has no published recording. The one available orientation video is in the Orientation section.</p></div><h3 className="mt-6 flex items-center gap-2 text-base font-black"><FaFileLines className="text-violet-600" /> Course documents</h3><p className={`mt-3 text-xs ${muted}`}>No class documents have been published for this lesson.</p></section>
// // //               <section className={`${panel} p-5 sm:p-7`}><h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-violet-600" /> My private notes</h3><p className={`mt-2 text-xs ${muted}`}>Saved in this browser for this student and cohort. They are not yet synced across devices.</p><textarea value={progress[currentLesson.id]?.note || ""} onChange={(event) => changeProgress(currentLesson.id, { note: event.target.value })} rows={6} placeholder="Write your questions, commands, practice notes or study plan..." className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#101827]" /></section></div>
// // //             </div>
// // //           </>}

// // //           {tab === "calendar" && <><SectionHeading eyebrow="2026–2027" title="Learning calendar" description="Official classes, deadlines and preparation reminders. Times are shown in Eastern Time (America/New_York)." />
// // //             <section className={`${panel} p-4 sm:p-6`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xl font-black">{displayDate(`${month}-01`, { month: "long", year: "numeric" })}</p><p className={`mt-1 text-xs ${muted}`}>{monthEvents.length} official event(s) this month</p></div><div className="flex gap-2"><button type="button" disabled={monthIndex === 0} onClick={() => setMonthIndex((m) => m - 1)} aria-label="Previous month" className="rounded-xl border border-slate-200 p-3 disabled:opacity-30 dark:border-white/10"><FaChevronLeft /></button><button type="button" disabled={monthIndex === MONTHS.length - 1} onClick={() => setMonthIndex((m) => m + 1)} aria-label="Next month" className="rounded-xl border border-slate-200 p-3 disabled:opacity-30 dark:border-white/10"><FaChevronRight /></button></div></div>
// // //               <div className="mt-5 grid grid-cols-7 gap-1 text-center">{WEEKDAYS.map((d) => <div key={d} className={`py-2 text-[10px] font-bold ${muted}`}>{d}</div>)}{calendarGrid.map((date, index) => {
// // //                 const events = MILESTONES.filter((event) => event.date === date);
// // //                 const checkin = WEEKLY_CHECKINS.includes(date);
// // //                 const selected = date && selectedDate === date;
// // //                 return date ? <button key={date} type="button" onClick={() => setSelectedDate(date)} aria-pressed={selected} aria-label={`${displayDate(date)}${events.length ? `, ${events.map((e) => e.title).join(", ")}` : ""}${checkin ? ", suggested check-in" : ""}`} className={`relative flex h-16 flex-col items-center justify-start rounded-lg pt-2 text-xs font-bold transition sm:h-[86px] ${selected ? "bg-violet-700 text-white" : events.length ? "border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200" : "border border-slate-100 text-slate-700 hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"}`}><span>{Number(date.slice(-2))}</span>{events.length > 0 && <span className={`mt-2 h-2 w-2 rounded-full ${selected ? "bg-white" : events.some((e) => e.kind === "deadline") ? "bg-pink-500" : "bg-violet-600"}`} />}{checkin && <span className={`mt-1 text-[8px] ${selected ? "text-white" : "text-slate-400"}`}>Check-in</span>}</button> : <div key={`blank-${index}`} />;
// // //               })}</div><div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400"><span>🟣 Official class or milestone</span><span>🩷 Certification deadline</span><span>Check-in = suggested outreach, not a meeting</span></div>
// // //               <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Selected date</Label><h3 className="mt-2 text-base font-black">{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><div className="mt-4"><EventList events={dateEvents} />{isCheckin && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 dark:bg-white/5">Suggested weekly instructor check-in: send questions or progress updates. This is not a booked class.</p>}</div></div>
// // //               <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Official dates this month</Label><div className="mt-3"><EventList events={monthEvents} selectDate={setSelectedDate} /></div></div>
// // //             </section></>}

// // //           {tab === "lab" && <><SectionHeading eyebrow="Your practical environment" title="Personal Splunk lab" description="Your orientation document calls for a personal Proxmox server with eight virtual machines. These are lab planning targets, not a claim that hardware or licensing is included in tuition." />
// // //             <div className="grid gap-4 sm:grid-cols-3"><Stat icon={FaServer} name="Physical host" number="1" detail="64 GB RAM target" /><Stat icon={FaComputer} name="Virtual machines" number="8" detail="Distinct Splunk roles" /><Stat icon={FaHardDrive} name="Guest storage budget" number="560 GB" detail="Plus host overhead" /></div>
// // //             <section className={`${panel} p-5 sm:p-7`}><Label>Hardware readiness</Label><h3 className="mt-2 text-xl font-black">Recommended lab host target</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>x86-64 CPU with VT-x/AMD-V, at least eight cores, 64 GB RAM, 1 TB SSD/NVMe and wired Ethernet. Prepare a separate laptop, bootable USB media and reliable local networking.</p><div className="mt-5 flex flex-wrap gap-3"><a className={linkBase} href={SERVER_URL} target="_blank" rel="noopener noreferrer">Instructor's server link <FaArrowRight /></a><a className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-white/10" href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer">Orientation page</a></div><p className={`mt-4 text-xs ${muted}`}>Confirm the exact RAM/storage configuration and purchase details before ordering. Back up the chosen disk before installing Proxmox.</p></section>
// // //             <section className={`${panel} p-5 sm:p-7`}><Label>Architecture overview</Label><h3 className="mt-2 text-xl font-black">How the eight VMs work together</h3><div className="mt-5 grid items-center gap-2 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr]"><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="font-black">UF1 + UF2</p><p className={`mt-1 text-xs ${muted}`}>Collect logs</p></div><FaArrowRight className="mx-auto rotate-90 text-violet-500 md:rotate-0" /><div className="rounded-2xl bg-violet-100 p-4 dark:bg-violet-500/20"><p className="font-black">IDX1–IDX3</p><p className={`mt-1 text-xs ${muted}`}>Store and replicate</p></div><FaArrowRight className="mx-auto rotate-90 text-violet-500 md:rotate-0" /><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="font-black">SH1</p><p className={`mt-1 text-xs ${muted}`}>Search and dashboards</p></div></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10"><strong>CM1:</strong> Indexer cluster manager</div><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10"><strong>MC1:</strong> Deployment, licensing and monitoring</div></div><p className={`mt-4 text-xs leading-6 ${muted}`}>Lab target: replication factor 2, search factor 2. All VMs live on a single physical host, so physical redundancy is not provided.</p></section>
// // //             <section className={`${panel} overflow-hidden p-5 sm:p-7`}><h3 className="text-xl font-black">Starting virtual machine budget</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className="border-b border-slate-200 dark:border-white/10"><th className="py-3 pr-3">Role</th><th className="py-3 pr-3">Count</th><th className="py-3 pr-3">vCPU / VM</th><th className="py-3 pr-3">RAM / VM</th><th className="py-3">Disk / VM</th></tr></thead><tbody>{VM_ROLES.map((vm) => <tr key={vm.name} className="border-b border-slate-100 dark:border-white/10"><td className="py-3 pr-3 font-bold">{vm.name}</td><td className="py-3 pr-3">{vm.count}</td><td className="py-3 pr-3">{vm.cpu}</td><td className="py-3 pr-3">{vm.ram} GB</td><td className="py-3">{vm.disk} GB</td></tr>)}</tbody><tfoot><tr className="font-black"><td className="pt-4">Total</td><td className="pt-4">8</td><td className="pt-4">22</td><td className="pt-4">46 GB</td><td className="pt-4">560 GB</td></tr></tfoot></table></div><p className={`mt-4 text-xs ${muted}`}>These are starting resource allocations. CPU oversubscription assumes light lab use; reserve host overhead.</p></section>
// // //             <section className={`${panel} p-5 sm:p-7`}><h3 className="text-xl font-black">Licensing must cover the lab</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>The slides note a 60-day Enterprise trial while the scheduled lab spans 63 days. Arrange an authorized training or otherwise eligible license for the full practical period. Splunk Free is not a distributed-cluster substitute; developer-program licensing is subject to eligibility and approval.</p><a className={`${linkBase} mt-5`} href={DEVELOPER_PROGRAM_URL} target="_blank" rel="noopener noreferrer">View developer program <FaArrowRight /></a></section>
// // //           </>}

// // //           {tab === "certifications" && <><SectionHeading eyebrow="Phase one · Oct–Dec 2026" title="Certification preparation" description="Complete the Power User goal first, then prepare for Enterprise Admin. The dates below are the cohort's deadlines, not automatically booked exam appointments." />
// // //             <div className="grid gap-5 lg:grid-cols-2">{CERTIFICATIONS.map((cert, index) => <article key={cert.id} className={`${panel} p-6 sm:p-7`}><div className="flex items-start justify-between gap-4"><div><Label>Goal {String(index + 1).padStart(2, "0")}</Label><h3 className="mt-2 text-xl font-black">{cert.title}</h3></div><FaShieldHalved className="text-xl text-violet-600" /></div><p className="mt-5 text-sm font-black text-pink-600 dark:text-pink-300">Deadline: {displayDate(cert.date)}</p><p className={`mt-3 text-sm ${muted}`}><strong>Focus:</strong> {cert.topic}</p><p className={`mt-3 text-sm leading-7 ${muted}`}>{cert.description}</p><button type="button" onClick={() => openCalendar(cert.date)} className={`${linkBase} mt-6`}>View deadline <FaArrowRight /></button></article>)}</div>
// // //             <section className={`${panel} p-5 sm:p-7`}><h3 className="text-xl font-black">Weekly check-in plan</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>Through December, contact the instructor every week with your progress, difficult topics and exam questions. These are suggested outreach reminders, not scheduled live meetings. Use official exam blueprints and the T.O. Analytics study hub.</p><a href={STUDY_HUB_URL} target="_blank" rel="noopener noreferrer" className={`${linkBase} mt-5`}>Open study hub <FaArrowRight /></a></section>
// // //           </>}

// // //           {tab === "resources" && <><SectionHeading eyebrow="Course links" title="Student resources" description="The official orientation presentation and one orientation video are available now. The ten class recordings and class-specific documents remain unpublished." />
// // //             <section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center justify-between gap-3"><div><Label>Orientation slides</Label><h3 className="mt-2 text-xl font-black">Official 2026–2027 presentation</h3><p className={`mt-2 text-xs ${muted}`}>28-slide guide from your attached PowerPoint.</p></div><button type="button" onClick={() => handleNav("orientation")} className={linkBase}>View slides <FaArrowRight /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><a className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800 transition hover:bg-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-violet-200" href={ORIENTATION_SLIDES.powerpoint} download><FaDownload className="mb-2" />Download full PowerPoint (.pptx)</a><a className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-bold text-violet-800 transition hover:bg-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-violet-200" href={ORIENTATION_SLIDES.pdf} target="_blank" rel="noreferrer"><FaFileLines className="mb-2" />Open slide preview (.pdf)</a></div></section>
// // //             <section className={`${panel} p-5 sm:p-7`}><div className="grid gap-3 sm:grid-cols-2">{[
// // //               ["Orientation information", "Program overview and entry information", ORIENTATION_URL],
// // //               ["T.O. Analytics study hub", "Preparation and practice materials", STUDY_HUB_URL],
// // //               ["Recommended server", "Instructor-provided hardware suggestion", SERVER_URL],
// // //               ["Splunk developer program", "Check license eligibility and requirements", DEVELOPER_PROGRAM_URL],
// // //             ].map(([title, description, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-400 dark:border-white/10"><FaLink className="mt-1 shrink-0 text-violet-600" /><div><h3 className="text-sm font-black">{title}</h3><p className={`mt-1 text-xs leading-5 ${muted}`}>{description}</p></div><FaArrowRight className="ml-auto shrink-0 text-violet-600" /></a>)}</div>
// // //               <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-7 text-center dark:border-white/15"><FaVideo className="mx-auto text-2xl text-violet-600" /><h3 className="mt-3 font-black">One orientation video · Class recordings pending</h3><p className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${muted}`}>Your orientation video and presentation are available. All ten planned classes remain free of old cohort recordings, class slides and assignments until new materials are published.</p></div>
// // //             </section></>}

// // //           <footer className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs dark:border-white/10 ${muted}`}><p>© {new Date().getFullYear()} T.O Analytics LLC · 2026–2027 cohort</p><span>Notes & checklist saved on this device · All class start times Eastern</span></footer>
// // //         </div>
// // //       </div>
// // //     </main>
// // //   </div>;
// // // }

// // // // import React, { useEffect, useMemo, useState } from "react";
// // // // import {
// // // //   FaArrowRight, FaBookOpen, FaCalendarDays, FaCheck, FaChevronLeft,
// // // //   FaChevronRight, FaClock, FaComputer, FaDownload, FaFileLines,
// // // //   FaGraduationCap, FaHardDrive, FaLayerGroup, FaLink, FaListCheck,
// // // //   FaMoon, FaNoteSticky, FaServer, FaShieldHalved, FaSun, FaVideo,
// // // // } from "react-icons/fa6";
// // // // import {
// // // //   CERTIFICATIONS, COHORT_ID, DEVELOPER_PROGRAM_URL, LESSONS, MILESTONES,
// // // //   ORIENTATION_URL, PREP_ITEMS, SERVER_URL, STUDY_HUB_URL, VM_ROLES,
// // // //   WEEKLY_CHECKINS, displayDate, easternToday,
// // // // } from "./splunk2026Data";

// // // // const MENU = [
// // // //   ["overview", "Overview", FaLayerGroup],
// // // //   ["classes", "My classes", FaBookOpen],
// // // //   ["calendar", "Calendar", FaCalendarDays],
// // // //   ["lab", "My lab", FaServer],
// // // //   ["certifications", "Certifications", FaGraduationCap],
// // // //   ["resources", "Resources", FaFileLines],
// // // // ];
// // // // const MONTHS = ["2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"];
// // // // const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// // // // const statusStyles = {
// // // //   class: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
// // // //   deadline: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-200",
// // // //   orientation: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
// // // //   reminder: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
// // // // };
// // // // const panel = "rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#182239]";
// // // // const muted = "text-slate-500 dark:text-slate-400";
// // // // const linkBase = "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500";

// // // // function safeLoad(key, fallback = {}) {
// // // //   try {
// // // //     const value = JSON.parse(localStorage.getItem(key) || "null");
// // // //     return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
// // // //   } catch { return fallback; }
// // // // }
// // // // function useLocalMap(key) {
// // // //   const [value, setValue] = useState(() => safeLoad(key));
// // // //   useEffect(() => { setValue(safeLoad(key)); }, [key]);
// // // //   const update = (id, patch) => setValue((current) => {
// // // //     const next = { ...current, [id]: { ...(current[id] || {}), ...patch } };
// // // //     try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage disabled */ }
// // // //     return next;
// // // //   });
// // // //   return [value, update];
// // // // }
// // // // function Label({ children }) {
// // // //   return <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">{children}</p>;
// // // // }
// // // // function SectionHeading({ eyebrow, title, description }) {
// // // //   return <div className="mb-6"><Label>{eyebrow}</Label><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>{description && <p className={`mt-2 max-w-3xl text-sm leading-6 ${muted}`}>{description}</p>}</div>;
// // // // }
// // // // function Stat({ icon: Icon, number, name, detail }) {
// // // //   return <div className={`${panel} flex items-start justify-between gap-2 p-5`}>
// // // //     <div><p className={`text-xs font-bold ${muted}`}>{name}</p><p className="mt-2 text-3xl font-black">{number}</p><p className={`mt-2 text-[11px] ${muted}`}>{detail}</p></div>
// // // //     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"><Icon /></div>
// // // //   </div>;
// // // // }
// // // // function SmallDate({ date }) {
// // // //   return <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-100">
// // // //     <span className="text-[10px] font-black uppercase">{displayDate(date, { month: "short" })}</span>
// // // //     <span className="text-lg font-black">{date.slice(-2)}</span>
// // // //   </div>;
// // // // }
// // // // function EventList({ events, selectDate, emptyMessage = "Nothing is scheduled for these dates." }) {
// // // //   return events.length ? <div className="space-y-2">
// // // //     {events.map((event) => <button key={event.id} type="button" onClick={() => selectDate?.(event.date)}
// // // //       className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:hover:bg-white/5">
// // // //       <SmallDate date={event.date} />
// // // //       <div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5">{event.title}</p><p className={`mt-1 text-xs ${muted}`}>{event.detail}</p></div>
// // // //       <span className={`hidden rounded-lg px-2 py-1 text-[10px] font-bold capitalize sm:inline ${statusStyles[event.kind] || statusStyles.reminder}`}>{event.kind}</span>
// // // //     </button>)}
// // // //   </div> : <p className={`rounded-xl border border-dashed border-slate-200 p-6 text-sm dark:border-white/10 ${muted}`}>{emptyMessage}</p>;
// // // // }

// // // // /** Dedicated dashboard for an authenticated and server-enrolled October 2026 student. */
// // // // export default function NewCohortDashboard({ email = "" }) {
// // // //   const normalizedEmail = String(email).trim().toLowerCase();
// // // //   const storageKey = `cp_progress_${COHORT_ID}_${normalizedEmail}`;
// // // //   const prepKey = `cp_preparation_${COHORT_ID}_${normalizedEmail}`;
// // // //   const [progress, changeProgress] = useLocalMap(storageKey);
// // // //   const [prep, changePrep] = useLocalMap(prepKey);
// // // //   const [tab, setTab] = useState("overview");
// // // //   const [selectedLesson, setSelectedLesson] = useState(LESSONS[0].id);
// // // //   const [search, setSearch] = useState("");
// // // //   const [monthIndex, setMonthIndex] = useState(() => {
// // // //     const today = easternToday().slice(0, 7);
// // // //     return Math.max(0, Math.min(MONTHS.length - 1, MONTHS.indexOf(today) < 0 ? (today < MONTHS[0] ? 0 : 5) : MONTHS.indexOf(today)));
// // // //   });
// // // //   const [selectedDate, setSelectedDate] = useState(() => easternToday());
// // // //   const [dark, setDark] = useState(() => {
// // // //     try { return localStorage.getItem("to_2026_portal_theme") === "dark"; } catch { return false; }
// // // //   });
// // // //   useEffect(() => { try { localStorage.setItem("to_2026_portal_theme", dark ? "dark" : "light"); } catch { /* ignored */ } }, [dark]);

// // // //   const today = easternToday();
// // // //   const done = LESSONS.filter((lesson) => progress[lesson.id]?.completed).length;
// // // //   const ready = PREP_ITEMS.filter((item) => prep[item.id]?.checked).length;
// // // //   const pct = Math.round((done / LESSONS.length) * 100);
// // // //   const currentLesson = LESSONS.find((lesson) => lesson.id === selectedLesson) || LESSONS[0];
// // // //   const nextMilestone = MILESTONES.find((event) => event.date >= today);
// // // //   const nextClass = LESSONS.find((lesson) => lesson.date >= today);
// // // //   const month = MONTHS[monthIndex];
// // // //   const monthEvents = MILESTONES.filter((event) => event.date.startsWith(month));
// // // //   const filteredLessons = LESSONS.filter((lesson) => `${lesson.title} ${lesson.description} ${lesson.evidence}`.toLowerCase().includes(search.toLowerCase()));
// // // //   const calendarGrid = useMemo(() => {
// // // //     const [year, m] = month.split("-").map(Number);
// // // //     const first = new Date(Date.UTC(year, m - 1, 1));
// // // //     const offset = first.getUTCDay();
// // // //     const days = new Date(Date.UTC(year, m, 0)).getUTCDate();
// // // //     return Array.from({ length: Math.ceil((days + offset) / 7) * 7 }, (_, index) => {
// // // //       const day = index - offset + 1;
// // // //       return day >= 1 && day <= days ? `${month}-${String(day).padStart(2, "0")}` : null;
// // // //     });
// // // //   }, [month]);

// // // //   const openCalendar = (date) => {
// // // //     setSelectedDate(date);
// // // //     const index = MONTHS.indexOf(date.slice(0, 7));
// // // //     if (index >= 0) setMonthIndex(index);
// // // //     setTab("calendar");
// // // //   };
// // // //   const openClass = (id) => { setSelectedLesson(id); setTab("classes"); };
// // // //   const handleNav = (id) => { setTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
// // // //   const dateEvents = MILESTONES.filter((event) => event.date === selectedDate);
// // // //   const isCheckin = WEEKLY_CHECKINS.includes(selectedDate);

// // // //   return <div className={dark ? "dark" : ""}>
// // // //     <main className="min-h-screen bg-[#f7f6fc] text-slate-900 transition-colors dark:bg-[#0c1120] dark:text-slate-100">
// // // //       <header className="border-b border-violet-100 bg-white dark:border-white/10 dark:bg-[#12192b]">
// // // //         <div className="mx-auto flex max-w-[1540px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
// // // //           <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">T.O</div>
// // // //             <div><p className="text-sm font-black">T.O Analytics</p><p className={`text-[11px] ${muted}`}>Splunk Student Campus · 2026–2027</p></div></div>
// // // //           <div className="flex min-w-0 items-center gap-3"><span className="hidden max-w-56 truncate text-xs text-slate-500 md:block" title={normalizedEmail}>{normalizedEmail}</span>
// // // //             <span className="rounded-full bg-violet-100 px-3 py-1.5 text-[11px] font-black text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">New cohort</span>
// // // //             <button type="button" onClick={() => setDark((prev) => !prev)} aria-label="Toggle color theme" className="rounded-xl border border-slate-200 p-3 dark:border-white/10">{dark ? <FaSun /> : <FaMoon />}</button></div>
// // // //         </div>
// // // //       </header>
// // // //       <div className="mx-auto grid max-w-[1540px] gap-6 px-4 py-7 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10">
// // // //         <aside className="min-w-0"><div className={`${panel} p-4 lg:sticky lg:top-6`}>
// // // //           <div className="rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-900 p-4 text-white"><FaGraduationCap className="text-xl" /><h2 className="mt-3 text-base font-black">Zero to Hero</h2><p className="mt-1 text-xs text-violet-100">2026–2027 Splunk cohort</p></div>
// // // //           <p className={`mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest ${muted}`}>Your workspace</p>
// // // //           <nav aria-label="Cohort dashboard sections" className="grid grid-cols-2 gap-2 lg:grid-cols-1">{MENU.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => handleNav(id)}
// // // //             className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm ${tab === id ? "bg-violet-700 text-white" : "text-slate-600 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-white/10"}`}><Icon className="shrink-0" />{label}</button>)}</nav>
// // // //           <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10"><div className="flex justify-between text-xs"><span className="font-bold">Completed sessions</span><span className="font-black text-violet-600 dark:text-violet-300">{pct}%</span></div>
// // // //             <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} /></div><p className={`mt-2 text-[11px] ${muted}`}>{done} of 10 · self-reported on this device</p></div>
// // // //         </div></aside>
// // // //         <div className="min-w-0 space-y-6">
// // // //           {tab === "overview" && <>
// // // //             <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2b1749] via-[#5d21a6] to-[#8438c5] p-6 text-white shadow-lg sm:p-9">
// // // //               <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" /><div className="relative z-10 max-w-3xl">
// // // //                 <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold"><FaGraduationCap /> 2026–2027 SPLUNK COHORT</span>
// // // //                 <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">Welcome to your new Splunk learning dashboard.</h1>
// // // //                 <p className="mt-4 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">Prepare for both certification deadlines, get your personal lab ready, and follow the ten-Saturday hands-on curriculum. Your lesson library starts empty until the trainer publishes recordings.</p>
// // // //                 <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => handleNav("classes")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-violet-800 hover:bg-violet-50">Explore 10 classes <FaArrowRight /></button><button onClick={() => handleNav("lab")} className="rounded-xl border border-white/30 px-5 py-3 text-xs font-black hover:bg-white/10">Prepare my lab</button></div>
// // // //               </div>
// // // //             </section>
// // // //             <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Cohort summary">
// // // //               <Stat icon={FaBookOpen} number="10" name="Official classes" detail="Jan 9 – Mar 13, 2027" />
// // // //               <Stat icon={FaShieldHalved} number="02" name="Certification deadlines" detail="Nov 28 and Dec 19" />
// // // //               <Stat icon={FaComputer} number="08" name="Planned virtual machines" detail="One personal Proxmox host" />
// // // //               <Stat icon={FaCheck} number={`${ready}/${PREP_ITEMS.length}`} name="Readiness tasks" detail="Your personal prep checklist" />
// // // //             </section>
// // // //             <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
// // // //               <section className={`${panel} p-5 sm:p-7`}><Label>Your next milestone</Label>
// // // //                 {nextMilestone ? <><h2 className="mt-3 text-xl font-black">{nextMilestone.title}</h2><p className={`mt-2 text-sm ${muted}`}>{displayDate(nextMilestone.date)} · {nextMilestone.detail}</p><div className="mt-6 flex flex-wrap gap-3"><button onClick={() => openCalendar(nextMilestone.date)} className={linkBase}>See the date <FaArrowRight /></button>{nextClass && <button onClick={() => openClass(nextClass.id)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold dark:border-white/10">Preview next class</button>}</div></> : <p className={`mt-3 text-sm ${muted}`}>All listed milestones have passed.</p>}
// // // //                 <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Two program phases</Label><div className="mt-4 grid gap-3 sm:grid-cols-2">
// // // //                   <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="text-xs font-black text-violet-700 dark:text-violet-200">01 · Oct–Dec 2026</p><h3 className="mt-2 text-sm font-black">Certification preparation</h3><p className={`mt-2 text-xs leading-5 ${muted}`}>Study the Power User blueprint first, then Admin. Contact the instructor weekly.</p></div>
// // // //                   <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="text-xs font-black text-violet-700 dark:text-violet-200">02 · Jan–Mar 2027</p><h3 className="mt-2 text-sm font-black">Distributed lab build</h3><p className={`mt-2 text-xs leading-5 ${muted}`}>Ten practical Saturday sessions ending in a capstone demonstration.</p></div>
// // // //                 </div></div>
// // // //               </section>
// // // //               <section className={`${panel} p-5 sm:p-7`}><div className="flex items-center justify-between gap-3"><Label>Before Jan 9</Label><span className={`text-xs font-bold ${muted}`}>{ready}/{PREP_ITEMS.length} ready</span></div><h2 className="mt-2 text-xl font-black">Your preparation checklist</h2><div className="mt-5 space-y-3">{PREP_ITEMS.map((item) => <label key={item.id} className="flex cursor-pointer gap-3 text-xs leading-5"><input type="checkbox" checked={Boolean(prep[item.id]?.checked)} onChange={(event) => changePrep(item.id, { checked: event.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-violet-700" /><span className={prep[item.id]?.checked ? `text-slate-400 line-through` : ""}>{item.label}</span></label>)}</div><button onClick={() => handleNav("lab")} className="mt-6 text-xs font-bold text-violet-600 hover:underline dark:text-violet-300">View full lab requirements →</button></section>
// // // //             </div>
// // // //             <section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center justify-between gap-3"><div><Label>Official schedule</Label><h2 className="mt-2 text-xl font-black">Coming up</h2></div><button onClick={() => handleNav("calendar")} className="text-xs font-bold text-violet-600 dark:text-violet-300">Full calendar →</button></div><div className="mt-4"><EventList events={MILESTONES.filter((e) => e.date >= today).slice(0, 4)} selectDate={openCalendar} /></div><p className={`mt-4 text-xs ${muted}`}>Official class times are 8:00 AM Eastern. Weekly check-ins are suggested outreach reminders, not booked sessions.</p></section>
// // // //           </>}

// // // //           {tab === "classes" && <>
// // // //             <SectionHeading eyebrow="Your curriculum" title="My classes" description="Ten planned practical sessions. Lesson recordings and documents will appear only when they are published for your cohort. You can save your own notes now." />
// // // //             <div className="grid gap-5 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.4fr)]">
// // // //               <div className={`${panel} self-start p-4`}><label className={`text-xs font-black ${muted}`} htmlFor="cohort-search">Find a class</label><input id="cohort-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search class topics..." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#101827]" />
// // // //                 <div className="mt-4 max-h-[650px] space-y-2 overflow-auto">{filteredLessons.map((lesson) => <button key={lesson.id} onClick={() => setSelectedLesson(lesson.id)} className={`flex w-full gap-3 rounded-xl border p-3 text-left ${selectedLesson === lesson.id ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-700 text-xs font-black text-white">{String(lesson.number).padStart(2, "0")}</span><div><p className="text-xs font-black leading-5">{lesson.title}</p><p className={`mt-1 text-[11px] ${muted}`}>{displayDate(lesson.date)} · {progress[lesson.id]?.completed ? "Completed (self-reported)" : "Scheduled"}</p></div></button>)}{filteredLessons.length === 0 && <p className={`p-4 text-xs ${muted}`}>No matching classes.</p>}</div>
// // // //               </div>
// // // //               <div className="min-w-0 space-y-4"><section className={`${panel} p-5 sm:p-7`}><div className="flex flex-wrap items-center gap-2"><Label>Class {String(currentLesson.number).padStart(2, "0")}</Label><span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{displayDate(currentLesson.date)}</span></div>
// // // //                 <h2 className="mt-3 text-2xl font-black">{currentLesson.title}</h2><p className={`mt-3 text-sm leading-7 ${muted}`}>{currentLesson.description}</p><p className="mt-3 flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-300"><FaClock /> 8:00 AM Eastern · End time not announced</p><div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><h3 className="text-sm font-black">What you will work on</h3><ul className="mt-3 space-y-2">{currentLesson.tasks.map((task) => <li key={task} className="flex gap-2 text-xs leading-6"><FaCheck className="mt-1 shrink-0 text-violet-600" />{task}</li>)}</ul><div className="mt-5 rounded-xl bg-violet-50 p-4 text-xs leading-6 dark:bg-violet-500/10"><strong>Expected evidence:</strong> {currentLesson.evidence}</div></div>
// // // //                 <label className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-5 text-xs font-bold dark:border-white/10"><input type="checkbox" className="h-4 w-4 accent-violet-700" checked={Boolean(progress[currentLesson.id]?.completed)} onChange={(event) => changeProgress(currentLesson.id, { completed: event.target.checked })} disabled={today < currentLesson.date} />Mark lab session completed (self-reported) {today < currentLesson.date && <span className={`font-normal ${muted}`}>· Available after class date</span>}</label>
// // // //               </section>
// // // //               <section className={`${panel} p-5 sm:p-7`}><h3 className="flex items-center gap-2 text-base font-black"><FaVideo className="text-violet-600" /> Class recordings</h3><div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-white/15"><p className="text-sm font-bold">No recordings published yet</p><p className={`mt-2 text-xs ${muted}`}>Only videos released for this 2026–2027 cohort will appear here.</p></div><h3 className="mt-6 flex items-center gap-2 text-base font-black"><FaFileLines className="text-violet-600" /> Course documents</h3><p className={`mt-3 text-xs ${muted}`}>No class documents have been published for this lesson.</p></section>
// // // //               <section className={`${panel} p-5 sm:p-7`}><h3 className="flex items-center gap-2 text-base font-black"><FaNoteSticky className="text-violet-600" /> My private notes</h3><p className={`mt-2 text-xs ${muted}`}>Saved in this browser for this student and cohort. They are not yet synced across devices.</p><textarea value={progress[currentLesson.id]?.note || ""} onChange={(event) => changeProgress(currentLesson.id, { note: event.target.value })} rows={6} placeholder="Write your questions, commands, practice notes or study plan..." className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-violet-500 dark:border-white/10 dark:bg-[#101827]" /></section></div>
// // // //             </div>
// // // //           </>}

// // // //           {tab === "calendar" && <><SectionHeading eyebrow="2026–2027" title="Learning calendar" description="Official classes, deadlines and preparation reminders. Times are shown in Eastern Time (America/New_York)." />
// // // //             <section className={`${panel} p-4 sm:p-6`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xl font-black">{displayDate(`${month}-01`, { month: "long", year: "numeric" })}</p><p className={`mt-1 text-xs ${muted}`}>{monthEvents.length} official event(s) this month</p></div><div className="flex gap-2"><button type="button" disabled={monthIndex === 0} onClick={() => setMonthIndex((m) => m - 1)} aria-label="Previous month" className="rounded-xl border border-slate-200 p-3 disabled:opacity-30 dark:border-white/10"><FaChevronLeft /></button><button type="button" disabled={monthIndex === MONTHS.length - 1} onClick={() => setMonthIndex((m) => m + 1)} aria-label="Next month" className="rounded-xl border border-slate-200 p-3 disabled:opacity-30 dark:border-white/10"><FaChevronRight /></button></div></div>
// // // //               <div className="mt-5 grid grid-cols-7 gap-1 text-center">{WEEKDAYS.map((d) => <div key={d} className={`py-2 text-[10px] font-bold ${muted}`}>{d}</div>)}{calendarGrid.map((date, index) => {
// // // //                 const events = MILESTONES.filter((event) => event.date === date);
// // // //                 const checkin = WEEKLY_CHECKINS.includes(date);
// // // //                 const selected = date && selectedDate === date;
// // // //                 return date ? <button key={date} type="button" onClick={() => setSelectedDate(date)} aria-pressed={selected} aria-label={`${displayDate(date)}${events.length ? `, ${events.map((e) => e.title).join(", ")}` : ""}${checkin ? ", suggested check-in" : ""}`} className={`relative flex h-16 flex-col items-center justify-start rounded-lg pt-2 text-xs font-bold transition sm:h-[86px] ${selected ? "bg-violet-700 text-white" : events.length ? "border border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200" : "border border-slate-100 text-slate-700 hover:bg-slate-50 dark:border-white/5 dark:text-slate-300 dark:hover:bg-white/5"}`}><span>{Number(date.slice(-2))}</span>{events.length > 0 && <span className={`mt-2 h-2 w-2 rounded-full ${selected ? "bg-white" : events.some((e) => e.kind === "deadline") ? "bg-pink-500" : "bg-violet-600"}`} />}{checkin && <span className={`mt-1 text-[8px] ${selected ? "text-white" : "text-slate-400"}`}>Check-in</span>}</button> : <div key={`blank-${index}`} />;
// // // //               })}</div><div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400"><span>🟣 Official class or milestone</span><span>🩷 Certification deadline</span><span>Check-in = suggested outreach, not a meeting</span></div>
// // // //               <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Selected date</Label><h3 className="mt-2 text-base font-black">{displayDate(selectedDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3><div className="mt-4"><EventList events={dateEvents} />{isCheckin && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 dark:bg-white/5">Suggested weekly instructor check-in: send questions or progress updates. This is not a booked class.</p>}</div></div>
// // // //               <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10"><Label>Official dates this month</Label><div className="mt-3"><EventList events={monthEvents} selectDate={setSelectedDate} /></div></div>
// // // //             </section></>}

// // // //           {tab === "lab" && <><SectionHeading eyebrow="Your practical environment" title="Personal Splunk lab" description="Your orientation document calls for a personal Proxmox server with eight virtual machines. These are lab planning targets, not a claim that hardware or licensing is included in tuition." />
// // // //             <div className="grid gap-4 sm:grid-cols-3"><Stat icon={FaServer} name="Physical host" number="1" detail="64 GB RAM target" /><Stat icon={FaComputer} name="Virtual machines" number="8" detail="Distinct Splunk roles" /><Stat icon={FaHardDrive} name="Guest storage budget" number="560 GB" detail="Plus host overhead" /></div>
// // // //             <section className={`${panel} p-5 sm:p-7`}><Label>Hardware readiness</Label><h3 className="mt-2 text-xl font-black">Recommended lab host target</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>x86-64 CPU with VT-x/AMD-V, at least eight cores, 64 GB RAM, 1 TB SSD/NVMe and wired Ethernet. Prepare a separate laptop, bootable USB media and reliable local networking.</p><div className="mt-5 flex flex-wrap gap-3"><a className={linkBase} href={SERVER_URL} target="_blank" rel="noopener noreferrer">Instructor's server link <FaArrowRight /></a><a className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold dark:border-white/10" href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer">Orientation page</a></div><p className={`mt-4 text-xs ${muted}`}>Confirm the exact RAM/storage configuration and purchase details before ordering. Back up the chosen disk before installing Proxmox.</p></section>
// // // //             <section className={`${panel} p-5 sm:p-7`}><Label>Architecture overview</Label><h3 className="mt-2 text-xl font-black">How the eight VMs work together</h3><div className="mt-5 grid items-center gap-2 text-center md:grid-cols-[1fr_auto_1fr_auto_1fr]"><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="font-black">UF1 + UF2</p><p className={`mt-1 text-xs ${muted}`}>Collect logs</p></div><FaArrowRight className="mx-auto rotate-90 text-violet-500 md:rotate-0" /><div className="rounded-2xl bg-violet-100 p-4 dark:bg-violet-500/20"><p className="font-black">IDX1–IDX3</p><p className={`mt-1 text-xs ${muted}`}>Store and replicate</p></div><FaArrowRight className="mx-auto rotate-90 text-violet-500 md:rotate-0" /><div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><p className="font-black">SH1</p><p className={`mt-1 text-xs ${muted}`}>Search and dashboards</p></div></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10"><strong>CM1:</strong> Indexer cluster manager</div><div className="rounded-xl border border-slate-200 p-3 text-xs dark:border-white/10"><strong>MC1:</strong> Deployment, licensing and monitoring</div></div><p className={`mt-4 text-xs leading-6 ${muted}`}>Lab target: replication factor 2, search factor 2. All VMs live on a single physical host, so physical redundancy is not provided.</p></section>
// // // //             <section className={`${panel} overflow-hidden p-5 sm:p-7`}><h3 className="text-xl font-black">Starting virtual machine budget</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead><tr className="border-b border-slate-200 dark:border-white/10"><th className="py-3 pr-3">Role</th><th className="py-3 pr-3">Count</th><th className="py-3 pr-3">vCPU / VM</th><th className="py-3 pr-3">RAM / VM</th><th className="py-3">Disk / VM</th></tr></thead><tbody>{VM_ROLES.map((vm) => <tr key={vm.name} className="border-b border-slate-100 dark:border-white/10"><td className="py-3 pr-3 font-bold">{vm.name}</td><td className="py-3 pr-3">{vm.count}</td><td className="py-3 pr-3">{vm.cpu}</td><td className="py-3 pr-3">{vm.ram} GB</td><td className="py-3">{vm.disk} GB</td></tr>)}</tbody><tfoot><tr className="font-black"><td className="pt-4">Total</td><td className="pt-4">8</td><td className="pt-4">22</td><td className="pt-4">46 GB</td><td className="pt-4">560 GB</td></tr></tfoot></table></div><p className={`mt-4 text-xs ${muted}`}>These are starting resource allocations. CPU oversubscription assumes light lab use; reserve host overhead.</p></section>
// // // //             <section className={`${panel} p-5 sm:p-7`}><h3 className="text-xl font-black">Licensing must cover the lab</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>The slides note a 60-day Enterprise trial while the scheduled lab spans 63 days. Arrange an authorized training or otherwise eligible license for the full practical period. Splunk Free is not a distributed-cluster substitute; developer-program licensing is subject to eligibility and approval.</p><a className={`${linkBase} mt-5`} href={DEVELOPER_PROGRAM_URL} target="_blank" rel="noopener noreferrer">View developer program <FaArrowRight /></a></section>
// // // //           </>}

// // // //           {tab === "certifications" && <><SectionHeading eyebrow="Phase one · Oct–Dec 2026" title="Certification preparation" description="Complete the Power User goal first, then prepare for Enterprise Admin. The dates below are the cohort's deadlines, not automatically booked exam appointments." />
// // // //             <div className="grid gap-5 lg:grid-cols-2">{CERTIFICATIONS.map((cert, index) => <article key={cert.id} className={`${panel} p-6 sm:p-7`}><div className="flex items-start justify-between gap-4"><div><Label>Goal {String(index + 1).padStart(2, "0")}</Label><h3 className="mt-2 text-xl font-black">{cert.title}</h3></div><FaShieldHalved className="text-xl text-violet-600" /></div><p className="mt-5 text-sm font-black text-pink-600 dark:text-pink-300">Deadline: {displayDate(cert.date)}</p><p className={`mt-3 text-sm ${muted}`}><strong>Focus:</strong> {cert.topic}</p><p className={`mt-3 text-sm leading-7 ${muted}`}>{cert.description}</p><button type="button" onClick={() => openCalendar(cert.date)} className={`${linkBase} mt-6`}>View deadline <FaArrowRight /></button></article>)}</div>
// // // //             <section className={`${panel} p-5 sm:p-7`}><h3 className="text-xl font-black">Weekly check-in plan</h3><p className={`mt-3 text-sm leading-7 ${muted}`}>Through December, contact the instructor every week with your progress, difficult topics and exam questions. These are suggested outreach reminders, not scheduled live meetings. Use official exam blueprints and the T.O. Analytics study hub.</p><a href={STUDY_HUB_URL} target="_blank" rel="noopener noreferrer" className={`${linkBase} mt-5`}>Open study hub <FaArrowRight /></a></section>
// // // //           </>}

// // // //           {tab === "resources" && <><SectionHeading eyebrow="Course links" title="Student resources" description="Public orientation and preparation links are available now. Private lesson recordings and class documents remain unpublished until released for this cohort." />
// // // //             <section className={`${panel} p-5 sm:p-7`}><div className="grid gap-3 sm:grid-cols-2">{[
// // // //               ["Orientation information", "Program overview and entry information", ORIENTATION_URL],
// // // //               ["T.O. Analytics study hub", "Preparation and practice materials", STUDY_HUB_URL],
// // // //               ["Recommended server", "Instructor-provided hardware suggestion", SERVER_URL],
// // // //               ["Splunk developer program", "Check license eligibility and requirements", DEVELOPER_PROGRAM_URL],
// // // //             ].map(([title, description, url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-400 dark:border-white/10"><FaLink className="mt-1 shrink-0 text-violet-600" /><div><h3 className="text-sm font-black">{title}</h3><p className={`mt-1 text-xs leading-5 ${muted}`}>{description}</p></div><FaArrowRight className="ml-auto shrink-0 text-violet-600" /></a>)}</div>
// // // //               <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-7 text-center dark:border-white/15"><FaVideo className="mx-auto text-2xl text-violet-600" /><h3 className="mt-3 font-black">Your private class library starts empty</h3><p className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${muted}`}>Your ten planned classes are visible, but no recordings, slide files or assignments have been published for the new cohort. Previous cohort videos are not shared here.</p></div>
// // // //             </section></>}

// // // //           <footer className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs dark:border-white/10 ${muted}`}><p>© {new Date().getFullYear()} T.O Analytics LLC · 2026–2027 cohort</p><span>Notes & checklist saved on this device · All class start times Eastern</span></footer>
// // // //         </div>
// // // //       </div>
// // // //     </main>
// // // //   </div>;
// // // // }
