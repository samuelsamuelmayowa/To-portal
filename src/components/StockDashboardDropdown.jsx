import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const stockLinks = [
  { label: "Learning Portal", to: "/dashboard/stockportal" },

  { label: "Live Stock Feed", to: "/dashboard/stockside" },
  { label: "Stock Quiz", to: "/dashboard/stock-quiz" },
  { label: "Trading Simulator", to: "/trading-simulator" },
];

const StockDashboardDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const closeWhenClickingOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeWhenClickingOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeWhenClickingOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full text-left sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="stock-dashboard-menu"
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-PURPLE px-4 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-BLUE hover:shadow-lg sm:w-auto"
      >
        Stock Dashboard Actions
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {open && (
        <nav
          id="stock-dashboard-menu"
          aria-label="Stock and options dashboard pages"
          className="absolute left-0 right-0 z-50 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:left-auto sm:right-0 sm:w-60"
        >
          {stockLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard/stockportal"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block border-l-2 px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-BLUE focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-700 ${
                  isActive ? "border-BLUE bg-blue-50 font-extrabold text-BLUE dark:bg-gray-700" : "border-transparent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};

export default StockDashboardDropdown;



  // { label: "Market Overview", to: "/dashboard/stockmarkert" },
  // { label: "Stock Dashboard", to: "/dashboard/stock" },
  // { label: "Market Snapshot", to: "/dashboard/overview" },