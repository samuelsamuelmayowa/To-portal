import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import COURSES from "../coursesAPI/api";

import LandingIMG from "../assets/images/landingIMG.png";
import WebDev from "../assets/images/workplace-full (1).jpeg";
import AppDev from "../assets/images/mobile.jpg";
import UiUx from "../assets/images/oneone.jpeg";
import Consulting from "../assets/images/make.jpeg";

import "../../src/assets/css/pagination.css";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay,
      ease: "easeOut",
    },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const services = [
  {
    title: "Web Development",
    image: WebDev,
    label: "Business Websites",
    description:
      "Fast, modern and scalable websites built for brands, startups, schools and businesses.",
  },
  {
    title: "Mobile App Development",
    image: AppDev,
    label: "iOS & Android",
    description:
      "Beautiful mobile apps with smooth user experience, clean dashboards and real-world features.",
  },
  {
    title: "UI / UX & Branding",
    image: UiUx,
    label: "Product Design",
    description:
      "Premium interfaces, brand identity, prototypes and user-friendly digital experiences.",
  },
  {
    title: "Tech Consulting",
    image: Consulting,
    label: "Growth Strategy",
    description:
      "Technical guidance for startups, automation, digital transformation and product launch.",
  },
];

const stats = [
  { value: "14", label: "Weeks to become job-ready" },
  { value: "1:1", label: "Mentorship support" },
  { value: "6+", label: "Career-focused courses" },
  { value: "100%", label: "Hands-on practical learning" },
];

const benefits = [
  "Real-world labs and projects",
  "Beginner-friendly mentorship",
  "Career guidance and interview prep",
  "Splunk, Cybersecurity, Linux and Cloud training",
];

const faqs = [
  {
    question: "How long until I am job-ready?",
    answer:
      "Most mentees become job-ready within 14 weeks depending on commitment, practice time and prior experience.",
  },
  {
    question: "Can beginners join?",
    answer:
      "Yes. The mentorship is beginner-friendly and structured to help you grow step by step.",
  },
  {
    question: "Do you help with certifications?",
    answer:
      "Yes. We provide guidance for certifications in Splunk, Cybersecurity, Linux and related tech paths.",
  },
  {
    question: "Do you also build software products?",
    answer:
      "Yes. We build websites, mobile apps, UI/UX designs, dashboards and custom software solutions.",
  },
];

const HomePage = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="overflow-hidden bg-white text-slate-950"
    >
      <Helmet>
        <title>T.O Analytics | Tech Training & Software Solutions</title>
        <meta
          name="description"
          content="T.O Analytics offers world-class IT mentorship, Splunk training, cybersecurity, full-stack development education, and professional software services including web development, mobile apps, UI/UX and consulting."
        />
      </Helmet>

      {/* ========================= HERO SECTION ========================= */}
      <section className="relative min-h-screen overflow-hidden bg-white px-6 pb-20 pt-32 md:px-16 lg:px-24">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-BLUE opacity-10 blur-[90px]" />
        <div className="absolute bottom-[-160px] right-[-120px] h-[380px] w-[380px] rounded-full bg-sky-400 opacity-20 blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div variants={staggerContainer}>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-BLUE" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-BLUE">
                Tech Training + Software Solutions
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={0.1}
              className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-6xl xl:text-7xl"
            >
              Launch Your Tech Career & Build Digital Products That Stand Out.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={0.2}
              className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 md:text-xl"
            >
              Learn Splunk, Cybersecurity, Linux, Cloud and real-world software
              development through practical mentorship. We also build premium
              websites, mobile apps and product designs for businesses.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/mentorship">
                <button className="w-full rounded-2xl bg-BLUE px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-200 transition duration-300 hover:-translate-y-1 hover:opacity-90 sm:w-auto">
                  Join Mentorship
                </button>
              </Link>

              <Link to="/courses">
                <button className="w-full rounded-2xl border-2 border-BLUE bg-white px-8 py-4 text-base font-bold text-BLUE transition duration-300 hover:-translate-y-1 hover:bg-BLUE hover:text-white sm:w-auto">
                  Explore Courses
                </button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={0.4}
              className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="text-2xl font-black text-BLUE">
                    {stat.value}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rotate-6 rounded-[3rem] bg-BLUE opacity-10" />
            <div className="relative rounded-[3rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200">
              <img
                src={LandingIMG}
                alt="T.O Analytics learning platform"
                className="w-full rounded-[2.3rem] object-cover"
              />

              <div className="absolute -bottom-6 left-6 right-6 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-BLUE">
                  Career Path
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  From Beginner to Job-Ready
                </h3>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[78%] rounded-full bg-BLUE" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= BENEFITS SECTION ========================= */}
      <section className="bg-slate-950 px-6 py-16 text-white md:px-16 lg:px-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <motion.div variants={fadeUp}>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-300">
              Why T.O Analytics?
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight md:text-5xl">
              Training that feels practical, modern and career-focused.
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid gap-4 sm:grid-cols-2"
          >
            {benefits.map((item, index) => (
              <motion.div
                key={item}
                variants={fadeUp}
                custom={index * 0.05}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-BLUE">
                  ✓
                </div>
                <p className="font-bold leading-7">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= SERVICES SECTION ========================= */}
      <section className="relative bg-slate-50 px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
              Software Services
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              We Also Build Amazing Digital Products
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              From websites and apps to UI/UX and consulting, we help brands
              turn ideas into high-quality digital products.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-4"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                custom={index * 0.08}
                className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-slate-200"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-BLUE">
                    {service.label}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-black text-slate-950">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                    {service.description}
                  </p>

                  <Link
                    to="/contact"
                    className="mt-6 inline-flex items-center font-black text-BLUE"
                  >
                    Start a project
                    <span className="ml-2 transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= FEATURED COURSES ========================= */}
      <section className="bg-white px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <motion.div variants={fadeUp}>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
                Popular Courses
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">
                Choose a course and start building real skills.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/courses">
                <button className="rounded-2xl bg-slate-950 px-7 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-BLUE">
                  View All Courses
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={staggerContainer}
            className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
          >
            {COURSES.slice(0, 6).map((course, index) => (
              <motion.div
                key={`${course.courseName}-${index}`}
                variants={fadeUp}
                custom={index * 0.06}
              >
                <Link to={`/courses/${course.courseName.toLowerCase()}`}>
                  <div className="group h-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.courseName}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                      <p className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-sm font-black text-BLUE">
                        ${course.price}
                      </p>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-black text-slate-950">
                        {course.courseName}
                      </h3>
                      <p className="mt-2 font-bold text-BLUE">
                        {course.intro}
                      </p>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-slate-600">
                        {course.description}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-sm font-bold text-slate-500">
                          Learn more
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-BLUE text-white transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= CTA SECTION ========================= */}
      <section className="px-6 py-20 md:px-16 lg:px-24">
        <motion.div
          variants={fadeUp}
          className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-BLUE px-8 py-16 text-center text-white shadow-2xl shadow-blue-200 md:px-16"
        >
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/70">
            Ready to start?
          </p>
          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Get trained, build confidence and move closer to your tech career.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-white/80">
            Join mentorship or speak with us about building your next website,
            app or digital product.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/mentorship">
              <button className="w-full rounded-2xl bg-white px-8 py-4 font-black text-BLUE transition duration-300 hover:-translate-y-1 sm:w-auto">
                Book Mentorship
              </button>
            </Link>

            <Link to="/contact">
              <button className="w-full rounded-2xl border border-white/40 px-8 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-BLUE sm:w-auto">
                Contact Us
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ========================= TESTIMONIALS ========================= */}
      <section className="bg-slate-50 px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div variants={fadeUp}>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
              Testimonials
            </p>
            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              What Our Students Say
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12">
            <Splide
              options={{
                type: "loop",
                perPage: 1,
                autoplay: true,
                interval: 4500,
                speed: 1200,
                arrows: false,
                pagination: true,
              }}
            >
              <SplideSlide>
                <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                  <p className="text-2xl font-bold leading-10 text-slate-800 md:text-3xl">
                    “The mentorship helped me break into a Splunk Admin role
                    with confidence.”
                  </p>
                  <p className="mt-6 font-black text-BLUE">— Splunk Admin</p>
                </div>
              </SplideSlide>

              <SplideSlide>
                <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                  <p className="text-2xl font-bold leading-10 text-slate-800 md:text-3xl">
                    “From zero IT experience to job-ready. The labs and 1:1
                    sessions were game-changers.”
                  </p>
                  <p className="mt-6 font-black text-BLUE">
                    — Cybersecurity Analyst
                  </p>
                </div>
              </SplideSlide>

              <SplideSlide>
                <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
                  <p className="text-2xl font-bold leading-10 text-slate-800 md:text-3xl">
                    “Landed a SOC Analyst role in 7 weeks — coming from
                    customer service.”
                  </p>
                  <p className="mt-6 font-black text-BLUE">— SOC Analyst</p>
                </div>
              </SplideSlide>
            </Splide>
          </motion.div>
        </div>
      </section>

      {/* ========================= FAQ ========================= */}
      <section className="bg-white px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <motion.div variants={fadeUp} className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-BLUE">
              Questions
            </p>
            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={faq.question}
                variants={fadeUp}
                custom={index * 0.05}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:shadow-xl open:shadow-slate-100"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black text-slate-950">
                  {faq.question}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-BLUE transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 leading-8 text-slate-600">{faq.answer}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;


// import { Splide, SplideSlide } from "@splidejs/react-splide";
// import { useStateContext } from "../context/ContextProvider";
// import { Link } from "react-router-dom";
// import { Helmet } from "react-helmet";
// import { motion } from "framer-motion";
// import COURSES from "../coursesAPI/api";
// import LandingIMG from "../assets/images/landingIMG.png";

// // NEW images you should add
// import WebDev from "../assets/images/workplace-full (1).jpeg";
// import AppDev from "../assets/images/mobile.jpg";
// import UiUx from "../assets/images/oneone.jpeg";
// import Consulting from "../assets/images/make.jpeg";

// import "../../src/assets/css/pagination.css";

// const fadeIn = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0 },
// };

// const HomePage = () => {
//   const { FullScreen } = useStateContext();

//   return (
//     <motion.div initial="hidden" animate="visible" exit="exit">
//       <Helmet>
//         <title>T.O Analytics | Tech Training & Software Solutions</title>
//         <meta
//           name="description"
//           content="T.O Analytics offers world-class IT mentorship, Splunk training, cybersecurity, full-stack development education, and professional software services — including web development, mobile apps, UI/UX, and consulting."
//         />
//       </Helmet>

//       {/* ========================= HERO SECTION ========================= */}
//       <section className="bg-white px-6 md:px-16 py-28 md:py-40">
//         <div className="grid md:grid-cols-2 items-center gap-10">
//           <motion.div variants={fadeIn}>
//             <h1 className="text-4xl md:text-5xl font-black leading-tight text-BLUE">
//               Launch Your Tech Career <br />
//               & Build Real-World Skills
//             </h1>
//             <p className="mt-4 text-lg md:text-xl font-medium text-gray-700 max-w-xl">
//               From Splunk, Cybersecurity, Linux, and Cloud — to building real
//               software projects. Gain job-ready skills with our hands-on,
//               mentor-led programs.
//             </p>

//             <div className="flex gap-4 mt-8">
//               <Link to="/mentorship">
//                 <button className="bg-BLUE text-white px-6 py-3 rounded-xl hover:opacity-90 duration-300 text-lg font-semibold">
//                   Join Mentorship
//                 </button>
//               </Link>

//               <Link to="/courses">
//                 <button className="border-2 border-BLUE text-BLUE px-6 py-3 rounded-xl hover:bg-BLUE hover:text-white duration-300 text-lg font-semibold">
//                   Explore Courses
//                 </button>
//               </Link>
//             </div>
//           </motion.div>

//           <motion.div
//             className="hidden md:block"
//             initial={{ opacity: 0, scale: 0.7 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 1 }}
//           >
//             <img src={LandingIMG} className="w-full" />
//           </motion.div>
//         </div>
//       </section>

//       {/* ========================= SERVICES SECTION ========================= */}
//       <section className="py-20 bg-gray-50 px-6 md:px-20">
//         <h2 className="text-center text-3xl md:text-4xl font-black mb-12">
//           We Also Build Amazing Products
//         </h2>

//         <div className="grid md:grid-cols-4 gap-10">
//           {/* Web Development */}
//           <motion.div
//             variants={fadeIn}
//             className="bg-white rounded-2xl shadow-lg overflow-hidden"
//           >
//             <img src={WebDev} className="h-40 w-full object-cover" />
//             <div className="p-5">
//               <h3 className="text-xl font-bold">Web Development</h3>
//               <p className="text-gray-600 mt-2">
//                 Modern, scalable websites & web apps for businesses, startups
//                 and brands.
//               </p>
//             </div>
//           </motion.div>

//           {/* Mobile Apps */}
//           <motion.div
//             variants={fadeIn}
//             className="bg-white rounded-2xl shadow-lg overflow-hidden"
//           >
//             <img src={AppDev} className="h-40 w-full object-cover" />
//             <div className="p-5">
//               <h3 className="text-xl font-bold">Mobile App Development</h3>
//               <p className="text-gray-600 mt-2">
//                 Native & cross-platform apps that bring your ideas to life.
//               </p>
//             </div>
//           </motion.div>

//           {/* UI/UX */}
//           <motion.div
//             variants={fadeIn}
//             className="bg-white rounded-2xl shadow-lg overflow-hidden"
//           >
//             <img src={UiUx} className="h-40 w-full object-cover" />
//             <div className="p-5">
//               <h3 className="text-xl font-bold">UI / UX & Branding</h3>
//               <p className="text-gray-600 mt-2">
//                 Beautiful and intuitive designs that elevate user experience.
//               </p>
//             </div>
//           </motion.div>

//           {/* Consulting */}
//           <motion.div
//             variants={fadeIn}
//             className="bg-white rounded-2xl shadow-lg overflow-hidden"
//           >
//             <img src={Consulting} className="h-40 w-full object-cover" />
//             <div className="p-5">
//               <h3 className="text-xl font-bold">Tech Consulting</h3>
//               <p className="text-gray-600 mt-2">
//                 Personalized guidance for startups, companies & digital
//                 transformation.
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ========================= FEATURED COURSES ========================= */}
//       <section className="py-20 px-6 md:px-16">
//         <h2 className="text-center text-3xl md:text-4xl font-black">
//           Our Most Popular Courses
//         </h2>

//         <div className="grid md:grid-cols-3 gap-8 mt-12">
//           {COURSES.slice(0, 6).map((course, index) => (
//             <Link key={index} to={`/courses/${course.courseName.toLowerCase()}`}>
//               <div className="bg-white shadow-lg rounded-2xl overflow-hidden hover:scale-[1.02] duration-300">
//                 <img src={course.image} className="h-48 w-full object-cover" />

//                 <div className="p-5 bg-BLUE text-white">
//                   <h3 className="text-2xl font-bold">{course.courseName}</h3>
//                   <p className="my-2 font-semibold">{course.intro}</p>
//                   <p className="text-sm opacity-80">{course.description}</p>
//                   <p className="font-bold text-xl mt-4">${course.price}</p>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         <div className="text-center mt-10">
//           <Link to="/courses">
//             <button className="bg-BLUE text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-80">
//               View All Courses
//             </button>
//           </Link>
//         </div>
//       </section>

//       {/* ========================= TESTIMONIALS ========================= */}
//       <section className="py-16 bg-white">
//         <h2 className="text-center text-3xl md:text-4xl font-black mb-10">
//           What Our Students Say
//         </h2>

//         <Splide
//           className="px-6 md:px-56"
//           options={{
//             type: "loop",
//             perPage: 1,
//             autoplay: true,
//             interval: 4000,
//             arrows: false,
//             pagination: true,
//           }}
//         >
//           <SplideSlide>
//             <p className="text-center text-lg md:text-2xl font-semibold">
//               “The mentorship helped me break into a Splunk Admin role with
//               confidence.”
//             </p>
//             <p className="text-center font-bold mt-2 text-BLUE">
//               — Splunk Admin
//             </p>
//           </SplideSlide>

//           <SplideSlide>
//             <p className="text-center text-lg md:text-2xl font-semibold">
//               “From zero IT experience to job-ready in 5 weeks. The labs were
//               game-changers.”
//             </p>
//             <p className="text-center font-bold mt-2 text-BLUE">
//               — Cybersecurity Analyst
//             </p>
//           </SplideSlide>

//           <SplideSlide>
//             <p className="text-center text-lg md:text-2xl font-semibold">
//               “Landed a SOC Analyst role in 7 weeks — coming from customer
//               service!”
//             </p>
//             <p className="text-center font-bold mt-2 text-BLUE">
//               — SOC Analyst
//             </p>
//           </SplideSlide>
//         </Splide>
//       </section>

//       {/* ========================= FAQ ========================= */}
//       <section className="bg-gray-100 py-16 px-6 md:px-16">
//         <h2 className="text-center text-3xl md:text-4xl font-black mb-10">
//           Frequently Asked Questions
//         </h2>

//         <div className="max-w-3xl mx-auto space-y-6 text-gray-700">
//           <div>
//             <h4 className="font-bold">How long until I'm job-ready?</h4>
//             <p>Most mentees are job-ready in 14 weeks.</p>
//           </div>
//           <div>
//             <h4 className="font-bold">What if I miss a session?</h4>
//             <p>You can reschedule or get asynchronous review.</p>
//           </div>
//           <div>
//             <h4 className="font-bold">Do you help with certifications?</h4>
//             <p>Yes — Splunk, Cybersecurity, Linux & more.</p>
//           </div>
//           <div>
//             <h4 className="font-bold">I'm new to IT. Can I join?</h4>
//             <p>Absolutely! Our mentorship is beginner-friendly.</p>
//           </div>
//         </div>
//       </section>
//     </motion.div>
//   );
// };

// export default HomePage;

// // import { Splide, SplideSlide } from '@splidejs/react-splide';
// // import { useStateContext } from "../context/ContextProvider"
// // import "../../src/assets/css/pagination.css"
// // import { Link } from 'react-router-dom';
// // import LandingIMG from "../assets/images/landingIMG.png"
// // import eInstructor from "../assets/images/e-instructor.jpg"
// // import hLearning from "../assets/images/h-learning.jpg"
// // import flexibleLearning from "../assets/images/flexible-learning.jpg"
// // import guidance from "../assets/images/guidance.jpg";
// // import student1 from "../assets/images/student1.png"
// // import student2 from "../assets/images/student2.png"
// // import student3 from "../assets/images/student3.jpeg"
// // import COURSES from "../coursesAPI/api"
// // import { FaQuoteLeft } from "react-icons/fa";
// // import { Helmet } from 'react-helmet';
// // import { backInOut, motion } from "framer-motion"
// // import { LandingSpike, RectangleLeft, RectangleRight } from '../components/BgDesigns';

// // const home = {
// //     hidden: {
// //         opacity: 0,
// //     },
// //     visible: {
// //         opacity: 1,
// //         transition: {
// //             ease: backInOut, duration: 2, staggerChildren: .5, delayChildern: 1.2
// //         }
// //     },
// //     exit: {
// //         x: "-100vw"
// //     }
// // }

// // const landingContainer = {
// //     hidden: {
// //         opacity: 0
// //     },
// //     visible: {
// //         opacity: 1,
// //         transition: {
// //             staggerChildren: 1, delayChildern: 1
// //         }
// //     }
// // }

// // const h1 = {
// //     hidden: {
// //         opacity: 0,
// //         x: "-150px"
// //     },
// //     visible: {
// //         opacity: 1,
// //         x: 0
// //     }
// // }

// // const p = {
// //     hidden: {
// //         opacity: 0,
// //         y: "-150px"
// //     },
// //     visible: {
// //         opacity: 1,
// //         y: 0
// //     }
// // }

// // const buttonContainer = {
// //     hidden: {
// //         opacity: 1
// //     },
// //     visible: {
// //         opacity: 1,
// //         transition: {
// //             duration: 1, staggerChildren: .5, delayChildern: 1.2
// //         }
// //     }
// // }

// // const button = {
// //     hidden: {
// //         x: "-100px",
// //         opacity: 0,
// //     },
// //     visible: {
// //         x: 0,
// //         opacity: 1,
// //     }
// // }

// // const HomePage = () => {
// //     const { FullScreen } = useStateContext()
// //     return (
// //         <motion.div variants={home} exit="exit">
// //             <Helmet>
// //                 <meta charSet="utf-8" />
// //                 <title>To-analytics</title>
// //                 <link rel="canonical" href="https://www.to-analytics.com" />
// //                 <meta name="description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
// //                 <meta property="og:description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
// //             </Helmet>
// //             <section className="landing-page px-6 md:px-10 py-60 md:py-32 bg-white min-h-screen">
// //                 <motion.div className="grid md:grid-cols-2 items-center gap-10">
// //                     <motion.div variants={landingContainer} initial="hidden" animate="visible">
// //                         <motion.h1
// //                             variants={h1}
// //                             className="my-4 md:my-7 font-semibold md:font-bold text-4xl md:text-5xl LANDING-TEXT"
// //                         >
// //                             Break into Cybersecurity / Splunk in 14 Weeks with 1-on-1 Mentorship
// //                         </motion.h1>
// //                         <motion.p variants={p} className="font-medium md:font-bold text-2xl md:text-xl my-4">Step into the exciting realm of technology  through our cutting-edge courses and solutions.</motion.p>
// //                         <motion.div variants={buttonContainer} initial="hidden" animate="visible" className="flex gap-2 md:gap-3">
// //                             <motion.div variants={button}>
// //                                 <Link to="/mentorship">
// //                                     <button className="text-base md:text-xl font-medium border-2 border-BLUE text-BLUE hover:text-white hover:bg-BLUE px-3 py-4 md:px-4 md:py-3 rounded-xl md:rounded-3xl duration-300">Book Mentorship</button>
// //                                 </Link>
// //                             </motion.div>
// //                             <motion.div variants={button}>
// //                                 <Link to="/liveCourses">
// //                                     <button className="text-base md:text-xl font-medium border-2 border-BLUE bg-BLUE text-white hover:bg-white hover:text-BLUE px-3 py-4 md:px-4 md:py-3 rounded-xl md:rounded-3xl duration-300">Live Courses</button>
// //                                 </Link>
// //                             </motion.div>
// //                         </motion.div>
// //                     </motion.div>
// //                     <div className="relative hidden md:block">
// //                         <motion.div initial={{ opacity: 0, rotate: "180deg" }} animate={{ opacity: 1, rotate: "0deg" }} transition={{ ease: backInOut, duration: 1, delay: 1.5 }} className="bg-BLUE landingDIV"></motion.div>
// //                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-0 left-0 right-0">
// //                             <img src={LandingIMG} className="w-full" alt="" />
// //                         </motion.div>
// //                     </div>
// //                 </motion.div>
// //                 <motion.div initial={{ scale: 0, opacity: 0, rotate: "180deg" }} animate={{ scale: 1, opacity: 0.3, rotate: "0deg" }} transition={{ ease: backInOut, duration: 1, delay: 1.5 }} className='mobile-landingDIV md:hidden block absolute top-40 left-0 translate-y-[-50%] bg-BLUE landingDIV backdrop-blur-2xl'></motion.div>
// //                 {FullScreen && <LandingSpike />}
// //             </section>

// //             <section className="md:pb-20 bg-transparent relative z-[10] min-h-fit">
// //                 <h1 data-aos-once="true" data-aos-duration="6000" data-aos="fade-up" className="text-center font-black text-2xl md:text-4xl my-4">Why Trust T.O Analytics?</h1>
// //                 <div className="md:px-10 p-4 overflow-x-hidden">
// //                     <div className="md:text-left md:pb-10 md:py-2 grid grid-cols-1 md:grid-cols-2 items-center md:gap-20">
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className='relative'>
// //                             <p className="uppercase font-black text-BLUE my-2">Learn from industry’s best</p>
// //                             <h1 className="font-bold text-2xl md:text-2xl my-2">Experienced Instructors</h1>
// //                             <p className="font-medium text-base">Our instructors are seasoned professionals with extensive experience in diverse areas of the tech industry. They leverage their deep expertise and real-world project insights to deliver practical, actionable guidance in the classroom.</p>
// //                             <RectangleLeft />
// //                         </div>
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className="md:block">
// //                             <img src={eInstructor} alt="" className='w-fit p-14 md:p-0' />
// //                         </div>
// //                     </div>
// //                     <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className="md:block order-2 md:order-1">
// //                             <img src={hLearning} alt="" className='w-fit p-14 md:p-0' />
// //                         </div>
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className='relative order-1 md:order-2'>
// //                             <p className="uppercase font-black text-BLUE my-2">Fine blend of theory and practice</p>
// //                             <h1 className="font-bold text-2xl md:text-2xl my-2">Hands-on learning</h1>
// //                             <p className="font-medium text-base"> Our bootcamp, built around hands-on learning, immerses students in real-world scenarios through projects and practical exercises. This approach helps them gain invaluable experience, develop essential tech skills like problem-solving, collaboration, and critical thinking, and master coding languages like Python by building real-world web applications. Join our bootcamp today and start your journey towards a rewarding tech career.</p>
// //                             <RectangleRight />
// //                         </div>
// //                     </div>
// //                     <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className='relative'>
// //                             <p className="uppercase font-black text-BLUE my-2">We put you first</p>
// //                             <h1 className="font-bold text-2xl md:text-2xl my-2">Flexible learning Options</h1>
// //                             <p className="font-medium text-base">We understand that everyone has different schedules and commitments. That&apos;s why we offer flexible learning options, including part-time and full-time programs, as well as online learning options. This allows students to choose a schedule that works best for them while still receiving high-quality education.</p>
// //                             <RectangleLeft />
// //                         </div>
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className="md:block">
// //                             <img src={flexibleLearning} alt="" className='w-fit p-14 md:p-0' />
// //                         </div>
// //                     </div>
// //                     <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className="md:block order-2 md:order-1">
// //                             <img src={guidance} alt="" className='w-fit p-14 md:p-0' />
// //                         </div>
// //                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className='relative order-1 md:order-2'>
// //                             <p className="uppercase font-black text-BLUE my-2">From clueless to pro</p>
// //                             <h1 className="font-bold text-2xl md:text-2xl my-2">Career guidance</h1>
// //                             <p className="font-medium text-base">We provide comprehensive career guidance and support to help students transition into the tech industry. This includes resume building, interview preparation, job search strategies, and networking opportunities. Our goal is to equip students with the necessary skills and resources to succeed in their tech careers.</p>
// //                             <RectangleRight />
// //                         </div>
// //                     </div>
// //                 </div>
// //             </section>

// //             <section className="relative courses p-4 md:p-10">
// //                 <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-y-4 gap-x-2">
// //                     {COURSES.map((course, index) => index < 6 && (
// //                         <Link key={index} to={`/courses/${course.courseName.toLowerCase()}`} className="">
// //                             <div
// //                                 className={`rounded-xl`}
// //                                 data-aos-once="true"
// //                                 data-aos-duration="5000"
// //                                 data-aos="fade-up"
// //                             >
// //                                 <div className="rounded-tr-2xl rounded-tl-2xl">
// //                                     <img
// //                                         src={course.image}
// //                                         className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
// //                                         alt=""
// //                                     />
// //                                 </div>
// //                                 <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
// //                                     <p className="font-bold text-white text-lg md:my-4 md:text-3xl line-clamp-1 lg:line-clamp-2">{course.courseName}</p>
// //                                     <p className="my-2 font-bold text-sm h-[40px] md:h-auto">{course.intro}</p>
// //                                     <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
// //                                         {course.description}
// //                                     </p>
// //                                     <p className="font-bold my-5 text-lg md:text-xl">${course.price}</p>
// //                                 </div>
// //                             </div>
// //                         </Link>
// //                     ))}
// //                 </div>
// //                 <div className="py-10 text-center">
// //                     <Link to="/courses" className="">
// //                         <button className="text-base md:text-lg font-normal bg-BLUE hover:bg-transparent hover:text-BLUE duration-300 hover:outline-2 outline hover:outline-BLUE text-white rounded-md md:rounded-2xl px-4 py-4 md:px-7 md:py-3">View All Courses</button>
// //                     </Link>
// //                 </div>
// //                 <div className='mobile-landingDIV md:hidden block absolute bottom-0 left-0 bg-BLUE landingDIV'></div>
// //             </section>

// //             <section className="relative bg-white py-16 md:py-12 overflow-hidden">
// //                 <LandingSpike />
// //                 <h1 className="my-2 md:my-8 text-center font-bold text-xl md:text-4xl">Here’s what our students are saying</h1>
// //                 <FaQuoteLeft className='mx-auto' size={FullScreen ? 30 : 20} color='#2d2065' />
// //                 <Splide className='splide pb-8 md:pb-12 px-5 md:px-44' aria-label="Testimonials" options={{
// //                     type: 'loop',
// //                     perPage: 1,
// //                     perMove: 1,
// //                     autoplay: true,
// //                     interval: 4000,
// //                     speed: 2000,
// //                     arrows: false,
// //                     pagination: true,
// //                     drag: 'free',
// //                     snap: true,
// //                 }}>

// //                     <SplideSlide>
// //                         <div className="md:w-[80%] mx-auto">
// //                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">The mentorship helped me break into Splunk Admin role with confidence..</p>
// //                             <div className="flex items-center justify-center gap-1 md:gap-3">
// //                                 {/* <img src={student3} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
// //                                 <p className="font-bold text-sm md:text-2xl">Splunk Admin</p>
// //                             </div>
// //                         </div>
// //                     </SplideSlide>

// //                     <SplideSlide>
// //                         <div className="md:w-[80%] mx-auto">
// //                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">From zero IT experience to job-ready in 5 weeks. The labs and 1:1 sessions were game-changers.</p>
// //                             <div className="flex items-center justify-center gap-1 md:gap-3">
// //                                 {/* <img src={student1} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
// //                                 <p className="font-bold text-sm md:text-2xl">Cybersecurity Analyst</p>
// //                             </div>
// //                         </div>
// //                     </SplideSlide>
// //                     <SplideSlide>
// //                         <div className="md:w-[80%] mx-auto">
// //                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">Landed a SOC Analyst role in just 7 weeks — coming from customer service!</p>
// //                             <div className="flex items-center justify-center gap-1 md:gap-3">
// //                                 {/* <img src={student2} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
// //                                 <p className="font-bold text-sm md:text-2xl">SOC Analyst</p>
// //                             </div>
// //                         </div>
// //                     </SplideSlide>
// //                     <SplideSlide>
// //                         <div className="md:w-[80%] mx-auto">
// //                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">The mentorship helped me break into Splunk Admin role with confidence..</p>
// //                             <div className="flex items-center justify-center gap-1 md:gap-3">
// //                                 {/* <img src={student3} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
// //                                 <p className="font-bold text-sm md:text-2xl">Splunk Admin</p>
// //                             </div>
// //                         </div>
// //                     </SplideSlide>
// //                 </Splide>
// //                 {/* <FaQuoteRight className='mx-auto' size={30} /> */}
// //             </section>
// //             <section className="p-4 md:p-10 bg-gray-100">
// //                 <h2 className="text-center text-2xl md:text-4xl font-bold mb-8">
// //                     Frequently Asked Questions
// //                 </h2>
// //                 <div className="max-w-3xl mx-auto space-y-6 text-gray-700 text-sm md:text-base">
// //                     <div>
// //                         <h4 className="font-semibold">
// //                             How long until I’m job-ready?
// //                         </h4>
// //                         <p>Most mentees become job-ready within 14 weeks depending on prior experience.</p>
// //                     </div>
// //                     <div>
// //                         <h4 className="font-semibold">
// //                             What if I miss a session?
// //                         </h4>
// //                         <p>You can reschedule or receive a bonus asynchronous review that week.</p>
// //                     </div>
// //                     <div>
// //                         <h4 className="font-semibold">
// //                             Do you help with Splunk certifications?
// //                         </h4>
// //                         <p>Yes! We provide certification guidance and practice labs.</p>
// //                     </div>
// //                     <div>
// //                         <h4 className="font-semibold">
// //                             I’m new to IT — am I eligible?
// //                         </h4>
// //                         <p>Absolutely. The mentorship is beginner-friendly and personalized to your pace.</p>
// //                     </div>
// //                     <div>
// //                         <h4 className="font-semibold">
// //                             Do you offer refunds?
// //                         </h4>
// //                         <p>Yes, we offer deferral or partial refund options if mentorship is canceled early.</p>
// //                     </div>
// //                 </div>
// //             </section>
// //         </motion.div>
// //     )
// // }

// // export default HomePage