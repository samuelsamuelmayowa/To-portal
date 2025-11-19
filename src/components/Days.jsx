
import { useState } from "react";
import dayjs from "dayjs";
import DashboardDropdown from "./Dropdown";

const ClassCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // ✅ Only Saturdays are normally class days
  const classDays = [6];

  // ❌ Specific "No Class" dates (YYYY-MM-DD)
  const noClassDates = [
    "2025-10-18",
    "2025-11-29",
    "2025-12-27",
    "2026-01-03",
  ];

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) =>
    startOfMonth.add(i, "day")
  );

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const isNoClassDate = (day) => {
    const dateString = day.format("YYYY-MM-DD");
    return noClassDates.includes(dateString);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-700">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2 mt-2">
        {Array.from({ length: startOfMonth.day() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {monthDays.map((day) => {
          const isSaturday = classDays.includes(day.day());
          const isHoliday = isNoClassDate(day);

          // Decide color
          const isClassDay = isSaturday && !isHoliday;

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`p-3 rounded-xl text-center text-sm font-semibold ${
                isClassDay
                  ? "bg-green-500 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {day.date()}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div> Class Day
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div> No Class
        </div>
      </div>
    </div>
  );
};

export default ClassCalendar;

// import { useState } from "react";
// import dayjs from "dayjs";

// const ClassCalendar = () => {
//   const [currentMonth, setCurrentMonth] = useState(dayjs());

//   // 6 = Saturday
//   const classDays = [6];

//   const startOfMonth = currentMonth.startOf("month");
//   const daysInMonth = currentMonth.daysInMonth();
//   const monthDays = Array.from({ length: daysInMonth }, (_, i) =>
//     startOfMonth.add(i, "day")
//   );

//   const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
//   const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

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

//       {/* Weekday Labels */}
//       <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//           <div key={d}>{d}</div>
//         ))}
//       </div>

//       {/* Days */}
//       <div className="grid grid-cols-7 gap-2 mt-2">
//         {Array.from({ length: startOfMonth.day() }).map((_, i) => (
//           <div key={`empty-${i}`} />
//         ))}

//         {monthDays.map((day) => {
//           const isClassDay = classDays.includes(day.day());
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
