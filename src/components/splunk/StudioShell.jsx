import React from "react";
import { Sparkles } from "lucide-react";
import { GlassCard, Pill, SoftButton } from "./Glass";

export default function StudioShell({ active, setActive, children }) {
  const tabs = [
    { id: "lab", label: "Search & Reporting" },
    { id: "saved", label: "Saved Searches" },
    { id: "dash", label: "Dashboards" },
    { id: "alerts", label: "Alerts" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                Splunk Studio Lab <Sparkles className="text-cyan-400" size={18} />
              </h1>
              <p className="mt-2 text-gray-400 max-w-2xl leading-relaxed">
                Practice SPL, build reports, create visualizations, save searches, design dashboards,
                and learn alert foundations — in a safe simulated Splunk experience.
              </p>
            </div>

            <Pill>Search & Reporting • SPL • Dashboards • Alerts</Pill>
          </div>

          <GlassCard className="mt-6 p-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <SoftButton
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={
                    active === t.id
                      ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-200"
                      : ""
                  }
                >
                  {t.label}
                </SoftButton>
              ))}
            </div>
          </GlassCard>
        </div>

        {children}
      </div>
    </div>
  );
}
