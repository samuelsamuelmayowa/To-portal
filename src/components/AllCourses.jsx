import { Link } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import COURSES from "../coursesAPI/api"
import { useStateContext } from "../context/ContextProvider"
import { motion } from "framer-motion";
import { LandingSpike } from "./BgDesigns";

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 250,
      delayChildren: 0.5,
      staggerChildren: 0.5
    }
  }
}

const h1 = {
  hidden: { y: "-40px", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  }
}
const p = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1
  }
}

const AllCourses = () => {
  const { token } = useStateContext();
  return (
    <div>
      <section className="bg-white px-5 md:px-10 py-6">
       {!token && 
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.h1 variants={h1} className="OUR-COURSES text-center font-black text-2xl md:text-4xl pt-20">
            Our Courses
          </motion.h1>
          <motion.p variants={p} className="md:w-1/2 mx-auto font-normal md:font-semibold text-sm md:text-base my-7 md:mb-14 text-center">Whether you are a beginner or you are looking to expand your career opportunities, our carefully selected and well taught courses give you the knowledge and experience that you need.</motion.p>
        </motion.div>}
        <div className={`courses gap-y-4 gap-x-4 ${token && "pt-20"}`}>
          {COURSES.map((course, index)=> (
            <Link key={index} to={course.courseName.toLowerCase()} className="">
            <div
              className={`rounded-xl`}
              data-aos-once="true"
              data-aos-duration="5000"
              data-aos="fade-up"
            >
              <div className="rounded-tr-2xl rounded-tl-2xl">
                <LazyLoadImage
                  src={course.image}
                  className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
                  alt={`Image for ${course.courseName} course`}
                />
              </div>
              <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
                <p className="font-bold text-white text-lg md:my-4 md:text-3xl line-clamp-1">{course.courseName}</p>
                <p className="my-2 font-bold text-base">{course.intro}</p>
                <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
                  {course.description}
                </p>
                <p className="font-bold my-5 text-lg md:text-xl">${course.price}</p>
              </div>
            </div>
          </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AllCourses