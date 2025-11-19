import React, { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import { NavLink } from "react-router-dom";
import DashboardDropdown from "./Dropdown";
import NewFeaturePopup from "./Newapp";
import Dropdownstock from "./DropdownStock";

const API_BASE = import.meta.env.VITE_HOME_OO || "http://localhost:8000";

// ✅ Authorized student emails
const allowedEmails = [
  "jahdek76@gmail.com",
  "samuelsamuelmayowa@gmail.com",
  "adenusitimi@gmail.com",
  "oluwaferanmiolulana@gmail.com",
  "oluwaferanmi.olulana@gmail.com",
  "tomideolulana@gmail.com",
  "yinkalola51@gmail.com",
  "toanalyticsllc@gmail.com",
  "kevwe_oberiko@yahoo.com",
  "denisgsam@gmail.com",
  "fpasamuelmayowa51@gmail.com",
  "oluwatiroyeamoye@gmail.com",
  "trbanjo@gmail.com",
  "emanfrimpong@gmail.com",
  "dipeoluolatunji@gmail.com",
  "lybertyudochuu@gmail.com",
];

// ✅ Course content for STOCK & OPTIONS
const sampleCourses = [
  {
    id: "stock",
    title: "Stock & Options Mastery",
    classes: [
      {
        id: "class1",
        title: "Orientation — Stock Market Basics",
        videos: [
          {
            id: "v1",
            title: "Understanding How the Stock Market Works",
            url: "https://player.vimeo.com/video/1157909911", // Example Vimeo link
          },
        ],
        docs: [
          {
            id: "d1",
            title: "Orientation — What Are Stocks and Shares?",
            url: "https://drive.google.com/file/d/1VzC-nTY7XhLagAeLIFdN1e6_MQMUkXiv/preview",
          },
        ],
      },
      {
        id: "class2",
        title: "Class 1 — Introduction to Options Trading",
        videos: [
          {
            id: "v2",
            title: "Calls vs Puts Explained with Real-Life Charts",
            url: "https://player.vimeo.com/video/1158002922",
          },
        ],
        docs: [
          {
            id: "d2",
            title: "Option Trading Notes",
            url: "https://drive.google.com/file/d/1VYiqPwen5Dc1tV2x8_ohR55n6toGBm1G/preview",
          },
        ],
      },
      {
        id: "class3",
        title: "Class 2 — Chart Patterns & Technical Indicators",
        videos: [
          {
            id: "v3",
            title: "Candlestick Patterns for Option Traders",
            url: "https://player.vimeo.com/video/1158050009",
          },
        ],
        docs: [
          {
            id: "d3",
            title: "Technical Indicators Guide (RSI, MACD, EMA)",
            url: "https://drive.google.com/file/d/1sf-kifLwlcAvM9qLcJTde9qWX3OCvd78/preview",
          },
        ],
      },
      {
        id: "class4",
        title: "Class 3 — Risk Management & Greeks",
        videos: [
          {
            id: "v4",
            title: "Delta, Theta, Vega, Gamma — The Option Greeks Simplified",
            url: "https://player.vimeo.com/video/1158124450",
          },
        ],
        docs: [
          {
            id: "d4",
            title: "Risk Management Rules for Traders",
            url: "https://drive.google.com/file/d/1mSIZVzbvnkdJylb8_nlcKhCDTcIRuQKM/preview",
          },
        ],
      },
      {
        id: "class5",
        title: "Class 4 — Trading Psychology & Strategy Setup",
        videos: [],
        docs: [],
      },
    ],
  },
];

// ✅ Local progress key
function storageProgressKey(email) {
  return `stock_progress_${(email || "").toLowerCase().trim()}`;
}

export default function StockPortal() {
  const [courses] = useState(sampleCourses);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedClass, setSelectedClass] = useState(courses[0].classes[0]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [isAllowed, setIsAllowed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [progressState, setProgressState] = useState({});
  const playerRef = useRef(null);
  const vimeoPlayerRef = useRef(null);
  const [isMutedHint, setIsMutedHint] = useState(false);

  // ✅ Initialize user and fetch saved progress
  useEffect(() => {
    const email = localStorage.getItem("user") || "";
    setUserEmail(email);
    setIsAllowed(
      allowedEmails
        .map((a) => a.toLowerCase())
        .includes((email || "").toLowerCase())
    );

    async function fetchProgress() {
      if (!email) return;
      try {
        const res = await fetch(`${API_BASE}/api/progress/${email}`);
        if (!res.ok) throw new Error("Progress fetch failed");
        const data = await res.json();
        const mapped = {};
        data.forEach((p) => {
          mapped[p.classId] = {
            note: p.note || "",
            time: p.time || 0,
            duration: p.duration || 0,
            completed: p.completed || false,
          };
        });
        setProgressState(mapped);
        localStorage.setItem(storageProgressKey(email), JSON.stringify(mapped));
      } catch {
        try {
          const saved = JSON.parse(
            localStorage.getItem(storageProgressKey(email)) || "{}"
          );
          setProgressState(saved);
        } catch {
          setProgressState({});
        }
      }
    }

    fetchProgress();
    setSelectedCourse(courses[0]);
    setSelectedClass(courses[0].classes[0]);
  }, [courses]);

  // ✅ Fetch Vimeo thumbnails
  useEffect(() => {
    async function fetchThumbs() {
      const videos = selectedClass.videos || [];
      const vmap = {};
      await Promise.all(
        videos.map(async (v) => {
          try {
            const videoUrl = v.url.replace("player.", "");
            const res = await fetch(
              `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`
            );
            const data = await res.json();
            vmap[v.id] = data.thumbnail_url;
          } catch {
            vmap[v.id] = null;
          }
        })
      );
      setThumbnails(vmap);
    }
    fetchThumbs();
  }, [selectedClass]);

  // ✅ Initialize player when video changes
  useEffect(() => {
    if (!selectedVideo) return;
    if (vimeoPlayerRef.current) {
      try {
        vimeoPlayerRef.current.destroy();
      } catch {}
      vimeoPlayerRef.current = null;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", `${selectedVideo.url}?transparent=0&autoplay=0`);
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.setAttribute("frameborder", "0");

    if (playerRef.current) {
      playerRef.current.innerHTML = "";
      playerRef.current.appendChild(iframe);
    }

    const player = new Player(iframe);
    vimeoPlayerRef.current = player;

    player.setVolume(1).catch(() => setIsMutedHint(true));

    // Save progress
    const interval = setInterval(async () => {
      try {
        const t = await player.getCurrentTime();
        const d = await player.getDuration();
        updateProgress(selectedClass.id, selectedVideo.id, t, d);
      } catch {}
    }, 3000);

    return () => {
      clearInterval(interval);
      try {
        player.destroy();
      } catch {}
    };
  }, [selectedVideo]);

  function updateProgress(classId, videoId, time, duration) {
    const email = userEmail || "anonymous";
    const key = storageProgressKey(email);
    const prev = JSON.parse(localStorage.getItem(key) || "{}");
    prev[classId] = { ...(prev[classId] || {}), videoId, time };
    if (duration > 0 && time / duration >= 0.9) {
      prev[classId].completed = true;
    }
    localStorage.setItem(key, JSON.stringify(prev));
    setProgressState(prev);
  }

  function markClassCompleted(classId) {
    const email = userEmail || "anonymous";
    const key = storageProgressKey(email);
    const prev = JSON.parse(localStorage.getItem(key) || "{}");
    prev[classId] = { ...(prev[classId] || {}), completed: true };
    localStorage.setItem(key, JSON.stringify(prev));
    setProgressState(prev);
  }

  function isClassCompleted(id) {
    return progressState[id]?.completed;
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Access Denied 🚫
        </h1>
        <p className="text-gray-700">
          Only authorized Stock & Options students can view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <NewFeaturePopup />
      {/* <DashboardDropdown /> */}
    <Dropdownstock/>
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Classes</h2>

          {courses.map((c) => (
            <div key={c.id}>
              <button
                onClick={() => {
                  setSelectedCourse(c);
                  setSelectedClass(c.classes[0]);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl ${
                  c.id === selectedCourse.id ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {c.title}
              </button>

              {c.id === selectedCourse.id && (
                <div className="ml-3 mt-2 space-y-1">
                  {c.classes.map((cl) => (
                    <button
                      key={cl.id}
                      onClick={() => setSelectedClass(cl)}
                      className={`w-full text-left text-sm px-2 py-1 rounded-lg ${
                        cl.id === selectedClass.id
                          ? "bg-blue-50 font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {isClassCompleted(cl.id) ? "✅" : "⭕"} {cl.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="col-span-12 md:col-span-6 bg-white rounded-2xl p-4 shadow-sm">
          <h1 className="text-xl font-bold">{selectedClass.title}</h1>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedClass.videos.map((v) => (
              <div
                key={v.id}
                className={`p-3 rounded-xl border ${
                  selectedVideo && selectedVideo.id === v.id
                    ? "border-blue-400 shadow"
                    : "border-gray-200"
                }`}
              >
                <div className="w-full h-40 bg-gray-200 overflow-hidden rounded">
                  {thumbnails[v.id] ? (
                    <img
                      src={thumbnails[v.id]}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-medium">{v.title}</div>
                  <button
                    onClick={() => setSelectedVideo(v)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Player */}
          <div className="mt-6">
            <div
              className="rounded-xl overflow-hidden border h-[420px] bg-black"
              ref={playerRef}
            />
            {isMutedHint && (
              <p className="text-xs text-red-500 mt-2">
                🔇 Allow audio manually in your browser.
              </p>
            )}
            <button
              onClick={() => markClassCompleted(selectedClass.id)}
              className="mt-3 px-3 py-2 bg-gray-100 rounded-lg text-sm"
            >
              Mark as Complete
            </button>
          </div>
        </main>

        {/* Docs */}
        <aside className="col-span-12 md:col-span-3 bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold">Slides & Notes</h3>
          {selectedClass.docs.length > 0 ? (
            selectedClass.docs.map((doc) => (
              <div key={doc.id} className="mt-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  {doc.title}
                </a>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              No slides yet for this class.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
