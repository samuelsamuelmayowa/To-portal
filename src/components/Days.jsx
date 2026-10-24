
import { useState } from "react";
import dayjs from "dayjs";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  ArrowUpRight,
  CalendarCheck,
  Info,
} from "lucide-react";

// ======================================
// T.O. ANALYTICS TRAINING PROGRAM
// ======================================

// Classes happen on Saturdays within these periods.
const trainingPeriods = [
  {
    id: "foundations",
    title: "Splunk Foundations",
    start: "2026-11-14",
    end: "2026-12-19",
    description:
      "Beginner Splunk training covering searching, data analysis, SPL fundamentals, and core concepts.",
  },
  {
    id: "administration",
    title: "Splunk Backend Administration",
    start: "2027-01-09",
    end: "2027-02-27",
    description:
      "Advanced Splunk administration, configuration, management, and practical learning.",
  },
];

// Important events outside normal classes.
const specialEvents = [
  {
    date: "2026-10-31",
    title: "Program Orientation",
    type: "milestone",
    description:
      "Welcome to T.O. Analytics! Introduction to your Splunk training journey.",
  },
  {
    date: "2027-03-13",
    title: "Interview Preparation",
    type: "milestone",
    description:
      "Career preparation, interview practice, and professional development.",
  },
];

// ======================================
// BUILD THE SCHEDULE
// ======================================

function createSchedule() {
  const events = [...specialEvents];

  trainingPeriods.forEach((period) => {
    let date = dayjs(period.start);
    const endDate = dayjs(period.end);

    while (!date.isAfter(endDate, "day")) {
      // Saturday = 6
      if (date.day() === 6) {
        events.push({
          date: date.format("YYYY-MM-DD"),
          title: period.title,
          description: period.description,
          type: "class",
          periodId: period.id,
        });
      }

      date = date.add(1, "day");
    }
  });

  return events.sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

const schedule = createSchedule();

const eventsByDate = new Map(
  schedule.map((event) => [event.date, event])
);

const weekdays = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

// ======================================
// MAIN CALENDAR COMPONENT
// ======================================

export default function ClassCalendar() {
  const [currentMonth, setCurrentMonth] = useState(
    dayjs().startOf("month")
  );

  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  const today = dayjs();
  const todayString = today.format("YYYY-MM-DD");

  // ======================================
  // CALENDAR NAVIGATION
  // ======================================

  const prevMonth = () => {
    setCurrentMonth((month) =>
      month.subtract(1, "month")
    );
  };

  const nextMonth = () => {
    setCurrentMonth((month) =>
      month.add(1, "month")
    );
  };

  const goToToday = () => {
    setCurrentMonth(dayjs().startOf("month"));
    setSelectedDate(todayString);
  };

  const selectDay = (date) => {
    setSelectedDate(date.format("YYYY-MM-DD"));

    if (!date.isSame(currentMonth, "month")) {
      setCurrentMonth(date.startOf("month"));
    }
  };

  // ======================================
  // GENERATE CALENDAR GRID
  // ======================================

  const startOfMonth = currentMonth.startOf("month");

  const firstWeekday = startOfMonth.day();

  const daysInMonth = currentMonth.daysInMonth();

  const totalCells =
    Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const calendarStart = startOfMonth.subtract(
    firstWeekday,
    "day"
  );

  const calendarDays = Array.from(
    { length: totalCells },
    (_, index) => calendarStart.add(index, "day")
  );

  // ======================================
  // MONTHLY EVENTS AND NEXT SESSION
  // ======================================

  const monthKey = currentMonth.format("YYYY-MM");

  const monthlyEvents = schedule.filter((event) =>
    event.date.startsWith(monthKey)
  );

  const monthlyClasses = monthlyEvents.filter(
    (event) => event.type === "class"
  );

  const selectedEvent = eventsByDate.get(selectedDate);

  const nextEvent = schedule.find(
    (event) => event.date >= todayString
  );

  const goToNextEvent = () => {
    if (!nextEvent) return;

    selectDay(dayjs(nextEvent.date));
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="w-full min-w-0 text-slate-900 dark:text-white">

      {/* CALENDAR NAVIGATION */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays
              size={19}
              className="text-violet-600 dark:text-violet-400"
            />

            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentMonth.format("MMMM YYYY")}
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a date to view your schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 transition"
          >
            Today
          </button>

          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight size={18} />
          </button>

        </div>
      </div>

      {/* MONTHLY SUMMARY */}

      <div className="grid grid-cols-2 gap-3 mb-6">

        <div className="rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-900/20 p-4">

          <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 mb-2">
            <BookOpen size={16} />
            <span className="text-xs font-semibold">
              Class Sessions
            </span>
          </div>

          <p className="text-2xl font-bold text-violet-900 dark:text-white">
            {monthlyClasses.length}
          </p>

          <p className="text-[11px] text-violet-600 dark:text-violet-300 mt-1">
            This month
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4">

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-2">
            <CalendarCheck size={16} />
            <span className="text-xs font-semibold">
              Scheduled Events
            </span>
          </div>

          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {monthlyEvents.length}
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Classes and milestones
          </p>

        </div>

      </div>

      {/* WEEKDAY HEADERS */}

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">

        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            {weekday}
          </div>
        ))}

      </div>

      {/* CALENDAR DAYS */}

      <div className="grid grid-cols-7 gap-1 sm:gap-2">

        {calendarDays.map((day) => {
          const dateString = day.format("YYYY-MM-DD");

          const event = eventsByDate.get(dateString);

          const isCurrentMonth = day.isSame(
            currentMonth,
            "month"
          );

          const isToday = dateString === todayString;

          const isSelected = dateString === selectedDate;

          const isClass = event?.type === "class";

          const isMilestone =
            event?.type === "milestone";

          let appearance = "";

          if (isSelected) {
            appearance =
              "bg-violet-700 text-white shadow-md shadow-violet-200/50 dark:shadow-none";
          } else if (!isCurrentMonth) {
            appearance =
              "bg-slate-50/40 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600";
          } else if (isMilestone) {
            appearance =
              "bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 hover:bg-fuchsia-100 dark:bg-fuchsia-900/20 dark:text-fuchsia-200 dark:border-fuchsia-900/40";
          } else if (isClass) {
            appearance =
              "bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 dark:bg-violet-900/25 dark:text-violet-200 dark:border-violet-800/50";
          } else {
            appearance =
              "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800";
          }

          return (
            <button
              type="button"
              key={dateString}
              onClick={() => selectDay(day)}
              aria-label={`${day.format(
                "dddd, MMMM D, YYYY"
              )}${event ? `, ${event.title}` : ", no scheduled class"}`}
              aria-pressed={isSelected}
              className={`
                relative flex flex-col items-center
                justify-start pt-2 sm:pt-3
                h-[62px] sm:h-[85px]
                min-w-0 rounded-xl
                transition-all duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-violet-500
                focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-slate-900
                ${appearance}
                ${
                  isToday && !isSelected
                    ? "ring-2 ring-inset ring-violet-400"
                    : ""
                }
              `}
            >

              <span className="text-xs sm:text-sm font-bold">
                {day.date()}
              </span>

              {/* EVENT LABEL */}
              {event && isCurrentMonth && (
                <>
                  <span
                    className={`
                      w-1.5 h-1.5 rounded-full mt-1.5
                      sm:hidden
                      ${
                        isSelected
                          ? "bg-white"
                          : isMilestone
                          ? "bg-fuchsia-500"
                          : "bg-violet-600"
                      }
                    `}
                  />

                  <span
                    className={`
                      hidden sm:block
                      max-w-full px-1 mt-2
                      text-[10px] font-semibold
                      truncate
                      ${
                        isSelected
                          ? "text-white"
                          : isMilestone
                          ? "text-fuchsia-700 dark:text-fuchsia-300"
                          : "text-violet-700 dark:text-violet-300"
                      }
                    `}
                  >
                    {isClass
                      ? "Class"
                      : event.title === "Program Orientation"
                      ? "Orientation"
                      : "Career Prep"}
                  </span>
                </>
              )}

              {/* TODAY INDICATOR */}
              {isToday && (
                <span
                  className={`
                    absolute bottom-1
                    text-[8px] font-bold
                    ${
                      isSelected
                        ? "text-white"
                        : "text-violet-600 dark:text-violet-300"
                    }
                  `}
                >
                  TODAY
                </span>
              )}

            </button>
          );
        })}

      </div>

      {/* CALENDAR LEGEND */}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 pb-5 border-b border-slate-100 dark:border-slate-800">

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Class day
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Milestone
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            No class scheduled
          </span>
        </div>

      </div>

      {/* SELECTED DATE DETAILS */}

      <section className="mt-6">

        <div className="flex items-center gap-2 mb-3">
          <Clock3
            size={17}
            className="text-violet-600 dark:text-violet-400"
          />

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Selected Day
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5">

          <div className="flex items-start gap-4">

            {/* DATE CARD */}
            <div className="shrink-0 w-14 sm:w-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">

              <div className="bg-violet-700 text-white text-[10px] font-bold py-1">
                {dayjs(selectedDate).format("MMM").toUpperCase()}
              </div>

              <div className="text-xl font-bold text-slate-900 dark:text-white py-2">
                {dayjs(selectedDate).format("DD")}
              </div>

            </div>

            <div className="flex-1 min-w-0">

              {selectedEvent ? (
                <>
                  <span
                    className={`
                      inline-block text-[10px]
                      font-semibold px-2 py-1
                      rounded-full mb-2
                      ${
                        selectedEvent.type === "class"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                          : "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300"
                      }
                    `}
                  >
                    {selectedEvent.type === "class"
                      ? "Training Session"
                      : "Program Milestone"}
                  </span>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {selectedEvent.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {selectedEvent.description}
                  </p>

                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mt-3">
                    {dayjs(selectedDate).format(
                      "dddd, MMMM D, YYYY"
                    )}
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    No Class Scheduled
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    There are no classes or program
                    milestones scheduled for this date.
                  </p>

                  <p className="text-xs text-slate-400 mt-3">
                    {dayjs(selectedDate).format(
                      "dddd, MMMM D, YYYY"
                    )}
                  </p>
                </>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* MONTHLY SESSION LIST */}

      <section className="mt-7">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">
            <BookOpen
              size={17}
              className="text-violet-600 dark:text-violet-400"
            />

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Schedule
            </h3>
          </div>

          <span className="text-xs text-slate-400">
            {monthlyEvents.length} event
            {monthlyEvents.length === 1 ? "" : "s"}
          </span>

        </div>

        {monthlyEvents.length > 0 ? (
          <div className="space-y-2">

            {monthlyEvents.map((event) => {
              const eventDate = dayjs(event.date);
              const isPast =
                event.date < todayString;

              return (
                <button
                  type="button"
                  key={`${event.date}-${event.title}`}
                  onClick={() => selectDay(eventDate)}
                  className="w-full flex items-center gap-3 text-left rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition"
                >

                  <div className="shrink-0 w-11 h-11 rounded-lg bg-violet-50 dark:bg-violet-900/25 flex flex-col items-center justify-center text-violet-700 dark:text-violet-300">

                    <span className="text-[9px] font-bold uppercase">
                      {eventDate.format("MMM")}
                    </span>

                    <span className="text-base font-bold">
                      {eventDate.format("DD")}
                    </span>

                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {event.title}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {eventDate.format("dddd")}
                      {" · "}
                      {event.type === "class"
                        ? "Class Session"
                        : "Program Event"}
                    </p>

                  </div>

                  {isPast ? (
                    <CheckCircle2
                      size={17}
                      className="text-slate-400 shrink-0"
                    />
                  ) : (
                    <ArrowUpRight
                      size={17}
                      className="text-violet-500 shrink-0"
                    />
                  )}

                </button>
              );
            })}

          </div>
        ) : (
          <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">

            <CalendarDays
              size={25}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
            />

            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No scheduled classes
            </h4>

            <p className="text-xs text-slate-400 mt-1">
              No training events are currently listed
              for this month.
            </p>

          </div>
        )}

      </section>

      {/* NEXT PROGRAM EVENT */}

      {nextEvent && (
        <section className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 p-4 sm:p-5 text-white">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-violet-200 mb-2">
                Coming Up Next
              </p>

              <h4 className="text-sm sm:text-base font-bold">
                {nextEvent.title}
              </h4>

              <div className="flex items-center gap-2 mt-2 text-xs text-violet-100">
                <Clock3 size={13} />

                {dayjs(nextEvent.date).format(
                  "dddd, MMMM D, YYYY"
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goToNextEvent}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/20 px-4 py-2.5 text-xs font-semibold transition"
            >
              View Date
              <ArrowUpRight size={14} />
            </button>

          </div>

        </section>
      )}

      {/* CERTIFICATION REMINDER */}

      <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">

        <Info
          size={17}
          className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
        />

        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Certification Exam Reminder
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Power User and Splunk Enterprise Certified
            Admin examinations are planned after their
            respective training breaks. Exact examination
            dates will be confirmed by T.O. Analytics.
          </p>
        </div>

      </div>

    </div>
  );
}


// import { useState } from "react";
// import dayjs from "dayjs";

// const ClassCalendar = () => {
//   const [currentMonth, setCurrentMonth] = useState(dayjs());

//   // ✅ Only Saturdays are normally class days
//   const classDays = [6];

//   // ❌ Specific "No Class" dates (YYYY-MM-DD)
//   const noClassDates = [
//     "2025-10-18",
//     "2025-11-29",
//     "2025-12-27",
//     "2026-01-03",
//   ];

//   const startOfMonth = currentMonth.startOf("month");
//   const daysInMonth = currentMonth.daysInMonth();
//   const monthDays = Array.from({ length: daysInMonth }, (_, i) =>
//     startOfMonth.add(i, "day")
//   );

//   const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
//   const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

//   const isNoClassDate = (day) => {
//     const dateString = day.format("YYYY-MM-DD");
//     return noClassDates.includes(dateString);
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
      
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={prevMonth}
//           className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
//         >
//           ←
//         </button>
//         <h2 className="text-xl font-semibold text-gray-700">
//           {currentMonth.format("MMMM YYYY")}
//         </h2>
//         <button
//           onClick={nextMonth}
//           className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
//         >
//           →
//         </button>
//       </div>

//       {/* Weekday Headers */}
//       <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//           <div key={d}>{d}</div>
//         ))}
//       </div>

//       {/* Calendar Days */}
//       <div className="grid grid-cols-7 gap-2 mt-2">
//         {Array.from({ length: startOfMonth.day() }).map((_, i) => (
//           <div key={`empty-${i}`} />
//         ))}

//         {monthDays.map((day) => {
//           const isSaturday = classDays.includes(day.day());
//           const isHoliday = isNoClassDate(day);

//           // Decide color
//           const isClassDay = isSaturday && !isHoliday;

//           return (
//             <div
//               key={day.format("YYYY-MM-DD")}
//               className={`p-3 rounded-xl text-center text-sm font-semibold ${
//                 isClassDay
//                   ? "bg-green-500 text-white"
//                   : "bg-red-100 text-red-600"
//               }`}
//             >
//               {day.date()}
//             </div>
//           );
//         })}
//       </div>

//       {/* Legend */}
//       <div className="mt-6 flex justify-center gap-4 text-sm">
//         <div className="flex items-center gap-1">
//           <div className="w-3 h-3 bg-green-500 rounded-full"></div> Class Day
//         </div>
//         <div className="flex items-center gap-1">
//           <div className="w-3 h-3 bg-red-400 rounded-full"></div> No Class
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClassCalendar;

// // import { useState } from "react";
// // import dayjs from "dayjs";

// // const ClassCalendar = () => {
// //   const [currentMonth, setCurrentMonth] = useState(dayjs());

// //   // 6 = Saturday
// //   const classDays = [6];

// //   const startOfMonth = currentMonth.startOf("month");
// //   const daysInMonth = currentMonth.daysInMonth();
// //   const monthDays = Array.from({ length: daysInMonth }, (_, i) =>
// //     startOfMonth.add(i, "day")
// //   );

// //   const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
// //   const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

// //   return (
// //     <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
// //       {/* Header */}
// //       <div className="flex justify-between items-center mb-6">
// //         <button
// //           onClick={prevMonth}
// //           className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
// //         >
// //           ←
// //         </button>
// //         <h2 className="text-xl font-semibold text-gray-700">
// //           {currentMonth.format("MMMM YYYY")}
// //         </h2>
// //         <button
// //           onClick={nextMonth}
// //           className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
// //         >
// //           →
// //         </button>
// //       </div>

// //       {/* Weekday Labels */}
// //       <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
// //         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
// //           <div key={d}>{d}</div>
// //         ))}
// //       </div>

// //       {/* Days */}
// //       <div className="grid grid-cols-7 gap-2 mt-2">
// //         {Array.from({ length: startOfMonth.day() }).map((_, i) => (
// //           <div key={`empty-${i}`} />
// //         ))}

// //         {monthDays.map((day) => {
// //           const isClassDay = classDays.includes(day.day());
// //           return (
// //             <div
// //               key={day.format("YYYY-MM-DD")}
// //               className={`p-3 rounded-xl text-center text-sm font-semibold ${
// //                 isClassDay
// //                   ? "bg-green-500 text-white"
// //                   : "bg-red-100 text-red-600"
// //               }`}
// //             >
// //               {day.date()}
// //             </div>
// //           );
// //         })}
// //       </div>

// //       {/* Legend */}
// //       <div className="mt-6 flex justify-center gap-4 text-sm">
// //         <div className="flex items-center gap-1">
// //           <div className="w-3 h-3 bg-green-500 rounded-full"></div> Class Day
// //         </div>
// //         <div className="flex items-center gap-1">
// //           <div className="w-3 h-3 bg-red-400 rounded-full"></div> No Class
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ClassCalendar;
