import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa6";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import * as yup from "yup";
import { GoogleAuthProvider, getAuth, getIdToken, signInWithPopup } from "firebase/auth";
import { app } from "../../firebase.config";
import { useStateContext } from "../context/ContextProvider";
import { cookieAuthApi } from "../lib/cookieAuth";
import AuthPageFrame from "../components/AuthPageFrame";
import GOOGLE from "../assets/images/google.png";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required"),
  password: yup.string().required("Password is required"),
});

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
  } = useForm({ resolver: yupResolver(schema) });

  // New students are routed to materials only after verified enrollment.
  const nextDestination = async (user) => {
    if (!user?.email) return "/dashboard";
    try {
      const { data } = await cookieAuthApi.post("/api/check-student-access", {
        courseId: "splunk",
      });
      return data?.allowed === true ? "/dashboard/materials" : "/dashboard";
    } catch {
      console.warn("Cohort routing unavailable; using normal dashboard");
      return "/dashboard";
    }
  };

  const saveAuthData = (user) => {
    setToken(true);
    if (user?.email) localStorage.setItem("user", user.email);
    if (user) setUser(user);
  };

  const loginWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      const idToken = await getIdToken(loggedInUser);
      const res = await cookieAuthApi.post("/api/google", { idToken });

      if (res.status === 200 || res.status === 201) {
        const user = res.data.user || {
          name: loggedInUser.displayName,
          email: res.data.email || loggedInUser.email,
        };
        saveAuthData(user);
        toast.success("Welcome back!");
        navigate(await nextDestination(user), { replace: true });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await cookieAuthApi.post("/api/login", {
        email: data.email,
        password: data.password,
      });

      if (res.status === 200 || res.status === 201) {
        saveAuthData(res.data.data);
        toast.success("Login successful");
        navigate(await nextDestination(res.data.data), { replace: true });
      }
    } catch (error) {
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
      <AuthPageFrame
        eyebrow="Member access"
        title="Welcome back"
        description="Sign in to pick up your learning, check your progress and get back to your dashboard."
        brandTitle="Pick up right where you left off."
        brandDescription="Your courses, progress and next steps are all waiting in one place. Keep moving toward the skills you want to build."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Email address
            </label>
            <div
              className={`group flex h-14 items-center gap-3.5 rounded-xl border px-4 transition focus-within:bg-white focus-within:shadow-[0_8px_24px_-14px_rgba(45,32,101,0.45)] ${
                errors.email
                  ? "border-rose-400 bg-rose-50"
                  : "border-slate-200 bg-slate-50 focus-within:border-indigo-700"
              }`}
            >
              <FaEnvelope
                aria-hidden="true"
                className={`shrink-0 ${errors.email ? "text-rose-400" : "text-slate-400 group-focus-within:text-indigo-800"}`}
              />
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Password
            </label>
            <div
              className={`group flex h-14 items-center gap-3.5 rounded-xl border px-4 transition focus-within:bg-white focus-within:shadow-[0_8px_24px_-14px_rgba(45,32,101,0.45)] ${
                errors.password
                  ? "border-rose-400 bg-rose-50"
                  : "border-slate-200 bg-slate-50 focus-within:border-indigo-700"
              }`}
            >
              <FaLock
                aria-hidden="true"
                className={`shrink-0 ${errors.password ? "text-rose-400" : "text-slate-400 group-focus-within:text-indigo-800"}`}
              />
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="shrink-0 rounded-md p-1 text-slate-400 transition hover:text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700"
              >
                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
              />
              Remember me
            </label>
            <Link
              to="/forgotPassword"
              className="text-sm font-bold text-indigo-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="group flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-BLUE px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-950/15 transition hover:-translate-y-0.5 hover:bg-[#21164f] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </>
            ) : (
              <>
                Sign in to your dashboard
                <FaArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            or continue with
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading || googleLoading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
              Connecting…
            </>
          ) : (
            <>
              <img src={GOOGLE} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-7 text-center text-sm text-slate-600">
          New to T.O Analytics?{" "}
          <Link
            to="/createAccount"
            className="font-extrabold text-indigo-800 underline decoration-indigo-300 underline-offset-4 hover:decoration-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Your account is protected with secure sign-in.
        </p>
      </AuthPageFrame>
      <Toaster position="top-center" richColors />
    </>
  );
};

export default Login;
