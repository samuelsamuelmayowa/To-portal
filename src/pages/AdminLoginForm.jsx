import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LOGO from "../assets/images/logo.jpg";
import GOOGLE from "../assets/images/google.png";
import { FaXmark } from "react-icons/fa6";
import { useEffect, useRef, useState } from 'react';
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import axios from 'axios';
import { useStateContext } from '../context/ContextProvider';
const api = import.meta.env.VITE_BACKEND_API_ROUTES;
const AdminLoginForm = () => {
    const { setToken} = useStateContext();
    const navigate = useNavigate()
    const [error, setError] = useState(null)
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

    const onSubmit = (data) => {
        console.log(data)
        const payload = {
            password: data.password,
            email: data.email
        }
        axios.post(`${api}`, payload, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }).then((res) => {
            if (res.status === 201 || res.status === 200) {
                window.localStorage.setItem("ADMIN", res.data.response.email)
                navigate('/ADMIN-DASHBOARD')
                setToken(res.data.token)
                console.log(res.data.token)
            }
        }).catch(err => {
            const response = err.response
            if (response.status === 422) {
                setError(response.data.message)
            } else if (response.status === 403) {
                setCheckPassword(response.data.message)
                setError(response.data.message)
            }

        })

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
                    <button type="submit" className="w-full rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-xl">Login</button>
                </form>
            </motion.div>
        </section>
  )
}

export default AdminLoginForm;