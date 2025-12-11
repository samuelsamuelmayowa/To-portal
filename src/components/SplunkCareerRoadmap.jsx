import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const roadmapData = [
  {
    title: "Splunk Fundamentals",
    description: "Learn Splunk architecture, data ingestion, UI navigation, and key concepts.",
    details: [
      "What is Splunk?",
      "Indexer, Search Head, Forwarder",
      "Data onboarding basics",
      "Splunk Web navigation"
    ]
  },
  {
    title: "SPL Essentials",
    description: "Master the Search Processing Language used for data analysis.",
    details: [
      "search, stats, eval",
      "renaming & filtering",
      "timechart, chart, table",
      "real log analysis"
    ]
  },
  {
    title: "Dashboard Studio",
    description: "Build modern dashboards with Studio, tokens, and drilldowns.",
    details: [
      "Panels & visualizations",
      "Tokens & interactivity",
      "Base searches",
      "Dashboard best practices"
    ]
  },
  {
    title: "Alerts & Scheduled Searches",
    description: "Configure email alerts, alert conditions, actions, and use cases.",
    details: [
      "Trigger conditions",
      "Email notifications",
      "Real SOC alert examples",
      "Monitoring dashboards"
    ]
  },
  {
    title: "Knowledge Objects",
    description: "Create lookups, event types, tags, macros, and field extractions.",
    details: [
      "Lookup tables",
      "Event types & tags",
      "Field extraction",
      "Macros"
    ]
  },
  {
    title: "Security Use Cases (SOC Path)",
    description: "Apply Splunk to cybersecurity & threat hunting scenarios.",
    details: [
      "Brute-force detection",
      "Failed login analysis",
      "Privilege escalation monitoring",
      "Threat hunting dashboards"
    ]
  }
];

export default function SplunkCareerRoadmap() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto py-10 text-white">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Splunk Career Roadmap
      </h2>

      <div className="space-y-4">
        {roadmapData.map((item, index) => (
          <div
            key={index}
            className="bg-[#1b1f2a] border border-gray-700 rounded-xl p-5 cursor-pointer"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1">{item.description}</p>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pl-2 border-l border-gray-600"
                >
                  <ul className="space-y-2 text-sm text-gray-300">
                    {item.details.map((detail, i) => (
                      <li key={i}>• {detail}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
