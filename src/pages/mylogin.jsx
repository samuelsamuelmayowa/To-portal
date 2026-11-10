import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LOGO from "../assets/images/logo.jpg";
import GOOGLE from "../assets/images/google.png";
import { FaXmark } from "react-icons/fa6";
import React, { useEffect, useRef, useState } from 'react';
import { cookieAuthApi } from "../lib/cookieAuth";
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { Toaster, toast } from 'sonner';
import * as yup from "yup"
import { app } from "../../firebase.config";
import { getIdToken, GithubAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";
import { useStateContext } from '../context/ContextProvider';
React.StrictMode = React.Fragment

const formVariant = {
    initial: {
        opacity: 0
    },
    animate: {
        opacity: 1,
        transition: {
            type: "spring", stiffness: 180, duration: 1000
        }
    },
    exit: {
        x: "-1000px",
        opacity: 0,
    }
}
const MyLogin= () => {
    const notifyfail = () => toast.warning("Kindly refresh your browser ");
    const navigate = useNavigate()
    const { setToken, setUser } = useStateContext();
    const [checkpassword, setCheckPassword] = useState(null)
    const [loading, setLoading] = useState(false)
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    const loginwihGoogle = () => {
        signInWithPopup(auth, googleProvider)
            .then(async result => {
                const loggedInUser = result.user;
                const payload = { idToken: await getIdToken(loggedInUser) };
                cookieAuthApi.post("/api/google", payload).then((res) => {
                    if (res.status === 201 || res.status === 200) {
                        window.localStorage.setItem("user", res.data.email)
                        setUser(res.data.user)
                        navigate('/dashboard')
                        setToken(true)
                    }
                }).catch((err) => notifyfail())

            }).catch(error => {
                toast.error("Google login failed. Please try again.");
            })
    }
    const schema = yup.object().shape({
        password: yup.string().required(),
        email: yup.string().required(),
    });
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),
    })
    if (errors.email) toast.error(errors.email?.message, {
        duration : 2000
    })
    if (errors.password) toast.error(errors.password?.message, {
        duration : 2000
    })
    const onSubmit = (data) => {
        const payload = {
            password: data.password,
            email: data.email
        }
        setLoading(true)
        cookieAuthApi.post("/api/login", payload).then((res) => {
            if (res.status === 201 || res.status === 200) {
                setLoading(false)
                setUser(res.data.data)
                window.localStorage.setItem("user", res.data.data.email)
                setToken(true)
                navigate('/dashboard')
            }
        }).catch(err => {
            const response = err.response
            if (response.status === 401) {
                setLoading(false)
                toast.error(response.data.message)
            } else if (response.status === 403) {
                setLoading(false)
                setCheckPassword(response.data.message)
                toast.error(response.data.message)
            }
        })
        
    }
    
    return (
        <>
            <section className="ANIMATE-BG min-h-screen flex justify-center items-center">
                <motion.div variants={formVariant} initial="initial" animate="animate" exit={{ x: -100, }} className="md:w-[400px] p-5 bg-white rounded-3xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link to="/"><img src={LOGO} className="w-[150px] pl-0" alt="" /></Link>
                        </div>
                        <p onClick={()=> navigate(-1)} className='cursor-pointer'>
                            <FaXmark size={30} />
                        </p>
                    </div>
                    <p className="font-bold">Welcome Back!</p>
                    <p className="text-sm md:text-base text-slate-700 font-medium">Enter Your details to continue</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="my-4">
                            <label className="font-bold" htmlFor="email">Email Address
                                <input name="email"
                                    {...register("email", { required: true })} type="text" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                            </label>
                        </div>
                        <div className="my-4">
                            <label className="font-bold" htmlFor="password">Password
                                <input   {...register("password", { required: true })} type="password" name="password" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                            </label>
                        </div>
                        <p className="text-right my-4 font-bold"><a href="forgotPassword.html" className="text-BLUE"><Link to="/forgotPassword">Forgot Password?</Link></a></p>
                        <button type="submit" className="w-full rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-xl">{loading ? <div>
                            <span className="loading loading-ring loading-sm"></span>
                            <span className="loading loading-ring loading-sm"></span>
                            <span className="loading loading-ring loading-sm"></span>
                        </div> :"Login"}</button>
                        <p className='text-center font-extralight py-1'>or</p>
                    </form>
                    <div className='login-options flex flex-col gap-3 font-medium'>
                        <button onClick={loginwihGoogle} className='flex items-center justify-center gap-2 border-[1px] border-black rounded-3xl py-2 hover:bg-black hover:text-white duration-300'><img src={GOOGLE} alt="" className='w-5' />Continue with Google</button>
                    </div>
                    <p className="text-sm md:text-base mt-4 font-semibold ">Don&apos;t have an account? <Link className="underline underline-offset-2 text-BLUE" to="/createAccount">Create Account</Link></p>
                </motion.div>
            </section>
            <Toaster position='top-center' />
        </>
    )
}

export default MyLogin;
