import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useState, useEffect, useContext, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FaXmark,
  FaCheck,
  FaCartShopping,
  FaBolt,
  FaGraduationCap,
  FaLaptop,
  FaCertificate,
  FaClock,
} from "react-icons/fa6";
import CartItemContext from "../context/CartItemContext";
import { Helmet } from "react-helmet";

const pageMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const perks = [
  {
    icon: <FaGraduationCap />,
    title: "Beginner Friendly",
    text: "Start from the basics and grow step by step.",
  },
  {
    icon: <FaLaptop />,
    title: "Mobile & Desktop",
    text: "Access your learning anywhere, anytime.",
  },
  {
    icon: <FaCertificate />,
    title: "Certificate",
    text: "Receive proof of completion after the course.",
  },
  {
    icon: <FaClock />,
    title: "Lifetime Access",
    text: "Revisit lessons and materials whenever you need.",
  },
];

const COURSE = () => {
  const whatToLearnRef = useRef(null);
  const isInView = useInView(whatToLearnRef, { once: true, amount: 0.2 });

  const navigate = useNavigate();
  const { course } = useParams();

  const {
    COURSES,
    token,
    cartItem,
    addToCart,
    setCartItem,
  } = useContext(CartItemContext);

  const [showModal, setShowModal] = useState(false);
  const [stockOptionIndex, setStockOptionIndex] = useState(null);

  const courseSlug = decodeURIComponent(course || "").toLowerCase();

  const singleCourse = COURSES?.find(
    (item) => item.courseName.toLowerCase() === courseSlug
  );

  useEffect(() => {
    localStorage.setItem("COURSE-CART", JSON.stringify(cartItem || []));
  }, [cartItem]);

  if (!singleCourse) {
    return (
      <div className="min-h-screen bg-white px-6 py-40 text-center">
        <Helmet>
          <title>Course Not Found | T.O Analytics</title>
        </Helmet>

        <h1 className="text-3xl font-black text-slate-950 md:text-5xl">
          Course Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          The course you are looking for does not exist or may have been moved.
        </p>

        <button
          onClick={() => navigate("/courses")}
          className="mt-8 rounded-2xl bg-BLUE px-8 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 hover:opacity-90"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const isStockAndOptions =
    singleCourse.courseName.toLowerCase() === "stock & options";

  const isEducationalConsulting =
    singleCourse.courseName.toLowerCase() === "educational consulting";

  const stockAndOptionsData =
    isStockAndOptions && stockOptionIndex !== null
      ? singleCourse?.otherSubCourses?.[stockOptionIndex]
      : null;

  const isMainCourseInCart = cartItem?.some(
    (item) => item.id === singleCourse.id
  );

  const buyCourse = () => {
    if (token) {
      navigate("/checkout");
    } else {
      navigate("/createAccount");
    }
  };

  const handleMainCourseAction = () => {
    if (isMainCourseInCart) {
      buyCourse();
      return;
    }

    addToCart(singleCourse);
    toast.success("Course added to cart");
  };

  const addStockAndOptionSubCourse = (subCourse) => {
    if (!subCourse) return;

    const alreadyAdded = cartItem?.some((item) => item.id === subCourse.id);

    if (alreadyAdded) {
      toast.info("This course is already in your cart");
      return;
    }

    setCartItem((prev) => [...prev, subCourse]);
    toast.success("Successfully added to cart");
  };

  return (
    <motion.div
      variants={pageMotion}
      initial="hidden"
      animate="visible"
      className="overflow-hidden bg-white text-slate-950"
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>{singleCourse.courseName} | T.O Analytics</title>
        <link rel="canonical" href="https://www.to-analytics.com" />
        <meta
          name="description"
          content={`${singleCourse.courseName} course by T.O Analytics. ${singleCourse.description}`}
        />
        <meta
          property="og:description"
          content={`${singleCourse.courseName} course by T.O Analytics. ${singleCourse.description}`}
        />
      </Helmet>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden bg-slate-950 px-6 pb-20 pt-28 text-white md:px-16 lg:px-24">
        <div className="absolute left-[-140px] top-[-140px] h-[360px] w-[360px] rounded-full bg-BLUE opacity-40 blur-[120px]" />
        <div className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-400 opacity-20 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-BLUE">
                <FaBolt />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-white/80">
                Premium Tech Course
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl xl:text-7xl">
              {singleCourse.courseName}
            </h1>

            <p className="mt-6 max-w-2xl text-2xl font-bold leading-9 text-white">
              {singleCourse.intro}
            </p>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/70 md:text-lg">
              {singleCourse.description}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleMainCourseAction}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 font-black text-BLUE shadow-2xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
              >
                <FaCartShopping />
                {isMainCourseInCart ? "Buy Course" : "Add to Cart"}
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="rounded-2xl border border-white/20 px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
              >
                View Course Details
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-2xl font-black">${singleCourse.price}</p>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  Course Price
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-2xl font-black">All</p>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  Skill Levels
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-2xl font-black">Live</p>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  Mentorship
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-2xl font-black">Cert</p>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  Included
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeLeft} className="relative">
            <div className="absolute inset-0 rotate-6 rounded-[3rem] bg-white/10" />

            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <img
                src={singleCourse.image}
                alt={singleCourse.courseName}
                className="h-[360px] w-full rounded-[2.3rem] object-cover md:h-[520px]"
              />

              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                  Course Preview
                </p>
                <h3 className="mt-2 text-2xl font-black">
                  Learn by doing real labs
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Practical lessons, guided support and real-world projects.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= PERKS ================= */}
      <section className="bg-white px-6 py-20 md:px-16 lg:px-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isEducationalConsulting ? (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm md:col-span-2 xl:col-span-4">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-BLUE">
                Consultation
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">
                $250 · 1 hour 30 minutes
              </h2>
              <p className="mt-3 max-w-3xl leading-8 text-slate-600">
                Get expert guidance for your educational, career or technology
                journey with a focused consultation session.
              </p>
            </div>
          ) : (
            perks.map((perk) => (
              <motion.div
                key={perk.title}
                variants={fadeUp}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-100"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-BLUE text-white">
                  {perk.icon}
                </div>
                <h3 className="text-xl font-black text-slate-950">
                  {perk.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                  {perk.text}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* ================= WHAT YOU WILL LEARN ================= */}
      <section
        ref={whatToLearnRef}
        className="bg-slate-50 px-6 py-24 md:px-16 lg:px-24"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            animate={isInView ? "visible" : "hidden"}
            initial="hidden"
            className="max-w-3xl"
          >
            <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
              Course Curriculum
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              What You’ll Learn
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              This course is structured to help you understand the concept,
              practice it, and apply it confidently.
            </p>
          </motion.div>

          {isStockAndOptions ? (
            <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_420px]">
              <motion.div
                variants={pageMotion}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="grid gap-4"
              >
                {singleCourse.whatToLearn.map((item, index) => (
                  <motion.button
                    key={index}
                    variants={fadeUp}
                    onMouseEnter={() => setStockOptionIndex(index)}
                    onClick={() => setStockOptionIndex(index)}
                    className={`group rounded-2xl border p-5 text-left transition duration-300 ${
                      stockOptionIndex === index
                        ? "border-BLUE bg-white shadow-xl shadow-slate-100"
                        : "border-slate-200 bg-white hover:border-BLUE"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-BLUE text-white">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-800">{item}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              <div className="sticky top-24 h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
                {stockAndOptionsData ? (
                  <>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-BLUE">
                      Selected Course
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-slate-950">
                      {stockAndOptionsData.name}
                    </h3>
                    <p className="mt-3 text-3xl font-black text-BLUE">
                      ${stockAndOptionsData.price}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-4 py-2">
                        {stockAndOptionsData.duration} course
                      </span>
                      <span className="rounded-full bg-slate-100 px-4 py-2">
                        All levels
                      </span>
                    </div>

                    <p className="mt-5 leading-8 text-slate-600">
                      {stockAndOptionsData.description}
                    </p>

                    <ul className="mt-5 space-y-3">
                      {stockAndOptionsData.whatToLearn?.map((learn, index) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm font-medium text-slate-700"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-BLUE text-xs text-white">
                            <FaCheck />
                          </span>
                          {learn}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() =>
                        cartItem?.some(
                          (item) => item.id === stockAndOptionsData.id
                        )
                          ? buyCourse()
                          : addStockAndOptionSubCourse(stockAndOptionsData)
                      }
                      className="mt-7 w-full rounded-2xl bg-BLUE px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:opacity-90"
                    >
                      {cartItem?.some(
                        (item) => item.id === stockAndOptionsData.id
                      )
                        ? "Buy Course"
                        : "Add to Cart"}
                    </button>
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <h3 className="text-2xl font-black text-slate-950">
                      Select a module
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600">
                      Click any topic on the left to preview the sub-course.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <motion.div
              variants={pageMotion}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="mt-14 grid gap-5 md:grid-cols-2"
            >
              {singleCourse.whatToLearn.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-BLUE hover:shadow-xl hover:shadow-slate-100"
                >
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-BLUE text-sm font-black text-white">
                      <FaCheck />
                    </span>
                    <p className="font-bold leading-7 text-slate-800">
                      {item}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ================= BEGINNER NOTE ================= */}
      <section className="bg-white px-6 py-20 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-200 md:p-14">
          {isEducationalConsulting ? (
            <>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-sky-300">
                Guidance
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                Assistance & guidance at all stages.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
                Get structured direction, expert feedback and professional
                advice tailored to your goals.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-sky-300">
                Beginner Friendly
              </p>
              <h2 className="mt-4 text-4xl font-black md:text-5xl">
                No prior knowledge needed.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
                You do not need prior knowledge of {singleCourse.courseName} to
                enroll in this course. We will cover everything from the basics,
                guide you step by step and help you build confidence through
                practical learning.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={handleMainCourseAction}
              className="rounded-2xl bg-white px-8 py-4 font-black text-BLUE transition duration-300 hover:-translate-y-1"
            >
              {isMainCourseInCart ? "Buy Course" : "Add to Cart"}
            </button>

            <button
              onClick={() => navigate("/courses")}
              className="rounded-2xl border border-white/20 px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE"
            >
              View Other Courses
            </button>
          </div>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-5 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <FaXmark />
            </button>

            <div className="pr-12">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-BLUE">
                Course Details
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">
                {singleCourse.courseName}
              </h2>
              <p className="mt-4 text-lg font-bold leading-8 text-slate-700">
                {singleCourse.intro}
              </p>
              <p className="mt-3 leading-8 text-slate-600">
                {singleCourse.description}
              </p>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <h3 className="text-xl font-black text-slate-950">
                What you’ll learn
              </h3>

              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {singleCourse.whatToLearn.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm font-medium leading-7 text-slate-700"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-BLUE text-[10px] text-white">
                      <FaCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleMainCourseAction}
              className="mt-7 w-full rounded-2xl bg-BLUE px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:opacity-90"
            >
              {isMainCourseInCart ? "Buy Course" : "Add to Cart"}
            </button>
          </motion.div>
        </div>
      )}

      <Toaster position="top-center" />
    </motion.div>
  );
};

export default COURSE;
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { Toaster, toast } from 'sonner';
// import { useState, useEffect, useContext, useRef } from "react";
// import { motion, useInView } from "framer-motion";
// import { FaXmark } from "react-icons/fa6";
// import CartItemContext from "../context/CartItemContext";
// import { useStateContext } from "../context/ContextProvider";
// import { Helmet } from 'react-helmet';


// const courseName = {
//   hidden: {
//     opacity: 0,
//     y: "-100px"
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       type: "spring", stiffness: 200, duration: 0.8
//     }
//   }
// }

// const learnUl = {
//   hidden: {
//     opacity: 0,
//   },
//   visible: {
//     opacity: 1,
//     transition: {
//       type: "spring", duration: 0.3, staggerChildren: 0.3, delayChildren: 0.5
//     }
//   }
// }

// const li = {
//   hidden: {
//     opacity: 0,
//     visibility: "invisible",
//     y: "-80px"
//   },
//   visible: {
//     opacity: 1,
//     visibility: "visible",
//     y: 0
//   }
// }

// const COURSE = () => {
//   const whatToLearnRef = useRef()
//   const isInView = useInView(whatToLearnRef, {once: true})
//   const location = useLocation()
//   const navigate = useNavigate()
//   const { FullScreen } = useStateContext()
//   const { course } = useParams()
//   const [showModal, setShowModal] = useState(false)
//   const {COURSES, token, cartItem, addToCart, setCartItem} = useContext(CartItemContext);
//   const [stockOptionIndex, setStockOptionIndex] = useState(()=> {
//     if (location.pathname === "/courses/stock%20&%20options") return null
//     else return;
//   })

//   const singleCourse = COURSES?.find((C)=> C.courseName.toLowerCase() === course)
//   const stockAndOptions = COURSES?.find((course)=> course.courseName === singleCourse.courseName && location.pathname === "/courses/stock%20&%20options")
//   const stockAndOptionsData = stockAndOptions?.otherSubCourses[stockOptionIndex]

//   const addStockAndOptionSubCourses = (id)=> {
//     if (singleCourse?.otherSubCourses.some((item)=> item.id === id) && !cartItem.some((item)=> item.id === id)) {
//       toast.success(`successfully added to cart`)
//       setCartItem(prev => [...prev, stockAndOptionsData])
//     }
//   }

//   useEffect(()=> {
//     localStorage.setItem("COURSE-CART", JSON.stringify(cartItem))
//   },[cartItem]);

//   const showModalAction = ()=> {
//     setShowModal(prev=> !prev)
//   }
//   const removeModalAction = ()=> {
//     setShowModal(false)
//   }
//   const stockAndOptionsFn = (index)=> {
//     setStockOptionIndex(index)
//   }
//   const removeStockAndOptionFn = ()=> {
//     setStockOptionIndex(null)
//   }
//   const buyCourse = ()=> {
//     if (token) {
//       navigate("/checkout")
//     }
//     else {
//       navigate("/createAccount")
//     }
//   }
//   return (
//     <div className="">
//       <section className="pt-10">
//         <motion.h1 variants={courseName} initial="hidden" animate="visible" className="font-black text-center text-2xl md:text-3xl lg:text-4xl py-10 md:py-20">
//         <Helmet>
//                 <meta charSet="utf-8" />
//                 <title>Courses</title>
//                 <link rel="canonical" href="https://www.to-analytics.com" />
//                 <meta name="description" content={"to-analytics is an educational platform empowering career growth through affordable courses in diverse fields like Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more."} />
//                 <meta property="og:description" content={"to-analytics is an educational platform empowering career growth through affordable courses in diverse fields like Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more."} />
//             </Helmet>
//           {singleCourse.courseName.toUpperCase()}
//         </motion.h1>
//         <div className="px-5 md:px-10 py-10 md:py-16 grid grid-cols-1 gap-16 md:gap-0 md:grid-cols-2 bg-[#2d2065] text-white">
//           <div className="w-full">
//             <div className={`course-hover cursor-pointer w-fit`}>
//               <h1 className={`font-semibold text-2xl md:text-4xl my-4 md:w-2/3`}>
//                 {singleCourse.intro}
//                     <motion.div className={`fixed text-black md:w-[600px] w-[350px] z-[10] bg-white p-3 rounded-xl modal-shadow`}>
//                       <h1 className="text-center font-black text-md md:text-2xl lg:text-3xl">
//                         {singleCourse.courseName}
//                       </h1>
//                       <p className="font-semibold text-sm lg:text-lg my-2 md:my-4">
//                         {singleCourse.intro}
//                       </p>
//                       <div className="modal-learn learn">
//                         <ul className="text-sm">
//                           {singleCourse.whatToLearn.map((whatToLearn, index)=> (
//                             <li className="text-md md:text-base" key={index}>{whatToLearn}</li>
//                           ))}
//                         </ul>
//                       </div>
//                       {cartItem && cartItem?.some((item)=> item.id === singleCourse.id) ? 
//                       <button onClick={()=>buyCourse()} className="text-sm md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
//                         BUY COURSE
//                       </button>
//                       :
//                       <button onClick={()=> addToCart(singleCourse)} className="text-sm md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
//                         ADD TO CART
//                       </button>
//                       }  
//                     </motion.div>
//                     {showModal && (
//                       <motion.div className={`fixed text-black md:w-[600px] w-[350px] h-auto z-[10] bg-white p-3 rounded-xl modal-shadow`}>
//                       <div className="absolute right-4 top-4 md:hidden block">
//                         <FaXmark className="" onClick={()=> removeModalAction()} />
//                       </div>
//                       <h1 className="text-center font-black text-md md:text-2xl lg:text-3xl">
//                         {singleCourse.courseName}
//                       </h1>
//                       <p className="font-semibold text-sm lg:text-lg my-2 md:my-4">
//                         {singleCourse.intro}
//                       </p>
//                       <div className="modal-learn">
//                         <ul className="text-sm leading-[60px]">
//                           {singleCourse.whatToLearn.map((whatToLearn, index)=> (
//                             <li className="text-md md:text-base" key={index}>{whatToLearn}</li>
//                           ))}
//                         </ul>
//                       </div>
//                       {cartItem && cartItem.some((item)=> item.id === singleCourse.id) ? 
//                       <button onClick={()=>buyCourse()} className="text-base md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
//                         BUY COURSE
//                       </button>
//                       :
//                       <button onClick={()=> addToCart(singleCourse)} className="text-base md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
//                         ADD TO CART
//                       </button>
//                       }  
//                     </motion.div>
//                     )}
//               </h1>
//             </div>
//             <p className="md:w-1/2 w-full text-base md:text-lg">
//               {singleCourse.description}
//             </p>
//             <p className="md:my-6 my-4 font-bold md:text-3xl">${singleCourse.price}</p>
//             <div className="">
//               <button onClick={()=>showModalAction()} className="z-10 w-[120px] md:w-[150px] hover:bg-transparent border-2 hover:text-BLUE border-textColor duration-300 hover:bg-white md:mx-auto text-md md:text-xl font-semibold bg-BLUE text-white px-4 py-3 md:px-4 md:py-3 rounded-md">
//                 {showModal? "View Less" : "View More"}
//               </button>
//             </div>
//           </div>
//           <div className="perks">
//             {location.pathname === "/courses/educational%20consulting" ? 
//             <div>
//               <h1 className="font-bold text-xl md:text-2xl">Consultation</h1>
//               <p className="my-2 font-semibold text-sm md:text-lg">$250 . 1hour 30minutes</p>
//             </div> 
//             : 
//             <ul className="text-[15px] md:text-[1.2rem] leading-10">
//               <li>BEGINNER FRIENDLY</li>
//               <li>LIFETIME ACCESS</li>
//               <li>EXERCISES</li>
//               <li>ACCESS ON MOBILE & DESKTOP</li>
//               <li>CERTIFICATION</li>
//             </ul>}
//           </div>
//         </div>
//       </section>
//       <section className="px-2 md:px-10 py-8 md:py-10">
//         <h1 className="font-bold text-2xl md:text-4xl md:my-7 my-5">WHAT YOU’LL LEARN</h1>
//         <motion.div ref={whatToLearnRef} transition={{duration: 0.4}} className="learn">
//           {location.pathname === "/courses/stock%20&%20options" ?
//           <>
//               <motion.ul variants={learnUl} animate={isInView ? "visible" : "hidden"} className="md:w-[400px] md:text-base text-sm group">
//               {singleCourse.whatToLearn.map((whatToLearn, index)=> (
//                 <motion.li variants={li} key={index} onMouseEnter={()=> stockAndOptionsFn(index)} onMouseLeave={()=>removeStockAndOptionFn()} className="relative flex gap-20 cursor-pointer">{whatToLearn}
//                   {stockOptionIndex === index &&(<div className="stock-and-options z-10 absolute top-0 left-0 md:left-[300px] md:right-[-300px] bg-white shadow-xl rounded-lg p-3">
//                     <h2 className="font-black text-base">{stockAndOptionsData?.name}</h2>
//                     <div className="absolute right-4 top-4 md:hidden block">
//                       <FaXmark className="" onClick={()=> setStockOptionIndex(null)} />
//                     </div>
//                     <div>
//                       <p className="font-bold">${stockAndOptionsData?.price}</p>
//                     </div>
//                     <div className="flex items-center gap-3 font-md text-xs">
//                       <p>{stockAndOptionsData?.duration} course</p>
//                       <p className="">All levels</p>
//                     </div>
//                     <div className="my-3 text-sm">
//                       <p className="text-slate-400">{stockAndOptionsData?.description}</p>
//                     </div>
//                     <div className="learn">
//                       <ul className="text-sm">
//                         {stockAndOptionsData?.whatToLearn.map((whatToLearn, index)=> (
//                           <li key={index}>{whatToLearn}</li>
//                         ))}
//                       </ul>
//                     </div>
//                     <div>
//                       {cartItem?.some((item)=> item.id === stockAndOptionsData?.id) ? 
//                         <button onClick={()=>buyCourse()} className="w-full border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-1 py-1 md:px-2 md:py-1 rounded-md md:rounded-xl font-semibold">BUY COURSE</button>
//                         :
//                         <button onClick={()=> addStockAndOptionSubCourses(stockAndOptionsData?.id)} className="w-full border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-1 py-1 md:px-2 md:py-1 rounded-md md:rounded-xl font-semibold">ADD TO CART</button>
//                       }
//                     </div>
//                   </div>)}
//                 </motion.li>
//               ))}
//               </motion.ul>
//           </>
//           :
//           FullScreen ? 
//           <div className="relative learn grid grid-cols-1 md:grid-cols-2 py-5">
//             <motion.ul className="md:text-base text-sm">
//               {singleCourse.whatToLearn.slice(0, 6).map((whatToLearn, index)=> (
//                 <motion.li variants={li} className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
//                 </motion.li>
//               ))}
//             </motion.ul>
//             <motion.ul className="md:text-base text-sm">
//             {singleCourse.whatToLearn.slice(6).map((whatToLearn, index)=> (
//               <motion.li variants={li} className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
//               </motion.li>
//             ))}
//             </motion.ul>
//           </div> 
//           :
//           <div className="relative learn py-5">
//             <motion.ul className="md:text-base text-sm">
//               {singleCourse.whatToLearn.slice(0, 6).map((whatToLearn, index)=> (
//                 <motion.li className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
//                 </motion.li>
//               ))}
//             </motion.ul>
//             <motion.ul className="md:text-base text-sm">
//             {singleCourse.whatToLearn.slice(6).map((whatToLearn, index)=> (
//               <motion.li className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
//               </motion.li>
//             ))}
//             </motion.ul>
//           </div>
//           }
//         </motion.div>
//         {location.pathname === "/courses/educational%20consulting" ? 
//         <div className="py-5">
//           <h1 className="font-bold text-2xl md:text-4xl md:my-5 my-3">
//             Assistance & guidance at all stages
//           </h1>
//         </div> 
//         : 
//         <div className="py-5">
//           <h1 className="font-bold text-2xl md:text-4xl md:my-5 my-3">
//             No prior knowledge needed!
//           </h1>
//           <p className="p-4 md:text-base text-xs font-medium leading-7">
//             You don&apos;t require prior knowledge of {singleCourse.courseName} to enroll in this course. We&apos;ll cover everything you need to know right from the basics, guiding you step by step.
//           </p>
//         </div>}
//       </section>

//       <Toaster position="top-center" />
//     </div>
//   );
// };


// export default COURSE;
