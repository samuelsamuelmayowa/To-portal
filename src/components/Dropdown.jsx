import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const dashboardLinks = [
  { label: "Learning Portal", to: "/dashboard/materials", end: true },
  { label: "Take Splunk Quiz", to: "/dashboard/takequiz" },
  { label: "Splunk Lab", to: "/dashboard/lab" },
  { label: "Career Roadmap", to: "/dashboard/map" },
  { label: "Class Materials", to: "/dashboard/classmaterials" },
  { label: "Class Calendar", to: "/dashboard/check" },
  { label: "Quiz Results", to: "/dashboard/result" },
  { label: "Splunk Commands", to: "/dashboard/commands" },
  { label: "Splunk Dictionary", to: "/dashboard/dictionary" },
];

const DashboardDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const closeWhenOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full text-left sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="splunk-dashboard-menu"
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-PURPLE px-4 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-BLUE hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:w-auto"
      >
        Dashboard Actions
        <ChevronDown size={18} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <nav
          id="splunk-dashboard-menu"
          aria-label="Splunk dashboard pages"
          className="absolute left-0 right-0 z-50 mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:left-auto sm:right-0 sm:w-64"
        >
          {dashboardLinks.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block border-l-2 px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-gray-700 ${
                  isActive
                    ? "border-BLUE bg-blue-50 font-extrabold text-BLUE dark:bg-gray-700"
                    : "border-transparent text-gray-700 dark:text-gray-200"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};

export default DashboardDropdown;
