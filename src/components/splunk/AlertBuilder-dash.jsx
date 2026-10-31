import React, { useMemo, useState } from "react";
import { Bell, Play, Trash2 } from "lucide-react";
import { LOGS } from "../../data/logs";
import { runSPL } from "../../utils/splEngine";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

function testAlert({ spl, operator, threshold }) {
  const out = runSPL(spl, LOGS);
  if (out?.error) return { ok: false, error: out.error };

  const count = out?.count ?? 0;
  let triggered = false;

  if (operator === ">=") triggered = count >= threshold;
  if (operator === ">") triggered = count > threshold;
  if (operator === "==") triggered = count === threshold;

  return { ok: true, triggered, count };
}

export default function AlertBuilder({ saved, alerts, onAddAlert, onDeleteAlert }) {
  const [name, setName] = useState("My First Alert");
  const [operator, setOperator] = useState(">=");
  const [threshold, setThreshold] = useState(10);
  const [pickedId, setPickedId] = useState(saved[0]?.id || "");
  const [lastTest, setLastTest] = useState(null);

  const picked = useMemo(() => saved.find((s) => s.id === pickedId), [saved, pickedId]);

  const runTest = () => {
    if (!picked) return;
    setLastTest(testAlert({ spl: picked.spl, operator, threshold: Number(threshold) }));
  };

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-8">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="text-cyan-300" size={18} />
          <div className="text-lg font-semibold">Alert Builder</div>
        </div>
        <div className="text-xs text-gray-400 mb-5">
          Alerts are saved searches + trigger conditions. This is the foundation students need.
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Alert name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Use saved search</div>
            <select
              value={pickedId}
              onChange={(e) => setPickedId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
            >
              {saved.length === 0 ? (
                <option value="">(No saved searches yet)</option>
              ) : (
                saved.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
              )}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">Operator</div>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
              >
                <option value=">=">{">="}</option>
                <option value=">">{">"}</option>
                <option value="==">{"=="}</option>
              </select>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400 mb-1">Trigger when results count</div>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <PrimaryButton onClick={runTest} className="flex-1 flex items-center justify-center gap-2">
              <Play size={16} /> Test Alert
            </PrimaryButton>
            <SoftButton
              onClick={() => {
                if (!picked) return;
                onAddAlert({
                  name: name.trim() || "Alert",
                  spl: picked.spl,
                  operator,
                  threshold: Number(threshold),
                });
                setLastTest(null);
              }}
              className="flex-1"
            >
              Save Alert
            </SoftButton>
          </div>

          {picked && (
            <div className="text-[11px] text-gray-400 font-mono break-all">
              SPL: {picked.spl}
            </div>
          )}

          {lastTest && (
            <div
              className={[
                "p-4 rounded-2xl border text-sm",
                lastTest.error
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : lastTest.triggered
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
                  : "border-green-500/30 bg-green-500/10 text-green-200",
              ].join(" ")}
            >
              {lastTest.error ? (
                <>❌ {lastTest.error}</>
              ) : lastTest.triggered ? (
                <>⚠️ Triggered — count={lastTest.count} (condition {operator} {threshold})</>
              ) : (
                <>✅ Not triggered — count={lastTest.count} (condition {operator} {threshold})</>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="text-lg font-semibold mb-4">Saved Alerts</div>
        {alerts.length === 0 ? (
          <div className="text-sm text-gray-400">No alerts saved yet.</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Trigger when count {a.operator} {a.threshold}
                    </div>
                    <div className="text-[11px] text-gray-300 font-mono mt-2 break-all">
                      {a.spl}
                    </div>
                  </div>
                  <SoftButton onClick={() => onDeleteAlert(a.id)} title="Delete">
                    <Trash2 size={16} />
                  </SoftButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
