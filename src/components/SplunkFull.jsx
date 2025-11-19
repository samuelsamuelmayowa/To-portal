import React from "react";
import { motion } from "framer-motion";

// ===============================
// FULL COURSE DATA (Videos + Docs + Syllabus)
// ===============================
const fullSplunkCourse = {
  id: "splunk",
  title: "Splunk Training – Full Professional Track",
  weeks: [
    {
      week: 1,
      title: "Introduction to Splunk",
      description:
        "What is Splunk? Use cases, architecture overview, installation.",
      videos: [
        {
          id: "v1",
          title: "To-analytics Orientation",
          url: "https://player.vimeo.com/video/1126909883",
        },
      ],
      docs: [
        {
          id: "d1",
          title: "Orientation Slides",
          url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
        },
      ],
    },

    {
      week: 2,
      title: "Splunk Basics",
      description: "Splunk UI tour, searching, fields, and data onboarding.",
      videos: [
        {
          id: "v2",
          title: "Splunk Basics / SIEM Intro (Class 1)",
          url: "https://player.vimeo.com/video/1127004938",
        },
      ],
      docs: [
        {
          id: "d1",
          title: "Splunk Class 1 Intro",
          url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
        },
        {
          id: "d2",
          title: "Splunk Class 1 Notes",
          url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
        },
      ],
    },

    {
      week: 3,
      title: "SPL – Part 1",
      description: "search, where, eval, field manipulation, filtering.",
      videos: [
        {
          id: "v3",
          title: "Splunk Class 2 — SPL Basics",
          url: "https://player.vimeo.com/video/1131114931",
        },
      ],
      docs: [
        {
          id: "d1",
          title: "Splunk Class 2 Slides",
          url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
        },
        {
          id: "d2",
          title: "Splunk Class 2 Notes",
          url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
        },
      ],
    },

    {
      week: 4,
      title: "SPL – Part 2",
      description:
        "stats, timechart, eventstats, transforming commands, lookup tables.",
      videos: [
        {
          id: "v4",
          title: "Splunk Class 3 — Advanced SPL",
          url: "https://player.vimeo.com/video/1133357923",
        },
      ],
      docs: [
        {
          id: "d1",
          title: "Splunk Class 3 Slides",
          url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
        },
        {
          id: "d2",
          title: "Splunk Class 3 Notes",
          url: "https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
        },
      ],
    },

    {
      week: 5,
      title: "Knowledge Objects",
      description:
        "Field extractions, event types, tags, transactions, data correlation.",
      videos: [],
      docs: [],
    },

    {
      week: 6,
      title: "Reports & Dashboards",
      description: "Dashboards, visualizations, reports, inputs & filters.",
      videos: [],
      docs: [],
    },

    {
      week: 7,
      title: "Alerts & Monitoring",
      description:
        "Real-time vs scheduled alerts, email/webhook actions, monitoring.",
      videos: [],
      docs: [],
    },

    {
      week: 8,
      title: "Apps & Add-ons",
      description: "Installing and using Splunk apps and add-ons.",
      videos: [],
      docs: [],
    },

    {
      week: 9,
      title: "Data Inputs & Indexing",
      description:
        "Data inputs, forwarders (UF/HF), indexing pipeline, buckets.",
      videos: [],
      docs: [],
    },

    {
      week: 10,
      title: "User Management & Security",
      description: "Roles, authentication, permissions, Splunk security.",
      videos: [],
      docs: [],
    },

    {
      week: 11,
      title: "Advanced SPL",
      description: "Subsearches, joins, macros, CIM.",
      videos: [],
      docs: [],
    },

    {
      week: 12,
      title: "Search Optimization",
      description: "Search tuning, indexing optimization, troubleshooting.",
      videos: [],
      docs: [],
    },

    {
      week: 13,
      title: "Enterprise Deployment",
      description: "Indexer cluster, SHC, SmartStore, HA architecture.",
      videos: [],
      docs: [],
    },

    {
      week: 14,
      title: "Final Project & Review",
      description: "Complete Splunk dashboard + alerting + exam prep.",
      videos: [],
      docs: [],
    },
  ],
};

// ===============================
// COMPONENTS
// ===============================

function WeekCard({ week }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all"
    >
      <h2 className="text-lg font-semibold text-blue-700">
        Week {week.week} — {week.title}
      </h2>

      <p className="text-sm text-gray-600 mt-1">{week.description}</p>

      {/* Videos */}
      <div className="mt-3">
        <h4 className="font-medium text-gray-800">🎬 Videos</h4>
        {week.videos.length > 0 ? (
          week.videos.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              className="block text-sm text-blue-600 underline mt-1"
            >
              {v.title}
            </a>
          ))
        ) : (
          <p className="text-xs text-gray-400">No videos yet</p>
        )}
      </div>

      {/* Documents */}
      <div className="mt-4">
        <h4 className="font-medium text-gray-800">📄 Documents</h4>
        {week.docs.length > 0 ? (
          week.docs.map((d) => (
            <a
              key={d.id}
              href={d.url}
              target="_blank"
              className="block text-sm text-purple-600 underline mt-1"
            >
              {d.title}
            </a>
          ))
        ) : (
          <p className="text-xs text-gray-400">No documents yet</p>
        )}
      </div>
    </motion.div>
  );
}

// ===============================
// MAIN EXPORT (FINAL COMPONENT)
// ===============================
export default function SplunkFullCourse() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        📘 {fullSplunkCourse.title}
      </h1>

      <div className="space-y-6">
        {fullSplunkCourse.weeks.map((week, idx) => (
          <WeekCard key={idx} week={week} />
        ))}
      </div>
    </div>
  );
}
