import { useEffect, useRef, useState } from "react";
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
import StudentHistory from "../components/splunk/StudentHistory";
import LearningMissions from "../components/splunk/LearningMissions";
import { useStateContext } from "../context/ContextProvider";
import { splunkLabApi } from "../services/splunkLabApi";

// Keep the existing storage keys. Users' old work is not intentionally cleared.
const LS_SAVED = "to_splunk_saved_searches";
const LS_DASH = "to_splunk_dashboards";
const LS_ALERTS = "to_splunk_alerts";
const LS_OWNER = "to_splunk_workspace_owner";
const LS_MISSION_PROGRESS = "to_splunk_lesson_progress_v2";
const ownerKey = (key, owner) => `${key}::${owner}`;
function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
export default function SplunkStudio() {
  const { user, token, authLoading } = useStateContext();
  const authenticatedOwner = token && user ? String(user.id || user.email || "").trim().toLowerCase() : "";
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
  const [history, setHistory] = useState([]);
  const [missionProgress, setMissionProgress] = useState([]);
  const [workspaceOwner, setWorkspaceOwner] = useState("");
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceNotice, setWorkspaceNotice] = useState("");

  useEffect(() => {
    if (workspaceOwner) localStorage.setItem(ownerKey(LS_SAVED, workspaceOwner), JSON.stringify(saved));
    else if (!localStorage.getItem(LS_OWNER)) localStorage.setItem(LS_SAVED, JSON.stringify(saved));
  }, [saved, workspaceOwner]);
  useEffect(() => {
    if (workspaceOwner) localStorage.setItem(ownerKey(LS_DASH, workspaceOwner), JSON.stringify(dashboards));
    else if (!localStorage.getItem(LS_OWNER)) localStorage.setItem(LS_DASH, JSON.stringify(dashboards));
  }, [dashboards, workspaceOwner]);
  useEffect(() => {
    if (workspaceOwner) localStorage.setItem(ownerKey(LS_ALERTS, workspaceOwner), JSON.stringify(alerts));
    else if (!localStorage.getItem(LS_OWNER)) localStorage.setItem(LS_ALERTS, JSON.stringify(alerts));
  }, [alerts, workspaceOwner]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const previousOwner = localStorage.getItem(LS_OWNER) || "";
    if (!authenticatedOwner) {
      if (previousOwner) {
        setSaved([]); setDashboards([]); setAlerts([]); setHistory([]); setMissionProgress([]); setWorkspaceOwner("");
        setWorkspaceNotice("Sign in to view your account’s saved searches, dashboards, alerts, history, and mission progress.");
      } else {
        setWorkspaceNotice("Your current work is saved in this browser. Sign in to sync it across devices.");
      }
      setWorkspaceLoading(false);
      return () => { active = false; };
    }

    const identity = authenticatedOwner;
    const isSameOwner = previousOwner === identity;
    const localSaved = load(isSameOwner ? ownerKey(LS_SAVED, identity) : previousOwner ? ownerKey(LS_SAVED, identity) : LS_SAVED, []);
    const localDashboards = load(isSameOwner ? ownerKey(LS_DASH, identity) : previousOwner ? ownerKey(LS_DASH, identity) : LS_DASH, []);
    const localAlerts = load(isSameOwner ? ownerKey(LS_ALERTS, identity) : previousOwner ? ownerKey(LS_ALERTS, identity) : LS_ALERTS, []);
    const legacyProgress = load(LS_MISSION_PROGRESS, []);
    setWorkspaceLoading(true);
    (async () => {
      try {
        const work = await splunkLabApi.migrateLocalWork({
          savedSearches: localSaved,
          dashboards: localDashboards,
          alerts: localAlerts,
          missionProgress: legacyProgress,
        });
        if (!active) return;
        setSaved(work.savedSearches || []);
        setDashboards(work.dashboards || []);
        setAlerts(work.alerts || []);
        setMissionProgress(work.missionProgress || []);
        const [nextHistory, nextMissions] = await Promise.all([splunkLabApi.listHistory(), splunkLabApi.listMissions()]);
        if (!active) return;
        setHistory(nextHistory);
        setMissionProgress(nextMissions.map((item) => item.progress).filter(Boolean));
        setWorkspaceOwner(identity);
        localStorage.setItem(LS_OWNER, identity);
        localStorage.setItem(ownerKey(LS_SAVED, identity), JSON.stringify(work.savedSearches || []));
        localStorage.setItem(ownerKey(LS_DASH, identity), JSON.stringify(work.dashboards || []));
        localStorage.setItem(ownerKey(LS_ALERTS, identity), JSON.stringify(work.alerts || []));
        setWorkspaceNotice("Your Studio work is synced to your signed-in account.");
      } catch (error) {
        if (!active) return;
        if (previousOwner && previousOwner !== identity) { setSaved(localSaved); setDashboards(localDashboards); setAlerts(localAlerts); }
        setWorkspaceOwner(identity);
        localStorage.setItem(LS_OWNER, identity);
        setWorkspaceNotice(error.response?.data?.message || "Account sync is unavailable. Your browser copy is preserved.");
      } finally { if (active) setWorkspaceLoading(false); }
    })();
    return () => { active = false; };
  }, [authLoading, authenticatedOwner]);

  useEffect(() => {
    if (!dictionaryOpen) return;
    const returnFocusTarget = dictionaryButtonRef.current;
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
      returnFocusTarget?.focus();
    };
  }, [dictionaryOpen]);

  const addSaved = async ({ name, spl }) => {
    const local = { id: makeId(), name, spl, createdAt: Date.now() };
    setSaved((previous) => [local, ...previous]);
    if (!workspaceOwner) return;
    try { const savedItem = await splunkLabApi.createSavedSearch({ name, spl }); setSaved((previous) => previous.map((item) => item.id === local.id ? savedItem : item)); }
    catch (error) { setWorkspaceNotice(error.response?.data?.message || "Search saved in this browser; account sync failed."); }
  };
  const updateSaved = async (id, changes) => {
    setSaved((previous) => previous.map((item) => item.id === id ? { ...item, ...changes, updatedAt: Date.now() } : item));
    if (!workspaceOwner) return;
    try { const savedItem = await splunkLabApi.updateSavedSearch(id, changes); setSaved((previous) => previous.map((item) => item.id === id ? savedItem : item)); }
    catch (error) { setWorkspaceNotice(error.response?.data?.message || "Search updated in this browser; account sync failed."); }
  };
  const deleteSaved = async (id) => {
    setSaved((previous) => previous.filter((item) => item.id !== id));
    if (workspaceOwner) try { await splunkLabApi.deleteSavedSearch(id); } catch (error) { setWorkspaceNotice(error.response?.data?.message || "Search removed locally; server deletion failed."); }
  };
  const runSavedIntoLab = (spl) => {
    sessionStorage.setItem("to_splunk_run_once", spl);
    setActive("lab");
  };
  const addDashboard = async ({ name, panels }) => {
    const local = { id: makeId(), name, panels, createdAt: Date.now() }; setDashboards((previous) => [local, ...previous]);
    if (!workspaceOwner) return;
    try { const item = await splunkLabApi.createDashboard({ name, panels }); setDashboards((previous) => previous.map((entry) => entry.id === local.id ? item : entry)); }
    catch (error) { setWorkspaceNotice(error.response?.data?.message || "Dashboard kept in this browser; account sync failed."); }
  };
  const updateDashboard = async (id, changes) => {
    setDashboards((previous) => previous.map((item) => item.id === id ? { ...item, ...changes, updatedAt: Date.now() } : item));
    if (!workspaceOwner) return;
    try { const item = await splunkLabApi.updateDashboard(id, changes); setDashboards((previous) => previous.map((entry) => entry.id === id ? item : entry)); }
    catch (error) { setWorkspaceNotice(error.response?.data?.message || "Dashboard updated in this browser; account sync failed."); }
  };
  const deleteDashboard = async (id) => { setDashboards((previous) => previous.filter((item) => item.id !== id)); if (workspaceOwner) try { await splunkLabApi.deleteDashboard(id); } catch (error) { setWorkspaceNotice(error.response?.data?.message || "Dashboard removed locally; server deletion failed."); } };
  const addAlert = async (alert) => {
    const local = { id: makeId(), ...alert, createdAt: Date.now(), history: [] }; setAlerts((previous) => [local, ...previous]);
    if (!workspaceOwner) return;
    try { const item = await splunkLabApi.createAlert(alert); setAlerts((previous) => previous.map((entry) => entry.id === local.id ? item : entry)); }
    catch (error) { setWorkspaceNotice(error.response?.data?.message || "Alert kept in this browser; account sync failed."); }
  };
  const updateAlert = async (id, changes) => {
    setAlerts((previous) => previous.map((item) => item.id === id ? { ...item, ...changes, updatedAt: Date.now() } : item));
    if (!workspaceOwner) return;
    try { const item = await splunkLabApi.updateAlert(id, changes); setAlerts((previous) => previous.map((entry) => entry.id === id ? item : entry)); }
    catch (error) { setWorkspaceNotice(error.response?.data?.message || "Alert updated in this browser; account sync failed."); }
  };
  const deleteAlert = async (id) => { setAlerts((previous) => previous.filter((item) => item.id !== id)); if (workspaceOwner) try { await splunkLabApi.deleteAlert(id); } catch (error) { setWorkspaceNotice(error.response?.data?.message || "Alert removed locally; server deletion failed."); } };

  return <>
    {showNavBar && <NavBar />}
    <div className={showNavBar ? "pt-20 sm:pt-24" : undefined}>
      <StudioShell active={active} setActive={setActive}>
        {workspaceNotice && <p role="status" className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">{workspaceNotice}</p>}
        {workspaceLoading || authLoading ? <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">Loading your secure Studio workspace…</div> : <>
        {active === "lab" && <SearchLab onSaveSearch={(spl) => addSaved({ name: `Saved: ${spl.slice(0, 24)}...`, spl })} onSearchHistory={(item) => setHistory((previous) => [item, ...previous.filter((entry) => entry.id !== item.id)].slice(0, 100))} />}
        {active === "saved" && <SavedSearches saved={saved} onAdd={addSaved} onUpdate={updateSaved} onRun={runSavedIntoLab} onDelete={deleteSaved} />}
        {active === "history" && <StudentHistory history={history} onClear={async () => { if (workspaceOwner) { await splunkLabApi.clearHistory(); setHistory([]); } }} onRun={runSavedIntoLab} />}
        {active === "missions" && <LearningMissions dashboards={dashboards} missionProgress={missionProgress} onProgress={setMissionProgress} />}
        {active === "dash" && <DashboardBuilder saved={saved} dashboards={dashboards} onAddDashboard={addDashboard} onUpdateDashboard={updateDashboard} onDeleteDashboard={deleteDashboard} />}
        {active === "alerts" && <AlertBuilder saved={saved} alerts={alerts} onAddAlert={addAlert} onUpdateAlert={updateAlert} onDeleteAlert={deleteAlert} onRunAlert={async (id) => { const result = await splunkLabApi.runAlert(id); setAlerts((previous) => previous.map((alert) => alert.id === id ? { ...alert, history: [result, ...(alert.history || [])].slice(0, 50) } : alert)); return result; }} />}
        {active === "admin" && <AdminLab onOpenLab={runSavedIntoLab} />}
        </>}
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
