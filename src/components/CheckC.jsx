import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  BookOpen,
  GraduationCap,
  Clock3,
  Moon,
  Sun,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Server,
  Info,
  ExternalLink,
  Bell,
} from "lucide-react";
import ClassCalendar, { OFFICIAL_EVENTS, getEasternToday } from "./Days";

/**
 * T.O. Analytics Splunk cohort dashboard (2026–2027).
 * This dashboard and Days.jsx share one source of schedule data.
 * Dates/times follow TO_Analytics_Splunk_Calendar_2026_2027.pdf.
 * Time zone: America/New_York (Eastern).
 */
const ORIENTATION_URL = "https://www.to-analytics.com/splunk-orientation";
const SERVER_URL = "https://a.co/d/0dqtgNco";

const ROADMAP = [
  {
    id: "orientation", date: "2026-10-31", title: "Program Orientation",
    subtitle: "October 31, 2026 · 8:00–10:00 AM ET",
    description: "Meet the cohort and begin certification preparation.", icon: CalendarDays,
  },
  {
    id: "power-user", date: "2026-11-28", title: "Power User Deadline",
    subtitle: "November 28, 2026",
    description: "Certification deadline. Book your exam separately.", icon: ShieldCheck,
  },
  {
    id: "admin-cert", date: "2026-12-19", title: "Enterprise Admin Deadline",
    subtitle: "December 19, 2026",
    description: "Certification deadline; Power User comes first.", icon: GraduationCap,
  },
  {
    id: "lab-ready", date: "2027-01-08", title: "Server & Lab Readiness",
    subtitle: "January 8, 2027 · Suggested check",
    description: "Purchase and prepare a server before practical classes begin.", icon: Server,
  },
  {
    id: "class-01", date: "2027-01-09", end: "2027-03-13",
    title: "10 Practical Splunk Classes",
    subtitle: "January 9 – March 13, 2027",
    description: "Saturday sessions begin at 8:00 AM Eastern. End times are not specified.", icon: BookOpen,
  },
  {
    id: "class-10", date: "2027-03-13", title: "Final Capstone",
    subtitle: "March 13, 2027 · 8:00 AM ET",
    description: "Present your deployment, dashboards, alerts, and troubleshooting evidence.", icon: BriefcaseBusiness,
  },
];

const SUMMARY = [
  { title: "Practical Classes", value: "10", subtitle: "January–March 2027", icon: BookOpen },
  { title: "Certification Deadlines", value: "02", subtitle: "Power User & Enterprise Admin", icon: ShieldCheck },
  { title: "Final Capstone", value: "01", subtitle: "March 13, 2027", icon: BriefcaseBusiness },
];

const BADGE = {
  class: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  deadline: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  reminder: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function formatDate(dateKey, options = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(`${dateKey}T12:00:00Z`)
  );
}

function daysBetween(a, b) {
  const first = Date.parse(`${a}T00:00:00Z`);
  const second = Date.parse(`${b}T00:00:00Z`);
  return Math.round((second - first) / 86400000);
}

function getUserEmail() {
  if (typeof window === "undefined") return "";
  const saved = window.localStorage.getItem("user");
  if (!saved) return "";
  try {
    const user = JSON.parse(saved);
    return (typeof user === "string" ? user : user?.email || "").trim();
  } catch {
    return saved.trim();
  }
}

function getMilestoneStatus(item, today) {
  if (today > (item.end || item.date)) return "Past date";
  if (today >= item.date) return "In progress";
  return "Upcoming";
}

export default function StudentDashboard() {
  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" && window.localStorage.getItem("scheduleTheme") === "dark"
  );
  const [userEmail, setUserEmail] = useState("");
  const [today, setToday] = useState(getEasternToday);

  useEffect(() => {
    setUserEmail(getUserEmail());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("scheduleTheme", darkMode ? "dark" : "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = window.setInterval(() => setToday(getEasternToday()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Reminders and instructor check-ins should not replace the next official class/deadline.
  const nextEvent = useMemo(() =>
    OFFICIAL_EVENTS.find((event) => event.date >= today && event.type !== "reminder"),
  [today]);
  const daysUntil = nextEvent ? daysBetween(today, nextEvent.date) : null;
  const currentClass = OFFICIAL_EVENTS.find((event) => event.date === today && event.id.startsWith("class-"));

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen bg-[#f8f7fc] text-slate-900 transition-colors duration-300 dark:bg-[#10111c] dark:text-white">
        <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
          {/* Page header: retained from original layout */}
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-violet-700 dark:text-violet-400">
                <CalendarDays size={16} />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Student Learning Portal</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Class Schedule</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                Your official 2026–2027 Splunk classes, deadlines and lab preparation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {userEmail && (
                <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Student Account</p>
                    <p className="max-w-[190px] truncate text-xs font-semibold">{userEmail}</p>
                  </div>
                </div>
              )}
              <button type="button" onClick={() => setDarkMode((value) => !value)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>
          </header>

          {/* Hero: same placement and visual language */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6226c8] via-[#7736d7] to-[#4330a6] p-6 text-white sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-20 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
                  <Sparkles size={14} /> Splunk Cohort 2026–2027
                </div>
                <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                  Your learning journey,<br />all in one place.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-purple-100 sm:text-base">
                  Follow your classes, certification deadlines and weekly preparation.
                  All class times are Eastern (America/New_York).
                </p>
                <a href={ORIENTATION_URL} target="_blank" rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-purple-50">
                  Program Information <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="w-full shrink-0 rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-md lg:w-[310px]">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-100">Next Official Milestone</p>
                  <Clock3 size={18} className="text-purple-100" />
                </div>
                {nextEvent ? (
                  <>
                    <h3 className="text-xl font-bold leading-snug">{nextEvent.title}</h3>
                    <p className="mt-2 text-sm text-purple-100">
                      {formatDate(nextEvent.date)}
                      {nextEvent.time ? ` · ${nextEvent.time} ET` : ""}
                    </p>
                    <div className="mt-5 border-t border-white/20 pt-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                        {daysUntil === 0 ? "Scheduled for today" : `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}
                      </div>
                      {currentClass && <p className="mt-2 text-xs text-purple-100">Today's practical training starts at 8:00 AM Eastern.</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold">Program schedule completed</h3>
                    <p className="mt-2 text-sm text-purple-100">All listed official dates have passed.</p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Program overview">
            {SUMMARY.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                      <h3 className="mt-2 text-3xl font-bold">{card.value}</h3>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      <Icon size={21} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{card.subtitle}</p>
                </div>
              );
            })}
          </section>

          {/* Calendar and roadmap: the calendar is imported from Days.jsx, not duplicated */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                <div className="flex items-start justify-between gap-4 sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays size={20} className="text-violet-700 dark:text-violet-400" />
                      <h2 className="text-lg font-bold">Learning Calendar</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select dates to see all events and class details.</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">2026–2027</span>
                </div>
              </div>
              <div className="overflow-x-auto p-3 sm:p-5">
                <ClassCalendar />
              </div>
            </section>

            <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap size={21} className="text-violet-700 dark:text-violet-400" />
                  <h2 className="text-lg font-bold">Program Roadmap</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Training, certification and final demonstration.</p>
              </div>
              <div className="p-5">
                {ROADMAP.map((item, index) => {
                  const Icon = item.icon;
                  const status = getMilestoneStatus(item, today);
                  const isLast = index === ROADMAP.length - 1;
                  return (
                    <div key={item.id} className="relative flex items-start gap-3 pb-6 last:pb-0">
                      {!isLast && <div className="absolute bottom-0 left-[18px] top-10 w-px bg-slate-200 dark:bg-slate-700" />}
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                          {status === "In progress" && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">Current</span>}
                          {status === "Past date" && <span className="text-[10px] text-slate-400">Past date</span>}
                        </div>
                        <p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-400">{item.subtitle}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                      <ChevronRight size={15} className="mt-2 shrink-0 text-slate-300 dark:text-slate-600" />
                    </div>
                  );
                })}
              </div>
              <div className="mx-5 mb-5 space-y-3 rounded-xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-900/20">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold text-violet-800 dark:text-violet-300"><Server size={15} /> Server preparation</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">A server is required for January 9, 2027. The January 8 readiness check is only a suggested reminder.</p>
                  <a href={SERVER_URL} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300">
                    Recommended server <ExternalLink size={12} />
                  </a>
                </div>
                <div className="border-t border-violet-200/70 pt-3 dark:border-violet-900/50">
                  <p className="flex items-center gap-2 text-xs font-semibold text-violet-800 dark:text-violet-300"><Bell size={15} /> Weekly check-ins</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">Suggested Saturday reach-outs are not scheduled meetings.</p>
                </div>
                <div className="border-t border-violet-200/70 pt-3 dark:border-violet-900/50">
                  <p className="flex items-center gap-2 text-xs font-semibold text-violet-800 dark:text-violet-300"><Info size={15} /> Exam appointments</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">The November and December dates are certification deadlines. Actual exams must be scheduled separately.</p>
                </div>
              </div>
            </aside>
          </div>

          <footer className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} T.O. Analytics LLC</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={15} /> All scheduled class times are Eastern.
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
