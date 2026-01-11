import React, { useEffect, useMemo, useState } from "react";
import StudioShell from "../components/splunk/StudioShell";
import SearchLab from "../components/splunk/SearchLab";
import SavedSearches from "../components/splunk/SavedSearches";
import DashboardBuilder from "../components/splunk/DashboardBuilder";
import AlertBuilder from "../components/splunk/AlertBuilder";
import DashboardDropdown from "../components/Dropdown";
// import DashboardDropdown from "./Dropdown";
// localStorage keys
const LS_SAVED = "to_splunk_saved_searches";
const LS_DASH = "to_splunk_dashboards";
const LS_ALERTS = "to_splunk_alerts";

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export default function SplunkStudio() {
  const [active, setActive] = useState("lab");

  const [saved, setSaved] = useState(() => load(LS_SAVED, []));
  const [dashboards, setDashboards] = useState(() => load(LS_DASH, []));
  const [alerts, setAlerts] = useState(() => load(LS_ALERTS, []));

  // persist
  useEffect(() => localStorage.setItem(LS_SAVED, JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem(LS_DASH, JSON.stringify(dashboards)), [dashboards]);
  useEffect(() => localStorage.setItem(LS_ALERTS, JSON.stringify(alerts)), [alerts]);

  const addSaved = ({ name, spl }) => {
    setSaved((p) => [
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        name,
        spl,
        createdAt: Date.now(),
      },
      ...p,
    ]);
  };

  const deleteSaved = (id) => setSaved((p) => p.filter((x) => x.id !== id));

  const runSavedIntoLab = (spl) => {
    // Switch to lab and pass query through “save then click example” behavior
    setActive("lab");
    // easiest approach: store a one-time session value
    sessionStorage.setItem("to_splunk_run_once", spl);
  };

  const addDashboard = ({ name, panels }) => {
    setDashboards((p) => [
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        name,
        panels,
        createdAt: Date.now(),
      },
      ...p,
    ]);
  };
    const [userEmail, setUserEmail] = useState("");
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
      document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);
  const deleteDashboard = (id) => setDashboards((p) => p.filter((x) => x.id !== id));

  const addAlert = ({ name, spl, operator, threshold }) => {
    setAlerts((p) => [
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        name,
        spl,
        operator,
        threshold,
        createdAt: Date.now(),
      },
      ...p,
    ]);
  };

  const deleteAlert = (id) => setAlerts((p) => p.filter((x) => x.id !== id));

  return (

    <>
       <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
              {/* LEFT SIDE - TITLE */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  To-Analytics Learning Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional Splunk Bootcamp Dashboard
                </p>
              </div>
    
              {/* RIGHT SIDE - ACTIONS */}
              <div className="flex items-center gap-4">
                {/* User Email */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {userEmail}
                </div>
    
                {/* Profile Button */}
                {/* <button
                  onClick={() => setProfileOpen(true)}
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  My Profile
                </button> */}
    
    <DashboardDropdown/>
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1 rounded text-sm 
            bg-gray-200 text-gray-800 
            dark:bg-gray-800 dark:text-white
            hover:opacity-90 transition"
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </div>
          </div>
    <StudioShell active={active} setActive={setActive}>

      {active === "lab" && (
        <SearchLab
          onSaveSearch={(spl) => addSaved({ name: `Saved: ${spl.slice(0, 24)}...`, spl })}
        />
      )}

      {active === "saved" && (
        <SavedSearches
          saved={saved}
          onAdd={addSaved}
          onRun={runSavedIntoLab}
          onDelete={deleteSaved}
        />
      )}

      {active === "dash" && (
        <DashboardBuilder
          saved={saved}
          dashboards={dashboards}
          onAddDashboard={addDashboard}
          onDeleteDashboard={deleteDashboard}
        />
      )}

      {active === "alerts" && (
        <AlertBuilder
          saved={saved}
          alerts={alerts}
          onAddAlert={addAlert}
          onDeleteAlert={deleteAlert}
        />
      )}
    </StudioShell>
    </>
  );
}
