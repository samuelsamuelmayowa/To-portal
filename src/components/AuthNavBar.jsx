import { useState, useEffect } from 'react';
import LOGO from "../assets/images/logo.jpg";
import { motion } from 'framer-motion';
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { FaBarsStaggered } from "react-icons/fa6";
import { MdOutlineAddShoppingCart } from "react-icons/md"
import { FaSearch } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

const AuthNavBar = ({ signout }) => {
    const [fixed, setFixed] = useState("")
    const [cartItemNo, setCartItemNo] = useState([])
    useEffect(()=> {
        const data = JSON.parse(localStorage.getItem("COURSE-CART")) || []
        setCartItemNo(data)
    }, [])
    useEffect(()=> {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            scrollY > 20 ? setFixed("auth-fixed") : setFixed("");
          };
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [])
    const navBar = ()=> {
        setFixed("show")
    }
    return (
        <header className={`z-20 fixed w-[100%] left-0 top-0 px-2 py-2 md:px-10 bg-white flex items-center gap-10`}>
            <div>
                <Link to="/">
                    <motion.img initial={{x: -100, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{type:"spring", stiffness: 260, duration: 2000}} src={LOGO} className="md:w-[200px] w-[150px]" alt=""/>
                </Link>
            </div>
            <div className='relative search-box'>
                <FaSearch className='absolute' />
                <input type="text" name="search" id="search" className='border-[1px] md:border-2 border-black w-full h-10 rounded-sm md:rounded-3xl placeholder:font-semibold' placeholder='Search for anything' />
            </div>
            <nav className={`${fixed} md:relative md:left-0 duration-300 md:top-0 md:w-fit py-5 md:py-0 text-center`}>
                <ul className="md:flex items-center gap-6 font-normal text-sm">
                    <motion.li whileHover={{scale: 1.1}} transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="/dashboard/myCourses">My Courses</NavLink></motion.li>
                    <motion.li whileHover={{scale: 1.1}} transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="/courses">All Courses</NavLink></motion.li>
                    <motion.li whileHover={{scale: 1.1}} transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="/mentorship">Mentorship</NavLink></motion.li>
                    <motion.li whileHover={{scale: 1.1}} transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="/links">Links</NavLink></motion.li>
                    <button onClick={signout} className="md:hidden block my-3 hover:outline-2 hover:outline-offset-2 border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-2 py-1 md:px-3 md:py-2 rounded-md md:rounded-xl font-semibold">
                        Sign Out
                    </button>
                </ul>
            </nav>
            <div className="flex items-center gap-3">
                <Link to="checkout">
                    <div className='relative cursor-pointer group'>
                        <MdOutlineAddShoppingCart size={30} />
                        <p className="top-[-10px] group-hover:scale-[1.3] duration-200 ease-in-out right-[-10px] absolute text-white font-bold border-2 border-white px-2 rounded-full bg-BLUE z-10" >{cartItemNo.length}</p>
                        <div className="top-[-7px] group-hover:animate-ping duration-200 ease-in-out right-[-7px] absolute w-5 aspect-square rounded-full bg-BLUE z-[1]" ></div>
                        {cartItemNo.length > 0 && <div className="top-[-6px] animate-ping duration-200 ease-in-out right-[-5px] absolute w-5 aspect-square rounded-full bg-BLUE z-[1]" ></div>}
                    </div>
                </Link>
                <div className="flex-1 block md:hidden hamburger">
                    {fixed === "show" ? <FaXmark size={20} onClick={()=> setFixed("")} /> : <FaBarsStaggered size={20} onClick={navBar} />}
                </div>
                <div className='relative md:block hidden group'>
                    <img src="" className='w-8 aspect-square border-2 border-BLUE rounded-full' alt="profile pic" />
                    <div className='hidden group-hover:block absolute rounded-lg w-[250px] right-[-30px] top-8 bg-white shadow-lg'>
                        <div className='p-2 flex items-center gap-3 border-b-2 border-textColor'>
                            <img src="" className='w-8 aspect-square border-2 border-BLUE rounded-full' alt="profile pic" />
                            <div>
                                <p className='font-bold text-lg'>TIMI</p>
                                <p className='font-semibold text-xs'>timi@gmail.com</p>
                            </div>
                        </div>
                        <ul className='p-2 leading-[30px]'>
                            <motion.li transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="/dashboard">My Courses</NavLink></motion.li>
                            <motion.li transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="">All Courses</NavLink></motion.li>
                            <motion.li transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="">Mentorship</NavLink></motion.li>
                            <motion.li transition={{ stiffness:250}} ><NavLink className={({isActive})=> isActive ? "text-black font-black" : "scale-100 hover:text-BLUE"} to="">Links</NavLink></motion.li>
                            <li onClick={signout} className="my-3 hover:bg-transparent hover:text-BLUE duration-300 text-red-500 rounded-md md:rounded-xl font-semibold cursor-pointer">
                                Sign Out
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
  )
}

export default AuthNavBar