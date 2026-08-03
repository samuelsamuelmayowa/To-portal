import { useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  MdDashboard,
  MdOutlineAnalytics,
  MdOutlineViewList,
} from "react-icons/md";

import {
  FaBell,
  FaGraduationCap,
  FaRegFilePdf,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

import {
  FaBarsStaggered,
  FaLink,
  FaMessage,
  FaUserGroup,
  FaXmark,
} from "react-icons/fa6";

import { useStateContext } from "../context/ContextProvider";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/ADMIN-DASHBOARD",
    icon: MdDashboard,
    end: true,
  },
  {
    name: "Courses",
    path: "/ADMIN-DASHBOARD/viewcourses",
    icon: MdOutlineViewList,
  },
//   {
//     name: "All Students",
//     path: "/ADMIN-DASHBOARD/allStudents",
//     icon: FaUsers,
//   },
  {
    name: "Students Result",
    path: "/ADMIN-DASHBOARD/studentresults",
    icon: FaGraduationCap,
  },
//   {
//     name: "Contacts",
//     path: "/ADMIN-DASHBOARD/contacts",
//     icon: FaUserGroup,
//   },
//   {
//     name: "Contractors",
//     path: "/ADMIN-DASHBOARD/contractors",
//     icon: MdOutlineAnalytics,
//   },
//   {
//     name: "Send Online Links",
//     path: "/ADMIN-DASHBOARD/send-links",
//     icon: FaLink,
//   },
//   {
//     name: "Send Assignment",
//     path: "/ADMIN-DASHBOARD/send-pdf",
//     icon: FaRegFilePdf,
//   },
//   {
//     name: "Messages",
//     path: "/ADMIN-DASHBOARD/send-messages",
//     icon: FaMessage,
//   },
];

const getPageTitle = (pathname) => {
  if (pathname.includes("/viewcourses")) return "Courses";
  if (pathname.includes("/allStudents")) return "All Students";
  if (pathname.includes("/studentresults")) return "Students Result";
  if (pathname.includes("/contacts")) return "Contacts";
  if (pathname.includes("/contractors")) return "Contractors";
  if (pathname.includes("/send-links")) return "Send Online Links";
  if (pathname.includes("/send-pdf")) return "Send Assignment";
  if (pathname.includes("/send-messages")) return "Messages";

  return "Dashboard";
};

const AdminLayout = () => {
  const { token } = useStateContext();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const SidebarContent = ({ closeSidebar }) => (
    <>
      <div className="flex h-24 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 font-black text-white shadow-lg shadow-indigo-500/30">
            A
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Management center
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Main menu
        </p>

        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  [
                    "group flex min-h-12 items-center gap-3 rounded-xl px-3.5",
                    "text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/40"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-lg transition",
                        isActive
                          ? "bg-white/15"
                          : "bg-white/5 group-hover:bg-white/10",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                    </span>

                    <span className="flex-1">{item.name}</span>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 font-black text-white">
              B
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                Boss
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-slate-950 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 28,
              }}
              className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-72 flex-col bg-slate-950 lg:hidden"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
              >
                <FaXmark size={22} />
              </button>

              <SidebarContent
                closeSidebar={() => setMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            >
              <FaBarsStaggered size={19} />
            </button>

            <div className="hidden min-w-44 sm:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin workspace
              </p>

              <h2 className="text-xl font-black tracking-tight text-slate-950">
                {pageTitle}
              </h2>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <FaSearch
                size={15}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search students, courses and records"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            >
              <FaBell size={17} />

              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white p-1.5 pr-4 shadow-sm md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-black text-white">
                {/* VB */}
              </div>

              <div>
                <p className="text-sm font-bold leading-tight text-slate-900">
                Big Boss
                </p>

                <p className="text-xs font-medium text-slate-400">Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

// import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom"
// import { MdDashboard, MdOutlineViewList, MdOutlineAnalytics } from "react-icons/md";
// import { FaUsers } from "react-icons/fa";
// import { FaUserGroup, FaBarsStaggered, FaXmark, FaLink, FaMessage  } from "react-icons/fa6";
// import { FaSearch, FaMicrophone } from "react-icons/fa";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useStateContext } from "../context/ContextProvider";

// const navVariant = {
//     initial: {
//         y: "-100%",
//     },
//     final: {
//         y: "40px",
//         transition: {
//             type:"linear", duration: 0.2, delayChildren: 0.3, staggerChildren: 0.3
//         }
//     }
// }

// const liVariant = {
//     initial: {
//         opacity: 0,
//         y: "-50px"
//     },
//     final: {
//         opacity: 1,
//         y: 0
//     }
// }

// const AdminLayout = () => {
//     const { token, FullScreen } = useStateContext();
//     const location = useLocation()
//     const [nav, showNav] = useState(false);
//     const displayNav = ()=> {
//         showNav(prev=> !prev)
//     }
//     if (!token) {
//         return <Navigate to="/" />
//     }   
//     return (
//         <>
//             <div className="grid grid-cols-1 lg:grid-cols-5 lg:min-h-screen">
//                 <div className="cursor-pointer w-full bg-white ml-auto flex justify-end items-end lg:hidden py-2 z-50 pr-3">{nav ? <FaXmark onClick={displayNav} size={30} /> : <FaBarsStaggered onClick={displayNav} size={30}/>}</div>
//                 <motion.div className={`${!nav && "top-[-100%] lg:top-0"} z-10 absolute w-full lg:relative lg:col-span-1 lg:bg-BLUE lg:flex justify-center lg:pt-20 lg:leading-[50px] leading-[40px]`}>
//                     <motion.ul variants={navVariant} animate={(nav && !FullScreen)? "final" : !FullScreen ? "initial" : "" } className="bg-BLUE font-semibold flex flex-col gap-1 md:gap-2 md:p-0 p-3">
//                         <motion.li variants={liVariant} className="">
//                             <NavLink className={({isActive})=> isActive && location.pathname === "/ADMIN-DASHBOARD" ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="/ADMIN-DASHBOARD">< MdDashboard size={20} />Dashboard</NavLink>
//                         </motion.li>
//                         <motion.li variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="viewcourses"><MdOutlineViewList size={20}/>Courses</NavLink>
//                         </motion.li>
//                         <motion.li variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="studentresults"><FaUsers size={20} /> Students Result</NavLink>
//                         </motion.li>
//                         <motion.li variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="contacts"><FaUserGroup size={20} /> Contacts</NavLink>
//                         </motion.li>
//                         <motion.li variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="contractors"><MdOutlineAnalytics size={20} />Contractors</NavLink>
//                         </motion.li>
//                         <motion.li variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="send-links"><FaLink size={20} /> Send Online Links</NavLink>
//                         </motion.li>

//                            <motion.li variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="send-pdf"><FaLink size={20} /> Send Assingment</NavLink>
//                         </motion.li>

//                         <motion.li className="items-end" variants={liVariant}>
//                             <NavLink className={({isActive})=> isActive ? "bg-white text-BLUE rounded-md flex gap-2 items-center md:px-3 px-1" : "text-white flex gap-2 items-center md:px-3 px-1"} to="send-messages"><FaMessage size={20} /> Messages</NavLink>
//                         </motion.li>
//                     </motion.ul>
//                 </motion.div>
//                 <div className="col-span-1 lg:col-span-4 md:p-0 p-2">
//                     <div className="md:p-5 p-2 flex items-center gap-3 md:gap-10  lg:gap-32">
//                         <h1 className="font-black text-sm md:text-3xl">Dashboard</h1>
//                         <div className="relative search-box flex-1">
//                             <input type="text" className="pl-10 bg-grayBG w-full h-10 rounded-md md:rounded-xl" placeholder="Search here" />
//                             <FaMicrophone size={20} className="absolute" />
//                             <FaSearch size={20} className="absolute" />
//                         </div>
//                         <div className="flex items-center gap-2 md:gap-3">
//                             <div className="hidden lg:block">
//                                 <p className="text-xs md:text-base font-medium">Vera Bassey</p>
//                                 <p className="text-xs md:text-base font-semibold">Admin</p>
//                             </div>
//                             <div className=" animate-bounce cursor-pointer bg-BLUE w-8 md:w-12 aspect-square rounded-full"></div>
//                         </div>
//                     </div>
//                     <div className={``}>
//                         <Outlet />
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

// export default AdminLayout