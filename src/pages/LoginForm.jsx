import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LOGO from "../assets/images/logo.jpg";
import GOOGLE from "../assets/images/google.png";
import {
  FaXmark,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldHalved,
  FaGraduationCap,
  FaChartLine,
  FaCircleCheck,
} from "react-icons/fa6";
import React, { useState } from "react";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import * as yup from "yup";
import { app } from "../../firebase.config";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useStateContext } from "../context/ContextProvider";

const api = import.meta.env.VITE_BACKEND_API;

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required"),
  password: yup.string().required("Password is required"),
});

const pageMotion = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: { opacity: 0, x: "-100vw" },
};

const cardMotion = {
  initial: { opacity: 0, y: 50, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const floatingMotion = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useStateContext();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // New-student routing uses verified enrollment, not a query flag or email list.
  // Legacy/other students continue to their existing /dashboard destination.
  const nextDestination = async (token, user) => {
    if (!token || !user?.email) return "/dashboard";
    try {
      const response = await fetch("/api/check-student-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email, courseId: "splunk-2026" }),
        cache: "no-store",
      });
      if (!response.ok) return "/dashboard";
      const data = await response.json();
      return data?.allowed === true ? "/dashboard/materials" : "/dashboard";
    } catch (error) {
      console.warn("Cohort routing unavailable; using normal dashboard", error);
      return "/dashboard";
    }
  };

  const saveAuthData = (token, user) => {
    if (token) {
      localStorage.setItem("ACCESS_TOKEN", token);
      setToken(token);
    }

    if (user?.email) {
      localStorage.setItem("user", user.email);
    }

    if (user) {
      setUser(user);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setGoogleLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      const payload = {
        name: loggedInUser.displayName,
        email: loggedInUser.email,
      };

      const res = await axios.post(`${api}/api/google`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        const user = res.data.data || {
          name: loggedInUser.displayName,
          email: res.data.email || loggedInUser.email,
        };

        saveAuthData(res.data.token, user);

        toast.success("Welcome back!");
        navigate(await nextDestination(res.data.token, user), { replace: true });
      }
    } catch (error) {
      console.log("GOOGLE LOGIN ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const payload = {
        email: data.email,
        password: data.password,
      };

      const res = await axios.post(`${api}/api/login`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        saveAuthData(res.data.token, res.data.data);

        toast.success("Login successful");
        navigate(await nextDestination(res.data.token, res.data.data), { replace: true });
      }
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.section
        variants={pageMotion}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10 text-white"
      >
        {/* Background glow */}
        <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-BLUE/50 blur-[130px]" />
        <div className="absolute bottom-[-220px] right-[-160px] h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[150px]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:60px_60px]" />

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT BRAND SIDE */}
          <div className="relative hidden min-h-[720px] overflow-hidden border-r border-white/10 bg-white/[0.04] p-10 lg:block">
            <div className="absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-BLUE/40 blur-[100px]" />
            <div className="absolute bottom-[-120px] right-[-100px] h-[350px] w-[350px] rounded-full bg-cyan-300/20 blur-[110px]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <Link to="/">
                  <div className="inline-flex rounded-3xl bg-white p-3 shadow-xl">
                    <img
                      src={LOGO}
                      alt="T.O Analytics"
                      className="h-16 w-auto rounded-2xl object-contain"
                    />
                  </div>
                </Link>

                <div className="mt-20">
                  <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-200">
                    T.O Analytics
                  </p>

                  <h1 className="mt-5 max-w-lg text-6xl font-black leading-[1.02] tracking-tight">
                    Welcome back to your tech journey.
                  </h1>

                  <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-white/65">
                    Access your dashboard, continue your courses, track your
                    progress, manage your cart and continue building job-ready
                    skills.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  variants={floatingMotion}
                  animate="animate"
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
                >
                  <FaGraduationCap className="text-2xl text-cyan-200" />
                  <h3 className="mt-4 text-3xl font-black">14</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
                    Weeks
                  </p>
                </motion.div>

                <motion.div
                  variants={floatingMotion}
                  animate="animate"
                  transition={{ delay: 0.4 }}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
                >
                  <FaShieldHalved className="text-2xl text-cyan-200" />
                  <h3 className="mt-4 text-3xl font-black">1:1</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
                    Mentor
                  </p>
                </motion.div>

                <motion.div
                  variants={floatingMotion}
                  animate="animate"
                  transition={{ delay: 0.8 }}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
                >
                  <FaChartLine className="text-2xl text-cyan-200" />
                  <h3 className="mt-4 text-3xl font-black">Pro</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
                    Skills
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* FORM SIDE */}
          <motion.div
            variants={cardMotion}
            initial="initial"
            animate="animate"
            className="relative bg-white p-6 text-slate-950 md:p-10 lg:p-12"
          >
            <button
              onClick={() => navigate(-1)}
              className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition duration-300 hover:bg-red-50 hover:text-red-600"
            >
              <FaXmark />
            </button>

            <div className="lg:hidden">
              <Link to="/">
                <img src={LOGO} alt="T.O Analytics" className="w-[140px]" />
              </Link>
            </div>

            <div className="mt-14 lg:mt-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-BLUE/10 px-4 py-2 text-BLUE">
                <FaCircleCheck />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  Secure Login
                </span>
              </div>

              <h2 className="mt-5 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
                Sign in
              </h2>

              <p className="mt-4 max-w-md text-base font-medium leading-7 text-slate-600">
                Enter your details to continue learning, manage your account and
                access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-black text-slate-800"
                >
                  Email Address
                </label>

                <div
                  className={`group flex h-16 items-center gap-4 rounded-2xl border px-5 transition duration-300 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus-within:border-BLUE focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-100"
                  }`}
                >
                  <FaEnvelope
                    className={`transition ${
                      errors.email
                        ? "text-red-400"
                        : "text-slate-400 group-focus-within:text-BLUE"
                    }`}
                  />

                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="h-full w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-sm font-bold text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-black text-slate-800"
                >
                  Password
                </label>

                <div
                  className={`group flex h-16 items-center gap-4 rounded-2xl border px-5 transition duration-300 ${
                    errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus-within:border-BLUE focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-100"
                  }`}
                >
                  <FaLock
                    className={`transition ${
                      errors.password
                        ? "text-red-400"
                        : "text-slate-400 group-focus-within:text-BLUE"
                    }`}
                  />

                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-full w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 transition hover:text-BLUE"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-sm font-bold text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-BLUE"
                  />
                  Remember me
                </label>

                <Link
                  to="/forgotPassword"
                  className="text-sm font-black text-BLUE hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-BLUE font-black text-white shadow-xl shadow-blue-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login to Dashboard
                    <FaArrowRight className="transition duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                or
              </p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              onClick={loginWithGoogle}
              disabled={loading || googleLoading}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-black text-slate-800 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-950 hover:bg-slate-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400/30 border-t-slate-900" />
                  Connecting...
                </>
              ) : (
                <>
                  <img src={GOOGLE} alt="Google" className="w-5" />
                  Continue with Google
                </>
              )}
            </button>

            <p className="mt-8 text-center text-sm font-semibold text-slate-600 md:text-base">
              Don&apos;t have an account?{" "}
              <Link
                to="/createAccount"
                className="font-black text-BLUE underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>

            <p className="mt-6 text-center text-xs font-medium leading-6 text-slate-400">
              By continuing, you agree to access your T.O Analytics learning
              dashboard securely.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <Toaster position="top-center" richColors />
    </>
  );
};

export default Login;

// import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import LOGO from "../assets/images/logo.jpg";
// import GOOGLE from "../assets/images/google.png";
// import {
//   FaXmark,
//   FaEnvelope,
//   FaLock,
//   FaEye,
//   FaEyeSlash,
//   FaArrowRight,
//   FaShieldHalved,
//   FaGraduationCap,
//   FaChartLine,
//   FaCircleCheck,
// } from "react-icons/fa6";
// import React, { useState } from "react";
// import axios from "axios";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useForm } from "react-hook-form";
// import { Toaster, toast } from "sonner";
// import * as yup from "yup";
// import { app } from "../../firebase.config";
// import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
// import { useStateContext } from "../context/ContextProvider";

// const api = import.meta.env.VITE_BACKEND_API;

// const schema = yup.object().shape({
//   email: yup
//     .string()
//     .email("Enter a valid email address")
//     .required("Email address is required"),
//   password: yup.string().required("Password is required"),
// });

// const pageMotion = {
//   initial: { opacity: 0 },
//   animate: {
//     opacity: 1,
//     transition: { duration: 0.6, ease: "easeOut" },
//   },
//   exit: { opacity: 0, x: "-100vw" },
// };

// const cardMotion = {
//   initial: { opacity: 0, y: 50, scale: 0.96 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { duration: 0.75, ease: "easeOut" },
//   },
// };

// const floatingMotion = {
//   animate: {
//     y: [0, -12, 0],
//     transition: {
//       duration: 4,
//       repeat: Infinity,
//       ease: "easeInOut",
//     },
//   },
// };

// const Login = () => {
//   const navigate = useNavigate();
//   const { setToken, setUser } = useStateContext();

//   const [loading, setLoading] = useState(false);
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const auth = getAuth(app);
//   const googleProvider = new GoogleAuthProvider();

//   const {
//     register,
//     formState: { errors },
//     handleSubmit,
//   } = useForm({
//     resolver: yupResolver(schema),
//   });

//   const saveAuthData = (token, user) => {
//     if (token) {
//       localStorage.setItem("ACCESS_TOKEN", token);
//       setToken(token);
//     }

//     if (user?.email) {
//       localStorage.setItem("user", user.email);
//     }

//     if (user) {
//       setUser(user);
//     }
//   };

//   const loginWithGoogle = async () => {
//     try {
//       setGoogleLoading(true);

//       const result = await signInWithPopup(auth, googleProvider);
//       const loggedInUser = result.user;

//       const payload = {
//         name: loggedInUser.displayName,
//         email: loggedInUser.email,
//       };

//       const res = await axios.post(`${api}/api/google`, payload, {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.status === 200 || res.status === 201) {
//         const user = res.data.data || {
//           name: loggedInUser.displayName,
//           email: res.data.email || loggedInUser.email,
//         };

//         saveAuthData(res.data.token, user);

//         toast.success("Welcome back!");
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       console.log("GOOGLE LOGIN ERROR:", error);

//       toast.error(
//         error?.response?.data?.message ||
//           "Google login failed. Please try again."
//       );
//     } finally {
//       setGoogleLoading(false);
//     }
//   };

//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);

//       const payload = {
//         email: data.email,
//         password: data.password,
//       };

//       const res = await axios.post(`${api}/api/login`, payload, {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.status === 200 || res.status === 201) {
//         saveAuthData(res.data.token, res.data.data);

//         toast.success("Login successful");
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       console.log("LOGIN ERROR:", error);

//       toast.error(
//         error?.response?.data?.message ||
//           "Login failed. Please check your details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <motion.section
//         variants={pageMotion}
//         initial="initial"
//         animate="animate"
//         exit="exit"
//         className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10 text-white"
//       >
//         {/* Background glow */}
//         <div className="absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-BLUE/50 blur-[130px]" />
//         <div className="absolute bottom-[-220px] right-[-160px] h-[500px] w-[500px] rounded-full bg-cyan-400/20 blur-[150px]" />
//         <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[160px]" />

//         {/* Grid overlay */}
//         <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:60px_60px]" />

//         <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
//           {/* LEFT BRAND SIDE */}
//           <div className="relative hidden min-h-[720px] overflow-hidden border-r border-white/10 bg-white/[0.04] p-10 lg:block">
//             <div className="absolute left-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-BLUE/40 blur-[100px]" />
//             <div className="absolute bottom-[-120px] right-[-100px] h-[350px] w-[350px] rounded-full bg-cyan-300/20 blur-[110px]" />

//             <div className="relative z-10 flex h-full flex-col justify-between">
//               <div>
//                 <Link to="/">
//                   <div className="inline-flex rounded-3xl bg-white p-3 shadow-xl">
//                     <img
//                       src={LOGO}
//                       alt="T.O Analytics"
//                       className="h-16 w-auto rounded-2xl object-contain"
//                     />
//                   </div>
//                 </Link>

//                 <div className="mt-20">
//                   <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-200">
//                     T.O Analytics
//                   </p>

//                   <h1 className="mt-5 max-w-lg text-6xl font-black leading-[1.02] tracking-tight">
//                     Welcome back to your tech journey.
//                   </h1>

//                   <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-white/65">
//                     Access your dashboard, continue your courses, track your
//                     progress, manage your cart and continue building job-ready
//                     skills.
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <motion.div
//                   variants={floatingMotion}
//                   animate="animate"
//                   className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
//                 >
//                   <FaGraduationCap className="text-2xl text-cyan-200" />
//                   <h3 className="mt-4 text-3xl font-black">14</h3>
//                   <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
//                     Weeks
//                   </p>
//                 </motion.div>

//                 <motion.div
//                   variants={floatingMotion}
//                   animate="animate"
//                   transition={{ delay: 0.4 }}
//                   className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
//                 >
//                   <FaShieldHalved className="text-2xl text-cyan-200" />
//                   <h3 className="mt-4 text-3xl font-black">1:1</h3>
//                   <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
//                     Mentor
//                   </p>
//                 </motion.div>

//                 <motion.div
//                   variants={floatingMotion}
//                   animate="animate"
//                   transition={{ delay: 0.8 }}
//                   className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
//                 >
//                   <FaChartLine className="text-2xl text-cyan-200" />
//                   <h3 className="mt-4 text-3xl font-black">Pro</h3>
//                   <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/50">
//                     Skills
//                   </p>
//                 </motion.div>
//               </div>
//             </div>
//           </div>

//           {/* FORM SIDE */}
//           <motion.div
//             variants={cardMotion}
//             initial="initial"
//             animate="animate"
//             className="relative bg-white p-6 text-slate-950 md:p-10 lg:p-12"
//           >
//             <button
//               onClick={() => navigate(-1)}
//               className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition duration-300 hover:bg-red-50 hover:text-red-600"
//             >
//               <FaXmark />
//             </button>

//             <div className="lg:hidden">
//               <Link to="/">
//                 <img src={LOGO} alt="T.O Analytics" className="w-[140px]" />
//               </Link>
//             </div>

//             <div className="mt-14 lg:mt-4">
//               <div className="inline-flex items-center gap-2 rounded-full bg-BLUE/10 px-4 py-2 text-BLUE">
//                 <FaCircleCheck />
//                 <span className="text-xs font-black uppercase tracking-[0.2em]">
//                   Secure Login
//                 </span>
//               </div>

//               <h2 className="mt-5 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
//                 Sign in
//               </h2>

//               <p className="mt-4 max-w-md text-base font-medium leading-7 text-slate-600">
//                 Enter your details to continue learning, manage your account and
//                 access your dashboard.
//               </p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
//               {/* EMAIL */}
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="mb-2 block text-sm font-black text-slate-800"
//                 >
//                   Email Address
//                 </label>

//                 <div
//                   className={`group flex h-16 items-center gap-4 rounded-2xl border px-5 transition duration-300 ${
//                     errors.email
//                       ? "border-red-400 bg-red-50"
//                       : "border-slate-200 bg-slate-50 focus-within:border-BLUE focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-100"
//                   }`}
//                 >
//                   <FaEnvelope
//                     className={`transition ${
//                       errors.email
//                         ? "text-red-400"
//                         : "text-slate-400 group-focus-within:text-BLUE"
//                     }`}
//                   />

//                   <input
//                     {...register("email")}
//                     id="email"
//                     type="email"
//                     placeholder="example@email.com"
//                     className="h-full w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
//                   />
//                 </div>

//                 {errors.email && (
//                   <p className="mt-2 text-sm font-bold text-red-500">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>

//               {/* PASSWORD */}
//               <div>
//                 <label
//                   htmlFor="password"
//                   className="mb-2 block text-sm font-black text-slate-800"
//                 >
//                   Password
//                 </label>

//                 <div
//                   className={`group flex h-16 items-center gap-4 rounded-2xl border px-5 transition duration-300 ${
//                     errors.password
//                       ? "border-red-400 bg-red-50"
//                       : "border-slate-200 bg-slate-50 focus-within:border-BLUE focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-100"
//                   }`}
//                 >
//                   <FaLock
//                     className={`transition ${
//                       errors.password
//                         ? "text-red-400"
//                         : "text-slate-400 group-focus-within:text-BLUE"
//                     }`}
//                   />

//                   <input
//                     {...register("password")}
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     className="h-full w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((prev) => !prev)}
//                     className="text-slate-400 transition hover:text-BLUE"
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </button>
//                 </div>

//                 {errors.password && (
//                   <p className="mt-2 text-sm font-bold text-red-500">
//                     {errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-center justify-between gap-4">
//                 <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4 rounded border-slate-300 accent-BLUE"
//                   />
//                   Remember me
//                 </label>

//                 <Link
//                   to="/forgotPassword"
//                   className="text-sm font-black text-BLUE hover:underline"
//                 >
//                   Forgot Password?
//                 </Link>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || googleLoading}
//                 className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-BLUE font-black text-white shadow-xl shadow-blue-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {loading ? (
//                   <>
//                     <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
//                     Logging in...
//                   </>
//                 ) : (
//                   <>
//                     Login to Dashboard
//                     <FaArrowRight className="transition duration-300 group-hover:translate-x-1" />
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="my-8 flex items-center gap-4">
//               <div className="h-px flex-1 bg-slate-200" />
//               <p className="text-sm font-black uppercase tracking-widest text-slate-400">
//                 or
//               </p>
//               <div className="h-px flex-1 bg-slate-200" />
//             </div>

//             <button
//               onClick={loginWithGoogle}
//               disabled={loading || googleLoading}
//               className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white font-black text-slate-800 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-950 hover:bg-slate-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {googleLoading ? (
//                 <>
//                   <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400/30 border-t-slate-900" />
//                   Connecting...
//                 </>
//               ) : (
//                 <>
//                   <img src={GOOGLE} alt="Google" className="w-5" />
//                   Continue with Google
//                 </>
//               )}
//             </button>

//             <p className="mt-8 text-center text-sm font-semibold text-slate-600 md:text-base">
//               Don&apos;t have an account?{" "}
//               <Link
//                 to="/createAccount"
//                 className="font-black text-BLUE underline underline-offset-4"
//               >
//                 Create Account
//               </Link>
//             </p>

//             <p className="mt-6 text-center text-xs font-medium leading-6 text-slate-400">
//               By continuing, you agree to access your T.O Analytics learning
//               dashboard securely.
//             </p>
//           </motion.div>
//         </div>
//       </motion.section>

//       <Toaster position="top-center" richColors />
//     </>
//   );
// };

// export default Login;