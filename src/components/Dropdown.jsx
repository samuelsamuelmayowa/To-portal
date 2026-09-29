import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

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
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-PURPLE px-4 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-BLUE hover:shadow-lg sm:w-auto"
      >
        Dashboard Actions
        <ChevronDown
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          size={18}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div role="menu" className="absolute left-0 right-0 z-50 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:left-auto sm:right-0 sm:w-60">
          <NavLink
            to="/dashboard/materials"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard/takequiz"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Take Splunk Quiz
          </NavLink>

 <NavLink
            to="/dashboard/lab"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Splunk Lab --Beta Mode
          </NavLink>
          <NavLink
            to="/dashboard/map"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Splunk RoadMap
          </NavLink>

          <NavLink
            to="/dashboard/classmaterials"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Assignment
          </NavLink>

          <NavLink
            to="/dashboard/check"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            Calendar
          </NavLink>

          <NavLink
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
            to="/dashboard/result"
          >
            My Result
          </NavLink>

          <NavLink
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
            to="/dashboard/commands"
          >
            Splunk commands
          </NavLink>

          <NavLink
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
            to="/dashboard/dictionary"
          >
            Splunk Dictionary
          </NavLink>

          {/* 🔗 Syllabus PDF Link */}
        </div>
      )}
    </div>
  );
};

export default DashboardDropdown;
{
  /* <a
            href="https://drive.google.com/file/d/1GpYjrvq2KSl3CBbTfYbv0Fu9Kn7Djrgz/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            See Splunk Syllabus
          </a> */
}
// import { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { ChevronDown } from "lucide-react";

// const DashboardDropdown = () => {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="relative inline-block text-left">
//       {/* Dropdown Button */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="inline-flex items-center justify-center gap-2 bg-PURPLE hover:bg-BLUE text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
//       >
//         Dashboard Actions
//         <ChevronDown
//           className={`transition-transform duration-300 ${
//             open ? "rotate-180" : "rotate-0"
//           }`}
//           size={18}
//         />
//       </button>

//       {/* Dropdown Menu */}
//       {open && (
//         <div className="absolute mt-3 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
//           <NavLink
//             to="/dashboard/takequiz"
//             className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
//             onClick={() => setOpen(false)}
//           >
//             Take Splunk Quiz
//           </NavLink>

//           <NavLink
//             to="/dashboard/classmaterials"
//             className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
//             onClick={() => setOpen(false)}
//           >
//             Assignment
//           </NavLink>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashboardDropdown;
