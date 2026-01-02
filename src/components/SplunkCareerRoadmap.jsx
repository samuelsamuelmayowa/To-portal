
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Search,
  BarChart3,
  Bell,
  Layers,
  ShieldCheck,
} from "lucide-react";

const mapData = [
  {
    level: "Level 1",
    title: "Splunk Fundamentals",
    icon: Database,
    color: "from-cyan-500 to-blue-600",
    description: "Understand how Splunk works under the hood",
    outcome: "Junior Splunk User",
    items: [
      "What is Splunk & use cases",
      "Indexer vs Search Head",
      "Universal & Heavy Forwarders",
      "Apps vs Add-ons",
      "Data onboarding basics",
    ],
    project: "Ingest Linux auth logs & explore _internal data",
  },
  {
    level: "Level 2",
    title: "SPL Essentials",
    icon: Search,
    color: "from-purple-500 to-fuchsia-600",
    description: "Query, transform & analyze machine data",
    outcome: "Splunk Power User",
    items: [
      "search & filtering",
      "stats, chart, timechart",
      "eval & rex",
      "dedup, sort, transaction",
      "Real-world log analysis",
    ],
    project: "Analyze failed logins & suspicious IP activity",
  },
  {
    level: "Level 3",
    title: "Dashboard Studio",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-600",
    description: "Design executive & SOC dashboards",
    outcome: "Splunk Dashboard Engineer",
    items: [
      "Dashboard Studio vs Classic XML",
      "Panels & visualizations",
      "Tokens & inputs",
      "Drilldowns",
      "UX best practices",
    ],
    project: "Build a SOC overview dashboard",
  },
  {
    level: "Level 4",
    title: "Alerts & Scheduling",
    icon: Bell,
    color: "from-orange-500 to-red-600",
    description: "Detect issues automatically",
    outcome: "Monitoring / SOC Analyst",
    items: [
      "Alert conditions",
      "Threshold vs scheduled alerts",
      "Email & webhook actions",
      "SOC-style alerting",
      "Monitoring dashboards",
    ],
    project: "Create brute-force detection alerts",
  },
  {
    level: "Level 5",
    title: "Knowledge Objects",
    icon: Layers,
    color: "from-indigo-500 to-violet-600",
    description: "Engineer reusable Splunk logic",
    outcome: "Splunk Engineer / Admin",
    items: [
      "Lookups (CSV, KV Store)",
      "Event types",
      "Tags",
      "Macros",
      "Field extractions",
    ],
    project: "Build reusable detection logic with macros",
  },
  {
    level: "Level 6",
    title: "SOC / Security Path",
    icon: ShieldCheck,
    color: "from-red-600 to-rose-700",
    description: "Apply Splunk to cybersecurity",
    outcome: "SOC Analyst / Threat Hunter",
    items: [
      "Brute-force detection",
      "Failed login analysis",
      "Privilege escalation",
      "Lateral movement",
      "Threat hunting workflows",
    ],
    project: "Investigate a simulated security incident",
  },
];


export default function SplunkCareerRoadmapMap() {
  const [active, setActive] = useState(null);

  return (
    <div className="max-w-6xl mx-auto py-16 text-white">
      <h2 className="text-4xl font-bold text-center mb-4">
        🧠 Splunk Learning Map
      </h2>
      <p className="text-center text-gray-400 mb-12">
        Click a box to unlock and explore
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {mapData.map((box, index) => {
          const Icon = box.icon;
          const isOpen = active === index;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActive(isOpen ? null : index)}
              className={`relative cursor-pointer rounded-2xl p-[2px] bg-gradient-to-br ${box.color}`}
            >
              <div className="bg-[#0f172a] rounded-2xl p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/10">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{box.title}</h3>
                    <p className="text-sm text-gray-400">
                      {box.description}
                    </p>
                  </div>
                </div>

                {/* EXPAND */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6"
                    >
                      <ul className="space-y-2 text-sm text-gray-300">
                        {box.items.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>

                      <div className="mt-4 text-xs text-gray-400">
                        💡 Tip: Practice this in Splunk Search to remember it.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}



// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

// const roadmapData = [
//   {
//     title: "Splunk Fundamentals",
//     description: "Understand Splunk architecture and core concepts.",
//     details: [
//       // "What is Splunk?",
//       "Indexer, Search Head, Forwarder",
//       "Data onboarding basics",
//       "Splunk Web navigation",
//     ],
//   },
//   {
//     title: "SPL Essentials",
//     description: "Master the Search Processing Language.",
//     details: [
//       "search, stats, eval",
//       "filtering & renaming",
//       "timechart, chart, table",
//       "real log analysis",
//     ],
//   },
//   {
//     title: "Dashboard Studio",
//     description: "Build interactive dashboards.",
//     details: [
//       "Panels & visualizations",
//       "Tokens & drilldowns",
//       "Base searches",
//       "Best practices",
//     ],
//   },
//   {
//     title: "Alerts & Scheduled Searches",
//     description: "Detect issues and notify teams.",
//     details: [
//       "Trigger conditions",
//       "Email alerts",
//       "SOC alert examples",
//       "Monitoring dashboards",
//     ],
//   },
//   {
//     title: "Knowledge Objects",
//     description: "Create reusable Splunk logic.",
//     details: [
//       "Lookup tables",
//       "Event types & tags",
//       "Field extractions",
//       "Macros",
//     ],
//   },
//   {
//     title: "Security Use Cases (SOC Path)",
//     description: "Apply Splunk in cybersecurity.",
//     details: [
//       "Brute-force detection",
//       "Failed login analysis",
//       "Privilege escalation",
//       "Threat hunting dashboards",
//     ],
//   },
// ];

// export default function SplunkCareerRoadmapMap() {
//   const [openIndex, setOpenIndex] = useState(null);

//   return (
//     <div className="max-w-4xl mx-auto py-12 text-white">
//       <h2 className="text-3xl font-bold mb-12 text-center">
//         🗺️ Splunk Career Roadmap
//       </h2>

//       <div className="relative">
//         {/* Vertical Line */}
//         <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 to-blue-700" />

//         <div className="space-y-10">
//           {roadmapData.map((step, index) => (
//             <div key={index} className="relative flex gap-6">
//               {/* Node */}
//               <div className="relative z-10">
//                 <div className="w-12 h-12 rounded-full bg-[#0f172a] border-2 border-cyan-500 flex items-center justify-center">
//                   <CheckCircle className="text-cyan-400" />
//                 </div>
//               </div>

//               {/* Card */}
//               <div
//                 className="flex-1 bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer hover:border-cyan-500 transition"
//                 onClick={() =>
//                   setOpenIndex(openIndex === index ? null : index)
//                 }
//               >
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h3 className="text-xl font-semibold">
//                       {index + 1}. {step.title}
//                     </h3>
//                     <p className="text-gray-400 text-sm mt-1">
//                       {step.description}
//                     </p>
//                   </div>

//                   {openIndex === index ? (
//                     <ChevronUp />
//                   ) : (
//                     <ChevronDown />
//                   )}
//                 </div>

//                 {/* Expandable Content */}
//                 <AnimatePresence>
//                   {openIndex === index && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="mt-4 pl-4 border-l border-gray-600"
//                     >
//                       <ul className="space-y-2 text-sm text-gray-300">
//                         {step.details.map((d, i) => (
//                           <li key={i}>• {d}</li>
//                         ))}
//                       </ul>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   ); 
// }

// // import { useState } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { ChevronDown, ChevronUp } from "lucide-react";

// // const roadmapData = [
// //   {
// //     title: "Splunk Fundamentals",
// //     description: "Learn Splunk architecture, data ingestion, UI navigation, and key concepts.",
// //     details: [
// //       "What is Splunk?",
// //       "Indexer, Search Head, Forwarder",
// //       "Data onboarding basics",
// //       "Splunk Web navigation"
// //     ]
// //   },
// //   {
// //     title: "SPL Essentials",
// //     description: "Master the Search Processing Language used for data analysis.",
// //     details: [
// //       "search, stats, eval",
// //       "renaming & filtering",
// //       "timechart, chart, table",
// //       "real log analysis"
// //     ]
// //   },
// //   {
// //     title: "Dashboard Studio",
// //     description: "Build modern dashboards with Studio, tokens, and drilldowns.",
// //     details: [
// //       "Panels & visualizations",
// //       "Tokens & interactivity",
// //       "Base searches",
// //       "Dashboard best practices"
// //     ]
// //   },
// //   {
// //     title: "Alerts & Scheduled Searches",
// //     description: "Configure email alerts, alert conditions, actions, and use cases.",
// //     details: [
// //       "Trigger conditions",
// //       "Email notifications",
// //       "Real SOC alert examples",
// //       "Monitoring dashboards"
// //     ]
// //   },
// //   {
// //     title: "Knowledge Objects",
// //     description: "Create lookups, event types, tags, macros, and field extractions.",
// //     details: [
// //       "Lookup tables",
// //       "Event types & tags",
// //       "Field extraction",
// //       "Macros"
// //     ]
// //   },
// //   {
// //     title: "Security Use Cases (SOC Path)",
// //     description: "Apply Splunk to cybersecurity & threat hunting scenarios.",
// //     details: [
// //       "Brute-force detection",
// //       "Failed login analysis",
// //       "Privilege escalation monitoring",
// //       "Threat hunting dashboards"
// //     ]
// //   }
// // ];

// // export default function SplunkCareerRoadmap() {
// //   const [openIndex, setOpenIndex] = useState(null);

// //   return (
// //     <div className="max-w-3xl mx-auto py-10 text-white">
// //       <h2 className="text-3xl font-bold mb-8 text-center">
// //         Splunk Career Roadmap
// //       </h2>

// //       <div className="space-y-4">
// //         {roadmapData.map((item, index) => (
// //           <div
// //             key={index}
// //             className="bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer"
// //             onClick={() => setOpenIndex(openIndex === index ? null : index)}
// //           >
// //             <div className="flex justify-between items-center">
// //               <h3 className="text-xl font-semibold">{item.title}</h3>
// //               {openIndex === index ? (
// //                 <ChevronUp className="w-5 h-5" />
// //               ) : (
// //                 <ChevronDown className="w-5 h-5" />
// //               )}
// //             </div>
// //             <p className="text-gray-400 text-sm mt-1">{item.description}</p>

// //             <AnimatePresence>
// //               {openIndex === index && (
// //                 <motion.div
// //                   initial={{ opacity: 0, height: 0 }}
// //                   animate={{ opacity: 1, height: "auto" }}
// //                   exit={{ opacity: 0, height: 0 }}
// //                   className="mt-4 pl-2 border-l border-gray-600"
// //                 >
// //                   <ul className="space-y-2 text-sm text-gray-300">
// //                     {item.details.map((detail, i) => (
// //                       <li key={i}>• {detail}</li>
// //                     ))}
// //                   </ul>
// //                 </motion.div>
// //               )}
// //             </AnimatePresence>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
