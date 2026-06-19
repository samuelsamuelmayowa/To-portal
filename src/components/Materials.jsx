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
  const [selectedClass, setSelectedClass] = useState(sampleCourses[0].classes[0]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [showSyllabus, setShowSyllabus] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const [thumbnails, setThumbnails] = useState({});
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
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
    return selectedCourse.classes.filter((item) => progressState[item.id]?.completed)
      .length;
  }, [selectedCourse, progressState]);

  const totalClasses = selectedCourse.classes.length;
  const totalVideos = selectedCourse.classes.reduce(
    (sum, item) => sum + (item.videos || []).filter((video) => video?.url).length,
    0,
  );

  const courseProgress = totalClasses
    ? Math.round((completedCount / totalClasses) * 100)
    : 0;

  useEffect(() => {
    const rawUser = localStorage.getItem("user") || "";
    const normalized = normalizeEmail(rawUser);

    setUserEmail(normalized);

    setIsAllowed(
      allowedEmails
        .map((email) => email.toLowerCase().trim())
        .includes(normalized),
    );

    async function fetchProgress() {
      if (!normalized) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/progress/${normalized}`,
        );

        if (!res.ok) throw new Error("Failed to fetch backend progress");

        const data = await res.json();

        const mapped = {};
        data.forEach((p) => {
          mapped[p.classId] = {
            note: p.note || "",
            time: p.time || 0,
            duration: p.duration || 0,
            completed: p.completed || false,
            videoId: p.videoId || "",
          };
        });

        setProgressState(mapped);
        localStorage.setItem(storageProgressKey(normalized), JSON.stringify(mapped));
      } catch (err) {
        try {
          const saved = JSON.parse(
            localStorage.getItem(storageProgressKey(normalized)) || "{}",
          );
          setProgressState(saved || {});
        } catch {
          setProgressState({});
        }
      }
    }

    fetchProgress();
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
        player.ready().then(() => player.setCurrentTime(cls.time).catch(() => {}));
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
                                    style={{ width: `${Math.max(percent, 5)}%` }}
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
                              {loadingThumbs ? "Loading thumbnail..." : "No thumbnail"}
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
                        Browser blocked volume control. Press play manually if needed.
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
                <MiniSummary label="Remaining" value={totalClasses - completedCount} />
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
// // CoursePortal.jsx
// // Single-file React component (Tailwind CSS required)
// // Now includes: Full Splunk Syllabus view in the center panel (triggered from left sidebar)
// function AssignmentToast({ show, onClose }) {
//   if (!show) return null;

//   return (
//     <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-xl shadow-lg animate-bounce">
//       <h2 className="font-medium text-sm  font-bold">
//         New assignment has been released!
//       </h2>
//       <button onClick={onClose} className="text-xs underline mt-2">
//         Close
//       </button>
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState } from "react";
// import Player from "@vimeo/player";
// import { NavLink } from "react-router-dom";
// import DashboardDropdown from "./Dropdown";
// import NewFeaturePopup from "./Newapp";
// import TOAnnouncementBar from "./TOAnnouncementBar";
// import SplunkKnowledgePopup from "./SplunkKnowledgePopup";

// const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

// // Allowed users
// const allowedEmails = [
//   "kewizle.k@gmail.com",
//   "kewizlek@gmail.com",
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

// // ✅ Full Splunk Syllabus data (linked to your real videos & docs where available)
// // const fullSplunkSyllabus = [
// //   {
// //     week: 1,
// //     title: "Introduction to Splunk",
// //     desc: "What is Splunk, use cases, architecture, and installation.",
// //     videos: [
// //       {
// //         title: "To-analytics Orientation",
// //         url: "https://player.vimeo.com/video/1126909883",
// //       },
// //     ],
// //     docs: [
// //       {
// //         title: "Orientation Slides",
// //         url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
// //       },
// //     ],
// //   },
// //   {
// //     week: 2,
// //     title: "Splunk Basics",
// //     desc: "Splunk web interface, adding data, fields, basic search commands.",
// //     videos: [
// //       {
// //         title: "To-analytics Splunk Class 1",
// //         url: "https://player.vimeo.com/video/1127004938",
// //       },
// //     ],
// //     docs: [
// //       {
// //         title: "Splunk Class 1 Intro",
// //         url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
// //       },
// //       {
// //         title: "Splunk Class 1 Note",
// //         url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
// //       },
// //     ],
// //   },
// //   {
// //     week: 3,
// //     title: "SPL – Part 1",
// //     desc: "Intro to SPL, search, where, eval, working with fields, filtering.",
// //     videos: [
// //       {
// //         title: "To-analytics Splunk Class 2",
// //         url: "https://player.vimeo.com/video/1131114931",
// //       },
// //     ],
// //     docs: [
// //       {
// //         title: "Splunk Class 2 Slides",
// //         url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
// //       },
// //       {
// //         title: "Splunk Class 2 Note",
// //         url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
// //       },
// //     ],
// //   },
// //   {
// //     week: 4,
// //     title: "SPL – Part 2",
// //     desc: "stats, eventstats, chart, timechart, transforming commands, lookups.",
// //     videos: [
// //       {
// //         title: "To-analytics Splunk Class 3",
// //         url: "https://player.vimeo.com/video/1133357923",
// //       },
// //     ],
// //     docs: [
// //       {
// //         title: "Splunk Class 3 Slides",
// //         url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
// //       },
// //       {
// //         title: "Splunk Class 3 Note",
// //         url: "https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
// //       },
// //     ],
// //   },
// //   {
// //     week: 5,
// //     title: "Reports & Dashboards",
// //     desc: "Creating reports, dashboards, visualizations, inputs and filters..",
// //     videos: [],

// //     docs: [
// //       {
// //         title: "Splunk Class 5 Slides",
// //         url: "https://drive.google.com/file/d/1ekO5jcujdct0aofS4QBgd3P8BOPonsek/preview",
// //         // url: "https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview",
// //       },
// //     ],
// //   },
// //   {
// //     week: 6,
// //     title: "Splunk Knowledge Objects",
// //     // desc: "Creating reports, dashboards, visualizations, inputs and filters.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 7,
// //     title: "Alerts & Monitoring",
// //     desc: "Alert types, alert actions (email, script, webhook), real-time vs scheduled alerts.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 8,
// //     title: "Splunk Apps & Add-ons",
// //     desc: "What are apps, installing base apps, popular add-ons, configuration.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 9,
// //     title: "Data Inputs & Indexing",
// //     desc: "Types of inputs, forwarders (UF/HF), indexing pipeline, indexes and buckets.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 10,
// //     title: "User Management & Security",
// //     desc: "Roles, users, authentication methods, managing permissions, securing Splunk.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 11,
// //     title: "Advanced SPL",
// //     desc: "Subsearches, joins, macros, workflow actions, CIM.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 12,
// //     title: "Performance & Optimization",
// //     desc: "Search optimization, indexing/storage best practices, troubleshooting.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 13,
// //     title: "Enterprise Deployment",
// //     desc: "Distributed architecture, clustering, SmartStore, high availability & scaling.",
// //     videos: [],
// //     docs: [],
// //   },
// //   {
// //     week: 14,
// //     title: "Final Project & Review",
// //     desc: "Capstone project, dashboard + alerting system, review & exam prep.",
// //     videos: [],
// //     docs: [],
// //   },
// // ];
// // const fullSplunkSyllabus =
// //   sampleCourses
// //     .find(c => c.id === "splunk")
// //     .classes
// //     .map((cls, index) => ({
// //       week: index + 1,
// //       title: cls.title,
// //       desc: cls.desc || "Session content delivered in the sample course.",
// //       videos: cls.videos || [],
// //       docs: cls.docs || [],
// //     }));

// // Your existing sample course structure
// const sampleCourses = [
//   {
//     id: "splunk",
//     title: "Splunk Training",
//     classes: [
//       {
//         id: "class1",
//         title: "Orientation — Intro (1 Videos)",
//         videos: [
//           {
//             id: "v1",
//             title: "To-analytics Orientation",
//             url: "https://player.vimeo.com/video/1126909883",
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "To-analytics Orientation",
//             url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
//           },
//         ],
//       },
//       {
//         id: "class2",
//         title: "Class 1 — Splunk  SIEM (1 Videos)",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 1",
//             url: "https://player.vimeo.com/video/1127004938",
//           },
//         ],
//         docs: [
//           {
//             id: "d1",
//             title: "To-analytics Splunk Class 1 Intro",
//             url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
//           },
//           {
//             id: "d2",
//             title: "To-analytics Splunk Class 1 Note",
//             url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
//           },
//         ],
//       },
//       {
//         id: "class3",
//         title: "Class 2 —  Splunk Basics",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 2",
//             url: "https://player.vimeo.com/video/1131114931",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 2",
//             url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
//           },
//           {
//             id: "d4",
//             title: "To-analytics Splunk  Class 2 Note",
//             url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
//           },
//         ],
//       },
//       {
//         id: "class4",
//         title: "Class 3 — Splunk SPL",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 3",
//             url: "https://player.vimeo.com/video/1133357923",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 3",
//             url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//           {
//             id: "d4",
//             title: "To-analytics Splunk Class 3 Note",
//             url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
//           },
//         ],
//       },
//       {
//         id: "class5",
//         title: "Class 4 — SPL Part 2",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 4",
//             url: "https://player.vimeo.com/video/1136469770",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "To-analytics Splunk Class 4",
//             url: "https://drive.google.com/file/d/1XVZBJxSCe_bj-MP93nGyJPKG3qoKjrb_/preview",
//             // url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
//           },
//         ],
//       },

//       {
//         id: "class6",
//         title: "Class 5  — Splunk SPL  LAB",
//         desc: "Creating reports, dashboards, visualizations, inputs and filters. .",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 5",
//             url: "https://player.vimeo.com/video/1138152119",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Splunk Class 5 Slides",
//             url: "",
//             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
//           },

//           {
//             id: "d3",
//             title: "Splunk Class 5 Note",
//             url: "https://drive.google.com/file/d/1RrF8dEuaUgyKiWhF8lQ4h-WiN9CUb4gE/preview",
//             // https://drive.google.com/file/d/1v7YRwUFvIBenhRSiS-f2evqh2ia2xuq6/preview
//           },
//         ],
//       },

//       {
//         id: "class8",
//         title: "Class 6  — Splunk Knowledge Objects.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 6",
//             url: "https://player.vimeo.com/video/1140703570",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "Splunk Class 6 Slides",
//             url: "https://drive.google.com/file/d/1cXBItLD6OpbOY6aDi5NGQ0-KXJbutCIS/view?usp=sharing",
//           },

//           {
//             id: "d3",
//             title: "Splunk Class 6 Note",
//             url: "https://drive.google.com/file/d/1fVtS0u-mPndEiVbSGm1f2H5Qm_Dx3CzV/preview",
//           },
//         ],
//       },

//       {
//         id: "class7",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 7 Splunk Lab Knowledge Objects",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 7",
//             url: "https://player.vimeo.com/video/1145017764",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "",
//             url: "",
//           },
//         ],
//       },

//       // https://player.vimeo.com/video/1149696096
//       {
//         id: "class8",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 8 Splunk Dashboard ",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 8",
//             url: "https://player.vimeo.com/video/1146557656",
//           },
//         ],
//         docs: [
//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8",
//             url: "https://drive.google.com/file/d/1jBaWruZc2sgrmzuLFWuwtcNMHrOiab8K/preview",
//           },

//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8 Note",
//             url: "https://drive.google.com/file/d/1EvVwiUgfR8Vl1q4MIIUPCmHnFDDKvPg4/preview",
//           },

//           {
//             id: "d3",
//             title: "T.O_Analytics_Splunk_Class_8 Assignment",
//             url: "https://drive.google.com/file/d/1APZ-0shpvdjNJ9OFppVVrE5KqPwwHL49/preview",
//           },
//         ],
//       },

//       {
//         id: "class9",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 9 Splunk Dashboard Lab",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 9",
//             url: "https://player.vimeo.com/video/1149696096",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "",
//             url: "",
//           },
//         ],
//       },
//       //

//       {
//         id: "class10",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 10 Certification Exam, Job & Assignment Review",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "To-analytics Splunk Class 10",
//             url: "https://player.vimeo.com/video/1153292493",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "Assignment",
//             url: "https://docs.google.com/presentation/d/1iorNGrxkfRYvm4_C3x0gyb3levapMdaL/preview",
//           },
//         ],
//       },

//       {
//         id: "class11",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 11 Onboarding data",
//         // desc: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/view?usp=sharing",
//         videos: [
//           {
//             id: "v2",
//             title: "",
//             url: "https://player.vimeo.com/video/1156881908",
//           },
//         ],
//         docs: [
//           {
//             id: "",
//             title: "Onboarding data ",
//             url: "https://docs.google.com/presentation/d/13XUnTdubkQnixedrIRay7ZqskHLSIRUY/preview",
//           },
//         ],
//       },

//       {
//         id: "class12",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 12 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 12 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1158631944",
//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 12 Data Onboarding Lab",
//             url: "",
//           },
//         ],
//       },     
      

//        {
//         id: "class13",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 13 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 13 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1161024327"

//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 13 Data Onboarding Lab",
//             url: "https://docs.google.com/presentation/d/16tCZ7QDzXSVXw7RnQFvKxO7mZEH1E87d/preview",
//           },
//         ],
//       },     



//        {
//         id: "class14",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 14 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 14 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1164167231"

//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 14 Data Onboarding Lab",
//             url: "",
//           },
//         ],
//       },  






//        {
//         id: "class15",
//         // title: "Class 7  —  Splunk Dashboard",
//         title: "Class 15 Data Onboarding Lab.",
//         desc: "",
//         videos: [
//           {
//             id: "v2",
//             title: "Class 15 Data Onboarding Lab",
//             url: "https://player.vimeo.com/video/1168322139"

//             // url: "",
//           },
//         ],
//         docs: [
//           {
//             id: "dv",
//             title: "Class 15 Data Onboarding Lab",
//             url: "https://docs.google.com/presentation/d/14BX41OFW10PpnxnppGEZ9G6foQFdFVqb/preview",
//           },
//         ],
//       },  
//       // {
//       //   id: "class6",
//       //   title: "Class 5  — Splunk Knowledge Objects",
//       //   videos: [],
//       //   docs: [],
//       // },
//     ],
//   },
// ];

// const fullSplunkSyllabus = sampleCourses
//   .find((c) => c.id === "splunk")
//   .classes.map((cls, index) => ({
//     week: index + 1,
//     title: cls.title,
//     desc: cls.desc || "Session content delivered in the sample course.",
//     videos: cls.videos || [],
//     docs: cls.docs || [],
//   }));

// // Key for saving progress in localStorage per user
// function storageProgressKey(email) {
//   return `cp_progress_${(email || "").toLowerCase().trim()}`;
// }

// // ✅ Syllabus renderer component (center panel for Syllabus mode)
// function SyllabusSection() {
//   return (
//     <div className="mt-6">
//       <div className="bg-white rounded-2xl border p-4 shadow-sm">
//         <h2 className="text-lg font-bold mb-3">
//           📘 Full Splunk Course Syllabus
//         </h2>
//         <p className="text-sm text-gray-600 mb-4">
//           This is the full 14-week roadmap for your Splunk training: videos,
//           topics, and supporting documents where available.
//         </p>

//         <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
//           {fullSplunkSyllabus.map((w, i) => (
//             <div
//               key={i}
//               className="rounded-xl border bg-gray-50 p-3 hover:bg-gray-100 transition-all"
//             >
//               <h3 className="font-semibold text-blue-700 text-sm">
//                 Week {w.week} — {w.title}
//               </h3>
//               <p className="text-xs text-gray-600 mt-1">{w.desc}</p>

//               {/* Videos for this week */}
//               <div className="mt-2">
//                 <div className="text-xs font-medium text-gray-800">
//                   🎬 Videos
//                 </div>
//                 {w.videos && w.videos.length > 0 ? (
//                   w.videos.map((v, j) => (
//                     <a
//                       key={j}
//                       href={v.url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="block text-xs text-blue-600 underline mt-1"
//                     >
//                       {v.title}
//                     </a>
//                   ))
//                 ) : (
//                   <div className="text-[11px] text-gray-400">
//                     No videos attached yet
//                   </div>
//                 )}
//               </div>

//               {/* Docs for this week */}
//               <div className="mt-2">
//                 <div className="text-xs font-medium text-gray-800">
//                   📄 Documents
//                 </div>
//                 {w.docs && w.docs.length > 0 ? (
//                   w.docs.map((d, j) => (
//                     <a
//                       key={j}
//                       href={d.url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="block text-xs text-purple-600 underline mt-1"
//                     >
//                       {d.title}
//                     </a>
//                   ))
//                 ) : (
//                   <div className="text-[11px] text-gray-400">
//                     No documents attached yet
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// /**
//  * CoursePortal (single-file)
//  */
// export default function CoursePortal() {
//   const [showNewAssignmentAlert, setShowNewAssignmentAlert] = useState(true);

//   const [darkMode, setDarkMode] = useState(false);
//   const [showCertificate, setShowCertificate] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const [courses] = useState(sampleCourses);
//   const [selectedCourse, setSelectedCourse] = useState(courses[0]);
//   const [selectedClass, setSelectedClass] = useState(courses[0].classes[0]);
//   const [showClassDetails, setShowClassDetails] = useState(true);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [thumbnails, setThumbnails] = useState({});
//   const playerRef = useRef(null);
//   const vimeoPlayerRef = useRef(null);
//   const [isMutedHint, setIsMutedHint] = useState(false);
//   const [loadingThumbs, setLoadingThumbs] = useState(false);
//   const [userEmail, setUserEmail] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false);
//   const [progressState, setProgressState] = useState({}); // mirror of saved progress per-email

//   // ✅ New: syllabus mode state (when true, center panel shows syllabus instead of video grid)
//   const [showSyllabus, setShowSyllabus] = useState(false);

//   // init: user + permission + progress state
//   useEffect(() => {
//     const e = localStorage.getItem("user") || "";
//     setUserEmail(e);

//     // Check permission
//     setIsAllowed(
//       allowedEmails
//         .map((a) => a.toLowerCase())
//         .includes((e || "").toLowerCase()),
//     );

//     // Load progress (from backend instead of localStorage)
//     async function fetchProgress() {
//       if (!e) return;

//       try {
//         // 1️⃣ Try to load from backend
//         const res = await fetch(
//           `${import.meta.env.VITE_API_BASE}/api/progress/${e}`,
//         );
//         if (!res.ok) throw new Error("Failed to fetch backend data");

//         const data = await res.json();

//         // Convert backend array to object map
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

//         // 2️⃣ Optionally sync into localStorage (for offline use)
//         localStorage.setItem(storageProgressKey(e), JSON.stringify(mapped));
//       } catch (err) {
//         console.warn("Backend fetch failed, using local fallback:", err);
//         // Fallback to localStorage
//         try {
//           const saved = JSON.parse(
//             localStorage.getItem(storageProgressKey(e)) || "{}",
//           );
//           setProgressState(saved || {});
//         } catch {
//           setProgressState({});
//         }
//       }
//     }

//     fetchProgress();

//     // set default selected class/video
//     setSelectedCourse(courses[0]);
//     setSelectedClass(courses[0].classes[0]);
//   }, [courses]);

//   // fetch thumbnails for the selected class videos via Vimeo oEmbed
//   useEffect(() => {
//     async function fetchThumbs() {
//       setLoadingThumbs(true);
//       const vmap = {};
//       const videos = selectedClass.videos || [];
//       await Promise.all(
//         videos.map(async (v) => {
//           if (v.thumbnail) {
//             vmap[v.id] = v.thumbnail;
//             return;
//           }
//           try {
//             const videoUrl = v.url.includes("vimeo.com")
//               ? v.url.replace("player.", "")
//               : v.url;
//             const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
//               videoUrl,
//             )}`;
//             const res = await fetch(oembed);
//             if (!res.ok) throw new Error("no oembed");
//             const data = await res.json();
//             vmap[v.id] = data.thumbnail_url || null;
//           } catch (e) {
//             vmap[v.id] = null;
//           }
//         }),
//       );
//       setThumbnails(vmap);
//       setLoadingThumbs(false);
//     }
//     fetchThumbs();
//   }, [selectedClass]);

//   // initialize/destroy Vimeo player when selectedVideo changes
//   useEffect(() => {
//     if (!selectedVideo) return;

//     // cleanup previous player
//     if (vimeoPlayerRef.current) {
//       try {
//         vimeoPlayerRef.current.unload?.();
//       } catch (e) {}
//       try {
//         vimeoPlayerRef.current.destroy?.();
//       } catch (e) {}
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

//     // try to set volume; if blocked by browser autoplay policy, show hint
//     player.setVolume(1).catch(() => setIsMutedHint(true));

//     // restore last-time for this class/video if present
//     try {
//       const saved = JSON.parse(
//         localStorage.getItem(storageProgressKey(userEmail)) || "{}",
//       );
//       const cls = saved[selectedClass.id] || {};
//       if (cls.videoId === selectedVideo.id && cls.time > 0) {
//         player
//           .ready()
//           .then(() => player.setCurrentTime(cls.time).catch(() => {}));
//       }
//     } catch (e) {}

//     // periodically save time & auto-complete at 90%
//     const interval = setInterval(async () => {
//       try {
//         const t = await player.getCurrentTime();
//         const dur = await player.getDuration();
//         updateVideoProgress(selectedClass.id, selectedVideo.id, t, dur);
//       } catch (e) {}
//     }, 3000);

//     const onPlay = () => setIsMutedHint(false);
//     player.on("play", onPlay);

//     return () => {
//       clearInterval(interval);
//       try {
//         player.off("play", onPlay);
//       } catch (e) {}
//       try {
//         player.unload?.();
//         player.destroy?.();
//       } catch (e) {}
//       vimeoPlayerRef.current = null;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedVideo, selectedClass, userEmail]);

//   // when switching class, clear selectedVideo and attempt to restore saved pointer
//   useEffect(() => {
//     setSelectedVideo(null);
//     setShowClassDetails(true);
//     try {
//       const saved = JSON.parse(
//         localStorage.getItem(storageProgressKey(userEmail)) || "{}",
//       );
//       const cls = saved[selectedClass.id] || {};
//       if (cls.videoId) {
//         const found = selectedClass.videos.find((v) => v.id === cls.videoId);
//         if (found) setSelectedVideo(found);
//       }
//     } catch (e) {}
//   }, [selectedClass, userEmail]);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//   }, [darkMode]);

//   // helpers: update progress & mark complete
//   function updateVideoProgress(classId, videoId, timeSec, durationSec) {
//     const e = userEmail || "anonymous";
//     const key = storageProgressKey(e);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");
//     prev[classId] = { ...(prev[classId] || {}), videoId, time: timeSec };
//     if (durationSec > 0 && timeSec / durationSec >= 0.9) {
//       prev[classId].completed = true;
//     }
//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function markClassCompleted(classId) {
//     const e = userEmail || "anonymous";
//     const key = storageProgressKey(e);
//     const prev = JSON.parse(localStorage.getItem(key) || "{}");
//     prev[classId] = { ...(prev[classId] || {}), completed: true };
//     localStorage.setItem(key, JSON.stringify(prev));
//     setProgressState(prev);
//   }

//   function isClassCompleted(classId) {
//     const p = progressState[classId] || {};
//     return !!p.completed;
//   }

//   if (!isAllowed) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
//         <h1 className="text-3xl font-bold text-red-600 mb-4">
//           Access Denied 🚫
//         </h1>
//         <p className="text-gray-700">
//           This page is restricted to authorized To-Analytics members only.
//         </p>
//         {userEmail ? (
//           <p className="mt-3 text-sm text-gray-500">Your email: {userEmail}</p>
//         ) : (
//           <p className="mt-3 text-sm text-gray-500">
//             Please log in to view this page.
//           </p>
//         )}
//       </div>
//     );
//   }

//   const isSyllabusMode = showSyllabus;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
//       {/*       
//          <AssignmentToast
//       show={showNewAssignmentAlert}
//       onClose={() => setShowNewAssignmentAlert(false)}
//     /> */}

//       {/* Header */}

//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
//           {/* LEFT SIDE - TITLE */}
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//               To-Analytics Learning Portal
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Professional Splunk Bootcamp Dashboard
//             </p>
//           </div>

//           {/* RIGHT SIDE - ACTIONS */}
//           <div className="flex items-center gap-4">
//             {/* User Email */}
//             <div className="text-sm text-gray-600 dark:text-gray-300">
//               {userEmail}
//             </div>

//             {/* Profile Button */}
//             {/* <button
//               onClick={() => setProfileOpen(true)}
//               className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
//             >
//               My Profile
//             </button> */}

//             <DashboardDropdown />
//             {/* Dark Mode Toggle */}
//             <button
//               onClick={() => setDarkMode(!darkMode)}
//               className="px-3 py-1 rounded text-sm 
//         bg-gray-200 text-gray-800 
//         dark:bg-gray-800 dark:text-white
//         hover:opacity-90 transition"
//             >
//               {darkMode ? "Light Mode" : "Dark Mode"}
//             </button>
//           </div>
//         </div>
//       </div>
//       {/* <TOAnnouncementBar /> */}
//        <SplunkKnowledgePopup />
//       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
//         {/* LEFT SIDEBAR */}
//         <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-lg">
//           <h2 className="text-lg font-semibold mb-4 text-gray-800">
//             Course Navigation
//           </h2>

//           {/* Syllabus Button */}
//           <button
//             onClick={() => {
//               setShowSyllabus(true);
//               setSelectedVideo(null);
//               window.scrollTo({ top: 0, behavior: "smooth" });
//             }}
//             className={`w-full px-4 py-2 rounded-lg text-sm mb-4 transition shadow-sm ${
//               isSyllabusMode
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-100 hover:bg-blue-50 text-gray-700"
//             }`}
//           >
//             View Full Syllabus
//           </button>

//           {/* Courses */}
//           {courses.map((c) => (
//             <div key={c.id} className="mb-4">
//               <button
//                 onClick={() => {
//                   setSelectedCourse(c);
//                   setSelectedClass(c.classes[0]);
//                   setShowSyllabus(false);
//                 }}
//                 className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${
//                   selectedCourse.id === c.id
//                     ? "bg-blue-100 text-blue-700"
//                     : "hover:bg-gray-100"
//                 }`}
//               >
//                 {c.title}
//               </button>

//               {/* Classes */}
//               {selectedCourse.id === c.id && (
//                 <div className="mt-2 space-y-2 ml-2">
//                   {c.classes.map((cl) => {
//                     const progress = progressState[cl.id];
//                     const isDone = progress?.completed;

//                     return (
//                       <button
//                         key={cl.id}
//                         onClick={() => {
//                           setSelectedClass(cl);
//                           setShowSyllabus(false);
//                         }}
//                         className={`w-full p-2 rounded-lg text-left border transition ${
//                           selectedClass.id === cl.id
//                             ? "bg-blue-50 border-blue-300"
//                             : "border-gray-200 hover:bg-gray-50"
//                         }`}
//                       >
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm">
//                             {isDone ? "✔ " : ""}
//                             {cl.title}
//                           </span>
//                         </div>

//                         {/* Progress bar */}
//                         {!isSyllabusMode && (
//                           <div className="w-full h-1 bg-gray-200 rounded mt-1">
//                             <div
//                               className={`h-1 rounded ${
//                                 isDone ? "bg-green-500" : "bg-blue-500"
//                               }`}
//                               style={{
//                                 width: progress?.completed
//                                   ? "100%"
//                                   : progress?.time
//                                     ? `${Math.min(
//                                         (progress.time /
//                                           (progress.duration || 1)) *
//                                           100,
//                                         100,
//                                       )}%`
//                                     : "5%",
//                               }}
//                             />
//                           </div>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Reset Progress */}
//           <div className="mt-6 pt-4 border-t">
//             <button
//               onClick={() => {
//                 localStorage.removeItem(storageProgressKey(userEmail));
//                 setProgressState({});
//                 alert("Progress reset");
//               }}
//               className="text-xs text-red-600 hover:underline"
//             >
//               Reset My Progress
//             </button>
//           </div>
//         </aside>

//         {/* CENTER MAIN */}
//         <main className="col-span-12 md:col-span-6 bg-white rounded-2xl p-6 shadow-lg">
//           {/* Title */}
//           <div className="mb-5">
//             <h2 className="text-xl font-bold text-gray-800">
//               {isSyllabusMode
//                 ? "Full Splunk Training Syllabus"
//                 : selectedClass.title}
//             </h2>
//             <p className="text-sm text-gray-500 mt-1">
//               {isSyllabusMode
//                 ? "Complete program roadmap and structure"
//                 : "Available Class Videos"}
//             </p>
//           </div>

//           {/* Syllabus Mode */}
//           {isSyllabusMode ? (
//             <SyllabusSection />
//           ) : (
//             <>
//               {/* Video Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {selectedClass.videos.map((v) => (
//                   <div
//                     key={v.id}
//                     className={`bg-gray-50 p-3 rounded-xl shadow transition hover:shadow-md ${
//                       selectedVideo?.id === v.id ? "ring-2 ring-blue-500" : ""
//                     }`}
//                   >
//                     {/* Thumbnail */}
//                     <div className="h-40 bg-black rounded overflow-hidden mb-2">
//                       {thumbnails[v.id] ? (
//                         <img
//                           src={thumbnails[v.id]}
//                           alt={v.title}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-gray-400">
//                           Loading...
//                         </div>
//                       )}
//                     </div>

//                     {/* Video Info */}
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h4 className="font-semibold text-sm">{v.title}</h4>
//                         <p className="text-xs text-gray-500">Vimeo Video</p>
//                       </div>

//                       <button
//                         onClick={() => setSelectedVideo(v)}
//                         className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                       >
//                         Watch
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Video Player */}
//               <div className="mt-6">
//                 <div
//                   ref={playerRef}
//                   className="w-full h-[420px] bg-black rounded-xl overflow-hidden border"
//                 />

//                 <div className="mt-3 flex justify-between items-center">
//                   <span className="text-sm text-gray-600">
//                     {selectedVideo?.title || "Choose a video to start"}
//                   </span>

//                   <button
//                     onClick={() => markClassCompleted(selectedClass.id)}
//                     className="text-sm bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
//                   >
//                     Mark Completed
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </main>

//         {/* RIGHT SIDE */}
//         <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-5 shadow-lg">
//           <h3 className="font-semibold text-gray-800 mb-4">Class Materials</h3>

//           {isSyllabusMode ? (
//             <p className="text-sm text-gray-500">
//               Select a class to see documents here.
//             </p>
//           ) : selectedClass.docs.length ? (
//             selectedClass.docs.map((doc) => (
//               <div key={doc.id} className="mb-3">
//                 <a
//                   href={doc.url}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-sm text-blue-600 hover:underline"
//                 >
//                   {doc.title}
//                 </a>
//               </div>
//             ))
//           ) : (
//             <p className="text-sm text-gray-500">
//               No documents available currently.
//             </p>
//           )}

//           {/* Notes Section */}
//           <div className="mt-6">
//             <h4 className="text-sm font-semibold mb-1">Personal Notes</h4>

//             <textarea
//               className="w-full h-40 border rounded-lg p-2 text-sm focus:ring"
//               placeholder="Write your notes..."
//               value={(() => {
//                 const saved = JSON.parse(
//                   localStorage.getItem(storageProgressKey(userEmail)) || "{}",
//                 );
//                 return saved[selectedClass.id]?.note || "";
//               })()}
//               onChange={(e) => {
//                 const note = e.target.value;

//                 const key = storageProgressKey(userEmail);
//                 const prev = JSON.parse(localStorage.getItem(key) || "{}");

//                 prev[selectedClass.id] = {
//                   ...(prev[selectedClass.id] || {}),
//                   note,
//                 };

//                 localStorage.setItem(key, JSON.stringify(prev));
//                 setProgressState(prev);
//               }}
//             />
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }













// // BELOW IS THE REAL FILE
// // import React, { useEffect, useRef, useState } from "react";
// // import Player from "@vimeo/player";
// // import { NavLink } from "react-router-dom";
// // import DashboardDropdown from "./Dropdown";
// // import NewFeaturePopup from "./Newapp";
// // const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";
// // const allowedEmails = [
// //   "fadeleolutola@gmail.com",
// //   "jahdek76@gmail.com",
// //   "samuelsamuelmayowa@gmail.com",
// //   "adenusitimi@gmail.com",
// //   "oluwaferanmiolulana@gmail.com",
// //   "oluwaferanmi.olulana@gmail.com",
// //   "tomideolulana@gmail.com",
// //   "randommayowa@gmail.com",
// //   "yinkalola51@gmail.com",
// //   "toanalyticsllc@gmail.com",
// //   "kevwe_oberiko@yahoo.com",
// //   "denisgsam@gmail.com",
// //   "fpasamuelmayowa51@gmail.com",
// //   "oluwatiroyeamoye@gmail.com",
// //   "trbanjo@gmail.com",
// //   "emanfrimpong@gmail.com",
// //   "dipeoluolatunji@gmail.com",
// //   "lybertyudochuu@gmail.com",
// // ];

// // const sampleCourses = [
// //   {
// //     id: "splunk",
// //     title: "Splunk Training",
// //     classes: [
// //       {
// //         id: "class1",
// //         title: "Orientation — Intro (1 Videos)",
// //         videos: [
// //           {
// //             id: "v1",
// //             title: "To-analytics Orientation",
// //             url: "https://player.vimeo.com/video/1126909883",
// //           },
// //           // {
// //           //   id: "v2",
// //           //   title: "To-analytics Splunk Class 1",
// //           //   url: "https://player.vimeo.com/video/1127004938",
// //           // },
// //         ],
// //         docs: [
// //           {
// //             id: "d1",
// //             title: "To-analytics Orientation",
// //             url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
// //           },
// //           // {
// //           //   id: "d2",
// //           //   title: "To-analytics Splunk Class 1 Note",
// //           //   url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
// //           // },
// //         ],
// //       },
// //       {
// //         id: "class2",
// //         title: "Class 1 — Splunk  SIEM (1 Videos)",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 1",
// //             url: "https://player.vimeo.com/video/1127004938",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d1",
// //             title: "To-analytics Splunk Class 1 Intro",
// //             url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
// //           },
// //           {
// //             id: "d2",
// //             title: "To-analytics Splunk Class 1 Note",
// //             url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
// //           },
// //         ],
// //       },
// //       {
// //         id: "class3",
// //         title: "Class 2 —  Splunk Basics",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 2",
// //             url: "https://player.vimeo.com/video/1131114931",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "To-analytics Splunk Class 2",
// //             url: "https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview",
// //           },
// //           {
// //             id: "d4",
// //             title: "To-analytics Splunk  Class 2 Note ",
// //             url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
// //           },
// //         ],
// //       },
// //       {
// //         id: "class4",
// //         title: "Class 3 — Splunk SPL",
// //         videos: [
// //           {
// //             id: "v2",
// //             title: "To-analytics Splunk Class 3",
// //             url: "https://player.vimeo.com/video/1133357923",
// //           },
// //         ],
// //         docs: [
// //           {
// //             id: "d3",
// //             title: "To-analytics Splunk Class 3",
// //             // url: "https://drive.google.com/file/d/1gyB2HZHHJ-LbX9r8EFVPfY-IOrWQtkwk/preview",
// //             // url: "https://docs.google.com/presentation/d/1Qc7nnnYfuIt-q2OXOvvxi8nJOp7PTh6I/preview",
// //             url:"https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview"
// //           },
// //           {
// //             id: "d4",
// //             title: "To-analytics Splunk Class 3 Note ",
// //             url: " https://drive.google.com/file/d/1YVWoCLqrk4JhcML-mloJ53RDZlq7v7Pc/preview",
// //           },
// //         ],
// //       },

// //       { id: "class5", title: "Class 4 — SPL Part 2", videos: [], docs: [ {
// //             id: "d3",
// //             title: "To-analytics Splunk Class 4",
// //             // url: "https://drive.google.com/file/d/1gyB2HZHHJ-LbX9r8EFVPfY-IOrWQtkwk/preview",
// //             // url: "https://docs.google.com/presentation/d/1Qc7nnnYfuIt-q2OXOvvxi8nJOp7PTh6I/preview",
// //             url:"https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview"
// //           },
// //         ] ,},

// //        { id: "class6", title: "Class 5  — Splunk Knowledge Objects", videos: [], docs: [] },
// //     ],
// //   },
// // ];

// // function storageProgressKey(email) {
// //   return `cp_progress_${(email || "").toLowerCase().trim()}`;
// // }

// // /**
// //  * CoursePortal (single-file)
// //  */
// // export default function CoursePortal() {
// //   const [courses] = useState(sampleCourses);
// //   const [selectedCourse, setSelectedCourse] = useState(courses[0]);
// //   const [selectedClass, setSelectedClass] = useState(courses[0].classes[0]);
// //   const [showClassDetails, setShowClassDetails] = useState(true);
// //   const [selectedVideo, setSelectedVideo] = useState(null);
// //   const [thumbnails, setThumbnails] = useState({});
// //   const playerRef = useRef(null);
// //   const vimeoPlayerRef = useRef(null);
// //   const [isMutedHint, setIsMutedHint] = useState(false);
// //   const [loadingThumbs, setLoadingThumbs] = useState(false);
// //   const [userEmail, setUserEmail] = useState("");
// //   const [isAllowed, setIsAllowed] = useState(false);
// //   const [progressState, setProgressState] = useState({}); // mirror of saved progress per-email

// //   // init: user + permission + progress state
// //   // useEffect(() => {
// //   //   const e = localStorage.getItem("user") || "";
// //   //   setUserEmail(e);
// //   //   setIsAllowed(
// //   //     allowedEmails
// //   //       .map((a) => a.toLowerCase())
// //   //       .includes((e || "").toLowerCase())
// //   //   );
// //   //   if (e) {
// //   //     try {
// //   //       const saved = JSON.parse(
// //   //         localStorage.getItem(storageProgressKey(e)) || "{}"
// //   //       );
// //   //       setProgressState(saved || {});
// //   //     } catch (err) {
// //   //       setProgressState({});
// //   //     }
// //   //   }
// //   //   // set default selected class/video
// //   //   setSelectedCourse(courses[0]);
// //   //   setSelectedClass(courses[0].classes[0]);
// //   // }, [courses]);

// //   useEffect(() => {
// //     const e = localStorage.getItem("user") || "";
// //     setUserEmail(e);

// //     // Check permission
// //     setIsAllowed(
// //       allowedEmails
// //         .map((a) => a.toLowerCase())
// //         .includes((e || "").toLowerCase())
// //     );

// //     // Load progress (from backend instead of localStorage)
// //     async function fetchProgress() {
// //       if (!e) return;

// //       try {
// //         // 1️⃣ Try to load from backend
// //         const res = await fetch(
// //           `${import.meta.env.VITE_API_BASE}/api/progress/${e}`
// //         );
// //         if (!res.ok) throw new Error("Failed to fetch backend data");

// //         const data = await res.json();

// //         // Convert backend array to object map
// //         const mapped = {};
// //         data.forEach((p) => {
// //           mapped[p.classId] = {
// //             note: p.note || "",
// //             time: p.time || 0,
// //             duration: p.duration || 0,
// //             completed: p.completed || false,
// //           };
// //         });
// //         setProgressState(mapped);

// //         // 2️⃣ Optionally sync into localStorage (for offline use)
// //         localStorage.setItem(storageProgressKey(e), JSON.stringify(mapped));
// //       } catch (err) {
// //         console.warn("Backend fetch failed, using local fallback:", err);
// //         // Fallback to localStorage
// //         try {
// //           const saved = JSON.parse(
// //             localStorage.getItem(storageProgressKey(e)) || "{}"
// //           );
// //           setProgressState(saved || {});
// //         } catch {
// //           setProgressState({});
// //         }
// //       }
// //     }

// //     fetchProgress();

// //     // set default selected class/video
// //     setSelectedCourse(courses[0]);
// //     setSelectedClass(courses[0].classes[0]);
// //   }, [courses]);

// //   // fetch thumbnails for the selected class videos via Vimeo oEmbed
// //   useEffect(() => {
// //     async function fetchThumbs() {
// //       setLoadingThumbs(true);
// //       const vmap = {};
// //       const videos = selectedClass.videos || [];
// //       await Promise.all(
// //         videos.map(async (v) => {
// //           if (v.thumbnail) {
// //             vmap[v.id] = v.thumbnail;
// //             return;
// //           }
// //           try {
// //             const videoUrl = v.url.includes("vimeo.com")
// //               ? v.url.replace("player.", "")
// //               : v.url;
// //             const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
// //               videoUrl
// //             )}`;
// //             const res = await fetch(oembed);
// //             if (!res.ok) throw new Error("no oembed");
// //             const data = await res.json();
// //             vmap[v.id] = data.thumbnail_url || null;
// //           } catch (e) {
// //             vmap[v.id] = null;
// //           }
// //         })
// //       );
// //       setThumbnails(vmap);
// //       setLoadingThumbs(false);
// //     }
// //     fetchThumbs();
// //   }, [selectedClass]);

// //   // initialize/destroy Vimeo player when selectedVideo changes
// //   useEffect(() => {
// //     if (!selectedVideo) return;

// //     // cleanup previous player
// //     if (vimeoPlayerRef.current) {
// //       try {
// //         vimeoPlayerRef.current.unload?.();
// //       } catch (e) {}
// //       try {
// //         vimeoPlayerRef.current.destroy?.();
// //       } catch (e) {}
// //       vimeoPlayerRef.current = null;
// //     }

// //     const iframe = document.createElement("iframe");
// //     iframe.setAttribute("src", `${selectedVideo.url}?transparent=0&autoplay=0`);
// //     iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
// //     iframe.style.width = "100%";
// //     iframe.style.height = "100%";
// //     iframe.setAttribute("frameborder", "0");

// //     if (playerRef.current) {
// //       playerRef.current.innerHTML = "";
// //       playerRef.current.appendChild(iframe);
// //     }

// //     const player = new Player(iframe);
// //     vimeoPlayerRef.current = player;

// //     // try to set volume; if blocked by browser autoplay policy, show hint
// //     player.setVolume(1).catch(() => setIsMutedHint(true));

// //     // restore last-time for this class/video if present
// //     try {
// //       const saved = JSON.parse(
// //         localStorage.getItem(storageProgressKey(userEmail)) || "{}"
// //       );
// //       const cls = saved[selectedClass.id] || {};
// //       if (cls.videoId === selectedVideo.id && cls.time > 0) {
// //         player
// //           .ready()
// //           .then(() => player.setCurrentTime(cls.time).catch(() => {}));
// //       }
// //     } catch (e) {}

// //     // periodically save time & auto-complete at 90%
// //     const interval = setInterval(async () => {
// //       try {
// //         const t = await player.getCurrentTime();
// //         const dur = await player.getDuration();
// //         updateVideoProgress(selectedClass.id, selectedVideo.id, t, dur);
// //       } catch (e) {}
// //     }, 3000);

// //     const onPlay = () => setIsMutedHint(false);
// //     player.on("play", onPlay);

// //     return () => {
// //       clearInterval(interval);
// //       try {
// //         player.off("play", onPlay);
// //       } catch (e) {}
// //       try {
// //         player.unload?.();
// //         player.destroy?.();
// //       } catch (e) {}
// //       vimeoPlayerRef.current = null;
// //     };
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [selectedVideo, selectedClass, userEmail]);

// //   // when switching class, clear selectedVideo and attempt to restore saved pointer
// //   useEffect(() => {
// //     setSelectedVideo(null);
// //     setShowClassDetails(true);
// //     try {
// //       const saved = JSON.parse(
// //         localStorage.getItem(storageProgressKey(userEmail)) || "{}"
// //       );
// //       const cls = saved[selectedClass.id] || {};
// //       if (cls.videoId) {
// //         const found = selectedClass.videos.find((v) => v.id === cls.videoId);
// //         if (found) setSelectedVideo(found);
// //       }
// //     } catch (e) {}
// //   }, [selectedClass, userEmail]);

// //   // helpers: update progress & mark complete
// //   function updateVideoProgress(classId, videoId, timeSec, durationSec) {
// //     const e = userEmail || "anonymous";
// //     const key = storageProgressKey(e);
// //     const prev = JSON.parse(localStorage.getItem(key) || "{}");
// //     prev[classId] = { ...(prev[classId] || {}), videoId, time: timeSec };
// //     if (durationSec > 0 && timeSec / durationSec >= 0.9) {
// //       prev[classId].completed = true;
// //     }
// //     localStorage.setItem(key, JSON.stringify(prev));
// //     setProgressState(prev);
// //   }

// //   function markClassCompleted(classId) {
// //     const e = userEmail || "anonymous";
// //     const key = storageProgressKey(e);
// //     const prev = JSON.parse(localStorage.getItem(key) || "{}");
// //     prev[classId] = { ...(prev[classId] || {}), completed: true };
// //     localStorage.setItem(key, JSON.stringify(prev));
// //     setProgressState(prev);
// //   }

// //   function isClassCompleted(classId) {
// //     const p = progressState[classId] || {};
// //     return !!p.completed;
// //   }

// //   if (!isAllowed) {
// //     return (
// //       <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
// //         <h1 className="text-3xl font-bold text-red-600 mb-4">
// //           Access Denied 🚫
// //         </h1>
// //         <p className="text-gray-700">
// //           This page is restricted to authorized To-Analytics members only.
// //         </p>
// //         {userEmail ? (
// //           <p className="mt-3 text-sm text-gray-500">Your email: {userEmail}</p>
// //         ) : (
// //           <p className="mt-3 text-sm text-gray-500">
// //             Please log in to view this page.
// //           </p>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-4">
// //       <NewFeaturePopup/>
// //       <DashboardDropdown />

// //       <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
// //         {/* Sidebar */}
// //         <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
// //           <h2 className="text-lg font-semibold mb-4">Courses</h2>

// //           <div className="space-y-2">
// //             {courses.map((c) => (
// //               <div key={c.id}>
// //                 <button
// //                   onClick={() => {
// //                     setSelectedCourse(c);
// //                     setSelectedClass(c.classes[0]);
// //                     window.scrollTo({ top: 0, behavior: "smooth" });
// //                   }}
// //                   className={`w-full text-left px-3 py-2 rounded-xl transition-all hover:bg-gray-100 ${
// //                     c.id === selectedCourse.id
// //                       ? "bg-gray-100 font-semibold"
// //                       : ""
// //                   }`}
// //                 >
// //                   {c.title}
// //                 </button>

// //                 {c.id === selectedCourse.id && (
// //                   <div className="mt-2 ml-2 space-y-1">
// //                     {c.classes.map((cl) => (
// //                       <button
// //                         key={cl.id}
// //                         onClick={() => {
// //                           setSelectedClass(cl);
// //                           setShowClassDetails(true);
// //                         }}
// //                         className={`flex items-center justify-between w-full text-left text-sm px-2 py-1 rounded-lg transition-all hover:bg-gray-100 ${
// //                           cl.id === selectedClass.id
// //                             ? "bg-blue-50 font-medium"
// //                             : ""
// //                         }`}
// //                       >
// //                         <span>
// //                           {isClassCompleted(cl.id) ? "✅" : "⭕"}{" "}
// //                           <span className="ml-2">{cl.title}</span>
// //                         </span>
// //                       </button>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             ))}
// //           </div>

// //           <div className="mt-6 border-t pt-4 text-sm text-gray-600">
// //             <div className="flex items-center justify-between">
// //               <span>Saved progress</span>
// //               <button
// //                 onClick={() => {
// //                   localStorage.removeItem(storageProgressKey(userEmail));
// //                   setProgressState({});
// //                   alert("Progress cleared for this account.");
// //                 }}
// //                 className="text-xs text-red-600 hover:underline"
// //               >
// //                 Clear
// //               </button>
// //             </div>
// //             <div className="mt-2 text-xs text-gray-500">
// //               Progress saved per email in your browser.
// //             </div>
// //           </div>
// //         </aside>

// //         {/* Main content */}
// //         <main className="col-span-12 md:col-span-6 bg-white rounded-2xl p-4 shadow-sm">
// //           <div className="flex items-start justify-between">
// //             <div>
// //               <h1 className="text-xl font-bold">{selectedClass.title}</h1>
// //               <p className="text-sm text-gray-500">
// //                 {selectedClass.videos.length > 1
// //                   ? `Contains ${selectedClass.videos.length} videos`
// //                   : "Video playlist"}
// //               </p>
// //             </div>
// //           </div>

// //           <div className="mt-4 ">
// //             {/* Video cards (for multi-video classes like Class 1) */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               {selectedClass.videos.map((v) => (
// //                 <div
// //                   key={v.id}
// //                   className={`p-3 rounded-xl border ${
// //                     selectedVideo && selectedVideo.id === v.id
// //                       ? "border-blue-400 shadow"
// //                       : "border-gray-200"
// //                   }`}
// //                 >
// //                   <div className="w-full h-40 bg-gray-200 overflow-hidden rounded">
// //                     {thumbnails[v.id] ? (
// //                       <img
// //                         src={thumbnails[v.id]}
// //                         alt={v.title}
// //                         className="w-full h-full object-cover"
// //                       />
// //                     ) : (
// //                       <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
// //                         {loadingThumbs ? "..." : "No thumb"}
// //                       </div>
// //                     )}
// //                   </div>

// //                   <div className="mt-2 flex items-center justify-between">
// //                     <div>
// //                       <div className="font-medium">{v.title}</div>
// //                       <div className="text-xs text-gray-500">
// //                         Vimeo • {v.id}
// //                       </div>
// //                     </div>
// //                     <div>
// //                       <button
// //                         onClick={() => setSelectedVideo(v)}
// //                         className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
// //                       >
// //                         Play
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             {/* Player area */}
// //             <div className="mt-6">
// //               <div
// //                 className="rounded-xl overflow-hidden border h-[420px] bg-black"
// //                 ref={playerRef}
// //               />

// //               <div className="mt-3 flex items-center justify-between">
// //                 <div className="text-sm text-gray-600">
// //                   {selectedVideo ? selectedVideo.title : "No video selected"}
// //                 </div>
// //                 <div className="flex items-center gap-3">
// //                   {isMutedHint && (
// //                     <div className="text-red-500 text-xs">
// //                       Audio may be blocked — play and allow sound on your
// //                       browser.
// //                     </div>
// //                   )}

// //                   <button
// //                     onClick={() => {
// //                       if (!selectedVideo) {
// //                         alert("Select a video first");
// //                         return;
// //                       }
// //                       markClassCompleted(selectedClass.id);
// //                     }}
// //                     className="px-3 py-2 rounded-lg bg-gray-100 text-sm"
// //                   >
// //                     Mark as Complete
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </main>

// //         {/* Right: Docs & Notes */}
// //         <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
// //           <h3 className="font-semibold">Slides & Notes</h3>

// //           <div className="mt-3">
// //             {selectedClass.docs.length > 0 ? (
// //               selectedClass.docs.map((doc) => (
// //                 <div key={doc.id} className="mb-2">
// //                   <a
// //                     href={doc.url}
// //                     target="_blank"
// //                     rel="noreferrer"
// //                     className="text-sm underline"
// //                   >
// //                     {doc.title}
// //                   </a>
// //                 </div>
// //               ))
// //             ) : (
// //               <div className="text-sm text-gray-500">
// //                 No slides yet for this class.
// //               </div>
// //             )}
// //           </div>

// //           <div className="mt-4">
// //             <h4 className="text-sm font-medium">Quick Notes</h4>
// //             <p className="text-xs text-gray-500">Notes saved per email.</p>
// //             {/* <textarea
// //               placeholder="Write notes..."
// //               className="w-full mt-2 p-2 rounded border min-h-[160px]"
// //               value={(() => {
// //                 try {
// //                   const saved = JSON.parse(
// //                     localStorage.getItem(storageProgressKey(userEmail)) || "{}"
// //                   );
// //                   return (
// //                     (saved[selectedClass.id] && saved[selectedClass.id].note) ||
// //                     ""
// //                   );
// //                 } catch (e) {
// //                   return "";
// //                 }
// //               })()}
// //               onChange={(e) => {
// //                 try {
// //                   const key = storageProgressKey(userEmail);
// //                   const prev = JSON.parse(localStorage.getItem(key) || "{}");
// //                   prev[selectedClass.id] = {
// //                     ...(prev[selectedClass.id] || {}),
// //                     note: e.target.value,
// //                   };
// //                   localStorage.setItem(key, JSON.stringify(prev));
// //                   setProgressState(prev);
// //                 } catch (err) {}
// //               }}
// //             /> */}
// //             <textarea
// //               placeholder="Write notes..."
// //               className="w-full mt-2 p-2 rounded border min-h-[160px]"
// //               value={(() => {
// //                 try {
// //                   const saved = JSON.parse(
// //                     localStorage.getItem(storageProgressKey(userEmail)) || "{}"
// //                   );
// //                   return (
// //                     (saved[selectedClass.id] && saved[selectedClass.id].note) ||
// //                     ""
// //                   );
// //                 } catch (e) {
// //                   return "";
// //                 }
// //               })()}
// //               onChange={async (e) => {
// //                 const note = e.target.value;
// //                 try {
// //                   // Update local storage
// //                   const key = storageProgressKey(userEmail);
// //                   const prev = JSON.parse(localStorage.getItem(key) || "{}");
// //                   prev[selectedClass.id] = {
// //                     ...(prev[selectedClass.id] || {}),
// //                     note,
// //                   };
// //                   localStorage.setItem(key, JSON.stringify(prev));
// //                   setProgressState(prev);

// //                   // 🔥 Save note to backend too
// //                   await fetch(
// //                     `${import.meta.env.VITE_API_BASE}/api/progress/save`,
// //                     {
// //                       method: "POST",
// //                       headers: { "Content-Type": "application/json" },
// //                       body: JSON.stringify({
// //                         email: userEmail,
// //                         courseId: selectedCourse.id,
// //                         classId: selectedClass.id,
// //                         note,
// //                       }),
// //                     }
// //                   );
// //                 } catch (err) {
// //                   console.error("Failed to save note:", err);
// //                 }
// //               }}
// //             />
// //           </div>
// //         </aside>
// //       </div>
// //     </div>
// //   );
// // }

// // the file is above the real one

// // import { useState, useEffect } from "react";
// // import { NavLink, Outlet } from "react-router-dom";

// // const Materials = () => {
// //   const allowedEmails = [
// //     "adenusitimi@gmail.com",
// //      "oluwaferanmiolulana@gmail.com",
// //     "Oluwaferanmi.olulana@gmail.com",
// //     "tomideolulana@gmail.com",
// //     "randommayowa@gmail.com",
// //     "yinkalola51@gmail.com",
// //     "toanalyticsllc@gmail.com",
// //     "kevwe_oberiko@yahoo.com",
// //     "denisgsam@gmail.com",
// //     "oluwaferanmi.olulana@gmail.com",
// //     "fpasamuelmayowa51@gmail.com",
// //     "oluwatiroyeamoye@gmail.com",
// //     "trbanjo@gmail.com",
// //     "emanfrimpong@gmail.com",
// //     "dipeoluolatunji@gmail.com",
// //     "lybertyudochuu@gmail.com",
// //   ];

// //   const [userEmail, setUserEmail] = useState("");
// //   const [isAllowed, setIsAllowed] = useState(false);

// //   useEffect(() => {
// //     const email = localStorage.getItem("user");
// //     setUserEmail(email);
// //     if (email) {
// //       const normalized = email.toLowerCase();
// //       const allowed = allowedEmails.map((e) => e.toLowerCase());
// //       setIsAllowed(allowed.includes(normalized));
// //     }
// //   }, []);

// //   const videos = [
// //     {
// //       id: 1,
// //       title: "To-analytics Orientation",
// //       url: "https://player.vimeo.com/video/1126909883?badge=0&autopause=0&player_id=0&app_id=58479",
// //     },
// //     {
// //       id: 2,
// //       title: "To-analytics Splunk Class 1",
// //       url: "https://player.vimeo.com/video/1127004938?badge=0&autopause=0&player_id=0&app_id=58479",
// //     },
// //   ];

// //   const docs = [
// //     {
// //       id: 1,
// //       title: "To-analytics Splunk Class 1 Intro",
// //       url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
// //     },
// //     {
// //       id: 2,
// //       title: "To-analytics Splunk Class 1 Note",
// //       url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
// //     },

// //     {
// //       id:3,
// //       title:"To-analytics Splunk Class 2",
// //       url:"https://drive.google.com/file/d/1V3zqvISvQLDZlQKUryIna4xnmAzcNRSC/preview"
// //     }
// //   ];

// //   const [selectedVideo, setSelectedVideo] = useState(videos[0]);
// //   const [selectedDoc, setSelectedDoc] = useState(docs[0]);

// //   if (!isAllowed) {
// //     return (
// //       <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
// //         <h1 className="text-3xl font-bold text-red-600 mb-4">
// //           Access Denied 🚫
// //         </h1>
// //         <p className="text-gray-700">
// //           This page is restricted to authorized To-Analytics members only.
// //         </p>
// //         {userEmail ? (
// //           <p className="mt-3 text-sm text-gray-500">Your email: {userEmail}</p>
// //         ) : (
// //           <p className="mt-3 text-sm text-gray-500">
// //             Please log in to view this page.
// //           </p>
// //         )}
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
// //       <h1 className="text-2xl font-bold text-gray-800">
// //         📚 Splunk Learning Materials
// //       </h1>
// // {/* materials */}

// //       <NavLink
// //         to="/dashboard/takequiz"
// //         className="inline-block bg-PURPLE hover:bg-BLUE text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
// //       >
// //         Take Splunk Quiz
// //       </NavLink>
// //       {/* <Outlet></Outlet> */}

// //       {/* === VIDEO SECTION === */}
// //       <div className="bg-white shadow-md rounded-2xl p-6">
// //         <h2 className="text-xl font-semibold mb-4">🎬 Class Videos</h2>

// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
// //           {videos.map((video) => (
// //             <div
// //               key={video.id}
// //               onClick={() => setSelectedVideo(video)}
// //               className={`cursor-pointer rounded-2xl border transition-all hover:scale-[1.03] hover:shadow-lg overflow-hidden bg-white ${
// //                 selectedVideo.id === video.id
// //                   ? "border-blue-500 shadow-md"
// //                   : "border-gray-200"
// //               }`}
// //             >
// //               <div className="aspect-video bg-black">
// //                 <iframe
// //                   src={`${video.url}&muted=1&autoplay=0`}
// //                   title={video.title}
// //                   className="w-full h-full rounded-t-2xl"
// //                   frameBorder="0"
// //                   allow="autoplay; fullscreen"
// //                 ></iframe>
// //               </div>
// //               <div className="p-4 bg-gray-50 text-sm font-semibold text-gray-800 text-center">
// //                 {video.title}
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* === DOCUMENT SECTION === */}
// //       <div className="bg-white shadow-md rounded-2xl p-4">
// //         <h2 className="text-lg font-semibold mb-4">📊 Slides</h2>

// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
// //           {docs.map((doc) => (
// //             <div
// //               key={doc.id}
// //               onClick={() => setSelectedDoc(doc)}
// //               className={`cursor-pointer rounded-2xl border bg-white transition-all overflow-hidden hover:scale-[1.03] hover:shadow-lg ${
// //                 selectedDoc.id === doc.id
// //                   ? "border-blue-500 shadow-md"
// //                   : "border-gray-200"
// //               }`}
// //             >
// //               <div className="aspect-[4/3] bg-gray-100">
// //                 <iframe
// //                   src={doc.url}
// //                   title={doc.title}
// //                   className="w-full h-full pointer-events-none rounded-t-2xl"
// //                   frameBorder="0"
// //                   allowFullScreen
// //                 ></iframe>
// //               </div>
// //               <div className="p-4 text-center text-sm font-semibold text-gray-800 truncate">
// //                 {doc.title}
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         <div className="mt-10">
// //           <h3 className="text-md font-semibold mb-3 text-gray-700">
// //             📖 Viewing: {selectedDoc.title}
// //           </h3>
// //           <div className="w-full h-[600px] rounded-xl overflow-hidden border">
// //             <iframe
// //               src={selectedDoc.url}
// //               title={selectedDoc.title}
// //               className="w-full h-full"
// //               frameBorder="0"
// //               allowFullScreen
// //             ></iframe>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Materials;
