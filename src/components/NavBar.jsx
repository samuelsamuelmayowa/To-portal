import { useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { getAuth, signOut } from "firebase/auth";
import PropTypes from "prop-types";

import LOGO from "../assets/images/logo2.png";
import { app } from "../../firebase.config";
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";
import FetchAllStudents from "../hooks/FetchAllStudents";

const HIDE_THRESHOLD = 150;

const headerVariant = {
  visible: { y: 0 },
  hidden: {
    y: "-100%",
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const NAV_ITEMS = [
  { to: "/courses", label: "Courses" },
  { to: "/toskillab", label: "Interview Prep" },
  { to: "/trading-simulator", label: "Trading Simulator" },
  { to: "/toskillab/lab", label: "Splunk Lab" },
  { to: "/splunk-orientation", label: "Orientation" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/about", label: "About" },
  { to: "/career", label: "Career" },
];

const desktopLinkClass = ({ isActive }) =>
  `relative whitespace-nowrap py-2 text-sm font-medium transition-colors duration-200 ${
    isActive ? "text-PURPLE" : "text-slate-700 hover:text-BLUE"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex min-h-12 items-center rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
    isActive
      ? "bg-purple-50 text-PURPLE"
      : "text-slate-700 hover:bg-slate-50 hover:text-BLUE"
  }`;

const UserAvatar = ({ initial }) => (
  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-BLUE text-sm font-black text-white">
    {initial}
  </div>
);

const CartIcon = ({ itemCount }) => (
  <div className="relative grid h-11 w-11 place-items-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 hover:text-BLUE">
    <MdOutlineAddShoppingCart className="h-6 w-6" aria-hidden="true" />
    <span className="absolute right-0.5 top-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-BLUE px-1 text-[10px] font-bold leading-none text-white">
      {itemCount ?? 0}
    </span>
  </div>
);

const NavBar = () => {
  const { data } = FetchAllStudents();
  const { cartItem } = useContext(CartItemContext);
  const { token, setToken, FullScreen } = useStateContext();
  const [showMenu, setShowMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const auth = getAuth(app);

  useEffect(() => {
    const savedToken = localStorage.getItem("ACCESS_TOKEN");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setLocalUser(savedUser);
  }, [setToken]);

  // Close the drawer after every route change.
  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  // Close with Escape and prevent the page behind the drawer from scrolling.
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowMenu(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = showMenu ? "hidden" : "";

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (showMenu) {
      setHidden(false);
      return;
    }

    setHidden(latest > previous && latest > HIDE_THRESHOLD);
  });

  const currentUser = useMemo(() => {
    if (!data?.data?.response || !localUser) return null;

    const user = data.data.response.find((item) => item.email === localUser);
    if (!user) return null;

    return {
      fullname: user.name,
      email: user.email,
      initial: user.name
        .trim()
        .split(/\s+/)
        .map((word) => word[0]?.toUpperCase())
        .join("")
        .slice(0, 2),
    };
  }, [data, localUser]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("user");
      setToken(null);
      setLocalUser(null);
      setShowMenu(false);
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  return (
    <motion.header
      variants={headerVariant}
      animate={hidden && !FullScreen ? "hidden" : "visible"}
      className="fixed inset-x-0 top-0 z-[9999] border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:h-[72px] sm:px-5 lg:px-8 2xl:px-10">
        <Link to="/" className="shrink-0" aria-label="T.O. Analytics home">
          <motion.img
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            src={LOGO}
            className="h-auto w-[112px] object-contain sm:w-[145px] xl:w-[155px] 2xl:w-[175px]"
            alt="T.O. Analytics"
          />
        </Link>

        {/* The full navigation only appears when there is enough horizontal room. */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex 2xl:gap-5" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
              {item.label}
            </NavLink>
          ))}

          {token && currentUser && (
            <NavLink to="/dashboard" className={desktopLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/checkout" aria-label={`Cart with ${cartItem?.length ?? 0} items`}>
            <CartIcon itemCount={cartItem?.length} />
          </Link>

          {token && currentUser && (
            <div className="hidden max-w-[150px] items-center gap-2 2xl:flex">
              <UserAvatar initial={currentUser.initial} />
              <p className="truncate text-sm font-semibold text-slate-800">
                {currentUser.fullname}
              </p>
            </div>
          )}

          <div className="hidden xl:block">
            {token && currentUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="min-h-10 rounded-lg border border-BLUE bg-BLUE px-4 text-sm font-semibold text-white transition hover:bg-transparent hover:text-BLUE"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center rounded-lg border-2 border-BLUE bg-BLUE px-4 text-sm font-semibold text-white transition hover:bg-transparent hover:text-BLUE"
              >
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMenu((previous) => !previous)}
            className="grid h-11 w-11 place-items-center rounded-xl text-slate-800 transition hover:bg-slate-100 xl:hidden"
            aria-label={showMenu ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={showMenu}
            aria-controls="mobile-navigation"
          >
            {showMenu ? <FaXmark size={23} /> : <FaBarsStaggered size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-slate-950/30 sm:top-[72px] sm:h-[calc(100dvh-72px)] xl:hidden"
              aria-label="Close navigation menu"
            />

            <motion.nav
              id="mobile-navigation"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-slate-200 bg-white px-4 py-4 shadow-2xl sm:max-h-[calc(100dvh-72px)] sm:px-6 xl:hidden"
              aria-label="Mobile navigation"
            >
              {token && currentUser && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <UserAvatar initial={currentUser.initial} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {currentUser.fullname}
                    </p>
                    <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-1 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
                    {item.label}
                  </NavLink>
                ))}

                {token && currentUser && (
                  <NavLink to="/dashboard" className={mobileLinkClass}>
                    Dashboard
                  </NavLink>
                )}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                {token && currentUser ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="min-h-12 w-full rounded-xl bg-BLUE px-4 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-BLUE px-4 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

UserAvatar.propTypes = {
  initial: PropTypes.string,
};

CartIcon.propTypes = {
  itemCount: PropTypes.number,
};

export default NavBar;


// import { useState, useEffect, useContext, useMemo } from "react";
// import LOGO from "../assets/images/logo2.png";
// import { motion, useMotionValueEvent, useScroll } from "framer-motion";
// import CartItemContext from "../context/CartItemContext";
// import { useStateContext } from "../context/ContextProvider";
// import { Link, NavLink } from "react-router-dom";
// import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
// import { getAuth, signOut } from "firebase/auth";
// import { app } from "../../firebase.config";
// import FetchAllStudents from "../hooks/FetchAllStudents";
// import SearchCourseInput from "./SearchCourseInput";
// import PropTypes from "prop-types";
// import { MdOutlineAddShoppingCart } from "react-icons/md";

// const SCROLL_THRESHOLD = 20;
// const HIDE_THRESHOLD = 150;

// const headerVariant = {
//   visible: { y: 0 },
//   hidden: {
//     y: "-100%",
//     transition: { type: "linear", duration: 0.25 },
//   },
// };

// /* ---------------- USER AVATAR ---------------- */
// const UserAvatar = ({ initial }) => (
//   <div className="flex justify-center items-center w-8 aspect-square text-white font-black bg-BLUE rounded-full md:text-lg">
//     {initial}
//   </div>
// );

// /* ---------------- CART BADGE ---------------- */
// const CartIcon = ({ itemCount }) => (
//   <div className="relative cursor-pointer group">
//     <MdOutlineAddShoppingCart size={28} />
//     <span
//       className="absolute -top-2 -right-2 bg-BLUE text-white
//       border-2 border-white px-[6px] text-xs rounded-full font-bold
//       transition-transform duration-200 group-hover:scale-125"
//     >
//       {itemCount || "0"}
//     </span>
//   </div>
// );

// const NavBar = () => {
//   const { data } = FetchAllStudents();
//   const [showMenu, setShowMenu] = useState(false);
//   const [hidden, setHidden] = useState(false);
//   const { cartItem } = useContext(CartItemContext);
//   const { token, setToken, FullScreen } = useStateContext();
//   const [localuser, setUser] = useState(null);
//   const auth = getAuth(app);
//   const { scrollY } = useScroll();

//   /* ---------- LOAD TOKEN & USER ---------- */
//   useEffect(() => {
//     const savedToken = localStorage.getItem("ACCESS_TOKEN");
//     const savedUser = localStorage.getItem("user");

//     if (savedToken) setToken(savedToken);
//     if (savedUser) setUser(savedUser);
//   }, [setToken]);

//   /* ---------- SIGN OUT ---------- */
//   const handleSignOut = () => {
//     signOut(auth)
//       .then(() => {
//         localStorage.removeItem("ACCESS_TOKEN");
//         localStorage.removeItem("user");
//         setToken(null);
//         setUser(null);
//       })
//       .catch((err) => console.error("Sign out error:", err.message));
//   };

//   /* ---------- SCROLL HIDE ---------- */
//   useMotionValueEvent(scrollY, "change", (latest) => {
//     const previous = scrollY.getPrevious();
//     setHidden(latest > previous && latest > HIDE_THRESHOLD);
//   });

//   /* ---------- FIND USER ---------- */
//   const currentUser = useMemo(() => {
//     if (!data?.data?.response || !localuser) return null;

//     const user = data.data.response.find((u) => u.email === localuser);
//     if (!user) return null;

//     return {
//       fullname: user.name,
//       email: user.email,
//       initial: user.name
//         .split(" ")
//         .map((w) => w[0].toUpperCase())
//         .join(""),
//     };
//   }, [data, localuser]);

//   const toggleMenu = () => setShowMenu((prev) => !prev);

//   return (
//     <motion.header
//       variants={headerVariant}
//       animate={hidden && !FullScreen ? "hidden" : "visible"}
//       className="fixed top-0 left-0 right-0 z-[9999]
//       bg-white shadow-md px-4 md:px-10 py-3
//       flex items-center justify-between transition-all"
//     >
//       {/* LOGO */}
//       <Link to="/">
//         <motion.img
//           initial={{ x: -100, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 260, duration: 1.2 }}
//           src={LOGO}
//           className="w-[130px] md:w-[190px]"
//           alt="Logo"
//         />
//       </Link>

//       {/* SEARCH — only on desktop */}
//       {/* {token && (
//         <div className="hidden md:block w-[250px] lg:w-[300px]">
//           <SearchCourseInput />
//         </div>
//       )} */}

//       {/* DESKTOP NAV */}
//       <nav className="hidden md:flex items-center gap-8 text-[15px]">
//         <NavLink to="/courses" className="hover:text-BLUE">
//           Courses
//         </NavLink>

//         <NavLink
//           to="/toskillab"
//           className={({ isActive }) =>
//             isActive
//               ? "font-semibold text-PURPLE"
//               : "transition hover:text-PURPLE"
//           }
//         >
//           TO Skill Lab
//         </NavLink>





//  <NavLink
//           to="/trading-simulator"
//           className={({ isActive }) =>
//             isActive
//               ? "font-semibold"
//               : "transition"
//           }
//         >
//         Trading-Simulator
//         </NavLink>


//          <NavLink
//           to="/toskillab/lab"
//           className={({ isActive }) =>
//             isActive
//               ? "font-semibold"
//               : "transition"
//           }
//         >
//          Lab
//         </NavLink>

//         {/* <NavLink to="/toskillab" className="hover:text-BLUE">
//           ToskillLab
//         </NavLink> */}

//         <NavLink to="/splunk-orientation" className="hover:text-BLUE">
//           Orientation
//         </NavLink>

//         <NavLink to="/mentorship" className="hover:text-BLUE">
//           Mentorship
//         </NavLink>
//         <NavLink to="/about" className="hover:text-BLUE">
//           About
//         </NavLink>
//         <NavLink to="/career" className="hover:text-BLUE">
//           Career
//         </NavLink>

//         {token && currentUser ? (
//           <>
//             <NavLink to="/dashboard" className="hover:text-BLUE">
//               Dashboard
//             </NavLink>

//             {/* <NavLink to="/result" className="hover:text-BLUE">
//               My Results
//             </NavLink> */}

//             <button
//               onClick={handleSignOut}
//               className="border border-BLUE px-4 py-1 text-sm text-white bg-BLUE 
//                 hover:bg-transparent hover:text-BLUE rounded-lg"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <Link
//             to="/login"
//             className="border-2 border-BLUE bg-BLUE text-white px-4 py-1 
//               rounded-md font-semibold hover:bg-transparent hover:text-BLUE"
//           >
//             Login
//           </Link>
//         )}
//       </nav>

//       {/* RIGHT SIDE */}
//       <div className="flex items-center gap-4 md:gap-6">
//         <Link to="/checkout">
//           <CartIcon itemCount={cartItem?.length} />
//         </Link>

//         {token && currentUser && (
//           <div className="hidden md:flex items-center gap-2">
//             <UserAvatar initial={currentUser.initial} />
//             <p className="text-sm font-semibold">{currentUser.fullname}</p>
//           </div>
//         )}

//         {/* Mobile Menu Button */}
//         <button className="block md:hidden" onClick={toggleMenu}>
//           {showMenu ? <FaXmark size={22} /> : <FaBarsStaggered size={22} />}
//         </button>
//       </div>

//       {/* MOBILE MENU */}
//       {showMenu && (
//         <motion.div
//           initial={{ opacity: 0, y: -15 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -15 }}
//           transition={{ duration: 0.25 }}
//           className="absolute top-full left-0 right-0
//           bg-white shadow-lg border-t z-[99999]
//           flex flex-col gap-5 px-6 py-6 md:hidden"
//         >
//           <NavLink to="/courses" className="hover:text-BLUE">
//             Courses
//           </NavLink>

//           <NavLink
//             to="/toskillab"
//             onClick={() => setShowMenu(false)}
//             className={({ isActive }) =>
//               isActive
//                 ? "font-semibold text-PURPLE"
//                 : "transition hover:text-PURPLE"
//             }
//           >
//             TO Skill Lab
//           </NavLink>

//           {/* <NavLink to="/mentorship" className="hover:text-BLUE">
//             Mentorship
//           </NavLink> */}

//           <NavLink to="/about" className="hover:text-BLUE">
//             About
//           </NavLink>

//           <NavLink to="/career" className="hover:text-BLUE">
//             Career
//           </NavLink>

//           {token && currentUser ? (
//             <>
//               <NavLink to="/dashboard" className="hover:text-BLUE">
//                 Dashboard
//               </NavLink>

//               <button
//                 onClick={handleSignOut}
//                 className="border border-BLUE px-4 py-2 text-sm text-white 
//                   bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link
//               to="/login"
//               className="border-2 border-BLUE bg-BLUE text-white 
//                 px-4 py-2 rounded-md font-semibold text-center
//                 hover:bg-transparent hover:text-BLUE"
//             >
//               Login
//             </Link>
//           )}
//         </motion.div>
//       )}
//     </motion.header>
//   );
// };

// UserAvatar.propTypes = { initial: PropTypes.string };
// CartIcon.propTypes = { itemCount: PropTypes.number };

// export default NavBar;
