import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import * as yup from "yup";
import { Toaster, toast } from 'sonner';
import FetchComments from "../hooks/FetchComments";
import Loader from "./Loader";
import ServerErrorPage from "./ServerErrorPage";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const api = import.meta.env.VITE_BACKEND_MESSAGE_P
const SendMessages = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [postsPerPage] = useState(10)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const {data: message, isLoading, error: fetchError} = FetchComments()
  const notify = () => toast.success("Your message will be delivered to all students!!");
  const schema = yup.object().shape({
    message: yup.string().required(),
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
      messages: data.message
    }
    axios.post(`${api}`, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then((res) => {
      if (res.status === 201 || res.status === 200) {
        notify()
        setTimeout(() => {
          navigate('/ADMIN-DASHBOARD')
        }, 2500);
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
  const lastPostIndex = currentPage * postsPerPage
  const firstPostIndex = lastPostIndex - postsPerPage
  const paginatedData = message?.data?.response?.slice(firstPostIndex, lastPostIndex)
  const length = message?.data?.response?.length || 1

  const pageNumber = []
  for (let i = 1; i <= Math.ceil((length) / postsPerPage); i++) {
    pageNumber.push(i)
  }

  if (message?.status === 500) return <ServerErrorPage />

  return (
    <div className='p-2 lg:p-5'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Toaster position="top-right" />
        <textarea  {...register("message", { required: true })} className='p-2 w-full border-[1px] border-black' placeholder='Type your message' name="message" id="" cols="30" rows="10"></textarea>
        <button type="submit" className='my-2 bg-BLUE px-3 py-2 md:px-4 md:py-3 font-semibold text-white flex items-center gap-2 group'><FaPaperPlane className="" /> Send Message</button>
        <p className='text-red-600'>{errors.message?.message}</p>
      </form>
      <p className="font-semibold">
        This section is designated for sending general messages to all students.
      </p>

      <div className="mt-10">
        <h1 className="font-bold text-sm md:text-2xl my-3">COMMENTS FROM STUDENTS</h1>
        {fetchError && <p className='text-center text-red-500 md:text-3xl font-black'>{fetchError.message}</p>}
        {isLoading && <Loader />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {paginatedData?.map((comment, index)=> (
            <div key={index} className="bg-grayBG p-2 rounded-sm">
              <p className="break-all">{comment.message}</p>
              <p>{(new Date(comment.date)).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
          
        <div className='relative text-sm text-center my-2 md:my-4 font-bold tracking-wider group'>
          <p>{currentPage} 0f {pageNumber.length} pages</p>
          <div className="my-2 md:my-5">
            <Splide options={{
              drag: "free",
              pagination: false,
              perPage: 5,
              perMove: 3,
              gap: "20px",
              focus: 'center',
              trimSpace: false,
              breakpoints: {
                768: {
                  perPage: 4,
                  perMove: 2,
                  gap: "10px",
                  focus: "none",
                  trimSpace: true,
                },
              }
            }} className="">
              {pageNumber.map((num) => (
                <SplideSlide key={num}><button onClick={() => setCurrentPage(num)} key={num} className={`${currentPage === num && "bg-BLUE text-white px-3 py-2 rounded-md"} px-3 py-2 text-sm md:text-base font-bold`}>{num}</button></SplideSlide>
              ))}
            </Splide>
          </div>
        </div>
        <div>
        {!message && <h3 className="font-bold text-center md:text-3xl">No Data Available.</h3>}
      </div>
      </div>
    </div>
  )
}

export default SendMessages