import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock3, BookOpen,
  ArrowUpRight, CalendarCheck, Info,
  Bell, Server, RotateCcw, ExternalLink,
} from "lucide-react";

/**
 * T.O. Analytics 2026–2027 course calendar.
 * Source: TO_Analytics_Splunk_Calendar_2026_2027.pdf (6 pages).
 * Times are Eastern (America/New_York). No end times are given for
 * regular classes; orientation alone is confirmed as 8–10 AM.
 * Suggested check-ins are NOT booked meetings.
 */
const FIRST_MONTH = "2026-10";
const LAST_MONTH = "2027-03";
const SERVER_URL = "https://a.co/d/0dqtgNco";
const STUDY_URL = "https://www.to-analytics.com";

export const OFFICIAL_EVENTS = [
  {
    id: "orientation", date: "2026-10-31", title: "Program Orientation",
    short: "Orientation", type: "class", time: "8:00–10:00 AM",
    description: "Orientation for the 2026–2027 Splunk cohort. Certification preparation begins now.",
  },
  {
    id: "power-user", date: "2026-11-28", title: "Power User Certification Deadline",
    short: "Power User deadline", type: "deadline",
    description: "Complete the Power User certification by this deadline. Schedule your actual exam separately.",
  },
  {
    id: "admin-cert", date: "2026-12-19", title: "Enterprise Admin Certification Deadline",
    short: "Admin deadline", type: "deadline",
    description: "Enterprise Admin certification deadline. Power User comes first. Book your actual exam separately.",
  },
  {
    id: "lab-ready", date: "2027-01-08", title: "Lab Readiness Check",
    short: "Lab readiness", type: "reminder", suggested: true,
    description: "Suggested reminder: purchase and prepare a server for your January 9 class.",
    link: SERVER_URL,
  },
  {
    id: "class-01", date: "2027-01-09", title: "01 Proxmox + VMs",
    short: "01 Proxmox + VMs", type: "class", time: "8:00 AM",
    description: "Your first practical lab class: Proxmox and virtual machines.",
  },
  {
    id: "class-02", date: "2027-01-16", title: "02 Splunk Architecture",
    short: "02 Architecture", type: "class", time: "8:00 AM",
    description: "Splunk architecture and how the platform's components fit together.",
  },
  {
    id: "class-03", date: "2027-01-23", title: "03 Data Onboarding",
    short: "03 Data onboarding", type: "class", time: "8:00 AM",
    description: "Onboard data into your Splunk environment.",
  },
  {
    id: "class-04", date: "2027-01-30", title: "04 SPL + Fields",
    short: "04 SPL + fields", type: "class", time: "8:00 AM",
    description: "Work with Splunk Search Processing Language and fields.",
  },
  {
    id: "class-05", date: "2027-02-06", title: "05 Dashboard Studio",
    short: "05 Dashboard Studio", type: "class", time: "8:00 AM",
    description: "Create and explore dashboards using Splunk Dashboard Studio.",
  },
  {
    id: "class-06", date: "2027-02-13", title: "06 Alerts + CIM",
    short: "06 Alerts + CIM", type: "class", time: "8:00 AM",
    description: "Study alerts and Splunk's Common Information Model (CIM).",
  },
  {
    id: "class-07", date: "2027-02-20", title: "07 Admin + Automation",
    short: "07 Admin + automation", type: "class", time: "8:00 AM",
    description: "Splunk administration and automation.",
  },
  {
    id: "class-08", date: "2027-02-27", title: "08 Health + Recovery",
    short: "08 Health + recovery", type: "class", time: "8:00 AM",
    description: "Monitor health and plan recovery for Splunk deployments.",
  },
  {
    id: "class-09", date: "2027-03-06", title: "09 Modern Splunk",
    short: "09 Modern Splunk", type: "class", time: "8:00 AM",
    description: "Modern Splunk capabilities and workflows.",
  },
  {
    id: "class-10", date: "2027-03-13", title: "10 Capstone Demonstration",
    short: "10 CAPSTONE", type: "class", time: "8:00 AM",
    description: "Final class: demonstrate your working deployment, dashboards, alerts, and troubleshooting evidence.",
  },
];

const checkInDates = [
  "2026-10-31", "2026-11-07", "2026-11-14", "2026-11-21",
  "2026-11-28", "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26",
];

const checkInEvents = checkInDates.map((date) => ({
  id: `checkin-${date}`, date, title: "Weekly Instructor Check-In",
  short: "Weekly check-in", type: "checkin", suggested: true,
  description: "Suggested Saturday reminder to reach out with questions and progress. This is not a booked meeting.",
}));

export const SCHEDULE_EVENTS = [...OFFICIAL_EVENTS, ...checkInEvents].sort(
  (a, b) => a.date.localeCompare(b.date) || (a.type === "checkin" ? 1 : -1)
);

const eventsByDate = SCHEDULE_EVENTS.reduce((map, event) => {
  if (!map[event.date]) map[event.date] = [];
  map[event.date].push(event);
  return map;
}, {});

const MONTH_NOTES = {
  "2026-10": "Orientation is October 31, 8:00–10:00 AM Eastern. Begin certification preparation and reach out weekly.",
  "2026-11": "Power User certification deadline: November 28. Schedule your actual exam separately; continue suggested weekly check-ins.",
  "2026-12": "Enterprise Admin certification deadline: December 19. Power User comes first. Continue lab-readiness follow-up.",
  "2027-01": "Every student must purchase a server and prepare for January 9. January 8 is a suggested readiness check.",
  "2027-02": "Complete weekly labs; keep your searches, configurations, and runbook up to date.",
  "2027-03": "March 13 is the final class and capstone. Present deployment, dashboards, alerts, and troubleshooting evidence.",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TYPE_STYLES = {
  class: {
    card: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800/60 dark:bg-violet-900/30 dark:text-violet-200",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200",
    dot: "bg-violet-600",
    label: "Class / orientation",
  },
  deadline: {
    card: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-800/60 dark:bg-fuchsia-900/25 dark:text-fuchsia-200",
    badge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/60 dark:text-fuchsia-200",
    dot: "bg-fuchsia-500",
    label: "Certification deadline",
  },
  reminder: {
    card: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-200",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    dot: "bg-amber-500",
    label: "Readiness reminder",
  },
  checkin: {
    card: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
    dot: "bg-slate-400",
    label: "Suggested check-in",
  },
};

// Use the program's Eastern date rather than the viewer's device date.
export function getEasternToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function clampMonth(month) {
  const key = month.format("YYYY-MM");
  if (key < FIRST_MONTH) return dayjs(`${FIRST_MONTH}-01`);
  if (key > LAST_MONTH) return dayjs(`${LAST_MONTH}-01`);
  return month.startOf("month");
}

const formatDate = (date) => dayjs(date).format("dddd, MMMM D, YYYY");

export default function ClassCalendar() {
  const [today, setToday] = useState(getEasternToday);
  const [currentMonth, setCurrentMonth] = useState(() => clampMonth(dayjs(getEasternToday())));
  const [selectedDate, setSelectedDate] = useState(() => {
    const key = getEasternToday();
    return key >= `${FIRST_MONTH}-01` && key <= `${LAST_MONTH}-31` ? key : "2026-10-31";
  });
  const [showCheckIns, setShowCheckIns] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const timer = window.setInterval(() => setToday(getEasternToday()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const displayedEvents = useMemo(() => (
    showCheckIns ? SCHEDULE_EVENTS : SCHEDULE_EVENTS.filter((event) => event.type !== "checkin")
  ), [showCheckIns]);

  const eventsInMonth = useMemo(() => displayedEvents.filter(
    (event) => event.date.startsWith(currentMonth.format("YYYY-MM")) &&
      (filter === "all" || event.type === filter)
  ), [currentMonth, displayedEvents, filter]);

  const classCount = displayedEvents.filter(
    (event) => event.date.startsWith(currentMonth.format("YYYY-MM")) &&
      event.type === "class" && event.id !== "orientation"
  ).length;
  const monthlyTotal = displayedEvents.filter(
    (event) => event.date.startsWith(currentMonth.format("YYYY-MM"))
  ).length;
  const selectedEvents = (eventsByDate[selectedDate] || []).filter(
    (event) => showCheckIns || event.type !== "checkin"
  );
  const nextEvent = OFFICIAL_EVENTS.find(
    (event) => event.date >= today && !event.suggested
  );

  const start = currentMonth.startOf("month");
  const calendarStart = start.subtract(start.day(), "day");
  const days = Array.from({ length: Math.ceil((start.day() + currentMonth.daysInMonth()) / 7) * 7 },
    (_, index) => calendarStart.add(index, "day"));

  const setMonth = (next) => {
    const clamped = clampMonth(next);
    setCurrentMonth(clamped);
    setSelectedDate(clamped.format("YYYY-MM-01"));
  };
  const jumpTo = (date) => {
    setSelectedDate(date);
    setCurrentMonth(clampMonth(dayjs(date)));
  };
  const reset = () => {
    const availableToday = today >= `${FIRST_MONTH}-01` && today <= `${LAST_MONTH}-31`;
    jumpTo(availableToday ? today : (nextEvent?.date || "2026-10-31"));
  };

  return (
    <div className="w-full min-w-0 text-slate-900 dark:text-white">
      {/* Header and navigation */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <CalendarDays size={20} className="text-violet-600 dark:text-violet-400" />
            <h3 className="text-xl font-bold tracking-tight">{currentMonth.format("MMMM YYYY")}</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select any date to view classes, deadlines, and reminders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300">
            <RotateCcw size={13} /> Today
          </button>
          <button type="button" aria-label="Previous month"
            disabled={currentMonth.format("YYYY-MM") <= FIRST_MONTH}
            onClick={() => setMonth(currentMonth.subtract(1, "month"))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800">
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Next month"
            disabled={currentMonth.format("YYYY-MM") >= LAST_MONTH}
            onClick={() => setMonth(currentMonth.add(1, "month"))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Monthly statistics */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 dark:border-violet-900/40 dark:bg-violet-900/20">
          <div className="mb-2 flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <BookOpen size={16} /><span className="text-xs font-semibold">Practical Classes</span>
          </div>
          <p className="text-2xl font-bold text-violet-900 dark:text-white">{classCount}</p>
          <p className="mt-1 text-[11px] text-violet-600 dark:text-violet-300">This month · orientation excluded</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <CalendarCheck size={16} /><span className="text-xs font-semibold">Calendar Events</span>
          </div>
          <p className="text-2xl font-bold">{monthlyTotal}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Including {showCheckIns ? "suggested check-ins" : "official deadlines"}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" aria-label="Filter monthly events">
          {[
            ["all", "All"], ["class", "Classes"], ["deadline", "Deadlines"],
            ["reminder", "Readiness"], ["checkin", "Check-ins"],
          ].map(([key, label]) => (
            <button key={key} type="button" onClick={() => { setFilter(key); if (key === "checkin") setShowCheckIns(true); }}
              aria-pressed={filter === key}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${filter === key
                ? "bg-violet-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <input type="checkbox" checked={showCheckIns} onChange={(e) => setShowCheckIns(e.target.checked)}
            className="accent-violet-700" /> Show suggested check-ins
        </label>
      </div>

      {/* Interactive 7-column calendar */}
      <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((name) => <div key={name}
          className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:text-xs">{name}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date) => {
          const key = date.format("YYYY-MM-DD");
          const inMonth = date.isSame(currentMonth, "month");
          const dayEvents = (eventsByDate[key] || []).filter((item) => showCheckIns || item.type !== "checkin");
          const primary = dayEvents.find((event) => event.type !== "checkin") || dayEvents[0];
          const isSelected = selectedDate === key;
          const isToday = today === key;
          const category = primary ? TYPE_STYLES[primary.type] : null;
          const style = isSelected
            ? "border-violet-700 bg-violet-700 text-white shadow-sm dark:border-violet-500 dark:bg-violet-700"
            : !inMonth
              ? "border-transparent bg-slate-50/50 text-slate-300 dark:bg-slate-900/30 dark:text-slate-600"
              : category
                ? `${category.card} hover:brightness-95`
                : "border-slate-100 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800";
          return (
            <button key={key} type="button" onClick={() => jumpTo(key)}
              aria-label={`${formatDate(key)}${dayEvents.length ? `, ${dayEvents.map((e) => e.title).join(", ")}` : ", no scheduled events"}`}
              aria-pressed={isSelected}
              className={`relative flex h-[70px] min-w-0 flex-col items-center rounded-xl border pt-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:h-[96px] sm:pt-3 ${style} ${isToday && !isSelected ? "ring-2 ring-inset ring-violet-400" : ""}`}>
              <span className="text-xs font-bold sm:text-sm">{date.date()}</span>
              {inMonth && dayEvents.length > 0 && <>
                <div className="mt-2 flex flex-wrap justify-center gap-1 px-1">
                  {dayEvents.map((event) => <span key={event.id}
                    className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : TYPE_STYLES[event.type].dot}`} />)}
                </div>
                <span className={`mt-1 hidden max-w-full truncate px-1 text-center text-[9px] font-semibold sm:block ${isSelected ? "text-white" : ""}`}>
                  {primary.short}
                </span>
              </>}
              {isToday && <span className={`absolute bottom-1 text-[8px] font-bold ${isSelected ? "text-white" : "text-violet-600 dark:text-violet-300"}`}>TODAY</span>}
            </button>
          );
        })}
      </div>

      {/* Category legend and timezone */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 pb-5 dark:border-slate-800">
        {Object.entries(TYPE_STYLES).map(([key, item]) => <span key={key}
          className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
          <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} /> {item.label}
        </span>)}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Clock3 size={14} className="text-violet-500" /> All class times are Eastern (America/New_York).
      </div>

      {/* Selected-day detail cards; a date can contain several events */}
      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Clock3 size={17} className="text-violet-600 dark:text-violet-400" />
          <h3 className="text-sm font-bold">Selected Day</h3>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white text-center dark:border-slate-700 dark:bg-slate-900 sm:w-16">
              <div className="bg-violet-700 py-1 text-[10px] font-bold text-white">{dayjs(selectedDate).format("MMM").toUpperCase()}</div>
              <div className="py-2 text-xl font-bold">{dayjs(selectedDate).format("DD")}</div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-3 text-xs font-semibold text-violet-700 dark:text-violet-300">{formatDate(selectedDate)}</p>
              {selectedEvents.length ? <div className="space-y-4">
                {selectedEvents.map((event) => <div key={event.id}
                  className="border-b border-slate-200 pb-3 last:border-0 last:pb-0 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${TYPE_STYLES[event.type].badge}`}>{TYPE_STYLES[event.type].label}</span>
                    {event.suggested && <span className="text-[10px] text-slate-500 dark:text-slate-400">Suggested only</span>}
                  </div>
                  <h4 className="mt-2 text-sm font-bold sm:text-base">{event.title}</h4>
                  {event.time && <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    <Clock3 size={12} /> {event.time} Eastern{event.id !== "orientation" ? " (end time not specified)" : ""}
                  </p>}
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{event.description}</p>
                  {event.link && <a href={event.link} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300">
                    View recommended server <ExternalLink size={13} />
                  </a>}
                </div>)}
              </div> : <>
                <h4 className="text-sm font-bold">No Scheduled Events</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">No classes, deadlines, or visible reminders for this date.</p>
              </>}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly agenda */}
      <section className="mt-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={17} className="text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-bold">Monthly Schedule</h3>
          </div>
          <span className="text-xs text-slate-400">{eventsInMonth.length} event{eventsInMonth.length === 1 ? "" : "s"}</span>
        </div>
        {eventsInMonth.length ? <div className="space-y-2">
          {eventsInMonth.map((event) => <button key={event.id} type="button"
            onClick={() => jumpTo(event.date)}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-800 dark:hover:bg-violet-900/10">
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-900/25 dark:text-violet-300">
              <span className="text-[9px] font-bold uppercase">{dayjs(event.date).format("MMM")}</span>
              <span className="text-base font-bold">{dayjs(event.date).format("DD")}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold sm:text-sm">{event.title}</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {dayjs(event.date).format("dddd")} · {event.time ? `${event.time} ET · ` : ""}{TYPE_STYLES[event.type].label}
              </p>
            </div>
            {event.date < today ? <span className="shrink-0 text-[10px] font-semibold text-slate-400">Passed</span>
              : <ArrowUpRight size={17} className="shrink-0 text-violet-500" />}
          </button>)}
        </div> : <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
          <CalendarDays size={25} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No events in this category</p>
          <p className="mt-1 text-xs text-slate-400">Try another filter or month.</p>
        </div>}
      </section>

      {/* Coming up */}
      {nextEvent && <section className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 p-4 text-white sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-violet-200">Next Official Event</p>
            <h4 className="text-sm font-bold sm:text-base">{nextEvent.title}</h4>
            <p className="mt-2 flex items-center gap-2 text-xs text-violet-100"><Clock3 size={13} />
              {formatDate(nextEvent.date)}{nextEvent.time ? ` · ${nextEvent.time} Eastern` : ""}
            </p>
          </div>
          <button type="button" onClick={() => jumpTo(nextEvent.date)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/20 px-4 py-2.5 text-xs font-semibold transition hover:bg-white/30">
            View Date <ArrowUpRight size={14} />
          </button>
        </div>
      </section>}

      {/* PDF's month-specific notes */}
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
        <Info size={17} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400" />
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentMonth.format("MMMM")} Program Notes</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {MONTH_NOTES[currentMonth.format("YYYY-MM")]}
          </p>
          {currentMonth.format("YYYY-MM") === "2027-01" && <a
            href={SERVER_URL} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300">
            <Server size={13} /> Recommended server <ExternalLink size={12} />
          </a>}
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        <Bell size={12} className="mr-1 inline-block align-[-2px]" />
        Weekly check-ins are suggested reach-out reminders, not booked meetings. Certification deadlines are not exam appointments.
        Visit <a href={STUDY_URL} target="_blank" rel="noopener noreferrer" className="underline">T.O. Analytics</a> for the study hub.
      </p>
    </div>
  );
}
