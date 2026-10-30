import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaCircleCheck,
  FaClock,
  FaGraduationCap,
  FaLock,
  FaPlay,
  FaShieldHalved,
  FaUserShield,
} from "react-icons/fa6";

import stock from "../assets/images/stock.png";
import splunk from "../assets/images/splunk.png";

/**
 * TAKE ON — a refreshed My Courses interface for T.O. Analytics.
 *
 * IMPORTANT:
 * These email lists preserve the existing frontend visibility behavior only.
 * They are NOT a secure authorization mechanism. Protect the course routes,
 * data, and download URLs on the backend, using the signed-in user's session.
 */
const PREVIOUS_STUDENT_EMAILS = new Set([
  "sammmyayo@gmail.com",
  "sammmyayo@gmail.com",
  "kewizle.k@gmail.com",
  "kewizlek@gmail.com",
  "davidayeni63@gmail.com",
  "pamelaabina24@gmail.com",
  "pamelaabina24@gmail.com",
  "adesh25416@gmail.com",
  "basseyvera018@gmail.com",
  "codeverseprogramming23@gmail.com",
  "fadeleolutola@gmail.com",
  "ooolajuyigbe@gmail.com",
  "jahdek76@gmail.com",
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
]);

// Add new intake addresses here until the enrollment backend is connected.
const OCTOBER_2026_EMAILS = new Set([
  "samuelsamuelmayowa@gmail.com",
  "adminsswdwd@viva.com",
  "spheremessage@gmail.com",
]);

const STOCK_STUDENT_EMAILS = new Set([
  "tomideolulana@gmail.com",
  "annrit11@gmail.com",
  "samuelsamuelmayowa@gmail.com",
  "toanalyticsllc@gmail.com",
  "annrit11@gmail.com",
]);

const shellMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function getAccountEmail() {
  // Preserve the current storage format; don't use it to trust identity on a server.
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem("user") || "";
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw);
      const candidate =
        typeof parsed === "string" ? parsed : parsed?.email || "";
      return String(candidate).trim().toLowerCase();
    } catch {
      return raw.trim().toLowerCase();
    }
  } catch {
    return "";
  }
}

function getAvailableCourses(email) {
  const previousStudent = PREVIOUS_STUDENT_EMAILS.has(email);
  const octoberStudent = OCTOBER_2026_EMAILS.has(email);
  const stockStudent = STOCK_STUDENT_EMAILS.has(email);

  // New intake appears first when someone has access to both versions.
  return [
    {
      id: "splunk-2026",
      to: "/dashboard/materials?intake=2026",
      image: splunk,
      title: "Splunk Training",
      subtitle: "October 2026 Cohort",
      category: "Cybersecurity & SIEM",
      type: "splunk",
      status: "New intake",
      description:
        "Start with orientation and follow the new learning roadmap. Classes and resources will appear as they are released.",
      lessons: "14 planned sessions",
      duration: "14-week roadmap",
      level: "Beginner to Pro",
      action: "Open 2026 classroom",
      toOrientation: "/splunk-orientation",
      visible: octoberStudent,
    },
    {
      id: "splunk-previous",
      to: "/dashboard/materials",
      image: splunk,
      title: "Splunk Training",
      subtitle: "Previous Cohort",
      category: "Cybersecurity & SIEM",
      type: "splunk",
      status: "Course library",
      description:
        "Explore SPL, dashboards, alerts, reporting, investigation techniques, and practical SIEM workflows.",
      lessons: "24 lessons listed",
      duration: "14-week program",
      level: "Beginner to Pro",
      action: "Continue learning",
      visible: previousStudent,
    },
    {
      id: "stock-options",
      to: "/dashboard/stockportal",
      image: stock,
      title: "Stocks & Options",
      subtitle: "Private Learning Program",
      category: "Trading & Finance",
      type: "trading",
      status: "Private access",
      description:
        "Build practical knowledge in options analysis, trading strategies, market structure, and risk management.",
      lessons: "18 lessons listed",
      duration: "Self-paced access",
      level: "Advanced",
      action: "Open trading classroom",
      visible: stockStudent,
    },
  ].filter((course) => course.visible);
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30";

export default function MyCourses() {
  const prefersReducedMotion = useReducedMotion();
  const userEmail = useMemo(getAccountEmail, []);
  const courses = useMemo(() => getAvailableCourses(userEmail), [userEmail]);
  const hasCourses = courses.length > 0;
  const trackCount = new Set(courses.map((course) => course.type)).size;
  const isNewIntake = courses.some((course) => course.id === "splunk-2026");
  const primaryCourse = courses[0];

  return (
    <motion.main
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={shellMotion}
      className="min-h-screen bg-[#f4f7fc] px-4 pb-16 pt-7 text-slate-900 sm:px-6 lg:px-10 lg:pt-10"
    >
      <div className="mx-auto max-w-[1320px]">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span>T.O. Analytics</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="text-blue-700">Student portal</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              My Courses
            </h1>
          </div>
          <NavLink
            to="/dashboard"
            className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 ${focusRing}`}
          >
            Back to Dashboard
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </NavLink>
        </header>

        {!hasCourses ? (
          <AccessView email={userEmail} />
        ) : (
          <>
            <section className="relative isolate overflow-hidden rounded-[28px] bg-[#101d3a] text-white shadow-xl shadow-slate-900/10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-44 h-[440px] w-[440px] rounded-full border-[85px] border-blue-400/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-190px] right-[22%] h-[370px] w-[370px] rounded-full bg-blue-500/20 blur-3xl"
              />
              <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:p-12">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-100">
                    <FaGraduationCap aria-hidden="true" />
                    YOUR LEARNING SPACE
                  </div>
                  <h2 className="mt-6 max-w-[650px] text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl xl:text-[46px]">
                    Your next skill starts here.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
                    Your courses, learning materials, and training pathways —
                    organized in one place so you can focus on what comes next.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <NavLink
                      to={primaryCourse.to}
                      className={`inline-flex items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#12254e] shadow-md transition hover:bg-blue-50 ${focusRing}`}
                    >
                      <FaPlay aria-hidden="true" className="text-xs" />
                      Open my classroom
                      <FaArrowRight aria-hidden="true" className="text-xs" />
                    </NavLink>
                    <span className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-blue-100/85">
                      <FaUserShield aria-hidden="true" className="shrink-0" />
                      <span className="truncate" title={userEmail}>
                        {userEmail}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
                  <HeroMetric
                    icon={<FaBookOpen />}
                    value={courses.length}
                    title={courses.length === 1 ? "Course available" : "Courses available"}
                    subtitle="Your personal course library"
                  />
                  <HeroMetric
                    icon={<FaChartLine />}
                    value={trackCount}
                    title={trackCount === 1 ? "Learning track" : "Learning tracks"}
                    subtitle="Programs in your account"
                  />
                </div>
              </div>
            </section>

            <section aria-labelledby="course-library-title" className="mt-10">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">
                    COURSES & PROGRAMS
                  </p>
                  <h2 id="course-library-title" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Your learning library
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Select a program to access the resources available to you.
                  </p>
                </div>
                <NavLink
                  to="/courses"
                  className={`inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 ${focusRing}`}
                >
                  Explore all courses
                  <FaArrowRight aria-hidden="true" />
                </NavLink>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-7">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>

            <section className="mt-9 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="flex flex-col gap-5 rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <FaCircleCheck aria-hidden="true" className="text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isNewIntake ? "Starting the October 2026 intake?" : "Keep your learning moving"}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {isNewIntake
                      ? "Review the orientation information and check the new classroom for published lessons."
                      : "Return to your classroom for lessons, resources, and course activities."}
                  </p>
                </div>
                <NavLink
                  to={isNewIntake ? "/splunk-orientation" : primaryCourse.to}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 ${focusRing}`}
                >
                  {isNewIntake ? "View orientation" : "Go to classroom"}
                  <FaArrowRight aria-hidden="true" className="text-xs" />
                </NavLink>
              </div>
              <div className="flex items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <FaShieldHalved aria-hidden="true" className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Your learning access</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Only programs listed for this account are shown here.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </motion.main>
  );
}

function HeroMetric({ icon, value, title, subtitle }) {
  return (
    <div className="min-w-0 rounded-[20px] border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-blue-100/80">{title}</span>
        <span aria-hidden="true" className="text-lg text-blue-200">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs leading-5 text-blue-100/60">{subtitle}</p>
    </div>
  );
}

function CourseCard({ course }) {
  const trading = course.type === "trading";
  const isNew = course.id === "splunk-2026";
  const badgeStyle = trading
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : isNew
      ? "bg-blue-50 text-blue-700 ring-blue-100"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/[0.07]">
      <div className="relative h-[205px] overflow-hidden bg-[#13254a] sm:h-[225px]">
        <img
          src={course.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-slate-950/10" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <span className="rounded-lg border border-white/20 bg-slate-950/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            {course.category}
          </span>
          <span className="rounded-full border border-white/20 bg-white/15 p-2.5 text-white backdrop-blur-sm">
            <FaGraduationCap aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-6 sm:px-7 sm:pb-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${badgeStyle}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${trading ? "bg-emerald-500" : "bg-blue-500"}`} />
            {course.status}
          </span>
          <span className="text-xs font-medium text-slate-500">{course.subtitle}</span>
        </div>

        <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {course.title}
        </h3>
        <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
          {course.description}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3 sm:gap-2">
          <MetaItem icon={<FaBookOpen />} label="Curriculum" value={course.lessons} />
          <MetaItem icon={<FaClock />} label="Duration" value={course.duration} />
          <MetaItem icon={<FaChartLine />} label="Level" value={course.level} />
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          {isNew
            ? "Your new classroom is separate from earlier cohorts. Resources will be added as classes begin."
            : "Your lesson history and completion status are available inside the classroom where supported."}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <NavLink
            to={course.to}
            className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white transition ${trading ? "bg-emerald-700 hover:bg-emerald-800" : "bg-blue-700 hover:bg-blue-800"} ${focusRing}`}
          >
            <FaPlay aria-hidden="true" className="text-xs" />
            {course.action}
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </NavLink>
          {course.toOrientation && (
            <NavLink
              to={course.toOrientation}
              className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 ${focusRing}`}
            >
              Orientation
            </NavLink>
          )}
        </div>
      </div>
    </article>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-slate-400">
        <span aria-hidden="true" className="text-xs">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 text-xs font-bold leading-5 text-slate-800">{value}</p>
    </div>
  );
}

function AccessView({ email }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-50 blur-2xl" />
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <FaLock aria-hidden="true" className="text-2xl" />
      </div>
      <p className="relative mt-7 text-xs font-extrabold uppercase tracking-[0.19em] text-blue-700">
        Learning access
      </p>
      <h2 className="relative mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        No courses available yet
      </h2>
      <p className="relative mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
        We couldn’t find any paid programs assigned to this account. If you
        recently enrolled, please contact T.O. Analytics to confirm that your
        account has been added to the correct course.
      </p>
      {email && (
        <div className="relative mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Current account</p>
          <p className="mt-1 break-all text-sm font-semibold text-slate-700">{email}</p>
        </div>
      )}
      <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <NavLink
          to="/courses"
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800 ${focusRing}`}
        >
          Browse courses <FaArrowRight aria-hidden="true" />
        </NavLink>
        <NavLink
          to="/dashboard"
          className={`inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 ${focusRing}`}
        >
          Back to dashboard
        </NavLink>
      </div>
    </section>
  );
}


// import { useEffect, useMemo, useState } from "react";
// import { NavLink } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   FaArrowRight,
//   FaBookOpen,
//   FaChartLine,
//   FaCircleCheck,
//   FaClock,
//   FaGraduationCap,
//   FaLaptopCode,
//   FaLock,
//   FaPlay,
//   FaShieldHalved,
//   FaStar,
//   FaUserShield,
// } from "react-icons/fa6";

// import stock from "../assets/images/stock.png";
// import splunk from "../assets/images/splunk.png";

// const pageMotion = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       duration: 0.6,
//       staggerChildren: 0.12,
//     },
//   },
// };

// const fadeUp = {
//   hidden: {
//     opacity: 0,
//     y: 35,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.7,
//       ease: "easeOut",
//     },
//   },
// };

// const floatingMotion = {
//   animate: {
//     y: [0, -10, 0],
//     transition: {
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut",
//     },
//   },
// };

// export default function MyCourses() {
//   const [authorized, setAuthorized] = useState(false);

//   /* ===============================
//      USER NORMALIZATION
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
//      ACCESS CONTROL
//   =============================== */
//   const allowedEmails = useMemo(
//     () =>
//       new Set(
//         [
//           "sammmyayo@gmail.com",
//           "Sammmyayo@gmail.com",
//           "kewizle.k@gmail.com",
//           "kewizlek@gmail.com",
//           "davidayeni63@gmail.com",
//           "pamelaabina24@gmail.com",
//           "Pamelaabina24@gmail.com",
//           "adesh25416@gmail.com",
//           "basseyvera018@gmail.com",
//           "codeverseprogramming23@gmail.com",
//           "fadeleolutola@gmail.com",
//           "ooolajuyigbe@gmail.com",
//           "jahdek76@gmail.com",
//           // "samuelsamuelmayowa@gmail.com",
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
//           // "spheremessage@gmail.com"
//         ].map((email) => email.toLowerCase()),
//       ),
//     [],
//   );

//   // QUICK SETUP: Add October 2026 students here.
//   // Temporary frontend course display only, not a secure access-control system.
//   const october2026Emails = useMemo(
//     () => new Set([
//       "samuelsamuelmayowa@gmail.com", // test student; has access to both cards
//       // "anotherstudent@example.com",
//     "spheremessage@gmail.com"  
//     ]),
//     [],
//   );

//   const isPreviousStudent = allowedEmails.has(userEmail);
//   const isOctober2026Student = october2026Emails.has(userEmail);

//   const stockAccess = useMemo(
//     () => new Set(["tomideolulana@gmail.com","annrit11@gmail.com", "samuelsamuelmayowa@gmail.com","toanalyticsllc@gmail.com",  "Annrit11@gmail.com" ]),
//     [],
//   );

//   useEffect(() => {
//     setAuthorized(isPreviousStudent || isOctober2026Student);
//   }, [isPreviousStudent, isOctober2026Student]);

//   const courses = [
//     {
//       to: "/dashboard/materials",
//       image: splunk,
//       title: "Splunk Training",
//       category: "Cybersecurity / SIEM",
//       accent: "blue",
//       description:
//         "Master Splunk SPL, dashboards, alerts, reports, investigations and real-world SIEM workflows.",
//       badge: "Active",
//       progress: 78,
//       lessons: "24 Lessons",
//       duration: "14 Weeks",
//       level: "Beginner to Pro",
//       visible: isPreviousStudent,
//     },
//     {
//       // Same CoursePortal.jsx component, but with the new intake selected.
//       to: "/dashboard/materials?intake=2026",
//       image: splunk,
//       title: "Splunk Training — October 2026",
//       category: "Cybersecurity / SIEM",
//       accent: "blue",
//       description:
//         "New Splunk orientation and learning roadmap. Videos and documents will be published as classes begin.",
//       badge: "New Intake",
//       progress: 0,
//       lessons: "14 Planned Sessions",
//       duration: "14 Weeks",
//       level: "Beginner to Pro",
//       visible: isOctober2026Student,
//     },
//     {
//       to: "/dashboard/stockportal",
//       image: stock,
//       title: "Stock & Options",
//       category: "Trading / Finance",
//       accent: "green",
//       description:
//         "Learn advanced trading strategies, options analysis, market structure and risk control.",
//       badge: "Private",
//       progress: 42,
//       lessons: "18 Lessons",
//       duration: "Private Access",
//       level: "Advanced",
//       visible: stockAccess.has(userEmail),
//     },
//   ].filter((course) => course.visible);

//   /* ===============================
//      ACCESS DENIED VIEW
//   =============================== */
//   if (!authorized) {
//     return (
//       <motion.main
//         variants={pageMotion}
//         initial="hidden"
//         animate="visible"
//         className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-16 text-white"
//       >
//         <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-BLUE/40 blur-[130px]" />
//         <div className="absolute bottom-[-200px] right-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/20 blur-[150px]" />
//         <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

//         <motion.div
//           variants={fadeUp}
//           className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10"
//         >
//           <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/15 text-3xl text-red-400">
//             <FaLock />
//           </div>

//           <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-red-300">
//             Access Restricted
//           </p>

//           <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
//             Paid Courses Locked
//           </h1>

//           <p className="mx-auto mt-5 max-w-md text-base font-medium leading-8 text-white/65">
//             This account does not currently have access to paid course
//             materials. Please use an approved student account or contact
//             support.
//           </p>

//           <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
//             <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
//               Current Account
//             </p>
//             <p className="mt-2 break-all text-sm font-bold text-white/80">
//               {userEmail || "Unknown user"}
//             </p>
//           </div>

//           <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//             <NavLink
//               to="/courses"
//               className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
//             >
//               View Courses
//             </NavLink>

//             <NavLink
//               to="/dashboard"
//               className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
//             >
//               Back to Dashboard
//             </NavLink>
//           </div>
//         </motion.div>
//       </motion.main>
//     );
//   }

//   /* ===============================
//      AUTHORIZED VIEW
//   =============================== */
//   return (
//     <motion.main
//       variants={pageMotion}
//       initial="hidden"
//       animate="visible"
//       className="relative min-h-screen overflow-hidden bg-[#050816]  py-10 text-white md:px-10 lg:px-16"
//     >
//       <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/40 blur-[140px]" />
//       <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-[150px]" />
//       <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />
//       <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

//       <div className="relative z-10 mx-auto max-w-7xl">
//         {/* HEADER */}
//         <motion.section
//           variants={fadeUp}
//           className="overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10"
//         >
//           <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
//             <div>
//               <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
//                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
//                   <FaUserShield />
//                 </span>
//                 <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
//                   Student Learning Dashboard
//                 </span>
//               </div>

//               <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight md:text-6xl">
//                 My Paid Courses
//               </h1>

//               <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/65">
//                 Welcome back. Continue your premium learning programs, access
//                 lessons, track your progress and keep building career-ready
//                 skills.
//               </p>

//               <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
//                 <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
//                   Signed in as
//                 </p>
//                 <p className="mt-2 break-all text-sm font-bold text-white/80">
//                   {userEmail}
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <DashboardStat
//                 icon={<FaGraduationCap />}
//                 value={courses.length}
//                 label="Active Courses"
//               />

//               <DashboardStat
//                 icon={<FaBookOpen />}
//                 value="42+"
//                 label="Lessons"
//               />

//               <DashboardStat
//                 icon={<FaClock />}
//                 value="14"
//                 label="Week Roadmap"
//               />

//               <DashboardStat
//                 icon={<FaChartLine />}
//                 value="Pro"
//                 label="Skill Level"
//               />
//             </div>
//           </div>
//         </motion.section>

//         {/* QUICK INFO BAR */}
//         <motion.section
//           variants={fadeUp}
//           className="mt-8 grid gap-5 md:grid-cols-3"
//         >
//           <InfoCard
//             icon={<FaCircleCheck />}
//             title="Premium Access"
//             text="Your account is approved for paid course materials."
//           />

//           <InfoCard
//             icon={<FaLaptopCode />}
//             title="Learn Anywhere"
//             text="Continue your lessons from desktop, tablet or mobile."
//           />

//           <InfoCard
//             icon={<FaStar />}
//             title="Career Focused"
//             text="Courses are structured around practical skills and real use cases."
//           />
//         </motion.section>

//         {/* COURSE GRID */}
//         <motion.section variants={fadeUp} className="mt-12">
//           <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//             <div>
//               <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
//                 Continue Learning
//               </p>
//               <h2 className="mt-3 text-3xl font-black md:text-4xl">
//                 Your Course Library
//               </h2>
//             </div>

//             <NavLink
//               to="/courses"
//               className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
//             >
//               Browse More Courses
//               <FaArrowRight />
//             </NavLink>
//           </div>

//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
//             {courses.map((course) => (
//               <CourseCard key={course.title} {...course} />
//             ))}
//           </div>
//         </motion.section>
//       </div>
//     </motion.main>
//   );
// }

// /* ===============================
//    DASHBOARD STAT
// =============================== */
// function DashboardStat({ icon, value, label }) {
//   return (
//     <motion.div
//       variants={floatingMotion}
//       animate="animate"
//       className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
//     >
//       <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
//         {icon}
//       </div>

//       <h3 className="text-3xl font-black">{value}</h3>
//       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">
//         {label}
//       </p>
//     </motion.div>
//   );
// }

// /* ===============================
//    INFO CARD
// =============================== */
// function InfoCard({ icon, title, text }) {
//   return (
//     <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14]">
//       <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
//         {icon}
//       </div>

//       <h3 className="text-xl font-black">{title}</h3>
//       <p className="mt-3 text-sm font-medium leading-7 text-white/55">{text}</p>
//     </div>
//   );
// }

// /* ===============================
//    COURSE CARD COMPONENT
// =============================== */
// function CourseCard({
//   to,
//   image,
//   title,
//   category,
//   description,
//   accent,
//   badge,
//   progress,
//   lessons,
//   duration,
//   level,
// }) {
//   const theme = {
//     blue: {
//       badge: "bg-blue-500/15 text-blue-200 border-blue-400/20",
//       button: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30",
//       progress: "bg-blue-500",
//       glow: "from-blue-500/40",
//     },
//     green: {
//       badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
//       button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30",
//       progress: "bg-emerald-500",
//       glow: "from-emerald-500/40",
//     },
//   };

//   const currentTheme = theme[accent] || theme.blue;

//   return (
//     <NavLink
//       to={to}
//       className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:bg-white/[0.14]"
//     >
//       <div
//         className={`absolute inset-0 bg-gradient-to-br ${currentTheme.glow} via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100`}
//       />

//       <div className="relative overflow-hidden rounded-[2rem]">
//         <div className="relative h-72 overflow-hidden">
//           <img
//             src={image}
//             alt={title}
//             className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
//           />

//           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

//           <div className="absolute left-5 top-5 flex flex-wrap items-center gap-3">
//             <span
//               className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-xl ${currentTheme.badge}`}
//             >
//               {badge}
//             </span>

//             <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl">
//               {category}
//             </span>
//           </div>

//           <div className="absolute bottom-5 left-5 right-5">
//             <h2 className="text-3xl font-black text-white md:text-4xl">
//               {title}
//             </h2>

//             <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-white/70">
//               {description}
//             </p>
//           </div>
//         </div>

//         <div className="bg-[#080b18] p-6">
//           <div className="grid grid-cols-3 gap-3">
//             <CourseMeta label="Lessons" value={lessons} />
//             <CourseMeta label="Duration" value={duration} />
//             <CourseMeta label="Level" value={level} />
//           </div>

//           <div className="mt-6">
//             <div className="mb-3 flex items-center justify-between">
//               <p className="text-sm font-bold text-white/55">
//                 Learning Progress
//               </p>
//               <p className="text-sm font-black text-white">{progress}%</p>
//             </div>

//             <div className="h-3 overflow-hidden rounded-full bg-white/10">
//               <div
//                 className={`h-full rounded-full ${currentTheme.progress}`}
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>

//           <div
//             className={`mt-7 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-black text-white shadow-xl transition duration-300 group-hover:-translate-y-1 ${currentTheme.button}`}
//           >
//             <FaPlay />
//             Continue Learning
//             <FaArrowRight className="transition duration-300 group-hover:translate-x-1" />
//           </div>
//         </div>
//       </div>
//     </NavLink>
//   );
// }

// /* ===============================
//    COURSE META
// =============================== */
// function CourseMeta({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//       <p className="text-xs font-black uppercase tracking-widest text-white/35">
//         {label}
//       </p>
//       <p className="mt-2 text-sm font-black text-white">{value}</p>
//     </div>
//   );
// }

// // /.............................. END UP LEVEL ...........................
// // import { useEffect, useMemo, useState } from "react";
// // import { NavLink } from "react-router-dom";
// // import { motion } from "framer-motion";
// // import {
// //   FaArrowRight,
// //   FaBookOpen,
// //   FaChartLine,
// //   FaCircleCheck,
// //   FaClock,
// //   FaGraduationCap,
// //   FaLaptopCode,
// //   FaLock,
// //   FaPlay,
// //   FaShieldHalved,
// //   FaStar,
// //   FaUserShield,
// // } from "react-icons/fa6";

// // import stock from "../assets/images/stock.png";
// // import splunk from "../assets/images/splunk.png";

// // const pageMotion = {
// //   hidden: { opacity: 0 },
// //   visible: {
// //     opacity: 1,
// //     transition: {
// //       duration: 0.6,
// //       staggerChildren: 0.12,
// //     },
// //   },
// // };

// // const fadeUp = {
// //   hidden: {
// //     opacity: 0,
// //     y: 35,
// //   },
// //   visible: {
// //     opacity: 1,
// //     y: 0,
// //     transition: {
// //       duration: 0.7,
// //       ease: "easeOut",
// //     },
// //   },
// // };

// // const floatingMotion = {
// //   animate: {
// //     y: [0, -10, 0],
// //     transition: {
// //       duration: 4,
// //       repeat: Infinity,
// //       ease: "easeInOut",
// //     },
// //   },
// // };

// // export default function MyCourses() {
// //   const [authorized, setAuthorized] = useState(false);

// //   /* ===============================
// //      USER NORMALIZATION
// //   =============================== */
// //   const userEmail = useMemo(() => {
// //     try {
// //       const raw = localStorage.getItem("user");

// //       if (!raw) return "";

// //       const parsed = JSON.parse(raw);

// //       return (parsed?.email || raw).toLowerCase().trim();
// //     } catch {
// //       return (localStorage.getItem("user") || "").toLowerCase().trim();
// //     }
// //   }, []);

// //   /* ===============================
// //      ACCESS CONTROL
// //   =============================== */
// //   const allowedEmails = useMemo(
// //     () =>
// //       new Set(
// //         [
// //           "sammmyayo@gmail.com",
// //           "Sammmyayo@gmail.com",
// //           "kewizle.k@gmail.com",
// //           "kewizlek@gmail.com",
// //           "davidayeni63@gmail.com",
// //           "pamelaabina24@gmail.com",
// //           "Pamelaabina24@gmail.com",
// //           "adesh25416@gmail.com",
// //           "basseyvera018@gmail.com",
// //           "codeverseprogramming23@gmail.com",
// //           "fadeleolutola@gmail.com",
// //           "ooolajuyigbe@gmail.com",
// //           "jahdek76@gmail.com",
// //           "samuelsamuelmayowa@gmail.com",
// //           "oluwaferanmiolulana@gmail.com",
// //           "tomideolulana@gmail.com",
// //           "toanalyticsllc@gmail.com",
// //           "lybertyudochuu@gmail.com",
// //           "kevwe_oberiko@yahoo.com",
// //           "denisgsam@gmail.com",
// //           "oluwaferanmi.olulana@gmail.com",
// //           "fpasamuelmayowa51@gmail.com",
// //           "randommayowa@gmail.com",
// //           "oluwatiroyeamoye@gmail.com",
// //           "adenusitimi@gmail.com",
// //           "trbanjo@gmail.com",
// //           "emanfrimpong@gmail.com",
// //           "dipeoluolatunji@gmail.com",
// //           "yinkalola51@gmail.com",
// //         ].map((email) => email.toLowerCase()),
// //       ),
// //     [],
// //   );

// //   const stockAccess = useMemo(
// //     () => new Set(["tomideolulana@gmail.com","annrit11@gmail.com", "samuelsamuelmayowa@gmail.com","toanalyticsllc@gmail.com",  "Annrit11@gmail.com" ]),
// //     [],
// //   );

// //   useEffect(() => {
// //     setAuthorized(allowedEmails.has(userEmail));
// //   }, [userEmail, allowedEmails]);

// //   const courses = [
// //     {
// //       to: "/dashboard/materials",
// //       image: splunk,
// //       title: "Splunk Training",
// //       category: "Cybersecurity / SIEM",
// //       accent: "blue",
// //       description:
// //         "Master Splunk SPL, dashboards, alerts, reports, investigations and real-world SIEM workflows.",
// //       badge: "Active",
// //       progress: 78,
// //       lessons: "24 Lessons",
// //       duration: "14 Weeks",
// //       level: "Beginner to Pro",
// //       visible: true,
// //     },
// //     {
// //       to: "/dashboard/stockportal",
// //       image: stock,
// //       title: "Stock & Options",
// //       category: "Trading / Finance",
// //       accent: "green",
// //       description:
// //         "Learn advanced trading strategies, options analysis, market structure and risk control.",
// //       badge: "Private",
// //       progress: 42,
// //       lessons: "18 Lessons",
// //       duration: "Private Access",
// //       level: "Advanced",
// //       visible: stockAccess.has(userEmail),
// //     },
// //   ].filter((course) => course.visible);

// //   /* ===============================
// //      ACCESS DENIED VIEW
// //   =============================== */
// //   if (!authorized) {
// //     return (
// //       <motion.main
// //         variants={pageMotion}
// //         initial="hidden"
// //         animate="visible"
// //         className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 py-16 text-white"
// //       >
// //         <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-BLUE/40 blur-[130px]" />
// //         <div className="absolute bottom-[-200px] right-[-180px] h-[500px] w-[500px] rounded-full bg-red-500/20 blur-[150px]" />
// //         <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

// //         <motion.div
// //           variants={fadeUp}
// //           className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10"
// //         >
// //           <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/15 text-3xl text-red-400">
// //             <FaLock />
// //           </div>

// //           <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-red-300">
// //             Access Restricted
// //           </p>

// //           <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
// //             Paid Courses Locked
// //           </h1>

// //           <p className="mx-auto mt-5 max-w-md text-base font-medium leading-8 text-white/65">
// //             This account does not currently have access to paid course
// //             materials. Please use an approved student account or contact
// //             support.
// //           </p>

// //           <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
// //             <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
// //               Current Account
// //             </p>
// //             <p className="mt-2 break-all text-sm font-bold text-white/80">
// //               {userEmail || "Unknown user"}
// //             </p>
// //           </div>

// //           <div className="mt-8 flex flex-col gap-3 sm:flex-row">
// //             <NavLink
// //               to="/courses"
// //               className="flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 font-black text-BLUE transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
// //             >
// //               View Courses
// //             </NavLink>

// //             <NavLink
// //               to="/dashboard"
// //               className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
// //             >
// //               Back to Dashboard
// //             </NavLink>
// //           </div>
// //         </motion.div>
// //       </motion.main>
// //     );
// //   }

// //   /* ===============================
// //      AUTHORIZED VIEW
// //   =============================== */
// //   return (
// //     <motion.main
// //       variants={pageMotion}
// //       initial="hidden"
// //       animate="visible"
// //       className="relative min-h-screen overflow-hidden bg-[#050816]  py-10 text-white md:px-10 lg:px-16"
// //     >
// //       <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/40 blur-[140px]" />
// //       <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-[150px]" />
// //       <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />
// //       <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

// //       <div className="relative z-10 mx-auto max-w-7xl">
// //         {/* HEADER */}
// //         <motion.section
// //           variants={fadeUp}
// //           className="overflow-hidden rounded-[2.7rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10"
// //         >
// //           <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
// //             <div>
// //               <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
// //                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
// //                   <FaUserShield />
// //                 </span>
// //                 <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
// //                   Student Learning Dashboard
// //                 </span>
// //               </div>

// //               <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight md:text-6xl">
// //                 My Paid Courses
// //               </h1>

// //               <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/65">
// //                 Welcome back. Continue your premium learning programs, access
// //                 lessons, track your progress and keep building career-ready
// //                 skills.
// //               </p>

// //               <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
// //                 <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
// //                   Signed in as
// //                 </p>
// //                 <p className="mt-2 break-all text-sm font-bold text-white/80">
// //                   {userEmail}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-2 gap-4">
// //               <DashboardStat
// //                 icon={<FaGraduationCap />}
// //                 value={courses.length}
// //                 label="Active Courses"
// //               />

// //               <DashboardStat
// //                 icon={<FaBookOpen />}
// //                 value="42+"
// //                 label="Lessons"
// //               />

// //               <DashboardStat
// //                 icon={<FaClock />}
// //                 value="14"
// //                 label="Week Roadmap"
// //               />

// //               <DashboardStat
// //                 icon={<FaChartLine />}
// //                 value="Pro"
// //                 label="Skill Level"
// //               />
// //             </div>
// //           </div>
// //         </motion.section>

// //         {/* QUICK INFO BAR */}
// //         <motion.section
// //           variants={fadeUp}
// //           className="mt-8 grid gap-5 md:grid-cols-3"
// //         >
// //           <InfoCard
// //             icon={<FaCircleCheck />}
// //             title="Premium Access"
// //             text="Your account is approved for paid course materials."
// //           />

// //           <InfoCard
// //             icon={<FaLaptopCode />}
// //             title="Learn Anywhere"
// //             text="Continue your lessons from desktop, tablet or mobile."
// //           />

// //           <InfoCard
// //             icon={<FaStar />}
// //             title="Career Focused"
// //             text="Courses are structured around practical skills and real use cases."
// //           />
// //         </motion.section>

// //         {/* COURSE GRID */}
// //         <motion.section variants={fadeUp} className="mt-12">
// //           <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
// //             <div>
// //               <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">
// //                 Continue Learning
// //               </p>
// //               <h2 className="mt-3 text-3xl font-black md:text-4xl">
// //                 Your Course Library
// //               </h2>
// //             </div>

// //             <NavLink
// //               to="/courses"
// //               className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
// //             >
// //               Browse More Courses
// //               <FaArrowRight />
// //             </NavLink>
// //           </div>

// //           <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
// //             {courses.map((course) => (
// //               <CourseCard key={course.title} {...course} />
// //             ))}
// //           </div>
// //         </motion.section>
// //       </div>
// //     </motion.main>
// //   );
// // }

// // /* ===============================
// //    DASHBOARD STAT
// // =============================== */
// // function DashboardStat({ icon, value, label }) {
// //   return (
// //     <motion.div
// //       variants={floatingMotion}
// //       animate="animate"
// //       className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
// //     >
// //       <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
// //         {icon}
// //       </div>

// //       <h3 className="text-3xl font-black">{value}</h3>
// //       <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">
// //         {label}
// //       </p>
// //     </motion.div>
// //   );
// // }

// // /* ===============================
// //    INFO CARD
// // =============================== */
// // function InfoCard({ icon, title, text }) {
// //   return (
// //     <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14]">
// //       <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
// //         {icon}
// //       </div>

// //       <h3 className="text-xl font-black">{title}</h3>
// //       <p className="mt-3 text-sm font-medium leading-7 text-white/55">{text}</p>
// //     </div>
// //   );
// // }

// // /* ===============================
// //    COURSE CARD COMPONENT
// // =============================== */
// // function CourseCard({
// //   to,
// //   image,
// //   title,
// //   category,
// //   description,
// //   accent,
// //   badge,
// //   progress,
// //   lessons,
// //   duration,
// //   level,
// // }) {
// //   const theme = {
// //     blue: {
// //       badge: "bg-blue-500/15 text-blue-200 border-blue-400/20",
// //       button: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30",
// //       progress: "bg-blue-500",
// //       glow: "from-blue-500/40",
// //     },
// //     green: {
// //       badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
// //       button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30",
// //       progress: "bg-emerald-500",
// //       glow: "from-emerald-500/40",
// //     },
// //   };

// //   const currentTheme = theme[accent] || theme.blue;

// //   return (
// //     <NavLink
// //       to={to}
// //       className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:bg-white/[0.14]"
// //     >
// //       <div
// //         className={`absolute inset-0 bg-gradient-to-br ${currentTheme.glow} via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100`}
// //       />

// //       <div className="relative overflow-hidden rounded-[2rem]">
// //         <div className="relative h-72 overflow-hidden">
// //           <img
// //             src={image}
// //             alt={title}
// //             className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
// //           />

// //           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

// //           <div className="absolute left-5 top-5 flex flex-wrap items-center gap-3">
// //             <span
// //               className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-xl ${currentTheme.badge}`}
// //             >
// //               {badge}
// //             </span>

// //             <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl">
// //               {category}
// //             </span>
// //           </div>

// //           <div className="absolute bottom-5 left-5 right-5">
// //             <h2 className="text-3xl font-black text-white md:text-4xl">
// //               {title}
// //             </h2>

// //             <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-white/70">
// //               {description}
// //             </p>
// //           </div>
// //         </div>

// //         <div className="bg-[#080b18] p-6">
// //           <div className="grid grid-cols-3 gap-3">
// //             <CourseMeta label="Lessons" value={lessons} />
// //             <CourseMeta label="Duration" value={duration} />
// //             <CourseMeta label="Level" value={level} />
// //           </div>

// //           <div className="mt-6">
// //             <div className="mb-3 flex items-center justify-between">
// //               <p className="text-sm font-bold text-white/55">
// //                 Learning Progress
// //               </p>
// //               <p className="text-sm font-black text-white">{progress}%</p>
// //             </div>

// //             <div className="h-3 overflow-hidden rounded-full bg-white/10">
// //               <div
// //                 className={`h-full rounded-full ${currentTheme.progress}`}
// //                 style={{ width: `${progress}%` }}
// //               />
// //             </div>
// //           </div>

// //           <div
// //             className={`mt-7 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-black text-white shadow-xl transition duration-300 group-hover:-translate-y-1 ${currentTheme.button}`}
// //           >
// //             <FaPlay />
// //             Continue Learning
// //             <FaArrowRight className="transition duration-300 group-hover:translate-x-1" />
// //           </div>
// //         </div>
// //       </div>
// //     </NavLink>
// //   );
// // }

// // /* ===============================
// //    COURSE META
// // =============================== */
// // function CourseMeta({ label, value }) {
// //   return (
// //     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
// //       <p className="text-xs font-black uppercase tracking-widest text-white/35">
// //         {label}
// //       </p>
// //       <p className="mt-2 text-sm font-black text-white">{value}</p>
// //     </div>
// //   );
// // }
