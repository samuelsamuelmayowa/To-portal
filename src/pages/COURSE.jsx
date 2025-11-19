import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useContext, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";
import { Helmet } from 'react-helmet';


const courseName = {
  hidden: {
    opacity: 0,
    y: "-100px"
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring", stiffness: 200, duration: 0.8
    }
  }
}

const learnUl = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      type: "spring", duration: 0.3, staggerChildren: 0.3, delayChildren: 0.5
    }
  }
}

const li = {
  hidden: {
    opacity: 0,
    visibility: "invisible",
    y: "-80px"
  },
  visible: {
    opacity: 1,
    visibility: "visible",
    y: 0
  }
}

const COURSE = () => {
  const whatToLearnRef = useRef()
  const isInView = useInView(whatToLearnRef, {once: true})
  const location = useLocation()
  const navigate = useNavigate()
  const { FullScreen } = useStateContext()
  const { course } = useParams()
  const [showModal, setShowModal] = useState(false)
  const {COURSES, token, cartItem, addToCart, setCartItem} = useContext(CartItemContext);
  const [stockOptionIndex, setStockOptionIndex] = useState(()=> {
    if (location.pathname === "/courses/stock%20&%20options") return null
    else return;
  })

  const singleCourse = COURSES?.find((C)=> C.courseName.toLowerCase() === course)
  const stockAndOptions = COURSES?.find((course)=> course.courseName === singleCourse.courseName && location.pathname === "/courses/stock%20&%20options")
  const stockAndOptionsData = stockAndOptions?.otherSubCourses[stockOptionIndex]

  const addStockAndOptionSubCourses = (id)=> {
    if (singleCourse?.otherSubCourses.some((item)=> item.id === id) && !cartItem.some((item)=> item.id === id)) {
      toast.success(`successfully added to cart`)
      setCartItem(prev => [...prev, stockAndOptionsData])
    }
  }

  useEffect(()=> {
    localStorage.setItem("COURSE-CART", JSON.stringify(cartItem))
  },[cartItem]);

  const showModalAction = ()=> {
    setShowModal(prev=> !prev)
  }
  const removeModalAction = ()=> {
    setShowModal(false)
  }
  const stockAndOptionsFn = (index)=> {
    setStockOptionIndex(index)
  }
  const removeStockAndOptionFn = ()=> {
    setStockOptionIndex(null)
  }
  const buyCourse = ()=> {
    if (token) {
      navigate("/checkout")
    }
    else {
      navigate("/createAccount")
    }
  }
  return (
    <div className="">
      <section className="pt-10">
        <motion.h1 variants={courseName} initial="hidden" animate="visible" className="font-black text-center text-2xl md:text-3xl lg:text-4xl py-10 md:py-20">
        <Helmet>
                <meta charSet="utf-8" />
                <title>Courses</title>
                <link rel="canonical" href="https://www.to-analytics.com" />
                <meta name="description" content={"to-analytics is an educational platform empowering career growth through affordable courses in diverse fields like Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more."} />
                <meta property="og:description" content={"to-analytics is an educational platform empowering career growth through affordable courses in diverse fields like Splunk, Linux, Data Science, Stock & Options, Videography, Drone Technology, Educational Consulting, Photography, and more."} />
            </Helmet>
          {singleCourse.courseName.toUpperCase()}
        </motion.h1>
        <div className="px-5 md:px-10 py-10 md:py-16 grid grid-cols-1 gap-16 md:gap-0 md:grid-cols-2 bg-[#2d2065] text-white">
          <div className="w-full">
            <div className={`course-hover cursor-pointer w-fit`}>
              <h1 className={`font-semibold text-2xl md:text-4xl my-4 md:w-2/3`}>
                {singleCourse.intro}
                    <motion.div className={`fixed text-black md:w-[600px] w-[350px] z-[10] bg-white p-3 rounded-xl modal-shadow`}>
                      <h1 className="text-center font-black text-md md:text-2xl lg:text-3xl">
                        {singleCourse.courseName}
                      </h1>
                      <p className="font-semibold text-sm lg:text-lg my-2 md:my-4">
                        {singleCourse.intro}
                      </p>
                      <div className="modal-learn learn">
                        <ul className="text-sm">
                          {singleCourse.whatToLearn.map((whatToLearn, index)=> (
                            <li className="text-md md:text-base" key={index}>{whatToLearn}</li>
                          ))}
                        </ul>
                      </div>
                      {cartItem && cartItem?.some((item)=> item.id === singleCourse.id) ? 
                      <button onClick={()=>buyCourse()} className="text-sm md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
                        BUY COURSE
                      </button>
                      :
                      <button onClick={()=> addToCart(singleCourse)} className="text-sm md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
                        ADD TO CART
                      </button>
                      }  
                    </motion.div>
                    {showModal && (
                      <motion.div className={`fixed text-black md:w-[600px] w-[350px] h-auto z-[10] bg-white p-3 rounded-xl modal-shadow`}>
                      <div className="absolute right-4 top-4 md:hidden block">
                        <FaXmark className="" onClick={()=> removeModalAction()} />
                      </div>
                      <h1 className="text-center font-black text-md md:text-2xl lg:text-3xl">
                        {singleCourse.courseName}
                      </h1>
                      <p className="font-semibold text-sm lg:text-lg my-2 md:my-4">
                        {singleCourse.intro}
                      </p>
                      <div className="modal-learn">
                        <ul className="text-sm leading-[60px]">
                          {singleCourse.whatToLearn.map((whatToLearn, index)=> (
                            <li className="text-md md:text-base" key={index}>{whatToLearn}</li>
                          ))}
                        </ul>
                      </div>
                      {cartItem && cartItem.some((item)=> item.id === singleCourse.id) ? 
                      <button onClick={()=>buyCourse()} className="text-base md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
                        BUY COURSE
                      </button>
                      :
                      <button onClick={()=> addToCart(singleCourse)} className="text-base md:text-lg font-bold text-white bg-BLUE w-full my-4 px-2 py-3 md:py-2 rounded-md md:rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300">
                        ADD TO CART
                      </button>
                      }  
                    </motion.div>
                    )}
              </h1>
            </div>
            <p className="md:w-1/2 w-full text-base md:text-lg">
              {singleCourse.description}
            </p>
            <p className="md:my-6 my-4 font-bold md:text-3xl">${singleCourse.price}</p>
            <div className="">
              <button onClick={()=>showModalAction()} className="z-10 w-[120px] md:w-[150px] hover:bg-transparent border-2 hover:text-BLUE border-textColor duration-300 hover:bg-white md:mx-auto text-md md:text-xl font-semibold bg-BLUE text-white px-4 py-3 md:px-4 md:py-3 rounded-md">
                {showModal? "View Less" : "View More"}
              </button>
            </div>
          </div>
          <div className="perks">
            {location.pathname === "/courses/educational%20consulting" ? 
            <div>
              <h1 className="font-bold text-xl md:text-2xl">Consultation</h1>
              <p className="my-2 font-semibold text-sm md:text-lg">$250 . 1hour 30minutes</p>
            </div> 
            : 
            <ul className="text-[15px] md:text-[1.2rem] leading-10">
              <li>BEGINNER FRIENDLY</li>
              <li>LIFETIME ACCESS</li>
              <li>EXERCISES</li>
              <li>ACCESS ON MOBILE & DESKTOP</li>
              <li>CERTIFICATION</li>
            </ul>}
          </div>
        </div>
      </section>
      <section className="px-2 md:px-10 py-8 md:py-10">
        <h1 className="font-bold text-2xl md:text-4xl md:my-7 my-5">WHAT YOU’LL LEARN</h1>
        <motion.div ref={whatToLearnRef} transition={{duration: 0.4}} className="learn">
          {location.pathname === "/courses/stock%20&%20options" ?
          <>
              <motion.ul variants={learnUl} animate={isInView ? "visible" : "hidden"} className="md:w-[400px] md:text-base text-sm group">
              {singleCourse.whatToLearn.map((whatToLearn, index)=> (
                <motion.li variants={li} key={index} onMouseEnter={()=> stockAndOptionsFn(index)} onMouseLeave={()=>removeStockAndOptionFn()} className="relative flex gap-20 cursor-pointer">{whatToLearn}
                  {stockOptionIndex === index &&(<div className="stock-and-options z-10 absolute top-0 left-0 md:left-[300px] md:right-[-300px] bg-white shadow-xl rounded-lg p-3">
                    <h2 className="font-black text-base">{stockAndOptionsData?.name}</h2>
                    <div className="absolute right-4 top-4 md:hidden block">
                      <FaXmark className="" onClick={()=> setStockOptionIndex(null)} />
                    </div>
                    <div>
                      <p className="font-bold">${stockAndOptionsData?.price}</p>
                    </div>
                    <div className="flex items-center gap-3 font-md text-xs">
                      <p>{stockAndOptionsData?.duration} course</p>
                      <p className="">All levels</p>
                    </div>
                    <div className="my-3 text-sm">
                      <p className="text-slate-400">{stockAndOptionsData?.description}</p>
                    </div>
                    <div className="learn">
                      <ul className="text-sm">
                        {stockAndOptionsData?.whatToLearn.map((whatToLearn, index)=> (
                          <li key={index}>{whatToLearn}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      {cartItem?.some((item)=> item.id === stockAndOptionsData?.id) ? 
                        <button onClick={()=>buyCourse()} className="w-full border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-1 py-1 md:px-2 md:py-1 rounded-md md:rounded-xl font-semibold">BUY COURSE</button>
                        :
                        <button onClick={()=> addStockAndOptionSubCourses(stockAndOptionsData?.id)} className="w-full border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-1 py-1 md:px-2 md:py-1 rounded-md md:rounded-xl font-semibold">ADD TO CART</button>
                      }
                    </div>
                  </div>)}
                </motion.li>
              ))}
              </motion.ul>
          </>
          :
          FullScreen ? 
          <div className="relative learn grid grid-cols-1 md:grid-cols-2 py-5">
            <motion.ul className="md:text-base text-sm">
              {singleCourse.whatToLearn.slice(0, 6).map((whatToLearn, index)=> (
                <motion.li variants={li} className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
                </motion.li>
              ))}
            </motion.ul>
            <motion.ul className="md:text-base text-sm">
            {singleCourse.whatToLearn.slice(6).map((whatToLearn, index)=> (
              <motion.li variants={li} className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
              </motion.li>
            ))}
            </motion.ul>
          </div> 
          :
          <div className="relative learn py-5">
            <motion.ul className="md:text-base text-sm">
              {singleCourse.whatToLearn.slice(0, 6).map((whatToLearn, index)=> (
                <motion.li className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
                </motion.li>
              ))}
            </motion.ul>
            <motion.ul className="md:text-base text-sm">
            {singleCourse.whatToLearn.slice(6).map((whatToLearn, index)=> (
              <motion.li className="relative flex gap-20 cursor-pointer" key={index}>{whatToLearn}
              </motion.li>
            ))}
            </motion.ul>
          </div>
          }
        </motion.div>
        {location.pathname === "/courses/educational%20consulting" ? 
        <div className="py-5">
          <h1 className="font-bold text-2xl md:text-4xl md:my-5 my-3">
            Assistance & guidance at all stages
          </h1>
        </div> 
        : 
        <div className="py-5">
          <h1 className="font-bold text-2xl md:text-4xl md:my-5 my-3">
            No prior knowledge needed!
          </h1>
          <p className="p-4 md:text-base text-xs font-medium leading-7">
            You don&apos;t require prior knowledge of {singleCourse.courseName} to enroll in this course. We&apos;ll cover everything you need to know right from the basics, guiding you step by step.
          </p>
        </div>}
      </section>

      <Toaster position="top-center" />
    </div>
  );
};


export default COURSE;
