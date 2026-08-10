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
    <span
      className="absolute -top-2 -right-2 bg-BLUE text-white
      border-2 border-white px-[6px] text-xs rounded-full font-bold
      transition-transform duration-200 group-hover:scale-125"
    >
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

        <NavLink
          to="/toskillab"
          className={({ isActive }) =>
            isActive
              ? "font-semibold text-PURPLE"
              : "transition hover:text-PURPLE"
          }
        >
          TO Skill Lab
        </NavLink>

        {/* <NavLink to="/toskillab" className="hover:text-BLUE">
          ToskillLab
        </NavLink> */}

        <NavLink to="/splunk-orientation" className="hover:text-BLUE">
          Orientation
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

          <NavLink
  to="/toskillab"
  onClick={() => setShowMenu(false)}
  className={({ isActive }) =>
    isActive
      ? "font-semibold text-PURPLE"
      : "transition hover:text-PURPLE"
  }
>
  TO Skill Lab
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
