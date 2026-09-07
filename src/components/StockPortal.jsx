import React, { useMemo, useState } from "react";
import { FaChartLine, FaBookOpen, FaVideo, FaCheck, FaFileLines, FaTrophy, FaFlask, FaArrowRight } from "react-icons/fa6";

/*
 T.O Analytics
 Stock & Options Academy Dashboard V2

 Features:
 - Premium academy dashboard
 - Course progress
 - Assignments
 - Trading Lab
 - Portfolio tracker
 - Achievements
*/

const stockCourse = [
  {
    id: "week1",
    title: "Orientation — Stock Market Basics",
    videos: [
      {
        title: "Understanding How The Stock Market Works",
        url: "https://player.vimeo.com/video/1157909911"
      }
    ],
    docs: [
      {
        title: "Stocks and Shares Guide",
        url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/edit?usp=sharing&ouid=104718481266065502968&rtpof=true&sd=true"
      }
    ]
  },
  {
    id: "week2",
    title: "Options Trading Fundamentals",
    videos: [
      {
        title: "Calls vs Puts Explained",
        url: "https://player.vimeo.com/video/1158002922"
      }
    ],
    docs: []
  },
  {
    id: "week3",
    title: "Technical Analysis & Indicators",
    videos: [],
    docs: []
  }
];

const assignments = [
  {
    title: "Options Greeks Analysis",
    status: "Pending",
    description:
      "Analyze Delta, Gamma, Theta and Vega for a selected stock."
  },
  {
    title: "Covered Call Strategy",
    status: "Completed",
    description:
      "Create a covered call strategy plan."
  }
];

export default function StockOptionsAcademyDashboardV2() {
  const [activeTab, setActiveTab] = useState("course");
  const [completed, setCompleted] = useState(["week1"]);

  const progress = useMemo(
    () => Math.round((completed.length / stockCourse.length) * 100),
    [completed]
  );

  return (
    <main className="min-h-screen bg-[#050816] p-6 text-white">
      <section className="mx-auto max-w-[1500px]">

        <header className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            T.O Analytics Academy
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Stock & Options Mastery Dashboard
          </h1>

          <p className="mt-3 text-white/60">
            Professional trading education portal with lessons,
            assignments and simulated trading practice.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {[
              ["Classes", stockCourse.length, FaBookOpen],
              ["Lessons", 12, FaVideo],
              ["Completed", completed.length, FaCheck],
              ["Progress", `${progress}%`, FaChartLine],
              ["Score", 850, FaTrophy]
            ].map(([name,value,Icon]) => (
              <div key={name} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <Icon className="mb-4 text-cyan-300" />
                <h3 className="text-3xl font-black">{value}</h3>
                <p className="text-sm text-white/50">{name}</p>
              </div>
            ))}
          </div>
        </header>


        <div className="mt-6 grid grid-cols-12 gap-6">

          <aside className="col-span-12 rounded-3xl border border-white/10 bg-white/10 p-5 lg:col-span-3">
            <h2 className="text-xl font-black">Academy Menu</h2>

            {[
              ["course","Course"],
              ["assignments","Assignments"],
              ["lab","Trading Lab"],
              ["portfolio","Portfolio"],
              ["certificate","Certificate"]
            ].map(([id,label])=>(
              <button
                key={id}
                onClick={()=>setActiveTab(id)}
                className="mt-3 flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 font-bold hover:bg-white/10"
              >
                {label}
                <FaArrowRight/>
              </button>
            ))}
          </aside>


          <section className="col-span-12 rounded-3xl border border-white/10 bg-white/10 p-6 lg:col-span-6">

            {activeTab==="course" && (
              <>
              <h2 className="text-3xl font-black">
                Trading Curriculum
              </h2>

              {stockCourse.map(item=>(
                <div key={item.id}
                  className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <h3 className="font-black text-xl">
                    {item.title}
                  </h3>

                  <button
                    onClick={()=>setCompleted([...completed,item.id])}
                    className="mt-4 rounded-xl bg-white px-4 py-2 text-black font-bold"
                  >
                    Mark Complete
                  </button>

                </div>
              ))}
              </>
            )}


            {activeTab==="assignments" && (
              <>
              <h2 className="text-3xl font-black">Assignments</h2>

              {assignments.map(a=>(
                <div className="mt-5 rounded-3xl bg-black/20 border border-white/10 p-5">
                  <h3 className="font-black">{a.title}</h3>
                  <p className="mt-2 text-white/60">{a.description}</p>
                  <span className="mt-3 inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-sm">
                    {a.status}
                  </span>
                </div>
              ))}
              </>
            )}


            {activeTab==="lab" && (
              <div>
                <h2 className="text-3xl font-black">Trading Lab</h2>
                <div className="mt-5 rounded-3xl bg-black/20 p-6">
                  <p>Paper Account Balance</p>
                  <h3 className="text-4xl font-black">$10,000</h3>
                  <button className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-bold">
                    Simulate Trade
                  </button>
                </div>
              </div>
            )}

            {activeTab==="portfolio" && (
              <div>
                <h2 className="text-3xl font-black">Portfolio Tracker</h2>
                <p className="mt-5 text-white/60">
                  Track simulated trades, wins, losses and strategy performance.
                </p>
              </div>
            )}

            {activeTab==="certificate" && (
              <div>
                <h2 className="text-3xl font-black">Certificate</h2>
                <p className="mt-5 text-white/60">
                  Complete the academy to unlock your certificate.
                </p>
              </div>
            )}

          </section>


          <aside className="col-span-12 rounded-3xl border border-white/10 bg-white/10 p-5 lg:col-span-3">

            <h2 className="text-xl font-black">
              Resources
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-black/20 p-4">
                <FaFileLines/>
                Notes & Slides
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

      </section>
    </main>
  );
}
