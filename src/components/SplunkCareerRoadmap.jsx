import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Search,
  BarChart3,
  Bell,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

/**
 * ✅ Upgraded Splunk Career Roadmap
 * - Multi-path: SOC / Engineer(Admin) / Dashboard
 * - Locked progression (gamified)
 * - Track completion (per path) + localStorage persistence
 * - Each level includes: Skills, Tools, Roles, Project, Scenario, Certs, Portfolio
 * - Clean UI + Progress bar + Reset
 */

// ---------- PATH DEFINITIONS ----------
const careerPaths = {
  all: {
    key: "all",
    label: "Full Track",
    subtitle: "Learn everything (best for beginners)",
    icon: Layers,
    gradient: "from-slate-600 to-slate-800",
  },
  soc: {
    key: "soc",
    label: "SOC Analyst",
    subtitle: "Threat hunting & detections",
    icon: ShieldCheck,
    gradient: "from-red-600 to-rose-700",
  },
  engineer: {
    key: "engineer",
    label: "Splunk Engineer",
    subtitle: "Admin, knowledge engineering, scale",
    icon: Database,
    gradient: "from-indigo-500 to-violet-600",
  },
  dashboard: {
    key: "dashboard",
    label: "Dashboard Engineer",
    subtitle: "Dashboards, KPIs, observability",
    icon: BarChart3,
    gradient: "from-emerald-500 to-teal-600",
  },
};

// ---------- ROADMAP DATA ----------
const roadmap = [
  {
    level: 1,
    title: "Splunk Fundamentals",
    icon: Database,
    color: "from-cyan-500 to-blue-600",
    description: "Understand Splunk architecture & data flow",
    paths: ["all", "soc", "engineer", "dashboard"],
    items: [
      "What is Splunk? Use cases",
      "Indexer vs Search Head",
      "Forwarders (UF/HF)",
      "Apps vs Add-ons (TA)",
      "Data onboarding basics",
    ],
    skills: ["Architecture basics", "Data onboarding", "Troubleshooting mindset"],
    tools: ["Splunk Enterprise", "Forwarder", "Monitoring Console"],
    jobs: ["Junior Splunk User", "SOC Intern (Splunk)", "IT Analyst"],
    project:
      "Ingest Linux auth logs + Splunk _internal and explain the data pipeline in your own words.",
    certs: ["Splunk Core User (prep)"],
    portfolio: ["Data onboarding notes (PDF)", "Architecture diagram"],
  },
  {
    level: 2,
    title: "SPL Essentials",
    icon: Search,
    color: "from-purple-500 to-fuchsia-600",
    description: "Search, transform and analyze machine data",
    paths: ["all", "soc", "engineer", "dashboard"],
    items: [
      "search + filtering",
      "stats, chart, timechart",
      "eval + case",
      "rex (regex extraction)",
      "dedup, sort, transaction (when needed)",
    ],
    skills: ["Query thinking", "Time-series analysis", "Field extraction"],
    tools: ["Search app", "SPL", "Field Extractor"],
    jobs: ["Splunk Power User", "SOC Analyst (junior)", "NOC Analyst"],
    project:
      "Build 5 SPL searches: login failures, top IPs, hourly trend, geo breakdown (if available), anomaly-like spikes.",
    certs: ["Splunk Core User"],
    portfolio: ["SPL library (10 searches)", "Screenshots of results"],
  },
  {
    level: 3,
    title: "Dashboards & UX",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-600",
    description: "Build dashboards that people actually use",
    paths: ["all", "dashboard", "soc"],
    items: [
      "Dashboard Studio vs Classic XML",
      "Panels & visualizations",
      "Inputs + tokens",
      "Drilldowns",
      "Dashboard best practices (clarity, speed, intent)",
    ],
    skills: ["Data storytelling", "KPI design", "Token logic", "Performance habits"],
    tools: ["Dashboard Studio", "Classic Dashboards", "Tokens"],
    jobs: ["Dashboard Engineer", "SOC Analyst (dashboards)", "Observability Analyst"],
    project:
      "Create a SOC Overview dashboard: Auth failures trend, top users, top IPs, suspicious spikes, drilldown to raw events.",
    certs: ["Splunk Power User (prep)"],
    portfolio: ["SOC Dashboard export (PDF)", "Dashboard screenshots"],
  },
  {
    level: 4,
    title: "Alerts & Scheduling",
    icon: Bell,
    color: "from-orange-500 to-red-600",
    description: "Detect problems automatically",
    paths: ["all", "soc", "engineer"],
    items: [
      "Scheduled vs real-time alerts",
      "Thresholds & trigger conditions",
      "Alert actions (email/webhook/log event)",
      "Notable patterns (SOC style)",
      "Maintenance windows & noise reduction",
    ],
    skills: ["Detection logic", "Signal vs noise", "Automation thinking"],
    tools: ["Alerts", "Reports", "Scheduled searches"],
    jobs: ["SOC Analyst", "Monitoring Engineer", "Splunk Engineer"],
    project:
      "Build 3 alerts: brute-force attempt, impossible travel (if geo exists), privilege escalation pattern.",
    scenario: {
      title: "Brute Force Attack Detected",
      description:
        "Multiple failed logins from a single IP across many users. Your job is to identify attacker IP, impacted users, and build an alert.",
      studentTasks: [
        "Find attacker IP(s)",
        "Count failed attempts per user",
        "Detect any successful login after failures",
        "Create a scheduled alert with meaningful threshold",
      ],
    },
    certs: ["Splunk Power User (prep)"],
    portfolio: ["Alert rules export", "Detection write-up (1 page)"],
  },
  {
    level: 5,
    title: "Knowledge Objects",
    icon: Layers,
    color: "from-indigo-500 to-violet-600",
    description: "Make your work reusable & scalable",
    paths: ["all", "engineer", "soc", "dashboard"],
    items: [
      "Lookups (CSV, KV Store basics)",
      "Event types",
      "Tags",
      "Macros",
      "Field extractions (props/transforms concept)",
    ],
    skills: ["Reusable engineering", "Standardization", "Scale & maintainability"],
    tools: ["Lookups", "KV Store", "Macros", "Knowledge Manager"],
    jobs: ["Splunk Engineer", "Splunk Admin (junior)", "Detection Engineer (junior)"],
    project:
      "Create a lookup for approved admin IPs, a macro for login failures, and a reusable event type for suspicious auth.",
    certs: ["Splunk Admin (prep)"],
    portfolio: ["Macro + lookup pack", "Reusable SPL patterns"],
  },
  {
    level: 6,
    title: "SOC / Threat Hunting Track",
    icon: ShieldCheck,
    color: "from-red-600 to-rose-700",
    description: "Investigate threats using Splunk like a pro",
    paths: ["all", "soc"],
    items: [
      "Authentication attacks",
      "Privilege escalation indicators",
      "Lateral movement signals",
      "Persistence patterns",
      "Hunt workflow (hypothesis → query → evidence → report)",
    ],
    skills: ["Investigation", "Threat hunting", "Evidence building", "Reporting"],
    tools: ["Correlation ideas", "Notables mindset", "Dashboards + Alerts"],
    jobs: ["SOC Analyst", "Threat Hunter (junior)", "Security Analyst"],
    project:
      "Investigate a simulated incident: identify timeline, attacker behavior, and produce a short incident report.",
    scenario: {
      title: "Suspicious Admin Activity",
      description:
        "A normal user suddenly shows admin-like actions. You must prove (with logs) what happened and when.",
      studentTasks: [
        "Build a timeline of actions",
        "Identify the first suspicious event",
        "Find related IP(s) + impacted systems",
        "Write a 1-page incident summary",
      ],
    },
    certs: ["Security specialization (portfolio-based)"],
    portfolio: ["Incident report (PDF)", "Hunting queries set"],
  },
];

// ---------- HELPERS ----------
const storageKey = "splunk_roadmap_progress_v1";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SplunkCareerRoadmapMap() {
  const [active, setActive] = useState(null); // index of open card
  const [path, setPath] = useState("all"); // selected path key
  const [progress, setProgress] = useState({
    all: 0,
    soc: 0,
    engineer: 0,
    dashboard: 0,
  });

  // Load progress
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        setProgress((p) => ({ ...p, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const filtered = useMemo(() => {
    // Show everything for "all", otherwise show shared fundamentals + selected path items
    return roadmap.filter((x) => x.paths.includes("all") || x.paths.includes(path));
  }, [path]);

  // completion is "highest completed level" in the chosen path
  const completedLevel = progress[path] ?? 0;

  const totalLevels = filtered.length;
  const completedCount = clamp(
    filtered.filter((x) => x.level <= completedLevel).length,
    0,
    totalLevels
  );
  const percent = totalLevels ? Math.round((completedCount / totalLevels) * 100) : 0;

  const PathIcon = careerPaths[path]?.icon || Layers;

  const markCompleted = (level) => {
    setProgress((p) => ({
      ...p,
      [path]: Math.max(p[path] || 0, level),
    }));
  };

  const resetProgress = () => {
    setActive(null);
    setProgress((p) => ({ ...p, [path]: 0 }));
  };

  return (
    <div className="max-w-6xl mx-auto py-14 px-4 text-white">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          🧠 Splunk Career Roadmap
        </h2>
        <p className="mt-3 text-gray-400">
          Choose a path, follow the levels, complete projects, build your portfolio.
        </p>
      </div>

      {/* Path Selector */}
      <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="grid grid-cols-2 md:flex gap-3">
          {Object.values(careerPaths).map((p) => {
            const Icon = p.icon;
            const isActive = path === p.key;

            return (
              <button
                key={p.key}
                onClick={() => {
                  setPath(p.key);
                  setActive(null);
                }}
                className={[
                  "rounded-2xl p-[2px] transition",
                  isActive ? "opacity-100" : "opacity-80 hover:opacity-100",
                  "bg-gradient-to-br",
                  p.gradient,
                ].join(" ")}
              >
                <div
                  className={[
                    "rounded-2xl px-4 py-3 bg-[#0f172a] border border-white/10",
                    "flex items-center gap-3",
                  ].join(" ")}
                >
                  <span className="p-2 rounded-xl bg-white/10">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block font-semibold text-sm md:text-base">
                      {p.label}
                    </span>
                    <span className="block text-xs text-gray-400">{p.subtitle}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress + reset */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:min-w-[320px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10">
                <PathIcon className="w-5 h-5" />
              </span>
              <div className="leading-tight">
                <p className="font-semibold">
                  {careerPaths[path]?.label || "Track"}
                </p>
                <p className="text-xs text-gray-400">
                  Completed {completedCount}/{totalLevels} • {percent}%
                </p>
              </div>
            </div>

            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
              title="Reset progress for this path"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white/40"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Tip: finish each <b>Project</b> + add it to your <b>Portfolio</b>.
          </p>
        </div>
      </div>

      {/* Roadmap Grid */}
      <div className="mt-10 grid md:grid-cols-3 gap-7">
        {filtered.map((box, index) => {
          const Icon = box.icon;
          const isOpen = active === index;

          // Locked progression:
          // - Level 1 always unlocked
          // - Otherwise must have completed previous level in THIS filtered list
          const prevLevel = index === 0 ? 0 : filtered[index - 1]?.level;
          const isLocked = index !== 0 && completedLevel < prevLevel;

          // Completed if user's completed level >= this level
          const isCompleted = completedLevel >= box.level;

          return (
            <motion.div
              key={`${box.level}-${box.title}`}
              whileHover={!isLocked ? { scale: 1.03 } : undefined}
              onClick={() => {
                if (isLocked) return;
                setActive(isOpen ? null : index);
              }}
              className={[
                "relative rounded-2xl p-[2px] bg-gradient-to-br cursor-pointer",
                box.color,
                isLocked ? "opacity-45 grayscale cursor-not-allowed" : "",
              ].join(" ")}
            >
              {/* Status badge */}
              <div className="absolute top-3 right-3 z-10">
                {isLocked ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-black/60 border border-white/10 inline-flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                ) : isCompleted ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-black/60 border border-white/10 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-black/60 border border-white/10 inline-flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5" /> Next
                  </span>
                )}
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-6 h-full border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Level {box.level}</p>
                    <h3 className="text-lg md:text-xl font-semibold truncate">
                      {box.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {box.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-gray-200">
                        🎯 Roles: {box.jobs.slice(0, 1).join("")}
                      </span>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-gray-200">
                        🛠 Tools: {box.tools.slice(0, 1).join("")}
                      </span>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-gray-200">
                        🧠 Skills: {box.skills.slice(0, 1).join("")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.25 }}
                      className="mt-6"
                    >
                      {/* Topics */}
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <p className="text-sm font-semibold mb-2">What you learn</p>
                        <ul className="space-y-2 text-sm text-gray-300">
                          {box.items.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills/Tools/Roles */}
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <p className="text-sm font-semibold mb-2">Career mapping</p>
                          <p className="text-xs text-gray-400">
                            🧠 Skills:{" "}
                            <span className="text-gray-200">
                              {box.skills.join(", ")}
                            </span>
                          </p>
                          <p className="mt-2 text-xs text-gray-400">
                            🛠 Tools:{" "}
                            <span className="text-gray-200">
                              {box.tools.join(", ")}
                            </span>
                          </p>
                          <p className="mt-2 text-xs text-gray-400">
                            💼 Roles:{" "}
                            <span className="text-gray-200">
                              {box.jobs.join(", ")}
                            </span>
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <p className="text-sm font-semibold mb-2">Cert + Portfolio</p>
                          <p className="text-xs text-gray-400">
                            🎓 Certs:{" "}
                            <span className="text-gray-200">
                              {box.certs.join(", ")}
                            </span>
                          </p>
                          <p className="mt-2 text-xs text-gray-400">
                            📁 Portfolio:{" "}
                            <span className="text-gray-200">
                              {box.portfolio.join(", ")}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Project */}
                      <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
                        <p className="text-sm font-semibold mb-2">🛠 Project (do this)</p>
                        <p className="text-sm text-gray-300">{box.project}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          💡 Tip: Practice in Splunk Search immediately after learning.
                        </p>
                      </div>

                      {/* Scenario (optional) */}
                      {box.scenario && (
                        <div className="mt-4 rounded-xl bg-red-950/40 border border-red-800 p-4">
                          <p className="text-sm font-semibold text-red-300">
                            🚨 Scenario: {box.scenario.title}
                          </p>
                          <p className="mt-2 text-sm text-gray-200">
                            {box.scenario.description}
                          </p>
                          <ul className="mt-3 text-sm text-gray-200 list-disc ml-5 space-y-1">
                            {box.scenario.studentTasks.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Complete button */}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markCompleted(box.level);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Level {box.level} Completed
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActive(null);
                          }}
                          className="text-sm text-gray-400 hover:text-gray-200 transition"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-12 text-center text-sm text-gray-400">
        Build your portfolio from each level — dashboards, alert rules, SPL libraries, and incident reports.
      </div>
    </div>
  );
}


// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Database,
//   Search,
//   BarChart3,
//   Bell,
//   Layers,
//   ShieldCheck,
// } from "lucide-react";

// const mapData = [
//   {
//     level: "Level 1",
//     title: "Splunk Fundamentals",
//     icon: Database,
//     color: "from-cyan-500 to-blue-600",
//     description: "Understand how Splunk works under the hood",
//     outcome: "Junior Splunk User",
//     items: [
//       "What is Splunk & use cases",
//       "Indexer vs Search Head",
//       "Universal & Heavy Forwarders",
//       "Apps vs Add-ons",
//       "Data onboarding basics",
//     ],
//     project: "Ingest Linux auth logs & explore _internal data",
//   },
//   {
//     level: "Level 2",
//     title: "SPL Essentials",
//     icon: Search,
//     color: "from-purple-500 to-fuchsia-600",
//     description: "Query, transform & analyze machine data",
//     outcome: "Splunk Power User",
//     items: [
//       "search & filtering",
//       "stats, chart, timechart",
//       "eval & rex",
//       "dedup, sort, transaction",
//       "Real-world log analysis",
//     ],
//     project: "Analyze failed logins & suspicious IP activity",
//   },
//   {
//     level: "Level 3",
//     title: "Dashboard Studio",
//     icon: BarChart3,
//     color: "from-emerald-500 to-teal-600",
//     description: "Design executive & SOC dashboards",
//     outcome: "Splunk Dashboard Engineer",
//     items: [
//       "Dashboard Studio vs Classic XML",
//       "Panels & visualizations",
//       "Tokens & inputs",
//       "Drilldowns",
//       "UX best practices",
//     ],
//     project: "Build a SOC overview dashboard",
//   },
//   {
//     level: "Level 4",
//     title: "Alerts & Scheduling",
//     icon: Bell,
//     color: "from-orange-500 to-red-600",
//     description: "Detect issues automatically",
//     outcome: "Monitoring / SOC Analyst",
//     items: [
//       "Alert conditions",
//       "Threshold vs scheduled alerts",
//       "Email & webhook actions",
//       "SOC-style alerting",
//       "Monitoring dashboards",
//     ],
//     project: "Create brute-force detection alerts",
//   },
//   {
//     level: "Level 5",
//     title: "Knowledge Objects",
//     icon: Layers,
//     color: "from-indigo-500 to-violet-600",
//     description: "Engineer reusable Splunk logic",
//     outcome: "Splunk Engineer / Admin",
//     items: [
//       "Lookups (CSV, KV Store)",
//       "Event types",
//       "Tags",
//       "Macros",
//       "Field extractions",
//     ],
//     project: "Build reusable detection logic with macros",
//   },
//   {
//     level: "Level 6",
//     title: "SOC / Security Path",
//     icon: ShieldCheck,
//     color: "from-red-600 to-rose-700",
//     description: "Apply Splunk to cybersecurity",
//     outcome: "SOC Analyst / Threat Hunter",
//     items: [
//       "Brute-force detection",
//       "Failed login analysis",
//       "Privilege escalation",
//       "Lateral movement",
//       "Threat hunting workflows",
//     ],
//     project: "Investigate a simulated security incident",
//   },
// ];


// export default function SplunkCareerRoadmapMap() {
//   const [active, setActive] = useState(null);

//   return (
//     <div className="max-w-6xl mx-auto py-16 text-white">
//       <h2 className="text-4xl font-bold text-center mb-4">
//         🧠 Splunk Learning Map
//       </h2>
//       <p className="text-center text-gray-400 mb-12">
//         Click a box to unlock and explore
//       </p>

//       <div className="grid md:grid-cols-3 gap-8">
//         {mapData.map((box, index) => {
//           const Icon = box.icon;
//           const isOpen = active === index;

//           return (
//             <motion.div
//               key={index}
//               whileHover={{ scale: 1.05 }}
//               onClick={() => setActive(isOpen ? null : index)}
//               className={`relative cursor-pointer rounded-2xl p-[2px] bg-gradient-to-br ${box.color}`}
//             >
//               <div className="bg-[#0f172a] rounded-2xl p-6 h-full">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 rounded-xl bg-white/10">
//                     <Icon className="w-6 h-6" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-semibold">{box.title}</h3>
//                     <p className="text-sm text-gray-400">
//                       {box.description}
//                     </p>
//                   </div>
//                 </div>

//                 {/* EXPAND */}
//                 <AnimatePresence>
//                   {isOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 10 }}
//                       transition={{ duration: 0.3 }}
//                       className="mt-6"
//                     >
//                       <ul className="space-y-2 text-sm text-gray-300">
//                         {box.items.map((item, i) => (
//                           <li key={i}>• {item}</li>
//                         ))}
//                       </ul>

//                       <div className="mt-4 text-xs text-gray-400">
//                         💡 Tip: Practice this in Splunk Search to remember it.
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// // import { useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

// // const roadmapData = [
// //   {
// //     title: "Splunk Fundamentals",
// //     description: "Understand Splunk architecture and core concepts.",
// //     details: [
// //       // "What is Splunk?",
// //       "Indexer, Search Head, Forwarder",
// //       "Data onboarding basics",
// //       "Splunk Web navigation",
// //     ],
// //   },
// //   {
// //     title: "SPL Essentials",
// //     description: "Master the Search Processing Language.",
// //     details: [
// //       "search, stats, eval",
// //       "filtering & renaming",
// //       "timechart, chart, table",
// //       "real log analysis",
// //     ],
// //   },
// //   {
// //     title: "Dashboard Studio",
// //     description: "Build interactive dashboards.",
// //     details: [
// //       "Panels & visualizations",
// //       "Tokens & drilldowns",
// //       "Base searches",
// //       "Best practices",
// //     ],
// //   },
// //   {
// //     title: "Alerts & Scheduled Searches",
// //     description: "Detect issues and notify teams.",
// //     details: [
// //       "Trigger conditions",
// //       "Email alerts",
// //       "SOC alert examples",
// //       "Monitoring dashboards",
// //     ],
// //   },
// //   {
// //     title: "Knowledge Objects",
// //     description: "Create reusable Splunk logic.",
// //     details: [
// //       "Lookup tables",
// //       "Event types & tags",
// //       "Field extractions",
// //       "Macros",
// //     ],
// //   },
// //   {
// //     title: "Security Use Cases (SOC Path)",
// //     description: "Apply Splunk in cybersecurity.",
// //     details: [
// //       "Brute-force detection",
// //       "Failed login analysis",
// //       "Privilege escalation",
// //       "Threat hunting dashboards",
// //     ],
// //   },
// // ];

// // export default function SplunkCareerRoadmapMap() {
// //   const [openIndex, setOpenIndex] = useState(null);

// //   return (
// //     <div className="max-w-4xl mx-auto py-12 text-white">
// //       <h2 className="text-3xl font-bold mb-12 text-center">
// //         🗺️ Splunk Career Roadmap
// //       </h2>

// //       <div className="relative">
// //         {/* Vertical Line */}
// //         <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 to-blue-700" />

// //         <div className="space-y-10">
// //           {roadmapData.map((step, index) => (
// //             <div key={index} className="relative flex gap-6">
// //               {/* Node */}
// //               <div className="relative z-10">
// //                 <div className="w-12 h-12 rounded-full bg-[#0f172a] border-2 border-cyan-500 flex items-center justify-center">
// //                   <CheckCircle className="text-cyan-400" />
// //                 </div>
// //               </div>

// //               {/* Card */}
// //               <div
// //                 className="flex-1 bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer hover:border-cyan-500 transition"
// //                 onClick={() =>
// //                   setOpenIndex(openIndex === index ? null : index)
// //                 }
// //               >
// //                 <div className="flex justify-between items-center">
// //                   <div>
// //                     <h3 className="text-xl font-semibold">
// //                       {index + 1}. {step.title}
// //                     </h3>
// //                     <p className="text-gray-400 text-sm mt-1">
// //                       {step.description}
// //                     </p>
// //                   </div>

// //                   {openIndex === index ? (
// //                     <ChevronUp />
// //                   ) : (
// //                     <ChevronDown />
// //                   )}
// //                 </div>

// //                 {/* Expandable Content */}
// //                 <AnimatePresence>
// //                   {openIndex === index && (
// //                     <motion.div
// //                       initial={{ opacity: 0, height: 0 }}
// //                       animate={{ opacity: 1, height: "auto" }}
// //                       exit={{ opacity: 0, height: 0 }}
// //                       transition={{ duration: 0.3 }}
// //                       className="mt-4 pl-4 border-l border-gray-600"
// //                     >
// //                       <ul className="space-y-2 text-sm text-gray-300">
// //                         {step.details.map((d, i) => (
// //                           <li key={i}>• {d}</li>
// //                         ))}
// //                       </ul>
// //                     </motion.div>
// //                   )}
// //                 </AnimatePresence>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   ); 
// // }

// // // import { useState } from "react";
// // // import { motion, AnimatePresence } from "framer-motion";
// // // import { ChevronDown, ChevronUp } from "lucide-react";

// // // const roadmapData = [
// // //   {
// // //     title: "Splunk Fundamentals",
// // //     description: "Learn Splunk architecture, data ingestion, UI navigation, and key concepts.",
// // //     details: [
// // //       "What is Splunk?",
// // //       "Indexer, Search Head, Forwarder",
// // //       "Data onboarding basics",
// // //       "Splunk Web navigation"
// // //     ]
// // //   },
// // //   {
// // //     title: "SPL Essentials",
// // //     description: "Master the Search Processing Language used for data analysis.",
// // //     details: [
// // //       "search, stats, eval",
// // //       "renaming & filtering",
// // //       "timechart, chart, table",
// // //       "real log analysis"
// // //     ]
// // //   },
// // //   {
// // //     title: "Dashboard Studio",
// // //     description: "Build modern dashboards with Studio, tokens, and drilldowns.",
// // //     details: [
// // //       "Panels & visualizations",
// // //       "Tokens & interactivity",
// // //       "Base searches",
// // //       "Dashboard best practices"
// // //     ]
// // //   },
// // //   {
// // //     title: "Alerts & Scheduled Searches",
// // //     description: "Configure email alerts, alert conditions, actions, and use cases.",
// // //     details: [
// // //       "Trigger conditions",
// // //       "Email notifications",
// // //       "Real SOC alert examples",
// // //       "Monitoring dashboards"
// // //     ]
// // //   },
// // //   {
// // //     title: "Knowledge Objects",
// // //     description: "Create lookups, event types, tags, macros, and field extractions.",
// // //     details: [
// // //       "Lookup tables",
// // //       "Event types & tags",
// // //       "Field extraction",
// // //       "Macros"
// // //     ]
// // //   },
// // //   {
// // //     title: "Security Use Cases (SOC Path)",
// // //     description: "Apply Splunk to cybersecurity & threat hunting scenarios.",
// // //     details: [
// // //       "Brute-force detection",
// // //       "Failed login analysis",
// // //       "Privilege escalation monitoring",
// // //       "Threat hunting dashboards"
// // //     ]
// // //   }
// // // ];

// // // export default function SplunkCareerRoadmap() {
// // //   const [openIndex, setOpenIndex] = useState(null);

// // //   return (
// // //     <div className="max-w-3xl mx-auto py-10 text-white">
// // //       <h2 className="text-3xl font-bold mb-8 text-center">
// // //         Splunk Career Roadmap
// // //       </h2>

// // //       <div className="space-y-4">
// // //         {roadmapData.map((item, index) => (
// // //           <div
// // //             key={index}
// // //             className="bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer"
// // //             onClick={() => setOpenIndex(openIndex === index ? null : index)}
// // //           >
// // //             <div className="flex justify-between items-center">
// // //               <h3 className="text-xl font-semibold">{item.title}</h3>
// // //               {openIndex === index ? (
// // //                 <ChevronUp className="w-5 h-5" />
// // //               ) : (
// // //                 <ChevronDown className="w-5 h-5" />
// // //               )}
// // //             </div>
// // //             <p className="text-gray-400 text-sm mt-1">{item.description}</p>

// // //             <AnimatePresence>
// // //               {openIndex === index && (
// // //                 <motion.div
// // //                   initial={{ opacity: 0, height: 0 }}
// // //                   animate={{ opacity: 1, height: "auto" }}
// // //                   exit={{ opacity: 0, height: 0 }}
// // //                   className="mt-4 pl-2 border-l border-gray-600"
// // //                 >
// // //                   <ul className="space-y-2 text-sm text-gray-300">
// // //                     {item.details.map((detail, i) => (
// // //                       <li key={i}>• {detail}</li>
// // //                     ))}
// // //                   </ul>
// // //                 </motion.div>
// // //               )}
// // //             </AnimatePresence>
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }
