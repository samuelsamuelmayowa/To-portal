import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo2.png";
import "./SplunkLab.css";
const roles = {"analyst": "Splunk Analyst", "soc": "SOC Analyst", "engineer": "Splunk Engineer"};
const levels = {"entry": "Entry Level (0–2 Years)", "mid": "Mid-Level (2–5 Years)", "senior": "Senior Level (5+ Years)"};
// The supplied page is a front-end simulation preview; its scorecard and logs are sample data.
export default function SplunkLab() {
  const [selectedRole, setSelectedRole] = useState("analyst");
  const [selectedLevel, setSelectedLevel] = useState("entry");
  const [selectedAnswer, setSelectedAnswer] = useState(1);
  const [query, setQuery] = useState('index=security_auth sourcetype="cisco:vpn" | stats count by src_ip, user, action | sort - count');
  const [answer, setAnswer] = useState("198.51.100.42");
  const [searching, setSearching] = useState(false);
  const [labFeedback, setLabFeedback] = useState("");
  const searchTimeout = useRef(null);
  useEffect(() => () => window.clearTimeout(searchTimeout.current), []);
  function launch() {
    document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth" });
  }
  function runSearch() {
    if (!query.trim() || searching) return;
    setSearching(true);
    searchTimeout.current = window.setTimeout(() => setSearching(false), 500);
  }
  return (
    <div className="splunk-lab bg-lab-bg-canvas font-lab-body-md text-lab-on-surface antialiased">
   
    <main className="w-full pt-16 bg-lab-bg-canvas min-h-screen">
      <p className="px-4 lg:px-8 py-2 bg-lab-bg-surface text-lab-text-secondary text-lab-body-sm border-b border-slate-800">
        Simulation preview: questions, search results, scores, and attempt history are sample data.
      </p>
      <div className="flex flex-col w-full text-lab-on-surface">
        <section className="relative w-full px-4 lg:px-8 py-lab-space-xl lg:py-lab-space-2xl overflow-hidden bg-lab-bg-surface-elevated/40">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{"backgroundImage": "radial-gradient(#38BDF8 1px, transparent 1px)", "backgroundSize": "28px 28px"}}>
          </div>
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-lab-primary-container/20 rounded-lab-full blur-3xl pointer-events-none">
          </div>
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-lab-telemetry-cyan/10 rounded-lab-full blur-3xl pointer-events-none">
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-lab-space-xl items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="flex flex-wrap items-center gap-lab-space-xs mb-lab-space-base">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lab-full bg-lab-status-success/10 border border-lab-status-success/25 shadow-sm">
                  <span className="w-2 h-2 rounded-lab-full bg-lab-status-success animate-ping">
                  </span>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-status-success tracking-wider uppercase">
                    {"T.O. SKILL LAB // VERIFIED EVALUATION"}
                  </span>
                </div>
                <span className="text-lab-text-muted font-lab-label-caps text-lab-label-caps tracking-widest hidden sm:inline-block">
                  {"ENV: SPLUNK CORE v9.2.1"}
                </span>
              </div>
              <h1 className="font-lab-display-hero text-lab-display-hero-mobile md:text-lab-headline-xl lg:text-lab-display-hero text-lab-text-primary tracking-tight font-extrabold max-w-2xl leading-none">
                {"Practice the interview. "}
                <span className="bg-gradient-to-r from-lab-telemetry-cyan via-lab-primary to-lab-accent-royal-indigo bg-clip-text text-transparent">
                  {"Prove the skill."}
                </span>
                {" Earn the offer."}
              </h1>
              <p className="mt-lab-space-base font-lab-body-lg text-lab-body-lg text-lab-text-secondary max-w-xl">
                {" Prepare for real-world Splunk and SOC interviews through timed technical questions and live hands-on log triage labs calibrated to enterprise hiring pipelines. "}
              </p>
              <div className="mt-lab-space-xl flex flex-wrap items-center gap-lab-space-base w-full sm:w-auto">
                <a className="w-full sm:w-auto px-lab-space-lg py-3.5 rounded-lab-lg bg-gradient-to-r from-lab-primary-container via-lab-accent-electric-blue to-lab-telemetry-teal text-lab-text-primary font-lab-headline-sm text-lab-headline-sm font-semibold flex items-center justify-center gap-lab-space-sm shadow-xl shadow-lab-accent-electric-blue/20 hover:brightness-110 active:scale-[0.98] transition-all" href="#interview-setup">
                  <span>
                    {"Start Interview Simulation"}
                  </span>
                  <span className="material-symbols-outlined text-[20px]">
                    {"arrow_forward"}
                  </span>
                </a>
                <a className="w-full sm:w-auto px-lab-space-lg py-3.5 rounded-lab-lg bg-lab-bg-surface border border-slate-800 text-lab-text-primary font-lab-headline-sm text-lab-headline-sm hover:border-lab-telemetry-cyan/50 hover:bg-lab-bg-surface-hover transition-all flex items-center justify-center gap-lab-space-xs" href="#role-tracks">
                  <span>
                    {"Explore Roles"}
                  </span>
                  <span className="material-symbols-outlined text-lab-text-muted text-[18px]">
                    {"expand_more"}
                  </span>
                </a>
              </div>
              <div className="mt-lab-space-xl pt-lab-space-base border-t border-slate-800/80 w-full grid grid-cols-2 sm:grid-cols-4 gap-lab-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lab-telemetry-cyan text-[18px]">
                    {"timer"}
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary">
                    {"Timed Technical"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lab-telemetry-teal text-[18px]">
                    {"terminal"}
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary">
                    {"Hands-on Labs"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lab-status-warning text-[18px]">
                    {"bolt"}
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary">
                    {"Live Telemetry"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lab-primary text-[18px]">
                    {"verified"}
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary">
                    {"SOC Calibration"}
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-lab-xl bg-lab-bg-surface-elevated border border-lab-telemetry-cyan/30 shadow-2xl p-lab-space-base overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-lab-telemetry-cyan/15 rounded-bl-lab-lg border-l border-b border-lab-telemetry-cyan/30">
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-cyan">
                    {"CANDIDATE SESSION // LIVE"}
                  </span>
                </div>
                <div className="flex items-center gap-lab-space-sm mb-lab-space-base">
                  <img className="h-6 w-auto object-contain" src={logo} alt="T.O. Analytics" />
                  <div className="h-4 w-px bg-slate-800">
                  </div>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-text-secondary tracking-widest">
                    {"EVALUATION COCKPIT"}
                  </span>
                </div>
                <div className="space-y-lab-space-sm bg-lab-bg-canvas/90 p-lab-space-base rounded-lab-lg border border-slate-800/90 font-lab-code-block text-lab-code-block">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-lab-text-muted">
                      {"ACTIVE ROLE:"}
                    </span>
                    <span className="text-lab-telemetry-cyan font-semibold">
{roles[selectedRole]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-lab-text-muted">
                      {"DIFFICULTY LEVEL:"}
                    </span>
                    <span className="text-lab-status-success font-medium">
{levels[selectedLevel]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-lab-text-muted">
                      {"INTERVIEW DEPTH:"}
                    </span>
                    <span className="text-lab-text-primary">
                      {"10 Questions (75s/per)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-lab-text-muted">
                      {"PRACTICAL LAB:"}
                    </span>
                    <span className="text-lab-telemetry-teal">
                      {"2 Investigation Scenarios"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-lab-text-muted">
                      {"READINESS BENCHMARK:"}
                    </span>
                    <span className="text-lab-status-success flex items-center gap-1 font-semibold">
                      {" 86% [Strong Hire Indicator] "}
                      <span className="material-symbols-outlined text-[14px]">
                        {"trending_up"}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="mt-lab-space-base p-lab-space-sm rounded-lab-DEFAULT bg-lab-primary-container/10 border border-lab-primary-container/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-lab-full bg-lab-telemetry-cyan animate-pulse">
                    </span>
                    <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                      {"Diagnostic Engine: "}
                      <strong className="text-lab-text-primary">
                        {"ARMED"}
                      </strong>
                    </span>
                  </div>
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-muted">
                    {"LATENCY: 12ms"}
                  </span>
                </div>
                <button className="mt-lab-space-base w-full py-3 rounded-lab-lg bg-lab-primary-container hover:bg-lab-accent-electric-blue text-lab-text-primary font-lab-headline-sm text-lab-headline-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-lab-primary-container/25" onClick={launch} id="quickLaunchBtn" type="button">
                  <span className="material-symbols-outlined text-[20px]">
                    {"play_circle"}
                  </span>
                  <span>
                    {"Launch Evaluation Matrix"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-xl bg-lab-bg-surface border-y border-slate-800/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-lab-space-xl gap-lab-space-sm">
              <div>
                <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-cyan uppercase tracking-widest">
                  {"EVALUATION PROTOCOL"}
                </span>
                <h2 className="font-lab-headline-lg text-lab-headline-lg text-lab-text-primary mt-1 font-bold">
                  {"How the Simulation Works"}
                </h2>
              </div>
              <p className="font-lab-body-sm text-lab-body-sm text-lab-text-muted max-w-md">
                {"Every candidate path mirrors enterprise technical screening procedures used by Fortune 500 SOC teams."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lab-space-base relative">
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800 hover:border-lab-telemetry-cyan/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <span className="font-lab-code-block text-lab-label-caps text-lab-telemetry-cyan px-2 py-0.5 rounded-lab-DEFAULT bg-lab-telemetry-cyan/10">
                      {"STAGE 01"}
                    </span>
                    <span className="material-symbols-outlined text-lab-text-muted text-[22px]">
                      {"tune"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mb-1">
                    {"Choose Track"}
                  </h3>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                    {"Select your target role and enterprise seniority level to tailor interview rigor."}
                  </p>
                </div>
                <div className="mt-lab-space-base pt-lab-space-sm border-t border-slate-800/70 text-lab-text-muted font-lab-code-block text-lab-code-block">
                  {" Splunk / SOC / Platform "}
                </div>
              </div>
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800 hover:border-lab-telemetry-cyan/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <span className="font-lab-code-block text-lab-label-caps text-lab-primary px-2 py-0.5 rounded-lab-DEFAULT bg-lab-primary/10">
                      {"STAGE 02"}
                    </span>
                    <span className="material-symbols-outlined text-lab-text-muted text-[22px]">
                      {"timer"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mb-1">
                    {"Technical Screening"}
                  </h3>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                    {"Answer rapid-fire scenario questions under realistic countdown constraints."}
                  </p>
                </div>
                <div className="mt-lab-space-base pt-lab-space-sm border-t border-slate-800/70 text-lab-text-muted font-lab-code-block text-lab-code-block">
                  {" 10 Scenarios // 75s Window "}
                </div>
              </div>
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800 hover:border-lab-telemetry-cyan/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <span className="font-lab-code-block text-lab-label-caps text-lab-telemetry-teal px-2 py-0.5 rounded-lab-DEFAULT bg-lab-telemetry-teal/10">
                      {"STAGE 03"}
                    </span>
                    <span className="material-symbols-outlined text-lab-text-muted text-[22px]">
                      {"terminal"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mb-1">
                    {"Live Hands-on Lab"}
                  </h3>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                    {"Execute actual SPL commands to isolate incidents, pivot on IOCs, and neutralize threats."}
                  </p>
                </div>
                <div className="mt-lab-space-base pt-lab-space-sm border-t border-slate-800/70 text-lab-text-muted font-lab-code-block text-lab-code-block">
                  {" Live SIEM Sandboxed Data "}
                </div>
              </div>
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-lab-status-success/30 hover:border-lab-status-success/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <span className="font-lab-code-block text-lab-label-caps text-lab-status-success px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-success/10">
                      {"STAGE 04"}
                    </span>
                    <span className="material-symbols-outlined text-lab-status-success text-[22px]">
                      {"verified_user"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mb-1">
                    {"Verified Assessment"}
                  </h3>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                    {"Receive competency scoring, an interview debrief, and your virtual hiring credential."}
                  </p>
                </div>
                <div className="mt-lab-space-base pt-lab-space-sm border-t border-slate-800/70 text-lab-text-muted font-lab-code-block text-lab-code-block">
                  {" Offer Letter + Talent Audit "}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-2xl bg-lab-bg-canvas" id="role-tracks">
          <div className="max-w-7xl mx-auto">
            <div className="mb-lab-space-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-lab-telemetry-cyan rounded-lab-full">
                </span>
                <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-cyan tracking-wider">
                  {"TRACK SELECTION MATRIX"}
                </span>
              </div>
              <h2 className="font-lab-headline-xl text-lab-headline-lg lg:text-lab-headline-xl font-bold text-lab-text-primary">
                {"Choose Your Interview Track"}
              </h2>
              <p className="font-lab-body-lg text-lab-body-lg text-lab-text-secondary max-w-3xl mt-1">
                {" Select the enterprise discipline you want to test. Questions, log streams, and evaluation benchmarks dynamically regenerate based on your specialization. "}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lab-space-base" id="roleSelectorGroup">
              <div className={"role-card cursor-pointer p-lab-space-lg rounded-lab-xl transition-all flex flex-col justify-between" + (selectedRole === "analyst" ? " border-2 border-lab-telemetry-cyan bg-lab-bg-surface-elevated shadow-xl shadow-lab-telemetry-cyan/5" : " border border-slate-800 bg-lab-bg-surface")} onClick={() => setSelectedRole("analyst")} data-role="analyst">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <div className="w-12 h-12 rounded-lab-lg bg-lab-telemetry-cyan/15 flex items-center justify-center text-lab-telemetry-cyan">
                      <span className="material-symbols-outlined text-[28px]">
                        {"query_stats"}
                      </span>
                    </div>
                    <span className={"font-lab-label-caps text-lab-label-caps px-2.5 py-1 rounded-lab-DEFAULT font-bold tracking-wider " + (selectedRole === "analyst" ? "bg-lab-telemetry-cyan text-lab-on-secondary" : "bg-slate-800 text-lab-text-muted")}>
{selectedRole === "analyst" ? "SELECTED" : "STANDBY"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-md text-lab-headline-md font-bold text-lab-text-primary">
                    {"Splunk Analyst"}
                  </h3>
                  <p className="font-lab-body-md text-lab-body-md text-lab-text-secondary mt-2">
                    {" Search, investigate, and pivot on unstructured machine telemetry to generate executive visibility, triage operational anomalies, and engineer dashboards. "}
                  </p>
                  <div className="mt-lab-space-base flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"SPL Search"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Dashboards"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Data Models"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Field Extraction"}
                    </span>
                  </div>
                </div>
                <button aria-pressed={selectedRole === "analyst"} className={"mt-lab-space-lg w-full py-2.5 rounded-lab-lg font-lab-headline-sm text-lab-body-md font-bold transition-all " + (selectedRole === "analyst" ? "bg-lab-telemetry-cyan text-lab-on-secondary" : "bg-lab-bg-surface-elevated border border-slate-700 text-lab-text-primary")} type="button">
{(selectedRole === "analyst" ? "Selected: " : "Prepare for ") + roles["analyst"]}
                </button>
              </div>
              <div className={"role-card cursor-pointer p-lab-space-lg rounded-lab-xl transition-all flex flex-col justify-between" + (selectedRole === "soc" ? " border-2 border-lab-telemetry-cyan bg-lab-bg-surface-elevated shadow-xl shadow-lab-telemetry-cyan/5" : " border border-slate-800 bg-lab-bg-surface")} onClick={() => setSelectedRole("soc")} data-role="soc">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <div className="w-12 h-12 rounded-lab-lg bg-lab-primary/10 flex items-center justify-center text-lab-primary">
                      <span className="material-symbols-outlined text-[28px]">
                        {"shield"}
                      </span>
                    </div>
                    <span className={"font-lab-label-caps text-lab-label-caps px-2.5 py-1 rounded-lab-DEFAULT font-bold tracking-wider " + (selectedRole === "soc" ? "bg-lab-telemetry-cyan text-lab-on-secondary" : "bg-slate-800 text-lab-text-muted")}>
{selectedRole === "soc" ? "SELECTED" : "STANDBY"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-md text-lab-headline-md font-bold text-lab-text-primary">
                    {"SOC Analyst"}
                  </h3>
                  <p className="font-lab-body-md text-lab-body-md text-lab-text-secondary mt-2">
                    {" Triage real-time threat detections, trace lateral movements, correlate authentication failures, and execute containment protocols inside Splunk ES. "}
                  </p>
                  <div className="mt-lab-space-base flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"SIEM Triage"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"MITRE ATT&CK"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Incident Response"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Notable Events"}
                    </span>
                  </div>
                </div>
                <button aria-pressed={selectedRole === "soc"} className={"mt-lab-space-lg w-full py-2.5 rounded-lab-lg font-lab-headline-sm text-lab-body-md font-bold transition-all " + (selectedRole === "soc" ? "bg-lab-telemetry-cyan text-lab-on-secondary" : "bg-lab-bg-surface-elevated border border-slate-700 text-lab-text-primary")} type="button">
{(selectedRole === "soc" ? "Selected: " : "Prepare for ") + roles["soc"]}
                </button>
              </div>
              <div className={"role-card cursor-pointer p-lab-space-lg rounded-lab-xl transition-all flex flex-col justify-between" + (selectedRole === "engineer" ? " border-2 border-lab-telemetry-cyan bg-lab-bg-surface-elevated shadow-xl shadow-lab-telemetry-cyan/5" : " border border-slate-800 bg-lab-bg-surface")} onClick={() => setSelectedRole("engineer")} data-role="engineer">
                <div>
                  <div className="flex items-center justify-between mb-lab-space-base">
                    <div className="w-12 h-12 rounded-lab-lg bg-lab-tertiary-container/20 flex items-center justify-center text-lab-tertiary">
                      <span className="material-symbols-outlined text-[28px]">
                        {"dns"}
                      </span>
                    </div>
                    <span className={"font-lab-label-caps text-lab-label-caps px-2.5 py-1 rounded-lab-DEFAULT font-bold tracking-wider " + (selectedRole === "engineer" ? "bg-lab-telemetry-cyan text-lab-on-secondary" : "bg-slate-800 text-lab-text-muted")}>
{selectedRole === "engineer" ? "SELECTED" : "STANDBY"}
                    </span>
                  </div>
                  <h3 className="font-lab-headline-md text-lab-headline-md font-bold text-lab-text-primary">
                    {"Splunk Engineer"}
                  </h3>
                  <p className="font-lab-body-md text-lab-body-md text-lab-text-secondary mt-2">
                    {" Architect multi-site indexer clusters, optimize pipeline throughput, manage deployment servers, configure data inputs, and fine-tune search concurrency. "}
                  </p>
                  <div className="mt-lab-space-base flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Clustering"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Universal Forwarders"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Props & Transforms"}
                    </span>
                    <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-bg-surface font-lab-code-block text-lab-code-block text-lab-text-muted border border-slate-800">
                      {"Index Sizing"}
                    </span>
                  </div>
                </div>
                <button aria-pressed={selectedRole === "engineer"} className={"mt-lab-space-lg w-full py-2.5 rounded-lab-lg font-lab-headline-sm text-lab-body-md font-bold transition-all " + (selectedRole === "engineer" ? "bg-lab-telemetry-cyan text-lab-on-secondary" : "bg-lab-bg-surface-elevated border border-slate-700 text-lab-text-primary")} type="button">
{(selectedRole === "engineer" ? "Selected: " : "Prepare for ") + roles["engineer"]}
                </button>
              </div>
            </div>
            <div className="mt-lab-space-2xl">
              <div className="flex items-center justify-between mb-lab-space-base">
                <div>
                  <h3 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary">
                    {"Select Experience Seniority"}
                  </h3>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-muted">
                    {"Assessment depth and log dataset complexity will calibrate to your choice."}
                  </p>
                </div>
                <span className="font-lab-code-block text-lab-code-block text-lab-telemetry-cyan px-2.5 py-1 bg-lab-telemetry-cyan/10 rounded-lab-DEFAULT">
                  {"CALIBRATION: DYNAMIC"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lab-space-base" id="levelSelectorGroup">
                <button className={"level-card cursor-pointer p-lab-space-base rounded-lab-xl transition-all text-left" + (selectedLevel === "entry" ? " border-2 border-lab-telemetry-cyan bg-lab-bg-surface-elevated" : " border border-slate-800 bg-lab-bg-surface")} onClick={() => setSelectedLevel("entry")} aria-pressed={selectedLevel === "entry"} data-level="entry" type="button">
                  <div className="flex items-center justify-between">
                    <span className="font-lab-headline-sm text-lab-headline-sm font-bold text-lab-text-primary">
                      {"Entry Level"}
                    </span>
                    <span className="font-lab-label-caps text-lab-label-caps px-2 py-0.5 rounded-lab-DEFAULT bg-lab-telemetry-cyan/20 text-lab-telemetry-cyan">
                      {"0–2 YEARS"}
                    </span>
                  </div>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary mt-2">
                    {"Core syntax, basic searches, fundamental stats commands, and guided triage questions."}
                  </p>
                </button>
                <button className={"level-card cursor-pointer p-lab-space-base rounded-lab-xl transition-all text-left" + (selectedLevel === "mid" ? " border-2 border-lab-telemetry-cyan bg-lab-bg-surface-elevated" : " border border-slate-800 bg-lab-bg-surface")} onClick={() => setSelectedLevel("mid")} aria-pressed={selectedLevel === "mid"} data-level="mid" type="button">
                  <div className="flex items-center justify-between">
                    <span className="font-lab-headline-sm text-lab-headline-sm font-bold text-lab-text-primary">
                      {"Mid Level"}
                    </span>
                    <span className="font-lab-label-caps text-lab-label-caps px-2 py-0.5 rounded-lab-DEFAULT bg-slate-800 text-lab-text-muted">
                      {"2–5 YEARS"}
                    </span>
                  </div>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary mt-2">
                    {"Correlation rules, advanced subsearches, transaction tracing, and unguided triage."}
                  </p>
                </button>
                <button className={"level-card cursor-pointer p-lab-space-base rounded-lab-xl transition-all text-left" + (selectedLevel === "senior" ? " border-2 border-lab-telemetry-cyan bg-lab-bg-surface-elevated" : " border border-slate-800 bg-lab-bg-surface")} onClick={() => setSelectedLevel("senior")} aria-pressed={selectedLevel === "senior"} data-level="senior" type="button">
                  <div className="flex items-center justify-between">
                    <span className="font-lab-headline-sm text-lab-headline-sm font-bold text-lab-text-primary">
                      {"Senior / Architect"}
                    </span>
                    <span className="font-lab-label-caps text-lab-label-caps px-2 py-0.5 rounded-lab-DEFAULT bg-slate-800 text-lab-text-muted">
                      {"5+ YEARS"}
                    </span>
                  </div>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary mt-2">
                    {"High-volume architecture, index concurrency bottlenecks, security operations strategy."}
                  </p>
                </button>
              </div>
            </div>
            <div className="mt-lab-space-2xl p-lab-space-lg rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800" id="interview-setup">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-lab-space-base pb-lab-space-base border-b border-slate-800/80">
                <div>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-teal uppercase tracking-widest">
                    {"PRE-FLIGHT VERIFICATION BRIEFING"}
                  </span>
                  <h3 className="font-lab-headline-md text-lab-headline-md font-bold text-lab-text-primary mt-1">
                    {"Ready for Assessment Simulation"}
                  </h3>
                </div>
                <div className="flex items-center gap-lab-space-sm">
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-muted">
                    {"TOKEN: #TO-SIM-8942-SEC"}
                  </span>
                  <div className="h-2 w-2 rounded-lab-full bg-lab-status-success animate-ping">
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-lab-space-base py-lab-space-base font-lab-code-block text-lab-code-block border-b border-slate-800/80">
                <div>
                  <div className="text-lab-text-muted text-[11px]">
                    {"TARGET ROLE"}
                  </div>
                  <div className="text-lab-telemetry-cyan font-semibold text-lab-body-md mt-1">
{roles[selectedRole]}
                  </div>
                </div>
                <div>
                  <div className="text-lab-text-muted text-[11px]">
                    {"SENIORITY"}
                  </div>
                  <div className="text-lab-text-primary font-semibold text-lab-body-md mt-1">
{levels[selectedLevel]}
                  </div>
                </div>
                <div>
                  <div className="text-lab-text-muted text-[11px]">
                    {"INTERVIEW ROUND"}
                  </div>
                  <div className="text-lab-text-primary font-semibold text-lab-body-md mt-1">
                    {"10 Questions"}
                  </div>
                </div>
                <div>
                  <div className="text-lab-text-muted text-[11px]">
                    {"TIME PER QUESTION"}
                  </div>
                  <div className="text-lab-status-warning font-semibold text-lab-body-md mt-1">
                    {"75 Seconds"}
                  </div>
                </div>
                <div>
                  <div className="text-lab-text-muted text-[11px]">
                    {"PRACTICAL LAB"}
                  </div>
                  <div className="text-lab-telemetry-teal font-semibold text-lab-body-md mt-1">
                    {"2 Incident Tasks"}
                  </div>
                </div>
                <div>
                  <div className="text-lab-text-muted text-[11px]">
                    {"EST. TOTAL TIME"}
                  </div>
                  <div className="text-lab-text-primary font-semibold text-lab-body-md mt-1">
                    {"25 Minutes"}
                  </div>
                </div>
              </div>
              <div className="mt-lab-space-base flex flex-col md:flex-row items-center justify-between gap-lab-space-base">
                <div className="flex flex-wrap items-center gap-lab-space-base font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lab-status-success text-[16px]">
                      {"check_circle"}
                    </span>
                    {" Automated Proctoring"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lab-status-success text-[16px]">
                      {"check_circle"}
                    </span>
                    {" Code Syntax Verification"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lab-status-success text-[16px]">
                      {"check_circle"}
                    </span>
                    {" Offer Eligibility Tracking"}
                  </span>
                </div>
                <div className="flex items-center gap-lab-space-base w-full md:w-auto">
                  <a className="w-full md:w-auto px-lab-space-xl py-3 rounded-lab-lg bg-gradient-to-r from-lab-primary-container to-lab-accent-electric-blue text-lab-text-primary font-lab-headline-sm text-lab-body-md font-bold shadow-lg shadow-lab-accent-electric-blue/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2" href="#simulator">
                    <span>
                      {"Begin Interview Assessment"}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {"play_arrow"}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-2xl bg-lab-bg-surface-elevated/70 border-t border-slate-800" id="simulator">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-lab-space-sm mb-lab-space-base">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-lab-full bg-lab-status-success">
                  </span>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-status-success">
                    {"ASSESSMENT IN PROGRESS"}
                  </span>
                  <span className="text-lab-text-muted">
                    {"•"}
                  </span>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-text-secondary">
                    {`${roles[selectedRole]} [${selectedLevel}]`.toUpperCase()}
                  </span>
                </div>
                <h2 className="font-lab-headline-md text-lab-headline-md font-bold text-lab-text-primary mt-1">
                  {"Technical Interview Stage"}
                </h2>
              </div>
              <div className="flex items-center gap-lab-space-sm bg-lab-bg-canvas px-4 py-2 rounded-lab-lg border border-slate-800">
                <span className="material-symbols-outlined text-lab-status-warning text-[20px] animate-pulse">
                  {"timer"}
                </span>
                <div className="flex flex-col">
                  <span className="font-lab-label-caps text-[10px] text-lab-text-muted uppercase">
                    {"TIME REMAINING"}
                  </span>
                  <span className="font-lab-code-block text-lab-headline-sm font-bold text-lab-status-warning leading-none" id="interviewTimer">
                    {"01:12"}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lab-xl bg-lab-bg-surface border border-slate-800 shadow-2xl p-lab-space-lg lg:p-lab-space-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                <div className="h-full bg-gradient-to-r from-lab-status-warning to-lab-telemetry-cyan w-[78%] transition-all duration-1000">
                </div>
              </div>
              <div className="flex items-center justify-between pb-lab-space-base border-b border-slate-800/80">
                <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-cyan px-2.5 py-1 rounded-lab-DEFAULT bg-lab-telemetry-cyan/10">
                  {"CATEGORY: SPL STATISTICAL AGGREGATION"}
                </span>
                <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary font-medium">
                  {"QUESTION 04 / 10"}
                </span>
              </div>
              <div className="my-lab-space-lg">
                <h3 className="font-lab-headline-md text-lab-headline-sm lg:text-lab-headline-md font-semibold text-lab-text-primary leading-snug">
                  {" Which command should be used in Splunk to calculate aggregations such as count, sum, and average across events grouped by a specific field? "}
                </h3>
                <p className="font-lab-body-sm text-lab-body-sm text-lab-text-muted mt-2">
                  {" Consider search performance and pipeline optimization best practices. "}
                </p>
              </div>
              <div className="space-y-lab-space-sm" id="mcqOptions">
                <button onClick={() => setSelectedAnswer(0)} aria-pressed={selectedAnswer === 0} className={"w-full text-left cursor-pointer p-lab-space-base rounded-lab-lg transition-all flex items-center justify-between gap-3 " + (selectedAnswer === 0 ? "bg-lab-telemetry-cyan/10 border-2 border-lab-telemetry-cyan" : "bg-lab-bg-surface-elevated border border-slate-800 hover:border-slate-700")} type="button">
                  <div className="flex items-center gap-lab-space-base">
                    <span className="w-8 h-8 rounded-lab-DEFAULT bg-lab-bg-canvas border border-slate-800 font-lab-code-block text-lab-code-block flex items-center justify-center font-bold text-lab-text-secondary">
                      {"A"}
                    </span>
                    <div>
                      <span className="font-lab-code-block text-lab-code-inline text-lab-text-primary font-bold">
                        {"eval"}
                      </span>
                      <span className="font-lab-body-sm text-lab-body-sm text-lab-text-muted ml-2">
                        {"Computes mathematical or boolean expressions on a per-event basis."}
                      </span>
                    </div>
                  </div>
                  <div className={"w-5 h-5 shrink-0 rounded-full border flex items-center justify-center " + (selectedAnswer === 0 ? "bg-lab-telemetry-cyan border-lab-telemetry-cyan text-lab-on-secondary" : "border-slate-700")}>
{selectedAnswer === 0 && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                </button>
                <button onClick={() => setSelectedAnswer(1)} aria-pressed={selectedAnswer === 1} className={"w-full text-left cursor-pointer p-lab-space-base rounded-lab-lg transition-all flex items-center justify-between gap-3 " + (selectedAnswer === 1 ? "bg-lab-telemetry-cyan/10 border-2 border-lab-telemetry-cyan" : "bg-lab-bg-surface-elevated border border-slate-800 hover:border-slate-700")} type="button">
                  <div className="flex items-center gap-lab-space-base">
                    <span className="w-8 h-8 rounded-lab-DEFAULT bg-lab-bg-canvas text-lab-text-secondary font-lab-code-block text-lab-code-block flex items-center justify-center font-bold">
                      {"B"}
                    </span>
                    <div>
                      <span className="font-lab-code-block text-lab-code-inline text-lab-text-primary font-bold">
                        {"stats"}
                      </span>
                      <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary ml-2">
                        {"Aggregates search results to calculate summary metrics by group-by fields."}
                      </span>
                    </div>
                  </div>
                  <div className={"w-5 h-5 shrink-0 rounded-full border flex items-center justify-center " + (selectedAnswer === 1 ? "bg-lab-telemetry-cyan border-lab-telemetry-cyan text-lab-on-secondary" : "border-slate-700")}>
{selectedAnswer === 1 && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                </button>
                <button onClick={() => setSelectedAnswer(2)} aria-pressed={selectedAnswer === 2} className={"w-full text-left cursor-pointer p-lab-space-base rounded-lab-lg transition-all flex items-center justify-between gap-3 " + (selectedAnswer === 2 ? "bg-lab-telemetry-cyan/10 border-2 border-lab-telemetry-cyan" : "bg-lab-bg-surface-elevated border border-slate-800 hover:border-slate-700")} type="button">
                  <div className="flex items-center gap-lab-space-base">
                    <span className="w-8 h-8 rounded-lab-DEFAULT bg-lab-bg-canvas border border-slate-800 font-lab-code-block text-lab-code-block flex items-center justify-center font-bold text-lab-text-secondary">
                      {"C"}
                    </span>
                    <div>
                      <span className="font-lab-code-block text-lab-code-inline text-lab-text-primary font-bold">
                        {"table"}
                      </span>
                      <span className="font-lab-body-sm text-lab-body-sm text-lab-text-muted ml-2">
                        {"Returns only specified fields in tabular format without data aggregation."}
                      </span>
                    </div>
                  </div>
                  <div className={"w-5 h-5 shrink-0 rounded-full border flex items-center justify-center " + (selectedAnswer === 2 ? "bg-lab-telemetry-cyan border-lab-telemetry-cyan text-lab-on-secondary" : "border-slate-700")}>
{selectedAnswer === 2 && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                </button>
                <button onClick={() => setSelectedAnswer(3)} aria-pressed={selectedAnswer === 3} className={"w-full text-left cursor-pointer p-lab-space-base rounded-lab-lg transition-all flex items-center justify-between gap-3 " + (selectedAnswer === 3 ? "bg-lab-telemetry-cyan/10 border-2 border-lab-telemetry-cyan" : "bg-lab-bg-surface-elevated border border-slate-800 hover:border-slate-700")} type="button">
                  <div className="flex items-center gap-lab-space-base">
                    <span className="w-8 h-8 rounded-lab-DEFAULT bg-lab-bg-canvas border border-slate-800 font-lab-code-block text-lab-code-block flex items-center justify-center font-bold text-lab-text-secondary">
                      {"D"}
                    </span>
                    <div>
                      <span className="font-lab-code-block text-lab-code-inline text-lab-text-primary font-bold">
                        {"rex"}
                      </span>
                      <span className="font-lab-body-sm text-lab-body-sm text-lab-text-muted ml-2">
                        {"Performs regular expression matches to extract fields from raw events."}
                      </span>
                    </div>
                  </div>
                  <div className={"w-5 h-5 shrink-0 rounded-full border flex items-center justify-center " + (selectedAnswer === 3 ? "bg-lab-telemetry-cyan border-lab-telemetry-cyan text-lab-on-secondary" : "border-slate-700")}>
{selectedAnswer === 3 && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                </button>
              </div>
              <div className="mt-lab-space-lg pt-lab-space-base border-t border-slate-800/80 flex items-center justify-between">
                <button className="px-4 py-2 rounded-lab-DEFAULT bg-lab-bg-surface-elevated border border-slate-800 text-lab-text-secondary hover:text-lab-text-primary font-lab-body-sm text-lab-body-sm flex items-center gap-1 transition-all" disabled title="Design preview control" type="button">
                  <span className="material-symbols-outlined text-[16px]">
                    {"chevron_left"}
                  </span>
                  <span>
                    {"Previous Question"}
                  </span>
                </button>
                <div className="hidden sm:flex items-center gap-1.5 font-lab-code-block text-lab-code-block text-lab-text-muted">
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-lab-status-success">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-lab-status-success">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-lab-status-success">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-lab-telemetry-cyan ring-2 ring-lab-telemetry-cyan/40">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-slate-800">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-slate-800">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-slate-800">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-slate-800">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-slate-800">
                  </span>
                  <span className="w-2.5 h-2.5 rounded-lab-full bg-slate-800">
                  </span>
                </div>
                <button className="px-5 py-2 rounded-lab-DEFAULT bg-lab-primary-container hover:bg-lab-accent-electric-blue text-lab-text-primary font-lab-body-sm text-lab-body-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-lab-primary-container/20" disabled title="Design preview control" type="button">
                  <span>
                    {"Lock & Next"}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    {"chevron_right"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-2xl bg-lab-bg-canvas border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-lab-space-sm mb-lab-space-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-teal uppercase tracking-widest">
                    {"STAGE 02 // PRACTICAL INVESTIGATION LAB"}
                  </span>
                  <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-danger/10 border border-lab-status-danger/30 text-lab-status-danger font-lab-code-block text-lab-label-caps">
                    {"LIVE INCIDENT ACTIVE"}
                  </span>
                </div>
                <h2 className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-text-primary mt-1">
                  {"SOC Scenario: Credential Storm Triage"}
                </h2>
              </div>
              <div className="flex items-center gap-lab-space-base">
                <div className="bg-lab-bg-surface-elevated px-3 py-1.5 rounded-lab-DEFAULT border border-slate-800 font-lab-code-block text-lab-code-block flex items-center gap-2">
                  <span className="text-lab-text-muted">
                    {"SCORE POOL:"}
                  </span>
                  <span className="text-lab-telemetry-cyan font-bold">
                    {"150 PTS"}
                  </span>
                </div>
                <div className="bg-lab-bg-surface-elevated px-3 py-1.5 rounded-lab-DEFAULT border border-slate-800 font-lab-code-block text-lab-code-block flex items-center gap-2">
                  <span className="text-lab-text-muted">
                    {"SESSION ELAPSED:"}
                  </span>
                  <span className="text-lab-status-warning font-bold">
                    {"06:42"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lab-space-base">
              <div className="lg:col-span-4 flex flex-col gap-lab-space-base">
                <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface border border-slate-800">
                  <div className="flex items-center justify-between pb-lab-space-sm border-b border-slate-800">
                    <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted">
                      {"INCIDENT TICKET #084-SEC"}
                    </span>
                    <span className="font-lab-code-block text-lab-code-block text-lab-status-danger font-semibold">
                      {"SEV-2 ALERT"}
                    </span>
                  </div>
                  <h4 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mt-lab-space-sm">
                    {"Credential Storm Investigation"}
                  </h4>
                  <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary mt-2 leading-relaxed">
                    {" The Identity & Access Gateway detected a critical surge in failed VPN authentications. Investigate the raw telemetry to isolate the offending IP address, enumerate affected users, and confirm whether any compromised credential succeeded. "}
                  </p>
                  <div className="mt-lab-space-base pt-lab-space-base border-t border-slate-800">
                    <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-cyan block mb-2">
                      {"MISSION OBJECTIVES"}
                    </span>
                    <div className="space-y-2 font-lab-body-sm text-lab-body-sm">
                      <div className="flex items-start gap-2 p-2 rounded-lab-DEFAULT bg-lab-status-success/5 border border-lab-status-success/20">
                        <span className="material-symbols-outlined text-lab-status-success text-[18px]">
                          {"check_box"}
                        </span>
                        <span className="text-lab-text-primary text-[13px]">
                          {"01. Identify suspicious VPN auth volume"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lab-DEFAULT bg-lab-status-success/5 border border-lab-status-success/20">
                        <span className="material-symbols-outlined text-lab-status-success text-[18px]">
                          {"check_box"}
                        </span>
                        <span className="text-lab-text-primary text-[13px]">
                          {"02. Enumerate targeted employee accounts"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lab-DEFAULT bg-lab-telemetry-cyan/10 border border-lab-telemetry-cyan/40">
                        <span className="material-symbols-outlined text-lab-telemetry-cyan text-[18px]">
                          {"radio_button_checked"}
                        </span>
                        <span className="text-lab-telemetry-cyan font-medium text-[13px]">
                          {"03. Isolate the primary source IP address (Active)"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lab-DEFAULT bg-lab-bg-surface-elevated border border-slate-800 opacity-60">
                        <span className="material-symbols-outlined text-lab-text-muted text-[18px]">
                          {"check_box_outline_blank"}
                        </span>
                        <span className="text-lab-text-muted text-[13px]">
                          {"04. Confirm if any account login succeeded"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-lab-space-base pt-lab-space-sm border-t border-slate-800">
                    <div className="flex justify-between font-lab-code-block text-lab-code-block text-lab-text-muted mb-1">
                      <span>
                        {"LAB COMPLETION"}
                      </span>
                      <span className="text-lab-telemetry-cyan font-bold">
                        {"50%"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-lab-full overflow-hidden">
                      <div className="h-full bg-lab-telemetry-cyan w-1/2">
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface border border-slate-800">
                  <details className="group cursor-pointer">
                    <summary className="flex items-center justify-between font-lab-headline-sm text-lab-body-md font-semibold text-lab-text-primary list-none">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lab-status-warning text-[18px]">
                          {"lightbulb"}
                        </span>
                        <span>
                          {"SPL Syntax Reference / Hints"}
                        </span>
                      </span>
                      <span className="material-symbols-outlined text-lab-text-muted text-[18px] group-open:rotate-180 transition-transform">
                        {"expand_more"}
                      </span>
                    </summary>
                    <div className="mt-lab-space-base text-lab-text-secondary font-lab-code-block text-lab-code-block space-y-2 border-t border-slate-800 pt-lab-space-sm">
                      <div className="p-2 rounded-lab-DEFAULT bg-lab-bg-canvas text-lab-telemetry-cyan">
                        {" stats count by src_ip user status "}
                      </div>
                      <div className="p-2 rounded-lab-DEFAULT bg-lab-bg-canvas text-lab-text-muted">
                        {" where count > 50 | sort - count "}
                      </div>
                      <p className="font-lab-body-sm text-lab-body-sm text-lab-text-muted">
                        {"Hint: Filter for "}
                        <code className="text-lab-telemetry-cyan">
                          {"sourcetype=\"cisco:vpn\""}
                        </code>
                        {" to inspect session renegotiation handshakes."}
                      </p>
                    </div>
                  </details>
                </div>
              </div>
              <div className="lg:col-span-8 flex flex-col rounded-lab-xl bg-[#05070B] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="px-lab-space-base py-2.5 bg-lab-bg-surface-elevated border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-lab-space-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-lab-full bg-lab-status-danger/70">
                      </span>
                      <span className="w-3 h-3 rounded-lab-full bg-lab-status-warning/70">
                      </span>
                      <span className="w-3 h-3 rounded-lab-full bg-lab-status-success/70">
                      </span>
                    </div>
                    <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary font-medium ml-2">
                      {"SPLUNK WEB SEARCH TERMINAL // SH-01.PROD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-lab-code-block text-lab-label-caps text-lab-telemetry-teal">
                    <span className="w-2 h-2 rounded-lab-full bg-lab-telemetry-teal animate-pulse">
                    </span>
                    <span>
                      {"INDEX: security_auth"}
                    </span>
                  </div>
                </div>
                <div className="p-lab-space-base bg-[#090D14] border-b border-slate-800/80">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 font-lab-code-block text-lab-code-inline text-lab-telemetry-cyan font-bold">
                        {">"}
                      </span>
                      <input className="w-full pl-8 pr-3 py-2 bg-lab-bg-canvas rounded-lab-DEFAULT border border-slate-800 focus:border-lab-telemetry-cyan focus:outline-none text-lab-text-primary font-lab-code-block text-lab-code-inline" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="SPL search query" id="splQueryInput" type="text" />
                    </div>
                    <div className="flex gap-2">
                      <select className="bg-lab-bg-surface border border-slate-800 text-lab-text-secondary font-lab-code-block text-lab-code-block rounded-lab-DEFAULT px-3 py-2 focus:outline-none" aria-label="Search time range">
                        <option>
                          {"Last 24 Hours"}
                        </option>
                        <option>
                          {"Last 7 Days"}
                        </option>
                        <option>
                          {"Real-Time (1m window)"}
                        </option>
                      </select>
                      <button className="px-4 py-2 rounded-lab-DEFAULT bg-lab-telemetry-teal hover:bg-lab-telemetry-teal/80 text-lab-on-secondary font-lab-code-block text-lab-code-block font-bold flex items-center gap-1.5 shadow-md shadow-lab-telemetry-teal/20 transition-all" onClick={runSearch} disabled={searching} aria-live="polite" id="runSearchBtn" type="button">
<span className="material-symbols-outlined text-[16px]">{searching ? "refresh" : "play_arrow"}</span><span>{searching ? "Executing..." : "Search"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-lab-space-base mt-lab-space-base font-lab-code-block text-lab-code-block">
                    <button className="text-lab-text-muted hover:text-lab-text-primary py-1" disabled title="Design preview control" type="button">
                      {"Events (1,482)"}
                    </button>
                    <button className="text-lab-telemetry-cyan border-b-2 border-lab-telemetry-cyan py-1 font-semibold flex items-center gap-1" disabled title="Design preview control" type="button">
                      <span>
                        {"Statistics"}
                      </span>
                      <span className="px-1.5 py-[0.05rem] bg-lab-telemetry-cyan/20 rounded-lab-DEFAULT text-[10px]">
                        {"4"}
                      </span>
                    </button>
                    <button className="text-lab-text-muted hover:text-lab-text-primary py-1" disabled title="Design preview control" type="button">
                      {"Visualization"}
                    </button>
                    <div className="ml-auto text-lab-text-muted text-[11px]">
                      {"Returned 4 rows in 0.048 seconds"}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto flex-1 p-lab-space-base">
                  <table className="w-full text-left font-lab-code-block text-lab-code-block">
                    <thead>
                      <tr className="border-b border-slate-800 text-lab-text-muted text-[11px] uppercase tracking-wider">
                        <th className="pb-2">
                          {"#"}
                        </th>
                        <th className="pb-2">
                          {"src_ip"}
                        </th>
                        <th className="pb-2">
                          {"user"}
                        </th>
                        <th className="pb-2">
                          {"action"}
                        </th>
                        <th className="pb-2 text-right">
                          {"count"}
                        </th>
                        <th className="pb-2 text-right">
                          {"Verdict"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-lab-text-secondary">
                      <tr className="hover:bg-lab-bg-surface-elevated/80 transition-colors bg-lab-status-danger/5">
                        <td className="py-2.5 text-lab-text-muted">
                          {"1"}
                        </td>
                        <td className="py-2.5 font-bold text-lab-status-danger">
                          {"198.51.100.42"}
                        </td>
                        <td className="py-2.5 text-lab-text-primary">
                          {"jdoe_admin"}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-danger/20 text-lab-status-danger text-[11px]">
                            {"REJECTED"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-lab-text-primary">
                          {"318"}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="text-lab-status-danger font-medium">
                            {"SUSPICIOUS // ATTACK SOURCE"}
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-lab-bg-surface-elevated/80 transition-colors bg-lab-status-danger/5">
                        <td className="py-2.5 text-lab-text-muted">
                          {"2"}
                        </td>
                        <td className="py-2.5 font-bold text-lab-status-danger">
                          {"198.51.100.42"}
                        </td>
                        <td className="py-2.5 text-lab-text-primary">
                          {"svc_splunk_indexer"}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-danger/20 text-lab-status-danger text-[11px]">
                            {"REJECTED"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-bold text-lab-text-primary">
                          {"142"}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="text-lab-status-danger font-medium">
                            {"BRUTE-FORCE TARGET"}
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-lab-bg-surface-elevated/80 transition-colors">
                        <td className="py-2.5 text-lab-text-muted">
                          {"3"}
                        </td>
                        <td className="py-2.5 text-lab-text-primary">
                          {"192.0.2.14"}
                        </td>
                        <td className="py-2.5 text-lab-text-primary">
                          {"m.rossi"}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-success/20 text-lab-status-success text-[11px]">
                            {"SUCCESS"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-lab-text-primary">
                          {"3"}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="text-lab-status-success">
                            {"BENIGN USER"}
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-lab-bg-surface-elevated/80 transition-colors">
                        <td className="py-2.5 text-lab-text-muted">
                          {"4"}
                        </td>
                        <td className="py-2.5 text-lab-text-primary">
                          {"203.0.113.88"}
                        </td>
                        <td className="py-2.5 text-lab-text-primary">
                          {"c_davis"}
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-success/20 text-lab-status-success text-[11px]">
                            {"SUCCESS"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-lab-text-primary">
                          {"1"}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="text-lab-status-success">
                            {"BENIGN USER"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-lab-space-base bg-lab-bg-surface border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-lab-space-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lab-text-muted font-lab-body-sm text-lab-body-sm">
                      {"Detected Malicious Source IP:"}
                    </span>
                    <input className="px-3 py-1 bg-lab-bg-canvas border border-lab-telemetry-cyan text-lab-telemetry-cyan rounded-lab-DEFAULT font-lab-code-block text-lab-code-block focus:outline-none w-40 text-center font-bold" value={answer} onChange={(event) => setAnswer(event.target.value)} aria-label="Detected malicious source IP" type="text" />
                  </div>
                  <button className="w-full sm:w-auto px-lab-space-base py-2 rounded-lab-DEFAULT bg-lab-status-success hover:bg-lab-status-success/80 text-lab-on-primary font-lab-headline-sm text-lab-body-md font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-lab-status-success/20" onClick={() => setLabFeedback(answer.trim() === "198.51.100.42" ? "Verified (150 Pts)" : "Check the suspicious source IP and try again.")} aria-live="polite" id="submitLabAnswerBtn" type="button">
<span className="material-symbols-outlined text-[18px]">verified</span><span>{labFeedback || "Submit Objective & Advance"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-2xl bg-lab-bg-surface-elevated border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="p-lab-space-xl rounded-lab-xl bg-lab-bg-surface border border-slate-800 relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-lab-status-success/5 rounded-lab-full blur-3xl pointer-events-none">
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-lab-space-lg pb-lab-space-lg border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-lab-label-caps text-lab-label-caps px-2.5 py-1 rounded-lab-DEFAULT bg-lab-status-success/15 border border-lab-status-success/30 text-lab-status-success font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {"check_circle"}
                      </span>
                      <span>
                        {"BENCHMARK PASSED // STRONG CANDIDATE"}
                      </span>
                    </span>
                    <span className="font-lab-code-block text-lab-code-block text-lab-text-muted">
                      {"SESSION ID: #EV-2026-993"}
                    </span>
                  </div>
                  <h2 className="font-lab-headline-xl text-lab-headline-lg lg:text-lab-headline-xl font-bold text-lab-text-primary">
                    {"Performance Evaluation Scorecard"}
                  </h2>
                  <p className="font-lab-body-md text-lab-body-md text-lab-text-secondary mt-1">
                    {"Role: Splunk Analyst (Entry Level) • Completed in 22 min 14 sec"}
                  </p>
                </div>
                <div className="flex items-center gap-lab-space-base bg-lab-bg-surface-elevated p-lab-space-base rounded-lab-xl border border-slate-800">
                  <div className="text-right">
                    <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted block">
                      {"COMPOSITE RATING"}
                    </span>
                    <span className="font-lab-display-hero text-lab-headline-xl font-extrabold text-lab-status-success">
                      {"82"}
                      <span className="text-lab-text-muted text-lab-headline-md font-normal">
                        {"/100"}
                      </span>
                    </span>
                  </div>
                  <div className="h-12 w-px bg-slate-800">
                  </div>
                  <div className="flex flex-col">
                    <span className="font-lab-code-block text-lab-code-block text-lab-telemetry-cyan font-bold">
                      {"TOP 12%"}
                    </span>
                    <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                      {"Of Simulated Candidates"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-lab-space-base py-lab-space-lg border-b border-slate-800">
                <div>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted block">
                    {"TECHNICAL INTERVIEW"}
                  </span>
                  <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-text-primary mt-1 block">
                    {"8 "}
                    <span className="text-lab-text-muted text-lab-body-md font-normal">
                      {"/ 10 Correct"}
                    </span>
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-status-success">
                    {"80% Accuracy"}
                  </span>
                </div>
                <div>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted block">
                    {"HANDS-ON SOC LAB"}
                  </span>
                  <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-telemetry-cyan mt-1 block">
                    {"17 "}
                    <span className="text-lab-text-muted text-lab-body-md font-normal">
                      {"/ 20 Scored"}
                    </span>
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-telemetry-cyan">
                    {"85% Objectives Met"}
                  </span>
                </div>
                <div>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted block">
                    {"AVG RESPONSE VELOCITY"}
                  </span>
                  <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-text-primary mt-1 block">
                    {"42.4s"}
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-text-secondary">
                    {"Well under 75s cap"}
                  </span>
                </div>
                <div>
                  <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted block">
                    {"HIRING INDEX"}
                  </span>
                  <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-status-success mt-1 block">
                    {"STRONG HIRE"}
                  </span>
                  <span className="font-lab-code-block text-lab-code-block text-lab-status-success">
                    {"Cleared Interview Bar"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lab-space-xl pt-lab-space-lg">
                <div>
                  <h4 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mb-lab-space-base">
                    {"Skill Vector Breakdown"}
                  </h4>
                  <div className="space-y-lab-space-base">
                    <div>
                      <div className="flex justify-between font-lab-code-block text-lab-code-block mb-1">
                        <span className="text-lab-text-secondary">
                          {"SPL Syntax & Grouping (stats, eval)"}
                        </span>
                        <span className="text-lab-status-success font-bold">
                          {"90%"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-lab-bg-surface-elevated rounded-lab-full overflow-hidden">
                        <div className="h-full bg-lab-status-success w-[90%]">
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-lab-code-block text-lab-code-block mb-1">
                        <span className="text-lab-text-secondary">
                          {"Incident Triage & Authentication Logs"}
                        </span>
                        <span className="text-lab-telemetry-cyan font-bold">
                          {"82%"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-lab-bg-surface-elevated rounded-lab-full overflow-hidden">
                        <div className="h-full bg-lab-telemetry-cyan w-[82%]">
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-lab-code-block text-lab-code-block mb-1">
                        <span className="text-lab-text-secondary">
                          {"Search Pipeline Optimization"}
                        </span>
                        <span className="text-lab-status-warning font-bold">
                          {"74%"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-lab-bg-surface-elevated rounded-lab-full overflow-hidden">
                        <div className="h-full bg-lab-status-warning w-[74%]">
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-lab-code-block text-lab-code-block mb-1">
                        <span className="text-lab-text-secondary">
                          {"Security Investigation Methodology"}
                        </span>
                        <span className="text-lab-primary font-bold">
                          {"85%"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-lab-bg-surface-elevated rounded-lab-full overflow-hidden">
                        <div className="h-full bg-lab-primary w-[85%]">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-lab-space-sm">
                  <h4 className="font-lab-headline-sm text-lab-headline-sm font-semibold text-lab-text-primary mb-lab-space-base">
                    {"Proctor Evaluation Notes"}
                  </h4>
                  <div className="p-lab-space-base rounded-lab-lg bg-lab-bg-surface-elevated border border-slate-800">
                    <span className="font-lab-code-block text-lab-label-caps text-lab-status-success font-bold flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-[16px]">
                        {"thumb_up"}
                      </span>
                      {" KEY STRENGTH "}
                    </span>
                    <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                      {"Candidate demonstrated fluent knowledge of streaming commands vs. non-streaming transformations, minimizing memory load in search pipelines."}
                    </p>
                  </div>
                  <div className="p-lab-space-base rounded-lab-lg bg-lab-bg-surface-elevated border border-slate-800">
                    <span className="font-lab-code-block text-lab-label-caps text-lab-status-warning font-bold flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-[16px]">
                        {"trending_up"}
                      </span>
                      {" RECOMMENDED FOCUS "}
                    </span>
                    <p className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                      {"Practice subsearch duration limits and data model acceleration syntax before advancing to Mid-Level SOC Analyst scenarios."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-2xl bg-lab-bg-canvas relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-lab-primary-container/5 to-transparent pointer-events-none">
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="rounded-2xl bg-gradient-to-b from-[#121927] to-lab-bg-surface-elevated border-2 border-lab-telemetry-cyan/40 p-lab-space-xl lg:p-lab-space-2xl shadow-2xl shadow-lab-telemetry-cyan/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-lab-space-base pb-lab-space-lg border-b border-slate-800">
                <div className="flex items-center gap-lab-space-base">
                  <img className="h-10 w-auto object-contain" src={logo} alt="T.O. Analytics" />
                  <div>
                    <span className="font-lab-label-caps text-lab-label-caps text-lab-telemetry-cyan uppercase tracking-widest">
                      {"OFFICIAL TALENT PIPELINE // CREDENTIAL #TO-8894"}
                    </span>
                    <h3 className="font-lab-headline-md text-lab-headline-md font-bold text-lab-text-primary">
                      {"Virtual Employment Assessment Clearance"}
                    </h3>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-lab-full bg-lab-status-success/15 border border-lab-status-success/40 text-lab-status-success font-lab-label-caps text-lab-label-caps font-bold">
                  {" OFFER ELIGIBLE "}
                </div>
              </div>
              <div className="py-lab-space-xl space-y-lab-space-base">
                <p className="font-lab-headline-sm text-lab-headline-sm font-medium text-lab-text-primary">
                  {" Congratulations, Candidate. "}
                </p>
                <p className="font-lab-body-lg text-lab-body-lg text-lab-text-secondary leading-relaxed">
                  {" Based on your technical screening score of "}
                  <strong className="text-lab-status-success">
                    {"82/100"}
                  </strong>
                  {" and successful resolution of the SOC incident triage lab, you have officially satisfied the hiring benchmark for the following virtual position: "}
                </p>
                <div className="p-lab-space-lg rounded-lab-xl bg-lab-bg-surface border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-lab-space-base font-lab-code-block text-lab-code-block">
                  <div>
                    <span className="text-lab-text-muted text-[11px] block">
                      {"ROLE CLEARANCE"}
                    </span>
                    <span className="text-lab-telemetry-cyan font-bold text-lab-headline-sm mt-1 block">
                      {"Junior Splunk Analyst"}
                    </span>
                    <span className="text-lab-text-secondary text-[12px]">
                      {"T.O. Skill Lab Division"}
                    </span>
                  </div>
                  <div>
                    <span className="text-lab-text-muted text-[11px] block">
                      {"COHORT GROUP"}
                    </span>
                    <span className="text-lab-text-primary font-bold text-lab-headline-sm mt-1 block">
                      {"2026-Q2 Operations"}
                    </span>
                    <span className="text-lab-text-secondary text-[12px]">
                      {"Cyber Defense Sandbox"}
                    </span>
                  </div>
                  <div>
                    <span className="text-lab-text-muted text-[11px] block">
                      {"STATUS"}
                    </span>
                    <span className="text-lab-status-success font-bold text-lab-headline-sm mt-1 block">
                      {"Offer Ready"}
                    </span>
                    <span className="text-lab-text-secondary text-[12px]">
                      {"Candidate Pool Activated"}
                    </span>
                  </div>
                </div>
                <p className="font-lab-body-sm text-lab-body-sm text-lab-text-muted italic">
                  {" This verification credential affirms that your search construction, incident triage response, and data investigation methodology meet professional standards. "}
                </p>
              </div>
              <div className="pt-lab-space-base border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-lab-space-base">
                <div className="flex items-center gap-2 text-lab-text-muted font-lab-code-block text-lab-code-block text-[12px]">
                  <span className="material-symbols-outlined text-[16px] text-lab-telemetry-teal">
                    {"lock"}
                  </span>
                  <span>
                    {"Cryptographically Verified Simulation Signature"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-lab-space-sm w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-lab-space-base py-3 rounded-lab-lg bg-lab-bg-surface border border-slate-700 hover:border-slate-600 text-lab-text-primary font-lab-body-sm text-lab-body-sm font-semibold transition-all flex items-center justify-center gap-2" disabled title="Design preview control" type="button">
                    <span className="material-symbols-outlined text-[18px]">
                      {"download"}
                    </span>
                    <span>
                      {"Download Digital Offer PDF"}
                    </span>
                  </button>
                  <a className="w-full sm:w-auto px-lab-space-lg py-3 rounded-lab-lg bg-lab-telemetry-cyan text-lab-on-secondary font-lab-headline-sm text-lab-body-md font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-lab-telemetry-cyan/20" href="#role-tracks">
                    <span>
                      {"Advance to Mid-Level Track"}
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {"arrow_forward"}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full px-4 lg:px-8 py-lab-space-2xl bg-lab-bg-surface border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-lab-space-sm mb-lab-space-xl">
              <div>
                <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted uppercase tracking-widest">
                  {"RECORD OF ATTEMPTS"}
                </span>
                <h2 className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-text-primary mt-1">
                  {"Candidate Simulation Audit Log"}
                </h2>
              </div>
              <div className="flex items-center gap-lab-space-sm">
                <a className="px-4 py-2 rounded-lab-DEFAULT bg-lab-primary-container text-lab-text-primary font-lab-body-sm text-lab-body-sm font-semibold hover:bg-lab-accent-electric-blue transition-all flex items-center gap-1.5" href="#interview-setup">
                  <span className="material-symbols-outlined text-[18px]">
                    {"restart_alt"}
                  </span>
                  <span>
                    {"New Simulation Run"}
                  </span>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-lab-space-base mb-lab-space-xl">
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800">
                <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted">
                  {"BEST SCORE"}
                </span>
                <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-status-success block mt-1">
                  {"82%"}
                </span>
                <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                  {"Splunk Analyst Track"}
                </span>
              </div>
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800">
                <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted">
                  {"INTERVIEWS COMPLETED"}
                </span>
                <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-text-primary block mt-1">
                  {"3"}
                </span>
                <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                  {"30 Total Questions"}
                </span>
              </div>
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800">
                <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted">
                  {"LABS SOLVED"}
                </span>
                <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-telemetry-cyan block mt-1">
                  {"5"}
                </span>
                <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                  {"All Severities Solved"}
                </span>
              </div>
              <div className="p-lab-space-base rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800">
                <span className="font-lab-label-caps text-lab-label-caps text-lab-text-muted">
                  {"CURRENT STANDING"}
                </span>
                <span className="font-lab-headline-lg text-lab-headline-lg font-bold text-lab-status-success block mt-1">
                  {"STRONG HIRE"}
                </span>
                <span className="font-lab-body-sm text-lab-body-sm text-lab-text-secondary">
                  {"Cleared Threshold"}
                </span>
              </div>
            </div>
            <div className="rounded-lab-xl bg-lab-bg-surface-elevated border border-slate-800 overflow-x-auto">
              <table className="w-full text-left font-lab-body-sm text-lab-body-sm">
                <thead>
                  <tr className="border-b border-slate-800 font-lab-label-caps text-lab-label-caps text-lab-text-muted bg-lab-bg-canvas/50">
                    <th className="p-lab-space-base">
                      {"ROLE TRACK"}
                    </th>
                    <th className="p-lab-space-base">
                      {"LEVEL"}
                    </th>
                    <th className="p-lab-space-base">
                      {"INTERVIEW"}
                    </th>
                    <th className="p-lab-space-base">
                      {"LAB PTS"}
                    </th>
                    <th className="p-lab-space-base">
                      {"TOTAL"}
                    </th>
                    <th className="p-lab-space-base">
                      {"OUTCOME"}
                    </th>
                    <th className="p-lab-space-base text-right">
                      {"DATE"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-lab-code-block text-lab-code-block">
                  <tr className="hover:bg-lab-bg-surface-hover transition-colors">
                    <td className="p-lab-space-base font-semibold text-lab-text-primary">
                      {"Splunk Analyst"}
                    </td>
                    <td className="p-lab-space-base text-lab-text-secondary">
                      {"Entry Level"}
                    </td>
                    <td className="p-lab-space-base text-lab-status-success">
                      {"8/10 (80%)"}
                    </td>
                    <td className="p-lab-space-base text-lab-telemetry-cyan">
                      {"17/20 (85%)"}
                    </td>
                    <td className="p-lab-space-base font-bold text-lab-status-success">
                      {"82%"}
                    </td>
                    <td className="p-lab-space-base">
                      <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-success/15 text-lab-status-success text-[11px] font-bold">
                        {"OFFER EXTENDED"}
                      </span>
                    </td>
                    <td className="p-lab-space-base text-right text-lab-text-muted">
                      {"Today, 14:28"}
                    </td>
                  </tr>
                  <tr className="hover:bg-lab-bg-surface-hover transition-colors">
                    <td className="p-lab-space-base font-semibold text-lab-text-primary">
                      {"Splunk Analyst"}
                    </td>
                    <td className="p-lab-space-base text-lab-text-secondary">
                      {"Entry Level"}
                    </td>
                    <td className="p-lab-space-base text-lab-status-warning">
                      {"6/10 (60%)"}
                    </td>
                    <td className="p-lab-space-base text-lab-status-warning">
                      {"14/20 (70%)"}
                    </td>
                    <td className="p-lab-space-base font-bold text-lab-status-warning">
                      {"65%"}
                    </td>
                    <td className="p-lab-space-base">
                      <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-warning/15 text-lab-status-warning text-[11px] font-bold">
                        {"RETRY RECOMMENDED"}
                      </span>
                    </td>
                    <td className="p-lab-space-base text-right text-lab-text-muted">
                      {"Yesterday, 19:10"}
                    </td>
                  </tr>
                  <tr className="hover:bg-lab-bg-surface-hover transition-colors">
                    <td className="p-lab-space-base font-semibold text-lab-text-primary">
                      {"SOC Analyst"}
                    </td>
                    <td className="p-lab-space-base text-lab-text-secondary">
                      {"Entry Level"}
                    </td>
                    <td className="p-lab-space-base text-lab-status-danger">
                      {"5/10 (50%)"}
                    </td>
                    <td className="p-lab-space-base text-lab-status-warning">
                      {"12/20 (60%)"}
                    </td>
                    <td className="p-lab-space-base font-bold text-lab-status-danger">
                      {"55%"}
                    </td>
                    <td className="p-lab-space-base">
                      <span className="px-2 py-0.5 rounded-lab-DEFAULT bg-lab-status-danger/15 text-lab-status-danger text-[11px] font-bold">
                        {"NOT CLEARED"}
                      </span>
                    </td>
                    <td className="p-lab-space-base text-right text-lab-text-muted">
                      {"Apr 18, 2026"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
    <footer className="w-full bg-lab-bg-surface border-t border-slate-800/80 py-lab-space-xl">
      <div className="w-full px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-lab-space-base font-lab-body-sm text-lab-body-sm text-lab-text-muted">
        <div className="flex items-center gap-lab-space-sm">
          <span className="font-lab-label-caps text-lab-label-caps text-lab-text-secondary">
            {"T.O. SKILL LAB PLATFORM"}
          </span>
          <span>
            {"•"}
          </span>
          <span>
            {"Mission-Critical Evaluation Suite"}
          </span>
        </div>
        <div className="flex items-center gap-lab-space-base">
          <a className="hover:text-lab-on-surface transition-colors" href="#role-tracks">
            {"Architecture Telemetry"}
          </a>
          <a className="hover:text-lab-on-surface transition-colors" href="#role-tracks">
            {"SOC Scenarios"}
          </a>
          <a className="hover:text-lab-on-surface transition-colors" href="#role-tracks">
            {"Privacy & Compliance"}
          </a>
        </div>
      </div>
    </footer>
    </div>
  );
}
