import React, { useMemo, useState } from "react";
import { LayoutDashboard, Plus, Trash2, Play } from "lucide-react";
import { LOGS } from "../../data/logs";
// import LOGS
import { runSPL } from "../../utils/splEngine";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";
import { MiniBarChart, PrettyTable } from "./Viz";

function PanelPreview({ panel }) {
  const out = runSPL(panel.spl, LOGS);
  if (out?.error) {
    return (
      <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm text-red-200">
        ❌ {out.error}
      </div>
    );
  }

  const rows = out?.results || [];

  // Number panel
  if (panel.type === "number") {
    const value = rows?.[0]?.count ?? out?.count ?? 0;
    return (
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-xs text-gray-400">{panel.title}</div>
        <div className="text-4xl font-bold mt-2 text-cyan-200">{value}</div>
        <div className="text-xs text-gray-500 mt-2">Based on SPL: {panel.spl}</div>
      </div>
    );
  }

  // Chart panel
  if (panel.type === "chart") {
    const xKey = rows[0] ? Object.keys(rows[0])[0] : "_time";
    const yKey = rows[0] ? (Object.keys(rows[0]).includes("count") ? "count" : Object.keys(rows[0])[1]) : "count";
    return (
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-sm font-semibold mb-1">{panel.title}</div>
        <div className="text-xs text-gray-400 mb-3">Chart from SPL</div>
        {rows.length ? <MiniBarChart rows={rows.slice(0, 18)} xKey={xKey} yKey={yKey} /> : <div className="text-sm text-gray-400">No data</div>}
      </div>
    );
  }

  // Table panel
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
      <div className="text-sm font-semibold mb-3">{panel.title}</div>
      {rows.length ? <PrettyTable rows={rows} maxCols={7} maxRows={10} /> : <div className="text-sm text-gray-400">No data</div>}
      <div className="text-xs text-gray-500 mt-3">SPL: {panel.spl}</div>
    </div>
  );
}

export default function DashboardBuilder({ saved, dashboards, onAddDashboard, onDeleteDashboard }) {
  const [dashName, setDashName] = useState("My First Dashboard");
  const [dashPanels, setDashPanels] = useState([]);
  const [pickSearchId, setPickSearchId] = useState(saved[0]?.id || "");
  const [panelTitle, setPanelTitle] = useState("Panel");
  const [panelType, setPanelType] = useState("table");

  const pickedSearch = useMemo(
    () => saved.find((s) => s.id === pickSearchId),
    [saved, pickSearchId]
  );

  const addPanel = () => {
    if (!pickedSearch) return;
    setDashPanels((p) => [
      ...p,
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        title: panelTitle.trim() || "Panel",
        type: panelType,
        spl: pickedSearch.spl,
      },
    ]);
  };

  const removePanel = (id) => setDashPanels((p) => p.filter((x) => x.id !== id));

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-8">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="text-cyan-300" size={18} />
          <div className="text-lg font-semibold">Dashboard Builder</div>
        </div>
        <div className="text-xs text-gray-400 mb-5">
          Dashboards are collections of searches (panels). This teaches real “Dashboard thinking”.
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Dashboard name</div>
            <input
              value={dashName}
              onChange={(e) => setDashName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
            <div className="text-sm font-semibold mb-3">Add a panel</div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">From saved search</div>
                <select
                  value={pickSearchId}
                  onChange={(e) => setPickSearchId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
                >
                  {saved.length === 0 ? (
                    <option value="">(No saved searches)</option>
                  ) : (
                    saved.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                  )}
                </select>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">Panel title</div>
                <input
                  value={panelTitle}
                  onChange={(e) => setPanelTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">Panel type</div>
                <select
                  value={panelType}
                  onChange={(e) => setPanelType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
                >
                  <option value="table">Table</option>
                  <option value="chart">Chart</option>
                  <option value="number">Single Value</option>
                </select>
              </div>

              <PrimaryButton onClick={addPanel} className="w-full flex items-center justify-center gap-2">
                <Plus size={16} /> Add Panel
              </PrimaryButton>

              {pickedSearch && (
                <div className="text-[11px] text-gray-400 font-mono break-all">
                  SPL: {pickedSearch.spl}
                </div>
              )}
            </div>
          </div>

          <PrimaryButton
            onClick={() => {
              if (!dashName.trim()) return;
              onAddDashboard({
                name: dashName.trim(),
                panels: dashPanels,
              });
              setDashPanels([]);
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            <Play size={16} /> Save Dashboard
          </PrimaryButton>

          <div className="text-xs text-gray-500">
            Tip: use <span className="text-cyan-200 font-mono">stats</span> and{" "}
            <span className="text-cyan-200 font-mono">timechart</span> for dashboard-ready panels.
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="text-lg font-semibold mb-2">Live Preview</div>
          {dashPanels.length === 0 ? (
            <div className="text-sm text-gray-400">Add panels on the left to preview your dashboard.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {dashPanels.map((p) => (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => removePanel(p.id)}
                    className="absolute right-3 top-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                    title="Remove panel"
                  >
                    <Trash2 size={16} />
                  </button>
                  <PanelPreview panel={p} />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-semibold">Saved Dashboards</div>
              <div className="text-xs text-gray-400">{dashboards.length} dashboards</div>
            </div>
          </div>

          {dashboards.length === 0 ? (
            <div className="text-sm text-gray-400">No dashboards saved yet.</div>
          ) : (
            <div className="space-y-3">
              {dashboards.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{d.panels.length} panels</div>
                    </div>
                    <SoftButton onClick={() => onDeleteDashboard(d.id)} title="Delete">
                      <Trash2 size={16} />
                    </SoftButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
