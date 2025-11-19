import { useState } from "react";
import FetchMessage from "../hooks/FetchMessage"
import { FaMessage, FaXmark } from "react-icons/fa6";
import { motion } from "framer-motion"

const messageVariant = {
  initial: {
    x: "-100%",
    opacity: 0,
    zIndex: -1
  },
  final: {
    x: 0,
    opacity: 1,
    zIndex: 50,
    transition: {
      type: "spring", stiffness:250
    }
  }
}

const Messages = () => {
  const [message, setMessage] = useState(false)
  const { data } = FetchMessage()
  return (
    <>
    

    {/* <div className="fixed flex flex-col gap-5 top-[30%] left-5 bg-whte w-[20px] z-30"> */}
      {/* <div className="relative alert-msg">
        <FaMessage size={30} className={`${message && "invisible opacity-0"} cursor-pointer`} onClick={()=> setMessage(true)} color="#2d2065" />
        <FaMessage size={30} className={`${message && "invisible opacity-0"} absolute inset-0 animate-ping cursor-pointer`} onClick={()=> setMessage(true)} color="#2d2065" />
      </div>
      {data?.data?.response.map((msg, index)=> (
      <motion.div variants={messageVariant} animate={message ? "final" : "initial"} key={index} className="relative w-fit p-2 md:p-4 rounded-md shadow-2xl bg-white font-bold whitespace-nowrap z-10">
        <p className="flex items-center justify-between gap-9 text-sm md:text-base">From @admin<FaXmark className="cursor-pointer" size={20} onClick={()=> setMessage(false)} /></p>
        <p className="my-2 border-l-4 border-BLUE pl-2 text-xs md:text-base">{msg.message}</p>
        <p className="text-xs md:text-base">Date: {(new Date(msg.date)).toDateString()}</p>
      </motion.div>))} */}
    {/* </div> */}
        </>
  )
}

export default Messages