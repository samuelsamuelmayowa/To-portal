import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaCircleCheck,
  FaClock,
  FaGraduationCap,
  FaLaptopCode,
  FaLock,
  FaPlay,
  FaShieldHalved,
  FaStar,
  FaUserShield,
} from "react-icons/fa6";

import stock from "../assets/images/stock.png";
import splunk from "../assets/images/splunk.png";

const pageMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const floatingMotion = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function MyCourses() {
  const [authorized, setAuthorized] = useState(false);

  /* ===============================
     USER NORMALIZATION
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
     ACCESS CONTROL
  =============================== */
  const allowedEmails = useMemo(
    () =>
      new Set(
        [
          "kewizle.k@gmail.com",
          "kewizlek@gmail.com",
          "davidayeni63@gmail.com",
          "pamelaabina24@gmail.com",
          "Pamelaabina24@gmail.com",
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
        ].map((email) => email.toLowerCase()),
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

  const courses = [
    {
      to: "/dashboard/materials",
      image: splunk,
      title: "Splunk Training",
      category: "Cybersecurity / SIEM",
      accent: "blue",
      description:
        "Master Splunk SPL, dashboards, alerts, reports, investigations and real-world SIEM workflows.",
      badge: "Active",
      progress: 78,
      lessons: "24 Lessons",
      duration: "14 Weeks",
      level: "Beginner to Pro",
      visible: true,
    },
    {
      to: "/dashboard/stockportal",
      image: stock,
      title: "Stock & Options",
      category: "Trading / Finance",
      accent: "green",
      description:
        "Learn advanced trading strategies, options analysis, market structure and risk control.",
      badge: "Private",
      progress: 42,
      lessons: "18 Lessons",
      duration: "Private Access",
      level: "Advanced",
      visible: stockAccess.has(userEmail),
    },
  ].filter((course) => course.visible);

  /* ===============================
     ACCESS DENIED VIEW
  =============================== */
  if (!authorized) {
    return (
      <motion.main
        variants={pageMotion}
        initial="hidden"
        animate="visible"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-16 text-white"
      >
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-BLUE/40 blur-[130px]" />
        <div className="absolute bottom-[-200px] right-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/20 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

        <motion.div
          variants={fadeUp}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/15 text-3xl text-red-400">
            <FaLock />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-red-300">
            Access Restricted
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Paid Courses Locked
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base font-medium leading-8 text-white/65">
            This account does not currently have access to paid course
            materials. Please use an approved student account or contact
            support.
          </p>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Current Account
            </p>
            <p className="mt-2 break-all text-sm font-bold text-white/80">
              {userEmail || "Unknown user"}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <NavLink
              to="/courses"
              className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
            >
              View Courses
            </NavLink>

            <NavLink
              to="/dashboard"
              className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
            >
              Back to Dashboard
            </NavLink>
          </div>
        </motion.div>
      </motion.main>
    );
  }

  /* ===============================
     AUTHORIZED VIEW
  =============================== */
  return (
    <motion.main
      variants={pageMotion}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-[#050816] px-6 py-10 text-white md:px-10 lg:px-16"
    >
      <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/40 blur-[140px]" />
      <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-[150px]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* HEADER */}
        <motion.section
          variants={fadeUp}
          className="overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10"
        >
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
                  <FaUserShield />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
                  Student Learning Dashboard
                </span>
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight md:text-6xl">
                My Paid Courses
              </h1>

              <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/65">
                Welcome back. Continue your premium learning programs, access
                lessons, track your progress and keep building career-ready
                skills.
              </p>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Signed in as
                </p>
                <p className="mt-2 break-all text-sm font-bold text-white/80">
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DashboardStat
                icon={<FaGraduationCap />}
                value={courses.length}
                label="Active Courses"
              />

              <DashboardStat
                icon={<FaBookOpen />}
                value="42+"
                label="Lessons"
              />

              <DashboardStat
                icon={<FaClock />}
                value="14"
                label="Week Roadmap"
              />

              <DashboardStat
                icon={<FaChartLine />}
                value="Pro"
                label="Skill Level"
              />
            </div>
          </div>
        </motion.section>

        {/* QUICK INFO BAR */}
        <motion.section
          variants={fadeUp}
          className="mt-8 grid gap-5 md:grid-cols-3"
        >
          <InfoCard
            icon={<FaCircleCheck />}
            title="Premium Access"
            text="Your account is approved for paid course materials."
          />

          <InfoCard
            icon={<FaLaptopCode />}
            title="Learn Anywhere"
            text="Continue your lessons from desktop, tablet or mobile."
          />

          <InfoCard
            icon={<FaStar />}
            title="Career Focused"
            text="Courses are structured around practical skills and real use cases."
          />
        </motion.section>

        {/* COURSE GRID */}
        <motion.section variants={fadeUp} className="mt-12">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
                Continue Learning
              </p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Your Course Library
              </h2>
            </div>

            <NavLink
              to="/courses"
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
            >
              Browse More Courses
              <FaArrowRight />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.title} {...course} />
            ))}
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}

/* ===============================
   DASHBOARD STAT
=============================== */
function DashboardStat({ icon, value, label }) {
  return (
    <motion.div
      variants={floatingMotion}
      animate="animate"
      className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
        {icon}
      </div>

      <h3 className="text-3xl font-black">{value}</h3>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">
        {label}
      </p>
    </motion.div>
  );
}

/* ===============================
   INFO CARD
=============================== */
function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
        {icon}
      </div>

      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-7 text-white/55">{text}</p>
    </div>
  );
}

/* ===============================
   COURSE CARD COMPONENT
=============================== */
function CourseCard({
  to,
  image,
  title,
  category,
  description,
  accent,
  badge,
  progress,
  lessons,
  duration,
  level,
}) {
  const theme = {
    blue: {
      badge: "bg-blue-500/15 text-blue-200 border-blue-400/20",
      button: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30",
      progress: "bg-blue-500",
      glow: "from-blue-500/40",
    },
    green: {
      badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
      button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30",
      progress: "bg-emerald-500",
      glow: "from-emerald-500/40",
    },
  };

  const currentTheme = theme[accent] || theme.blue;

  return (
    <NavLink
      to={to}
      className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:bg-white/[0.14]"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentTheme.glow} via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100`}
      />

      <div className="relative overflow-hidden rounded-[2rem]">
        <div className="relative h-72 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-xl ${currentTheme.badge}`}
            >
              {badge}
            </span>

            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl">
              {category}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              {title}
            </h2>

            <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-white/70">
              {description}
            </p>
          </div>
        </div>

        <div className="bg-[#080b18] p-6">
          <div className="grid grid-cols-3 gap-3">
            <CourseMeta label="Lessons" value={lessons} />
            <CourseMeta label="Duration" value={duration} />
            <CourseMeta label="Level" value={level} />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white/55">
                Learning Progress
              </p>
              <p className="text-sm font-black text-white">{progress}%</p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${currentTheme.progress}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div
            className={`mt-7 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-black text-white shadow-xl transition duration-300 group-hover:-translate-y-1 ${currentTheme.button}`}
          >
            <FaPlay />
            Continue Learning
            <FaArrowRight className="transition duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </NavLink>
  );
}

/* ===============================
   COURSE META
=============================== */
function CourseMeta({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}
// import { useEffect, useMemo, useState } from "react";
// import { NavLink } from "react-router-dom";
// import stock from "../assets/images/stock.png";
// import splunk from "../assets/images/splunk.png";

// export default function MyCourses() {
//   const [authorized, setAuthorized] = useState(false);

//   /* ===============================
//      USER NORMALIZATION (ROBUST)
//   =============================== */
//   const userEmail = useMemo(() => {
//     try {
//       const raw = localStorage.getItem("user");
//       if (!raw) return "";
//       const parsed = JSON.parse(raw);
//       return (parsed?.email || raw).toLowerCase().trim();
//     } catch {
//       return (localStorage.getItem("user") || "").toLowerCase().trim();
//     }
//   }, []);

//   /* ===============================
//      ACCESS CONTROL (CLEAN)
//   =============================== */
//   const allowedEmails = useMemo(
//     () =>
//       new Set(
//         [
//           "kewizle.k@gmail.com",
//           "kewizlek@gmail.com",
//           "davidayeni63@gmail.com",
//           "adesh25416@gmail.com",
//           "basseyvera018@gmail.com",
//           "codeverseprogramming23@gmail.com",
//           "fadeleolutola@gmail.com",
//           "ooolajuyigbe@gmail.com",
//           "jahdek76@gmail.com",
//           "samuelsamuelmayowa@gmail.com",
//           "oluwaferanmiolulana@gmail.com",
//           "tomideolulana@gmail.com",
//           "toanalyticsllc@gmail.com",
//           "lybertyudochuu@gmail.com",
//           "kevwe_oberiko@yahoo.com",
//           "denisgsam@gmail.com",
//           "oluwaferanmi.olulana@gmail.com",
//           "fpasamuelmayowa51@gmail.com",
//           "randommayowa@gmail.com",
//           "oluwatiroyeamoye@gmail.com",
//           "adenusitimi@gmail.com",
//           "trbanjo@gmail.com",
//           "emanfrimpong@gmail.com",
//           "dipeoluolatunji@gmail.com",
//           "yinkalola51@gmail.com",
//         ].map((e) => e.toLowerCase()),
//       ),
//     [],
//   );

//   const stockAccess = useMemo(
//     () => new Set(["tomideolulana@gmail.com", "toanalyticsllc@gmail.com"]),
//     [],
//   );

//   useEffect(() => {
//     setAuthorized(allowedEmails.has(userEmail));
//   }, [userEmail, allowedEmails]);

//   /* ===============================
//      🚫 ACCESS DENIED VIEW
//   =============================== */
//   if (!authorized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-6">
//         <div className="max-w-md text-center bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-800">
//           <h1 className="text-2xl font-bold text-red-500">Access Restricted</h1>
//           <p className="mt-4 text-slate-400">
//             This account does not have access to paid courses.
//           </p>
//           <p className="mt-2 text-sm text-slate-500 break-all">
//             {userEmail || "Unknown user"}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* ===============================
//      🎓 AUTHORIZED VIEW
//   =============================== */
//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
//       {/* HEADER */}
//       <div className="max-w-4xl mx-auto text-center mb-10">
//         <h1 className="text-3xl font-bold">🎓 My Paid Courses</h1>
//         <p className="mt-3 text-slate-400 leading-relaxed">
//           Welcome back. Access your premium learning programs, watch lessons,
//           and continue where you left off.
//         </p>
//       </div>

//       {/* COURSE GRID */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
//         {/* SPLUNK COURSE */}
//         <CourseCard
//           to="/dashboard/materials"
//           image={splunk}
//           title="Splunk Training"
//           accent="blue"
//           description="Master Splunk SPL, dashboards, alerts, and real-world SIEM use cases."
//           badge="Active"
//         />

//         {/* STOCK COURSE (RESTRICTED) */}
//         {stockAccess.has(userEmail) && (
//           <CourseCard
//             to="/dashboard/stockportal"
//             image={stock}
//             title="Stock & Options"
//             accent="green"
//             description="Advanced trading strategies, options analysis, and market risk control."
//             badge="Private"
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// /* ===============================
//    🧩 COURSE CARD COMPONENT
// =============================== */
// function CourseCard({ to, image, title, description, accent, badge }) {
//   const accentMap = {
//     blue: "from-blue-600 to-indigo-600",
//     green: "from-green-600 to-emerald-600",
//   };

//   return (
//     <NavLink
//       to={to}
//       className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl hover:shadow-2xl transition"
//     >
//       {/* IMAGE */}
//       <div className="relative h-52">
//         <img
//           src={image}
//           alt={title}
//           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
//       </div>

//       {/* CONTENT */}
//       <div className="p-6 space-y-3">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-bold">{title}</h2>
//           <span
//             className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${accentMap[accent]}`}
//           >
//             {badge}
//           </span>
//         </div>

//         <p className="text-sm text-slate-400 leading-relaxed">
//           {description}
//         </p>

//         <button
//           className={`mt-4 w-full py-2 rounded-xl text-sm font-medium text-white
//             bg-gradient-to-r ${accentMap[accent]}
//             hover:opacity-90 transition`}
//         >
//           Continue Learning →
//         </button>
//       </div>
//     </NavLink>
//   );
// }

// // import { useEffect, useState } from "react";
// // import { NavLink } from "react-router-dom";
// // import stock from "../assets/images/stock.png";
// // import splunk from "../assets/images/splunk.png";

// // const MyCourses = () => {
// //   const [authorized, setAuthorized] = useState(false);

// //   // ✅ Handle user storage
// //   const rawUser = localStorage.getItem("user");
// //   let user = null;
// //   try {
// //     user = JSON.parse(rawUser);
// //   } catch {
// //     user = { email: rawUser };
// //   }

// //   const userEmail = user?.email || "";

// //   // ✅ Main allowed emails (for the entire page)
// //   const allowedEmails = [
// //     "kewizle.k@gmail.com",
// //      "kewizlek@gmail.com",
// //     "Kewizle.k@gmail.com",
// //     "dafdfda",
// //     "Davidayeni63@gmail.com",
// //     "Adesh25416@gmail.com",
// //     "davidayeni63@gmail.com",
// //     "adesh25416@gmail.com",
// //     "basseyvera018@gmail.com",
// //     "codeverseprogramming23@gmail.com",
// //     "fadeleolutola@gmail.com",
// //     "ooolajuyigbe@gmail.com",
// //     "jahdek76@gmail.com",
// //     "samuelsamuelmayowa@gmail.com",
// //     "oluwaferanmiolulana@gmail.com",
// //     "tomideolulana@gmail.com",
// //     "toanalyticsllc@gmail.com",
// //     "lybertyudochuu@gmail.com",
// //     "kevwe_oberiko@yahoo.com",
// //     "denisgsam@gmail.com",
// //     "oluwaferanmi.olulana@gmail.com",
// //     "fpasamuelmayowa51@gmail.com",
// //     "randommayowa@gmail.com",
// //     "oluwatiroyeamoye@gmail.com",
// //     "adenusitimi@gmail.com",
// //     "Trbanjo@gmail.com",
// //     "emanfrimpong@gmail.com",
// //     "dipeoluolatunji@gmail.com",
// //     "yinkalola51@gmail.com",
// //   ];

// //   useEffect(() => {
// //     setAuthorized(allowedEmails.includes(userEmail));
// //   }, [userEmail]);

// //   // 🚫 Not authorized
// //   if (!authorized) {
// //     return (
// //       <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
// //         <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
// //         <p className="mt-4 text-gray-700">
// //           This account (
// //           <span className="font-semibold">{userEmail || "Unknown"}</span>) does
// //           not have access to this course.
// //         </p>
// //       </div>
// //     );
// //   }

// //   // ✅ Special access list for "Stock & Options"
// //   const stockAccess = ["tomideolulana@gmail.com", "toanalyticsllc@gmail.com"];

// //   // 🎓 Authorized View
// //   return (
// //     <div className="p-6 space-y-6">
// //       <div className="space-y-3 max-w-2xl mx-auto text-center">
// //         <h1 className="text-3xl font-bold text-gray-800">🎓 Paid Courses</h1>
// //         <p className="text-gray-600 leading-relaxed">
// //           Welcome to your paid courses area! Here you’ll find exclusive content
// //           available only to enrolled students. Access videos, PowerPoint slides,
// //           and learning resources related to your purchased course(s).
// //         </p>
// //       </div>

// //       {/* ✅ Course Cards */}
// //       <div className="flex flex-wrap gap-6 justify-center">
// //         {/* Splunk Course — visible to all authorized users */}
// //         <NavLink
// //           to="/dashboard/materials"
// //           className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
// //         >
// //           <img
// //             src={splunk}
// //             alt="Splunk"
// //             className="w-full h-[200px] object-cover"
// //           />
// //           <div className="p-4 bg-blue-600 text-white">
// //             <p className="font-bold text-lg md:text-2xl mb-2">Splunk</p>
// //             <p className="text-sm md:text-base">
// //               Learn how to search, analyze, and visualize machine data using
// //               Splunk SPL and dashboards.
// //             </p>
// //           </div>
// //         </NavLink>

// //         {/* Stock & Options Course — visible ONLY to Tomide & TO Analytics */}
// //         {stockAccess.includes(userEmail) && (
// //           <NavLink
// //             to="/dashboard/stockportal"
// //             className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
// //           >
// //             <img
// //               src={stock}
// //               alt="Stock & Options"
// //               className="w-full h-[200px] object-cover"
// //             />
// //             <div className="p-4 bg-green-600 text-white">
// //               <p className="font-bold text-lg md:text-2xl mb-2">
// //                 Stock & Options
// //               </p>
// //               <p className="text-sm md:text-base">
// //                 Master trading strategies, risk management, and options analysis
// //                 in financial markets.
// //               </p>
// //             </div>
// //           </NavLink>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default MyCourses;

// // import { useEffect, useState } from "react";
// // import { NavLink } from "react-router-dom";
// // import COURSES from "../coursesAPI/api";
// // import stock from "../assets/images/stock.png";
// // import splunk from "../assets/images/splunk.png";

// // const MyCourses = () => {
// //   const [authorized, setAuthorized] = useState(false);

// //   // ✅ Handle user storage
// //   const rawUser = localStorage.getItem("user");
// //   let user = null;
// //   try {
// //     user = JSON.parse(rawUser);
// //   } catch {
// //     user = { email: rawUser };
// //   }

// //   const userEmail = user?.email || "";

// //   const allowedEmails = [
// //     "samuelsamuelmayowa@gmail.com",
// //     "oluwaferanmiolulana@gmail.com",
// //     "tomideolulana@gmail.com",
// //     "toanalyticsllc@gmail.com",
// //     "lybertyudochuu@gmail.com",
// //     "kevwe_oberiko@yahoo.com",
// //     "denisgsam@gmail.com",
// //     "oluwaferanmi.olulana@gmail.com",
// //     "fpasamuelmayowa51@gmail.com",
// //     "randommayowa@gmail.com",
// //     "oluwatiroyeamoye@gmail.com",
// //     "adenusitimi@gmail.com",
// //     "Trbanjo@gmail.com",
// //     "emanfrimpong@gmail.com",
// //     "dipeoluolatunji@gmail.com",
// //     "yinkalola51@gmail.com",
// //   ];

// //   useEffect(() => {
// //     if (allowedEmails.includes(userEmail)) {
// //       setAuthorized(true);
// //     } else {
// //       setAuthorized(false);
// //     }
// //   }, [userEmail]);

// //   // 🚫 Not authorized
// //   if (!authorized) {
// //     return (
// //       <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
// //         <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
// //         <p className="mt-4 text-gray-700">
// //           This account (
// //           <span className="font-semibold">{userEmail || "Unknown"}</span>) does
// //           not have access to this course.
// //         </p>
// //       </div>
// //     );
// //   }

// //   // 🎓 Authorized View
// //   return (
// //     <div className="p-6 space-y-6">
// //       <div className="space-y-3 max-w-2xl mx-auto text-center">
// //         <h1 className="text-3xl font-bold text-gray-800">🎓 Paid Courses</h1>
// //         <p className="text-gray-600 leading-relaxed">
// //           Welcome to your paid courses area! Here you’ll find exclusive content
// //           available only to enrolled students. Access videos, PowerPoint slides,
// //           and learning resources related to your purchased course(s).
// //         </p>
// //       </div>

// //       {/* ✅ Two hard-coded NavLinks */}
// //       <div className="flex flex-wrap gap-6 justify-center">

// //         {/* Splunk Course */}
// //         <NavLink
// //           to="/dashboard/materials"
// //           className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
// //         >
// //           <img
// //             src={splunk}
// //             alt="Splunk"
// //             className="w-full h-[200px] object-cover"
// //           />
// //           <div className="p-4 bg-blue-600 text-white">
// //             <p className="font-bold text-lg md:text-2xl mb-2">Splunk</p>
// //             <p className="text-sm md:text-base">
// //               Learn how to search, analyze, and visualize machine data using
// //               Splunk SPL and dashboards.
// //             </p>
// //           </div>
// //         </NavLink>

// //         {/* Stock & Options Course */}
// //         <NavLink
// //           to="/dashboard/materials"
// //           className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
// //         >
// //           <img
// //             src={stock}
// //             alt="Stock & Options"
// //             className="w-full h-[200px] object-cover"
// //           />
// //           <div className="p-4 bg-green-600 text-white">
// //             <p className="font-bold text-lg md:text-2xl mb-2">
// //               Stock & Options
// //             </p>
// //             <p className="text-sm md:text-base">
// //               Master trading strategies, risk management, and options analysis
// //               in financial markets.
// //             </p>
// //           </div>
// //         </NavLink>
// //       </div>
// //     </div>
// //   );
// // };

// // export default MyCourses;

// // import { useEffect, useState } from "react";
// // import { Link, NavLink, useLocation } from "react-router-dom";
// // import COURSES from "../coursesAPI/api";

// // const MyCourses = () => {
// //   const [authorized, setAuthorized] = useState(false);
// //   const [courseData, setCourseData] = useState([]);

// //   // ✅ Handle user storage (in case it's JSON or a plain string)
// //   const rawUser = localStorage.getItem("user");
// //   let user = null;
// //   try {
// //     user = JSON.parse(rawUser);
// //   } catch {
// //     user = { email: rawUser };
// //   }
// //   // fpasamuelmayowa51@gmail.com
// //   const userEmail = user?.email || "";
// //   const allowedEmails = [
// //     "oluwaferanmiolulana@gmail.com",
// //     "tomideolulana@gmail.com",
// //     // "oluwaferanmi.olulana@gmail.com",
// //     "toanalyticsllc@gmail.com",
// //     "lybertyudochuu@gmail.com",
// //     "kevwe_oberiko@yahoo.com",
// //     "denisgsam@gmail.com",
// //     "oluwaferanmi.olulana@gmail.com",
// //     "fpasamuelmayowa51@gmail.com",
// //     "oluwaferanmiolulana@gmail.com",
// //     "randommayowa@gmail.com",
// //     "oluwatiroyeamoye@gmail.com",
// //     "adenusitimi@gmail.com",
// //     "Trbanjo@gmail.com",
// //     "emanfrimpong@gmail.com",
// //     "dipeoluolatunji@gmail.com",
// //     "lybertyudochuu@gmail.com",
// //     "yinkalola51@gmail.com",
// //   ];

// //   useEffect(() => {
// //     if (allowedEmails.includes(userEmail)) {
// //       setAuthorized(true);
// //       // ✅ Default course (Linux or any course you want)
// //       const defaultCourse = COURSES.filter(
// //         (course) => course.courseName === "Splunk"
// //       );
// //       setCourseData(defaultCourse);
// //     } else {
// //       setAuthorized(false);
// //       setCourseData([]);
// //     }
// //   }, [userEmail]);

// //   // 🚫 Not authorized
// //   if (!authorized) {
// //     return (
// //       <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
// //         <h1 className="text-2xl font-bold text-red-600">Access Denied 🚫</h1>
// //         <p className="mt-4 text-gray-700">
// //           This account (
// //           <span className="font-semibold">{userEmail || "Unknown"}</span>) does
// //           not have access to this course.
// //         </p>
// //       </div>
// //     );
// //   }

// //   // 🎓 Show default course
// //   return (
// //     <div className="p-6 space-y-6">
// //       {/* 🧾 Description Section */}
// //       {/* <div className=" space-y-3">
// //         <h1 className="text-3xl font-bold text-gray-800  ">🎓 Paid Courses</h1>
// //         <p className="text-gray-600 ">
// //           Welcome to your paid courses area! Here you’ll find exclusive content
// //           available only to enrolled students. Access videos, PowerPoint slides,
// //           and learning resources related to your purchased course(s).
// //         </p>
// //       </div> */}

// //       <NavLink to="/dashboard/materials">
// //         {/* 💻 Course Display */}
// //         <div className="space-y-8">
// //           {/* Top Section */}
// //           <div className="space-y-3 max-w-2xl">
// //             <h1 className="text-3xl font-bold text-gray-800">
// //               🎓 Paid Courses
// //             </h1>
// //             <p className="text-gray-600 leading-relaxed">
// //               Welcome to your paid courses area! Here you’ll find exclusive
// //               content available only to enrolled students. Access videos,
// //               PowerPoint slides, and learning resources related to your
// //               purchased course(s).
// //             </p>
// //           </div>

// //           {/* Course Cards Section */}
// //           <div className="flex flex-wrap gap-6">
// //             {courseData.map((course, index) => (
// //               <div
// //                 key={index}
// //                 className="rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform bg-white w-[300px]"
// //                 data-aos="fade-up"
// //               >
// //                 <img
// //                   src={course.image}
// //                   alt={course.courseName}
// //                   className="w-full h-[200px] object-cover"
// //                 />
// //                 <div className="p-4 bg-blue-600 text-white">
// //                   <p className="font-bold text-lg md:text-2xl mb-2">
// //                     {course.courseName}
// //                   </p>
// //                   <p className="text-sm md:text-base">{course.intro}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </NavLink>
// //     </div>
// //   );
// // };

// // export default MyCourses;
