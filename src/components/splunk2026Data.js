/**
 * T.O. Analytics 2026–2027 official orientation content.
 * Source: TO Analytics Splunk Orientation 2026.pptx, slides 1–28.
 * Class start times are 8:00 AM America/New_York; no end times supplied.
 * Exactly one orientation video and the 28-slide presentation are published.
 * All ten class-specific media arrays remain empty.
 */
// Keep this unchanged to preserve any progress already saved on the updated dashboard.
// It is only a storage namespace; it does NOT divide students into cohorts.
export const COHORT_ID = "splunk-2026-oct";
export const ORIENTATION_URL = "https://www.to-analytics.com/splunk-orientation";
export const STUDY_HUB_URL = "https://www.to-analytics.com";
export const SERVER_URL = "https://a.co/d/0dqtgNco";
export const DEVELOPER_PROGRAM_URL = "https://dev.splunk.com/developer-program/";

// The ONE retained recording for ALL Splunk students; no other historical videos.
// This is the only existing recording kept in the unified dashboard.
export const ORIENTATION_VIDEO = {
  id: "orientation-intro",
  title: "Splunk Orientation — Introduction",
  url: "https://player.vimeo.com/video/1126909883",
};

// These paths must match the files under public/course-materials/.
export const ORIENTATION_SLIDES = {
  powerpoint: "/course-materials/TO_Analytics_Splunk_Orientation_2026.pptx",
  pdf: "/course-materials/TO_Analytics_Splunk_Orientation_2026.pdf",
};


export const CERTIFICATIONS = [
  {
    id: "power-user",
    title: "Splunk Core Certified Power User",
    date: "2026-11-28",
    topic: "SPL, fields, knowledge objects and data models",
    description: "Study using the official objectives, then schedule and complete the actual exam separately.",
  },
  {
    id: "admin",
    title: "Splunk Enterprise Certified Admin",
    date: "2026-12-19",
    topic: "System administration and data administration",
    description: "Power User comes first in this cohort plan. Confirm current exam prerequisites and policies with the provider.",
  },
];

const RAW_LESSONS = [
  ["2027-01-09", "Proxmox and virtual machines", "Install Proxmox VE, build eight Linux virtual machines, configure networking and record recovery snapshots.", "VM inventory, IP map, SSH tests and restore procedure.", ["Install Proxmox and configure a network bridge", "Create eight Linux VMs with unique hostnames", "Set up SSH, updates and recovery snapshots"]],
  ["2027-01-16", "Distributed Splunk architecture", "Assign Splunk Enterprise and Universal Forwarder roles and configure a working indexer cluster.", "Cluster health evidence, searchable test events and forwarder connectivity.", ["Install CM1, IDX1–IDX3, SH1, MC1 and UF1–UF2", "Configure replication factor 2 and search factor 2", "Connect licensing, deployment and monitoring services"]],
  ["2027-01-23", "Forwarders and data onboarding", "Use forwarder configuration apps to collect Linux, network, web and game data; validate event metadata.", "Input inventory and validation searches for os, network and gamelog.", ["Create forwarder deployment apps", "Onboard OS, network and game-log datasets", "Validate timestamps, host, source and sourcetype"]],
  ["2027-01-30", "SPL and field knowledge", "Practice efficient searches, extractions, lookups, calculated fields and reusable knowledge objects.", "Search workbook with expected results and object permissions.", ["Use search, where, eval, stats and timechart", "Practice rex, spath and lookups", "Build macros, tags and event types"]],
  ["2027-02-06", "Dashboard Studio and reports", "Build OS, Network and Game Activity dashboards with tokens, filters and drilldowns.", "Three tested, shared dashboards and reusable report searches.", ["Build three dashboards", "Add tokens, inputs and drilldowns", "Test panels and empty-result behavior"]],
  ["2027-02-13", "Alerts, CIM and security use cases", "Create scheduled alerts, map data to CIM and document a detection use case.", "Tested alert, CIM checklist and detection explanation.", ["Schedule and test an alert", "Map events and fields to CIM", "Explain detection false positives"]],
  ["2027-02-20", "Administration and automation", "Manage user roles, index access, configuration precedence, deployment apps and read-only REST inventory.", "Least-privilege role, versioned configuration app and rollback plan.", ["Review RBAC and knowledge-object sharing", "Use btool and configuration apps", "Document changes and a rollback procedure"]],
  ["2027-02-27", "Health, performance and recovery", "Investigate cluster health, slow SPL, queues and storage, then complete a controlled failure/recovery drill.", "Failure-drill report and troubleshooting runbook.", ["Use Monitoring Console, _internal and _audit", "Review slow searches and storage pressure", "Test indexer recovery in the lab"]],
  ["2027-03-06", "Modern Splunk capabilities", "Explore SPL2 alongside SPL, AI-assisted query review and modern data pipelines when access permits.", "One SPL2 example and a short platform-boundary explanation.", ["Compare a simple SPL and SPL2 search", "Review generated searches before execution", "Explore Edge Processor and OpenTelemetry concepts"]],
  ["2027-03-13", "Capstone demonstration", "Present a working eight-VM Splunk environment with dashboards, alerts, recovery evidence and operations documentation.", "Architecture diagram, sanitized configurations, searches and final runbook.", ["Demonstrate working data and dashboards", "Explain alert and recovery evidence", "Submit a usable operating runbook"]],
];

export const LESSONS = RAW_LESSONS.map(([date, title, description, evidence, tasks], index) => ({
  id: `oct26-class-${String(index + 1).padStart(2, "0")}`,
  number: index + 1,
  date,
  title,
  description,
  evidence,
  tasks,
  time: "8:00 AM Eastern",
  videos: [], // Add verified, cohort-approved recordings here after publication.
  docs: [], // Add cohort-approved files after publication.
}));

export const MILESTONES = [
  { id: "orientation", date: "2026-10-31", title: "Cohort orientation", kind: "orientation", detail: "8:00–10:00 AM Eastern" },
  { id: "power-user", date: "2026-11-28", title: "Power User deadline", kind: "deadline", detail: "Certification target; book exam separately" },
  { id: "admin", date: "2026-12-19", title: "Enterprise Admin deadline", kind: "deadline", detail: "Certification target; book exam separately" },
  { id: "readiness", date: "2027-01-08", title: "Lab readiness check", kind: "reminder", detail: "Suggested preparation reminder, not a class" },
  ...LESSONS.map((lesson) => ({
    id: lesson.id, date: lesson.date, title: `${String(lesson.number).padStart(2, "0")} · ${lesson.title}`,
    kind: "class", detail: "8:00 AM Eastern",
  })),
];

export const VM_ROLES = [
  { name: "CM1", role: "Cluster manager", count: 1, cpu: 2, ram: 4, disk: 40 },
  { name: "IDX1–IDX3", role: "Indexers — data storage and replication", count: 3, cpu: 4, ram: 8, disk: 120 },
  { name: "SH1", role: "Search head — searches and dashboards", count: 1, cpu: 4, ram: 8, disk: 60 },
  { name: "MC1", role: "Deployment / licensing / monitoring", count: 1, cpu: 2, ram: 6, disk: 60 },
  { name: "UF1–UF2", role: "Universal Forwarders — log collection", count: 2, cpu: 1, ram: 2, disk: 20 },
];

export const PREP_ITEMS = [
  { id: "study", label: "Set a Power User study plan and contact the instructor with questions." },
  { id: "splunk-account", label: "Create a Splunk account and confirm download access." },
  { id: "server", label: "Obtain a personal lab server and verify its specifications." },
  { id: "network", label: "Prepare wired networking, a laptop, USB media and an IP/hostname plan." },
  { id: "license", label: "Confirm a legitimate Splunk license covering the hands-on lab period." },
  { id: "backup", label: "Back up existing data before installing Proxmox on the chosen disk." },
];

export const WEEKLY_CHECKINS = [
  "2026-10-31", "2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28",
  "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26",
];

export function easternToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (key) => parts.find((part) => part.type === key)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function displayDate(iso, options = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(`${iso}T12:00:00Z`));
}

// /**
//  * T.O. Analytics 2026–2027 official orientation content.
//  * Source: TO Analytics Splunk Orientation 2026.pptx, slides 1–28.
//  * Class start times are 8:00 AM America/New_York; no end times supplied.
//  * Exactly one orientation video and the 28-slide presentation are published.
//  * All ten class-specific media arrays remain empty.
//  */
// // Keep this unchanged to preserve any progress already saved on the updated dashboard.
// // It is only a storage namespace; it does NOT divide students into cohorts.
// export const COHORT_ID = "splunk-2026-oct";
// export const ORIENTATION_URL = "https://www.to-analytics.com/splunk-orientation";
// export const STUDY_HUB_URL = "https://www.to-analytics.com";
// export const SERVER_URL = "https://a.co/d/0dqtgNco";
// export const DEVELOPER_PROGRAM_URL = "https://dev.splunk.com/developer-program/";

// // The ONE retained recording for ALL Splunk students; no other historical videos.
// // This is the only existing recording kept in the unified dashboard.
// export const ORIENTATION_VIDEO = {
//   id: "orientation-intro",
//   title: "Splunk Orientation — Introduction",
//   url: "https://player.vimeo.com/video/1126909883",
// };

// // These paths must match the files under public/course-materials/.
// export const ORIENTATION_SLIDES = {
//   powerpoint: "/course-materials/TO_Analytics_Splunk_Orientation_2026.pptx",
//   pdf: "/course-materials/TO_Analytics_Splunk_Orientation_2026.pdf",
// };


// export const CERTIFICATIONS = [
//   {
//     id: "power-user",
//     title: "Splunk Core Certified Power User",
//     date: "2026-11-28",
//     topic: "SPL, fields, knowledge objects and data models",
//     description: "Study using the official objectives, then schedule and complete the actual exam separately.",
//   },
//   {
//     id: "admin",
//     title: "Splunk Enterprise Certified Admin",
//     date: "2026-12-19",
//     topic: "System administration and data administration",
//     description: "Power User comes first in this cohort plan. Confirm current exam prerequisites and policies with the provider.",
//   },
// ];

// const RAW_LESSONS = [
//   ["2027-01-09", "Proxmox and virtual machines", "Install Proxmox VE, build eight Linux virtual machines, configure networking and record recovery snapshots.", "VM inventory, IP map, SSH tests and restore procedure.", ["Install Proxmox and configure a network bridge", "Create eight Linux VMs with unique hostnames", "Set up SSH, updates and recovery snapshots"]],
//   ["2027-01-16", "Distributed Splunk architecture", "Assign Splunk Enterprise and Universal Forwarder roles and configure a working indexer cluster.", "Cluster health evidence, searchable test events and forwarder connectivity.", ["Install CM1, IDX1–IDX3, SH1, MC1 and UF1–UF2", "Configure replication factor 2 and search factor 2", "Connect licensing, deployment and monitoring services"]],
//   ["2027-01-23", "Forwarders and data onboarding", "Use forwarder configuration apps to collect Linux, network, web and game data; validate event metadata.", "Input inventory and validation searches for os, network and gamelog.", ["Create forwarder deployment apps", "Onboard OS, network and game-log datasets", "Validate timestamps, host, source and sourcetype"]],
//   ["2027-01-30", "SPL and field knowledge", "Practice efficient searches, extractions, lookups, calculated fields and reusable knowledge objects.", "Search workbook with expected results and object permissions.", ["Use search, where, eval, stats and timechart", "Practice rex, spath and lookups", "Build macros, tags and event types"]],
//   ["2027-02-06", "Dashboard Studio and reports", "Build OS, Network and Game Activity dashboards with tokens, filters and drilldowns.", "Three tested, shared dashboards and reusable report searches.", ["Build three dashboards", "Add tokens, inputs and drilldowns", "Test panels and empty-result behavior"]],
//   ["2027-02-13", "Alerts, CIM and security use cases", "Create scheduled alerts, map data to CIM and document a detection use case.", "Tested alert, CIM checklist and detection explanation.", ["Schedule and test an alert", "Map events and fields to CIM", "Explain detection false positives"]],
//   ["2027-02-20", "Administration and automation", "Manage user roles, index access, configuration precedence, deployment apps and read-only REST inventory.", "Least-privilege role, versioned configuration app and rollback plan.", ["Review RBAC and knowledge-object sharing", "Use btool and configuration apps", "Document changes and a rollback procedure"]],
//   ["2027-02-27", "Health, performance and recovery", "Investigate cluster health, slow SPL, queues and storage, then complete a controlled failure/recovery drill.", "Failure-drill report and troubleshooting runbook.", ["Use Monitoring Console, _internal and _audit", "Review slow searches and storage pressure", "Test indexer recovery in the lab"]],
//   ["2027-03-06", "Modern Splunk capabilities", "Explore SPL2 alongside SPL, AI-assisted query review and modern data pipelines when access permits.", "One SPL2 example and a short platform-boundary explanation.", ["Compare a simple SPL and SPL2 search", "Review generated searches before execution", "Explore Edge Processor and OpenTelemetry concepts"]],
//   ["2027-03-13", "Capstone demonstration", "Present a working eight-VM Splunk environment with dashboards, alerts, recovery evidence and operations documentation.", "Architecture diagram, sanitized configurations, searches and final runbook.", ["Demonstrate working data and dashboards", "Explain alert and recovery evidence", "Submit a usable operating runbook"]],
// ];

// export const LESSONS = RAW_LESSONS.map(([date, title, description, evidence, tasks], index) => ({
//   id: `oct26-class-${String(index + 1).padStart(2, "0")}`,
//   number: index + 1,
//   date,
//   title,
//   description,
//   evidence,
//   tasks,
//   time: "8:00 AM Eastern",
//   videos: [], // Add verified, cohort-approved recordings here after publication.
//   docs: [], // Add cohort-approved files after publication.
// }));

// export const MILESTONES = [
//   { id: "orientation", date: "2026-10-31", title: "Cohort orientation", kind: "orientation", detail: "8:00–10:00 AM Eastern" },
//   { id: "power-user", date: "2026-11-28", title: "Power User deadline", kind: "deadline", detail: "Certification target; book exam separately" },
//   { id: "admin", date: "2026-12-19", title: "Enterprise Admin deadline", kind: "deadline", detail: "Certification target; book exam separately" },
//   { id: "readiness", date: "2027-01-08", title: "Lab readiness check", kind: "reminder", detail: "Suggested preparation reminder, not a class" },
//   ...LESSONS.map((lesson) => ({
//     id: lesson.id, date: lesson.date, title: `${String(lesson.number).padStart(2, "0")} · ${lesson.title}`,
//     kind: "class", detail: "8:00 AM Eastern",
//   })),
// ];

// export const VM_ROLES = [
//   { name: "CM1", role: "Cluster manager", count: 1, cpu: 2, ram: 4, disk: 40 },
//   { name: "IDX1–IDX3", role: "Indexers — data storage and replication", count: 3, cpu: 4, ram: 8, disk: 120 },
//   { name: "SH1", role: "Search head — searches and dashboards", count: 1, cpu: 4, ram: 8, disk: 60 },
//   { name: "MC1", role: "Deployment / licensing / monitoring", count: 1, cpu: 2, ram: 6, disk: 60 },
//   { name: "UF1–UF2", role: "Universal Forwarders — log collection", count: 2, cpu: 1, ram: 2, disk: 20 },
// ];

// export const PREP_ITEMS = [
//   { id: "study", label: "Set a Power User study plan and contact the instructor with questions." },
//   { id: "splunk-account", label: "Create a Splunk account and confirm download access." },
//   { id: "server", label: "Obtain a personal lab server and verify its specifications." },
//   { id: "network", label: "Prepare wired networking, a laptop, USB media and an IP/hostname plan." },
//   { id: "license", label: "Confirm a legitimate Splunk license covering the hands-on lab period." },
//   { id: "backup", label: "Back up existing data before installing Proxmox on the chosen disk." },
// ];

// export const WEEKLY_CHECKINS = [
//   "2026-10-31", "2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28",
//   "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26",
// ];

// export function easternToday() {
//   const parts = new Intl.DateTimeFormat("en-CA", {
//     timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
//   }).formatToParts(new Date());
//   const get = (key) => parts.find((part) => part.type === key)?.value || "";
//   return `${get("year")}-${get("month")}-${get("day")}`;
// }

// export function displayDate(iso, options = { month: "short", day: "numeric", year: "numeric" }) {
//   return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(`${iso}T12:00:00Z`));
// }


// // /**
// //  * T.O. Analytics 2026–2027 official orientation content.
// //  * Source: TO Analytics Splunk Orientation 2026.pptx, slides 1–28.
// //  * Class start times are 8:00 AM America/New_York; no end times supplied.
// //  * Exactly one orientation video and the 28-slide presentation are published.
// //  * All ten class-specific media arrays remain empty.
// //  */
// // export const COHORT_ID = "splunk-2026-oct";
// // export const ORIENTATION_URL = "https://www.to-analytics.com/splunk-orientation";
// // export const STUDY_HUB_URL = "https://www.to-analytics.com";
// // export const SERVER_URL = "https://a.co/d/0dqtgNco";
// // export const DEVELOPER_PROGRAM_URL = "https://dev.splunk.com/developer-program/";

// // // The ONE retained recording for NEW cohort students; no old class recordings.
// // // Change this URL when you have a new video specifically for orientation.
// // export const ORIENTATION_VIDEO = {
// //   id: "orientation-intro",
// //   title: "Splunk Orientation — Introduction",
// //   url: "https://player.vimeo.com/video/1126909883",
// // };

// // // These paths must match the files under public/course-materials/.
// // export const ORIENTATION_SLIDES = {
// //   powerpoint: "/course-materials/TO_Analytics_Splunk_Orientation_2026.pptx",
// //   pdf: "/course-materials/TO_Analytics_Splunk_Orientation_2026.pdf",
// // };


// // export const CERTIFICATIONS = [
// //   {
// //     id: "power-user",
// //     title: "Splunk Core Certified Power User",
// //     date: "2026-11-28",
// //     topic: "SPL, fields, knowledge objects and data models",
// //     description: "Study using the official objectives, then schedule and complete the actual exam separately.",
// //   },
// //   {
// //     id: "admin",
// //     title: "Splunk Enterprise Certified Admin",
// //     date: "2026-12-19",
// //     topic: "System administration and data administration",
// //     description: "Power User comes first in this cohort plan. Confirm current exam prerequisites and policies with the provider.",
// //   },
// // ];

// // const RAW_LESSONS = [
// //   ["2027-01-09", "Proxmox and virtual machines", "Install Proxmox VE, build eight Linux virtual machines, configure networking and record recovery snapshots.", "VM inventory, IP map, SSH tests and restore procedure.", ["Install Proxmox and configure a network bridge", "Create eight Linux VMs with unique hostnames", "Set up SSH, updates and recovery snapshots"]],
// //   ["2027-01-16", "Distributed Splunk architecture", "Assign Splunk Enterprise and Universal Forwarder roles and configure a working indexer cluster.", "Cluster health evidence, searchable test events and forwarder connectivity.", ["Install CM1, IDX1–IDX3, SH1, MC1 and UF1–UF2", "Configure replication factor 2 and search factor 2", "Connect licensing, deployment and monitoring services"]],
// //   ["2027-01-23", "Forwarders and data onboarding", "Use forwarder configuration apps to collect Linux, network, web and game data; validate event metadata.", "Input inventory and validation searches for os, network and gamelog.", ["Create forwarder deployment apps", "Onboard OS, network and game-log datasets", "Validate timestamps, host, source and sourcetype"]],
// //   ["2027-01-30", "SPL and field knowledge", "Practice efficient searches, extractions, lookups, calculated fields and reusable knowledge objects.", "Search workbook with expected results and object permissions.", ["Use search, where, eval, stats and timechart", "Practice rex, spath and lookups", "Build macros, tags and event types"]],
// //   ["2027-02-06", "Dashboard Studio and reports", "Build OS, Network and Game Activity dashboards with tokens, filters and drilldowns.", "Three tested, shared dashboards and reusable report searches.", ["Build three dashboards", "Add tokens, inputs and drilldowns", "Test panels and empty-result behavior"]],
// //   ["2027-02-13", "Alerts, CIM and security use cases", "Create scheduled alerts, map data to CIM and document a detection use case.", "Tested alert, CIM checklist and detection explanation.", ["Schedule and test an alert", "Map events and fields to CIM", "Explain detection false positives"]],
// //   ["2027-02-20", "Administration and automation", "Manage user roles, index access, configuration precedence, deployment apps and read-only REST inventory.", "Least-privilege role, versioned configuration app and rollback plan.", ["Review RBAC and knowledge-object sharing", "Use btool and configuration apps", "Document changes and a rollback procedure"]],
// //   ["2027-02-27", "Health, performance and recovery", "Investigate cluster health, slow SPL, queues and storage, then complete a controlled failure/recovery drill.", "Failure-drill report and troubleshooting runbook.", ["Use Monitoring Console, _internal and _audit", "Review slow searches and storage pressure", "Test indexer recovery in the lab"]],
// //   ["2027-03-06", "Modern Splunk capabilities", "Explore SPL2 alongside SPL, AI-assisted query review and modern data pipelines when access permits.", "One SPL2 example and a short platform-boundary explanation.", ["Compare a simple SPL and SPL2 search", "Review generated searches before execution", "Explore Edge Processor and OpenTelemetry concepts"]],
// //   ["2027-03-13", "Capstone demonstration", "Present a working eight-VM Splunk environment with dashboards, alerts, recovery evidence and operations documentation.", "Architecture diagram, sanitized configurations, searches and final runbook.", ["Demonstrate working data and dashboards", "Explain alert and recovery evidence", "Submit a usable operating runbook"]],
// // ];

// // export const LESSONS = RAW_LESSONS.map(([date, title, description, evidence, tasks], index) => ({
// //   id: `oct26-class-${String(index + 1).padStart(2, "0")}`,
// //   number: index + 1,
// //   date,
// //   title,
// //   description,
// //   evidence,
// //   tasks,
// //   time: "8:00 AM Eastern",
// //   videos: [], // Add verified, cohort-approved recordings here after publication.
// //   docs: [], // Add cohort-approved files after publication.
// // }));

// // export const MILESTONES = [
// //   { id: "orientation", date: "2026-10-31", title: "Cohort orientation", kind: "orientation", detail: "8:00–10:00 AM Eastern" },
// //   { id: "power-user", date: "2026-11-28", title: "Power User deadline", kind: "deadline", detail: "Certification target; book exam separately" },
// //   { id: "admin", date: "2026-12-19", title: "Enterprise Admin deadline", kind: "deadline", detail: "Certification target; book exam separately" },
// //   { id: "readiness", date: "2027-01-08", title: "Lab readiness check", kind: "reminder", detail: "Suggested preparation reminder, not a class" },
// //   ...LESSONS.map((lesson) => ({
// //     id: lesson.id, date: lesson.date, title: `${String(lesson.number).padStart(2, "0")} · ${lesson.title}`,
// //     kind: "class", detail: "8:00 AM Eastern",
// //   })),
// // ];

// // export const VM_ROLES = [
// //   { name: "CM1", role: "Cluster manager", count: 1, cpu: 2, ram: 4, disk: 40 },
// //   { name: "IDX1–IDX3", role: "Indexers — data storage and replication", count: 3, cpu: 4, ram: 8, disk: 120 },
// //   { name: "SH1", role: "Search head — searches and dashboards", count: 1, cpu: 4, ram: 8, disk: 60 },
// //   { name: "MC1", role: "Deployment / licensing / monitoring", count: 1, cpu: 2, ram: 6, disk: 60 },
// //   { name: "UF1–UF2", role: "Universal Forwarders — log collection", count: 2, cpu: 1, ram: 2, disk: 20 },
// // ];

// // export const PREP_ITEMS = [
// //   { id: "study", label: "Set a Power User study plan and contact the instructor with questions." },
// //   { id: "splunk-account", label: "Create a Splunk account and confirm download access." },
// //   { id: "server", label: "Obtain a personal lab server and verify its specifications." },
// //   { id: "network", label: "Prepare wired networking, a laptop, USB media and an IP/hostname plan." },
// //   { id: "license", label: "Confirm a legitimate Splunk license covering the hands-on lab period." },
// //   { id: "backup", label: "Back up existing data before installing Proxmox on the chosen disk." },
// // ];

// // export const WEEKLY_CHECKINS = [
// //   "2026-10-31", "2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28",
// //   "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26",
// // ];

// // export function easternToday() {
// //   const parts = new Intl.DateTimeFormat("en-CA", {
// //     timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
// //   }).formatToParts(new Date());
// //   const get = (key) => parts.find((part) => part.type === key)?.value || "";
// //   return `${get("year")}-${get("month")}-${get("day")}`;
// // }

// // export function displayDate(iso, options = { month: "short", day: "numeric", year: "numeric" }) {
// //   return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(`${iso}T12:00:00Z`));
// // }


// // // /**
// // //  * T.O. Analytics 2026–2027 official orientation content.
// // //  * Source: TO Analytics Splunk Orientation 2026.pptx, slides 1–28.
// // //  * Class start times are 8:00 AM America/New_York; no end times supplied.
// // //  * Video and document URLs intentionally remain unpublished.
// // //  */
// // // export const COHORT_ID = "splunk-2026-oct";
// // // export const ORIENTATION_URL = "https://www.to-analytics.com/splunk-orientation";
// // // export const STUDY_HUB_URL = "https://www.to-analytics.com";
// // // export const SERVER_URL = "https://a.co/d/0dqtgNco";
// // // export const DEVELOPER_PROGRAM_URL = "https://dev.splunk.com/developer-program/";

// // // export const CERTIFICATIONS = [
// // //   {
// // //     id: "power-user",
// // //     title: "Splunk Core Certified Power User",
// // //     date: "2026-11-28",
// // //     topic: "SPL, fields, knowledge objects and data models",
// // //     description: "Study using the official objectives, then schedule and complete the actual exam separately.",
// // //   },
// // //   {
// // //     id: "admin",
// // //     title: "Splunk Enterprise Certified Admin",
// // //     date: "2026-12-19",
// // //     topic: "System administration and data administration",
// // //     description: "Power User comes first in this cohort plan. Confirm current exam prerequisites and policies with the provider.",
// // //   },
// // // ];

// // // const RAW_LESSONS = [
// // //   ["2027-01-09", "Proxmox and virtual machines", "Install Proxmox VE, build eight Linux virtual machines, configure networking and record recovery snapshots.", "VM inventory, IP map, SSH tests and restore procedure.", ["Install Proxmox and configure a network bridge", "Create eight Linux VMs with unique hostnames", "Set up SSH, updates and recovery snapshots"]],
// // //   ["2027-01-16", "Distributed Splunk architecture", "Assign Splunk Enterprise and Universal Forwarder roles and configure a working indexer cluster.", "Cluster health evidence, searchable test events and forwarder connectivity.", ["Install CM1, IDX1–IDX3, SH1, MC1 and UF1–UF2", "Configure replication factor 2 and search factor 2", "Connect licensing, deployment and monitoring services"]],
// // //   ["2027-01-23", "Forwarders and data onboarding", "Use forwarder configuration apps to collect Linux, network, web and game data; validate event metadata.", "Input inventory and validation searches for os, network and gamelog.", ["Create forwarder deployment apps", "Onboard OS, network and game-log datasets", "Validate timestamps, host, source and sourcetype"]],
// // //   ["2027-01-30", "SPL and field knowledge", "Practice efficient searches, extractions, lookups, calculated fields and reusable knowledge objects.", "Search workbook with expected results and object permissions.", ["Use search, where, eval, stats and timechart", "Practice rex, spath and lookups", "Build macros, tags and event types"]],
// // //   ["2027-02-06", "Dashboard Studio and reports", "Build OS, Network and Game Activity dashboards with tokens, filters and drilldowns.", "Three tested, shared dashboards and reusable report searches.", ["Build three dashboards", "Add tokens, inputs and drilldowns", "Test panels and empty-result behavior"]],
// // //   ["2027-02-13", "Alerts, CIM and security use cases", "Create scheduled alerts, map data to CIM and document a detection use case.", "Tested alert, CIM checklist and detection explanation.", ["Schedule and test an alert", "Map events and fields to CIM", "Explain detection false positives"]],
// // //   ["2027-02-20", "Administration and automation", "Manage user roles, index access, configuration precedence, deployment apps and read-only REST inventory.", "Least-privilege role, versioned configuration app and rollback plan.", ["Review RBAC and knowledge-object sharing", "Use btool and configuration apps", "Document changes and a rollback procedure"]],
// // //   ["2027-02-27", "Health, performance and recovery", "Investigate cluster health, slow SPL, queues and storage, then complete a controlled failure/recovery drill.", "Failure-drill report and troubleshooting runbook.", ["Use Monitoring Console, _internal and _audit", "Review slow searches and storage pressure", "Test indexer recovery in the lab"]],
// // //   ["2027-03-06", "Modern Splunk capabilities", "Explore SPL2 alongside SPL, AI-assisted query review and modern data pipelines when access permits.", "One SPL2 example and a short platform-boundary explanation.", ["Compare a simple SPL and SPL2 search", "Review generated searches before execution", "Explore Edge Processor and OpenTelemetry concepts"]],
// // //   ["2027-03-13", "Capstone demonstration", "Present a working eight-VM Splunk environment with dashboards, alerts, recovery evidence and operations documentation.", "Architecture diagram, sanitized configurations, searches and final runbook.", ["Demonstrate working data and dashboards", "Explain alert and recovery evidence", "Submit a usable operating runbook"]],
// // // ];

// // // export const LESSONS = RAW_LESSONS.map(([date, title, description, evidence, tasks], index) => ({
// // //   id: `oct26-class-${String(index + 1).padStart(2, "0")}`,
// // //   number: index + 1,
// // //   date,
// // //   title,
// // //   description,
// // //   evidence,
// // //   tasks,
// // //   time: "8:00 AM Eastern",
// // //   videos: [], // Add verified, cohort-approved recordings here after publication.
// // //   docs: [], // Add cohort-approved files after publication.
// // // }));

// // // export const MILESTONES = [
// // //   { id: "orientation", date: "2026-10-31", title: "Cohort orientation", kind: "orientation", detail: "8:00–10:00 AM Eastern" },
// // //   { id: "power-user", date: "2026-11-28", title: "Power User deadline", kind: "deadline", detail: "Certification target; book exam separately" },
// // //   { id: "admin", date: "2026-12-19", title: "Enterprise Admin deadline", kind: "deadline", detail: "Certification target; book exam separately" },
// // //   { id: "readiness", date: "2027-01-08", title: "Lab readiness check", kind: "reminder", detail: "Suggested preparation reminder, not a class" },
// // //   ...LESSONS.map((lesson) => ({
// // //     id: lesson.id, date: lesson.date, title: `${String(lesson.number).padStart(2, "0")} · ${lesson.title}`,
// // //     kind: "class", detail: "8:00 AM Eastern",
// // //   })),
// // // ];

// // // export const VM_ROLES = [
// // //   { name: "CM1", role: "Cluster manager", count: 1, cpu: 2, ram: 4, disk: 40 },
// // //   { name: "IDX1–IDX3", role: "Indexers — data storage and replication", count: 3, cpu: 4, ram: 8, disk: 120 },
// // //   { name: "SH1", role: "Search head — searches and dashboards", count: 1, cpu: 4, ram: 8, disk: 60 },
// // //   { name: "MC1", role: "Deployment / licensing / monitoring", count: 1, cpu: 2, ram: 6, disk: 60 },
// // //   { name: "UF1–UF2", role: "Universal Forwarders — log collection", count: 2, cpu: 1, ram: 2, disk: 20 },
// // // ];

// // // export const PREP_ITEMS = [
// // //   { id: "study", label: "Set a Power User study plan and contact the instructor with questions." },
// // //   { id: "splunk-account", label: "Create a Splunk account and confirm download access." },
// // //   { id: "server", label: "Obtain a personal lab server and verify its specifications." },
// // //   { id: "network", label: "Prepare wired networking, a laptop, USB media and an IP/hostname plan." },
// // //   { id: "license", label: "Confirm a legitimate Splunk license covering the hands-on lab period." },
// // //   { id: "backup", label: "Back up existing data before installing Proxmox on the chosen disk." },
// // // ];

// // // export const WEEKLY_CHECKINS = [
// // //   "2026-10-31", "2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28",
// // //   "2026-12-05", "2026-12-12", "2026-12-19", "2026-12-26",
// // // ];

// // // export function easternToday() {
// // //   const parts = new Intl.DateTimeFormat("en-CA", {
// // //     timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
// // //   }).formatToParts(new Date());
// // //   const get = (key) => parts.find((part) => part.type === key)?.value || "";
// // //   return `${get("year")}-${get("month")}-${get("day")}`;
// // // }

// // // export function displayDate(iso, options = { month: "short", day: "numeric", year: "numeric" }) {
// // //   return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(`${iso}T12:00:00Z`));
// // // }
