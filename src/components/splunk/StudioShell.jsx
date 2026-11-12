/* eslint-disable react/prop-types */
import { BookOpen, LayoutDashboard, Database, Bell, Settings2, History, GraduationCap, Search } from "lucide-react";
import { GlassCard } from "./Glass";
const TABS = [
  { id: "lab", label: "Search & Reporting", Icon: Database },
  { id: "saved", label: "Saved Searches", Icon: BookOpen },
  { id: "history", label: "Search History", Icon: History },
  { id: "dash", label: "Dashboards", Icon: LayoutDashboard },
  { id: "alerts", label: "Alerts", Icon: Bell },
  { id: "missions", label: "Missions", Icon: GraduationCap },
  { id: "admin", label: "Administration", Icon: Settings2 },
];
export default function StudioShell({ active, setActive, children }) {
  return <div className="min-h-screen bg-[#0e0b14] text-white">
    <div className="mx-auto max-w-[1680px] px-3 py-4 sm:px-5 lg:px-7 lg:py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#37283e] pb-4">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2d2065] text-fuchsia-200"><Search size={20}/></div><div className="min-w-0"><p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-fuchsia-300">T.O Analytics <span className="text-slate-600">/</span> Interactive Training</p>
          <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight sm:text-2xl">Splunk Studio</h1></div>
        </div>
        <span className="rounded-md border border-[#49384d] bg-[#191421] px-3 py-2 text-xs text-slate-300">SPL learning workspace <span className="mx-1 text-fuchsia-400">•</span> T.O Analytics</span>
      </header>
      <GlassCard className="mb-4 overflow-x-auto rounded-lg p-1"><nav aria-label="Studio sections" className="flex min-w-max gap-1">
        {TABS.map(({ id, label, Icon }) => <button type="button" key={id} onClick={() => setActive(id)} aria-current={active === id ? "page" : undefined} className={`flex items-center gap-2 rounded-md border-b-2 px-3 py-2.5 text-xs font-medium transition sm:px-4 sm:text-sm ${active === id ? "border-[#c418ac] bg-[#2a1a30] text-fuchsia-100" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={15} />{label}</button>)}
      </nav></GlassCard>
      {children}
    </div>
  </div>;
}
