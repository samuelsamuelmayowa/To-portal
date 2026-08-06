import React, { useEffect, useMemo, useRef, useState } from "react";
import Player from "@vimeo/player";
import { NavLink } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaCheck,
  FaCirclePlay,
  FaClock,
  FaDownload,
  FaFileLines,
  FaGraduationCap,
  FaLayerGroup,
  FaLock,
  FaMagnifyingGlass,
  FaMoon,
  FaNoteSticky,
  FaRotateRight,
  FaShieldHalved,
  FaSun,
  FaVideo,
  FaXmark,
} from "react-icons/fa6";

import DashboardDropdown from "./Dropdown";
import SplunkKnowledgePopup from "./SplunkKnowledgePopup";

const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

/*
  KEEP YOUR EXISTING:
  const allowedEmails = [...]
  const sampleCourses = [...]
*/
// const allowedEmails = [
//   "sammmyayo@gmail.com",
//   "Sammmyayo@gmail.com",
//   "kewizle.k@gmail.com",
//   "kewizlek@gmail.com",
//   "pamelaabina24@gmail.com",
//   "Pamelaabina24@gmail.com",
//   "basseyvera018@gmail.com",
//   "Kewizle.k@gmail.com",
//   "Davidayeni63@gmail.com",
//   "Adesh25416@gmail.com",
//   "davidayeni63@gmail.com",
//   "adesh25416@gmail.com",
//   "codeverseprogramming23@gmail.com",
//   "ooolajuyigbe@gmail.com",
//   "fadeleolutola@gmail.com",
//   "jahdek76@gmail.com",
//   "samuelsamuelmayowa@gmail.com",
//   "adenusitimi@gmail.com",
//   "oluwaferanmiolulana@gmail.com",
//   "oluwaferanmi.olulana@gmail.com",
//   "tomideolulana@gmail.com",
//   "randommayowa@gmail.com",
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



const sampleCourses = [
  {
    id: "splunk",
    title: "Splunk Training",
    classes: [
      {
        id: "class1",
        title: "Orientation — Intro (1 Videos)",
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
            title: "To-analytics Orientation",
            url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
          },
        ],
      },
      {
        id: "class2",
        title: "Class 1 — Splunk  SIEM (1 Videos)",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 1",
            url: "https://player.vimeo.com/video/1127004938",
          },
        ],
        docs: [
          {
            id: "d1",
            title: "To-analytics Splunk Class 1 Intro",
            url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
          },
          {
            id: "d2",
            title: "To-analytics Splunk Class 1 Note",
            url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
          },
        ],
      },
      {
        id: "class3",
        title: "Class 2 —  Splunk Basics",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 2",
            url: "https://player.vimeo.com/video/1131114931",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "To-analytics Splunk Class 2",
            url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
          },
          {
            id: "d4",
            title: "To-analytics Splunk  Class 2 Note",
            url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
          },
        ],
      },
      {
        id: "class4",
        title: "Class 3 — Splunk SPL",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 3",
            url: "https://player.vimeo.com/video/1133357923",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "To-analytics Splunk Class 3",
            url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
          },
          {
            id: "d4",
            title: "To-analytics Splunk Class 3 Note",
            url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
          },
        ],
      },
      {
        id: "class5",
        title: "Class 4 — SPL Part 2",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 4",
            url: "https://player.vimeo.com/video/1136469770",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "To-analytics Splunk Class 4",
            url: "https://drive.google.com/file/d/1XVZBJxSCe_bj-MP93nGyJPKG3qoKjrb_/preview",
            // url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
          },
        ],
      },

      {
        id: "class6",
        title: "Class 5  — Splunk SPL  LAB",
        desc: "Creating reports, dashboards, visualizations, inputs and filters. .",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 5",
            url: "https://player.vimeo.com/video/1138152119",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "Splunk Class 5 Slides",
            url: "",
            // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
          },

          {
            id: "d3",
            title: "Splunk Class 5 Note",
            url: "https://drive.google.com/file/d/1RrF8dEuaUgyKiWhF8lQ4h-WiN9CUb4gE/preview",
            // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
          },
        ],
      },

      {
        id: "class8",
        title: "Class 6  — Splunk Knowledge Objects.",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 6",
            url: "https://player.vimeo.com/video/1140703570",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "Splunk Class 6 Slides",
            url: "https://drive.google.com/file/d/1cXBItLD6OpbOY6aDi5NGQ0-KXJbutCIS/view?usp=sharing",
          },

          {
            id: "d3",
            title: "Splunk Class 6 Note",
            url: "https://drive.google.com/file/d/1fVtS0u-mPndEiVbSGm1f2H5Qm_Dx3CzV/preview",
          },
        ],
      },

      {
        id: "class7",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 7 Splunk Lab Knowledge Objects",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 7",
            url: "https://player.vimeo.com/video/1145017764",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "",
            url: "",
          },
        ],
      },

      // https://player.vimeo.com/video/1149696096
      {
        id: "class8",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 8 Splunk Dashboard ",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 8",
            url: "https://player.vimeo.com/video/1146557656",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "T.O_Analytics_Splunk_Class_8",
            url: "https://drive.google.com/file/d/1jBaWruZc2sgrmzuLFWuwtcNMHrOiab8K/preview",
          },

          {
            id: "d3",
            title: "T.O_Analytics_Splunk_Class_8 Note",
            url: "https://drive.google.com/file/d/1EvVwiUgfR8Vl1q4MIIUPCmHnFDDKvPg4/preview",
          },

          {
            id: "d3",
            title: "T.O_Analytics_Splunk_Class_8 Assignment",
            url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
          },
        ],
      },

      {
        id: "class9",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 9 Splunk Dashboard Lab",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 9",
            url: "https://player.vimeo.com/video/1149696096",
          },
        ],
        docs: [
          {
            id: "",
            title: "",
            url: "",
          },
        ],
      },
      //

      {
        id: "class10",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 10 Certification Exam, Job & Assignment Review",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "To-analytics Splunk Class 10",
            url: "https://player.vimeo.com/video/1153292493",
          },
        ],
        docs: [
          {
            id: "",
            title: "Assignment",
            url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
          },
        ],
      },

      {
        id: "class11",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 11 Onboarding data",
        // desc: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/view?usp=sharing",
        videos: [
          {
            id: "v2",
            title: "",
            url: "https://player.vimeo.com/video/1156881908",
          },
        ],
        docs: [
          {
            id: "",
            title: "Onboarding data ",
            url: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/preview",
          },
        ],
      },

      {
        id: "class12",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 12 Data Onboarding Lab.",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "Class 12 Data Onboarding Lab",
            url: "https://player.vimeo.com/video/1158631944",
            // url: "",
          },
        ],
        docs: [
          {
            id: "dv",
            title: "Class 12 Data Onboarding Lab",
            url: "",
          },
        ],
      },

      {
        id: "class13",
        // title: "Class 7  —  Splunk Dashboard",
        title: "Class 13 Data Onboarding Lab.",
        desc: "",
        videos: [
          {
            id: "v2",
            title: "Class 13 Data Onboarding Lab",
            url: "https://player.vimeo.com/video/1161024327",

            // url: "",
          },
        ],
        docs: [
          {
            id: "dv",
            title: "Class 13 Data Onboarding Lab",
            url: "https://docs.google.com/presentation/d/16tCZ7QDzXSVXw7RnQFvKxO7mZEH1E87d/preview",
          },
        ],
      },
    ],
  },
];

const fullSplunkSyllabus = sampleCourses
  .find((c) => c.id === "splunk")
  .classes.map((cls, index) => ({
    week: index + 1,
    title: cls.title,
    desc: cls.desc || "Session content delivered in the sample course.",
    videos: cls.videos || [],
    docs: cls.docs || [],
  }));

function storageProgressKey(email) {
  return `cp_progress_${(email || "").toLowerCase().trim()}`;
}

function normalizeEmail(raw) {
  try {
    if (!raw) return "";

    const parsed = JSON.parse(raw);
    return (parsed?.email || raw).toLowerCase().trim();
  } catch {
    return (raw || "").toLowerCase().trim();
  }
}

function getClassProgress(progress) {
  if (!progress) return 0;

  if (progress.completed) return 100;

  if (progress.time && progress.duration) {
    return Math.min((progress.time / progress.duration) * 100, 100);
  }

  return progress.time ? 12 : 0;
}

function AssignmentToast({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[92%] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white hover:text-slate-950"
      >
        <FaXmark />
      </button>

      <div className="flex gap-4 pr-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-BLUE text-white">
          <FaFileLines />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            New Assignment
          </p>
          <h2 className="mt-1 text-lg font-black">
            New assignment has been released!
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Open your materials section to view the latest assignment document.
          </p>
        </div>
      </div>
    </div>
  );
}

function AccessDenied({ userEmail }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-16 text-white">
      <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-BLUE/35 blur-[140px]" />
      <div className="absolute bottom-[-220px] right-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/20 blur-[150px]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative z-10 w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/15 text-3xl text-red-300">
          <FaLock />
        </div>

        <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-red-300">
          Access Denied
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Learning Portal Locked
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base font-medium leading-8 text-white/65">
          This page is restricted to authorized T.O Analytics members only.
          Please log in with an approved student account.
        </p>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
            Current Account
          </p>
          <p className="mt-2 break-all text-sm font-bold text-white/80">
            {userEmail || "No account detected"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <NavLink
            to="/login"
            className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition hover:-translate-y-1"
          >
            Login
          </NavLink>

          <NavLink
            to="/dashboard"
            className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-BLUE"
          >
            Back to Dashboard
          </NavLink>
        </div>
      </div>
    </main>
  );
}

function SyllabusSection({ onSelectClass }) {
  return (
    <div className="space-y-5">
      {fullSplunkSyllabus.map((week, index) => {
        const validVideos = (week.videos || []).filter((v) => v?.url);
        const validDocs = (week.docs || []).filter((d) => d?.url && d?.title);

        return (
          <div
            key={index}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.09]"
          >
            <div className="absolute right-5 top-5 text-7xl font-black text-white/[0.03]">
              {week.week}
            </div>

            <div className="relative z-10 flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-BLUE text-lg font-black text-white">
                {week.week}
              </div>

              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                  Week {week.week}
                </p>

                <h3 className="mt-2 text-xl font-black text-white">
                  {week.title}
                </h3>

                <p className="mt-2 text-sm font-medium leading-7 text-white/55">
                  {week.desc}
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                      <FaVideo className="text-cyan-200" />
                      Videos
                    </div>

                    {validVideos.length ? (
                      <div className="space-y-2">
                        {validVideos.map((video, i) => (
                          <a
                            key={i}
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white hover:text-BLUE"
                          >
                            {video.title || "Class Video"}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-white/35">
                        No videos attached yet
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                      <FaFileLines className="text-cyan-200" />
                      Documents
                    </div>

                    {validDocs.length ? (
                      <div className="space-y-2">
                        {validDocs.map((doc, i) => (
                          <a
                            key={i}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:bg-white hover:text-BLUE"
                          >
                            {doc.title}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-white/35">
                        No documents attached yet
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectClass(index)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-BLUE transition hover:-translate-y-1"
                >
                  Open Week {week.week}
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CoursePortal() {
  const [showNewAssignmentAlert, setShowNewAssignmentAlert] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const [courses] = useState(sampleCourses);
  const [selectedCourse, setSelectedCourse] = useState(sampleCourses[0]);
  const [selectedClass, setSelectedClass] = useState(
    sampleCourses[0].classes[0],
  );
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [showSyllabus, setShowSyllabus] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const [thumbnails, setThumbnails] = useState({});
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  // const [userEmail, setUserEmail] = useState("");
  // const [isAllowed, setIsAllowed] = useState(false);
  // const [progressState, setProgressState] = useState({});


  const [userEmail, setUserEmail] = useState("");
const [isAllowed, setIsAllowed] = useState(false);
const [checkingAccess, setCheckingAccess] = useState(true);
const [progressState, setProgressState] = useState({});
  const [isMutedHint, setIsMutedHint] = useState(false);

  const playerRef = useRef(null);
  const vimeoPlayerRef = useRef(null);

  const selectedClassVideos = useMemo(
    () => (selectedClass?.videos || []).filter((v) => v?.url),
    [selectedClass],
  );

  const selectedClassDocs = useMemo(
    () => (selectedClass?.docs || []).filter((d) => d?.title && d?.url),
    [selectedClass],
  );

  const filteredClasses = useMemo(() => {
    const search = classSearch.toLowerCase();

    return selectedCourse.classes.filter((item) =>
      item.title.toLowerCase().includes(search),
    );
  }, [selectedCourse, classSearch]);

  const completedCount = useMemo(() => {
    return selectedCourse.classes.filter(
      (item) => progressState[item.id]?.completed,
    ).length;
  }, [selectedCourse, progressState]);

  const totalClasses = selectedCourse.classes.length;
  const totalVideos = selectedCourse.classes.reduce(
    (sum, item) =>
      sum + (item.videos || []).filter((video) => video?.url).length,
    0,
  );

  const courseProgress = totalClasses
    ? Math.round((completedCount / totalClasses) * 100)
    : 0;

  // useEffect(() => {
  //   const rawUser = localStorage.getItem("user") || "";
  //   const normalized = normalizeEmail(rawUser);

  //   setUserEmail(normalized);

  //   setIsAllowed(
  //     allowedEmails
  //       .map((email) => email.toLowerCase().trim())
  //       .includes(normalized),
  //   );

  //   async function fetchProgress() {
  //     if (!normalized) return;

  //     try {
  //       const res = await fetch(
  //         `${import.meta.env.VITE_API_BASE}/api/progress/${normalized}`,
  //       );

  //       if (!res.ok) throw new Error("Failed to fetch backend progress");

  //       const data = await res.json();

  //       const mapped = {};
  //       data.forEach((p) => {
  //         mapped[p.classId] = {
  //           note: p.note || "",
  //           time: p.time || 0,
  //           duration: p.duration || 0,
  //           completed: p.completed || false,
  //           videoId: p.videoId || "",
  //         };
  //       });

  //       setProgressState(mapped);
  //       localStorage.setItem(
  //         storageProgressKey(normalized),
  //         JSON.stringify(mapped),
  //       );
  //     } catch (err) {
  //       try {
  //         const saved = JSON.parse(
  //           localStorage.getItem(storageProgressKey(normalized)) || "{}",
  //         );
  //         setProgressState(saved || {});
  //       } catch {
  //         setProgressState({});
  //       }
  //     }
  //   }

  //   fetchProgress();
  // }, []);


  useEffect(() => {
  let componentIsActive = true;

  const rawUser = localStorage.getItem("user") || "";
  const normalized = normalizeEmail(rawUser);

  setUserEmail(normalized);

  async function checkStudentAccess() {
    if (!normalized) {
      if (componentIsActive) {
        setIsAllowed(false);
        setCheckingAccess(false);
      }

      return;
    }

    try {
      const response = await fetch("/api/check-student-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalized,
          courseId: "splunk",
        }),
      });

      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to check student access.",
        );
      }

      if (componentIsActive) {
        setIsAllowed(result?.allowed === true);
      }
    } catch (error) {
      console.error("Student access check failed:", error);

      if (componentIsActive) {
        setIsAllowed(false);
      }
    } finally {
      if (componentIsActive) {
        setCheckingAccess(false);
      }
    }
  }

  async function fetchProgress() {
    if (!normalized) return;

    try {
      const apiBase = import.meta.env.VITE_API_BASE;

      if (!apiBase) {
        throw new Error("Progress API is not configured.");
      }

      const response = await fetch(
        `${apiBase}/api/progress/${encodeURIComponent(normalized)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch backend progress.");
      }

      const data = await response.json();

      const mapped = {};

      if (Array.isArray(data)) {
        data.forEach((progress) => {
          mapped[progress.classId] = {
            note: progress.note || "",
            time: progress.time || 0,
            duration: progress.duration || 0,
            completed: progress.completed || false,
            videoId: progress.videoId || "",
          };
        });
      }

      if (componentIsActive) {
        setProgressState(mapped);
      }

      localStorage.setItem(
        storageProgressKey(normalized),
        JSON.stringify(mapped),
      );
    } catch (error) {
      console.warn(
        "Backend progress unavailable. Using local progress:",
        error,
      );

      try {
        const saved = JSON.parse(
          localStorage.getItem(storageProgressKey(normalized)) || "{}",
        );

        if (componentIsActive) {
          setProgressState(saved || {});
        }
      } catch {
        if (componentIsActive) {
          setProgressState({});
        }
      }
    }
  }

  checkStudentAccess();
  fetchProgress();

  return () => {
    componentIsActive = false;
  };
}, []);

  useEffect(() => {
    async function fetchThumbs() {
      setLoadingThumbs(true);

      const vmap = {};
      const videos = selectedClassVideos;

      await Promise.all(
        videos.map(async (video) => {
          if (video.thumbnail) {
            vmap[video.id] = video.thumbnail;
            return;
          }

          try {
            const videoUrl = video.url.includes("vimeo.com")
              ? video.url.replace("player.", "")
              : video.url;

            const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
              videoUrl,
            )}`;

            const res = await fetch(oembed);

            if (!res.ok) throw new Error("No oEmbed");

            const data = await res.json();
            vmap[video.id] = data.thumbnail_url || null;
          } catch {
            vmap[video.id] = null;
          }
        }),
      );

      setThumbnails(vmap);
      setLoadingThumbs(false);
    }

    fetchThumbs();
  }, [selectedClassVideos]);

  useEffect(() => {
    if (!selectedVideo) {
      if (playerRef.current) playerRef.current.innerHTML = "";
      return;
    }

    if (vimeoPlayerRef.current) {
      try {
        vimeoPlayerRef.current.unload?.();
        vimeoPlayerRef.current.destroy?.();
      } catch {}
      vimeoPlayerRef.current = null;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", `${selectedVideo.url}?transparent=0&autoplay=0`);
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    iframe.setAttribute("frameborder", "0");
    iframe.className = "h-full w-full";

    if (playerRef.current) {
      playerRef.current.innerHTML = "";
      playerRef.current.appendChild(iframe);
    }

    const player = new Player(iframe);
    vimeoPlayerRef.current = player;

    player.setVolume(1).catch(() => setIsMutedHint(true));

    try {
      const saved = JSON.parse(
        localStorage.getItem(storageProgressKey(userEmail)) || "{}",
      );

      const cls = saved[selectedClass.id] || {};

      if (cls.videoId === selectedVideo.id && cls.time > 0) {
        player
          .ready()
          .then(() => player.setCurrentTime(cls.time).catch(() => {}));
      }
    } catch {}

    const interval = setInterval(async () => {
      try {
        const time = await player.getCurrentTime();
        const duration = await player.getDuration();

        updateVideoProgress(selectedClass.id, selectedVideo.id, time, duration);
      } catch {}
    }, 3000);

    const onPlay = () => setIsMutedHint(false);
    player.on("play", onPlay);

    return () => {
      clearInterval(interval);

      try {
        player.off("play", onPlay);
        player.unload?.();
        player.destroy?.();
      } catch {}

      vimeoPlayerRef.current = null;
    };
  }, [selectedVideo, selectedClass, userEmail]);

  useEffect(() => {
    setSelectedVideo(null);

    try {
      const saved = JSON.parse(
        localStorage.getItem(storageProgressKey(userEmail)) || "{}",
      );

      const cls = saved[selectedClass.id] || {};

      if (cls.videoId) {
        const found = selectedClass.videos.find((v) => v.id === cls.videoId);
        if (found) setSelectedVideo(found);
      }
    } catch {}
  }, [selectedClass, userEmail]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  function updateVideoProgress(classId, videoId, timeSec, durationSec) {
    const email = userEmail || "anonymous";
    const key = storageProgressKey(email);
    const prev = JSON.parse(localStorage.getItem(key) || "{}");

    prev[classId] = {
      ...(prev[classId] || {}),
      videoId,
      time: timeSec,
      duration: durationSec,
      completed:
        durationSec > 0 && timeSec / durationSec >= 0.9
          ? true
          : prev[classId]?.completed || false,
    };

    localStorage.setItem(key, JSON.stringify(prev));
    setProgressState(prev);
  }

  function markClassCompleted(classId) {
    const email = userEmail || "anonymous";
    const key = storageProgressKey(email);
    const prev = JSON.parse(localStorage.getItem(key) || "{}");

    prev[classId] = {
      ...(prev[classId] || {}),
      completed: true,
    };

    localStorage.setItem(key, JSON.stringify(prev));
    setProgressState(prev);
  }

  function updateNote(note) {
    const email = userEmail || "anonymous";
    const key = storageProgressKey(email);
    const prev = JSON.parse(localStorage.getItem(key) || "{}");

    prev[selectedClass.id] = {
      ...(prev[selectedClass.id] || {}),
      note,
    };

    localStorage.setItem(key, JSON.stringify(prev));
    setProgressState(prev);
  }

  function resetProgress() {
    localStorage.removeItem(storageProgressKey(userEmail));
    setProgressState({});
  }

  function handleSelectClass(classItem) {
    setSelectedClass(classItem);
    setShowSyllabus(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  if (checkingAccess) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 text-white">
      <div className="absolute left-[-180px] top-[-180px] h-[450px] w-[450px] rounded-full bg-BLUE/30 blur-[140px]" />

      <div className="absolute bottom-[-200px] right-[-180px] h-[480px] w-[480px] rounded-full bg-purple-500/20 blur-[150px]" />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-300" />
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
          Student verification
        </p>

        <h1 className="mt-3 text-2xl font-black">
          Checking your portal access
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/55">
          Please wait while your student account is being verified.
        </p>
      </div>
    </main>
  );
}

if (!isAllowed) {
  return <AccessDenied userEmail={userEmail} />;
}
 
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] p-4 text-white md:p-6">
      <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/35 blur-[140px]" />
      <div className="absolute bottom-[-240px] right-[-180px] h-[540px] w-[540px] rounded-full bg-cyan-400/20 blur-[150px]" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[170px]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

      <AssignmentToast
        show={showNewAssignmentAlert}
        onClose={() => setShowNewAssignmentAlert(false)}
      />

      <SplunkKnowledgePopup />

      <div className="relative z-10 mx-auto max-w-[1600px]">
        {/* HEADER */}
        <header className="mb-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
                  <FaGraduationCap />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
                  T.O Analytics Learning Portal
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                Professional Splunk Bootcamp Dashboard
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-white/55 md:text-base">
                Watch classes, track progress, open documents, review syllabus,
                and write personal notes from one advanced student portal.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
                  Signed in as
                </p>
                <p className="mt-1 break-all text-sm font-bold text-white/80">
                  {userEmail}
                </p>
              </div>

              <DashboardDropdown />

              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-BLUE"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <PortalStat
              icon={<FaLayerGroup />}
              value={totalClasses}
              label="Classes"
            />
            <PortalStat icon={<FaVideo />} value={totalVideos} label="Videos" />
            <PortalStat
              icon={<FaCheck />}
              value={`${completedCount}/${totalClasses}`}
              label="Completed"
            />
            <PortalStat
              icon={<FaChartLine />}
              value={`${courseProgress}%`}
              label="Progress"
            />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
                Navigation
              </p>
              <h2 className="mt-2 text-2xl font-black">Course Menu</h2>
            </div>

            <button
              onClick={() => {
                setShowSyllabus(true);
                setSelectedVideo(null);
              }}
              className={`mb-4 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left font-black transition ${
                showSyllabus
                  ? "bg-white text-BLUE"
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <span className="flex items-center gap-3">
                <FaBookOpen />
                Full Syllabus
              </span>
              <FaArrowRight />
            </button>

            <div className="mb-4 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4">
              <FaMagnifyingGlass className="text-white/35" />
              <input
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                placeholder="Search classes..."
                className="h-full w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id}>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedClass(course.classes[0]);
                      setShowSyllabus(false);
                    }}
                    className={`w-full rounded-2xl px-4 py-4 text-left font-black transition ${
                      selectedCourse.id === course.id
                        ? "bg-BLUE text-white"
                        : "bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {course.title}
                  </button>

                  {selectedCourse.id === course.id && (
                    <div className="mt-3 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                      {filteredClasses.map((classItem, index) => {
                        const progress = progressState[classItem.id];
                        const percent = getClassProgress(progress);

                        return (
                          <button
                            key={`${classItem.id}-${index}`}
                            onClick={() => handleSelectClass(classItem)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              selectedClass.id === classItem.id && !showSyllabus
                                ? "border-cyan-300/30 bg-white text-slate-950"
                                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                  progress?.completed
                                    ? "bg-emerald-500 text-white"
                                    : selectedClass.id === classItem.id &&
                                        !showSyllabus
                                      ? "bg-BLUE text-white"
                                      : "bg-white/10 text-white"
                                }`}
                              >
                                {progress?.completed ? <FaCheck /> : index + 1}
                              </span>

                              <div className="flex-1">
                                <p className="text-sm font-black leading-6">
                                  {classItem.title}
                                </p>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
                                  <div
                                    className={`h-full rounded-full ${
                                      progress?.completed
                                        ? "bg-emerald-500"
                                        : "bg-BLUE"
                                    }`}
                                    style={{
                                      width: `${Math.max(percent, 5)}%`,
                                    }}
                                  />
                                </div>

                                <p className="mt-2 text-xs font-semibold opacity-60">
                                  {Math.round(percent)}% completed
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <button
                onClick={resetProgress}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white"
              >
                <FaRotateRight />
                Reset My Progress
              </button>
            </div>
          </aside>

          {/* CENTER MAIN */}
          <section className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-6 md:p-5">
            {showSyllabus ? (
              <>
                <div className="mb-6 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
                    Complete Roadmap
                  </p>
                  <h2 className="mt-3 text-3xl font-black">
                    Full Splunk Training Syllabus
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-white/55">
                    Review the full training structure, weekly roadmap, videos
                    and supporting documents.
                  </p>
                </div>

                <SyllabusSection
                  onSelectClass={(index) =>
                    handleSelectClass(selectedCourse.classes[index])
                  }
                />
              </>
            ) : (
              <>
                <div className="mb-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
                    Current Class
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    {selectedClass.title}
                  </h2>

                  <p className="mt-3 text-sm font-medium leading-7 text-white/55">
                    Select a video below to continue your lesson. Your watch
                    progress is saved automatically.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {selectedClassVideos.length ? (
                    selectedClassVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className={`group overflow-hidden rounded-[1.6rem] border text-left transition hover:-translate-y-1 ${
                          selectedVideo?.id === video.id
                            ? "border-cyan-300/40 bg-white text-slate-950"
                            : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="relative h-44 overflow-hidden bg-black">
                          {thumbnails[video.id] ? (
                            <img
                              src={thumbnails[video.id]}
                              alt={video.title}
                              className="h-full w-full object-cover opacity-80 transition group-hover:scale-110 group-hover:opacity-100"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/35">
                              {loadingThumbs
                                ? "Loading thumbnail..."
                                : "No thumbnail"}
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                          <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-BLUE">
                            <FaCirclePlay />
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="font-black leading-6">
                            {video.title || "Class Video"}
                          </h4>
                          <p className="mt-2 text-xs font-semibold opacity-55">
                            Vimeo Video Lesson
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-[1.7rem] border border-white/10 bg-white/5 p-8 text-center">
                      <FaVideo className="mx-auto text-4xl text-white/30" />
                      <h3 className="mt-5 text-2xl font-black">
                        No video available yet
                      </h3>
                      <p className="mt-2 text-sm text-white/50">
                        This class does not currently have a video attached.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black shadow-2xl">
                  <div
                    ref={playerRef}
                    className="flex h-[260px] w-full items-center justify-center bg-black text-sm font-bold text-white/40 md:h-[460px]"
                  >
                    Choose a video to start
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">
                      {selectedVideo?.title || "No video selected"}
                    </p>

                    {isMutedHint && (
                      <p className="mt-1 text-xs font-semibold text-yellow-200">
                        Browser blocked volume control. Press play manually if
                        needed.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => markClassCompleted(selectedClass.id)}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-emerald-400"
                  >
                    Mark Completed
                  </button>
                </div>
              </>
            )}
          </section>

          {/* RIGHT SIDE */}
          <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-3 md:p-5">
            <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
                Class Materials
              </p>

              <h3 className="mt-3 text-2xl font-black">Resources</h3>

              <div className="mt-5 space-y-3">
                {showSyllabus ? (
                  <p className="text-sm font-medium leading-7 text-white/50">
                    Select a class from the syllabus or course menu to see
                    documents here.
                  </p>
                ) : selectedClassDocs.length ? (
                  selectedClassDocs.map((doc, index) => (
                    <a
                      key={`${doc.id}-${index}`}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white hover:text-BLUE"
                    >
                      <span className="flex items-center gap-3 text-sm font-black">
                        <FaFileLines />
                        {doc.title}
                      </span>

                      <FaDownload className="opacity-50 transition group-hover:opacity-100" />
                    </a>
                  ))
                ) : (
                  <p className="text-sm font-medium leading-7 text-white/50">
                    No documents available currently.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-BLUE">
                  <FaNoteSticky />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                    Personal
                  </p>
                  <h4 className="text-xl font-black">Notes</h4>
                </div>
              </div>

              <textarea
                className="h-48 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/40"
                placeholder="Write your notes for this class..."
                value={progressState[selectedClass.id]?.note || ""}
                onChange={(e) => updateNote(e.target.value)}
              />
            </div>

            <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">
                Progress Summary
              </p>

              <h3 className="mt-3 text-4xl font-black">{courseProgress}%</h3>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-BLUE"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniSummary label="Completed" value={completedCount} />
                <MiniSummary
                  label="Remaining"
                  value={totalClasses - completedCount}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PortalStat({ icon, value, label }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
        {icon}
      </div>

      <h3 className="text-3xl font-black">{value}</h3>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/40">
        {label}
      </p>
    </div>
  );
}

function MiniSummary({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-white/35">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
