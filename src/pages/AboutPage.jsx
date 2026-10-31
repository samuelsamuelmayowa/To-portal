import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Compass,
  GraduationCap,
  Layers3,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import about1 from "../assets/images/about1.png";
import about2 from "../assets/images/about2.jpg";
import about3 from "../assets/images/about3.png";
import about4 from "../assets/images/about4.png";

const rise = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const strengths = [
  {
    title: "Practical from day one",
    description:
      "Learning is anchored in exercises, hands-on labs, and scenarios that connect technical concepts to real tasks.",
    Icon: Code2,
  },
  {
    title: "Support that helps you grow",
    description:
      "Structured instruction and mentorship help learners develop understanding, ask better questions, and make steady progress.",
    Icon: Compass,
  },
  {
    title: "Skills with a purpose",
    description:
      "We focus on the skills and professional habits used to solve problems in modern technology environments.",
    Icon: ShieldCheck,
  },
];

const approach = [
  {
    number: "01",
    title: "Understand",
    description:
      "Start with clear fundamentals and learn how the tools and concepts work together.",
  },
  {
    number: "02",
    title: "Practice",
    description:
      "Use guided labs, exercises, and realistic examples to strengthen your technical skills.",
  },
  {
    number: "03",
    title: "Apply",
    description:
      "Build projects, improve your problem-solving, and prepare to communicate what you know.",
  },
  {
    number: "04",
    title: "Keep growing",
    description:
      "Continue developing through feedback, personal practice, and career-focused learning.",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <Helmet>
        <title>About T.O Analytics | Tech Training & Software Solutions</title>
        <meta
          name="description"
          content="Discover T.O Analytics: practical Splunk, cybersecurity, Linux and cloud training, career-focused mentorship, and professional website, app and software development services."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.to-analytics.com/about" />
        <meta
          property="og:title"
          content="About T.O Analytics | Practical Learning & Digital Solutions"
        />
        <meta
          property="og:description"
          content="Learn about our mission, hands-on technology training, and digital product development services."
        />
        <meta property="og:url" content="https://www.to-analytics.com/about" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ========================= ABOUT HERO ========================= */}
      <section className="relative overflow-hidden px-6 pb-24 pt-32 md:px-16 lg:px-24 lg:pb-32">
        <div className="pointer-events-none absolute -left-32 -top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-[110px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-100/60 blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div initial="hidden" animate="visible" variants={rise}>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-BLUE" />
              <span className="text-xs font-black uppercase tracking-[0.18em] text-BLUE">
                Get to know T.O Analytics
              </span>
            </div>
            <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
              Practical learning.{" "}
              <span className="text-BLUE">Real-world technology.</span>{" "}
              Lasting possibilities.
            </h1>
            <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-slate-600">
              T.O Analytics brings together technology education, professional
              mentorship, and software development. We help people build useful
              skills and help organizations turn digital ideas into working products.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-BLUE px-7 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200 focus:outline-none focus:ring-2 focus:ring-BLUE focus:ring-offset-2"
              >
                Explore Training
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 font-black text-slate-900 transition duration-300 hover:-translate-y-1 hover:border-BLUE hover:text-BLUE focus:outline-none focus:ring-2 focus:ring-BLUE focus:ring-offset-2"
              >
                Work With Us
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-11 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <GraduationCap className="text-BLUE" size={25} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold leading-6 text-slate-700">
                  Training built around practice
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Layers3 className="text-BLUE" size={25} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold leading-6 text-slate-700">
                  Digital solutions built with purpose
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 rotate-2 rounded-[3rem] bg-blue-100/60" />
            <div className="relative grid grid-cols-2 gap-3 rounded-[2.5rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200">
              <img
                src={about1}
                alt="T.O Analytics visual gallery, first image"
                className="h-44 w-full rounded-3xl object-cover sm:h-56"
                loading="lazy"
              />
              <img
                src={about2}
                alt="T.O Analytics visual gallery, second image"
                className="mt-6 h-44 w-full rounded-3xl object-cover sm:h-56"
                loading="lazy"
              />
              <img
                src={about3}
                alt="T.O Analytics visual gallery, third image"
                className="h-44 w-full rounded-3xl object-cover sm:h-56"
                loading="lazy"
              />
              <img
                src={about4}
                alt="T.O Analytics visual gallery, fourth image"
                className="mt-6 h-44 w-full rounded-3xl object-cover sm:h-56"
                loading="lazy"
              />
              <div className="absolute bottom-8 left-6 right-6 rounded-2xl border border-white/50 bg-slate-950/90 px-6 py-5 text-white shadow-xl backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                  What drives us
                </p>
                <p className="mt-1 text-lg font-black">
                  Learn with purpose. Build with confidence.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= MISSION ========================= */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white md:px-16 lg:px-24">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={rise}
            className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-20"
          >
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-sky-300">
                Our mission
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                Making technology more practical and approachable.
              </h2>
            </div>
            <div className="flex flex-col justify-center space-y-5 text-lg font-medium leading-9 text-slate-300">
              <p>
                We believe technology education should go beyond memorizing
                concepts. Learners deserve opportunities to practice with tools,
                understand how systems work, and develop the confidence to solve
                real problems.
              </p>
              <p>
                That same practical mindset shapes our software work: listening
                closely, designing thoughtfully, and building digital experiences
                that meet genuine needs.
              </p>
            </div>
          </motion.div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {strengths.map(({ title, description, Icon }, index) => (
              <motion.article
                key={title}
                variants={rise}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-BLUE">
                  <Icon size={25} aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                  {description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= WHAT WE DO ========================= */}
      <section className="bg-slate-50 px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={rise}
            className="max-w-3xl"
          >
            <p className="text-sm font-black uppercase tracking-[0.25em] text-BLUE">
              What we do
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Two areas of focus. One commitment to doing things well.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              Whether you are building your own skills or building something for
              your business, our work is guided by clarity, quality, and practical value.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-7 lg:grid-cols-2">
            <motion.article
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={rise}
              className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-BLUE">
                <BookOpen size={28} aria-hidden="true" />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-BLUE">
                Technology education
              </p>
              <h3 className="mt-2 text-3xl font-black">Training & Mentorship</h3>
              <p className="mt-4 text-base font-medium leading-8 text-slate-600">
                Hands-on learning experiences designed to connect fundamentals
                with professional practice.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Splunk", "Cybersecurity", "Linux", "Cloud", "Data", "Stocks & Options Education"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to="/courses"
                className="mt-auto inline-flex items-center gap-3 pt-10 font-black text-BLUE hover:underline focus:outline-none focus:underline"
              >
                Explore Courses
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </motion.article>

            <motion.article
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={rise}
              className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <BriefcaseBusiness size={28} aria-hidden="true" />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-BLUE">
                Digital product services
              </p>
              <h3 className="mt-2 text-3xl font-black">Software & Consulting</h3>
              <p className="mt-4 text-base font-medium leading-8 text-slate-600">
                Design, development, and technical guidance for organizations
                bringing ideas to life.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Websites", "Mobile Apps", "UI / UX Design", "Dashboards", "Product Consulting"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to="/contact"
                className="mt-auto inline-flex items-center gap-3 pt-10 font-black text-BLUE hover:underline focus:outline-none focus:underline"
              >
                Discuss a Project
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </motion.article>
          </div>
        </div>
      </section>

      {/* ========================= OUR APPROACH ========================= */}
      <section className="bg-white px-6 py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={rise}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-BLUE">
              <Lightbulb size={28} aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-BLUE">
              Our approach to learning
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Built around doing, not just watching.
            </h2>
            <p className="mt-5 text-lg font-medium leading-8 text-slate-600">
              Clear fundamentals, practical exercises, and continued development
              are at the heart of our learning experience.
            </p>
          </motion.div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {approach.map((step) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={rise}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <span className="text-5xl font-black tracking-tight text-blue-100">
                  {step.number}
                </span>
                <h3 className="mt-6 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= FINAL NEXT STEP ========================= */}
      <section className="bg-slate-50 px-6 pb-24 pt-8 md:px-16 lg:px-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={rise}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-blue-950 to-BLUE px-8 py-14 text-white md:px-12 lg:px-16"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-[80px]" />
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">
                Learn. Create. Grow.
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                Your next chapter deserves a practical starting point.
              </h2>
              <p className="mt-4 text-base font-medium leading-8 text-slate-200">
                Explore our courses, or talk with us about a website, app, or
                software solution for your organization.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-BLUE transition hover:-translate-y-1 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                View Courses
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                Contact Us
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

// import { useRef } from "react";
// import { Helmet } from "react-helmet";
// import about1 from "../assets/images/about1.png"
// import about2 from "../assets/images/about2.jpg"
// import about3 from "../assets/images/about3.png"
// import about4 from "../assets/images/about4.png"
// import client from "../assets/images/client.png"
// import { motion, useScroll, useInView, backInOut } from "framer-motion";
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css'

// const container = {
//     hidden: { opacity: 1, scale: 0 },
//     visible: {
//         opacity: 1,
//         scale: 1,
//         transition: {
//             delayChildren: 0.2,
//             staggerChildren: 0.5
//         }
//     }
// }

// const image = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//         y: 0,
//         opacity: 1
//     }
// }

// const h1 = {
//     hidden: { x: "-40px", opacity: 0 },
//     visible: {
//         x: 0,
//         opacity: 1
//     }
// }
//  const p = {
//     hidden: { y: "-80px", opacity: 0 },
//     visible: {
//         y: 0,
//         opacity: 1
//     }
//  }


// const AboutPage = () => {
//     const targetRef = useRef(null)
//     const clientRef = useRef(null)
//     const isInView = useInView(clientRef, { once: true})
//     const { scrollYProgress } = useScroll({
//         target: targetRef,
//         offset: ["0 1", "1.1 1"],
//     })
//     // const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
//     // const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
//     // const transformX = useTransform(scrollYProgress, [0, 0.5], ["100px", 0]);
//     return (
//         <>
            
//             <section className="relative z-10 px-5 pt-24 pb-10 md:py-20 md:px-10 bg-white border-red-500">
//             <Helmet>
//                 <meta charSet="utf-8" />
//                     <title>About </title>
//                 <meta name="keywords" content="splunk , photography, stock , Linux, Data Science"/>
//                 <link rel="canonical" href="https://www.to-analytics.com/about" />
//                 <meta name="description" content="Learn about T.O Analytics and our mission to make practical technology education, cybersecurity training and career development accessible." />
//                 <meta property="og:title" content="About T.O Analytics | Practical Technology Education" />
//                 <meta property="og:description" content="Learn about T.O Analytics and our mission to make practical technology education, cybersecurity training and career development accessible." />
//             </Helmet>
//                 <motion.div variants={container} initial="hidden" animate="visible" className="md:py-8 bg-white z-20">
//                     <motion.h1 variants={h1} className="OUR-MISSION md:font-black my-4 md:my-8 font-bold text-3xl md:text-4xl">Our Mission</motion.h1>
//                     <motion.p variants={p} className="w-full md:w-1/2 font-normal md:font-medium text-sm md:text-base my-3">At T.O Analytics, our mission is to empower students with the essential tech skills, focusing on the field of Cybersecurity. We understand the importance of cybersecurity in today’s digital world, protecting the individuals and organizations from cyber threats. </motion.p>
//                 </motion.div>
//                 <motion.div initial={{scale: 0, opacity:0, rotate: "90deg"}} animate={{scale: 1, opacity:0.3, rotate:"0deg"}} transition={{ease:backInOut, duration: 1,delay: 1.5}} className='block absolute top-0 left-0 bg-BLUE landingDIV'></motion.div>
//             </section>
//             <motion.section ref={targetRef} className="relative z-10 px-5 py-14 md:px-10 bg-white font-bold">
//                 <div className="grid gap-10 grid-cols-1 md:grid-cols-2 items-center">
//                     <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 relative">
//                         <motion.div variants={image}>
//                             <LazyLoadImage effect="blur" src={about1} className="rounded-xl" alt="" />
//                         </motion.div>
//                         <motion.div variants={image}>
//                             <LazyLoadImage effect="blur" src={about2} className="rounded-xl" alt="" />
//                         </motion.div>
//                         <motion.div variants={image}>
//                             <LazyLoadImage effect="blur" src={about3} className="rounded-xl" alt="" />
//                         </motion.div>
//                         <motion.div variants={image}>
//                             <LazyLoadImage effect="blur" src={about4} className="rounded-xl" alt="" />
//                         </motion.div>
//                     </motion.div>
//                     <motion.div>
//                         <h1 className="ABOUT-US my-5 font-black text-3xl md:text-4xl">About Us</h1>
//                         <p className="my-5 font-normal md:font-medium text-sm md:text-base">We are a leading tech institute dedicated to equipping the student with the skills they need to thrive in the ever-evolving world of technology. With a strong focus on cybersecurity, we offer  comprehensive training programs that empower our students to become experts in protecting digital assets.</p>
//                         <p className="my-5 font-normal md:font-medium text-sm md:text-base">We are committed to fostering a supportive and collaborative learning environment. Our instructors are passionate about helping students succeed and providing them with the guidance and they need to reach their full potential. We prioritize individual and organizations and offer personalized attention to ensure that each student’s unique goals are met.</p>
//                     </motion.div>
//                 </div>
//             </motion.section>
//             <motion.section ref={clientRef} initial={{scale: 0}} transition={{duration: 0.5}} style={{scale: isInView ? 1 : 0,transition: "400ms"}} className={`relative z-10 bg-BLUE py-2 md:py-8`}>
//                 {/* <div className="text-white rounded-lg border-[1px] border-PURPLE mx-2 md:mx-10 grid grid-cols-1 lg:grid-cols-2">
//   <div className="flex justify-center items-center">
//     <div className="p-4">
//       <img src={client} className="w-[450px] md:border-[1px] border-PURPLE rounded-2xl" alt="" />
//       <div className="text-center">
//         <p className="font-medium my-2 md:text-2xl">Tomide Olulana</p>
//         <p className="text-lg md:text-xl my-2">CEO</p>
//       </div>
//     </div>
//   </div>
//   <div className="about-me border-PURPLE text-sm md:text-base font-extralight md:font-medium px-4 md:px-6 py-4 md:py-8">
//     <p className="my-2 md:my-6">
//       Tomide Olulana is a passion-driven Nigerian-American business magnate, cybersecurity architect, big data developer, real estate investor, financial strategist, and educator based in the United States. With years of experience in stock and options trading, real estate investing, and mentorship, Tomide is committed to helping individuals build wealth, acquire valuable skills, and unlock their full potential.
//     </p>
//     <p className="my-2 md:my-6">
//       He earned his Master of Science in Applied Economics from the University of Maryland, College Park and began his career as a Financial Analyst and Asset Manager in the transportation industry. Today, he serves as a Cybersecurity Architect and Big Data Developer, specializing in Splunk engineering, advanced data analytics, and enterprise security solutions. In this role, he leads and mentors a talented team of developers, building secure, scalable, and data-driven systems.
//     </p>
//     <p className="my-2 md:my-6">
//       Beyond his professional career, Tomide is a successful entrepreneur and the Founder & CEO of several thriving ventures: 
//       <br />• T.O. Analytics Bootcamp — A premier training platform that equips individuals with Splunk, Linux, AWS, and cybersecurity skills. 
//       <br />• ACE Stocks Trading — A fast-growing stock trading community that teaches practical strategies for trading and investing. 
//       <br />• T.O. Productions LLC — A multimedia production company specializing in videography, photography, and creative storytelling.
//     </p>
//     <p className="my-2 md:my-6">
//       In addition to his work in tech and finance, Tomide is a committed real estate investor with a growing portfolio across the United States. He leverages his financial expertise to identify high-value opportunities, build equity, and create long-term wealth through strategic property investments.
//     </p>
//     <p className="my-2 md:my-6">
//       Tomide’s vision is fueled by his belief that with faith, hard work, and discipline, any dream can become a reality. Whether he is mentoring aspiring traders, training future cybersecurity leaders, growing his real estate portfolio, or building innovative data solutions, his passion for empowerment and excellence continues to inspire professionals and entrepreneurs across industries.
//     </p>
//   </div>
// </div> */}

//                 {/* <div className="text-white rounded-lg border-[1px] border-PURPLE mx-2 md:mx-10 grid grid-cols-1 lg:grid-cols-2">
//                     <div className="flex justify-center items-center">
//                         <div className="p-4">
//                             <img src={client} className="w-[450px] md:border-[1px] border-PURPLE rounded-2xl" alt="" />
//                             <div className="text-center">
//                                 <p className="font-medium my-2 md:text-2xl">Tomide Olulana</p>
//                                 <p className="text-lg md:text-xl my-2">CEO</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="about-me border-PURPLE text-sm md:text-base font-extralight md:font-medium px-4 md:px-6 py-4 md:py-8">
//                         <p className="my-2 md:my-6">I am a passion driven Nigerian-American business magnate, big data developer, and financial investor based in the United States. I have over 7 years of experience trading and investing in the stock market through stocks and options and has several years training, teaching, and mentoring.</p>
//                         <p className="my-2 md:my-6">I received my Master of Science in Applied Economics from the University of Maryland, College Park. Worked as a Financial Analyst and Asset Manager for several years in the transportation industry and now work as a big data developer in the Cybersecurity field.</p>
//                         <p className="my-2 md:my-6">I am the founder of ACE Stocks Trading, a stock trading community that teaches and mentors people on how to trade and invest in the stock market, I am also the founder and CEO of TO Productions LLC, a multimedia production company, Co-founder of Dive Data LLC, a company that trains people how to use SPLUNK data monitoring tool from user to an Admin level, LINUX and AWS. </p>
//                         <p className="my-2 md:my-6">My stock trading community has made millions in the stock market using my simple strategy and I strongly believes that with the help of God, any dream can come alive if you are willing to put in the work.</p>
//                     </div>
//                 </div> */}
//             </motion.section>
//         </>
//     )
// }

// export default AboutPage
