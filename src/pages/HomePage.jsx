import { useEffect, useState } from "react";
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
  const [showSplunkPopup, setShowSplunkPopup] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplunkPopup(false);
    }, 120000);

    return () => window.clearTimeout(timer);
  }, []);

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
          content="T.O Analytics offers practical tech training, software solutions and a new Beta 1 paper-trading simulator for risk-free stock market practice."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* ========================= SPLUNK BETA POPUP ========================= */}
      {showSplunkPopup && (
        <motion.aside
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-5 left-4 right-4 z-[9999] sm:left-auto sm:right-6 sm:w-[430px]"
          role="dialog"
          aria-label="Splunk Simulator Beta 1 announcement"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 bg-slate-950 p-6 text-white shadow-2xl shadow-blue-950/30">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-[60px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-600/20 blur-[70px]" />

            <button
              type="button"
              onClick={() => setShowSplunkPopup(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              aria-label="Close Splunk Simulator announcement"
            >
              ×
            </button>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">
                  New · Beta 1
                </span>
              </div>

              <h3 className="mt-5 pr-8 text-2xl font-black leading-tight sm:text-3xl">
                Try Our Splunk Simulator
              </h3>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
                Practice Splunk with realistic security investigations, guided
                missions and hands-on SPL challenges.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Realistic Events", "Guided Missions", "Instant Feedback"].map(
                  (feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-200"
                    >
                      ✓ {feature}
                    </span>
                  ),
                )}
              </div>

              <Link
                to="/toskillab/lab"
                onClick={() => setShowSplunkPopup(false)}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-black text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Try Splunk Simulator
                <span className="ml-2 text-lg" aria-hidden="true">
                  →
                </span>
              </Link>

              <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Beta 1 · T.O Analytics Learning Lab
              </p>
            </div>
          </div>
        </motion.aside>
      )}

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
{/* ========================= SPLUNK SIMULATOR ANNOUNCEMENT ========================= */}
<section className="bg-white px-6 pb-12 md:px-16 lg:px-24">
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.25 }}
    className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-blue-950 to-BLUE p-8 text-white shadow-2xl shadow-blue-200 md:p-12"
  >
    {/* Decorative background */}
    <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-[80px]" />
    <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-blue-400/20 blur-[90px]" />
    <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
            New · Beta 1
          </span>
        </div>
        <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
          Try the Splunk Simulator
        </h2>
        <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-300 md:text-lg">
          Put your Splunk skills to the test with realistic investigation
          scenarios, guided missions and hands-on SPL challenges.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            "Realistic security events",
            "Guided SPL missions",
            "Instant feedback",
          ].map((feature) => (
            <span
              key={feature}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200"
            >
              ✓ {feature}
            </span>
          ))}
        </div>
      </div>
      <Link
        to="/toskillab/lab"
        className="inline-flex w-full shrink-0 items-center justify-center rounded-2xl bg-white px-7 py-4 font-black text-BLUE shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 lg:w-auto"
      >
        Try Splunk Simulator
        <span className="ml-3 text-xl" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  </motion.div>
</section>
      {/* ========================= BETA 1 TRADING FEATURE ========================= */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white md:px-16 lg:px-24">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-BLUE/20 blur-[100px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-[100px]" />
        <motion.div
          variants={fadeUp}
          className="relative mx-auto grid max-w-7xl items-center gap-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl md:p-12 lg:grid-cols-[1.1fr_.9fr]"
        >
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2">
              <span className="rounded-full bg-cyan-300 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950">
                Beta 1
              </span>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                New feature now live
              </span>
            </div>
            <h2 className="mt-6 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
              Learn the market by actually trading.
            </h2>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-300">
              Explore U.S. stocks, place virtual trades and track your portfolio
              with $100,000 in virtual buying power—without risking real money.
            </p>
            <Link
              to="/trading-simulator"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 font-black text-white shadow-xl shadow-blue-950/40 transition duration-300 hover:-translate-y-1"
            >
              Try Trading Simulator
              <span className="ml-3 text-xl" aria-hidden="true">→</span>
            </Link>
            <p className="mt-4 max-w-xl text-xs leading-5 text-slate-500">
              For educational use only. The simulator does not execute real trades
              or provide financial advice.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#071126] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                T.O Trading Lab
              </p>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-500">
              Starting account value
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              $100,000.00
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                ["📈", "Market prices"],
                ["💼", "Portfolio"],
                ["🎯", "Risk-free"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <p className="mt-2 text-xs font-bold text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
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
