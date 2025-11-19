import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import LOGO from "../assets/images/logo.jpg";
import { FaChevronLeft } from "react-icons/fa6";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await axios.post("https://to-backendapi-v1.vercel.app/api/forgot-password", {
        email,
      });
      setMsg(res.data.message || "Reset link sent successfully!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ANIMATE-BG min-h-screen flex justify-center items-center">
      <motion.div
        exit={{ x: -100 }}
        className="md:w-[400px] p-5 bg-white rounded-3xl shadow-xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <img src={LOGO} className="w-[150px]" alt="Logo" />
          </Link>
        </div>

        {/* Back Button */}
        <div className="flex items-center gap-1 mt-3">
          <p onClick={() => navigate(-1)} className="cursor-pointer">
            <FaChevronLeft size={20} color="black" />
          </p>
          <p className="font-bold text-lg">Forgot Password?</p>
        </div>

        {/* Info Text */}
        <p className="text-sm text-slate-700 font-medium mt-2">
          No need to panic — kindly enter the email address linked with your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="my-4">
            <label className="font-bold text-sm" htmlFor="email">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor focus:outline-none focus:ring-2 focus:ring-BLUE"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-32 w-full rounded-xl border-2 border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-xl hover:text-BLUE hover:bg-transparent ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Message */}
        {msg && (
          <p
            className={`mt-4 text-center font-semibold ${
              msg.toLowerCase().includes("sent")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default ForgotPassword;
