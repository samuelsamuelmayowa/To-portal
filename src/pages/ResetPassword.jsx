import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { FaLock, FaArrowLeft } from "react-icons/fa";
import LOGO from "../assets/images/logo.jpg";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `https://to-backendapi-v1.vercel.app/api/reset-password/${token}`,
        { password }
      );
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative"
      >
        {/* Logo + Back button */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <img src={LOGO} alt="Logo" className="w-36" />
          </Link>
          <Link
            to="/login"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaArrowLeft className="mr-1" /> Back
          </Link>
        </div>

        <div className="text-center mb-6">
          <FaLock className="mx-auto text-blue-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Reset Your Password
          </h2>
          <p className="text-gray-600 text-sm">
            Enter a new password for your account below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block font-semibold text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {msg && (
          <p
            className={`mt-4 text-center font-medium ${
              msg.toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {msg}
          </p>
        )}
      </motion.div>
    </section>
  );
}


// import { useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function ResetPassword() {
//   const { token } = useParams();
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(`https://to-backendapi-v1.vercel.app/api/reset-password/${token}`, { password });
//       setMsg(res.data.message);
//     } catch (err) {
//       setMsg(err.response?.data?.message || "Error occurred");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "2rem auto" }}>
//       <h2>Reset Password</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="password"
//           placeholder="Enter new password"
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit">Reset Password</button>
//       </form>
//       <p>{msg}</p>
//     </div>
//   );
// }
