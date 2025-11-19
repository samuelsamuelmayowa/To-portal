import { useEffect, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import FetchComments from "../hooks/FetchComments";
import ServerErrorPage from "./ServerErrorPage";
import Loader from "./Loader";


const api = import.meta.env.VITE_SPLUNK_SEND;
const api_educational = import.meta.env.VITE_EDUCATIONAL_SEND;

const Links = () => {
  const email = (localStorage.getItem("user"));
  const ACCESS_TOKEN = (localStorage.getItem('ACCESS_TOKEN'))
  const [error, setError] = useState()
  const { data:splunk, isLoading: isSplunkLoading, error: splunkError } = useQuery({
    queryKey: ["splunk-link", email, ACCESS_TOKEN],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await axios.get(`${api}link/${queryKey[1]}`, {
          headers: {
            Authorization: `Bearer ${queryKey[2]}`,
          },
        });
        return response;
      } catch (error) {
        console.log(error)
        setError(error?.response?.status)
      }
    }
  })
  
  const { data:consulting, isLoading: isConsultingLoading, error: consultingError } = useQuery({
    queryKey: ["educational-consult-link", email, ACCESS_TOKEN],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await axios.get(`${api_educational}linkeducational/${queryKey[1]}`, {
          headers: {
            Authorization: `Bearer ${queryKey[2]}`,
          },
        });
        return response;
      } catch (error) {
        console.log(error)
        setError(error?.response?.status)
      }
    }
  })


  if (error === 404 ) return <p className='min-h-screen text-center text-red-500 md:text-3xl font-black'>NO CLASS ZOOM LINK AS BEEN SENT</p>
  if (splunk?.status === 500 || consulting?.status === 500) return <ServerErrorPage />
  if (splunkError || consultingError) return <p className='min-h-screen text-center text-red-500 md:text-3xl font-black'>Refresh The Page</p>

  return (
    <>
      <div className="mx-auto p-2 md:p-10">
        {(isSplunkLoading || isConsultingLoading) && <Loader />}
        {(splunk?.data?.response && consulting?.data?.response) && 
        <table className="min-h-screen md:min-h-min rounded-md md:rounded-none md:mb-40 w-full table-fixed border-collapse md:border-separate md:border-2 border-black md:border-spacing-1">
          <thead>
            <tr className="text-left">
              <th className="border-2 border-black p-2 font-black text-xs md:text-2xl">SPLUNK CLASS LINK</th>
              {/* <th className="border-2 border-black p-2 font-black text-xs md:text-2xl">EDUCATIONAL CONSULTING</th> */}
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              {splunk?.data?.response?.map((x) => {
                return (
                  <td data-cell="SPLUNK" key={x._id} className="border-2 border-black p-2">
                    <Link to={x.link} className="underline text-blue-500 line-clamp-1">{x.link}</Link>
                  </td>
                );
              })}
               {/* {consulting?.data?.response?.map((x) => {
                return (
                  <td data-cell="EDUCATIONAL CONSULTING" key={x._id} className="border-2 border-black p-2">
                    <Link to={x.link} className="underline text-blue-500 line-clamp-1">{x.link}</Link>
                  </td>
                );
              })} */}
            </tr>
          </tbody>
        </table>} 
        {(!splunk && !consulting) && <h1 className="min-h-screenmd:text-2xl text-xl flex justify-center items-center">LINKS PAGE</h1>}
      </div>
    </>
  );
};

export default Links;
