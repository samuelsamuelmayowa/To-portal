import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { useEffect, useState } from "react";
import FetchTotalSplunkUser from "../hooks/FetchTotalSplunkUser";
import FetchTotalEdcationalUser from "../hooks/FetchTotalEdcationalUser";

const api_splunk = import.meta.env.VITE_BACKEND_LIVE_SPLUNK;
const api_educational = import.meta.env.VITE_BACKEND_LIVE_EDUCATIONAL;
const api_education = import.meta.env.VITE_EDUCATIONAL_GET_TOTAL 
const SendLinks = () => {
const navigate = useNavigate()
  const {data} = FetchTotalSplunkUser()
  const [maindataeductional , setMainDataEducational] = useState([])
  const geteductional = async ()=>{
    try{
      const link = await axios.get(`${api_education}`);
      console.log(link.data.response)
      if(link.status === 201 || link.status === 200){
        setMainDataEducational(link.data.response)
      }
    }catch(err){
      const response = err.response;
      if (response.status === 404) {
        console.log(response.data.message);
      } else if (response.status === 403) {
        console.log(response.data.message);
      }
    }
  }

  const [educational, setEducational] = useState("");
  const hanldeInput = (e) => {
    setEducational(e.target.value);
  };
  const notify = () => toast.success("Splunk Live Session sent to paid  Users!!");
  const notify_educational = () => toast.success("Educational Live Session sent to paid  Users!!");
  const schema = yup.object().shape({
    splunk: yup.string().required(),
  });
  const schema_e = yup.object().shape({
    educational: yup.string().required(),
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
    const payload = {
      link: data.splunk,
    };
    axios
      .post(`${api_splunk}`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 201 || res.status === 200) {
          notify();
          setTimeout(() => {
            navigate("/ADMIN-DASHBOARD");
          }, 3000);
        }
      })
      .catch((err) => {
        const response = err.response;
        if (response.status === 422) {
          setError(response.data.message);
        } else if (response.status === 403) {
          setCheckPassword(response.data.message);
          setError(response.data.message);
        }
      });
  };
  const onSubmitE = (e) => {
    e.preventDefault();
    if (!educational.trim()) return
    const payload = {
      link: educational,
    };
    console.log(educational);
    axios
      .post(`${api_educational}`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 201 || res.status === 200) {
          notify_educational();
          // setEducational("");
          setTimeout(() => {
            navigate("/ADMIN-DASHBOARD");
          }, 3000);
        }
      })
      .catch((err) => {
        const response = err.response;
        if (response.status === 422) {
          setError(response.data.message);
        } else if (response.status === 403) {
          setCheckPassword(response.data.message);
          setError(response.data.message);
        }
      });
  };

  useEffect(()=>{
    geteductional()
  }, [])

  return (
    <div className="p-2 lg:p-5">
      <div className="mb-4 lg:mb-7">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Toaster position="bottom-center" />
          <label
            htmlFor="splunk-link"
            className="font-bold text-lg lg:text-2xl"
          >
            Splunk
            <input
              {...register("splunk", { required: true })}
              placeholder="Send google meet link or zoom to  paid student for splunk   course"
              className="w-full border-[1px] border-black h-10 lg:h-12 pl-3 my-2 font-medium text-base lg:text-xl"
              name="splunk"
              type="url"
            />
          </label>
          <button
            type="submit"
            className="my-2 bg-BLUE px-3 py-2 md:px-4 md:py-3 font-semibold text-white"
          >
            Send
          </button>
          <p className="text-red-600">{errors.splunk?.message}</p>
        </form>
        <div className="font-bold">
          <p> {data?.data?.response}  users have access to either the Splunk Google link or the Zoom link for Splunk training. </p>
        </div>
      </div>
      <div>
        <form onSubmit={onSubmitE}>
          <Toaster position="bottom-center" />
          <label htmlFor="edu-link" className="font-bold text-lg lg:text-2xl">
            Educational Consulting
            <input
              value={educational}
              onChange={hanldeInput}
              placeholder="Send google meet link or zoom link to  paid student for Educational course"
              className="w-full border-[1px] border-black h-10 lg:h-12 pl-3 my-2 font-medium text-base lg:text-xl"
              name="edu-link"
              type="url"
            />
          </label>
          <button
            type="submit"
            className="my-2 bg-BLUE px-3 py-2 md:px-4 md:py-3 font-semibold text-white"
          >
            Send
          </button>
          {/* <p className='text-red-600'>{errors.educational?.message}</p> */}
        </form>
        <div className="font-bold">
          <p> {maindataeductional}  users have access to either the Educational Consulting  Google link or the Zoom link for Educational Consulting    training. </p>
        </div>
      </div>
    </div>
  );
};

export default SendLinks;
