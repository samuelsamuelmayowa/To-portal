import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, X } from "lucide-react";
import NavBar from "../components/NavBar";
import StudioShell from "../components/splunk/StudioShell";
import SearchLab from "../components/splunk/SearchLab";
import SavedSearches from "../components/splunk/SavedSearches";
import DashboardBuilder from "../components/splunk/DashboardBuilder";
import AlertBuilder from "../components/splunk/AlertBuilder";
import AdminLab from "../components/splunk/AdminLab";
import SplunkDictionary from "../components/Dictionary";

// Keep the existing storage keys. Users' old work is not intentionally cleared.
const LS_SAVED = "to_splunk_saved_searches";
const LS_DASH = "to_splunk_dashboards";
const LS_ALERTS = "to_splunk_alerts";
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
export default function SplunkStudio() {
  const { pathname } = useLocation();
  const showNavBar = !pathname.startsWith("/dashboard/");
  const [active, setActive] = useState("lab");
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const dictionaryButtonRef = useRef(null);
  const dictionaryDialogRef = useRef(null);
  const dictionaryCloseRef = useRef(null);
  const [saved, setSaved] = useState(() => load(LS_SAVED, []));
  const [dashboards, setDashboards] = useState(() => load(LS_DASH, []));
  const [alerts, setAlerts] = useState(() => load(LS_ALERTS, []));

  useEffect(() => { localStorage.setItem(LS_SAVED, JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem(LS_DASH, JSON.stringify(dashboards)); }, [dashboards]);
  useEffect(() => { localStorage.setItem(LS_ALERTS, JSON.stringify(alerts)); }, [alerts]);

  useEffect(() => {
    if (!dictionaryOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dictionaryCloseRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { setDictionaryOpen(false); return; }
      if (event.key !== "Tab" || !dictionaryDialogRef.current) return;
      const focusable = Array.from(dictionaryDialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      dictionaryButtonRef.current?.focus();
    };
  }, [dictionaryOpen]);

  const addSaved = ({ name, spl }) => setSaved((previous) => [
    { id: makeId(), name, spl, createdAt: Date.now() }, ...previous,
  ]);
  const deleteSaved = (id) => setSaved((previous) => previous.filter((item) => item.id !== id));
  const runSavedIntoLab = (spl) => {
    sessionStorage.setItem("to_splunk_run_once", spl);
    setActive("lab");
  };
  const addDashboard = ({ name, panels }) => setDashboards((previous) => [
    { id: makeId(), name, panels, createdAt: Date.now() }, ...previous,
  ]);
  const updateDashboard = (id, changes) => setDashboards((previous) => previous.map((item) => item.id === id ? { ...item, ...changes, updatedAt: Date.now() } : item));
  const deleteDashboard = (id) => setDashboards((previous) => previous.filter((x) => x.id !== id));
  const addAlert = (alert) => setAlerts((previous) => [
    { id: makeId(), ...alert, createdAt: Date.now() }, ...previous,
  ]);
  const updateAlert = (id, changes) => setAlerts((previous) => previous.map((item) => item.id === id ? { ...item, ...changes, updatedAt: Date.now() } : item));
  const deleteAlert = (id) => setAlerts((previous) => previous.filter((x) => x.id !== id));

  return <>
    {showNavBar && <NavBar />}
    <div className={showNavBar ? "pt-20 sm:pt-24" : undefined}>
      <StudioShell active={active} setActive={setActive}>
        {active === "lab" && <SearchLab onSaveSearch={(spl) => addSaved({ name: `Saved: ${spl.slice(0, 24)}...`, spl })} />}
        {active === "saved" && <SavedSearches saved={saved} onAdd={addSaved} onRun={runSavedIntoLab} onDelete={deleteSaved} />}
        {active === "dash" && <DashboardBuilder saved={saved} dashboards={dashboards} onAddDashboard={addDashboard} onUpdateDashboard={updateDashboard} onDeleteDashboard={deleteDashboard} />}
        {active === "alerts" && <AlertBuilder saved={saved} alerts={alerts} onAddAlert={addAlert} onUpdateAlert={updateAlert} onDeleteAlert={deleteAlert} />}
        {active === "admin" && <AdminLab onOpenLab={runSavedIntoLab} />}
      </StudioShell>
    </div>
    {!dictionaryOpen && <button ref={dictionaryButtonRef} type="button" onClick={() => setDictionaryOpen(true)} aria-haspopup="dialog" aria-controls="splunk-dictionary-dialog" className="fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-600 px-5 py-3.5 font-bold text-white shadow-2xl shadow-cyan-950/50 transition hover:scale-105 hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:bottom-7 sm:right-7"><BookOpen size={20} aria-hidden="true" /><span className="hidden sm:inline">Splunk Dictionary</span><span className="sm:hidden">Dictionary</span></button>}
    {dictionaryOpen && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setDictionaryOpen(false); }}>
      <div id="splunk-dictionary-dialog" ref={dictionaryDialogRef} role="dialog" aria-modal="true" aria-labelledby="splunk-dictionary-title" className="flex h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#020617] shadow-2xl sm:h-[90vh] sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 bg-[#0f172a] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3"><BookOpen className="shrink-0 text-cyan-400" size={24} aria-hidden="true" /><div className="min-w-0"><h2 id="splunk-dictionary-title" className="truncate text-base font-bold text-white sm:text-lg">Splunk Dictionary</h2><p className="hidden text-xs text-slate-400 sm:block">Search terminology, learn examples, and practice interview questions.</p></div></div>
          <button ref={dictionaryCloseRef} type="button" onClick={() => setDictionaryOpen(false)} aria-label="Close Splunk Dictionary" className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><X size={22} aria-hidden="true" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><SplunkDictionary /></div>
      </div>
    </div>}
  </>;
}


// import React, { useEffect, useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
// import { BookOpen, X } from "lucide-react";

// import NavBar from "../components/NavBar";
// import StudioShell from "../components/splunk former folder/StudioShell";
// import SearchLab from "../components/splunk former folder/SearchLab";
// import SavedSearches from "../components/splunk former folder/SavedSearches";
// import DashboardBuilder from "../components/splunk former folder/DashboardBuilder";
// import AlertBuilder from "../components/splunk former folder/AlertBuilder";
// // import SplunkDictionary from "../components/splunk/SplunkDictionary";
// import SplunkDictionary from "../components/Dictionary";
// // Keep the same storage keys so students don't lose their work.
// const LS_SAVED = "to_splunk_saved_searches";
// const LS_DASH = "to_splunk_dashboards";
// const LS_ALERTS = "to_splunk_alerts";

// function load(key, fallback) {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch {
//     return fallback;
//   }
// }

// function makeId() {
//   if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
//     return crypto.randomUUID();
//   }
//   return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
// }

// export default function SplunkStudio() {
//   const { pathname } = useLocation();
//   // AuthLayout already displays the site's navbar on dashboard routes.
//   const showNavBar = !pathname.startsWith("/dashboard/");

//   const [active, setActive] = useState("lab");
//   const [dictionaryOpen, setDictionaryOpen] = useState(false);
//   const dictionaryButtonRef = useRef(null);
//   const dictionaryDialogRef = useRef(null);
//   const dictionaryCloseRef = useRef(null);

//   const [saved, setSaved] = useState(() => load(LS_SAVED, []));
//   const [dashboards, setDashboards] = useState(() => load(LS_DASH, []));
//   const [alerts, setAlerts] = useState(() => load(LS_ALERTS, []));

//   useEffect(() => {
//     localStorage.setItem(LS_SAVED, JSON.stringify(saved));
//   }, [saved]);

//   useEffect(() => {
//     localStorage.setItem(LS_DASH, JSON.stringify(dashboards));
//   }, [dashboards]);

//   useEffect(() => {
//     localStorage.setItem(LS_ALERTS, JSON.stringify(alerts));
//   }, [alerts]);

//   // The dictionary opens over the studio; it does not navigate away from the lab.
//   useEffect(() => {
//     if (!dictionaryOpen) return;

//     const previousOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     dictionaryCloseRef.current?.focus();

//     const onKeyDown = (event) => {
//       if (event.key === "Escape") {
//         setDictionaryOpen(false);
//         return;
//       }

//       // Keep keyboard focus inside the open popup.
//       if (event.key !== "Tab" || !dictionaryDialogRef.current) return;

//       const focusable = Array.from(
//         dictionaryDialogRef.current.querySelectorAll(
//           'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
//         ),
//       ).filter((element) => element.getClientRects().length > 0);

//       if (!focusable.length) {
//         event.preventDefault();
//         return;
//       }

//       const first = focusable[0];
//       const last = focusable[focusable.length - 1];
//       if (event.shiftKey && document.activeElement === first) {
//         event.preventDefault();
//         last.focus();
//       } else if (!event.shiftKey && document.activeElement === last) {
//         event.preventDefault();
//         first.focus();
//       }
//     };

//     document.addEventListener("keydown", onKeyDown);
//     return () => {
//       document.body.style.overflow = previousOverflow;
//       document.removeEventListener("keydown", onKeyDown);
//       dictionaryButtonRef.current?.focus();
//     };
//   }, [dictionaryOpen]);

//   const addSaved = ({ name, spl }) => {
//     setSaved((previous) => [
//       {
//         id: makeId(),
//         name,
//         spl,
//         createdAt: Date.now(),
//       },
//       ...previous,
//     ]);
//   };

//   const deleteSaved = (id) => {
//     setSaved((previous) => previous.filter((item) => item.id !== id));
//   };

//   const runSavedIntoLab = (spl) => {
//     // Preserve the existing one-time search handoff used by SearchLab.
//     sessionStorage.setItem("to_splunk_run_once", spl);
//     setActive("lab");
//   };

//   const addDashboard = ({ name, panels }) => {
//     setDashboards((previous) => [
//       {
//         id: makeId(),
//         name,
//         panels,
//         createdAt: Date.now(),
//       },
//       ...previous,
//     ]);
//   };

//   const deleteDashboard = (id) => {
//     setDashboards((previous) => previous.filter((item) => item.id !== id));
//   };

//   const addAlert = ({ name, spl, operator, threshold }) => {
//     setAlerts((previous) => [
//       {
//         id: makeId(),
//         name,
//         spl,
//         operator,
//         threshold,
//         createdAt: Date.now(),
//       },
//       ...previous,
//     ]);
//   };

//   const deleteAlert = (id) => {
//     setAlerts((previous) => previous.filter((item) => item.id !== id));
//   };

//   return (
//     <>
//       {showNavBar && <NavBar />}

//       <div className={showNavBar ? "pt-20 sm:pt-24" : undefined}>
//         <StudioShell active={active} setActive={setActive}>
//           {active === "lab" && (
//             <SearchLab
//               onSaveSearch={(spl) =>
//                 addSaved({ name: `Saved: ${spl.slice(0, 24)}...`, spl })
//               }
//             />
//           )}

//           {active === "saved" && (
//             <SavedSearches
//               saved={saved}
//               onAdd={addSaved}
//               onRun={runSavedIntoLab}
//               onDelete={deleteSaved}
//             />
//           )}

//           {active === "dash" && (
//             <DashboardBuilder
//               saved={saved}
//               dashboards={dashboards}
//               onAddDashboard={addDashboard}
//               onDeleteDashboard={deleteDashboard}
//             />
//           )}

//           {active === "alerts" && (
//             <AlertBuilder
//               saved={saved}
//               alerts={alerts}
//               onAddAlert={addAlert}
//               onDeleteAlert={deleteAlert}
//             />
//           )}
//         </StudioShell>
//       </div>

//       {/* Floating dictionary launcher: visible in every Studio tab. */}
//       {!dictionaryOpen && (
//         <button
//           ref={dictionaryButtonRef}
//           type="button"
//           onClick={() => setDictionaryOpen(true)}
//           aria-haspopup="dialog"
//           aria-controls="splunk-dictionary-dialog"
//           className="fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-600 px-5 py-3.5 font-bold text-white shadow-2xl shadow-cyan-950/50 transition hover:scale-105 hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:bottom-7 sm:right-7"
//         >
//           <BookOpen size={20} aria-hidden="true" />
//           <span className="hidden sm:inline">Splunk Dictionary</span>
//           <span className="sm:hidden">Dictionary</span>
//         </button>
//       )}

//       {/* Full dictionary popup with its original search, quiz, and cheat sheets. */}
//       {dictionaryOpen && (
//         <div
//           className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-5"
//           onMouseDown={(event) => {
//             if (event.target === event.currentTarget) {
//               setDictionaryOpen(false);
//             }
//           }}
//         >
//           <div
//             id="splunk-dictionary-dialog"
//             ref={dictionaryDialogRef}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="splunk-dictionary-title"
//             className="flex h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#020617] shadow-2xl sm:h-[90vh] sm:rounded-3xl"
//           >
//             <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 bg-[#0f172a] px-4 py-3 sm:px-6 sm:py-4">
//               <div className="flex min-w-0 items-center gap-3">
//                 <BookOpen className="shrink-0 text-cyan-400" size={24} aria-hidden="true" />
//                 <div className="min-w-0">
//                   <h2
//                     id="splunk-dictionary-title"
//                     className="truncate text-base font-bold text-white sm:text-lg"
//                   >
//                     Splunk Dictionary
//                   </h2>
//                   <p className="hidden text-xs text-slate-400 sm:block">
//                     Search terminology, learn examples, and practice interview questions.
//                   </p>
//                 </div>
//               </div>

//               <button
//                 ref={dictionaryCloseRef}
//                 type="button"
//                 onClick={() => setDictionaryOpen(false)}
//                 aria-label="Close Splunk Dictionary"
//                 className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
//               >
//                 <X size={22} aria-hidden="true" />
//               </button>
//             </div>

//             <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
//               <SplunkDictionary />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
///END HERE 

// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import StudioShell from "../components/splunk/StudioShell";
// import SearchLab from "../components/splunk/SearchLab";
// import SavedSearches from "../components/splunk/SavedSearches";
// import DashboardBuilder from "../components/splunk/DashboardBuilder";
// import AlertBuilder from "../components/splunk/AlertBuilder";


// import SplunkDictionary from "../components/splunk/SplunkDictionary";
// import { BookOpen, X } from "lucide-react";



// // import DashboardDropdown from "./Dropdown";
// // localStorage keys
// const LS_SAVED = "to_splunk_saved_searches";
// const LS_DASH = "to_splunk_dashboards";
// const LS_ALERTS = "to_splunk_alerts";

// const load = (key, fallback) => {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch {
//     return fallback;
//   }
// };

// export default function SplunkStudio() {
//   const { pathname } = useLocation();
//   // Dashboard routes already render the Navbar in AuthLayout.
//   const showNavBar = !pathname.startsWith("/dashboard/");
//   const [active, setActive] = useState("lab");

//   const [saved, setSaved] = useState(() => load(LS_SAVED, []));
//   const [dashboards, setDashboards] = useState(() => load(LS_DASH, []));
//   const [alerts, setAlerts] = useState(() => load(LS_ALERTS, []));
// const [dictionaryOpen, setDictionaryOpen] = useState(false);

// useEffect(() => {
//   if (!dictionaryOpen) return;

//   const previousOverflow = document.body.style.overflow;
//   document.body.style.overflow = "hidden";

//   const handleKeyDown = (event) => {
//     if (event.key === "Escape") {
//       setDictionaryOpen(false);
//     }
//   };

//   window.addEventListener("keydown", handleKeyDown);

//   return () => {
//     document.body.style.overflow = previousOverflow;
//     window.removeEventListener("keydown", handleKeyDown);
//   };
// }, [dictionaryOpen]);
//   // persist
//   useEffect(
//     () => localStorage.setItem(LS_SAVED, JSON.stringify(saved)),
//     [saved],
//   );
//   useEffect(
//     () => localStorage.setItem(LS_DASH, JSON.stringify(dashboards)),
//     [dashboards],
//   );
//   useEffect(
//     () => localStorage.setItem(LS_ALERTS, JSON.stringify(alerts)),
//     [alerts],
//   );

//   const addSaved = ({ name, spl }) => {
//     setSaved((p) => [
//       {
//         id: crypto.randomUUID?.() || String(Date.now()),
//         name,
//         spl,
//         createdAt: Date.now(),
//       },
//       ...p,
//     ]);
//   };

//   const deleteSaved = (id) => setSaved((p) => p.filter((x) => x.id !== id));

//   const runSavedIntoLab = (spl) => {
//     // Switch to lab and pass query through “save then click example” behavior
//     setActive("lab");
//     // easiest approach: store a one-time session value
//     sessionStorage.setItem("to_splunk_run_once", spl);
//   };

//   const addDashboard = ({ name, panels }) => {
//     setDashboards((p) => [
//       {
//         id: crypto.randomUUID?.() || String(Date.now()),
//         name,
//         panels,
//         createdAt: Date.now(),
//       },
//       ...p,
//     ]);
//   };
//   const [userEmail, setUserEmail] = useState("");
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);
//   const deleteDashboard = (id) =>
//     setDashboards((p) => p.filter((x) => x.id !== id));

//   const addAlert = ({ name, spl, operator, threshold }) => {
//     setAlerts((p) => [
//       {
//         id: crypto.randomUUID?.() || String(Date.now()),
//         name,
//         spl,
//         operator,
//         threshold,
//         createdAt: Date.now(),
//       },
//       ...p,
//     ]);
//   };

//   const deleteAlert = (id) => setAlerts((p) => p.filter((x) => x.id !== id));

//   return (
//     <>
//       {showNavBar && <NavBar />}
//       <div className={showNavBar ? "pt-20 sm:pt-24" : undefined}>
//         <StudioShell active={active} setActive={setActive}>
//           {active === "lab" && (
//             <SearchLab
//               onSaveSearch={(spl) =>
//                 addSaved({ name: `Saved: ${spl.slice(0, 24)}...`, spl })
//               }
//             />
//           )}

//           {active === "saved" && (
//             <SavedSearches
//               saved={saved}
//               onAdd={addSaved}
//               onRun={runSavedIntoLab}
//               onDelete={deleteSaved}
//             />
//           )}

//           {active === "dash" && (
//             <DashboardBuilder
//               saved={saved}
//               dashboards={dashboards}
//               onAddDashboard={addDashboard}
//               onDeleteDashboard={deleteDashboard}
//             />
//           )}

//           {active === "alerts" && (
//             <AlertBuilder
//               saved={saved}
//               alerts={alerts}
//               onAddAlert={addAlert}
//               onDeleteAlert={deleteAlert}
//             />
//           )}
//         </StudioShell>
//       </div>
//     </>
//   );
// }
