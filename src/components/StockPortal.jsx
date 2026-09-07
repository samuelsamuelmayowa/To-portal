import React, { useMemo, useState } from "react";
import {
  FaChartLine,
  FaBookOpen,
  FaVideo,
  FaCheck,
  FaFileLines,
  FaTrophy,
  FaFlask,
  FaArrowRight,
  FaPlay,
  FaClipboardCheck
} from "react-icons/fa6";

/*
 T.O Analytics
 Stock & Options Mastery Academy

 Features:
 - Premium dashboard
 - Course lessons
 - Vimeo videos
 - Google Drive materials
 - Assignments
 - Trading Lab
 - Portfolio tracker
 - Achievements
*/

const stockCourse = [
  {
    id: "week1",
    title: "Orientation — Stock Market Basics",
    description:
      "Understand stocks, shares, exchanges and how markets operate.",
    videos: [
      {
        title: "Understanding How The Stock Market Works",
        url: "https://player.vimeo.com/video/1157909911"
      }
    ],
    docs: [
      {
        title: "Stocks and Shares Guide",
        url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
      }
    ]
  },
  {
    id: "week2",
    title: "Options Trading Fundamentals",
    description:
      "Learn calls, puts, contracts and options strategies.",
    videos: [
      {
        title: "Calls vs Puts Explained",
        url: "https://player.vimeo.com/video/1158002922"
      }
    ],
    docs: [
      {
        title: "Options Trading Notes",
        url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
      }
    ]
  },
  {
    id: "week3",
    title: "Technical Analysis & Indicators",
    description:
      "Candlestick patterns, RSI, MACD and trading indicators.",
    videos: [],
    docs: []
  }
];

const assignments = [
  {
    id: "assignment1",
    title: "Options Strategy Lab",
    week: "Week 3",
    description:
      "Analyze an options strategy and submit your findings.",
    url:
      "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview",
    status: "Available"
  }
];

export default function StockOptionsAcademyDashboard() {

  const [activeTab, setActiveTab] = useState("course");
  const [completed, setCompleted] = useState(["week1"]);

  const progress = useMemo(
    () =>
      Math.round((completed.length / stockCourse.length) * 100),
    [completed]
  );

  const completeClass = (id) => {
    if (!completed.includes(id)) {
      setCompleted([...completed, id]);
    }
  };


  return (
    <main className="min-h-screen bg-[#050816] p-5 text-white">

      <div className="mx-auto max-w-[1600px]">

        <header className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl">

          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            T.O Analytics Academy
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            Stock & Options Mastery Dashboard
          </h1>

          <p className="mt-3 text-white/60">
            Professional trading education portal with lessons,
            assignments and practice labs.
          </p>


          <div className="mt-8 grid gap-4 md:grid-cols-5">

            {[
              ["Classes", stockCourse.length, FaBookOpen],
              ["Videos", 2, FaVideo],
              ["Completed", completed.length, FaCheck],
              ["Progress", `${progress}%`, FaChartLine],
              ["Score", 850, FaTrophy]
            ].map(([label,value,Icon]) => (

              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-black/20 p-5"
              >
                <Icon className="mb-4 text-cyan-300"/>
                <h3 className="text-3xl font-black">{value}</h3>
                <p className="text-white/50">{label}</p>
              </div>

            ))}

          </div>

        </header>


        <div className="mt-6 grid grid-cols-12 gap-6">


          <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-5 lg:col-span-3">

            <h2 className="text-xl font-black">
              Academy Menu
            </h2>

            {[
              ["course","Course"],
              ["assignments","Assignments"],
              ["lab","Trading Lab"],
              ["portfolio","Portfolio"],
              ["certificate","Certificate"]
            ].map(([id,label]) => (

              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 font-bold hover:bg-white/10"
              >
                {label}
                <FaArrowRight/>
              </button>

            ))}

          </aside>



          <section className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-6 lg:col-span-6">


          {activeTab === "course" && (

            <>
            <h2 className="text-3xl font-black">
              Trading Curriculum
            </h2>


            {stockCourse.map(course => (

              <div
                key={course.id}
                className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5"
              >

                <h3 className="text-xl font-black">
                  {course.title}
                </h3>

                <p className="mt-2 text-white/60">
                  {course.description}
                </p>


                <h4 className="mt-5 font-bold text-cyan-300">
                  Videos
                </h4>

                {course.videos.map(video => (

                  <a
                    key={video.title}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3"
                  >
                    <FaPlay/>
                    {video.title}
                  </a>

                ))}


                <h4 className="mt-5 font-bold text-cyan-300">
                  Documents
                </h4>

                {course.docs.length ? course.docs.map(doc => (

                  <a
                    key={doc.title}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3"
                  >
                    <FaFileLines/>
                    {doc.title}
                  </a>

                )) : (
                  <p className="mt-2 text-white/40">
                    No documents uploaded
                  </p>
                )}


                <button
                  onClick={() => completeClass(course.id)}
                  className="mt-5 rounded-xl bg-white px-4 py-2 font-bold text-black"
                >
                  Mark Complete
                </button>


              </div>

            ))}

            </>

          )}



          {activeTab === "assignments" && (

            <>
            <h2 className="text-3xl font-black">
              Assignments
            </h2>

            {assignments.map(item => (

              <div
                key={item.id}
                className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5"
              >

                <h3 className="text-xl font-black">
                  {item.title}
                </h3>

                <p className="mt-2 text-white/60">
                  {item.description}
                </p>

                <span className="mt-3 inline-block rounded-full bg-cyan-500/20 px-3 py-1">
                  {item.status}
                </span>


                <br/>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-black"
                >
                  <FaClipboardCheck/>
                  Open Assignment
                </a>

              </div>

            ))}

            </>

          )}


          {activeTab === "lab" && (
            <div>
              <h2 className="text-3xl font-black">
                Trading Lab
              </h2>

              <div className="mt-5 rounded-3xl bg-black/20 p-6">
                <p>Paper Trading Account</p>
                <h3 className="text-4xl font-black">
                  $10,000
                </h3>

                <button className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-bold">
                  Simulate Trade
                </button>
              </div>
            </div>
          )}


          {activeTab === "portfolio" && (
            <div>
              <h2 className="text-3xl font-black">
                Portfolio Tracker
              </h2>

              <p className="mt-4 text-white/60">
                Track practice trades and performance.
              </p>
            </div>
          )}


          {activeTab === "certificate" && (
            <div>
              <h2 className="text-3xl font-black">
                Certificate
              </h2>

              <p className="mt-4 text-white/60">
                Complete the academy to unlock your certificate.
              </p>
            </div>
          )}


          </section>



          <aside className="col-span-12 rounded-[2rem] border border-white/10 bg-white/10 p-5 lg:col-span-3">

            <h2 className="text-xl font-black">
              Resources
            </h2>

            <div className="mt-5 space-y-3">

              <div className="rounded-2xl bg-black/20 p-4">
                <FaFileLines/>
                Documents
              </div>

              <div className="rounded-2xl bg-black/20 p-4">
                <FaFlask/>
                Strategy Practice
              </div>

              <div className="rounded-2xl bg-black/20 p-4">
                <FaTrophy/>
                Achievements
              </div>

            </div>

          </aside>


        </div>

      </div>

    </main>
  );
}
