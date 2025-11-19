import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useStateContext } from "../context/ContextProvider"
import "../../src/assets/css/pagination.css"
import { Link } from 'react-router-dom';
import LandingIMG from "../assets/images/landingIMG.png"
import eInstructor from "../assets/images/e-instructor.jpg"
import hLearning from "../assets/images/h-learning.jpg"
import flexibleLearning from "../assets/images/flexible-learning.jpg"
import guidance from "../assets/images/guidance.jpg";
import student1 from "../assets/images/student1.png"
import student2 from "../assets/images/student2.png"
import student3 from "../assets/images/student3.jpeg"
import COURSES from "../coursesAPI/api"
import { FaQuoteLeft } from "react-icons/fa";
import { Helmet } from 'react-helmet';
import { backInOut, motion } from "framer-motion"
import { LandingSpike, RectangleLeft, RectangleRight } from '../components/BgDesigns';

const home = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            ease: backInOut, duration: 2, staggerChildren: .5, delayChildern: 1.2
        }
    },
    exit: {
        x: "-100vw"
    }
}

const landingContainer = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 1, delayChildern: 1
        }
    }
}

const h1 = {
    hidden: {
        opacity: 0,
        x: "-150px"
    },
    visible: {
        opacity: 1,
        x: 0
    }
}

const p = {
    hidden: {
        opacity: 0,
        y: "-150px"
    },
    visible: {
        opacity: 1,
        y: 0
    }
}

const buttonContainer = {
    hidden: {
        opacity: 1
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 1, staggerChildren: .5, delayChildern: 1.2
        }
    }
}

const button = {
    hidden: {
        x: "-100px",
        opacity: 0,
    },
    visible: {
        x: 0,
        opacity: 1,
    }
}

const HomePage = () => {
    const { FullScreen } = useStateContext()
    return (
        <motion.div variants={home} exit="exit">
            <Helmet>
                <meta charSet="utf-8" />
                <title>To-analytics</title>
                <link rel="canonical" href="https://www.to-analytics.com" />
                <meta name="description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
                <meta property="og:description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
            </Helmet>
            <section className="landing-page px-6 md:px-10 py-60 md:py-32 bg-white min-h-screen">
                <motion.div className="grid md:grid-cols-2 items-center gap-10">
                    <motion.div variants={landingContainer} initial="hidden" animate="visible">
                        <motion.h1
                            variants={h1}
                            className="my-4 md:my-7 font-semibold md:font-bold text-4xl md:text-5xl LANDING-TEXT"
                        >
                            Break into Cybersecurity / Splunk in 14 Weeks with 1-on-1 Mentorship
                        </motion.h1>
                        <motion.p variants={p} className="font-medium md:font-bold text-2xl md:text-xl my-4">Step into the exciting realm of technology  through our cutting-edge courses and solutions.</motion.p>
                        <motion.div variants={buttonContainer} initial="hidden" animate="visible" className="flex gap-2 md:gap-3">
                            <motion.div variants={button}>
                                <Link to="/mentorship">
                                    <button className="text-base md:text-xl font-medium border-2 border-BLUE text-BLUE hover:text-white hover:bg-BLUE px-3 py-4 md:px-4 md:py-3 rounded-xl md:rounded-3xl duration-300">Book Mentorship</button>
                                </Link>
                            </motion.div>
                            <motion.div variants={button}>
                                <Link to="/liveCourses">
                                    <button className="text-base md:text-xl font-medium border-2 border-BLUE bg-BLUE text-white hover:bg-white hover:text-BLUE px-3 py-4 md:px-4 md:py-3 rounded-xl md:rounded-3xl duration-300">Live Courses</button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    <div className="relative hidden md:block">
                        <motion.div initial={{ opacity: 0, rotate: "180deg" }} animate={{ opacity: 1, rotate: "0deg" }} transition={{ ease: backInOut, duration: 1, delay: 1.5 }} className="bg-BLUE landingDIV"></motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-0 left-0 right-0">
                            <img src={LandingIMG} className="w-full" alt="" />
                        </motion.div>
                    </div>
                </motion.div>
                <motion.div initial={{ scale: 0, opacity: 0, rotate: "180deg" }} animate={{ scale: 1, opacity: 0.3, rotate: "0deg" }} transition={{ ease: backInOut, duration: 1, delay: 1.5 }} className='mobile-landingDIV md:hidden block absolute top-40 left-0 translate-y-[-50%] bg-BLUE landingDIV backdrop-blur-2xl'></motion.div>
                {FullScreen && <LandingSpike />}
            </section>

            <section className="md:pb-20 bg-transparent relative z-[10] min-h-fit">
                <h1 data-aos-once="true" data-aos-duration="6000" data-aos="fade-up" className="text-center font-black text-2xl md:text-4xl my-4">Why Trust T.O Analytics?</h1>
                <div className="md:px-10 p-4 overflow-x-hidden">
                    <div className="md:text-left md:pb-10 md:py-2 grid grid-cols-1 md:grid-cols-2 items-center md:gap-20">
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className='relative'>
                            <p className="uppercase font-black text-BLUE my-2">Learn from industry’s best</p>
                            <h1 className="font-bold text-2xl md:text-2xl my-2">Experienced Instructors</h1>
                            <p className="font-medium text-base">Our instructors are seasoned professionals with extensive experience in diverse areas of the tech industry. They leverage their deep expertise and real-world project insights to deliver practical, actionable guidance in the classroom.</p>
                            <RectangleLeft />
                        </div>
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className="md:block">
                            <img src={eInstructor} alt="" className='w-fit p-14 md:p-0' />
                        </div>
                    </div>
                    <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className="md:block order-2 md:order-1">
                            <img src={hLearning} alt="" className='w-fit p-14 md:p-0' />
                        </div>
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className='relative order-1 md:order-2'>
                            <p className="uppercase font-black text-BLUE my-2">Fine blend of theory and practice</p>
                            <h1 className="font-bold text-2xl md:text-2xl my-2">Hands-on learning</h1>
                            <p className="font-medium text-base"> Our bootcamp, built around hands-on learning, immerses students in real-world scenarios through projects and practical exercises. This approach helps them gain invaluable experience, develop essential tech skills like problem-solving, collaboration, and critical thinking, and master coding languages like Python by building real-world web applications. Join our bootcamp today and start your journey towards a rewarding tech career.</p>
                            <RectangleRight />
                        </div>
                    </div>
                    <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className='relative'>
                            <p className="uppercase font-black text-BLUE my-2">We put you first</p>
                            <h1 className="font-bold text-2xl md:text-2xl my-2">Flexible learning Options</h1>
                            <p className="font-medium text-base">We understand that everyone has different schedules and commitments. That&apos;s why we offer flexible learning options, including part-time and full-time programs, as well as online learning options. This allows students to choose a schedule that works best for them while still receiving high-quality education.</p>
                            <RectangleLeft />
                        </div>
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className="md:block">
                            <img src={flexibleLearning} alt="" className='w-fit p-14 md:p-0' />
                        </div>
                    </div>
                    <div className="py-2 grid grid-cols-1 md:grid-cols-2 items-center justify-between md:gap-20">
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-right" className="md:block order-2 md:order-1">
                            <img src={guidance} alt="" className='w-fit p-14 md:p-0' />
                        </div>
                        <div data-aos-once="true" data-aos-duration="6000" data-aos="fade-left" className='relative order-1 md:order-2'>
                            <p className="uppercase font-black text-BLUE my-2">From clueless to pro</p>
                            <h1 className="font-bold text-2xl md:text-2xl my-2">Career guidance</h1>
                            <p className="font-medium text-base">We provide comprehensive career guidance and support to help students transition into the tech industry. This includes resume building, interview preparation, job search strategies, and networking opportunities. Our goal is to equip students with the necessary skills and resources to succeed in their tech careers.</p>
                            <RectangleRight />
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative courses p-4 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-y-4 gap-x-2">
                    {COURSES.map((course, index) => index < 6 && (
                        <Link key={index} to={`/courses/${course.courseName.toLowerCase()}`} className="">
                            <div
                                className={`rounded-xl`}
                                data-aos-once="true"
                                data-aos-duration="5000"
                                data-aos="fade-up"
                            >
                                <div className="rounded-tr-2xl rounded-tl-2xl">
                                    <img
                                        src={course.image}
                                        className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
                                        alt=""
                                    />
                                </div>
                                <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
                                    <p className="font-bold text-white text-lg md:my-4 md:text-3xl line-clamp-1 lg:line-clamp-2">{course.courseName}</p>
                                    <p className="my-2 font-bold text-sm h-[40px] md:h-auto">{course.intro}</p>
                                    <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
                                        {course.description}
                                    </p>
                                    <p className="font-bold my-5 text-lg md:text-xl">${course.price}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="py-10 text-center">
                    <Link to="/courses" className="">
                        <button className="text-base md:text-lg font-normal bg-BLUE hover:bg-transparent hover:text-BLUE duration-300 hover:outline-2 outline hover:outline-BLUE text-white rounded-md md:rounded-2xl px-4 py-4 md:px-7 md:py-3">View All Courses</button>
                    </Link>
                </div>
                <div className='mobile-landingDIV md:hidden block absolute bottom-0 left-0 bg-BLUE landingDIV'></div>
            </section>

            <section className="relative bg-white py-16 md:py-12 overflow-hidden">
                <LandingSpike />
                <h1 className="my-2 md:my-8 text-center font-bold text-xl md:text-4xl">Here’s what our students are saying</h1>
                <FaQuoteLeft className='mx-auto' size={FullScreen ? 30 : 20} color='#2d2065' />
                <Splide className='splide pb-8 md:pb-12 px-5 md:px-44' aria-label="Testimonials" options={{
                    type: 'loop',
                    perPage: 1,
                    perMove: 1,
                    autoplay: true,
                    interval: 4000,
                    speed: 2000,
                    arrows: false,
                    pagination: true,
                    drag: 'free',
                    snap: true,
                }}>

                    <SplideSlide>
                        <div className="md:w-[80%] mx-auto">
                            <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">The mentorship helped me break into Splunk Admin role with confidence..</p>
                            <div className="flex items-center justify-center gap-1 md:gap-3">
                                {/* <img src={student3} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
                                <p className="font-bold text-sm md:text-2xl">Splunk Admin</p>
                            </div>
                        </div>
                    </SplideSlide>

                    <SplideSlide>
                        <div className="md:w-[80%] mx-auto">
                            <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">From zero IT experience to job-ready in 5 weeks. The labs and 1:1 sessions were game-changers.</p>
                            <div className="flex items-center justify-center gap-1 md:gap-3">
                                {/* <img src={student1} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
                                <p className="font-bold text-sm md:text-2xl">Cybersecurity Analyst</p>
                            </div>
                        </div>
                    </SplideSlide>
                    <SplideSlide>
                        <div className="md:w-[80%] mx-auto">
                            <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">Landed a SOC Analyst role in just 7 weeks — coming from customer service!</p>
                            <div className="flex items-center justify-center gap-1 md:gap-3">
                                {/* <img src={student2} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
                                <p className="font-bold text-sm md:text-2xl">SOC Analyst</p>
                            </div>
                        </div>
                    </SplideSlide>
                    <SplideSlide>
                        <div className="md:w-[80%] mx-auto">
                            <p className="font-normal md:font-semibold my-2 text-sm py-2 md:text-xl text-center md:p-6">The mentorship helped me break into Splunk Admin role with confidence..</p>
                            <div className="flex items-center justify-center gap-1 md:gap-3">
                                {/* <img src={student3} className="w-[40px] md:w-[70px] aspect-square rounded-full" alt="" /> */}
                                <p className="font-bold text-sm md:text-2xl">Splunk Admin</p>
                            </div>
                        </div>
                    </SplideSlide>
                </Splide>
                {/* <FaQuoteRight className='mx-auto' size={30} /> */}
            </section>
            <section className="p-4 md:p-10 bg-gray-100">
                <h2 className="text-center text-2xl md:text-4xl font-bold mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="max-w-3xl mx-auto space-y-6 text-gray-700 text-sm md:text-base">
                    <div>
                        <h4 className="font-semibold">
                            How long until I’m job-ready?
                        </h4>
                        <p>Most mentees become job-ready within 14 weeks depending on prior experience.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">
                            What if I miss a session?
                        </h4>
                        <p>You can reschedule or receive a bonus asynchronous review that week.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">
                            Do you help with Splunk certifications?
                        </h4>
                        <p>Yes! We provide certification guidance and practice labs.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">
                            I’m new to IT — am I eligible?
                        </h4>
                        <p>Absolutely. The mentorship is beginner-friendly and personalized to your pace.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">
                            Do you offer refunds?
                        </h4>
                        <p>Yes, we offer deferral or partial refund options if mentorship is canceled early.</p>
                    </div>
                </div>
            </section>
        </motion.div>
    )
}

export default HomePage