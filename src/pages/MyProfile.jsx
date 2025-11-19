import FetchAllStudents from "../hooks/FetchAllStudents";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
const MyProfile = () => {
  const navigate = useNavigate()
  const [localuser, setUser] = useState("")
  const { data } = FetchAllStudents()
  const { token } = useStateContext();
  useEffect(()=> {
    const loggedinUuser = (localStorage.getItem("user"))
    if (loggedinUuser) {
      setUser(loggedinUuser);
    }
  }, [navigate])
  
  if (!token) return <Navigate to="/" />

  const currentlyLoggedInUSer = data?.data?.response.find((user)=> user.email === localuser)
  const fullname = currentlyLoggedInUSer?.name

  const initial = currentlyLoggedInUSer?.name.split(" ").map((word)=> word.charAt(0).toUpperCase()).join("")

  const firstName = fullname?.split(" ")[0]
  const lastName = fullname?.split(" ")[1]
  return (
    <div className="p-2 md:p-0 flex flex-wrap justify-center items-start mt-16 md:mt-32 mb-10 min-h-[74vh]">
      <div className="border-2 w-full md:w-[300px] text-center">
        <div className="my-3 md:my-5 mx-auto w-24 md:w-36 aspect-square bg-BLUE rounded-full flex justify-center items-center text-3xl md:text-6xl font-black text-white">{initial}</div>
        <div className="font-bold">{firstName} {lastName}</div>
      </div>
      <div className="border-2 w-full md:w-[600px] p-3 md:p-10">
        <h1 className="text-center md:my-4 text-sm md:text-2xl font-semibold">Public Profile</h1>
        <form action="">
          <div className="mb-4">
            <input className="border-[1px] border-black w-full h-10 md:h-12 pl-3" defaultValue={firstName} type="text" name="" id="" placeholder="First Name" />
          </div>
          <div className="mb-4">
            <input className="border-[1px] border-black w-full h-10 md:h-12 pl-3" defaultValue={lastName} type="text" name="" id="" placeholder="Last Name" />
          </div>
          <button className="px-3 py-2 bg-BLUE text-white font-semibold text-sm md:text-xl">SAVE</button>
        </form>
      </div>
    </div>
  )
}

export default MyProfile