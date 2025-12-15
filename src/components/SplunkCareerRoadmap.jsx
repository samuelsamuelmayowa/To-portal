import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const roadmapData = [
  {
    title: "Splunk Fundamentals",
    description: "Understand Splunk architecture and core concepts.",
    details: [
      "What is Splunk?",
      "Indexer, Search Head, Forwarder",
      "Data onboarding basics",
      "Splunk Web navigation",
    ],
  },
  {
    title: "SPL Essentials",
    description: "Master the Search Processing Language.",
    details: [
      "search, stats, eval",
      "filtering & renaming",
      "timechart, chart, table",
      "real log analysis",
    ],
  },
  {
    title: "Dashboard Studio",
    description: "Build interactive dashboards.",
    details: [
      "Panels & visualizations",
      "Tokens & drilldowns",
      "Base searches",
      "Best practices",
    ],
  },
  {
    title: "Alerts & Scheduled Searches",
    description: "Detect issues and notify teams.",
    details: [
      "Trigger conditions",
      "Email alerts",
      "SOC alert examples",
      "Monitoring dashboards",
    ],
  },
  {
    title: "Knowledge Objects",
    description: "Create reusable Splunk logic.",
    details: [
      "Lookup tables",
      "Event types & tags",
      "Field extractions",
      "Macros",
    ],
  },
  {
    title: "Security Use Cases (SOC Path)",
    description: "Apply Splunk in cybersecurity.",
    details: [
      "Brute-force detection",
      "Failed login analysis",
      "Privilege escalation",
      "Threat hunting dashboards",
    ],
  },
];

export default function SplunkCareerRoadmapMap() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-4xl mx-auto py-12 text-white">
      <h2 className="text-3xl font-bold mb-12 text-center">
        🗺️ Splunk Career Roadmap
      </h2>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 to-blue-700" />

        <div className="space-y-10">
          {roadmapData.map((step, index) => (
            <div key={index} className="relative flex gap-6">
              {/* Node */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#0f172a] border-2 border-cyan-500 flex items-center justify-center">
                  <CheckCircle className="text-cyan-400" />
                </div>
              </div>

              {/* Card */}
              <div
                className="flex-1 bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer hover:border-cyan-500 transition"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {step.description}
                    </p>
                  </div>

                  {openIndex === index ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pl-4 border-l border-gray-600"
                    >
                      <ul className="space-y-2 text-sm text-gray-300">
                        {step.details.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronDown, ChevronUp } from "lucide-react";

// const roadmapData = [
//   {
//     title: "Splunk Fundamentals",
//     description: "Learn Splunk architecture, data ingestion, UI navigation, and key concepts.",
//     details: [
//       "What is Splunk?",
//       "Indexer, Search Head, Forwarder",
//       "Data onboarding basics",
//       "Splunk Web navigation"
//     ]
//   },
//   {
//     title: "SPL Essentials",
//     description: "Master the Search Processing Language used for data analysis.",
//     details: [
//       "search, stats, eval",
//       "renaming & filtering",
//       "timechart, chart, table",
//       "real log analysis"
//     ]
//   },
//   {
//     title: "Dashboard Studio",
//     description: "Build modern dashboards with Studio, tokens, and drilldowns.",
//     details: [
//       "Panels & visualizations",
//       "Tokens & interactivity",
//       "Base searches",
//       "Dashboard best practices"
//     ]
//   },
//   {
//     title: "Alerts & Scheduled Searches",
//     description: "Configure email alerts, alert conditions, actions, and use cases.",
//     details: [
//       "Trigger conditions",
//       "Email notifications",
//       "Real SOC alert examples",
//       "Monitoring dashboards"
//     ]
//   },
//   {
//     title: "Knowledge Objects",
//     description: "Create lookups, event types, tags, macros, and field extractions.",
//     details: [
//       "Lookup tables",
//       "Event types & tags",
//       "Field extraction",
//       "Macros"
//     ]
//   },
//   {
//     title: "Security Use Cases (SOC Path)",
//     description: "Apply Splunk to cybersecurity & threat hunting scenarios.",
//     details: [
//       "Brute-force detection",
//       "Failed login analysis",
//       "Privilege escalation monitoring",
//       "Threat hunting dashboards"
//     ]
//   }
// ];

// export default function SplunkCareerRoadmap() {
//   const [openIndex, setOpenIndex] = useState(null);

//   return (
//     <div className="max-w-3xl mx-auto py-10 text-white">
//       <h2 className="text-3xl font-bold mb-8 text-center">
//         Splunk Career Roadmap
//       </h2>

//       <div className="space-y-4">
//         {roadmapData.map((item, index) => (
//           <div
//             key={index}
//             className="bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer"
//             onClick={() => setOpenIndex(openIndex === index ? null : index)}
//           >
//             <div className="flex justify-between items-center">
//               <h3 className="text-xl font-semibold">{item.title}</h3>
//               {openIndex === index ? (
//                 <ChevronUp className="w-5 h-5" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" />
//               )}
//             </div>
//             <p className="text-gray-400 text-sm mt-1">{item.description}</p>

//             <AnimatePresence>
//               {openIndex === index && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 pl-2 border-l border-gray-600"
//                 >
//                   <ul className="space-y-2 text-sm text-gray-300">
//                     {item.details.map((detail, i) => (
//                       <li key={i}>• {detail}</li>
//                     ))}
//                   </ul>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
