import { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { LOGS } from "../data/logs";
import { runSPL } from "../utils/splEngine";

/* ---------------- UI CONSTANTS ---------------- */

const SUGGESTIONS = [
  "index=_internal",
  "index=_internal ERROR",
  "index=_internal | stats count by sourcetype",
  "index=_internal | timechart span=15m count",
  "index=auth_logs status=FAILED",
  "index=auth_logs | stats count by user",
  "index=auth_logs | top src_ip limit=10",
];

const LABS = [
  {
    id: "lab-1",
    title: "Explore Internal Logs",
    goal: "Search internal logs and isolate ERROR events",
    hint: "Use keyword filtering",
    starter: "index=_internal ERROR",
    expected: (q, res) =>
      q.includes("_internal") && q.toUpperCase().includes("ERROR") && res?.count > 0,
  },
  {
    id: "lab-2",
    title: "Build a Report",
    goal: "Summarize events by sourcetype",
    hint: "Use stats count by sourcetype",
    starter: "index=_internal | stats count by sourcetype",
    expected: (q, res) => res?.mode === "table",
  },
  {
    id: "lab-3",
    title: "Visualize Over Time",
    goal: "Create a time-based visualization",
    hint: "Use timechart",
    starter: "index=_internal | timechart span=15m count",
    expected: (q, res) => res?.mode === "timechart",
  },
];

/* ---------------- MINI CHART ---------------- */

function BlossomChart({ rows, xKey, yKey }) {
  const max = Math.max(...rows.map((r) => Number(r[yKey] || 0)), 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {rows.slice(0, 14).map((r, i) => {
        const h = Math.round((r[yKey] / max) * 150);
        return (
          <div key={i} className="flex-1 text-center">
            <div
              className="mx-auto w-full rounded-xl bg-gradient-to-t from-cyan-500/90 to-blue-500/70 shadow-md"
              style={{ height: h }}
            />
            <div className="mt-2 text-[10px] text-gray-400 truncate">
              {String(r[xKey])}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- MAIN ---------------- */

export default function StockPortal() {
  const [query, setQuery] = useState("index=_internal");
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("events");
  const [showHints, setShowHints] = useState(false);

  const [activeLabId, setActiveLabId] = useState(LABS[0].id);
  const [labOk, setLabOk] = useState(null);

  const activeLab = useMemo(
    () => LABS.find((l) => l.id === activeLabId),
    [activeLabId]
  );

  const suggestions = useMemo(() => {
    return SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  }, [query]);

  const runSearch = () => {
    const out = runSPL(query, LOGS);
    if (out?.error) {
      setError(out.error);
      setRes(null);
      return;
    }
    setError("");
    setRes(out);
    setTab(out.mode === "timechart" ? "chart" : out.mode);
    setLabOk(activeLab.expected(query, out));
  };

  const rows = res?.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            Splunk Practice Lab
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">
              Studio
            </span>
            <Sparkles className="text-cyan-400" size={18} />
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400 leading-relaxed">
            A calm, interactive Search & Reporting environment where students
            practice SPL, build reports, visualize data, and understand alert
            foundations — exactly how Splunk works.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-10">

          {/* LEFT PANEL */}
          <aside className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Learning Path
            </h3>

            <div className="space-y-3">
              {LABS.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setActiveLabId(lab.id);
                    setQuery(lab.starter);
                    setLabOk(null);
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all
                    ${activeLabId === lab.id
                      ? "bg-cyan-500/10 border border-cyan-400/40"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"}
                  `}
                >
                  <div className="font-medium">{lab.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {lab.goal}
                  </div>
                </button>
              ))}
            </div>

            {labOk !== null && (
              <div
                className={`mt-6 p-4 rounded-2xl border text-sm ${
                  labOk
                    ? "border-green-500/40 bg-green-500/10 text-green-300"
                    : "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
                }`}
              >
                {labOk ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Step completed successfully
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Try again — {activeLab.hint}
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* RIGHT PANEL */}
          <main>
            {/* SEARCH */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <Search className="text-gray-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowHints(true);
                  }}
                  onBlur={() => setTimeout(() => setShowHints(false), 150)}
                  className="flex-1 bg-transparent outline-none font-mono text-sm text-cyan-100 placeholder-gray-500"
                  placeholder="index=_internal | stats count"
                />
                <button
                  onClick={runSearch}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-sm shadow-lg hover:opacity-90"
                >
                  Run
                </button>
              </div>

              {showHints && suggestions.length > 0 && (
                <div className="absolute left-5 right-5 top-[72px] bg-[#020617] border border-white/10 rounded-2xl overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(s);
                        setShowHints(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-mono hover:bg-cyan-500/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RESULTS */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              {!res ? (
                <div className="text-gray-400 text-sm">
                  Run a search to see results.
                </div>
              ) : tab === "chart" ? (
                <BlossomChart
                  rows={rows}
                  xKey={Object.keys(rows[0])[0]}
                  yKey="count"
                />
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400">
                        {Object.keys(rows[0]).slice(0, 7).map((k) => (
                          <th key={k} className="pb-3 text-left">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 40).map((r, i) => (
                        <tr key={i} className="border-t border-white/10">
                          {Object.keys(rows[0]).slice(0, 7).map((k) => (
                            <td key={k} className="py-2">
                              {k === "_time"
                                ? new Date(r[k]).toLocaleString()
                                : String(r[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}


// import React, { useEffect, useRef, useState } from "react";
// import Player from "@vimeo/player";
// import { NavLink } from "react-router-dom";
// import DashboardDropdown from "./Dropdown";
// import NewFeaturePopup from "./Newapp";
// import Dropdownstock from "./DropdownStock";

// const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

// // ✅ Authorized student emails
// const allowedEmails = [
//   "jahdek76@gmail.com",
//   "samuelsamuelmayowa@gmail.com",
//   "adenusitimi@gmail.com",
//   "oluwaferanmiolulana@gmail.com",
//   "oluwaferanmi.olulana@gmail.com",
//   "tomideolulana@gmail.com",
//   "yinkalola51@gmail.com",
//   "toanalyticsllc@gmail.com",
//   "kevwe_oberiko@yahoo.com",
//   "denisgsam@gmail.com",
//   "fpasamuelmayowa51@gmail.com",
//   "oluwatiroyeamoye@gmail.com",
//   "trbanjo@gmail.com",
//   "emanfrimpong@gmail.com",
//   "dipeoluolatunji@gmail.com",
//   "lybertyudochuu@gmail.com",
// ];

// // ✅ Course content for STOCK & OPTIONS
// const sampleCourses = [
//   {
//     id: "stock",
//     title: "Stock & Options Mastery",
//     classes: [
//       {
//         id: "class1",
//         title: "Orientation — Stock Market Basics",
//         videos: [
//           {
//             id: "v1",
//             title: "Understanding How the Stock Market Works",
//             url: "https://player.vimeo.com/video/1157909911", // Example Vimeo link
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "Orientation — What Are Stocks and Shares?",
//             url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
//           },
//         ],
//       },
//       {
//         id: "class2",
//         title: "Class 1 — Introduction to Options Trading",
//         videos: [
//           {
//             id: "v2",
//             title: "Calls vs Puts Explained with Real-Life Charts",
//             url: "https://player.vimeo.com/video/1158002922",
//           },
//         ],
//         docs: [
//           {
//             id: "d2",
//             title: "Option Trading Notes",
//             url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
//           },
//         ],
//       },
//       {
//         id: "class3",
//         title: "Class 2 — Chart Patterns & Technical Indicators",
//         videos: [
//           {
//             id: "v3",
//             title: "Candlestick Patterns for Option Traders",
//             url: "https://player.vimeo.com/video/1158050009",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Technical Indicators Guide (RSI, MACD, EMA)",
//             url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
//           },
//         ],
//       },
//       {
//         id: "class4",
//         title: "Class 3 — Risk Management & Greeks",
//         videos: [
//           {
//             id: "v4",
//             title: "Delta, Theta, Vega, Gamma — The Option Greeks Simplified",
//             url: "https://player.vimeo.com/video/1158124450",
//           },
//         ],
//         docs: [
//           {
//             id: "d4",
//             title: "Risk Management Rules for Traders",
//             url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//         ],
//       },
//       {
//         id: "class5",
//         title: "Class 4 — Trading Psychology & Strategy Setup",
//         videos: [],
//         docs: [],
//       },
//     ],
//   },
// ];

// // ✅ Local progress key
// function storageProgressKey(email) {
//   return `stock_progress_${(email || "").toLowerCase().trim()}`;
// }

// export default function StockPortal() {
//   const [courses] = useState(sampleCourses);
//   const [selectedCourse, setSelectedCourse] = useState(courses[0]);
//   const [selectedClass, setSelectedClass] = useState(courses[0].classes[0]);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [thumbnails, setThumbnails] = useState({});
//   const [isAllowed, setIsAllowed] = useState(false);
//   const [userEmail, setUserEmail] = useState("");
//   const [progressState, setProgressState] = useState({});
//   const playerRef = useRef(null);
//   const vimeoPlayerRef = useRef(null);
//   const [isMutedHint, setIsMutedHint] = useState(false);

//   // ✅ Initialize user and fetch saved progress
//   useEffect(() => {
//     const email = localStorage.getItem("user") || "";
//     setUserEmail(email);
//     setIsAllowed(
//       allowedEmails
//         .map((a) => a.toLowerCase())
//         .includes((email || "").toLowerCase())
//     );

//     async function fetchProgress() {
//       if (!email) return;
//       try {
//         const res = await fetch(`${API_BASE}/api/progress/${email}`);
//         if (!res.ok) throw new Error("Progress fetch failed");
//         const data = await res.json();
//         const mapped = {};
//         data.forEach((p) => {
//           mapped[p.classId] = {
//             note: p.note || "",
//             time: p.time || 0,
//             duration: p.duration || 0,
//             completed: p.completed || false,
//           };
//         });
//         setProgressState(mapped);
//         localStorage.setItem(storageProgressKey(email), JSON.stringify(mapped));
//       } catch {
//         try {
//           const saved = JSON.parse(
//             localStorage.getItem(storageProgressKey(email)) || "{}"
//           );
//           setProgressState(saved);
//         } catch {
//           setProgressState({});
//         }
//       }
//     }

//     fetchProgress();
//     setSelectedCourse(courses[0]);
//     setSelectedClass(courses[0].classes[0]);
//   }, [courses]);

//   // ✅ Fetch Vimeo thumbnails
//   useEffect(() => {
//     async function fetchThumbs() {
//       const videos = selectedClass.videos || [];
//       const vmap = {};
//       await Promise.all(
//         videos.map(async (v) => {
//           try {
//             const videoUrl = v.url.replace("player.", "");
//             const res = await fetch(
//               `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`
//             );
//             const data = await res.json();
//             vmap[v.id] = data.thumbnail_url;
//           } catch {
//             vmap[v.id] = null;
//           }
//         })
//       );
//       setThumbnails(vmap);
//     }
//     fetchThumbs();
//   }, [selectedClass]);

//   // ✅ Initialize player when video changes
//   useEffect(() => {
//     if (!selectedVideo) return;
//     if (vimeoPlayerRef.current) {
//       try {
//         vimeoPlayerRef.current.destroy();
//       } catch {}
//       vimeoPlayerRef.current = null;
//     }

//     const iframe = document.createElement("iframe");
//     iframe.setAttribute("src", `${selectedVideo.url}?transparent=0&autoplay=0`);
//     iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
//     iframe.style.width = "100%";
//     iframe.style.height = "100%";
//     iframe.setAttribute("frameborder", "0");

//     if (playerRef.current) {
//       playerRef.current.innerHTML = "";
//       playerRef.current.appendChild(iframe);
//     }

//     const player = new Player(iframe);
//     vimeoPlayerRef.current = player;

//     player.setVolume(1).catch(() => setIsMutedHint(true));

//     // Save progress
//     const interval = setInterval(async () => {
//       try {
//         const t = await player.getCurrentTime();
//         const d = await player.getDuration();
//         updateProgress(selectedClass.id, selectedVideo.id, t, d);
//       } catch {}
//     }, 3000);

//     return () => {
//       clearInterval(interval);
//       try {
//         player.destroy();
//       } catch {}
//     };
//   }, [selectedVideo]);

//   function updateProgress(classId, videoId, time, duration) {
//     const email = userEmail || "anonymous";
//     const key = storageProgressKey(email);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");
//     prev[classId] = { ...(prev[classId] || {}), videoId, time };
//     if (duration > 0 && time / duration >= 0.9) {
//       prev[classId].completed = true;
//     }
//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function markClassCompleted(classId) {
//     const email = userEmail || "anonymous";
//     const key = storageProgressKey(email);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");
//     prev[classId] = { ...(prev[classId] || {}), completed: true };
//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function isClassCompleted(id) {
//     return progressState[id]?.completed;
//   }

//   if (!isAllowed) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//         <h1 className="text-3xl font-bold text-red-600 mb-4">
//           Access Denied 🚫
//         </h1>
//         <p className="text-gray-700">
//           Only authorized Stock & Options students can view this page.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       {/* <NewFeaturePopup /> */}
//       {/* <DashboardDropdown /> */}
//     <Dropdownstock/>
//       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
//         {/* Sidebar */}
//         <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Classes</h2>

//           {courses.map((c) => (
//             <div key={c.id}>
//               <button
//                 onClick={() => {
//                   setSelectedCourse(c);
//                   setSelectedClass(c.classes[0]);
//                 }}
//                 className={`w-full text-left px-3 py-2 rounded-xl ${
//                   c.id === selectedCourse.id ? "bg-gray-100 font-semibold" : ""
//                 }`}
//               >
//                 {c.title}
//               </button>

//               {c.id === selectedCourse.id && (
//                 <div className="ml-3 mt-2 space-y-1">
//                   {c.classes.map((cl) => (
//                     <button
//                       key={cl.id}
//                       onClick={() => setSelectedClass(cl)}
//                       className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
//                         cl.id === selectedClass.id
//                           ? "bg-blue-50 font-medium"
//                           : "hover:bg-gray-50"
//                       }`}
//                     >
//                       {isClassCompleted(cl.id) ? "✅" : "⭕"} {cl.title}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </aside>

//         {/* Main content */}
//         <main className="col-span-12 md:col-span-6 bg-white rounded-2xl p-4 shadow-sm">
//           <h1 className="text-xl font-bold">{selectedClass.title}</h1>

//           <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
//             {selectedClass.videos.map((v) => (
//               <div
//                 key={v.id}
//                 className={`p-3 rounded-xl border ${
//                   selectedVideo && selectedVideo.id === v.id
//                     ? "border-blue-400 shadow"
//                     : "border-gray-200"
//                 }`}
//               >
//                 <div className="w-full h-40 bg-gray-200 overflow-hidden rounded">
//                   {thumbnails[v.id] ? (
//                     <img
//                       src={thumbnails[v.id]}
//                       alt={v.title}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center h-full text-sm text-gray-500">
//                       No thumbnail
//                     </div>
//                   )}
//                 </div>
//                 <div className="mt-2 flex items-center justify-between">
//                   <div className="font-medium">{v.title}</div>
//                   <button
//                     onClick={() => setSelectedVideo(v)}
//                     className="px-3 py-1 bg-blue-600 text-white rounded"
//                   >
//                     Play
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Player */}
//           <div className="mt-6">
//             <div
//               className="rounded-xl overflow-hidden border h-[420px] bg-black"
//               ref={playerRef}
//             />
//             {isMutedHint && (
//               <p className="text-xs text-red-500 mt-2">
//                 🔇 Allow audio manually in your browser.
//               </p>
//             )}
//             <button
//               onClick={() => markClassCompleted(selectedClass.id)}
//               className="mt-3 px-3 py-2 bg-gray-100 rounded-lg text-sm"
//             >
//               Mark as Complete
//             </button>
//           </div>
//         </main>

//         {/* Docs */}
//         <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
//           <h3 className="font-semibold">Slides & Notes</h3>
//           {selectedClass.docs.length > 0 ? (
//             selectedClass.docs.map((doc) => (
//               <div key={doc.id} className="mt-2">
//                 <a
//                   href={doc.url}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-sm underline"
//                 >
//                   {doc.title}
//                 </a>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-gray-500 mt-2">
//               No slides yet for this class.
//             </p>
//           )}
//         </aside>
//       </div>
//     </div>
//   );
// }
