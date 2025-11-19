import { useRef } from "react";
import { Helmet } from "react-helmet";
import about1 from "../assets/images/about1.png"
import about2 from "../assets/images/about2.jpg"
import about3 from "../assets/images/about3.png"
import about4 from "../assets/images/about4.png"
import client from "../assets/images/client.png"
import { motion, useScroll, useInView, backInOut } from "framer-motion";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css'

const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.5
        }
    }
}

const image = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
}

const h1 = {
    hidden: { x: "-40px", opacity: 0 },
    visible: {
        x: 0,
        opacity: 1
    }
}
 const p = {
    hidden: { y: "-80px", opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
 }


const AboutPage = () => {
    const targetRef = useRef(null)
    const clientRef = useRef(null)
    const isInView = useInView(clientRef, { once: true})
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["0 1", "1.1 1"],
    })
    // const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
    // const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
    // const transformX = useTransform(scrollYProgress, [0, 0.5], ["100px", 0]);
    return (
        <>
            
            <section className="relative z-10 px-5 pt-24 pb-10 md:py-20 md:px-10 bg-white border-red-500">
            <Helmet>
                <meta charSet="utf-8" />
                    <title>About </title>
                <meta name="keywords" content="splunk , photography, stock , Linux, Data Science"/>
                <link rel="canonical" href="https://www.to-analytics.com" />
                <meta name="description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />

                <meta property="og:description" content={"To-Analytics is an educational platform that offers affordable courses across a wide array of fields, including Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more. Our courses are designed to foster career advancement and help you achieve your professional goals."} />
            </Helmet>
                <motion.div variants={container} initial="hidden" animate="visible" className="md:py-8 bg-white z-20">
                    <motion.h1 variants={h1} className="OUR-MISSION md:font-black my-4 md:my-8 font-bold text-3xl md:text-4xl">Our Mission</motion.h1>
                    <motion.p variants={p} className="w-full md:w-1/2 font-normal md:font-medium text-sm md:text-base my-3">At T.O Analytics, our mission is to empower students with the essential tech skills, focusing on the field of Cybersecurity. We understand the importance of cybersecurity in today’s digital world, protecting the individuals and organizations from cyber threats. </motion.p>
                </motion.div>
                <motion.div initial={{scale: 0, opacity:0, rotate: "90deg"}} animate={{scale: 1, opacity:0.3, rotate:"0deg"}} transition={{ease:backInOut, duration: 1,delay: 1.5}} className='block absolute top-0 left-0 bg-BLUE landingDIV'></motion.div>
            </section>
            <motion.section ref={targetRef} className="relative z-10 px-5 py-14 md:px-10 bg-white font-bold">
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 items-center">
                    <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 relative">
                        <motion.div variants={image}>
                            <LazyLoadImage effect="blur" src={about1} className="rounded-xl" alt="" />
                        </motion.div>
                        <motion.div variants={image}>
                            <LazyLoadImage effect="blur" src={about2} className="rounded-xl" alt="" />
                        </motion.div>
                        <motion.div variants={image}>
                            <LazyLoadImage effect="blur" src={about3} className="rounded-xl" alt="" />
                        </motion.div>
                        <motion.div variants={image}>
                            <LazyLoadImage effect="blur" src={about4} className="rounded-xl" alt="" />
                        </motion.div>
                    </motion.div>
                    <motion.div>
                        <h1 className="ABOUT-US my-5 font-black text-3xl md:text-4xl">About Us</h1>
                        <p className="my-5 font-normal md:font-medium text-sm md:text-base">We are a leading tech institute dedicated to equipping the student with the skills they need to thrive in the ever-evolving world of technology. With a strong focus on cybersecurity, we offer  comprehensive training programs that empower our students to become experts in protecting digital assets.</p>
                        <p className="my-5 font-normal md:font-medium text-sm md:text-base">We are committed to fostering a supportive and collaborative learning environment. Our instructors are passionate about helping students succeed and providing them with the guidance and they need to reach their full potential. We prioritize individual and organizations and offer personalized attention to ensure that each student’s unique goals are met.</p>
                    </motion.div>
                </div>
            </motion.section>
            <motion.section ref={clientRef} initial={{scale: 0}} transition={{duration: 0.5}} style={{scale: isInView ? 1 : 0,transition: "400ms"}} className={`relative z-10 bg-BLUE py-2 md:py-8`}>
                <div className="text-white rounded-lg border-[1px] border-PURPLE mx-2 md:mx-10 grid grid-cols-1 lg:grid-cols-2">
  <div className="flex justify-center items-center">
    <div className="p-4">
      <img src={client} className="w-[450px] md:border-[1px] border-PURPLE rounded-2xl" alt="" />
      <div className="text-center">
        <p className="font-medium my-2 md:text-2xl">Tomide Olulana</p>
        <p className="text-lg md:text-xl my-2">CEO</p>
      </div>
    </div>
  </div>
  <div className="about-me border-PURPLE text-sm md:text-base font-extralight md:font-medium px-4 md:px-6 py-4 md:py-8">
    <p className="my-2 md:my-6">
      Tomide Olulana is a passion-driven Nigerian-American business magnate, cybersecurity architect, big data developer, real estate investor, financial strategist, and educator based in the United States. With years of experience in stock and options trading, real estate investing, and mentorship, Tomide is committed to helping individuals build wealth, acquire valuable skills, and unlock their full potential.
    </p>
    <p className="my-2 md:my-6">
      He earned his Master of Science in Applied Economics from the University of Maryland, College Park and began his career as a Financial Analyst and Asset Manager in the transportation industry. Today, he serves as a Cybersecurity Architect and Big Data Developer, specializing in Splunk engineering, advanced data analytics, and enterprise security solutions. In this role, he leads and mentors a talented team of developers, building secure, scalable, and data-driven systems.
    </p>
    <p className="my-2 md:my-6">
      Beyond his professional career, Tomide is a successful entrepreneur and the Founder & CEO of several thriving ventures: 
      <br />• T.O. Analytics Bootcamp — A premier training platform that equips individuals with Splunk, Linux, AWS, and cybersecurity skills. 
      <br />• ACE Stocks Trading — A fast-growing stock trading community that teaches practical strategies for trading and investing. 
      <br />• T.O. Productions LLC — A multimedia production company specializing in videography, photography, and creative storytelling.
    </p>
    <p className="my-2 md:my-6">
      In addition to his work in tech and finance, Tomide is a committed real estate investor with a growing portfolio across the United States. He leverages his financial expertise to identify high-value opportunities, build equity, and create long-term wealth through strategic property investments.
    </p>
    <p className="my-2 md:my-6">
      Tomide’s vision is fueled by his belief that with faith, hard work, and discipline, any dream can become a reality. Whether he is mentoring aspiring traders, training future cybersecurity leaders, growing his real estate portfolio, or building innovative data solutions, his passion for empowerment and excellence continues to inspire professionals and entrepreneurs across industries.
    </p>
  </div>
</div>

                {/* <div className="text-white rounded-lg border-[1px] border-PURPLE mx-2 md:mx-10 grid grid-cols-1 lg:grid-cols-2">
                    <div className="flex justify-center items-center">
                        <div className="p-4">
                            <img src={client} className="w-[450px] md:border-[1px] border-PURPLE rounded-2xl" alt="" />
                            <div className="text-center">
                                <p className="font-medium my-2 md:text-2xl">Tomide Olulana</p>
                                <p className="text-lg md:text-xl my-2">CEO</p>
                            </div>
                        </div>
                    </div>
                    <div className="about-me border-PURPLE text-sm md:text-base font-extralight md:font-medium px-4 md:px-6 py-4 md:py-8">
                        <p className="my-2 md:my-6">I am a passion driven Nigerian-American business magnate, big data developer, and financial investor based in the United States. I have over 7 years of experience trading and investing in the stock market through stocks and options and has several years training, teaching, and mentoring.</p>
                        <p className="my-2 md:my-6">I received my Master of Science in Applied Economics from the University of Maryland, College Park. Worked as a Financial Analyst and Asset Manager for several years in the transportation industry and now work as a big data developer in the Cybersecurity field.</p>
                        <p className="my-2 md:my-6">I am the founder of ACE Stocks Trading, a stock trading community that teaches and mentors people on how to trade and invest in the stock market, I am also the founder and CEO of TO Productions LLC, a multimedia production company, Co-founder of Dive Data LLC, a company that trains people how to use SPLUNK data monitoring tool from user to an Admin level, LINUX and AWS. </p>
                        <p className="my-2 md:my-6">My stock trading community has made millions in the stock market using my simple strategy and I strongly believes that with the help of God, any dream can come alive if you are willing to put in the work.</p>
                    </div>
                </div> */}
            </motion.section>
        </>
    )
}

export default AboutPage