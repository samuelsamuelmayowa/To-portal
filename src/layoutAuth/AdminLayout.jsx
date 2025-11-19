import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom"
import { MdDashboard, MdOutlineViewList, MdOutlineAnalytics } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaUserGroup, FaBarsStaggered, FaXmark, FaLink, FaMessage  } from "react-icons/fa6";
import { FaSearch, FaMicrophone } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStateContext } from "../context/ContextProvider";

const navVariant = {
    initial: {
        y: "-100%",
    },
    final: {
        y: "40px",
        transition: {
            type:"linear", duration: 0.2, delayChildren: 0.3, staggerChildren: 0.3
        }
    }
}

const liVariant = {
    initial: {
        opacity: 0,
        y: "-50px"
    },
    final: {
        opacity: 1,
        y: 0
    }
}

const AdminLayout = () => {
    const { token, FullScreen } = useStateContext();
    const location = useLocation()
    const [nav, showNav] = useState(false);
    const displayNav = ()=> {
        showNav(prev=> !prev)
    }
    if (!token) {
        return <Navigate to="/" />
    }   
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:min-h-screen">
                <div className="cursor-pointer w-full bg-white ml-auto flex justify-end items-end lg:hidden py-2 z-50 pr-3">{nav ? <FaXmark onClick={displayNav} size={30} /> : <FaBarsStaggered onClick={displayNav} size={30}/>}</div>
                <motion.div className={`${!nav && "top-[-100%] lg:top-0"} z-10 absolute w-full lg:relative lg:col-span-1 lg:bg-BLUE lg:flex justify-center lg:pt-20 lg:leading-[50px] leading-[40px]`}>
                    <motion.ul variants={navVariant} animate={(nav && !FullScreen)? "final" : !FullScreen ? "initial" : "" } className="bg-BLUE font-semibold flex flex-col gap-1 md:gap-2 md:p-0 p-3">
                        <motion.li variants={liVariant} className="">
                            <NavLink className={({isActive})=> isActive && location.pathname === "/ADMIN-DASHBOARD" ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="/ADMIN-DASHBOARD">< MdDashboard size={20} />Dashboard</NavLink>
                        </motion.li>
                        <motion.li variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="viewcourses"><MdOutlineViewList size={20}/>Courses</NavLink>
                        </motion.li>
                        <motion.li variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="studentresults"><FaUsers size={20} /> Students Result</NavLink>
                        </motion.li>
                        <motion.li variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="contacts"><FaUserGroup size={20} /> Contacts</NavLink>
                        </motion.li>
                        <motion.li variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="contractors"><MdOutlineAnalytics size={20} />Contractors</NavLink>
                        </motion.li>
                        <motion.li variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="send-links"><FaLink size={20} /> Send Online Links</NavLink>
                        </motion.li>

                           <motion.li variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="send-pdf"><FaLink size={20} /> Send Assingment</NavLink>
                        </motion.li>

                        <motion.li className="items-end" variants={liVariant}>
                            <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="send-messages"><FaMessage size={20} /> Messages</NavLink>
                        </motion.li>
                    </motion.ul>
                </motion.div>
                <div className="col-span-1 lg:col-span-4 md:p-0 p-2">
                    <div className="md:p-5 p-2 flex items-center gap-3 md:gap-10  lg:gap-32">
                        <h1 className="font-black text-sm md:text-3xl">Dashboard</h1>
                        <div className="relative search-box flex-1">
                            <input type="text" className="pl-10 bg-grayBG w-full h-10 rounded-md md:rounded-xl" placeholder="Search here" />
                            <FaMicrophone size={20} className="absolute" />
                            <FaSearch size={20} className="absolute" />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden lg:block">
                                <p className="text-xs md:text-base font-medium">Vera Bassey</p>
                                <p className="text-xs md:text-base font-semibold">Admin</p>
                            </div>
                            <div className=" animate-bounce cursor-pointer bg-BLUE w-8 md:w-12 aspect-square rounded-full"></div>
                        </div>
                    </div>
                    <div className={``}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminLayout