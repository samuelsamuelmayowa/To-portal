import React, { useEffect, useMemo, useState } from "react";
import StudioShell from "../components/splunk/StudioShell";
import SearchLab from "../components/splunk/SearchLab";
import SavedSearches from "../components/splunk/SavedSearches";
import DashboardBuilder from "../components/splunk/DashboardBuilder";
import AlertBuilder from "../components/splunk/AlertBuilder";

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
  );
}
