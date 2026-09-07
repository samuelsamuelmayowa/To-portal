import React, { useMemo, useState } from "react";
import { FaFileLines, FaArrowRight, FaBookOpen, FaVideo, FaCheck, FaChartLine, FaTrophy } from "react-icons/fa6";

/*
 T.O Analytics Stock & Options Academy Dashboard V3
 Fixed:
 - Google Drive documents render
 - Assignment links render
 - Dynamic course materials
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
        url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview"
      }
    ]
  }
];

const assignments = [
  {
    id: "a1",
    title: "Options Strategy Lab",
    week: "Week 3",
    description: "Analyze an options strategy and submit your findings.",
    url: "https://docs.google.com/presentation/d/1JBX4RqczU1B0GZ2YV3zpyCvBuXTs4YOc/preview",
    status: "Available"
  }
];

export default function StockOptionsAcademyDashboardV3(){

 const [activeTab,setActiveTab]=useState("course");
 const [completed,setCompleted]=useState(["week1"]);

 const progress=useMemo(
  ()=>Math.round((completed.length/stockCourse.length)*100),
  [completed]
 );

 return (
  <main className="min-h-screen bg-[#050816] p-6 text-white">
   <section className="mx-auto max-w-[1500px]">

    <header className="rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
     <h1 className="text-5xl font-black">Stock & Options Mastery Dashboard</h1>

     <div className="mt-8 grid gap-4 md:grid-cols-4">
      {[
       ["Classes",stockCourse.length,FaBookOpen],
       ["Videos",1,FaVideo],
       ["Completed",completed.length,FaCheck],
       ["Progress",progress+"%",FaChartLine]
      ].map(([t,v,I])=>(
       <div key={t} className="rounded-3xl bg-black/20 p-5">
        <I/>
        <h3 className="text-3xl font-black">{v}</h3>
        <p>{t}</p>
       </div>
      ))}
     </div>
    </header>

    <div className="mt-6 grid grid-cols-12 gap-6">

     <aside className="col-span-12 lg:col-span-3 rounded-3xl bg-white/10 p-5">
      {["course","assignments","lab","portfolio","certificate"].map(x=>(
       <button
        key={x}
        onClick={()=>setActiveTab(x)}
        className="mt-3 flex w-full justify-between rounded-xl bg-white/5 p-3"
       >
        {x}<FaArrowRight/>
       </button>
      ))}
     </aside>

     <section className="col-span-12 lg:col-span-6 rounded-3xl bg-white/10 p-6">

      {activeTab==="course" && stockCourse.map(c=>(
       <div key={c.id} className="rounded-3xl bg-black/20 p-5">

        <h2 className="text-2xl font-black">{c.title}</h2>

        <h3 className="mt-4 text-cyan-300">Videos</h3>
        {c.videos.map(v=>(
         <a key={v.title} href={v.url} target="_blank" className="block p-3 bg-white/5 mt-2 rounded-xl">
          🎥 {v.title}
         </a>
        ))}

        <h3 className="mt-4 text-cyan-300">Documents</h3>
        {c.docs.map(d=>(
         <a key={d.title} href={d.url} target="_blank" rel="noreferrer" className="flex gap-2 p-3 bg-white/5 mt-2 rounded-xl">
          <FaFileLines/> {d.title}
         </a>
        ))}

       </div>
      ))}

      {activeTab==="assignments" && assignments.map(a=>(
       <div key={a.id} className="rounded-3xl bg-black/20 p-5">
        <h2 className="text-2xl font-black">{a.title}</h2>
        <p>{a.description}</p>
        <a href={a.url} target="_blank" rel="noreferrer" className="inline-block mt-4 bg-white text-black p-3 rounded-xl">
         Open Assignment
        </a>
       </div>
      ))}

     </section>

     <aside className="col-span-12 lg:col-span-3 rounded-3xl bg-white/10 p-5">
      <h2 className="font-black">Resources</h2>
      <div className="mt-4 bg-black/20 p-4 rounded-xl">
       <FaTrophy/> Achievements
      </div>
     </aside>

    </div>

   </section>
  </main>
 )
}
