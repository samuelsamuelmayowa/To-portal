import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  FaArrowTrendUp,
  FaBookOpen,
  FaCircleCheck,
  FaGraduationCap,
  FaXmark,
} from "react-icons/fa6";
import LOGO from "../assets/images/logo.jpg";

const benefits = [
  { icon: FaBookOpen, label: "Learn with structure" },
  { icon: FaGraduationCap, label: "Build practical skills" },
  { icon: FaArrowTrendUp, label: "Keep your progress" },
];

const AuthPageFrame = ({
  eyebrow,
  title,
  description,
  brandTitle,
  brandDescription,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease: "easeOut" } }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b17] px-3 py-4 text-white sm:px-6 sm:py-8"
    >
      <div className="pointer-events-none absolute -left-36 -top-40 h-[420px] w-[420px] rounded-full bg-indigo-700/30 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-24 h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-[150px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_30px_100px_-35px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:rounded-[36px] lg:grid-cols-[0.96fr_1.04fr]">
        <aside className="relative hidden min-h-[740px] overflow-hidden bg-[#11182b] p-10 xl:p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-cyan-400/15 blur-[100px]" />
          <div className="pointer-events-none absolute right-[-100px] top-[38%] h-[360px] w-[360px] rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute right-[-48px] top-[43%] h-[250px] w-[250px] rounded-full border border-white/[0.07]" />

          <div className="relative z-10">
            <Link
              to="/"
              aria-label="T.O Analytics home"
              className="inline-flex rounded-2xl bg-white p-3 shadow-xl shadow-black/20"
            >
              <img
                src={LOGO}
                alt="T.O Analytics"
                className="h-12 w-auto rounded-lg object-contain"
              />
            </Link>

            <div className="mt-24 max-w-lg">
              <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-cyan-200">
                T.O Analytics · Your next chapter
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[1.06] tracking-tight xl:text-[3.5rem]">
                {brandTitle}
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-300 xl:text-lg xl:leading-8">
                {brandDescription}
              </p>
            </div>
          </div>

          <div className="relative z-10 grid gap-3">
            {benefits.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.055] px-4 py-3.5 backdrop-blur-xl"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                  <Icon aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-semibold text-white/85">
                  {label}
                </span>
                <FaCircleCheck
                  aria-hidden="true"
                  className="text-sm text-cyan-200/75"
                />
              </div>
            ))}
          </div>
        </aside>

        <div className="relative bg-white px-6 pb-8 pt-7 text-slate-950 sm:px-10 sm:pb-10 sm:pt-9 lg:px-12 lg:py-12 xl:px-14">
          <div className="mb-10 flex min-h-10 items-center lg:absolute lg:right-8 lg:top-8 lg:mb-0 xl:right-10 xl:top-10">
            <Link to="/" className="inline-flex lg:hidden" aria-label="T.O Analytics home">
              <img src={LOGO} alt="T.O Analytics" className="h-10 w-auto object-contain" />
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            >
              <FaXmark aria-hidden="true" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
            className="mx-auto w-full max-w-md"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-2 text-indigo-900">
              <FaCircleCheck aria-hidden="true" className="text-indigo-700" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.17em]">
                {eyebrow}
              </span>
            </div>
            <h2 className="mt-5 text-[2.65rem] font-black leading-none tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              {description}
            </p>

            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

AuthPageFrame.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  brandTitle: PropTypes.string.isRequired,
  brandDescription: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default AuthPageFrame;
