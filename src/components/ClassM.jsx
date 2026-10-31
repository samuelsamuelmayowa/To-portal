import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarDays,
  FaCircleCheck,
  FaFileLines,
  FaGraduationCap,
  FaMagnifyingGlassPlus,
  FaMagnifyingGlassMinus,
  FaMoon,
  FaRotate,
  FaShieldHalved,
  FaSun,
} from "react-icons/fa6";

/**
 * T.O Analytics - Orientation Assignment 2026–2027
 *
 * ONE document only. The old assignment list, 2025 links, due dates and
 * PDF iframe have been removed.
 *
 * The supplied 1-page PDF is rendered as a high-resolution image during
 * preparation. The PDF itself is NOT deployed in /public and therefore is
 * not requested by the student's browser.
 *
 * IMPORTANT: This removes the PDF download route/buttons, NOT the ability
 * to screenshot/copy the displayed document. Protect the ROUTE and IMAGE
 * at the server if the content is restricted to enrolled students.
 */
const DOCUMENT_IMAGE = "/course-materials/orientation-assignment-2026.png";
const DASHBOARD_ROUTE = "/dashboard/materials";
const MIN_ZOOM = 75;
const MAX_ZOOM = 200;
const STEP = 25;

function getUserEmail() {
  try {
    const raw = localStorage.getItem("user") || "";
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "string" ? parsed : String(parsed?.email || "");
    } catch {
      return raw;
    }
  } catch {
    return "";
  }
}

export default function ClassM() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("to_orientation_viewer_theme") === "dark";
    } catch {
      return false;
    }
  });
  const [email, setEmail] = useState("");
  const [zoom, setZoom] = useState(100);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setEmail(getUserEmail());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "to_orientation_viewer_theme",
        darkMode ? "dark" : "light"
      );
    } catch {
      // Page works even when browser storage is disabled.
    }
  }, [darkMode]);

  const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + STEP));
  const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, value - STEP));

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen bg-[#f4f7fb] text-slate-900 transition-colors dark:bg-[#071426] dark:text-slate-100">
        {/* Familiar dashboard top bar */}
        <header className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a192c]">
          <div className="mx-auto flex max-w-[1536px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1165cf] text-sm font-black text-white">
                T.O
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">T.O Analytics</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Splunk Student Campus · 2026–2027
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              {email && (
                <span className="hidden max-w-[240px] truncate text-xs text-slate-500 dark:text-slate-300 md:block" title={email}>
                  {email}
                </span>
              )}
              <button
                type="button"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setDarkMode((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-blue-50 dark:border-white/10 dark:hover:bg-white/10"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <NavLink
                to={DASHBOARD_ROUTE}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-extrabold transition hover:bg-blue-50 dark:border-white/10 dark:hover:bg-white/10"
              >
                <FaArrowLeft /> <span className="hidden sm:inline">My dashboard</span>
              </NavLink>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1536px] gap-6 px-4 py-6 sm:px-7 lg:grid-cols-[245px_minmax(0,1fr)] lg:px-10 lg:py-9">
          {/* Existing dashboard's sidebar style */}
          <aside>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#102037] lg:sticky lg:top-6">
              <div className="rounded-2xl bg-[#edf5ff] p-4 dark:bg-[#1a3554]">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1165cf] dark:text-sky-300">
                  <FaGraduationCap /> Learning space
                </div>
                <h2 className="mt-3 text-base font-black">Orientation resources</h2>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-300">
                  One document · Updated for 2026–2027
                </p>
              </div>

              <p className="mb-3 mt-6 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Workspace
              </p>
              <div className="flex items-center gap-3 rounded-xl bg-[#0a62d2] px-3 py-3 text-sm font-bold text-white">
                <FaFileLines /> Orientation assignment
              </div>
              <NavLink
                to={DASHBOARD_ROUTE}
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <FaBookOpen /> My courses
              </NavLink>
              <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                  <FaShieldHalved className="mt-0.5 shrink-0 text-blue-600 dark:text-sky-300" />
                  <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Read the instructions on this page. No PDF download or print option is provided.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            {/* Same blue/navy hero treatment as the original CoursePortal */}
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a254a] via-[#0c3a73] to-[#1168a8] px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-10">
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[48px] border-white/[0.05]" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
                  <FaGraduationCap /> T.O Analytics Splunk Training
                </span>
                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Orientation Assignment
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                  Your official onboarding assignment for the 2026–2027 Splunk training program. Read the complete document below.
                </p>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#102037]">
                <FaFileLines className="text-xl text-blue-600 dark:text-sky-300" />
                <p className="mt-3 text-2xl font-black">01</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Document</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#102037]">
                <FaCalendarDays className="text-xl text-blue-600 dark:text-sky-300" />
                <p className="mt-3 text-base font-black">Oct 31, 2026</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Orientation date</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#102037]">
                <FaCircleCheck className="text-xl text-blue-600 dark:text-sky-300" />
                <p className="mt-3 text-2xl font-black">03</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Required task sections</p>
              </div>
            </div>

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#102037]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-white/10 sm:px-7">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-blue-700 dark:text-sky-300">
                    Official training document
                  </p>
                  <h2 className="mt-2 text-xl font-black">Orientation Assignment · 2026–2027</h2>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    One-page, view-only document. Original PDF is not served by this page.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2" aria-label="Document zoom controls">
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    aria-label="Zoom out"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10"
                  ><FaMagnifyingGlassMinus /></button>
                  <span className="w-11 text-center text-xs font-black tabular-nums">{zoom}%</span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    aria-label="Zoom in"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/10"
                  ><FaMagnifyingGlassPlus /></button>
                  <button
                    type="button"
                    onClick={() => setZoom(100)}
                    aria-label="Reset zoom"
                    title="Reset zoom"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-blue-50 dark:border-white/10 dark:hover:bg-white/10"
                  ><FaRotate /></button>
                </div>
              </div>

              <div className="bg-[#e8edf4] p-2 dark:bg-[#091626] sm:p-5">
                {imageError ? (
                  <div role="alert" className="rounded-xl bg-white px-6 py-20 text-center text-sm font-semibold text-red-600">
                    The document image could not be loaded. Check that the file is in public/course-materials/.
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-[900px] overflow-x-auto rounded-lg bg-white shadow-lg">
                    <img
                      src={DOCUMENT_IMAGE}
                      alt="T.O Analytics Orientation Assignment 2026–2027. One page with instructions for a lab server purchase, Splunk developer license and Power User exam booking, and student account and course payment."
                      className="block h-auto select-none"
                      style={{ width: `${zoom}%`, maxWidth: "none" }}
                      draggable={false}
                      onContextMenu={(event) => event.preventDefault()}
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400 sm:px-7">
                <span>Page 1 of 1 · Scroll to read the full document</span>
                <span>Viewing only · No download controls</span>
              </div>
            </section>

            <footer className="border-t border-slate-200 py-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
              T.O Analytics LLC · Splunk Orientation · 2026–2027
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

// import { useState, useEffect } from "react";

// const ClassM = () => {
//   const [assignment, setAssignment] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [selectedDoc, setSelectedDoc] = useState(null);
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     const e = localStorage.getItem("user") || "";
//     setUserEmail(e);
//   });
//   useEffect(() => {
//     // Example assignment data
//     const data = {
//       title: "Splunk Assignment",
//       description:
//         "Read all the documents below carefully and complete the required tasks.",
//       docs: [


//         {
//               // https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview
//               id: 1,
//           title: "Splunk Class 13 Assignment",
//           // title: "Assignment Instructions",
//           url: "https://docs.google.com/presentation/d/1qhw9ejjWVco5QineUKqEQgTjoKg8STCR/preview",
//           // dueDate: "2025-12-13",
//         }, 
//         {
//               // https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview
//               id: 2,
//           title: "Splunk Class 9 Assignment",
//           // title: "Assignment Instructions",
//           url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
//           // dueDate: "2025-12-13",
//         }, 
//         {
//           id: 3,
//           title: "Splunk Class 8 Assignment",
//           // title: "Assignment Instructions",
//           url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
//           dueDate: "2025-12-13",
//         },
//         // {
//         //   id: 2,
//         //   title: "Sample Log Files",
//         //   url: "https://drive.google.com/file/d/1swg7fD7Q6DEO_E8PQZTIiPCrNtikWlSK/preview",
//         //   dueDate: "2025-11-09",
//         // },
//         {
//           id: 4,
//           title: "Splunk Class 6 Assignment",
//           // title:"Splunk class 4 Assignment",
//           url:"https://drive.google.com/file/d/1GPgqIpna2-BK1kcksSdSFW-7ZCM3Fj4-/preview",
//           // url: "https://drive.google.com/file/d/1SDDn63LQqEidjk2ZBRejqYfE-LnbiY76/preview",
//           dueDate: "2025-12-02",
//         },
//         {
//           id: 5,
//           title: "Splunk class 4 Assignment",
//           url: "https://docs.google.com/presentation/d/1QH0-bN_phVwY5MGVPOcOnbAC9HmKuShL/preview",
//           dueDate: "2025-11-8",
//         },
//         {
//           id: 6,
//           title: "Splunk class 3 Assignment",
//           url: " https://drive.google.com/file/d/179_DKTqGoGjBrszOPRCJqGu3VFlXUbXe/preview",
//           dueDate: "2025-11-10",
//         },
//       ],
//     };

//     setAssignment(data);
//     setSelectedDoc(data.docs[0]);
//   }, []);

//   if (!assignment) return <p>Loading assignment...</p>;

//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 space-y-6">
//       {/* HEADER */}
//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="dashboard-topbar bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//               To-Analytics Learning Portal
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Professional Splunk Bootcamp Dashboard
//             </p>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="text-sm text-gray-600 dark:text-gray-300">
//               {userEmail}
//             </div>

//             {/* Remove if not imported */}

//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className="px-3 py-1 rounded-lg text-sm 
//             bg-gray-100 text-gray-800 
//             dark:bg-gray-800 dark:text-white
//             border border-gray-300 dark:border-gray-700
//             hover:bg-gray-200 dark:hover:bg-gray-700 transition"
//             >
//               {darkMode ? "Light Mode" : "Dark Mode"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* PAGE TITLE */}
//       <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//         Assignment
//       </h1>

//       {/* ASSIGNMENT CARD */}
//       <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md rounded-2xl p-6 space-y-4">
//         <h2 className="text-xl font-semibold">
//           {assignment?.title || "No Assignment Selected"}
//         </h2>

//         <p className="text-gray-700 dark:text-gray-400">
//           {assignment?.description || "No description available"}
//         </p>

//         {/* DOCUMENT BUTTONS */}
//         <div className="flex flex-wrap gap-3 pt-2">
//           {assignment?.docs?.length ? (
//             assignment.docs.map((doc) => (
//               <button
//                 key={doc.id}
//                 onClick={() => setSelectedDoc(doc)}
//                 className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
//                   selectedDoc?.id === doc.id
//                     ? "bg-gray-800 text-white dark:bg-white dark:text-black"
//                     : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
//                 }`}
//               >
//                 {doc.title}
//               </button>
//             ))
//           ) : (
//             <p className="text-gray-500">No documents available.</p>
//           )}
//         </div>

//         {/* DOCUMENT VIEWER */}
//         <div className="w-full h-[550px] mt-4 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
//           {selectedDoc ? (
//             <iframe
//               src={selectedDoc.url}
//               title={selectedDoc.title}
//               className="w-full h-full bg-white dark:bg-gray-950"
//               frameBorder="0"
//               allowFullScreen
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-400">
//               Select a document to preview
//             </div>
//           )}
//         </div>

//         {/* DOCUMENT DETAILS */}
//         {selectedDoc && (
//           <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
//             <p>
//               <strong>Document:</strong> {selectedDoc.title}
//             </p>

//             <p>
//               <strong>Due Date:</strong> {selectedDoc.dueDate}
//             </p>

//             <p>
//               <strong>Open in new tab:</strong>{" "}
//               <a
//                 href={selectedDoc.url}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-blue-600 dark:text-blue-400 underline break-words"
//               >
//                 {selectedDoc.url}
//               </a>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
