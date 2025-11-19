import { Link, redirect, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LOGO from "../assets/images/logo.jpg";
import GOOGLE from "../assets/images/google.png";
// import FACEBOOK from "../assets/images/facebook.png";
// import APPLE from "../assets/images/apple.png";
import { FaXmark } from "react-icons/fa6";
// import { FaApple } from "react-icons/fa";
import { app } from "../../firebase.config";
import { useForm } from "react-hook-form"
import { getIdToken, GithubAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";
import { useStateContext } from '../context/ContextProvider';
import axiosclinet from "../layoutAuth/axios/axios-clinet"
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Toaster, toast } from 'sonner';
const api = import.meta.env.VITE_BACKEND_API;
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

const CreateAccountForm = () => {
    const navigate = useNavigate()
    const { setToken, setUser } = useStateContext();
    const emailRef = useRef();
    const passwordRef = useRef();
    const nameRef = useRef();
    const [loading, setLoading] = useState(false)
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
  
    const schema = yup.object().shape({
        name: yup.string().required(),
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
        duration : 3000
    })
    if (errors.password) toast.error(errors.password?.message, {
        duration : 3000
    })
    if (errors.name) toast.error(errors.name?.message, {
        duration : 3000
    })
    const onSubmit = (data) => {
      
        const payload = {
            name: data.name,
            password: data.password,
            email: data.email
        }
        setLoading(true)
        axios.post(`${api}/api/sighup`, payload, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        }).then((res) => {
            if (res.status === 201 || res.status === 200) {
                setLoading(false)
                setUser(res.data.data)
                window.localStorage.setItem("user", res.data.data.email)
                setToken(res.data.token)
                navigate('/dashboard')
            }
          
        }).catch(err => {
            const response = err.response
            if (response.status === 422) {
                setLoading(false)
                toast.error(response.data.message)
            } else if (response.status === 401) {
                setLoading(false)
                toast.error(response.data.message)
            } else if (response.status === 403) {
                setLoading(false)
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
                            <Link to="/"><img src={LOGO} className="w-[150px] h-[50px] object-cover" alt="" /></Link>
                        </div>
                        <p onClick={()=> navigate(-1)} className='cursor-pointer'>
                            <FaXmark size={30} />
                        </p>
                    </div>
                    <p className="font-bold">Please fill in your details to get started</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="my-4">
                            <label className="font-bold" htmlFor="name">Name
                                <input name="name" ref={nameRef}
                                    {...register("name", { required: true })} type="text" id="name" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                            </label>
                        </div>
                        <div className="my-4">
                            <label className="font-bold" htmlFor="email">Email Address
                                <input name="email" ref={emailRef}
                                    {...register("email", { required: true })} type="text" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                            </label>
                        </div>
                        <div className="my-4">
                            <label className="font-bold" htmlFor="password">Password
                                <input name="password"
                                    ref={passwordRef}
                                    {...register("password", { required: true })} type="password" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                            </label>
                        </div>
                        <button type="submit" className="w-full rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-">{loading ? <div>
                            <span className="loading loading-ring loading-sm"></span>
                            <span className="loading loading-ring loading-sm"></span>
                            <span className="loading loading-ring loading-sm"></span>
                        </div> : "Create Account"}</button>
                        {/* <p className='text-center font-extralight py-1'>or</p> */}
                    </form>
                    <div className='login-options flex flex-col gap-3 font-medium'>
                        {/* <button onClick={loginwihGoogle} className='flex items-center justify-center gap-2 border-[1px] border-black rounded-3xl py-2 hover:bg-black hover:text-white duration-300'><img src={GOOGLE} alt="" className='w-5' />Continue with Google</button> */}
                        {/* <button className='flex items-center justify-center gap-2 border-[1px] border-black rounded-3xl py-2 hover:text-white duration-300'><img src={FACEBOOK} alt="" className='w-5' />Continue with Facebook</button>
                        <button className='flex items-center justify-center gap-2 border-[1px] border-black rounded-3xl py-2 hover:text-white duration-300'><FaApple size={20} />Continue with Apple ID</button> */}
                    </div>
                    <p className="text-sm md:text-base mt-4 font-semibold ">Already have an account? <Link className="underline underline-offset-2 text-BLUE" to="/login">Log In</Link></p>
                </motion.div>
            </section>

            <Toaster position='top-center' />
        </>
    )
}

export default CreateAccountForm;