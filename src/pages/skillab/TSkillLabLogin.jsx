import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// import LOGO from "../assets/images/logo.jpg";
// import GOOGLE from "../assets/images/google.png";

import GOOGLE from "../../assets/images/google.png";
import LOGO from '../../assets/images/logo.jpg';
import { FaXmark } from "react-icons/fa6";
import React from "react";
import { Toaster, toast } from "sonner";

// import { app } from "../../firebase.config";
import { app } from "../../../firebase.config";
import {
  GoogleAuthProvider,
  getAuth,
  getIdToken,
  signInWithPopup,
} from "firebase/auth";

// import { useStateContext } from "../context/ContextProvider";
import { useStateContext } from "../../context/ContextProvider";
import { cookieAuthApi } from "../../lib/cookieAuth";

const formVariant = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { type: "spring", stiffness: 180 },
  },
  exit: { x: "-1000px", opacity: 0 },
};

const TSkillLabLogin = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useStateContext();

  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      const payload = { idToken: await getIdToken(loggedInUser) };

      const res = await cookieAuthApi.post("/api/google", payload);

      if (res.status === 200 || res.status === 201) {
        window.localStorage.setItem("user", res.data.email);

        setToken(true);
        setUser(res.data.user);

        // ✅ Go to SkillLab profile page
        navigate("/skilllab/profile");
      }
    } catch (err) {
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <>
      <section className="min-h-screen flex justify-center items-center bg-black text-white">
        <motion.div
          variants={formVariant}
          initial="initial"
          animate="animate"
          className="w-[380px] p-6 bg-white text-black rounded-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <img src={LOGO} className="w-[140px]" alt="TSkillLab" />
            <FaXmark
              size={24}
              className="cursor-pointer"
              onClick={() => navigate(-1)}
            />
          </div>

          <h1 className="text-xl font-bold">TO-Skill-Lab</h1>
          <p className="text-sm text-gray-600 mb-6">
            Sign in to access labs, interviews & your profile
          </p>

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 border border-black rounded-3xl py-3 font-medium hover:bg-black hover:text-white transition"
          >
            <img src={GOOGLE} alt="Google" className="w-5" />
            Continue with Google
          </button>
<Link
  to="/toskillab"
  className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide
             text-gray-700 hover:text-black transition"
>
  ← TSkillLab Home
</Link>


          <p className="text-xs text-center mt-6 text-gray-500">
            By continuing, you agree to TSkillLab Terms & Privacy Policy
          </p>
        </motion.div>
      </section>

      <Toaster position="top-center" />
    </>
  );
};

export default TSkillLabLogin;
