import { Link } from "react-router-dom";
import splunk from "../assets/images/splunk.png";
import EducationalConsulting from "../assets/images/mentorshipIMG.jpg";

const LiveCourses = () => {
  return (
    <div className="flex sm:flex-row flex-col pt-28 pb-10 justify-center gap-6 lg:px-52 p-2">
        <Link to={`/courses/splunk`} className="">
            <div
              className={`rounded-xl`}
              data-aos-once="true"
              data-aos-duration="5000"
              data-aos="fade-up"
            >
              <div className=" rounded-tr-2xl rounded-tl-2xl">
                <img
                  src={splunk}
                  className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
                  alt=""
                />
              </div>
              <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
                <p className="font-bold text-white text-lg md:my-4 md:text-xl">Splunk</p>
                <p className="my-2 font-bold text-sm">The Complete Splunk Bootcamp</p>
                <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
                    A comprehensive course on Linux. Learn, analyze and optimize with our splunk course  
                </p>
                <p className="font-bold my-5 text-lg md:text-xl">$3500</p>
              </div>
            </div>
        </Link>
        <Link to={`/courses/educational consulting`} className="">
            <div
              className={`rounded-xl`}
              data-aos-once="true"
              data-aos-duration="5000"
              data-aos="fade-up"
            >
              <div className=" rounded-tr-2xl rounded-tl-2xl">
                <img
                  src={EducationalConsulting}
                  className="rounded-tr-2xl rounded-tl-2xl w-full h-[200px] object-cover"
                  alt=""
                />
              </div>
              <div className="text-white p-4 rounded-bl-2xl rounded-br-2xl bg-BLUE">
                <p className="font-bold text-white text-lg md:my-4 md:text-xl">Educational Consulting</p>
                <p className="my-2 font-bold text-sm">Step by step guide to scholarships & more</p>
                <p className="line-clamp-2 text-sm md:text-base text-textColor md:max-w-[70%]">
                Everything you need to know on how to secure scholarships & get into masters & Phd programs 
                </p>
                <p className="font-bold my-5 text-lg md:text-xl">$250</p>
              </div>
            </div>
        </Link>
    </div>
  )
}

export default LiveCourses