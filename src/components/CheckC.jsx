
import { useEffect, useState } from "react";
import {
  CalendarDays,
  BookOpen,
  GraduationCap,
  Clock3,
  Moon,
  Sun,
  ArrowUpRight,
  CheckCircle2,
  BriefcaseBusiness,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ClassCalendar from "./Days";

// T.O. Analytics 2026–2027 learning schedule
const milestones = [
  {
    id: "orientation",
    title: "Program Orientation",
    date: "October 31, 2026",
    start: "2026-10-31",
    end: "2026-10-31",
    description: "Introduction to the learning journey",
    icon: CalendarDays,
  },
  {
    id: "foundations",
    title: "Splunk Foundations",
    date: "Nov 14 – Dec 19, 2026",
    start: "2026-11-14",
    end: "2026-12-19",
    description: "Beginner training and core concepts",
    icon: BookOpen,
  },
  {
    id: "poweruser",
    title: "Power User Certification",
    date: "After the first 2-week break",
    description: "Certification examination",
    icon: ShieldCheck,
  },
  {
    id: "backend",
    title: "Splunk Backend Administration",
    date: "Jan 9 – Feb 27, 2027",
    start: "2027-01-09",
    end: "2027-02-27",
    description: "Advanced administration training",
    icon: BookOpen,
  },
  {
    id: "admin-exam",
    title: "Enterprise Admin Certification",
    date: "After the second 2-week break",
    description: "Certification examination",
    icon: GraduationCap,
  },
  {
    id: "interview",
    title: "Interview Preparation",
    date: "March 13, 2027",
    start: "2027-03-13",
    end: "2027-03-13",
    description: "Career preparation and interview practice",
    icon: BriefcaseBusiness,
  },
];

function getMilestoneStatus(item) {
  if (!item.start) return "Date TBA";

  const now = new Date();
  const start = new Date(`${item.start}T00:00:00`);
  const end = new Date(`${item.end || item.start}T23:59:59`);

  if (now > end) return "Date passed";
  if (now >= start) return "In progress";

  return "Upcoming";
}

function getDaysUntil(date) {
  if (!date) return null;

  const now = new Date();
  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const [year, month, day] = date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);

  return Math.round((target - today) / 86400000);
}

function getUserEmail() {
  const saved = localStorage.getItem("user");

  if (!saved) return "";

  try {
    const user = JSON.parse(saved);

    if (typeof user === "string") return user;
    return user?.email || "";
  } catch {
    return saved;
  }
}

export default function StudentDashboard() {
  const [userEmail, setUserEmail] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    return localStorage.getItem("scheduleTheme") === "dark";
  });

  useEffect(() => {
    setUserEmail(getUserEmail());
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "scheduleTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const now = new Date();

  const nextSession = milestones.find((item) => {
    if (!item.start) return false;

    const end = new Date(
      `${item.end || item.start}T23:59:59`
    );

    return end >= now;
  });

  const nextStatus = nextSession
    ? getMilestoneStatus(nextSession)
    : null;

  const daysUntil = nextSession
    ? getDaysUntil(nextSession.start)
    : null;

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen bg-[#f8f7fc] dark:bg-[#10111c] transition-colors duration-300">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">

          {/* PAGE HEADER */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 mb-2">
                <CalendarDays size={16} />
                <span className="text-xs font-bold tracking-[0.16em] uppercase">
                  Student Learning Portal
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Class Schedule
              </h1>

              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
                Stay organized throughout your Splunk learning journey.
              </p>
            </div>

            <div className="flex items-center gap-3">

              {userEmail && (
                <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">

                  <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">
                      Student Account
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white max-w-[190px] truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:border-violet-400 transition"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
                <span className="text-sm font-medium">
                  {darkMode ? "Light" : "Dark"}
                </span>
              </button>

            </div>
          </header>

          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6226c8] via-[#7736d7] to-[#4330a6] text-white p-6 sm:p-8 lg:p-10">

            <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute right-20 bottom-0 w-48 h-48 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              <div className="max-w-xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold mb-5">
                  <Sparkles size={14} />
                  Splunk Training Program 2026–2027
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  Your learning journey,
                  <br />
                  all in one place.
                </h2>

                <p className="text-purple-100 mt-4 text-sm sm:text-base leading-relaxed">
                  View your classes, track important milestones,
                  and prepare for upcoming certification exams
                  with T.O. Analytics.
                </p>

                <a
                  href="https://www.to-analytics.com/splunk-orientation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-xl bg-white text-violet-800 font-semibold text-sm hover:bg-purple-50 transition"
                >
                  Program Information
                  <ArrowUpRight size={16} />
                </a>

              </div>

              {/* NEXT CLASS */}
              <div className="w-full lg:w-[300px] shrink-0 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md p-5">

                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-medium text-purple-100">
                    Next Program Milestone
                  </p>
                  <Clock3 size={18} className="text-purple-100" />
                </div>

                {nextSession ? (
                  <>
                    <h3 className="text-xl font-bold leading-snug">
                      {nextSession.title}
                    </h3>

                    <p className="text-sm text-purple-100 mt-2">
                      {nextSession.date}
                    </p>

                    <div className="mt-5 pt-4 border-t border-white/20">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />

                        <span className="text-sm font-semibold">
                          {nextStatus === "In progress"
                            ? "Currently ongoing"
                            : daysUntil === 0
                            ? "Starting today"
                            : `Starts in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-purple-100">
                    All currently scheduled milestones have passed.
                  </p>
                )}

              </div>

            </div>
          </section>

          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {[
              {
                title: "Learning Modules",
                value: "02",
                subtitle: "Foundations & Administration",
                icon: BookOpen,
              },
              {
                title: "Certification Exams",
                value: "02",
                subtitle: "Power User & Enterprise Admin",
                icon: ShieldCheck,
              },
              {
                title: "Career Preparation",
                value: "01",
                subtitle: "Interview preparation stage",
                icon: BriefcaseBusiness,
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {card.title}
                      </p>

                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        {card.value}
                      </h3>
                    </div>

                    <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300">
                      <Icon size={21} />
                    </div>

                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                    {card.subtitle}
                  </p>
                </div>
              );
            })}

          </section>

          {/* CALENDAR AND ROADMAP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* MAIN CALENDAR */}
            <section className="lg:col-span-2 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

              <div className="px-5 sm:px-6 py-5 border-b border-slate-100 dark:border-slate-800">

                <div className="flex items-start sm:items-center justify-between gap-4">

                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={20}
                        className="text-violet-700 dark:text-violet-400"
                      />

                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Learning Calendar
                      </h2>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Explore your class schedule and important dates.
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full">
                    2026–2027
                  </span>

                </div>
              </div>

              <div className="p-3 sm:p-5 overflow-x-auto text-slate-900 dark:text-slate-100">
                <ClassCalendar />
              </div>

            </section>

            {/* PROGRAM ROADMAP */}
            <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

              <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">

                <div className="flex items-center gap-2">
                  <GraduationCap
                    size={21}
                    className="text-violet-700 dark:text-violet-400"
                  />

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Program Roadmap
                  </h2>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Your training and certification journey.
                </p>

              </div>

              <div className="p-5">

                <div className="relative">

                  {milestones.map((item, index) => {
                    const Icon = item.icon;
                    const status = getMilestoneStatus(item);
                    const isLast = index === milestones.length - 1;

                    return (
                      <div
                        key={item.id}
                        className="relative flex items-start gap-3 pb-6 last:pb-0"
                      >

                        {/* TIMELINE LINE */}
                        {!isLast && (
                          <div className="absolute left-[18px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                        )}

                        {/* ICON */}
                        <div className="relative z-10 shrink-0 w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300">
                          <Icon size={17} />
                        </div>

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </h3>

                            {status === "In progress" && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                Ongoing
                              </span>
                            )}

                            {status === "Date passed" && (
                              <CheckCircle2
                                size={14}
                                className="text-slate-400"
                              />
                            )}

                          </div>

                          <p className="text-xs text-violet-700 dark:text-violet-400 font-semibold mt-1">
                            {item.date}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>

                          {status === "Date TBA" && (
                            <span className="inline-block text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md mt-2">
                              Exact date to be confirmed
                            </span>
                          )}

                        </div>

                        <ChevronRight
                          size={15}
                          className="shrink-0 text-slate-300 dark:text-slate-600 mt-2"
                        />

                      </div>
                    );
                  })}

                </div>

              </div>

              <div className="mx-5 mb-5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/40 p-4">

                <p className="text-xs font-semibold text-violet-800 dark:text-violet-300">
                  Stay prepared
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Review your training schedule regularly.
                  Certification examination dates will be confirmed
                  separately.
                </p>

              </div>

            </aside>

          </div>

          {/* FOOTER */}
          <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">

            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} T.O. Analytics LLC
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={15} />
              Your learning journey starts here.
            </div>

          </footer>

        </div>
      </main>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import ClassCalendar from "./Days";



// export default function StudentDashboard() {
//    const allowedEmails = [
//     "basseyvera018@gmail.com",
//     "codeverseprogramming23@gmail.com",
//     "ooolajuyigbe@gmail.com",
//     "fadeleolutola@gmail.com",
//     "jahdek76@gmail.com",
//     "samuelsamuelmayowa@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "adenusitimi@gmail.com",
//     "Adenusi.timi@gmail.com",
//     "tomideolulana@gmail.com",
//     "yinkalola51@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "lybertyudochuu@gmail.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "randommayowa@gmail.com",
//     "dipeoluolatunji@gmail.com",
//     "lybertyudochuu@gmail.com",
//   ];
//    const [isAllowed, setIsAllowed] = useState(false);
//    const [userEmail, setUserEmail] = useState("");
//     const [darkMode, setDarkMode] = useState(false);
//     useEffect(() => {
//      document.documentElement.classList.toggle("dark", darkMode);
//    }, [darkMode]);
//     useEffect(() => {
//        const email = localStorage.getItem("user");
//        setUserEmail(email);
   
//        if (email) {
//          const normalized = email.toLowerCase();
//          const allowed = allowedEmails.map((e) => e.toLowerCase());
//          setIsAllowed(allowed.includes(normalized));
//        }
//      }, []);
//   return (
//     <div className="p-6">
//           {/* <DashboardDropdown/> */}
//             <div className="max-w-7xl mx-auto mb-10 px-4">
//                 <div className="dashboard-topbar bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">
          
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//                       {/* Quiz Results */}
//                         Class Schedule
//                     </h1>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       View all your past test performances
//                     </p>
//                   </div>
          
//                   <div className="flex items-center gap-4">
//                     <div className="text-sm text-gray-600 dark:text-gray-300">
//                       {userEmail}
//                     </div>
          
          
//                     <button
//                       onClick={() => setDarkMode(!darkMode)}
//                       className="px-3 py-1 rounded-lg text-sm 
//                       bg-gray-100 text-gray-800 
//                       dark:bg-gray-800 dark:text-white
//                       border border-gray-300 dark:border-gray-700
//                       hover:bg-gray-200 dark:hover:bg-gray-700 transition"
//                     >
//                       {darkMode ? "Light Mode" : "Dark Mode"}
//                     </button>
//                   </div>
          
//                 </div>
//               </div>
//       <h1 className="text-2xl font-bold mb-4 text-gray-800">
//         {/* Class Schedule */}
//       </h1>
//       <ClassCalendar />
//     </div>
//   );
// }
