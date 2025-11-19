import { FaPaperPlane } from "react-icons/fa";
import axios from 'axios';
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Toaster, toast } from 'sonner';
import { useNavigate } from "react-router-dom"

import { useMutation } from "@tanstack/react-query";

const api_comment = import.meta.env.VITE_BACKEND_C

const StudentCommentPage = () => {
  const navigate = useNavigate()
  const notify = ()=> toast.success("Thank you for your comment!!");
  const schema = yup.object().shape({
    comment: yup.string().required(),
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
      comment: data.comment
    }
    axios.post(`${api_comment}`, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then((res) => {
      if (res.status === 201 || res.status === 200) {
        notify()

        setTimeout(() => {
          navigate('/dashboard')
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

  return (
    <div className='p-2 px-5 md:px-10'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Toaster position="top-right" />
        <textarea  {...register("comment", { required: true })} className='p-2 w-full border-[1px] border-black' placeholder='Type your Comments' name="comment" id="" cols="30" rows="10"></textarea><p className='text-red-600'>{errors.comment?.message}</p>
        <button type="submit" className='my-2 bg-BLUE px-3 py-2 md:px-4 md:py-3 font-semibold text-white flex items-center gap-2'><FaPaperPlane /> Comment</button>
      </form>
    </div>
  )
}

export default StudentCommentPage