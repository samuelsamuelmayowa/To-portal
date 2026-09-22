import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const stockLinks = [
  { label: "Stock Dashboard", to: "/dashboard/stock" },
  { label: "Stock Quiz", to: "/dashboard/stock-quiz" },
//   { label: "Assignments", to: "/dashboard/stock/assignments" },
//   { label: "Trading Lab", to: "/dashboard/stock/lab" },
//   { label: "Portfolio Tracker", to: "/dashboard/stock/portfolio" },
//   { label: "My Progress", to: "/dashboard/stock/progress" },
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

    document.addEventListener("mousedown", closeWhenClickingOutside);

    return () => {
      document.removeEventListener("mousedown", closeWhenClickingOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-PURPLE px-4 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-BLUE hover:shadow-lg"
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
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          {stockLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-gray-800 transition-all duration-200 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
                  isActive ? "bg-gray-100 font-bold dark:bg-gray-700" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockDashboardDropdown;
