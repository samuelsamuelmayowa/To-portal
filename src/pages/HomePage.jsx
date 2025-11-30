import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useStateContext } from "../context/ContextProvider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import COURSES from "../coursesAPI/api";
import LandingIMG from "../assets/images/landingIMG.png";

// NEW images you should add
import WebDev from "../assets/images/workplace-full (1).jpeg";
import AppDev from "../assets/images/mobile.jpg";
import UiUx from "../assets/images/oneone.jpeg";
import Consulting from "../assets/images/make.jpeg";

import "../../src/assets/css/pagination.css";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const HomePage = () => {
  const { FullScreen } = useStateContext();

  return (
    <motion.div initial="hidden" animate="visible" exit="exit">
      <Helmet>
        <title>T.O Analytics | Tech Training & Software Solutions</title>
        <meta
          name="description"
          content="T.O Analytics offers world-class IT mentorship, Splunk training, cybersecurity, full-stack development education, and professional software services — including web development, mobile apps, UI/UX, and consulting."
        />
      </Helmet>

      {/* ========================= HERO SECTION ========================= */}
      <section className="bg-white px-6 md:px-16 py-28 md:py-40">
        <div className="grid md:grid-cols-2 items-center gap-10">
          <motion.div variants={fadeIn}>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-BLUE">
              Launch Your Tech Career <br />
              & Build Real-World Skills
            </h1>
            <p className="mt-4 text-lg md:text-xl font-medium text-gray-700 max-w-xl">
              From Splunk, Cybersecurity, Linux, and Cloud — to building real
              software projects. Gain job-ready skills with our hands-on,
              mentor-led programs.
            </p>

            <div className="flex gap-4 mt-8">
              <Link to="/mentorship">
                <button className="bg-BLUE text-white px-6 py-3 rounded-xl hover:opacity-90 duration-300 text-lg font-semibold">
                  Join Mentorship
                </button>
              </Link>

              <Link to="/courses">
                <button className="border-2 border-BLUE text-BLUE px-6 py-3 rounded-xl hover:bg-BLUE hover:text-white duration-300 text-lg font-semibold">
                  Explore Courses
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <img src={LandingIMG} className="w-full" />
          </motion.div>
        </div>
      </section>

      {/* ========================= SERVICES SECTION ========================= */}
      <section className="py-20 bg-gray-50 px-6 md:px-20">
        <h2 className="text-center text-3xl md:text-4xl font-black mb-12">
          We Also Build Amazing Products
        </h2>

        <div className="grid md:grid-cols-4 gap-10">
          {/* Web Development */}
          <motion.div
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <img src={WebDev} className="h-40 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold">Web Development</h3>
              <p className="text-gray-600 mt-2">
                Modern, scalable websites & web apps for businesses, startups
                and brands.
              </p>
            </div>
          </motion.div>

          {/* Mobile Apps */}
          <motion.div
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <img src={AppDev} className="h-40 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold">Mobile App Development</h3>
              <p className="text-gray-600 mt-2">
                Native & cross-platform apps that bring your ideas to life.
              </p>
            </div>
          </motion.div>

          {/* UI/UX */}
          <motion.div
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <img src={UiUx} className="h-40 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold">UI / UX & Branding</h3>
              <p className="text-gray-600 mt-2">
                Beautiful and intuitive designs that elevate user experience.
              </p>
            </div>
          </motion.div>

          {/* Consulting */}
          <motion.div
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <img src={Consulting} className="h-40 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold">Tech Consulting</h3>
              <p className="text-gray-600 mt-2">
                Personalized guidance for startups, companies & digital
                transformation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= FEATURED COURSES ========================= */}
      <section className="py-20 px-6 md:px-16">
        <h2 className="text-center text-3xl md:text-4xl font-black">
          Our Most Popular Courses
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {COURSES.slice(0, 6).map((course, index) => (
            <Link key={index} to={`/courses/${course.courseName.toLowerCase()}`}>
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden hover:scale-[1.02] duration-300">
                <img src={course.image} className="h-48 w-full object-cover" />

                <div className="p-5 bg-BLUE text-white">
                  <h3 className="text-2xl font-bold">{course.courseName}</h3>
                  <p className="my-2 font-semibold">{course.intro}</p>
                  <p className="text-sm opacity-80">{course.description}</p>
                  <p className="font-bold text-xl mt-4">${course.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/courses">
            <button className="bg-BLUE text-white px-8 py-3 rounded-xl text-lg font-semibold hover:opacity-80">
              View All Courses
            </button>
          </Link>
        </div>
      </section>

      {/* ========================= TESTIMONIALS ========================= */}
      <section className="py-16 bg-white">
        <h2 className="text-center text-3xl md:text-4xl font-black mb-10">
          What Our Students Say
        </h2>

        <Splide
          className="px-6 md:px-56"
          options={{
            type: "loop",
            perPage: 1,
            autoplay: true,
            interval: 4000,
            arrows: false,
            pagination: true,
          }}
        >
          <SplideSlide>
            <p className="text-center text-lg md:text-2xl font-semibold">
              “The mentorship helped me break into a Splunk Admin role with
              confidence.”
            </p>
            <p className="text-center font-bold mt-2 text-BLUE">
              — Splunk Admin
            </p>
          </SplideSlide>

          <SplideSlide>
            <p className="text-center text-lg md:text-2xl font-semibold">
              “From zero IT experience to job-ready in 5 weeks. The labs were
              game-changers.”
            </p>
            <p className="text-center font-bold mt-2 text-BLUE">
              — Cybersecurity Analyst
            </p>
          </SplideSlide>

          <SplideSlide>
            <p className="text-center text-lg md:text-2xl font-semibold">
              “Landed a SOC Analyst role in 7 weeks — coming from customer
              service!”
            </p>
            <p className="text-center font-bold mt-2 text-BLUE">
              — SOC Analyst
            </p>
          </SplideSlide>
        </Splide>
      </section>

      {/* ========================= FAQ ========================= */}
      <section className="bg-gray-100 py-16 px-6 md:px-16">
        <h2 className="text-center text-3xl md:text-4xl font-black mb-10">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-6 text-gray-700">
          <div>
            <h4 className="font-bold">How long until I'm job-ready?</h4>
            <p>Most mentees are job-ready in 14 weeks.</p>
          </div>
          <div>
            <h4 className="font-bold">What if I miss a session?</h4>
            <p>You can reschedule or get asynchronous review.</p>
          </div>
          <div>
            <h4 className="font-bold">Do you help with certifications?</h4>
            <p>Yes — Splunk, Cybersecurity, Linux & more.</p>
          </div>
          <div>
            <h4 className="font-bold">I'm new to IT. Can I join?</h4>
            <p>Absolutely! Our mentorship is beginner-friendly.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;

// import { Splide, SplideSlide } from '@splidejs/react-splide';
// import { useStateContext } from "../context/ContextProvider"
// import "../../src/assets/css/pagination.css"
// import { Link } from 'react-router-dom';
// import LandingIMG from "../assets/images/landingIMG.png"
// import eInstructor from "../assets/images/e-instructor.jpg"
// import hLearning from "../assets/images/h-learning.jpg"
// import flexibleLearning from "../assets/images/flexible-learning.jpg"
// import guidance from "../assets/images/guidance.jpg";
// import student1 from "../assets/images/student1.png"
// import student2 from "../assets/images/student2.png"
// import student3 from "../assets/images/student3.jpeg"
// import COURSES from "../coursesAPI/api"
// import { FaQuoteLeft } from "react-icons/fa";
// import { Helmet } from 'react-helmet';
// import { backInOut, motion } from "framer-motion"
// import { LandingSpike, RectangleLeft, RectangleRight } from '../components/BgDesigns';

// const home = {
//     hidden: {
//         opacity: 0,
//     },
//     visible: {
//         opacity: 1,
//         transition: {
//             ease: backInOut, duration: 2, staggerChildren: .5, delayChildern: 1.2
//         }
//     },
//     exit: {
//         x: "-100vw"
//     }
// }

// const landingContainer = {
//     hidden: {
//         opacity: 0
//     },
//     visible: {
//         opacity: 1,
//         transition: {
//             staggerChildren: 1, delayChildern: 1
//         }
//     }
// }

// const h1 = {
//     hidden: {
//         opacity: 0,
//         x: "-150px"
//     },
//     visible: {
//         opacity: 1,
//         x: 0
//     }
// }

// const p = {
//     hidden: {
//         opacity: 0,
//         y: "-150px"
//     },
//     visible: {
//         opacity: 1,
//         y: 0
//     }
// }

// const buttonContainer = {
//     hidden: {
//         opacity: 1
//     },
//     visible: {
//         opacity: 1,
//         transition: {
//             duration: 1, staggerChildren: .5, delayChildern: 1.2
//         }
//     }
// }

// const button = {
//     hidden: {
//         x: "-100px",
//         opacity: 0,
//     },
//     visible: {
//         x: 0,
//         opacity: 1,
//     }
// }

// const HomePage = () => {
//     const { FullScreen } = useStateContext()
//     return (
//         <motion.div variants={home} exit="exit">
//             <Helmet>
//                 <meta charSet="utf-8" />
//                 <title>To-analytics</title>
//                 <link rel="canonical" href="https://www.to-analytics.com" />
//                 <meta name="description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
//                 <meta property="og:description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
//             </Helmet>
//             <section className="landing-page px-6 md:px-10 py-60 md:py-32 bg-white min-h-screen">
//                 <motion.div className="grid md:grid-cols-2 items-center gap-10">
//                     <motion.div variants={landingContainer} initial="hidden" animate="visible">
//                         <motion.h1
//                             variants={h1}
//                             className="my-4 md:my-7 font-semibold md:font-bold text-4xl md:text-5xl LANDING-TEXT"
//                         >
//                             Break into Cybersecurity / Splunk in 14 Weeks with 1-on-1 Mentorship
//                         </motion.h1>
//                         <motion.p variants={p} className="font-medium md:font-bold text-2xl md:text-xl my-4">Step into the exciting realm of technology  through our cutting-edge courses and solutions.</motion.p>
//                         <motion.div variants={buttonContainer} initial="hidden" animate="visible" className="flex gap-2 md:gap-3">
//                             <motion.div variants={button}>
//                                 <Link to="/mentorship">
//                                     <button className="text-base md:text-xl font-medium border-2 border-BLUE text-BLUE hover:text-white hover:bg-BLUE px-3 py-4 md:px-4 md:py-3 rounded-xl md:rounded-3xl duration-300">Book Mentorship</button>
//                                 </Link>
//                             </motion.div>
//                             <motion.div variants={button}>
//                                 <Link to="/liveCourses">
//                                     <button className="text-base md:text-xl font-medium border-2 border-BLUE bg-BLUE text-white hover:bg-white hover:text-BLUE px-3 py-4 md:px-4 md:py-3 rounded-xl md:rounded-3xl duration-300">Live Courses</button>
//                                 </Link>
//                             </motion.div>
//                         </motion.div>
//                     </motion.div>
//                     <div className="relative hidden md:block">
//                         <motion.div initial={{ opacity: 0, rotate: "180deg" }} animate={{ opacity: 1, rotate: "0deg" }} transition={{ ease: backInOut, duration: 1, delay: 1.5 }} className="bg-BLUE landingDIV"></motion.div>
//                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-0 left-0 right-0">
//                             <img src={LandingIMG} className="w-full" alt="" />
//                         </motion.div>
//                     </div>
//                 </motion.div>
//                 <motion.div initial={{ scale: 0, opacity: 0, rotate: "180deg" }} animate={{ scale: 1, opacity: 0.3, rotate: "0deg" }} transition={{ ease: backInOut, duration: 1, delay: 1.5 }} className='mobile-landingDIV md:hidden block absolute top-40 left-0 translate-y-[-50%] bg-BLUE landingDIV backdrop-blur-2xl'></motion.div>
//                 {FullScreen && <LandingSpike />}
//             </section>

//             <section className="md:pb-20 bg-transparent relative z-[10] min-h-fit">
//                 <h1 data-aos-once="true" data-aos-duration="6000" data-aos="fade-up" className="text-center font-black text-2xl md:text-4xl my-4">Why Trust T.O Analytics?</h1>
//                 <div className="md:px-10 p-4 overflow-x-hidden">
//                     <div className="md:text-left md:pb-10 md:py-2 grid grid-cols-1 md:grid-cols-2 items-center md:gap-20">
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className='relative'>
//                             <p className="uppercase font-black text-BLUE my-2">Learn from industry’s best</p>
//                             <h1 className="font-bold text-2xl md:text-2xl my-2">Experienced Instructors</h1>
//                             <p className="font-medium text-base">Our instructors are seasoned professionals with extensive experience in diverse areas of the tech industry. They leverage their deep expertise and real-world project insights to deliver practical, actionable guidance in the classroom.</p>
//                             <RectangleLeft />
//                         </div>
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className="md:block">
//                             <img src={eInstructor} alt="" className='w-fit p-14 md:p-0' />
//                         </div>
//                     </div>
//                     <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className="md:block order-2 md:order-1">
//                             <img src={hLearning} alt="" className='w-fit p-14 md:p-0' />
//                         </div>
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className='relative order-1 md:order-2'>
//                             <p className="uppercase font-black text-BLUE my-2">Fine blend of theory and practice</p>
//                             <h1 className="font-bold text-2xl md:text-2xl my-2">Hands-on learning</h1>
//                             <p className="font-medium text-base"> Our bootcamp, built around hands-on learning, immerses students in real-world scenarios through projects and practical exercises. This approach helps them gain invaluable experience, develop essential tech skills like problem-solving, collaboration, and critical thinking, and master coding languages like Python by building real-world web applications. Join our bootcamp today and start your journey towards a rewarding tech career.</p>
//                             <RectangleRight />
//                         </div>
//                     </div>
//                     <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className='relative'>
//                             <p className="uppercase font-black text-BLUE my-2">We put you first</p>
//                             <h1 className="font-bold text-2xl md:text-2xl my-2">Flexible learning Options</h1>
//                             <p className="font-medium text-base">We understand that everyone has different schedules and commitments. That&apos;s why we offer flexible learning options, including part-time and full-time programs, as well as online learning options. This allows students to choose a schedule that works best for them while still receiving high-quality education.</p>
//                             <RectangleLeft />
//                         </div>
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className="md:block">
//                             <img src={flexibleLearning} alt="" className='w-fit p-14 md:p-0' />
//                         </div>
//                     </div>
//                     <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className="md:block order-2 md:order-1">
//                             <img src={guidance} alt="" className='w-fit p-14 md:p-0' />
//                         </div>
//                         <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className='relative order-1 md:order-2'>
//                             <p className="uppercase font-black text-BLUE my-2">From clueless to pro</p>
//                             <h1 className="font-bold text-2xl md:text-2xl my-2">Career guidance</h1>
//                             <p className="font-medium text-base">We provide comprehensive career guidance and support to help students transition into the tech industry. This includes resume building, interview preparation, job search strategies, and networking opportunities. Our goal is to equip students with the necessary skills and resources to succeed in their tech careers.</p>
//                             <RectangleRight />
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             <section className="relative courses p-4 md:p-10">
//                 <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-y-4 gap-x-2">
//                     {COURSES.map((course, index) => index < 6 && (
//                         <Link key={index} to={`/courses/${course.courseName.toLowerCase()}`} className="">
//                             <div
//                                 className={`rounded-xl`}
//                                 data-aos-once="true"
//                                 data-aos-duration="5000"
//                                 data-aos="fade-up"
//                             >
//                                 <div className="rounded-tr-2xl rounded-tl-2xl">
//                                     <img
//                                         src={course.image}
//                                         className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
//                                         alt=""
//                                     />
//                                 </div>
//                                 <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
//                                     <p className="font-bold text-white text-lg md:my-4 md:text-3xl line-clamp-1 lg:line-clamp-2">{course.courseName}</p>
//                                     <p className="my-2 font-bold text-sm h-[40px] md:h-auto">{course.intro}</p>
//                                     <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
//                                         {course.description}
//                                     </p>
//                                     <p className="font-bold my-5 text-lg md:text-xl">${course.price}</p>
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//                 <div className="py-10 text-center">
//                     <Link to="/courses" className="">
//                         <button className="text-base md:text-lg font-normal bg-BLUE hover:bg-transparent hover:text-BLUE duration-300 hover:outline-2 outline hover:outline-BLUE text-white rounded-md md:rounded-2xl px-4 py-4 md:px-7 md:py-3">View All Courses</button>
//                     </Link>
//                 </div>
//                 <div className='mobile-landingDIV md:hidden block absolute bottom-0 left-0 bg-BLUE landingDIV'></div>
//             </section>

//             <section className="relative bg-white py-16 md:py-12 overflow-hidden">
//                 <LandingSpike />
//                 <h1 className="my-2 md:my-8 text-center font-bold text-xl md:text-4xl">Here’s what our students are saying</h1>
//                 <FaQuoteLeft className='mx-auto' size={FullScreen ? 30 : 20} color='#2d2065' />
//                 <Splide className='splide pb-8 md:pb-12 px-5 md:px-44' aria-label="Testimonials" options={{
//                     type: 'loop',
//                     perPage: 1,
//                     perMove: 1,
//                     autoplay: true,
//                     interval: 4000,
//                     speed: 2000,
//                     arrows: false,
//                     pagination: true,
//                     drag: 'free',
//                     snap: true,
//                 }}>

//                     <SplideSlide>
//                         <div className="md:w-[80%] mx-auto">
//                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">The mentorship helped me break into Splunk Admin role with confidence..</p>
//                             <div className="flex items-center justify-center gap-1 md:gap-3">
//                                 {/* <img src={student3} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
//                                 <p className="font-bold text-sm md:text-2xl">Splunk Admin</p>
//                             </div>
//                         </div>
//                     </SplideSlide>

//                     <SplideSlide>
//                         <div className="md:w-[80%] mx-auto">
//                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">From zero IT experience to job-ready in 5 weeks. The labs and 1:1 sessions were game-changers.</p>
//                             <div className="flex items-center justify-center gap-1 md:gap-3">
//                                 {/* <img src={student1} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
//                                 <p className="font-bold text-sm md:text-2xl">Cybersecurity Analyst</p>
//                             </div>
//                         </div>
//                     </SplideSlide>
//                     <SplideSlide>
//                         <div className="md:w-[80%] mx-auto">
//                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">Landed a SOC Analyst role in just 7 weeks — coming from customer service!</p>
//                             <div className="flex items-center justify-center gap-1 md:gap-3">
//                                 {/* <img src={student2} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
//                                 <p className="font-bold text-sm md:text-2xl">SOC Analyst</p>
//                             </div>
//                         </div>
//                     </SplideSlide>
//                     <SplideSlide>
//                         <div className="md:w-[80%] mx-auto">
//                             <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">The mentorship helped me break into Splunk Admin role with confidence..</p>
//                             <div className="flex items-center justify-center gap-1 md:gap-3">
//                                 {/* <img src={student3} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
//                                 <p className="font-bold text-sm md:text-2xl">Splunk Admin</p>
//                             </div>
//                         </div>
//                     </SplideSlide>
//                 </Splide>
//                 {/* <FaQuoteRight className='mx-auto' size={30} /> */}
//             </section>
//             <section className="p-4 md:p-10 bg-gray-100">
//                 <h2 className="text-center text-2xl md:text-4xl font-bold mb-8">
//                     Frequently Asked Questions
//                 </h2>
//                 <div className="max-w-3xl mx-auto space-y-6 text-gray-700 text-sm md:text-base">
//                     <div>
//                         <h4 className="font-semibold">
//                             How long until I’m job-ready?
//                         </h4>
//                         <p>Most mentees become job-ready within 14 weeks depending on prior experience.</p>
//                     </div>
//                     <div>
//                         <h4 className="font-semibold">
//                             What if I miss a session?
//                         </h4>
//                         <p>You can reschedule or receive a bonus asynchronous review that week.</p>
//                     </div>
//                     <div>
//                         <h4 className="font-semibold">
//                             Do you help with Splunk certifications?
//                         </h4>
//                         <p>Yes! We provide certification guidance and practice labs.</p>
//                     </div>
//                     <div>
//                         <h4 className="font-semibold">
//                             I’m new to IT — am I eligible?
//                         </h4>
//                         <p>Absolutely. The mentorship is beginner-friendly and personalized to your pace.</p>
//                     </div>
//                     <div>
//                         <h4 className="font-semibold">
//                             Do you offer refunds?
//                         </h4>
//                         <p>Yes, we offer deferral or partial refund options if mentorship is canceled early.</p>
//                     </div>
//                 </div>
//             </section>
//         </motion.div>
//     )
// }

// export default HomePage