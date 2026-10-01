import { LineChart, GraduationCap } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const splunkPages = [
  { label: "My Courses", to: "/dashboard/myCourses" },
  { label: "Dashboard Home", to: "/dashboard", end: true },
  { label: "Learning Portal", to: "/dashboard/materials", end: true },
  { label: "Classes & Docs", to: "/dashboard/classmaterials" },
  { label: "Calendar", to: "/dashboard/check" },
  { label: "Quiz Center", to: "/dashboard/takequiz" },
  { label: "Splunk Quiz", to: "/dashboard/quiz" },
  { label: "Results", to: "/dashboard/result" },
  { label: "Splunk Lab", to: "/dashboard/lab" },
  { label: "Career Roadmap", to: "/dashboard/map" },
  { label: "Commands", to: "/dashboard/commands" },
  { label: "Dictionary", to: "/dashboard/dictionary" },
];

const stockPages = [
  { label: "Learning Portal", to: "/dashboard/stockportal", end: true },
  { label: "Market Overview", to: "/dashboard/stockmarkert" },
  { label: "Stock Dashboard", to: "/dashboard/stock" },
  { label: "Market Snapshot", to: "/dashboard/overview" },
  { label: "Live Stock Feed", to: "/dashboard/stockside" },
  { label: "Stock Quiz", to: "/dashboard/stock-quiz" },
  { label: "Trading Simulator", to: "/trading-simulator" },
];

export default function DashboardSectionNav() {
  const { pathname } = useLocation();
  const isStock =
    pathname.startsWith("/dashboard/stock") || pathname === "/dashboard/overview";
  const isSplunk = [
    "/dashboard",
    "/dashboard/myCourses",
    "/dashboard/materials",
    "/dashboard/classmaterials",
    "/dashboard/check",
    "/dashboard/takequiz",
    "/dashboard/quiz",
    "/dashboard/result",
    "/dashboard/lab",
    "/dashboard/map",
    "/dashboard/commands",
    "/dashboard/dictionary",
  ].includes(pathname);
  if (!isStock && !isSplunk) return null;

  const pages = isStock ? stockPages : splunkPages;
  const SectionIcon = isStock ? LineChart : GraduationCap;
  const sectionName = isStock ? "Stocks & Options" : "Splunk Bootcamp";

  return (
    <div className="dashboard-section-nav-wrap mx-auto mb-5 w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
      <nav
        aria-label={`${sectionName} dashboard navigation`}
        className="min-w-0 rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:p-4"
      >
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:gap-5">
          <div className="flex shrink-0 items-center gap-3 px-1">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 text-white shadow-md shadow-blue-900/15">
              <SectionIcon size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Student workspace
              </p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {sectionName}
              </p>
            </div>
          </div>

          <div className="dashboard-section-nav-links flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 xl:pb-0">
            {pages.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                    `inline-flex min-h-10 shrink-0 whitespace-nowrap items-center rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-sm ${
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-800 shadow-sm dark:border-blue-900 dark:bg-blue-950/70 dark:text-blue-200"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
