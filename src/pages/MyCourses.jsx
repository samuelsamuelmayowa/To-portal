import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import stock from "../assets/images/stock.png";
import splunk from "../assets/images/splunk.png";

export default function MyCourses() {
  const [authorized, setAuthorized] = useState(false);

  /* ===============================
     USER NORMALIZATION (ROBUST)
  =============================== */
  const userEmail = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return (parsed?.email || raw).toLowerCase().trim();
    } catch {
      return (localStorage.getItem("user") || "").toLowerCase().trim();
    }
  }, []);

  /* ===============================
     ACCESS CONTROL (CLEAN)
  =============================== */
  const allowedEmails = useMemo(
    () =>
      new Set(
        [
          "kewizle.k@gmail.com",
          "kewizlek@gmail.com",
          "davidayeni63@gmail.com",
          "adesh25416@gmail.com",
          "basseyvera018@gmail.com",
          "codeverseprogramming23@gmail.com",
          "fadeleolutola@gmail.com",
          "ooolajuyigbe@gmail.com",
          "jahdek76@gmail.com",
          "samuelsamuelmayowa@gmail.com",
          "oluwaferanmiolulana@gmail.com",
          "tomideolulana@gmail.com",
          "toanalyticsllc@gmail.com",
          "lybertyudochuu@gmail.com",
          "kevwe_oberiko@yahoo.com",
          "denisgsam@gmail.com",
          "oluwaferanmi.olulana@gmail.com",
          "fpasamuelmayowa51@gmail.com",
          "randommayowa@gmail.com",
          "oluwatiroyeamoye@gmail.com",
          "adenusitimi@gmail.com",
          "trbanjo@gmail.com",
          "emanfrimpong@gmail.com",
          "dipeoluolatunji@gmail.com",
          "yinkalola51@gmail.com",
        ].map((e) => e.toLowerCase()),
      ),
    [],
  );

  const stockAccess = useMemo(
    () => new Set(["tomideolulana@gmail.com", "toanalyticsllc@gmail.com"]),
    [],
  );

  useEffect(() => {
    setAuthorized(allowedEmails.has(userEmail));
  }, [userEmail, allowedEmails]);

  /* ===============================
     🚫 ACCESS DENIED VIEW
  =============================== */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-6">
        <div className="max-w-md text-center bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-800">
          <h1 className="text-2xl font-bold text-red-500">Access Restricted</h1>
          <p className="mt-4 text-slate-400">
            This account does not have access to paid courses.
          </p>
          <p className="mt-2 text-sm text-slate-500 break-all">
            {userEmail || "Unknown user"}
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
     🎓 AUTHORIZED VIEW
  =============================== */
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold">🎓 My Paid Courses</h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          Welcome back. Access your premium learning programs, watch lessons,
          and continue where you left off.
        </p>
      </div>

      {/* COURSE GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* SPLUNK COURSE */}
        <CourseCard
          to="/dashboard/materials"
          image={splunk}
          title="Splunk Training"
          accent="blue"
          description="Master Splunk SPL, dashboards, alerts, and real-world SIEM use cases."
          badge="Active"
        />

        {/* STOCK COURSE (RESTRICTED) */}
        {stockAccess.has(userEmail) && (
          <CourseCard
            to="/dashboard/stockportal"
            image={stock}
            title="Stock & Options"
            accent="green"
            description="Advanced trading strategies, options analysis, and market risk control."
            badge="Private"
          />
        )}
      </div>
    </div>
  );
}

/* ===============================
   🧩 COURSE CARD COMPONENT
=============================== */
function CourseCard({ to, image, title, description, accent, badge }) {
  const accentMap = {
    blue: "from-blue-600 to-indigo-600",
    green: "from-green-600 to-emerald-600",
  };

  return (
    <NavLink
      to={to}
      className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl hover:shadow-2xl transition"
    >
      {/* IMAGE */}
      <div className="relative h-52">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <span
            className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${accentMap[accent]}`}
          >
            {badge}
          </span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          {description}
        </p>

        <button
          className={`mt-4 w-full py-2 rounded-xl text-sm font-medium text-white
            bg-gradient-to-r ${accentMap[accent]}
            hover:opacity-90 transition`}
        >
          Continue Learning →
        </button>
      </div>
    </NavLink>
  );
}

// import { useEffect, useState } from "react";
// import { NavLink } from "react-router-dom";
// import stock from "../assets/images/stock.png";
// import splunk from "../assets/images/splunk.png";

// const MyCourses = () => {
//   const [authorized, setAuthorized] = useState(false);

//   // ✅ Handle user storage
//   const rawUser = localStorage.getItem("user");
//   let user = null;
//   try {
//     user = JSON.parse(rawUser);
//   } catch {
//     user = { email: rawUser };
//   }

//   const userEmail = user?.email || "";

//   // ✅ Main allowed emails (for the entire page)
//   const allowedEmails = [
//     "kewizle.k@gmail.com",
//      "kewizlek@gmail.com",
//     "Kewizle.k@gmail.com",
//     "dafdfda",
//     "Davidayeni63@gmail.com",
//     "Adesh25416@gmail.com",
//     "davidayeni63@gmail.com",
//     "adesh25416@gmail.com",
//     "basseyvera018@gmail.com",
//     "codeverseprogramming23@gmail.com",
//     "fadeleolutola@gmail.com",
//     "ooolajuyigbe@gmail.com",
//     "jahdek76@gmail.com",
//     "samuelsamuelmayowa@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "tomideolulana@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "lybertyudochuu@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "randommayowa@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "adenusitimi@gmail.com",
//     "Trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "dipeoluolatunji@gmail.com",
//     "yinkalola51@gmail.com",
//   ];

//   useEffect(() => {
//     setAuthorized(allowedEmails.includes(userEmail));
//   }, [userEmail]);

//   // 🚫 Not authorized
//   if (!authorized) {
//     return (
//       <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
//         <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
//         <p className="mt-4 text-gray-700">
//           This account (
//           <span className="font-semibold">{userEmail || "Unknown"}</span>) does
//           not have access to this course.
//         </p>
//       </div>
//     );
//   }

//   // ✅ Special access list for "Stock & Options"
//   const stockAccess = ["tomideolulana@gmail.com", "toanalyticsllc@gmail.com"];

//   // 🎓 Authorized View
//   return (
//     <div className="p-6 space-y-6">
//       <div className="space-y-3 max-w-2xl mx-auto text-center">
//         <h1 className="text-3xl font-bold text-gray-800">🎓 Paid Courses</h1>
//         <p className="text-gray-600 leading-relaxed">
//           Welcome to your paid courses area! Here you’ll find exclusive content
//           available only to enrolled students. Access videos, PowerPoint slides,
//           and learning resources related to your purchased course(s).
//         </p>
//       </div>

//       {/* ✅ Course Cards */}
//       <div className="flex flex-wrap gap-6 justify-center">
//         {/* Splunk Course — visible to all authorized users */}
//         <NavLink
//           to="/dashboard/materials"
//           className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
//         >
//           <img
//             src={splunk}
//             alt="Splunk"
//             className="w-full h-[200px] object-cover"
//           />
//           <div className="p-4 bg-blue-600 text-white">
//             <p className="font-bold text-lg md:text-2xl mb-2">Splunk</p>
//             <p className="text-sm md:text-base">
//               Learn how to search, analyze, and visualize machine data using
//               Splunk SPL and dashboards.
//             </p>
//           </div>
//         </NavLink>

//         {/* Stock & Options Course — visible ONLY to Tomide & TO Analytics */}
//         {stockAccess.includes(userEmail) && (
//           <NavLink
//             to="/dashboard/stockportal"
//             className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
//           >
//             <img
//               src={stock}
//               alt="Stock & Options"
//               className="w-full h-[200px] object-cover"
//             />
//             <div className="p-4 bg-green-600 text-white">
//               <p className="font-bold text-lg md:text-2xl mb-2">
//                 Stock & Options
//               </p>
//               <p className="text-sm md:text-base">
//                 Master trading strategies, risk management, and options analysis
//                 in financial markets.
//               </p>
//             </div>
//           </NavLink>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyCourses;

// import { useEffect, useState } from "react";
// import { NavLink } from "react-router-dom";
// import COURSES from "../coursesAPI/api";
// import stock from "../assets/images/stock.png";
// import splunk from "../assets/images/splunk.png";

// const MyCourses = () => {
//   const [authorized, setAuthorized] = useState(false);

//   // ✅ Handle user storage
//   const rawUser = localStorage.getItem("user");
//   let user = null;
//   try {
//     user = JSON.parse(rawUser);
//   } catch {
//     user = { email: rawUser };
//   }

//   const userEmail = user?.email || "";

//   const allowedEmails = [
//     "samuelsamuelmayowa@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "tomideolulana@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "lybertyudochuu@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "randommayowa@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "adenusitimi@gmail.com",
//     "Trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "dipeoluolatunji@gmail.com",
//     "yinkalola51@gmail.com",
//   ];

//   useEffect(() => {
//     if (allowedEmails.includes(userEmail)) {
//       setAuthorized(true);
//     } else {
//       setAuthorized(false);
//     }
//   }, [userEmail]);

//   // 🚫 Not authorized
//   if (!authorized) {
//     return (
//       <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
//         <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
//         <p className="mt-4 text-gray-700">
//           This account (
//           <span className="font-semibold">{userEmail || "Unknown"}</span>) does
//           not have access to this course.
//         </p>
//       </div>
//     );
//   }

//   // 🎓 Authorized View
//   return (
//     <div className="p-6 space-y-6">
//       <div className="space-y-3 max-w-2xl mx-auto text-center">
//         <h1 className="text-3xl font-bold text-gray-800">🎓 Paid Courses</h1>
//         <p className="text-gray-600 leading-relaxed">
//           Welcome to your paid courses area! Here you’ll find exclusive content
//           available only to enrolled students. Access videos, PowerPoint slides,
//           and learning resources related to your purchased course(s).
//         </p>
//       </div>

//       {/* ✅ Two hard-coded NavLinks */}
//       <div className="flex flex-wrap gap-6 justify-center">

//         {/* Splunk Course */}
//         <NavLink
//           to="/dashboard/materials"
//           className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
//         >
//           <img
//             src={splunk}
//             alt="Splunk"
//             className="w-full h-[200px] object-cover"
//           />
//           <div className="p-4 bg-blue-600 text-white">
//             <p className="font-bold text-lg md:text-2xl mb-2">Splunk</p>
//             <p className="text-sm md:text-base">
//               Learn how to search, analyze, and visualize machine data using
//               Splunk SPL and dashboards.
//             </p>
//           </div>
//         </NavLink>

//         {/* Stock & Options Course */}
//         <NavLink
//           to="/dashboard/materials"
//           className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
//         >
//           <img
//             src={stock}
//             alt="Stock & Options"
//             className="w-full h-[200px] object-cover"
//           />
//           <div className="p-4 bg-green-600 text-white">
//             <p className="font-bold text-lg md:text-2xl mb-2">
//               Stock & Options
//             </p>
//             <p className="text-sm md:text-base">
//               Master trading strategies, risk management, and options analysis
//               in financial markets.
//             </p>
//           </div>
//         </NavLink>
//       </div>
//     </div>
//   );
// };

// export default MyCourses;

// import { useEffect, useState } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import COURSES from "../coursesAPI/api";

// const MyCourses = () => {
//   const [authorized, setAuthorized] = useState(false);
//   const [courseData, setCourseData] = useState([]);

//   // ✅ Handle user storage (in case it's JSON or a plain string)
//   const rawUser = localStorage.getItem("user");
//   let user = null;
//   try {
//     user = JSON.parse(rawUser);
//   } catch {
//     user = { email: rawUser };
//   }
//   // fpasamuelmayowa51@gmail.com
//   const userEmail = user?.email || "";
//   const allowedEmails = [
//     "oluwaferanmiolulana@gmail.com",
//     "tomideolulana@gmail.com",
//     // "oluwaferanmi.olulana@gmail.com",
//     "toanalyticsllc@gmail.com",
//     "lybertyudochuu@gmail.com",
//     "kevwe_oberiko@yahoo.com",
//     "denisgsam@gmail.com",
//     "oluwaferanmi.olulana@gmail.com",
//     "fpasamuelmayowa51@gmail.com",
//     "oluwaferanmiolulana@gmail.com",
//     "randommayowa@gmail.com",
//     "oluwatiroyeamoye@gmail.com",
//     "adenusitimi@gmail.com",
//     "Trbanjo@gmail.com",
//     "emanfrimpong@gmail.com",
//     "dipeoluolatunji@gmail.com",
//     "lybertyudochuu@gmail.com",
//     "yinkalola51@gmail.com",
//   ];

//   useEffect(() => {
//     if (allowedEmails.includes(userEmail)) {
//       setAuthorized(true);
//       // ✅ Default course (Linux or any course you want)
//       const defaultCourse = COURSES.filter(
//         (course) => course.courseName === "Splunk"
//       );
//       setCourseData(defaultCourse);
//     } else {
//       setAuthorized(false);
//       setCourseData([]);
//     }
//   }, [userEmail]);

//   // 🚫 Not authorized
//   if (!authorized) {
//     return (
//       <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
//         <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
//         <p className="mt-4 text-gray-700">
//           This account (
//           <span className="font-semibold">{userEmail || "Unknown"}</span>) does
//           not have access to this course.
//         </p>
//       </div>
//     );
//   }

//   // 🎓 Show default course
//   return (
//     <div className="p-6 space-y-6">
//       {/* 🧾 Description Section */}
//       {/* <div className=" space-y-3">
//         <h1 className="text-3xl font-bold text-gray-800  ">🎓 Paid Courses</h1>
//         <p className="text-gray-600 ">
//           Welcome to your paid courses area! Here you’ll find exclusive content
//           available only to enrolled students. Access videos, PowerPoint slides,
//           and learning resources related to your purchased course(s).
//         </p>
//       </div> */}

//       <NavLink to="/dashboard/materials">
//         {/* 💻 Course Display */}
//         <div className="space-y-8">
//           {/* Top Section */}
//           <div className="space-y-3 max-w-2xl">
//             <h1 className="text-3xl font-bold text-gray-800">
//               🎓 Paid Courses
//             </h1>
//             <p className="text-gray-600 leading-relaxed">
//               Welcome to your paid courses area! Here you’ll find exclusive
//               content available only to enrolled students. Access videos,
//               PowerPoint slides, and learning resources related to your
//               purchased course(s).
//             </p>
//           </div>

//           {/* Course Cards Section */}
//           <div className="flex flex-wrap gap-6">
//             {courseData.map((course, index) => (
//               <div
//                 key={index}
//                 className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
//                 data-aos="fade-up"
//               >
//                 <img
//                   src={course.image}
//                   alt={course.courseName}
//                   className="w-full h-[200px] object-cover"
//                 />
//                 <div className="p-4 bg-blue-600 text-white">
//                   <p className="font-bold text-lg md:text-2xl mb-2">
//                     {course.courseName}
//                   </p>
//                   <p className="text-sm md:text-base">{course.intro}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </NavLink>
//     </div>
//   );
// };

// export default MyCourses;
