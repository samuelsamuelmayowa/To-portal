import { useState, useEffect, useContext, useMemo } from "react";
import LOGO from "../assets/images/logo2.png";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import CartItemContext from "../context/CartItemContext";
import { useStateContext } from "../context/ContextProvider";
import { Link, NavLink } from "react-router-dom";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebase.config";
import FetchAllStudents from "../hooks/FetchAllStudents";
import SearchCourseInput from "./SearchCourseInput";
import PropTypes from "prop-types";
import { MdOutlineAddShoppingCart } from "react-icons/md";

const SCROLL_THRESHOLD = 20;
const HIDE_THRESHOLD = 150;

const headerVariant = {
  visible: { y: 0 },
  hidden: {
    y: "-100%",
    transition: { type: "linear", duration: 0.25 },
  },
};

/* ---------------- USER AVATAR ---------------- */
const UserAvatar = ({ initial }) => (
  <div className="flex justify-center items-center w-8 aspect-square text-white font-black bg-BLUE rounded-full md:text-lg">
    {initial}
  </div>
);

/* ---------------- CART BADGE ---------------- */
const CartIcon = ({ itemCount }) => (
  <div className="relative cursor-pointer group">
    <MdOutlineAddShoppingCart size={28} />
    <span className="absolute -top-2 -right-2 bg-BLUE text-white
      border-2 border-white px-[6px] text-xs rounded-full font-bold
      transition-transform duration-200 group-hover:scale-125">
      {itemCount || "0"}
    </span>
  </div>
);

const NavBar = () => {
  const { data } = FetchAllStudents();
  const [showMenu, setShowMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { cartItem } = useContext(CartItemContext);
  const { token, setToken, FullScreen } = useStateContext();
  const [localuser, setUser] = useState(null);
  const auth = getAuth(app);
  const { scrollY } = useScroll();

  /* ---------- LOAD TOKEN & USER ---------- */
  useEffect(() => {
    const savedToken = localStorage.getItem("ACCESS_TOKEN");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(savedUser);
  }, [setToken]);

  /* ---------- SIGN OUT ---------- */
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .catch((err) => console.error("Sign out error:", err.message));
  };

  /* ---------- SCROLL HIDE ---------- */
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    setHidden(latest > previous && latest > HIDE_THRESHOLD);
  });

  /* ---------- FIND USER ---------- */
  const currentUser = useMemo(() => {
    if (!data?.data?.response || !localuser) return null;

    const user = data.data.response.find((u) => u.email === localuser);
    if (!user) return null;

    return {
      fullname: user.name,
      email: user.email,
      initial: user.name
        .split(" ")
        .map((w) => w[0].toUpperCase())
        .join(""),
    };
  }, [data, localuser]);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  return (
    <motion.header
      variants={headerVariant}
      animate={hidden && !FullScreen ? "hidden" : "visible"}
      className="fixed top-0 left-0 right-0 z-[9999]
      bg-white shadow-md px-4 md:px-10 py-3
      flex items-center justify-between transition-all"
    >
      {/* LOGO */}
      <Link to="/">
        <motion.img
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, duration: 1.2 }}
          src={LOGO}
          className="w-[130px] md:w-[190px]"
          alt="Logo"
        />
      </Link>

      {/* SEARCH — only on desktop */}
      {token && (
        <div className="hidden md:block w-[250px] lg:w-[300px]">
          <SearchCourseInput />
        </div>
      )}

      {/* DESKTOP NAV */}
      <nav className="hidden md:flex items-center gap-8 text-[15px]">
        <NavLink to="/courses" className="hover:text-BLUE">
          Courses
        </NavLink>
        <NavLink to="/mentorship" className="hover:text-BLUE">
          Mentorship
        </NavLink>
        <NavLink to="/about" className="hover:text-BLUE">
          About
        </NavLink>
        <NavLink to="/career" className="hover:text-BLUE">
          Career
        </NavLink>

        {token && currentUser ? (
          <>
            <NavLink to="/dashboard" className="hover:text-BLUE">
              Dashboard
            </NavLink>

            {/* <NavLink to="/result" className="hover:text-BLUE">
              My Results
            </NavLink> */}

            <button
              onClick={handleSignOut}
              className="border border-BLUE px-4 py-1 text-sm text-white bg-BLUE 
                hover:bg-transparent hover:text-BLUE rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="border-2 border-BLUE bg-BLUE text-white px-4 py-1 
              rounded-md font-semibold hover:bg-transparent hover:text-BLUE"
          >
            Login
          </Link>
        )}
      </nav>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/checkout">
          <CartIcon itemCount={cartItem?.length} />
        </Link>

        {token && currentUser && (
          <div className="hidden md:flex items-center gap-2">
            <UserAvatar initial={currentUser.initial} />
            <p className="text-sm font-semibold">{currentUser.fullname}</p>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button className="block md:hidden" onClick={toggleMenu}>
          {showMenu ? <FaXmark size={22} /> : <FaBarsStaggered size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="absolute top-full left-0 right-0
          bg-white shadow-lg border-t z-[99999]
          flex flex-col gap-5 px-6 py-6 md:hidden"
        >
          <NavLink to="/courses" className="hover:text-BLUE">
            Courses
          </NavLink>

          {/* <NavLink to="/mentorship" className="hover:text-BLUE">
            Mentorship
          </NavLink> */}

          <NavLink to="/about" className="hover:text-BLUE">
            About
          </NavLink>

          <NavLink to="/career" className="hover:text-BLUE">
            Career
          </NavLink>

          {token && currentUser ? (
            <>
              <NavLink to="/dashboard" className="hover:text-BLUE">
                Dashboard
              </NavLink>

              <button
                onClick={handleSignOut}
                className="border border-BLUE px-4 py-2 text-sm text-white 
                  bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="border-2 border-BLUE bg-BLUE text-white 
                px-4 py-2 rounded-md font-semibold text-center
                hover:bg-transparent hover:text-BLUE"
            >
              Login
            </Link>
          )}
        </motion.div>
      )}
    </motion.header>
  );
};

UserAvatar.propTypes = { initial: PropTypes.string };
CartIcon.propTypes = { itemCount: PropTypes.number };

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

// const UserAvatar = ({ initial }) => (
//   <div className="flex justify-center items-center w-8 md:text-lg aspect-square text-white font-black bg-BLUE rounded-full">
//     {initial}
//   </div>
// );

// const CartIcon = ({ itemCount }) => (
//   <div className="relative cursor-pointer group">
//     <MdOutlineAddShoppingCart size={30} />
//     <p className="top-[-10px] group-hover:scale-[1.3] duration-200 ease-in-out right-[-10px] absolute text-white font-bold border-2 border-white px-2 rounded-full bg-BLUE z-10">
//       {itemCount || "0"}
//     </p>
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

//   // ✅ load from localStorage
//   useEffect(() => {
//     const savedToken = localStorage.getItem("ACCESS_TOKEN");
//     const savedUser = localStorage.getItem("user");
//     if (savedToken) setToken(savedToken);
//     if (savedUser) setUser(savedUser);
//   }, [setToken]);

//   // ✅ sign out
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

//   // ✅ detect scroll
//   useMotionValueEvent(scrollY, "change", (latest) => {
//     const previous = scrollY.getPrevious();
//     setHidden(latest > previous && latest > HIDE_THRESHOLD);
//   });

//   // ✅ get user details
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
//       className="z-[9999] fixed top-0 left-0 right-0 bg-white shadow-md px-4 md:px-10 py-2 flex items-center justify-between"
//     >
//       {/* ✅ Logo */}
//       <Link to="/">
//         <motion.img
//           initial={{ x: -100, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 260, duration: 2 }}
//           src={LOGO}
//           className="md:w-[200px] w-[130px]"
//           alt="Logo"
//         />
//       </Link>

//       {/* ✅ Show search bar only if logged in */}
//       {token && (
//         <div className="hidden md:block">
//           <SearchCourseInput />
//         </div>
//       )}

//       {/* ✅ Desktop Nav */}
//       <nav className="hidden md:flex items-center gap-6">
//         <NavLink to="/courses" className="hover:text-BLUE">
//           Courses
//         </NavLink>

//         {/* ⭐ NEW: Public + Auth Access */}
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
           
//               <NavLink
//                className="hover:text-BLUE"
//                 to="/result"
//               >
              
//                 My Results
//               </NavLink>
            
//             <button
//               onClick={handleSignOut}
//               className="border border-BLUE px-3 py-1 text-sm text-white bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <Link
//             to="/login"
//             className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-3 py-1 rounded-md font-semibold"
//           >
//             Login
//           </Link>
//         )}
//       </nav>

//       {/* ✅ Right side */}
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

//         {/* Mobile menu icon */}
//         <div className="block md:hidden">
//           {showMenu ? (
//             <FaXmark size={22} onClick={toggleMenu} />
//           ) : (
//             <FaBarsStaggered size={22} onClick={toggleMenu} />
//           )}
//         </div>
//       </div>

//       {/* ✅ Mobile Dropdown Menu */}
//       {showMenu && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//           className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-[99999] flex flex-col items-start gap-4 px-6 py-4 md:hidden"
//         >
//           <NavLink to="/courses" className="hover:text-BLUE w-full">
//             Courses
//           </NavLink>

//           {/* ⭐ NEW: Mobile Mentorship Link */}
//           <NavLink to="/mentorship" className="hover:text-BLUE w-full">
//             Mentorship
//           </NavLink>

//           <NavLink to="/about" className="hover:text-BLUE w-full">
//             About
//           </NavLink>

//           <NavLink to="/career" className="hover:text-BLUE w-full">
//             Career
//           </NavLink>

//           {token && currentUser ? (
//             <>
//               <NavLink to="/dashboard" className="hover:text-BLUE w-full">
//                 Dashboard
//               </NavLink>

//               <button
//                 onClick={handleSignOut}
//                 className="border border-BLUE px-3 py-1 text-sm text-white bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg w-full text-left"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link
//               to="/login"
//               className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-3 py-1 rounded-md font-semibold w-full text-center"
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

// const UserAvatar = ({ initial }) => (
//   <div className="flex justify-center items-center w-8 md:text-lg aspect-square text-white font-black bg-BLUE rounded-full">
//     {initial}
//   </div>
// );

// const CartIcon = ({ itemCount }) => (
//   <div className="relative cursor-pointer group">
//     <MdOutlineAddShoppingCart size={30} />
//     <p className="top-[-10px] group-hover:scale-[1.3] duration-200 ease-in-out right-[-10px] absolute text-white font-bold border-2 border-white px-2 rounded-full bg-BLUE z-10">
//       {itemCount || "0"}
//     </p>
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

//   // ✅ load from localStorage
//   useEffect(() => {
//     const savedToken = localStorage.getItem("ACCESS_TOKEN");
//     const savedUser = localStorage.getItem("user");
//     if (savedToken) setToken(savedToken);
//     if (savedUser) setUser(savedUser);
//   }, [setToken]);

//   // ✅ sign out
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

//   // ✅ detect scroll
//   useMotionValueEvent(scrollY, "change", (latest) => {
//     const previous = scrollY.getPrevious();
//     setHidden(latest > previous && latest > HIDE_THRESHOLD);
//   });

//   // ✅ get user details
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
//       className="z-[9999] fixed top-0 left-0 right-0 bg-white shadow-md px-4 md:px-10 py-2 flex items-center justify-between"
//     >
//       {/* ✅ Logo */}
//       <Link to="/">
//         <motion.img
//           initial={{ x: -100, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 260, duration: 2 }}
//           src={LOGO}
//           className="md:w-[200px] w-[130px]"
//           alt="Logo"
//         />
//       </Link>

//       {/* ✅ Show search bar only if logged in */}
//       {token && <div className="hidden md:block"><SearchCourseInput /></div>}

//       {/* ✅ Desktop Nav */}
//       <nav className="hidden md:flex items-center gap-6">
//         <NavLink to="/courses" className="hover:text-BLUE">
//           Courses
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
//             <button
//               onClick={handleSignOut}
//               className="border border-BLUE px-3 py-1 text-sm text-white bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg"
//             >
//               Logout
//             </button>
//           </>
//         ) : (
//           <Link
//             to="/login"
//             className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-3 py-1 rounded-md font-semibold"
//           >
//             Login
//           </Link>
//         )}
//       </nav>

//       {/* ✅ Right section (Cart + Avatar + Mobile Icon) */}
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
//         {/* Hamburger */}
//         <div className="block md:hidden">
//           {showMenu ? (
//             <FaXmark size={22} onClick={toggleMenu} />
//           ) : (
//             <FaBarsStaggered size={22} onClick={toggleMenu} />
//           )}
//         </div>
//       </div>

//       {/* ✅ Mobile Dropdown Menu */}
//       {showMenu && (
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//           className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-[99999] flex flex-col items-start gap-4 px-6 py-4 md:hidden"
//         >
//           <NavLink to="/courses" className="hover:text-BLUE w-full">
//             Courses
//           </NavLink>
//           <NavLink to="/about" className="hover:text-BLUE w-full">
//             About
//           </NavLink>
//           <NavLink to="/career" className="hover:text-BLUE w-full">
//             Career
//           </NavLink>

//           {token && currentUser ? (
//             <>
//               <NavLink to="/dashboard" className="hover:text-BLUE w-full">
//                 Dashboard
//               </NavLink>
//               <button
//                 onClick={handleSignOut}
//                 className="border border-BLUE px-3 py-1 text-sm text-white bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg w-full text-left"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link
//               to="/login"
//               className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-3 py-1 rounded-md font-semibold w-full text-center"
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

// const UserAvatar = ({ initial }) => (
//   <div className="flex justify-center items-center w-8 md:text-lg aspect-square text-white font-black bg-BLUE rounded-full">
//     {initial}
//   </div>
// );

// const CartIcon = ({ itemCount }) => (
//   <div className="relative cursor-pointer group">
//     <MdOutlineAddShoppingCart size={30} />
//     <p className="top-[-10px] group-hover:scale-[1.3] duration-200 ease-in-out right-[-10px] absolute text-white font-bold border-2 border-white px-2 rounded-full bg-BLUE z-10">
//       {itemCount || "0"}
//     </p>
//   </div>
// );

// const NavBar = () => {
//   const { data } = FetchAllStudents();
//   const [showMenu, setShowMenu] = useState(false);
//   const [hidden, setHidden] = useState(false);
//   const [fixed, setFixed] = useState(false);

//   const { cartItem } = useContext(CartItemContext);
//   const { token, setToken, user, setUser, FullScreen } = useStateContext();

//   const auth = getAuth(app);
//   const { scrollY } = useScroll();

//   // ✅ Keep context synced with localStorage
//   useEffect(() => {
//     const savedToken = localStorage.getItem("ACCESS_TOKEN");
//     const savedUser = localStorage.getItem("user");

//     if (savedToken && !token) setToken(savedToken);
//     if (savedUser && !user?.email) {
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch {
//         setUser({ email: savedUser });
//       }
//     }
//   }, [token, user, setToken, setUser]);

//   // ✅ Logout handler
//   const handleSignOut = () => {
//     signOut(auth)
//       .then(() => {
//         localStorage.removeItem("ACCESS_TOKEN");
//         localStorage.removeItem("user");
//         setToken(null);
//         setUser({});
//       })
//       .catch((err) => console.error("Sign out error:", err.message));
//   };

//   // ✅ Scroll behavior
//   useEffect(() => {
//     const handleScroll = () => setFixed(window.scrollY > SCROLL_THRESHOLD);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useMotionValueEvent(scrollY, "change", (latest) => {
//     const previous = scrollY.getPrevious();
//     setHidden(latest > previous && latest > HIDE_THRESHOLD);
//   });

//   // ✅ Find current user
//   const currentUser = useMemo(() => {
//     if (!data?.data?.response || !user?.email) return null;
//     const found = data.data.response.find((u) => u.email === user.email);
//     if (!found) return null;
//     return {
//       fullname: found.name,
//       email: found.email,
//       initial: found.name
//         .split(" ")
//         .map((w) => w[0].toUpperCase())
//         .join(""),
//     };
//   }, [data, user]);

//   const toggleMenu = () => setShowMenu((prev) => !prev);

//   return (
//     <motion.header
//       variants={headerVariant}
//       animate={hidden && !FullScreen ? "hidden" : "visible"}
//       className={`z-[9999] ${
//         fixed ? "fixed" : "relative"
//       } top-0 right-0 left-0 bg-white px-2 py-2 md:px-10 flex items-center justify-between`}
//     >
//       {/* ✅ Logo */}
//       <Link to="/">
//         <motion.img
//           initial={{ x: -100, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 260, duration: 2 }}
//           src={LOGO}
//           className="md:w-[200px] w-[130px]"
//           alt="Logo"
//         />
//       </Link>

//       {/* ✅ Search bar when logged in */}
//       {token && <SearchCourseInput />}

//       {/* ✅ Nav Links (shown for both logged in & guests) */}
//       <nav
//         className={`md:flex items-center gap-4 ${
//           showMenu ? "block" : "hidden"
//         } md:block`}
//       >
//         <NavLink to="/courses" className="hover:text-BLUE">
//           Courses
//         </NavLink>
//         <NavLink to="/about" className="hover:text-BLUE">
//           About
//         </NavLink>
//         <NavLink to="/career" className="hover:text-BLUE">
//           Career
//         </NavLink>

//         {/* ✅ Additional links if logged in */}
//         {token && (
//           <>
//             <NavLink to="/dashboard" className="hover:text-BLUE">
//               Dashboard
//             </NavLink>
//             <NavLink to="/mentorship" className="hover:text-BLUE">
//               Mentorship
//             </NavLink>
//             <button
//               onClick={handleSignOut}
//               className="border border-BLUE px-3 py-1 text-sm text-white bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg"
//             >
//               Logout
//             </button>
//           </>
//         )}

//         {/* ✅ Login for guests */}
//         {!token && (
//           <Link
//             to="/login"
//             className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-3 py-1 rounded-md font-semibold"
//           >
//             Login
//           </Link>
//         )}
//       </nav>

//       {/* ✅ Right side (Cart + Avatar + Menu) */}
//       <div className="flex items-center gap-6">
//         <Link to="/checkout">
//           <CartIcon itemCount={cartItem?.length} />
//         </Link>

//         {token && currentUser && (
//           <div className="flex items-center gap-2">
//             <UserAvatar initial={currentUser.initial} />
//             <p className="hidden md:block text-sm font-semibold">
//               {currentUser.fullname}
//             </p>
//           </div>
//         )}

//         <div className="block md:hidden">
//           {showMenu ? (
//             <FaXmark size={20} onClick={toggleMenu} />
//           ) : (
//             <FaBarsStaggered size={20} onClick={toggleMenu} />
//           )}
//         </div>
//       </div>
//     </motion.header>
//   );
// };

// UserAvatar.propTypes = { initial: PropTypes.string };
// CartIcon.propTypes = { itemCount: PropTypes.number };

// export default NavBar;

// import { useState, useEffect, useContext, useMemo } from 'react';
// import LOGO from "../assets/images/logo2.png";
// import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
// import CartItemContext from '../context/CartItemContext';
// import { useStateContext } from "../context/ContextProvider";
// import { Link, NavLink } from "react-router-dom";
// import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
// import { getAuth, signOut } from "firebase/auth";
// import { app } from "../../firebase.config";
// import FetchAllStudents from '../hooks/FetchAllStudents';
// import SearchCourseInput from './SearchCourseInput';
// import PropTypes from "prop-types";
// import { MdOutlineAddShoppingCart } from "react-icons/md";
// import { FaChevronDown } from "react-icons/fa";

// const SCROLL_THRESHOLD = 20;
// const HIDE_THRESHOLD = 150;

// const headerVariant = {
//   visible: { y: 0 },
//   hidden: {
//     y: "-100%",
//     transition: { type: "linear", duration: 0.25 }
//   }
// };

// // ✅ simple reusable subcomponents
// const UserAvatar = ({ initial }) => (
//   <div className="flex justify-center items-center w-8 md:text-lg aspect-square text-white font-black bg-BLUE rounded-full">
//     {initial}
//   </div>
// );

// const CartIcon = ({ itemCount }) => (
//   <div className='relative cursor-pointer group'>
//     <MdOutlineAddShoppingCart size={30} />
//     <p className="top-[-10px] group-hover:scale-[1.3] duration-200 ease-in-out right-[-10px] absolute text-white font-bold border-2 border-white px-2 rounded-full bg-BLUE z-10">
//       {itemCount || "0"}
//     </p>
//   </div>
// );

// const NavBar = () => {
//   const { data } = FetchAllStudents();
//   const [show, setShow] = useState("");
//   const [hidden, setHidden] = useState(false);
//   const [subMenu, setSubMenu] = useState(false);
//   const [fixed, setFixed] = useState("");
//   const { cartItem } = useContext(CartItemContext);
//   const { token, setToken, FullScreen } = useStateContext();
//   const [localuser, setUser] = useState(null);
//   const auth = getAuth(app);
//   const { scrollY } = useScroll();

//   // ✅ get user from localStorage (reliable fix)
//   useEffect(() => {
//     const savedToken = localStorage.getItem("ACCESS_TOKEN");
//     const savedUser = localStorage.getItem("user");
//     if (savedToken) setToken(savedToken);
//     if (savedUser) setUser(savedUser);
//   }, [setToken]);

//   // ✅ sign out
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

//   // ✅ detect scroll
//   useEffect(() => {
//     const handleScroll = () => setFixed(window.scrollY > SCROLL_THRESHOLD ? "fixed" : "");
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useMotionValueEvent(scrollY, "change", (latest) => {
//     const previous = scrollY.getPrevious();
//     setHidden(latest > previous && latest > HIDE_THRESHOLD);
//   });

//   // ✅ derive current user data
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

//   const toggleMenu = () => setShow(prev => prev === "show" ? "" : "show");
//   const toggleSubMenu = () => setSubMenu(prev => !prev);

//   return (
//     <motion.header
//       variants={headerVariant}
//       animate={(hidden && !FullScreen) ? "hidden" : "visible"}
//       className={`z-[9999] fixed right-0 left-0 top-0 bg-white ${!token && "md:bg-opacity-50"} px-2 py-2 md:px-10 flex items-center ${token ? "gap-10" : "justify-between"}`}>

//       {/* ✅ Logo */}
//       <div>
//         <Link to="/">
//           <motion.img
//             initial={{ x: -100, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 260, duration: 2 }}
//             src={LOGO}
//             className="md:w-[200px] w-[130px]"
//             alt="Logo"
//           />
//         </Link>
//       </div>

//       {/* ✅ Search bar visible only when logged in */}
//       {token && <SearchCourseInput />}

//       {/* ✅ Authenticated vs Guest Nav */}
//       {token && currentUser ? (
//         <nav className="flex items-center gap-4">
//           <NavLink to="/dashboard" className="hover:text-BLUE">Dashboard</NavLink>
//           <NavLink to="/courses" className="hover:text-BLUE">Courses</NavLink>
//           <NavLink to="/mentorship" className="hover:text-BLUE">Mentorship</NavLink>
//           <button
//             onClick={handleSignOut}
//             className="border border-BLUE px-3 py-1 text-sm text-white bg-BLUE hover:bg-transparent hover:text-BLUE rounded-lg">
//             Logout
//           </button>
//         </nav>
//       ) : (
//         <nav className="flex items-center gap-4">
//           <NavLink to="/courses" className="hover:text-BLUE">Courses</NavLink>
//           <NavLink to="/about" className="hover:text-BLUE">About</NavLink>
//           <NavLink to="/career" className="hover:text-BLUE">Career</NavLink>
//           <Link to="/login" className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-3 py-1 rounded-md font-semibold">
//             Login
//           </Link>
//         </nav>
//       )}

//       {/* ✅ Right section: Cart + Avatar + Menu toggle */}
//       <div className="flex items-center gap-6">
//         <Link to="/checkout">
//           <CartIcon itemCount={cartItem?.length} />
//         </Link>
//         {token && currentUser && (
//           <div className="flex items-center gap-2">
//             <UserAvatar initial={currentUser.initial} />
//             <p className="hidden md:block text-sm font-semibold">{currentUser.fullname}</p>
//           </div>
//         )}
//         <div className="flex-1 block md:hidden hamburger">
//           {show === "show" ? (
//             <FaXmark size={20} onClick={toggleMenu} />
//           ) : (
//             <FaBarsStaggered size={20} onClick={toggleMenu} />
//           )}
//         </div>
//       </div>
//     </motion.header>
//   );
// };

// // PropTypes (optional cleanup)
// UserAvatar.propTypes = { initial: PropTypes.string };
// CartIcon.propTypes = { itemCount: PropTypes.number };

// export default NavBar;

// .................... this the normal one below ............................
// import { useState, useEffect, useContext, useMemo } from 'react';
// import LOGO from "../assets/images/logo2.png";
// import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
// import CartItemContext from '../context/CartItemContext';
// import { useStateContext } from "../context/ContextProvider";
// import { Link, NavLink } from "react-router-dom";
// import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
// import { FaChevronDown } from "react-icons/fa";
// import { MdOutlineAddShoppingCart } from "react-icons/md";
// import { getAuth, signOut } from "firebase/auth";
// import { app } from "../../firebase.config";
// import FetchAllStudents from '../hooks/FetchAllStudents';
// import SearchCourseInput from './SearchCourseInput';
// import PropTypes from "prop-types";

// const SCROLL_THRESHOLD = 20;
// const HIDE_THRESHOLD = 150;

// const headerVariant = {
//     visible: { y: 0 },
//     hidden: {
//         y: "-100%",
//         transition: { type: "linear", duration: 0.25 }
//     }
// };

// const UserAvatar = ({ initial, animate = false }) => (
//     <div className={`${animate ? 'animate-bounce' : ''} flex justify-center items-center w-8 md:text-lg aspect-square text-white font-black bg-BLUE rounded-full`}>
//         {initial}
//     </div>
// );

// const CartIcon = ({ itemCount }) => (
//     <div className='relative cursor-pointer group'>
//         <MdOutlineAddShoppingCart size={30} />
//         <p className="top-[-10px] group-hover:scale-[1.3] duration-200 ease-in-out right-[-10px] absolute text-white font-bold border-2 border-white px-2 rounded-full bg-BLUE z-10">
//             {itemCount || "0"}
//         </p>
//         <div className="top-[-6px] group-hover:animate-ping duration-200 ease-in-out right-[-6px] absolute w-5 aspect-square rounded-full bg-BLUE z-[1]"></div>
//         {itemCount > 0 && (
//             <div className="top-[-6px] right-[-6px] animate-ping duration-200 ease-in-out absolute w-5 aspect-square rounded-full bg-BLUE z-[1]"></div>
//         )}
//     </div>
// );

// const AuthenticatedNav = ({ show, fixed, fullname, email, initial, signout }) => (
//     <nav className={`px-4 ${fixed} ${show} auth-nav md:relative md:left-0 md:right-0 duration-300 md:top-0 md:w-fit py-5 md:py-0 text-center`}>
//         <div className='pl-2 block md:hidden text-left mb-4'>
//             <Link to="/myProfile">
//                 <div className='flex items-center gap-3'>
//                     <UserAvatar initial={initial} animate />
//                     <div>
//                         <p className='font-semibold text-md'>{fullname}</p>
//                         <p className='font-semibold text-xs text-slate-400'>{email}</p>
//                     </div>
//                 </div>
//             </Link>
//         </div>

//         <ul className="md:hidden lg:flex flex lg:flex-row flex-col items-center gap-3 md:gap-6 font-normal text-sm">
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "text-BLUE font-black" : "hover:text-BLUE"}
//                     to="/dashboard"
//                 >
//                     My Courses
//                 </NavLink>
//             </motion.li>
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "text-BLUE font-black" : "hover:text-BLUE"}
//                     to="/courses">
//                     All Courses
//                 </NavLink>
//             </motion.li>
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "text-BLUE font-black" : "hover:text-BLUE"}
//                     to="/dashboard/comment"
//                 >
//                     Comment
//                 </NavLink>
//             </motion.li>
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "text-BLUE font-black" : "hover:text-BLUE"}
//                     to="/mentorship"
//                 >
//                     Mentorship
//                 </NavLink>
//             </motion.li>

//             <button
//                 onClick={signout}
//                 className="w-full md:hidden block my-3 hover:outline-2 hover:outline-offset-2 border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-2 py-1 md:px-3 md:py-2 rounded-md md:rounded-xl font-semibold mx-auto"
//             >
//                 Sign Out
//             </button>
//         </ul>
//     </nav>
// );

// const GuestNav = ({ show, fixed, subMenu, displaySubMenu, FullScreen }) => (
//     <nav className={`${fixed} ${show} md:relative md:left-0 md:right-0 duration-300 md:top-0 md:w-fit py-5 md:py-0 text-center`}>
//         <ul className="px-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 font-semibold">
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "font-black text-BLUE scale-110" : "hover:text-BLUE"}
//                     to="/courses">
//                     Courses
//                 </NavLink>
//             </motion.li>
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "font-black text-BLUE scale-110" : "hover:text-BLUE"}
//                     to="/about">
//                     About
//                 </NavLink>
//             </motion.li>

//             <motion.li
//                 onClick={displaySubMenu}
//                 whileHover={{ scale: 1.1 }}
//                 transition={{ stiffness: 250 }}
//                 className='group relative'
//             >
//                 <p className='flex gap-1 items-center justify-center cursor-pointer'>
//                     Company
//                     <FaChevronDown className={`duration-200 ${subMenu ? "rotate-180" : ""} ${FullScreen ? "group-hover:rotate-180" : ""}`} />
//                 </p>
//                 {(subMenu && !FullScreen) ? (
//                     <ul className="bg-white md:p-4 rounded-md duration-200 mt-2 flex flex-col gap-3">
//                         <li><NavLink to="/career" className={({ isActive }) => isActive ? "font-black text-BLUE" : "hover:text-BLUE"}>Career</NavLink></li>
//                         <li><NavLink to="/partner" className={({ isActive }) => isActive ? "font-black text-BLUE" : "hover:text-BLUE"}>Partners</NavLink></li>
//                     </ul>
//                 ) : FullScreen && (
//                     <ul className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-white md:p-2 rounded-md duration-200 shadow-md text-left min-w-[120px]">
//                         <li className="hover:bg-gray-50 px-2 py-1">
//                             <NavLink to="/career" className={({ isActive }) => isActive ? "font-black text-BLUE" : "hover:text-BLUE"}>Career</NavLink>
//                         </li>
//                         <li className="hover:bg-gray-50 px-2 py-1">
//                             <NavLink to="/partner" className={({ isActive }) => isActive ? "font-black text-BLUE" : "hover:text-BLUE"}>Partners</NavLink>
//                         </li>
//                     </ul>
//                 )}
//             </motion.li>

//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "font-black text-BLUE scale-110" : "hover:text-BLUE"}
//                     to="/blog"
//                 >
//                     Blog
//                 </NavLink>
//             </motion.li>
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "font-black text-BLUE scale-110" : "hover:text-BLUE"}
//                     to="/contact"
//                 >
//                     Contact
//                 </NavLink>
//             </motion.li>
//             <motion.li whileHover={{ scale: 1.1 }} transition={{ stiffness: 250 }}>
//                 <NavLink
//                     className={({ isActive }) => isActive ? "font-black text-BLUE scale-110" : "hover:text-BLUE"}
//                     to="/sessions"
//                 >
//                     Comment
//                 </NavLink>
//             </motion.li>

//             <Link to="/login" className='md:hidden block w-full'>
//                 <button className="w-full border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-4 py-1 md:px-6 md:py-3 rounded-md md:rounded-3xl font-semibold">
//                     Login
//                 </button>
//             </Link>
//         </ul>
//     </nav>
// );

// const UserDropdown = ({ initial, fullname, email, signout, FullScreen }) => (
//     <div className='flex-1 md:block hidden group'>
//         <UserAvatar initial={initial} />
//         <div className='invisible opacity-0 group-hover:visible group-hover:opacity-100 duration-300 absolute rounded-lg w-[250px] right-[20px] top-16 bg-white shadow-lg'>
//             {/* Profile Header */}
//             <div className='p-3 flex items-center gap-3 border-b-2 border-textColor'>
//                 <UserAvatar initial={initial} animate />
//                 <div>
//                     <p className='font-semibold text-md'>{fullname}</p>
//                     <p className='font-semibold text-xs text-slate-400'>{email}</p>
//                 </div>
//             </div>

//             <ul className='font-semibold p-3 leading-[30px]'>
//                 <motion.li transition={{ stiffness: 250 }}>
//                     <NavLink
//                         className={({ isActive }) => isActive ? "text-black font-black" : "hover:text-BLUE"}
//                         to="/myProfile">
//                         My Profile
//                     </NavLink>
//                 </motion.li>

//                 {!FullScreen && (
//                     <>
//                         <motion.li transition={{ stiffness: 250 }}>
//                             <NavLink
//                                 className={({ isActive }) => isActive ? "text-black font-black" : "hover:text-BLUE"}
//                                 to="/dashboard"
//                             >
//                                 My Courses
//                             </NavLink>
//                         </motion.li>
//                         <motion.li transition={{ stiffness: 250 }}>
//                             <NavLink
//                                 className={({ isActive }) => isActive ? "text-black font-black" : "hover:text-BLUE"}
//                                 to="/courses">
//                                 All Courses
//                             </NavLink>
//                         </motion.li>
//                         <motion.li transition={{ stiffness: 250 }}>
//                             <NavLink
//                                 className={({ isActive }) => isActive ? "text-black font-black" : "hover:text-BLUE"}
//                                 to="/mentorship"
//                             >
//                                 Mentorship
//                             </NavLink>
//                         </motion.li>
//                         <motion.li transition={{ stiffness: 250 }}>
//                             <NavLink
//                                 className={({ isActive }) => isActive ? "text-black font-black" : "hover:text-BLUE"}
//                                 to="/dashboard/links"
//                             >
//                                 Class Materials
//                             </NavLink>
//                         </motion.li>
//                     </>
//                 )}

//                 <motion.li transition={{ stiffness: 250 }}>
//                     <NavLink
//                         className={({ isActive }) => isActive ? "text-black font-black" : "hover:text-BLUE"}
//                         to="/result"
//                     >
//                         My Results
//                     </NavLink>
//                 </motion.li>

//                 <li
//                     onClick={signout}
//                     className="hover:bg-transparent hover:text-BLUE duration-300 text-red-500 rounded-md md:rounded-xl font-semibold cursor-pointer"
//                 >
//                     Sign Out
//                 </li>
//             </ul>
//         </div>
//     </div>
// );

// const NavBar = () => {
//     const { data } = FetchAllStudents();
//     const [show, setShow] = useState("");
//     const [hidden, setHidden] = useState(false);
//     const [subMenu, setSubMenu] = useState(false);
//     const [fixed, setFixed] = useState("");
//     const { cartItem } = useContext(CartItemContext);
//     const { token, setToken, FullScreen } = useStateContext();
//     const [localuser, setUser] = useState("");
//     const auth = getAuth(app);
//     const { scrollY } = useScroll();

//     // Handle sign out
//     const handleSignOut = () => {
//         signOut(auth)
//             .then(() => {
//                 window.localStorage.removeItem("ACCESS_TOKEN");
//                 window.localStorage.removeItem("user");
//                 setToken(null);
//             })
//             .catch((err) => console.error("Sign out error:", err.message));
//     };

//     // Memoize current user data
//     const currentUser = useMemo(() => {
//         if (!data?.data?.response || !localuser) return null;

//         const user = data.data.response.find((u) => u.email === localuser);
//         if (!user) return null;

//         return {
//             fullname: user.name,
//             email: user.email,
//             initial: user.name
//                 .split(" ")
//                 .map((word) => word.charAt(0).toUpperCase())
//                 .join("")
//         };
//     }, [data, localuser]);

//     useEffect(() => {
//         const handleScroll = () => {
//             setFixed(window.scrollY > SCROLL_THRESHOLD ? "fixed" : "");
//         };

//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     useEffect(() => {
//         const loggedInUser = localStorage.getItem("user");
//         if (loggedInUser) {
//             setUser(loggedInUser);
//         }
//     }, []);

//     useMotionValueEvent(scrollY, "change", (latest) => {
//         const previous = scrollY.getPrevious();
//         setHidden(latest > previous && latest > HIDE_THRESHOLD);
//     });

//     const toggleMenu = () => setShow(prev => prev === "show" ? "" : "show");
//     const toggleSubMenu = () => setSubMenu(prev => !prev);

//     return (
//         <motion.header
//             variants={headerVariant}
//             animate={(hidden && !FullScreen) ? "hidden" : "visible"}
//             className={`z-[9999] fixed right-0 left-0 top-0 bg-white ${!token && "md:bg-opacity-50"} px-2 py-2 md:px-10 flex items-center ${token ? "gap-10" : "justify-between"}`}>
//             <div>
//                 <Link to="/">
//                     <motion.img
//                         initial={{ x: -100, opacity: 0 }}
//                         animate={{ x: 0, opacity: 1 }}
//                         transition={{ type: "spring", stiffness: 260, duration: 2 }}
//                         src={LOGO}
//                         className="md:w-[200px] w-[130px]"
//                         alt="Logo"
//                     />
//                 </Link>
//             </div>

//             {token && <SearchCourseInput />}

//             {token ? (
//                 currentUser && (
//                     <AuthenticatedNav
//                         {...currentUser}
//                         show={show}
//                         fixed={fixed}
//                         signout={handleSignOut}
//                         FullScreen={FullScreen}
//                     />
//                 )
//             ) : (
//                 <GuestNav
//                     show={show}
//                     fixed={fixed}
//                     subMenu={subMenu}
//                     displaySubMenu={toggleSubMenu}
//                     FullScreen={FullScreen}
//                 />
//             )}

//             <div className="flex items-center gap-3">
//                 {/* Login Button (Guest only) */}
//                 {!token && (
//                     <Link to="/login" className='md:block hidden'>
//                         <button className="border-2 border-BLUE hover:bg-transparent hover:text-BLUE duration-300 bg-BLUE text-white px-1 py-1 md:px-4 md:py-3 rounded-md md:rounded-3xl font-semibold">
//                             Login
//                         </button>
//                     </Link>
//                 )}

//                 <div className="flex items-center gap-6">
//                     <Link to="/checkout">
//                         <CartIcon itemCount={cartItem?.length} />
//                     </Link>

//                     <div className="flex-1 block md:hidden hamburger">
//                         {show === "show" ? (
//                             <FaXmark size={20} onClick={toggleMenu} />
//                         ) : (
//                             <FaBarsStaggered size={20} onClick={toggleMenu} />
//                         )}
//                     </div>

//                     {token && currentUser && (
//                         <UserDropdown
//                             {...currentUser}
//                             signout={handleSignOut}
//                             FullScreen={FullScreen}
//                         />
//                     )}
//                 </div>
//             </div>
//         </motion.header>
//     );
// };

// UserAvatar.propTypes = {
//     initial: PropTypes.string.isRequired,
//     animate: PropTypes.bool,
// };

// CartIcon.propTypes = {
//     itemCount: PropTypes.number,
// };

// UserDropdown.propTypes = {
//     initial: PropTypes.string.isRequired,
//     fullname: PropTypes.string,
//     email: PropTypes.string,
//     signout: PropTypes.func,
//     FullScreen: PropTypes.bool
// };

// GuestNav.propTypes = {
//     show: PropTypes.string,
//     fixed: PropTypes.string,
//     subMenu: PropTypes.bool,
//     displaySubMenu: PropTypes.func,
//     FullScreen: PropTypes.bool
// };

// AuthenticatedNav.propTypes = {
//     show: PropTypes.string,
//     fixed: PropTypes.string,
//     initial: PropTypes.string.isRequired,
//     fullname: PropTypes.string,
//     email: PropTypes.string,
//     signout: PropTypes.func,
// };

// export default NavBar;
