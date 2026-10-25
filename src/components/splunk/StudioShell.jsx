import React from "react";
import { BookOpen, LayoutDashboard, Database, Bell, Sparkles, Settings2 } from "lucide-react";
import { GlassCard } from "./Glass";
const TABS = [
  { id: "lab", label: "Search & Reporting", Icon: Database },
  { id: "saved", label: "Saved Searches", Icon: BookOpen },
  { id: "dash", label: "Dashboards", Icon: LayoutDashboard },
  { id: "alerts", label: "Alerts", Icon: Bell },
  { id: "admin", label: "Administration", Icon: Settings2 },
];
export default function StudioShell({ active, setActive, children }) {
  return <div className="min-h-screen bg-[#020617] text-white">
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300"><Sparkles size={14}/> T.O Analytics Interactive Training</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Splunk Studio Lab</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">Learn SPL through real-world simulations. Investigate logs, build reports, visualize data, and design monitoring workflows at your own pace.</p>
        </div>
        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">Hands-on SPL Simulator • No server required</span>
      </header>
      <GlassCard className="mb-6 overflow-x-auto p-2"><nav aria-label="Studio sections" className="flex min-w-max flex-wrap gap-2 sm:flex-nowrap">
        {TABS.map(({ id, label, Icon }) => <button type="button" key={id} onClick={() => setActive(id)} aria-current={active === id ? "page" : undefined} className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${active === id ? "border-cyan-400/35 bg-cyan-400/15 text-cyan-100" : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"}`}><Icon size={16} />{label}</button>)}
      </nav></GlassCard>
      {children}
    </div>
  </div>;
}
