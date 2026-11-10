import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LOGO from "../assets/images/logo.jpg";
import GOOGLE from "../assets/images/google.png";
import { FaXmark } from "react-icons/fa6";
import { useEffect, useRef, useState } from 'react';
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { cookieAuthApi } from "../lib/cookieAuth";
import { useStateContext } from '../context/ContextProvider';
const api = import.meta.env.VITE_BACKEND_API_ROUTES || `${import.meta.env.VITE_BACKEND_API}/api/admin/login`;
const AdminLoginForm = () => {
    const { setToken, setUser } = useStateContext();
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
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

    const onSubmit = async (data) => {
        const payload = {
            password: data.password,
            email: data.email
        }
        setError(null)
        setSubmitting(true)
        try {
            const res = await cookieAuthApi.post(`${api}`, payload)
            if (res.status === 201 || res.status === 200) {
                setToken(true)
                setUser(res.data.response)
                navigate('/ADMIN-DASHBOARD')
            }
        } catch (err) {
            const status = err.response?.status
            const serverMessage = err.response?.data?.message
            if (status === 422) setError(serverMessage || "Invalid admin email or password.")
            else if (status === 403) setError(serverMessage || "This local app origin is not allowed by the backend.")
            else if (!err.response) setError("Cannot reach the local backend. Start the backend API on port 8000 and try again.")
            else setError(serverMessage || `Admin login failed (${status}).`)
        } finally {
            setSubmitting(false)
        }

    }
    
  return (
    <section className="min-h-screen flex justify-center items-center bg-black opacity-80">
            <motion.div initial="initial" animate="animate" exit={{ x: -100, }} className="border-2 border-black md:w-[400px] p-5 bg-white rounded-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Link to="/"><img src={LOGO} className="w-[150px] pl-0" alt="" /></Link>
                    </div>
                    <Link to="/">
                        <FaXmark size={30} />
                    </Link>
                </div>
                <p className="font-bold">Welcome Admin!</p>
                <p className="text-sm md:text-base text-slate-400">Enter Your details to continue</p>
              <form onSubmit={handleSubmit(onSubmit)}>
              <div className='mt-3 flex flex-col gap-3 font-medium' >
                        {error ? <h2 className='text-red-600'>{error}</h2> : "    "}
                    </div>
                    <div className="my-4">
                        <label className="font-bold" htmlFor="email">Email Address
                            <input   {...register("email", { required: true })}   name="email" type="text" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                      </label>
                      <p className='text-red-600'>{errors.email?.message}</p>
                    </div>
                    <div className="my-4">
                        <label className="font-bold" htmlFor="password">Password
                            <input   {...register("password", { required: true })}  type="password" name="password" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                      </label>
                      <p className='text-red-600'>{errors.password?.message}</p>
                    </div>
                    <button type="submit" disabled={submitting} className="w-full rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-xl disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Signing in…" : "Login"}</button>
                </form>
            </motion.div>
        </section>
  )
}

export default AdminLoginForm;
