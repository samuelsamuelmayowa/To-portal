import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBookOpen,
  FaChartLine,
  FaClock,
  FaFire,
  FaGraduationCap,
  FaLaptopCode,
  FaMagnifyingGlass,
  FaShieldHalved,
  FaStar,
} from "react-icons/fa6";

import COURSES from "../coursesAPI/api";
import { useStateContext } from "../context/ContextProvider";

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

const categories = [
  "All",
  "Cybersecurity",
  "Data",
  "Cloud",
  "Development",
  "Finance",
  "Creative",
  "Consulting",
];

const getCourseCategory = (courseName = "") => {
  const name = courseName.toLowerCase();

  if (
    name.includes("splunk") ||
    name.includes("security") ||
    name.includes("cyber") ||
    name.includes("soc")
  ) {
    return "Cybersecurity";
  }

  if (
    name.includes("data") ||
    name.includes("analytics") ||
    name.includes("science")
  ) {
    return "Data";
  }

  if (
    name.includes("cloud") ||
    name.includes("aws") ||
    name.includes("azure")
  ) {
    return "Cloud";
  }

  if (
    name.includes("web") ||
    name.includes("app") ||
    name.includes("python") ||
    name.includes("javascript") ||
    name.includes("development")
  ) {
    return "Development";
  }

  if (
    name.includes("stock") ||
    name.includes("option") ||
    name.includes("trading")
  ) {
    return "Finance";
  }

  if (
    name.includes("photo") ||
    name.includes("video") ||
    name.includes("drone") ||
    name.includes("design")
  ) {
    return "Creative";
  }

  if (name.includes("consult")) {
    return "Consulting";
  }

  return "Development";
};

const AllCourses = () => {
  const { token } = useStateContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const enhancedCourses = useMemo(() => {
    return COURSES.map((course) => ({
      ...course,
      category: getCourseCategory(course.courseName),
    }));
  }, []);

  const filteredCourses = useMemo(() => {
    return enhancedCourses.filter((course) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        course.courseName?.toLowerCase().includes(search) ||
        course.intro?.toLowerCase().includes(search) ||
        course.description?.toLowerCase().includes(search) ||
        course.category?.toLowerCase().includes(search);

      const matchesCategory =
        activeCategory === "All" || course.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [enhancedCourses, searchTerm, activeCategory]);

  return (
    <motion.main
      variants={pageMotion}
      initial="hidden"
      animate="visible"
      className="overflow-hidden bg-white text-slate-950"
    >
      {/* ================= HERO ================= */}
      {!token && (
        <section className="relative overflow-hidden bg-[#050816] px-6 pb-24 pt-36 text-white md:px-16 lg:px-24">
          <div className="absolute left-[-180px] top-[-180px] h-[460px] w-[460px] rounded-full bg-BLUE/40 blur-[140px]" />
          <div className="absolute bottom-[-220px] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-[150px]" />
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />

          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <motion.div
              variants={fadeUp}
              className="mx-auto max-w-4xl text-center"
            >
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
                  <FaGraduationCap />
                </span>
                <span className="text-xs font-black uppercase tracking-[0.25em] text-white/70">
                  T.O Analytics Learning Platform
                </span>
              </div>

              <h1 className="text-5xl font-black leading-[1.03] tracking-tight md:text-6xl xl:text-7xl">
                Explore Courses Built for Real Tech Careers.
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-white/65 md:text-xl">
                Whether you are a beginner or looking to expand your career
                opportunities, our carefully selected courses help you gain
                practical skills, confidence and job-ready experience.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-4"
            >
              <HeroStat
                icon={<FaBookOpen />}
                value={COURSES.length}
                label="Courses"
              />
              <HeroStat
                icon={<FaShieldHalved />}
                value="1:1"
                label="Mentorship"
              />
              <HeroStat icon={<FaClock />} value="14" label="Week Roadmap" />
              <HeroStat icon={<FaChartLine />} value="Pro" label="Skills" />
            </motion.div>
          </div>
        </section>
      )}

      {/* ================= COURSE AREA ================= */}
      <section
        className={`relative bg-slate-50 px-6 py-20 md:px-16 lg:px-24 ${
          token ? "pt-28" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl">
          {/* TOP BAR */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
                Course Library
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                Find your next skill.
              </h2>

              <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-slate-600">
                Search by course name, category, topic or skill path.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                {filteredCourses.length} course
                {filteredCourses.length === 1 ? "" : "s"} found
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Updated course collection
              </p>
            </div>
          </motion.div>

          {/* SEARCH + FILTER */}
          <motion.div
            variants={fadeUp}
            className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="flex h-14 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 transition focus-within:border-BLUE focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-100">
                <FaMagnifyingGlass className="text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Search courses, e.g. Splunk, Data, Stock..."
                  className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 md:text-base"
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-BLUE"
              >
                Reset
              </button>
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-5 py-3 text-sm font-black transition duration-300 ${
                    activeCategory === category
                      ? "bg-BLUE text-white shadow-lg shadow-blue-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-950 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* COURSE GRID */}
          {filteredCourses.length > 0 ? (
            <motion.div
              variants={pageMotion}
              className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredCourses.map((course, index) => (
                <CourseCard key={index} course={course} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUp}
              className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-BLUE">
                <FaMagnifyingGlass />
              </div>

              <h3 className="mt-6 text-3xl font-black text-slate-950">
                No course found
              </h3>

              <p className="mx-auto mt-3 max-w-md leading-8 text-slate-600">
                Try another keyword or change the course category filter.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-7 rounded-2xl bg-BLUE px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:opacity-90"
              >
                Show All Courses
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </motion.main>
  );
};

export default AllCourses;

/* ===============================
   HERO STAT
=============================== */
function HeroStat({ icon, value, label }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
        {icon}
      </div>

      <h3 className="text-3xl font-black text-white">{value}</h3>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">
        {label}
      </p>
    </div>
  );
}

/* ===============================
   COURSE CARD
=============================== */
function CourseCard({ course, index }) {
  const route = course.courseName.toLowerCase();

  return (
    <motion.div variants={fadeUp} custom={index}>
      <Link
        to={route}
        className="group block h-full overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white p-3 shadow-sm transition duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-slate-200"
      >
        <div className="relative overflow-hidden rounded-[2rem]">
          <div className="relative h-64 overflow-hidden">
            <LazyLoadImage
              src={course.image}
              effect="blur"
              alt={`Image for ${course.courseName} course`}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />

            <div className="absolute left-5 top-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-BLUE shadow-lg">
                {course.category}
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                Popular
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-black text-yellow-300">
                <FaStar />
                Premium Course
              </p>

              <h3 className="line-clamp-2 text-3xl font-black leading-tight text-white">
                {course.courseName}
              </h3>
            </div>
          </div>

          <div className="p-5">
            <p className="text-lg font-black leading-7 text-slate-950">
              {course.intro}
            </p>

            <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
              {course.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Price
                </p>
                <p className="mt-2 text-2xl font-black text-BLUE">
                  ${course.price}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Level
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  Beginner+
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <p className="text-sm font-black text-slate-950">
                  View Course
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Details, curriculum and price
                </p>
              </div>

              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-BLUE text-white transition duration-300 group-hover:translate-x-1">
                <FaArrowRight />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
// import { Link } from "react-router-dom";
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';
// import COURSES from "../coursesAPI/api"
// import { useStateContext } from "../context/ContextProvider"
// import { motion } from "framer-motion";
// import { LandingSpike } from "./BgDesigns";

// const container = {
//   hidden: { opacity: 1, scale: 0 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       type: "spring",
//       stiffness: 250,
//       delayChildren: 0.5,
//       staggerChildren: 0.5
//     }
//   }
// }

// const h1 = {
//   hidden: { y: "-40px", opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//   }
// }
// const p = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1
//   }
// }

// const AllCourses = () => {
//   const { token } = useStateContext();
//   return (
//     <div>
//       <section className="bg-white px-5 md:px-10 py-6">
//        {!token && 
//         <motion.div variants={container} initial="hidden" animate="visible">
//           <motion.h1 variants={h1} className="OUR-COURSES text-center font-black text-2xl md:text-4xl pt-20">
//             Our Courses
//           </motion.h1>
//           <motion.p variants={p} className="md:w-1/2 mx-auto font-normal md:font-semibold text-sm md:text-base my-7 md:mb-14 text-center">Whether you are a beginner or you are looking to expand your career opportunities, our carefully selected and well taught courses give you the knowledge and experience that you need.</motion.p>
//         </motion.div>}
//         <div className={`courses gap-y-4 gap-x-4 ${token && "pt-20"}`}>
//           {COURSES.map((course, index)=> (
//             <Link key={index} to={course.courseName.toLowerCase()} className="">
//             <div
//               className={`rounded-xl`}
//               data-aos-once="true"
//               data-aos-duration="5000"
//               data-aos="fade-up"
//             >
//               <div className="rounded-tr-2xl rounded-tl-2xl">
//                 <LazyLoadImage
//                   src={course.image}
//                   className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
//                   alt={`Image for ${course.courseName} course`}
//                 />
//               </div>
//               <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
//                 <p className="font-bold text-white text-lg md:my-4 md:text-3xl line-clamp-1">{course.courseName}</p>
//                 <p className="my-2 font-bold text-base">{course.intro}</p>
//                 <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
//                   {course.description}
//                 </p>
//                 <p className="font-bold my-5 text-lg md:text-xl">${course.price}</p>
//               </div>
//             </div>
//           </Link>
//           ))}
//         </div>
//       </section>
//     </div>
//   )
// }

// export default AllCourses