import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa6";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import * as yup from "yup";
import { useStateContext } from "../context/ContextProvider";
import { cookieAuthApi } from "../lib/cookieAuth";
import AuthPageFrame from "../components/AuthPageFrame";

const schema = yup.object().shape({
  name: yup.string().trim().required("Your name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email address is required"),
  password: yup.string().required("Choose a password to continue"),
});

const CreateAccountForm = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await cookieAuthApi.post("/api/sighup", {
        name: data.name.trim(),
        email: data.email,
        password: data.password,
      });

      if (res.status === 201 || res.status === 200) {
        setUser(res.data.data);
        localStorage.setItem("user", res.data.data.email);
        setToken(true);
        toast.success("Your account is ready");
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthPageFrame
        eyebrow="Create your account"
        title="Start learning"
        description="Create your account and keep your courses, progress and learning journey together."
        brandTitle="Make room for what’s next."
        brandDescription="Build practical skills at your pace, follow a clear learning path and keep every milestone in view."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Full name
            </label>
            <div
              className={`group flex h-14 items-center gap-3.5 rounded-xl border px-4 transition focus-within:bg-white focus-within:shadow-[0_8px_24px_-14px_rgba(45,32,101,0.45)] ${
                errors.name
                  ? "border-rose-400 bg-rose-50"
                  : "border-slate-200 bg-slate-50 focus-within:border-indigo-700"
              }`}
            >
              <FaUser
                aria-hidden="true"
                className={`shrink-0 ${errors.name ? "text-rose-400" : "text-slate-400 group-focus-within:text-indigo-800"}`}
              />
              <input
                {...register("name")}
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                aria-invalid={Boolean(errors.name)}
                className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

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
                autoComplete="new-password"
                placeholder="Create a password"
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

          <button
            type="submit"
            disabled={loading}
            className="group mt-2 flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-BLUE px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-950/15 transition hover:-translate-y-0.5 hover:bg-[#21164f] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating your account…
              </>
            ) : (
              <>
                Create account
                <FaArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-extrabold text-indigo-800 underline decoration-indigo-300 underline-offset-4 hover:decoration-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            to="/login"
          >
            Sign in
          </Link>
        </p>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          Your learning courses and progress will be saved to your account.
        </p>
      </AuthPageFrame>
      <Toaster position="top-center" richColors />
    </>
  );
};

export default CreateAccountForm;
