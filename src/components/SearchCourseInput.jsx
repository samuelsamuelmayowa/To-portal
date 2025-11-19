import { useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import COURSES from "../coursesAPI/api"
import { useStateContext } from '../context/ContextProvider';

const searchVariant = {
    initial: { opacity: 0 },
    animate: { 
        opacity: 1, 
        transition: { 
            type: "spring", stiffness: 200, duration: 0.5, delayChildren: 1, staggerChildren: 1
        }
    }
}

const liVariant = {
    initial: { y: "-70px", opacity: 0 },
    animate: { y: 0, opacity: 1 }
}

const SearchCourseInput = () => {
    const { FullScreen } = useStateContext()
    const [search, setSearch] = useState("")
    const navigate = useNavigate()
    const displayCourse = (name)=> {
        navigate(`/courses/${name}`)
        setSearch("")
    }
    const handleSearch = (e)=> {
        const {value} = e.target
        setSearch(value)
    }
    const searchedData = COURSES.filter((course)=> {
        if (search.trim() === "") {
            return false;
        }
        return (course.courseName.toLowerCase()).includes(search.toLowerCase());
    })
    const searchCourse = (e)=> {
        e.preventDefault()
        if (searchedData.length === 1) {
            navigate(`/courses/${searchedData[0].courseName.toLowerCase()}`)
            setSearch("")
        }
    }
    return (
        <div className='relative search-box'>
            <FaSearch className='absolute' />
            <form onSubmit={searchCourse} action="">
                <input onChange={handleSearch} type="text" name="search" id="search" className='flex-[3] border-[1px] md:border-2 border-black w-full h-10 rounded-sm md:rounded-xl placeholder:font-semibold' placeholder='Search for anything' />
            </form>
            <motion.ul variants={searchVariant} animate={search ? "animate" : "initial"} className={`w-fit flex flex-col gap-3 md:gap-4 font-black p-3 rounded-md text-sm md:text-lg absolute left-0 right-0 bg-white ${searchedData.length > 0 && "shadow-lg"}`}>
                <AnimatePresence >
                    {(searchedData && searchedData.length > 0) && searchedData.map((course)=> (
                        <motion.li exit={{opacity: 0}} variants={liVariant} key={course.id} className={`whitespace-nowrap cursor-pointer duration-300 hover:text-BLUE`}>
                            <div onClick={()=> displayCourse(course.courseName.toLowerCase())} className={`flex items-center gap-3 duration-200 ${searchedData.length > 1 && "hover:md:gap-7"}`} to={`/courses/${(course.courseName).toLowerCase()}`}>
                                <FaSearch size={FullScreen ? 30 : 20} />
                                {course.courseName}
                            </div>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </motion.ul>
        </div>
    )
}

export default SearchCourseInput