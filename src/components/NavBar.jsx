import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FaBarsStaggered,
  FaChevronDown,
  FaXmark,
} from "react-icons/fa6";
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

// Related pages are clustered so the main navbar remains short and easy to scan.
const NAV_CLUSTERS = [
  {
    label: "Learn",
    description: "Courses and guided learning",
    items: [
      {
        to: "/courses",
        label: "Courses",
        description: "Browse all available learning tracks",
      },
      {
        to: "/splunk-orientation",
        label: "Orientation",
        description: "Start your Splunk learning journey",
      },
    ],
  },
  {
    label: "Practice",
    description: "Hands-on tools and preparation",
    items: [
      {
        to: "/toskillab",
        label: "Interview Prep",
        description: "Prepare with practical career exercises",
      },
      {
        to: "/trading-simulator",
        label: "Trading Simulator",
        description: "Practice market decisions in a safe environment",
      },
      {
        to: "/toskillab/lab",
        label: "Splunk Lab",
        description: "Investigate realistic Splunk scenarios",
      },
    ],
  },
  {
    label: "Company",
    description: "Learn more about T.O. Analytics",
    items: [
      {
        to: "/about",
        label: "About",
        description: "Our mission, values, and approach",
      },
      {
        to: "/career",
        label: "Career",
        description: "Explore opportunities with our team",
      },
    ],
  },
];

const allClusterPaths = NAV_CLUSTERS.flatMap((cluster) =>
  cluster.items.map((item) => item.to),
);

const isPathActive = (pathname, target) =>
  pathname === target || pathname.startsWith(`${target}/`);

const UserAvatar = ({ initial }) => (
  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-BLUE to-PURPLE text-sm font-black text-white shadow-sm ring-2 ring-white">
    {initial || "U"}
  </div>
);

const CartIcon = ({ itemCount }) => (
  <div className="group relative grid h-11 w-11 place-items-center rounded-xl text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-BLUE focus-within:bg-blue-50">
    <MdOutlineAddShoppingCart
      className="h-6 w-6 transition-transform group-hover:-rotate-6 group-hover:scale-105"
      aria-hidden="true"
    />
    <span className="absolute right-0 top-0 grid min-h-[19px] min-w-[19px] place-items-center rounded-full border-2 border-white bg-BLUE px-1 text-[10px] font-extrabold leading-none text-white">
      {itemCount ?? 0}
    </span>
  </div>
);

const DesktopCluster = ({ cluster, pathname, openCluster, setOpenCluster }) => {
  const isOpen = openCluster === cluster.label;
  const hasActiveItem = cluster.items.some((item) =>
    isPathActive(pathname, item.to),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenCluster(isOpen ? null : cluster.label)}
        className={`group flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors ${
          hasActiveItem || isOpen
            ? "bg-purple-50 text-PURPLE"
            : "text-slate-700 hover:bg-slate-50 hover:text-BLUE"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {cluster.label}
        <FaChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-1/2 top-[calc(100%+12px)] w-[330px] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.35)]"
            role="menu"
          >
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {cluster.description}
              </p>
            </div>

            <div className="mt-1 grid gap-1">
              {cluster.items.map((item) => {
                const active = isPathActive(pathname, item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    className={`rounded-xl px-3 py-3 transition-colors ${
                      active
                        ? "bg-purple-50 text-PURPLE"
                        : "text-slate-700 hover:bg-slate-50 hover:text-BLUE"
                    }`}
                  >
                    <span className="block text-sm font-bold">{item.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {item.description}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavBar = () => {
  const { data } = FetchAllStudents();
  const { cartItem } = useContext(CartItemContext);
  const { token, setToken, FullScreen } = useStateContext();
  const [showMenu, setShowMenu] = useState(false);
  const [openCluster, setOpenCluster] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const auth = getAuth(app);
  const headerRef = useRef(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("ACCESS_TOKEN");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedUser) setLocalUser(savedUser);
  }, [setToken]);

  useEffect(() => {
    setShowMenu(false);
    setOpenCluster(null);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false);
        setOpenCluster(null);
      }
    };

    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenCluster(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    document.body.style.overflow = showMenu ? "hidden" : "";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (showMenu || openCluster) {
      setHidden(false);
      return;
    }

    setHidden(latest > previous && latest > HIDE_THRESHOLD);
  });

  const currentUser = useMemo(() => {
    if (!data?.data?.response || !localUser) return null;

    const user = data.data.response.find((item) => item.email === localUser);
    if (!user) return null;

    const fullname = user.name?.trim() || "User";

    return {
      fullname,
      email: user.email,
      initial: fullname
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
      setOpenCluster(null);
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const hasActiveClusterPath = allClusterPaths.some((path) =>
    isPathActive(pathname, path),
  );

  return (
    <motion.header
      ref={headerRef}
      variants={headerVariant}
      animate={hidden && !FullScreen ? "hidden" : "visible"}
      className="fixed inset-x-0 top-0 z-[9999] border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_-22px_rgba(15,23,42,0.55)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0" aria-label="T.O. Analytics home">
          <motion.img
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            src={LOGO}
            className="h-auto w-[118px] object-contain sm:w-[145px] lg:w-[155px]"
            alt="T.O. Analytics"
          />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {NAV_CLUSTERS.map((cluster) => (
            <DesktopCluster
              key={cluster.label}
              cluster={cluster}
              pathname={pathname}
              openCluster={openCluster}
              setOpenCluster={setOpenCluster}
            />
          ))}

          {token && currentUser && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-purple-50 text-PURPLE"
                    : "text-slate-700 hover:bg-slate-50 hover:text-BLUE"
                }`
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/checkout"
            className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-BLUE focus-visible:ring-offset-2"
            aria-label={`Cart with ${cartItem?.length ?? 0} items`}
          >
            <CartIcon itemCount={cartItem?.length} />
          </Link>

          {token && currentUser && (
            <Link
              to="/dashboard"
              className="hidden max-w-[165px] items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-slate-50 xl:flex"
              aria-label={`Open ${currentUser.fullname}'s dashboard`}
            >
              <UserAvatar initial={currentUser.initial} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {currentUser.fullname}
                </p>
                <p className="text-[11px] font-medium text-slate-500">My account</p>
              </div>
            </Link>
          )}

          <div className="hidden lg:block">
            {token && currentUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-BLUE hover:bg-blue-50 hover:text-BLUE focus:outline-none focus-visible:ring-2 focus-visible:ring-BLUE focus-visible:ring-offset-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center rounded-xl bg-BLUE px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-BLUE focus-visible:ring-offset-2"
              >
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMenu((previous) => !previous)}
            className="grid h-11 w-11 place-items-center rounded-xl text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-BLUE focus-visible:ring-offset-2 lg:hidden"
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
              className="fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] cursor-default bg-slate-950/35 backdrop-blur-[2px] sm:top-[72px] sm:h-[calc(100dvh-72px)] lg:hidden"
              aria-label="Close navigation menu"
            />

            <motion.nav
              id="mobile-navigation"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-slate-200 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl sm:max-h-[calc(100dvh-72px)] sm:px-6 lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="mx-auto max-w-2xl">
                {token && currentUser && (
                  <Link
                    to="/dashboard"
                    className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50/60 p-3.5"
                  >
                    <UserAvatar initial={currentUser.initial} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {currentUser.fullname}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {currentUser.email}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-PURPLE">Dashboard</span>
                  </Link>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  {NAV_CLUSTERS.map((cluster) => (
                    <section key={cluster.label}>
                      <div className="mb-2 px-2">
                        <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">
                          {cluster.label}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          {cluster.description}
                        </p>
                      </div>

                      <div className="grid gap-1">
                        {cluster.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              `rounded-xl px-3 py-3 transition-colors ${
                                isActive
                                  ? "bg-purple-50 text-PURPLE"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-BLUE"
                              }`
                            }
                          >
                            <span className="block text-sm font-bold">{item.label}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                              {item.description}
                            </span>
                          </NavLink>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {!hasActiveClusterPath && pathname !== "/" && (
                  <p className="sr-only">You are viewing {pathname}</p>
                )}

                <div className="mt-5 border-t border-slate-200 pt-4">
                  {token && currentUser ? (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-BLUE hover:bg-blue-50 hover:text-BLUE"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex min-h-12 w-full items-center justify-center rounded-xl bg-BLUE px-4 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

DesktopCluster.propTypes = {
  cluster: PropTypes.shape({
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        to: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  pathname: PropTypes.string.isRequired,
  openCluster: PropTypes.string,
  setOpenCluster: PropTypes.func.isRequired,
};

UserAvatar.propTypes = {
  initial: PropTypes.string,
};

CartIcon.propTypes = {
  itemCount: PropTypes.number,
};

export default NavBar;
