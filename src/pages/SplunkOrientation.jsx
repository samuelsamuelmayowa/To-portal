import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
  Laptop2,
  Mail,
  Monitor,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

/**
 * T.O Analytics — Splunk Orientation, 2026–2027
 * Drop-in React + Tailwind page for /splunk-orientation.
 * The calendar information below is sourced from the supplied 6-page PDF.
 * Place the accompanying PDF in /public for the download button to work.
 * Existing page details (tuition, Zelle email, links) are retained.
 */

const SITE = "https://www.to-analytics.com";
const EMAIL = "t.oanalyticsllc@gmail.com";
const PDF_URL = "/splunk-cohort-calendar-2026-2027.pdf";
const SERVER_URL = "https://a.co/d/0dqtgNco";

const MONTHS = [
  { label: "October 2026", year: 2026, month: 9 },
  { label: "November 2026", year: 2026, month: 10 },
  { label: "December 2026", year: 2026, month: 11 },
  { label: "January 2027", year: 2027, month: 0 },
  { label: "February 2027", year: 2027, month: 1 },
  { label: "March 2027", year: 2027, month: 2 },
];

const CLASSES = [
  {
    number: "01",
    date: "2027-01-09",
    title: "Proxmox + VMs",
    description: "Prepare the lab environment and work with virtual machines.",
  },
  {
    number: "02",
    date: "2027-01-16",
    title: "Splunk architecture",
    description: "Explore how the main components of a Splunk deployment work together.",
  },
  {
    number: "03",
    date: "2027-01-23",
    title: "Data onboarding",
    description: "Work with the processes involved in bringing data into Splunk.",
  },
  {
    number: "04",
    date: "2027-01-30",
    title: "SPL + fields",
    description: "Practice searching, shaping and understanding event fields.",
  },
  {
    number: "05",
    date: "2027-02-06",
    title: "Dashboard Studio",
    description: "Build useful visual views of data and search results.",
  },
  {
    number: "06",
    date: "2027-02-13",
    title: "Alerts + CIM",
    description: "Understand alert workflows and the Common Information Model.",
  },
  {
    number: "07",
    date: "2027-02-20",
    title: "Admin + automation",
    description: "Learn platform administration and repeatable operational tasks.",
  },
  {
    number: "08",
    date: "2027-02-27",
    title: "Health + recovery",
    description: "Explore operational health, troubleshooting and recovery.",
  },
  {
    number: "09",
    date: "2027-03-06",
    title: "Modern Splunk",
    description: "Connect earlier learning to contemporary Splunk workflows.",
  },
  {
    number: "10",
    date: "2027-03-13",
    title: "CAPSTONE",
    description: "Demonstrate the deployment, dashboards, alerts and troubleshooting evidence.",
  },
];

const MILESTONES = [
  {
    date: "Oct 31, 2026",
    title: "Orientation",
    description: "Program introduction and learning expectations.",
    tag: "Live orientation",
    type: "session",
  },
  {
    date: "Nov 28, 2026",
    title: "Core Power User deadline",
    description: "Certification deadline in the calendar. Book the actual exam separately.",
    tag: "Deadline",
    type: "deadline",
  },
  {
    date: "Dec 19, 2026",
    title: "Enterprise Admin deadline",
    description: "Certification deadline in the calendar; Power User comes first.",
    tag: "Deadline",
    type: "deadline",
  },
  {
    date: "Jan 8, 2027",
    title: "Lab readiness check",
    description: "Suggested reminder to have the required server and lab ready.",
    tag: "Reminder",
    type: "reminder",
  },
  {
    date: "Jan 9, 2027",
    title: "Practical classes begin",
    description: "First of ten Saturday sessions, beginning with Proxmox + VMs.",
    tag: "Class begins",
    type: "session",
  },
  {
    date: "Mar 13, 2027",
    title: "Final capstone demonstration",
    description: "Present the working Splunk solution and supporting evidence.",
    tag: "Final session",
    type: "session",
  },
];

const COURSE_HIGHLIGHTS = [
  { icon: Server, title: "Infrastructure", text: "Proxmox, virtual machines and deployment architecture" },
  { icon: Terminal, title: "Search & data", text: "Data onboarding, SPL and event fields" },
  { icon: Monitor, title: "Observability", text: "Dashboard Studio, alerts and CIM" },
  { icon: ShieldCheck, title: "Administration", text: "Automation, platform health and recovery" },
  { icon: Award, title: "Certification goals", text: "Power User and Enterprise Admin preparation" },
  { icon: GraduationCap, title: "Capstone", text: "Demonstrate a working deployment with evidence" },
];

const DELIVERABLES = [
  "Weekly labs and practical assignments",
  "Hands-on SPL search and field exercises",
  "A working Splunk deployment and configuration evidence",
  "Data forwarding and onboarding practice",
  "Dashboards, alerts and operational troubleshooting",
  "An up-to-date configuration record and runbook",
  "A final capstone demonstration on March 13",
];

const FAQS = [
  {
    question: "When is the orientation?",
    answer: "Saturday, October 31, 2026, from 8:00 to 10:00 AM Eastern Time.",
  },
  {
    question: "When do the practical classes start?",
    answer: "The new calendar lists ten Saturday classes from January 9 through March 13, 2027. Each class begins at 8:00 AM Eastern Time; class end times are not specified.",
  },
  {
    question: "Are there classes every Saturday in November and December?",
    answer: "The calendar shows suggested weekly check-in reminders, not booked classes, during those months. Certification deadlines are marked separately.",
  },
  {
    question: "Do I need a server for the labs?",
    answer: "Yes. The course calendar requires each student to purchase a server and prepare it before the first lab on January 9, 2027.",
  },
  {
    question: "Are the certification dates exam appointments?",
    answer: "No. The November 28 and December 19 dates are calendar deadlines. Students must schedule their actual certification exams separately.",
  },
  {
    question: "How can I enroll or ask a question?",
    answer: "Use the registration link or contact T.O Analytics using the enrollment email shown on this page.",
  },
];

function addEvent(target, date, event) {
  if (!target[date]) target[date] = [];
  target[date].push(event);
}

function makeEvents() {
  const events = {};
  addEvent(events, "2026-10-31", {
    type: "session", title: "Orientation", detail: "8:00–10:00 AM Eastern",
  });
  addEvent(events, "2026-10-31", {
    type: "reminder", title: "Weekly check-in reminder", detail: "Suggested student follow-up",
  });

  ["2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28", "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26"].forEach((date) => {
    addEvent(events, date, {
      type: "reminder", title: "Weekly check-in reminder", detail: "Suggested outreach, not a booked meeting",
    });
  });
  addEvent(events, "2026-11-28", {
    type: "deadline", title: "Power User certification deadline", detail: "Book actual exam separately",
  });
  addEvent(events, "2026-12-19", {
    type: "deadline", title: "Enterprise Admin certification deadline", detail: "Power User comes first",
  });
  addEvent(events, "2027-01-08", {
    type: "reminder", title: "Lab readiness check", detail: "Suggested server preparation reminder",
  });
  CLASSES.forEach((item) => addEvent(events, item.date, {
    type: "session", title: `${item.number} · ${item.title}`, detail: "Class starts 8:00 AM Eastern",
  }));
  return events;
}

const EVENTS_BY_DATE = makeEvents();
const TYPE_COLORS = {
  session: "bg-violet-600",
  deadline: "bg-fuchsia-600",
  reminder: "bg-slate-400",
};
const TYPE_BADGES = {
  session: "bg-violet-100 text-violet-800",
  deadline: "bg-fuchsia-100 text-fuchsia-800",
  reminder: "bg-slate-100 text-slate-700",
};

function dateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function createCalendarCells({ year, month }) {
  const startWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const length = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  return Array.from({ length }, (_, i) => {
    const day = i - startWeekday + 1;
    if (day < 1 || day > daysInMonth) return null;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });
}

function firstEventInMonth(monthIndex) {
  const { year, month } = MONTHS[monthIndex];
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  return Object.keys(EVENTS_BY_DATE).sort().find((key) => key.startsWith(prefix)) || `${prefix}01`;
}

function initialMonthIndex() {
  const today = new Date();
  const key = today.getFullYear() * 12 + today.getMonth();
  const first = MONTHS[0].year * 12 + MONTHS[0].month;
  const last = MONTHS[MONTHS.length - 1].year * 12 + MONTHS[MONTHS.length - 1].month;
  if (key <= first) return 0;
  if (key >= last) return MONTHS.length - 1;
  return key - first;
}

function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-extrabold uppercase tracking-[0.24em] ${light ? "text-violet-200" : "text-violet-700"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.6rem] ${light ? "text-white" : "text-slate-950"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base leading-7 sm:text-lg ${light ? "text-slate-300" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

function CalendarSection() {
  const [monthIndex, setMonthIndex] = useState(initialMonthIndex);
  const [selectedDate, setSelectedDate] = useState(() => firstEventInMonth(initialMonthIndex()));
  const month = MONTHS[monthIndex];
  const cells = useMemo(() => createCalendarCells(month), [month]);
  const events = EVENTS_BY_DATE[selectedDate] || [];

  function switchMonth(nextIndex) {
    const clamped = Math.max(0, Math.min(MONTHS.length - 1, nextIndex));
    setMonthIndex(clamped);
    setSelectedDate(firstEventInMonth(clamped));
  }

  return (
    <section id="calendar" className="scroll-mt-24 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Interactive course calendar"
            title="See every important date"
            description="Explore October 2026 through March 2027. Select a highlighted date to see the session, certification deadline or suggested reminder."
          />
          <a
            href={PDF_URL}
            download="TO-Analytics-Splunk-Cohort-Calendar-2026-2027.pdf"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-800 shadow-sm transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            <Download size={17} aria-hidden="true" /> Download official calendar
          </a>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.82fr)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cohort timetable</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">{month.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchMonth(monthIndex - 1)}
                  disabled={monthIndex === 0}
                  aria-label="Previous month"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => switchMonth(monthIndex + 1)}
                  disabled={monthIndex === MONTHS.length - 1}
                  aria-label="Next month"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="px-3 pb-4 pt-5 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <div key={day} className="pb-2 text-center text-[10px] font-extrabold tracking-wide text-slate-400 sm:text-xs">
                    {day}
                  </div>
                ))}
                {cells.map((date, index) => {
                  if (!date) return <div key={`blank-${index}`} className="min-h-[56px] sm:min-h-[86px]" />;
                  const dateEvents = EVENTS_BY_DATE[date] || [];
                  const isSelected = date === selectedDate;
                  const saturday = new Date(`${date}T12:00:00Z`).getUTCDay() === 6;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      aria-pressed={isSelected}
                      aria-label={`${dateLabel(date)}${dateEvents.length ? `, ${dateEvents.map((e) => e.title).join(", ")}` : ", no scheduled event"}`}
                      className={`relative flex min-h-[56px] flex-col items-start rounded-xl border px-1.5 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 sm:min-h-[86px] sm:px-2.5 sm:py-2.5 ${
                        isSelected
                          ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600"
                          : dateEvents.length
                          ? "border-violet-100 bg-violet-50/60 hover:border-violet-300 hover:bg-violet-50"
                          : saturday
                          ? "border-slate-100 bg-slate-50 hover:border-slate-300"
                          : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`text-xs font-extrabold sm:text-sm ${isSelected ? "text-violet-800" : "text-slate-700"}`}>
                        {Number(date.slice(-2))}
                      </span>
                      {dateEvents.length > 0 && (
                        <>
                          <span className="mt-auto flex gap-1 pt-1" aria-hidden="true">
                            {dateEvents.map((event, eventIndex) => (
                              <span key={`${event.type}-${eventIndex}`} className={`h-1.5 w-1.5 rounded-full ${TYPE_COLORS[event.type]}`} />
                            ))}
                          </span>
                          <span className="mt-1 hidden text-[10px] font-semibold leading-tight text-violet-900 sm:block">
                            {dateEvents.find((e) => e.type !== "reminder")?.title || "Check-in"}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-xs font-medium text-slate-600">
                {[
                  ["session", "Class / orientation"],
                  ["deadline", "Certification deadline"],
                  ["reminder", "Suggested reminder"],
                ].map(([type, label]) => (
                  <span key={type} className="inline-flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${TYPE_COLORS[type]}`} /> {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-7" aria-live="polite">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-violet-700">
                <CalendarDays size={16} /> Selected date
              </div>
              <h3 className="mt-3 text-2xl font-extrabold text-slate-950">{dateLabel(selectedDate)}</h3>
              {events.length ? (
                <div className="mt-5 space-y-3">
                  {events.map((event, index) => (
                    <div key={`${event.title}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${TYPE_BADGES[event.type]}`}>
                        {event.type === "session" ? "Class / orientation" : event.type}
                      </span>
                      <p className="mt-2 text-base font-extrabold text-slate-900">{event.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-600">No event is listed for this date in the official course calendar.</p>
              )}
            </div>
            <div className="rounded-3xl bg-[#261942] p-6 text-white sm:p-7">
              <div className="flex items-center gap-2 text-violet-200">
                <Clock3 size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Time zone note</span>
              </div>
              <p className="mt-3 text-xl font-extrabold">8:00 AM Eastern</p>
              <p className="mt-2 text-sm leading-6 text-violet-100/85">All official classes begin at 8:00 AM Eastern Time. Orientation runs until 10:00 AM; other class end times are not specified.</p>
              <p className="mt-3 text-xs leading-5 text-violet-200">Weekly check-ins are suggestions, not scheduled meetings.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SplunkOrientation() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <section id="overview" className="relative isolate scroll-mt-24 overflow-hidden bg-[#1b1130] text-white">
        <div className="pointer-events-none absolute -right-28 -top-32 h-[36rem] w-[36rem] rounded-full bg-violet-700/35 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-56 -left-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-700/20 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.11) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(to bottom,black,transparent 94%)",
        }} />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 md:px-10 lg:pb-24">
          <div className="mb-16 flex flex-wrap items-center justify-between gap-4">
            <a href={SITE} className="inline-flex items-center gap-3 text-white" aria-label="T.O Analytics home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-black tracking-tight">T.O</span>
              <span className="text-base font-extrabold tracking-tight">T.O Analytics <span className="font-medium text-violet-300">/ Learning</span></span>
            </a>
            <nav className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300 sm:gap-6 sm:text-sm" aria-label="Orientation page sections">
              <a href="#curriculum" className="transition hover:text-white">Curriculum</a>
              <a href="#calendar" className="transition hover:text-white">Calendar</a>
              <a href="#enrollment" className="transition hover:text-white">Enrollment</a>
            </nav>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_.88fr] lg:gap-16">
            <div>
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-xs font-extrabold tracking-wide text-violet-100 sm:text-sm">
                <Sparkles size={15} /> 2026–2027 SPLUNK COHORT
              </div>
              <h1 className="mt-7 max-w-3xl text-[2.65rem] font-black leading-[1.07] tracking-[-0.045em] sm:text-6xl lg:text-[4.2rem]">
                Learn Splunk. <span className="text-violet-300">Build real skills.</span> Prove what you can do.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                An orientation and hands-on learning path covering Splunk infrastructure, searching, data onboarding, dashboards, alerts, administration, and a final capstone project.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Register now <ArrowRight size={17} />
                </Link>
                <a href="#calendar" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/15">
                  View course calendar <CalendarDays size={17} />
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-violet-300" /> Practical labs</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-violet-300" /> Certification focus</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-violet-300" /> Capstone</span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/15 bg-white/[0.075] p-4 shadow-2xl shadow-black/25 backdrop-blur-lg sm:p-6">
                <div className="flex items-center justify-between border-b border-white/15 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.2em] text-violet-200">Cohort kickoff</p>
                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">Orientation day</h2>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-200"><GraduationCap size={24} /></span>
                </div>
                <div className="mt-6 rounded-2xl bg-white p-5 text-slate-950 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-100 py-3 text-violet-900">
                      <span className="text-[10px] font-extrabold tracking-widest">OCT</span>
                      <span className="text-3xl font-black leading-tight">31</span>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold">Saturday, 2026</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 size={15} /> 8:00–10:00 AM Eastern</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">Orientation and introduction to the program</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-3xl font-black">10</p>
                    <p className="mt-1 text-xs font-medium text-violet-200">Practical Saturday classes</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-3xl font-black">Mar 13</p>
                    <p className="mt-1 text-xs font-medium text-violet-200">Final capstone · 2027</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#170e2a]/60 px-4 py-3 text-sm">
                  <span className="font-medium text-slate-300">Course tuition</span>
                  <strong className="text-lg font-black">$3,500</strong>
                </div>
              </div>
              <div className="pointer-events-none absolute -bottom-5 -right-5 -z-10 h-32 w-32 rounded-full bg-fuchsia-500/30 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-slate-100 bg-white py-9">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 md:grid-cols-3 md:px-10">
          {[
            { icon: CalendarDays, label: "ORIENTATION", value: "Oct 31, 2026", detail: "8:00–10:00 AM Eastern" },
            { icon: Laptop2, label: "PRACTICAL TRAINING", value: "Jan 9 – Mar 13", detail: "10 Saturday sessions in 2027" },
            { icon: Award, label: "CERTIFICATION FOCUS", value: "2 pathways", detail: "Core Power User + Enterprise Admin" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800"><Icon size={22} /></span>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-black text-slate-950">{item.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="curriculum" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading
            eyebrow="2027 learning path"
            title="10 Saturday sessions. One practical journey."
            description="The official calendar lists these ten classes, starting January 9, 2027. Every class begins at 8:00 AM Eastern. The descriptions below summarize the focus of each topic."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CLASSES.map((item) => (
              <article key={item.number} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_55px_-30px_rgba(91,33,182,.3)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-xl font-black text-violet-800">{item.number}</span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">{dateLabel(item.date)}</span>
                </div>
                <h3 className="mt-6 text-xl font-extrabold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-2 min-h-[4rem] text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-violet-800">
                  <Clock3 size={15} /> 8:00 AM Eastern
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-5 text-sm leading-6 text-violet-950">
            <Info size={19} className="mt-0.5 shrink-0" />
            <p>Class end times are not provided in the official calendar. The March 13 capstone is the final scheduled class and demonstration—not a separate interview-prep event.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#201436] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading eyebrow="Your skill set" title="Technical learning that connects to real work" description="The program combines searchable data, infrastructure, monitoring, and practical evidence of your work." light />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COURSE_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.065] p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200"><Icon size={22} /></span>
                  <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="milestones" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading eyebrow="Important milestones" title="A clear path from orientation to capstone" description="Key dates below are reproduced from the updated cohort calendar. Certification deadlines do not automatically reserve an exam appointment." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MILESTONES.map((item) => (
              <div key={item.date} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-violet-800">{item.date}</span>
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${TYPE_BADGES[item.type]}`}>{item.tag}</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
            <Info size={20} className="mt-0.5 shrink-0" />
            <p>The supplied calendar places the Enterprise Admin deadline on December 19, 2026, before the January–March practical classes. Students should confirm how that deadline applies to their individual certification plan.</p>
          </div>
        </div>
      </section>

      <CalendarSection />

      <section id="requirements" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:px-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-800"><BookOpen size={24} /></div>
            <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">What you’ll practice and deliver</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">The calendar emphasizes weekly labs, configurations, saved searches, a current runbook, and a final demonstration.</p>
            <ul className="mt-6 space-y-3">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-violet-700" size={18} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-violet-700 to-[#241543] p-7 text-white shadow-xl shadow-violet-900/10 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15"><Server size={24} /></div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[.2em] text-violet-200">Required preparation</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Get your lab server ready</h2>
            <p className="mt-4 text-sm leading-7 text-violet-100">According to the official calendar, every student must purchase a server and prepare for January 9, 2027. January 8 is the suggested readiness reminder.</p>
            <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-violet-200">Preparation checklist</p>
              <div className="mt-4 space-y-3 text-sm font-medium">
                <p className="flex items-center gap-2"><CheckCircle2 size={17} /> Have the required server available</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={17} /> Prepare your virtual lab environment</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={17} /> Be ready for the January 9 session</p>
              </div>
            </div>
            <a href={SERVER_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-violet-950 transition hover:bg-violet-100">
              View calendar's suggested server <ExternalLink size={16} />
            </a>
            <p className="mt-3 text-xs leading-5 text-violet-200">The link above is the recommended option listed in the supplied course calendar.</p>
          </div>
        </div>
      </section>

      <section id="enrollment" className="scroll-mt-24 bg-violet-50/65 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 rounded-[2rem] border border-violet-100 bg-white p-7 shadow-[0_25px_90px_-55px_rgba(76,29,149,.45)] sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Registration & tuition" title="Ready to join the cohort?" description="Review the published enrollment details, register through the website, or speak with T.O Analytics before making a payment." />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-violet-800">Register now <ArrowRight size={17} /></Link>
                <a href={`mailto:${EMAIL}?subject=Splunk%20Cohort%20Enrollment%20Question`} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-6 py-3.5 text-sm font-extrabold text-violet-800 transition hover:bg-violet-50"><Mail size={17} /> Contact enrollment</a>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#231638] p-6 text-white">
                <p className="text-xs font-extrabold uppercase tracking-widest text-violet-200">Tuition shown on existing website</p>
                <p className="mt-2 text-4xl font-black">$3,500</p>
                <div className="mt-5 border-t border-white/15 pt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Payment method</p>
                  <p className="mt-1 text-lg font-extrabold">Zelle</p>
                  <p className="mt-1 break-all text-sm text-slate-200">{EMAIL}</p>
                </div>
              </div>
              <p className="flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-violet-700" /> Confirm the current tuition and recipient details directly with T.O Analytics before sending money.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <SectionHeading eyebrow="Frequently asked questions" title="Answers before you begin" description="The details here reflect the supplied cohort calendar and the existing enrollment page." />
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {FAQS.map((item) => (
              <details key={item.question} className="group h-fit rounded-2xl border border-slate-200 bg-white p-5 open:border-violet-200 open:bg-violet-50/40 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-extrabold text-slate-950 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition group-open:rotate-90"><ChevronRight size={17} /></span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-lg font-extrabold text-slate-950">T.O Analytics</p>
            <p className="mt-1 text-sm text-slate-600">Splunk Cohort · 2026–2027</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-violet-800">
            <a href={SITE} className="hover:underline">Website <ArrowUpRight size={14} className="inline" /></a>
            <a href={PDF_URL} className="hover:underline"><FileText size={14} className="inline" /> Course PDF</a>
            <a href={`mailto:${EMAIL}`} className="hover:underline">Email us <Mail size={14} className="inline" /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}


// import React from "react";
// import { Link } from "react-router-dom";

// const courseHighlights = [
//   "14-week Splunk training",
//   "Splunk basics & architecture",
//   "Search Processing Language (SPL)",
//   "Dashboards, reports & visualizations",
//   "Alerts & monitoring",
//   "Data inputs & indexing",
//   "User management & security",
//   "Advanced SPL & optimization",
//   "Final capstone project",
// ];

// const certificationFocus = [
//   "Splunk Core Power User Certification Exam",
//   "Splunk Enterprise Certified Admin Exam",
// ];

// const schedule = [
//   {
//     id: 1,
//     date: "October 31st",
//     title: "Orientation",
//     items: [],
//   },
//   {
//     id: 2,
//     date: "November 14th to December 19th",
//     title: "Splunk Foundations (Beginner)",
//     items: [
//       "Introduction to Splunk",
//       "Searching & Reporting",
//       "Basic SPL",
//       "Fields & Knowledge",
//     ],
//   },
//   {
//     id: 3,
//     date: "Two Weeks Certification Break",
//     title: "Power User Certification Exam",
//     items: [],
//   },
//   {
//     id: 4,
//     date: "January 9th to February 27th",
//     title: "Splunk Backend Administration",
//     items: [
//       "Distributed Splunk Architecture",
//       "Data Onboarding & Platform Management",
//       "Performance Tuning & Troubleshooting",
//     ],
//   },
//   {
//     id: 5,
//     date: "Two Weeks Certification Break",
//     title: "Splunk Enterprise Certified Admin Exam",
//     items: [],
//   },
//   {
//     id: 6,
//     date: "March 13th",
//     title: "Interview Prep",
//     items: [],
//   },
// ];

// // const deliverables = [
// //   "Weekly assignments",
// //   "Hands-on Splunk search tasks",
// //   "Dashboard and report practice",
// //   "Alert configuration practice",
// //   "Final project: Complete Splunk solution from data ingestion to dashboards and alerts",
// // ];
// const deliverables = [
//   "Weekly assignments",
//   "Hands-on Splunk search tasks",
//   "Dashboard and alert practice",
//   "Final project: Building and configuring a distributed Splunk deployment",
//   "Final project: Setting up forwarding and data onboarding",
//   "Final project: Dashboards and alerts",
// ];

// export default function SplunkOrientation() {
//   return (
//     <main className="min-h-screen bg-white text-slate-950">
//       {/* HERO */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-white">
//         <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-3xl" />
//         <div className="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/20 blur-3xl" />

//         <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-10 lg:py-24">
//           <div className="grid items-center gap-12 lg:grid-cols-2">
//             <div>
//               <div className="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
//                 T.O Analytics LLC Orientation Program
//               </div>

//               <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
//                 {/* T.O Orientation */}
//                 <span className="mt-3 block bg-gradient-to-r from-purple-800 to-fuchsia-600 bg-clip-text text-3xl text-transparent md:text-5xl">
//                   Introduction to Splunk
//                 </span>
//               </h1>

//               <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
//                 Join our Introduction to Splunk Orientation and discover how
//                 Splunk helps with data collection, indexing, searching,
//                 dashboards, alerts, IT operations, security, and business
//                 analytics.
//               </p>

//               <div className="mt-8 flex flex-col gap-4 sm:flex-row">
//                 <a
//                   href="https://www.to-analytics.com/login"
//                   target="_blank"
//                   rel="noreferrer"
//                   className="rounded-2xl bg-gradient-to-r from-purple-800 to-fuchsia-600 px-7 py-4 text-center font-bold text-white shadow-lg shadow-purple-500/25 transition hover:scale-[1.02]"
//                 >
//                   Register Now
//                 </a>

//                 <a
//                   href="mailto:t.oanalyticsllc@gmail.com"
//                   className="rounded-2xl border border-purple-200 bg-white px-7 py-4 text-center font-bold text-purple-800 shadow-sm transition hover:bg-purple-50"
//                 >
//                   Contact for Enrollment
//                 </a>
//               </div>

//               <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
//                 <span className="rounded-full bg-purple-100 px-4 py-2 text-purple-800">
//                   $3,500 Tuition
//                 </span>
//                 <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-fuchsia-800">
//                   Zelle Payment
//                 </span>
             
//               </div>
//             </div>

//             {/* SUMMARY CARD */}
//          {/* SUMMARY CARD */}
// <div className="rounded-[2rem] border border-purple-100 bg-white p-6 shadow-2xl shadow-purple-900/10">
//   <div className="rounded-[1.5rem] bg-gradient-to-br from-purple-950 via-purple-800 to-fuchsia-700 p-6 text-white">
//     <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-100">
//       Program Schedule
//     </p>

//     <h2 className="mt-3 text-3xl font-extrabold">
//       Orientation starts October 31st
//     </h2>

//     <p className="mt-4 text-purple-100">
//       A structured Splunk learning path covering Splunk Foundations,
//       Backend Administration, certification breaks, and interview preparation.
//     </p>

//     <div className="mt-6 space-y-4">
//       <div className="rounded-2xl bg-white/10 p-4">
//         <p className="font-bold">October 31st</p>
//         <p className="text-sm text-purple-100">Orientation</p>
//       </div>

//       <div className="rounded-2xl bg-white/10 p-4">
//         <p className="font-bold">November 14th to December 19th</p>
//         <p className="text-sm text-purple-100">
//           Splunk Foundations (Beginner)
//         </p>
//       </div>

//       <div className="rounded-2xl bg-white/10 p-4">
//         <p className="font-bold">Two Weeks Certification Break</p>
//         <p className="text-sm text-purple-100">
//           Power User Certification Exam
//         </p>
//       </div>

//       <div className="rounded-2xl bg-white/10 p-4">
//         <p className="font-bold">January 9th to February 27th</p>
//         <p className="text-sm text-purple-100">
//           Splunk Backend Administration
//         </p>
//       </div>

//       <div className="rounded-2xl bg-white/10 p-4">
//         <p className="font-bold">Two Weeks Certification Break</p>
//         <p className="text-sm text-purple-100">
//           Splunk Enterprise Certified Admin Exam
//         </p>
//       </div>

//       <div className="rounded-2xl bg-white/10 p-4">
//         <p className="font-bold">March 13th</p>
//         <p className="text-sm text-purple-100">Interview Prep</p>
//       </div>
//     </div>
//   </div>

//   <div className="mt-6 grid gap-4 sm:grid-cols-2">
//     <div className="rounded-2xl border border-purple-100 p-4">
//       <p className="text-sm text-slate-500">Tuition Fee</p>
//       <p className="mt-1 text-3xl font-extrabold text-slate-950">
//         $3,500
//       </p>
//     </div>

//     <div className="rounded-2xl border border-purple-100 p-4">
//       <p className="text-sm text-slate-500">Payment Option</p>
//       <p className="mt-1 font-bold text-slate-950">Zelle</p>
//       <p className="mt-1 break-all text-sm text-slate-600">
//         t.oanalyticsllc@gmail.com
//       </p>
//     </div>
//   </div>
// </div>
//           </div>
//         </div>
//       </section>

//       {/* CERTIFICATION FOCUS */}
//       <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
//         <div className="mb-10 text-center">
//           <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
//             Certification Focus
//           </p>
//           <h2 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
//             Built around real Splunk certification goals
//           </h2>
//           <p className="mx-auto mt-4 max-w-3xl text-slate-600">
//             This orientation introduces the training path, certification
//             expectations, schedule, payment details, and the practical skills
//             students will build during the program.
//           </p>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           {certificationFocus.map((item, index) => (
//             <div
//               key={item}
//               className="rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-7 shadow-lg shadow-purple-900/5"
//             >
//               <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-700 text-2xl font-black text-white">
//                 {index + 1}
//               </div>
//               <h3 className="text-2xl font-extrabold text-slate-950">{item}</h3>
//               <p className="mt-3 text-slate-600">
//                 Students will be guided through the core knowledge areas,
//                 hands-on practice, exam preparation, and project-based learning
//                 needed to become more confident with Splunk.
//               </p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* COURSE HIGHLIGHTS */}
//       <section className="bg-slate-950 py-16 text-white">
//         <div className="mx-auto max-w-7xl px-5 md:px-10">
//           <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
//             <div>
//               <p className="font-bold uppercase tracking-[0.25em] text-fuchsia-300">
//                 Course Highlights
//               </p>
//               <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
//                 What students will learn
//               </h2>
//               <p className="mt-5 text-slate-300">
//                 The program covers beginner-friendly Splunk foundations and
//                 gradually moves into dashboards, alerts, security, indexing,
//                 optimization, and administration.
//               </p>
//             </div>

//             <div className="grid gap-4 sm:grid-cols-2">
//               {courseHighlights.map((item) => (
//                 <div
//                   key={item}
//                   className="rounded-2xl border border-white/10 bg-white/5 p-5"
//                 >
//                   <div className="mb-3 h-2 w-10 rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400" />
//                   <p className="font-semibold">{item}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SCHEDULE */}
//       {/* SCHEDULE */}
//       <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
//         <div className="mb-12">
//           <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
//             Training Schedule
//           </p>
//           <h2 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
//             Important program dates
//           </h2>
//         </div>

//         <div className="relative">
//           <div className="absolute left-5 top-0 hidden h-full w-px bg-purple-200 md:block" />

//           <div className="space-y-6">
//             {schedule.map((item) => (
//               <div
//                 key={item.id}
//                 className="relative rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-900/5 md:ml-12"
//               >
//                 <div className="absolute -left-[3.25rem] top-6 hidden h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-sm font-bold text-white md:flex">
//                   {item.id}
//                 </div>

//                 <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
//                   <div>
//                     <p className="text-xl font-extrabold text-purple-800">
//                       {item.date}
//                     </p>

//                     <h3 className="mt-1 text-2xl font-bold text-slate-950">
//                       {item.title}
//                     </h3>

//                     {item.items.length > 0 && (
//                       <ul className="mt-4 grid gap-3 sm:grid-cols-2">
//                         {item.items.map((point) => (
//                           <li
//                             key={point}
//                             className="flex gap-3 rounded-2xl bg-purple-50 px-4 py-3 text-slate-700"
//                           >
//                             <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-700" />
//                             <span className="font-medium">{point}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </div>

//                   <span className="w-fit rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-800">
//                     Schedule
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* DELIVERABLES + PAYMENT */}
//       <section className="bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 py-16">
//         <div className="mx-auto max-w-7xl px-5 md:px-10">
//           <div className="grid gap-8 lg:grid-cols-2">
//             <div className="rounded-[2rem] border border-purple-100 bg-white p-8 shadow-xl shadow-purple-900/5">
//               <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
//                 Deliverables
//               </p>
//               <h2 className="mt-3 text-3xl font-extrabold text-slate-950">
//                 What each student receives
//               </h2>

//               <ul className="mt-8 space-y-4">
//                 {deliverables.map((item) => (
//                   <li key={item} className="flex gap-3 text-slate-700">
//                     <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-700 text-xs text-white">
//                       ✓
//                     </span>
//                     <span>{item}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-purple-900/20">
//               <p className="font-bold uppercase tracking-[0.25em] text-fuchsia-300">
//                 Enrollment Details
//               </p>
//               <h2 className="mt-3 text-3xl font-extrabold">
//                 Secure your seat for the Splunk Orientation
//               </h2>

//               <div className="mt-8 grid gap-4">
//                 <div className="rounded-2xl bg-white/10 p-5">
//                   <p className="text-sm text-slate-300">Course Tuition Fee</p>
//                   <p className="mt-1 text-4xl font-extrabold">$3,500</p>
//                 </div>

//                 <div className="rounded-2xl bg-white/10 p-5">
//                   <p className="text-sm text-slate-300">Payment Option</p>
//                   <p className="mt-1 text-xl font-bold">Zelle</p>
//                   <p className="mt-1 break-all text-slate-200">
//                     t.oanalyticsllc@gmail.com
//                   </p>
//                 </div>

//                 <div className="rounded-2xl bg-white/10 p-5">
//                   <p className="text-sm text-slate-300">Website</p>
//                   <a
//                     href="https://www.to-analytics.com"
//                     target="_blank"
//                     rel="noreferrer"
//                     className="mt-1 block break-all text-xl font-bold text-fuchsia-200 underline"
//                   >
//                     https://www.to-analytics.com
//                   </a>
//                 </div>
//               </div>

//               <div className="mt-8 flex flex-col gap-4 sm:flex-row">
//                 <a
//                   href="mailto:t.oanalyticsllc@gmail.com"
//                   className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-purple-900"
//                 >
//                   Email for Enrollment
//                 </a>

//                 <Link
//                   to="/contact"
//                   className="rounded-2xl border border-white/20 px-6 py-4 text-center font-bold text-white hover:bg-white/10"
//                 >
//                   Contact Page
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section className="mx-auto max-w-7xl px-5 py-16 md:px-10">
//         <div className="mb-10 text-center">
//           <p className="font-bold uppercase tracking-[0.25em] text-purple-700">
//             Quick Questions
//           </p>
//           <h2 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
//             Orientation FAQ
//           </h2>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//           <div className="rounded-3xl border border-slate-200 p-6">
//             <h3 className="text-xl font-bold text-slate-950">
//               Who is this orientation for?
//             </h3>
//             <p className="mt-3 text-slate-600">
//               It is for beginners, IT professionals, security learners, data
//               analysts, and anyone who wants to understand Splunk and prepare
//               for certification.
//             </p>
//           </div>

//           <div className="rounded-3xl border border-slate-200 p-6">
//             <h3 className="text-xl font-bold text-slate-950">
//               Is there a certification path?
//             </h3>
//             {/* <p className="mt-3 text-slate-600">
//               Yes. The program focuses on the Splunk Core Power User
//               Certification Exam and the Splunk Enterprise Certified Admin Exam.
//             </p> */}
//             <p className="mt-3 text-slate-600">
//               Yes. The program focuses on the Splunk Core Power User
//               Certification Exam and the Splunk Enterprise Certified Admin Exam.
//             </p>
//           </div>

//           <div className="rounded-3xl border border-slate-200 p-6">
//             <h3 className="text-xl font-bold text-slate-950">
//               Will students do practical work?
//             </h3>
//             {/* <p className="mt-3 text-slate-600"> */}
//             <p className="mt-3 text-slate-600">
//               Yes . Students will receive weekly assignments and complete a
//               final project that includes building and configuring a distributed
//               Splunk deployment, setting up forwarding and data onboarding, and
//               creating dashboards and alerts.
//             </p>
//             {/* </p> */}
//           </div>

//           <div className="rounded-3xl border border-slate-200 p-6">
//             <h3 className="text-xl font-bold text-slate-950">
//               How do students enroll?
//             </h3>
//             <p className="mt-3 text-slate-600">
//               Students can register through the website or contact T.O Analytics
//               LLC directly using the enrollment email.
//             </p>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
