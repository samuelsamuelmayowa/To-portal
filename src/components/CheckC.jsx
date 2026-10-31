import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Clock3,
  ExternalLink,
  GraduationCap,
  Home,
  Info,
  Laptop,
  LayoutDashboard,
  ListChecks,
  Moon,
  Server,
  ShieldCheck,
  Sun,
  Trophy,
} from "lucide-react";
import ClassCalendar, { OFFICIAL_EVENTS, getEasternToday } from "./Days";

/**
 * T.O. Analytics — Class Schedule, 2026–2027.
 * Classic blue/navy CoursePortal layout with the existing Days.jsx calendar.
 * Uses official event dates from Days.jsx, not a separate 2025 timetable.
 * All displayed program times use America/New_York (Eastern).
 */
const ORIENTATION_URL = "https://www.to-analytics.com/splunk-orientation";
const SERVER_URL = "https://a.co/d/0dqtgNco";
const STUDY_HUB_URL = "https://www.to-analytics.com";
const CLASS_EVENTS = OFFICIAL_EVENTS.filter((item) => item.id.startsWith("class-"));
const CERT_EVENTS = OFFICIAL_EVENTS.filter((item) => item.type === "deadline");

const NAV = [
  { id: "overview", title: "Overview", Icon: LayoutDashboard },
  { id: "calendar", title: "Class calendar", Icon: CalendarDays },
  { id: "roadmap", title: "Learning roadmap", Icon: GraduationCap },
  { id: "preparation", title: "Lab preparation", Icon: Server },
];

const ROADMAP = [
  {
    id: "orientation",
    title: "Program orientation",
    caption: "Start your certification preparation",
    Icon: CalendarDays,
  },
  {
    id: "power-user",
    title: "Power User certification",
    caption: "Deadline only — book your exam separately",
    Icon: ShieldCheck,
  },
  {
    id: "admin-cert",
    title: "Enterprise Admin certification",
    caption: "Power User comes first; book separately",
    Icon: GraduationCap,
  },
  {
    id: "lab-ready",
    title: "Server and lab readiness",
    caption: "Suggested preparation check, not a class",
    Icon: Server,
  },
  {
    id: "class-01",
    title: "Practical Splunk classes begin",
    caption: "10 Saturday sessions at 8:00 AM Eastern",
    Icon: BookOpen,
  },
  {
    id: "class-10",
    title: "Final capstone demonstration",
    caption: "Show your lab, dashboards and troubleshooting work",
    Icon: Trophy,
  },
];

const PREPARATION = [
  {
    id: "server",
    title: "Physical server",
    detail: "Plan for an x86-64 host with virtualization support, 8+ cores, 64 GB RAM, a 1 TB SSD/NVMe drive, and wired Ethernet.",
    Icon: Server,
  },
  {
    id: "eight-vms",
    title: "Eight virtual machines",
    detail: "Prepare for CM1, IDX1–IDX3, SH1, MC1, UF1 and UF2 on your personal Proxmox host.",
    Icon: Laptop,
  },
  {
    id: "safe-install",
    title: "Backups and setup materials",
    detail: "Have a separate laptop, networking, bootable installation media and approved Linux ISO ready. Back up existing server data before installation.",
    Icon: ShieldCheck,
  },
  {
    id: "license",
    title: "Licensing and study plan",
    detail: "Arrange eligible Splunk licensing for the full lab period and contact the instructor weekly during certification preparation.",
    Icon: ListChecks,
  },
];

const cx = (...items) => items.filter(Boolean).join(" ");
const card = "rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#112239]";
const muted = "text-slate-500 dark:text-slate-400";

function readEmail() {
  if (typeof window === "undefined") return "";
  try {
    const saved = localStorage.getItem("user") || "";
    if (!saved) return "";
    try {
      const value = JSON.parse(saved);
      return String(typeof value === "string" ? value : value?.email || "").trim();
    } catch {
      return saved.trim();
    }
  } catch {
    return "";
  }
}

function dateLabel(ymd, options = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(`${ymd}T12:00:00Z`)
  );
}

function daysBetween(today, future) {
  return Math.round((Date.parse(`${future}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
}

function statusFor(date, today) {
  if (date < today) return "Past date";
  if (date === today) return "Today";
  return "Upcoming";
}

function EventMark({ event }) {
  const color =
    event.type === "deadline" ? "bg-rose-500" :
    event.type === "reminder" ? "bg-amber-500" :
    "bg-blue-600";
  return <span aria-hidden="true" className={cx("h-2.5 w-2.5 shrink-0 rounded-full", color)} />;
}

function Eyebrow({ children }) {
  return <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700 dark:text-sky-300">{children}</p>;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
      {description && <p className={cx("mt-2 text-sm leading-6", muted)}>{description}</p>}
    </div>
  );
}

function Metric({ title, value, subtitle, Icon }) {
  return (
    <article className={cx(card, "flex min-w-0 items-start justify-between gap-3 p-5")}>
      <div className="min-w-0">
        <p className={cx("text-xs font-semibold", muted)}>{title}</p>
        <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
        <p className={cx("mt-2 text-xs leading-5", muted)}>{subtitle}</p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-sky-400/10 dark:text-sky-300">
        <Icon size={21} />
      </div>
    </article>
  );
}

export default function StudentDashboard() {
  const [darkMode, setDarkMode] = useState(() => {
    try { return typeof window !== "undefined" && localStorage.getItem("scheduleTheme") === "dark"; }
    catch { return false; }
  });
  const [email, setEmail] = useState("");
  const [today, setToday] = useState(getEasternToday);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => { setEmail(readEmail()); }, []);
  useEffect(() => {
    try { localStorage.setItem("scheduleTheme", darkMode ? "dark" : "light"); }
    catch { /* Private browsing may disable storage. */ }
  }, [darkMode]);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(getEasternToday()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const nextEvent = useMemo(
    () => OFFICIAL_EVENTS.find((event) => event.date >= today && !event.suggested),
    [today]
  );
  const nextClass = useMemo(
    () => CLASS_EVENTS.find((event) => event.date >= today),
    [today]
  );
  const upcoming = useMemo(
    () => OFFICIAL_EVENTS.filter((event) => event.date >= today).slice(0, 4),
    [today]
  );
  const untilNext = nextEvent ? daysBetween(today, nextEvent.date) : null;

  const goTo = (id) => {
    setActiveSection(id);
    document.getElementById(`schedule-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen bg-[#f4f7fc] text-slate-900 transition-colors dark:bg-[#071426] dark:text-slate-50">
        {/* Classic T.O. Analytics header */}
        <header className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1b30]">
          <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black text-white">T.O</span>
              <div className="min-w-0">
                <p className="text-sm font-black tracking-tight">T.O Analytics</p>
                <p className={cx("text-[11px] font-semibold", muted)}>Student learning campus</p>
              </div>
              <span className="ml-2 hidden rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold text-blue-700 dark:bg-blue-400/10 dark:text-sky-200 sm:inline-flex">
                Splunk 2026–2027
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {email && <span title={email} className={cx("hidden max-w-[220px] truncate text-xs font-semibold md:block", muted)}>{email}</span>}
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold transition hover:border-blue-300 dark:border-white/10 dark:hover:bg-white/10"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <a href="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold transition hover:border-blue-300 dark:border-white/10 dark:hover:bg-white/10">
                <Home size={16} /> <span className="hidden sm:inline">Dashboard</span>
              </a>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1580px] gap-7 px-4 py-6 sm:px-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10 lg:py-9">
          {/* Same sticky left navigation pattern as CoursePortal */}
          <aside className="min-w-0">
            <div className={cx(card, "p-4 lg:sticky lg:top-6")}>
              <div className="rounded-2xl bg-[#edf5ff] p-4 dark:bg-[#1a3554]">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-blue-700 dark:text-sky-300">
                  <GraduationCap size={17} /> Learning space
                </div>
                <h2 className="mt-3 text-base font-black">Your class schedule</h2>
                <p className={cx("mt-2 text-xs leading-5", muted)}>Classes, certifications, calendar and lab readiness.</p>
              </div>

              <p className={cx("mb-3 mt-5 px-3 text-[10px] font-black uppercase tracking-[0.16em]", muted)}>Workspace</p>
              <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Class schedule navigation">
                {NAV.map(({ id, title, Icon }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => goTo(id)}
                    aria-current={activeSection === id ? "location" : undefined}
                    className={cx(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm",
                      activeSection === id
                        ? "bg-[#0a62d2] text-white shadow-sm"
                        : "text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-white/[0.07]"
                    )}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="min-w-0 flex-1">{title}</span>
                    {activeSection === id && <ChevronRight size={14} className="hidden lg:block" />}
                  </button>
                ))}
              </nav>
              <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10">
                <p className="text-xs font-extrabold">Your next class</p>
                <p className={cx("mt-2 text-xs leading-5", muted)}>
                  {nextClass ? `${dateLabel(nextClass.date)} · ${nextClass.title}` : "All ten class dates have passed."}
                </p>
                <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-blue-700 dark:text-sky-300">
                  <Clock3 size={14} /> 8:00 AM Eastern
                </p>
              </div>
              <a href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold hover:bg-blue-50 dark:border-white/10 dark:hover:bg-white/10">
                Orientation guide <ExternalLink size={13} />
              </a>
            </div>
          </aside>

          <div className="min-w-0 space-y-7">
            <section id="schedule-overview" className="scroll-mt-6 space-y-6">
              <div>
                <Eyebrow>Student learning portal</Eyebrow>
                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Class Schedule</h1>
                <p className={cx("mt-2 text-sm leading-6", muted)}>
                  Your official Splunk 2026–2027 training dates, exam deadlines and preparation resources.
                </p>
              </div>

              {/* Original-style blue/navy hero */}
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
                <div className="pointer-events-none absolute -right-16 -top-28 h-[300px] w-[300px] rounded-full border-[50px] border-white/[0.05]" />
                <div className="pointer-events-none absolute bottom-[-130px] right-[18%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="relative z-10 grid items-center gap-7 xl:grid-cols-[minmax(0,1fr)_290px]">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-sky-100">
                      <GraduationCap size={15} /> Splunk professional training
                    </span>
                    <h2 className="mt-5 text-3xl font-black leading-[1.16] tracking-tight sm:text-4xl">
                      Your learning journey, all in one place.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
                      Prepare for certifications, follow the ten Saturday lab classes, and stay ready for your final capstone. All class times are Eastern.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button type="button" onClick={() => goTo("calendar")}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-[#083269] transition hover:bg-blue-50">
                        View class calendar <ArrowRight size={15} />
                      </button>
                      <button type="button" onClick={() => goTo("roadmap")}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-xs font-extrabold text-white hover:bg-white/10">
                        Learning roadmap
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-blue-100">Next official milestone</p>
                      <CalendarCheck2 size={19} className="text-blue-100" />
                    </div>
                    {nextEvent ? (
                      <>
                        <h3 className="mt-4 text-xl font-black leading-snug">{nextEvent.title}</h3>
                        <p className="mt-2 text-sm text-blue-100">{dateLabel(nextEvent.date)}{nextEvent.time ? ` · ${nextEvent.time} ET` : ""}</p>
                        <div className="mt-5 border-t border-white/20 pt-4 text-xs font-extrabold">
                          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />{untilNext === 0 ? "Scheduled for today" : `In ${untilNext} day${untilNext === 1 ? "" : "s"}`}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="mt-4 text-xl font-black">Program dates completed</h3>
                        <p className="mt-2 text-sm text-blue-100">All scheduled official milestones have passed.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric title="Practical classes" value={String(CLASS_EVENTS.length).padStart(2, "0")} subtitle="Jan 9 – Mar 13, 2027" Icon={BookOpen} />
                <Metric title="Exam deadlines" value={String(CERT_EVENTS.length).padStart(2, "0")} subtitle="Power User & Enterprise Admin" Icon={ShieldCheck} />
                <Metric title="Lab virtual machines" value="08" subtitle="One Proxmox server" Icon={Server} />
                <Metric title="Final capstone" value="01" subtitle="March 13, 2027" Icon={Trophy} />
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(245px,0.85fr)]">
                <div className={cx(card, "p-5 sm:p-6")}>
                  <SectionHeading eyebrow="Upcoming" title="Important program dates" description="Official sessions and certification deadlines, not automatically booked exam appointments." />
                  {upcoming.length ? (
                    <div className="space-y-3">
                      {upcoming.map((event) => (
                        <div key={event.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
                          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-sky-200">
                            <span className="text-[9px] font-black uppercase">{dateLabel(event.date, { month: "short" })}</span>
                            <span className="text-base font-black">{Number(event.date.slice(-2))}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold">{event.title}</p>
                            <p className={cx("mt-1 text-xs", muted)}>{event.time ? `${event.time} Eastern` : event.type === "deadline" ? "Certification deadline" : "Official class date"}</p>
                          </div>
                          <EventMark event={event} />
                        </div>
                      ))}
                    </div>
                  ) : <p className={cx("text-sm", muted)}>No upcoming official dates in this program.</p>}
                </div>

                <div className={cx(card, "p-5 sm:p-6")}>
                  <SectionHeading eyebrow="Program structure" title="Two learning phases" />
                  <div className="space-y-3">
                    <div className="rounded-xl border border-blue-100 bg-[#edf5ff] p-4 dark:border-white/10 dark:bg-[#183451]">
                      <p className="text-xs font-black text-blue-700 dark:text-sky-300">01 · October–December 2026</p>
                      <p className="mt-2 text-sm font-extrabold">Certification preparation</p>
                      <p className={cx("mt-2 text-xs leading-6", muted)}>Power User first, then Enterprise Admin. Weekly instructor outreach is recommended.</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-[#edf5ff] p-4 dark:border-white/10 dark:bg-[#183451]">
                      <p className="text-xs font-black text-blue-700 dark:text-sky-300">02 · January–March 2027</p>
                      <p className="mt-2 text-sm font-extrabold">Practical Splunk lab</p>
                      <p className={cx("mt-2 text-xs leading-6", muted)}>Ten Saturday classes. Build, operate and demonstrate a distributed Splunk lab.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="schedule-calendar" className="scroll-mt-6">
              <SectionHeading eyebrow="Official timetable" title="Learning calendar" description="Select a date to see class details, suggested check-ins and certification deadlines. Eastern Time (America/New_York)." />
              <div className={cx(card, "min-w-0 overflow-hidden")}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 dark:border-white/10 sm:px-6">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-blue-700 dark:text-sky-300" />
                    <h3 className="text-base font-extrabold">2026–2027 course calendar</h3>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:bg-blue-400/10 dark:text-sky-200">Official dates + reminders</span>
                </div>
                <div className="min-w-0 overflow-x-auto p-3 sm:p-5">
                  <ClassCalendar />
                </div>
              </div>
            </section>

            <section id="schedule-roadmap" className="scroll-mt-6">
              <SectionHeading eyebrow="Your progress through the program" title="Learning roadmap" description="A timeline of planned milestones. Past dates do not mean a student automatically completed a class or certification." />
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(250px,0.85fr)]">
                <div className={cx(card, "p-5 sm:p-7")}>
                  {ROADMAP.map(({ id, title, caption, Icon }, index) => {
                    const event = OFFICIAL_EVENTS.find((item) => item.id === id);
                    if (!event) return null;
                    const status = statusFor(event.date, today);
                    return (
                      <div key={id} className="relative flex gap-4 pb-7 last:pb-0">
                        {index !== ROADMAP.length - 1 && <div className="absolute bottom-0 left-[19px] top-11 w-px bg-slate-200 dark:bg-white/10" />}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-sky-300">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold">{title}</h3>
                            {status === "Today" && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">Today</span>}
                            {status === "Past date" && <span className={cx("text-[10px]", muted)}>Past date</span>}
                          </div>
                          <p className="mt-1 text-xs font-bold text-blue-700 dark:text-sky-300">{dateLabel(event.date)}{event.time ? ` · ${event.time} Eastern` : ""}</p>
                          <p className={cx("mt-2 text-xs leading-6", muted)}>{caption}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={cx(card, "p-5 sm:p-6")}>
                  <h3 className="text-lg font-black">10 Saturday classes</h3>
                  <p className={cx("mt-2 text-xs leading-6", muted)}>Every practical class starts at 8:00 AM Eastern. End times are not specified.</p>
                  <div className="mt-5 divide-y divide-slate-100 dark:divide-white/10">
                    {CLASS_EVENTS.map((event, index) => (
                      <div key={event.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-black text-blue-700 dark:bg-white/10 dark:text-sky-300">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold leading-5">{event.title.replace(/^\d{2} /, "")}</p>
                          <p className={cx("text-[11px]", muted)}>{dateLabel(event.date)}</p>
                        </div>
                        {event.date < today && <span className="text-[10px] font-semibold text-slate-400">Past</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="schedule-preparation" className="scroll-mt-6">
              <SectionHeading eyebrow="Before January 9" title="Personal lab preparation" description="The new program requires a personal server and a planned eight-VM Splunk environment. Review these requirements before practical classes begin." />
              <div className="grid gap-4 sm:grid-cols-2">
                {PREPARATION.map(({ id, title, detail, Icon }) => (
                  <div key={id} className={cx(card, "p-5 sm:p-6")}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-sky-300"><Icon size={21} /></div>
                    <h3 className="mt-4 text-sm font-black">{title}</h3>
                    <p className={cx("mt-2 text-xs leading-6", muted)}>{detail}</p>
                  </div>
                ))}
              </div>
              <div className={cx(card, "mt-5 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6")}>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black"><Info size={17} className="text-blue-600 dark:text-sky-300" /> Important dates and licensing</h3>
                  <p className={cx("mt-2 max-w-2xl text-xs leading-6", muted)}>
                    January 8 is a suggested readiness reminder. The Splunk Enterprise trial described in your orientation deck is shorter than the full January 9–March 13 lab period, so plan appropriate licensing early.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={SERVER_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-blue-800">
                    Recommended server <ArrowUpRight size={15} />
                  </a>
                  {/* <a href={STUDY_HUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold hover:bg-blue-50 dark:border-white/10 dark:hover:bg-white/10">
                    Study hub <ExternalLink size={14} />
                  </a> */}
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                <Bell size={16} className="mt-0.5 shrink-0" />
                {/* <span>Suggested weekly instructor check-ins are reminders to reach out, not confirmed live classes. Certification deadlines do not mean your exam has been booked.</span> */}
              </div>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span>© {new Date().getFullYear()} T.O Analytics LLC · Splunk 2026–2027</span>
              <span className="flex items-center gap-2"><Clock3 size={14} /> All published class start times are Eastern.</span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
