import contractor1 from "../assets/images/partner1.jpg";
import contractor2 from "../assets/images/partner2.png";
import contractor3 from "../assets/images/partner3.png";
import contractor4 from "../assets/images/partner4.png";
import contractor5 from "../assets/images/partner5.png";
import contractor6 from "../assets/images/partner6.png";
import LOGO from "../assets/images/logo.jpg";
import Footer from "../components/Footer";
import { yupResolver } from "@hookform/resolvers/yup"
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import doc from "../../woking.txt"
import * as yup from "yup"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from "react-hook-form"
import axios from 'axios';
import {
    ref,
    uploadBytesResumable,
    uploadBytes,
    getDownloadURL,
    listAll,
    list,
} from "firebase/storage";
import { storage } from "../../firebase.config";
import { useState } from "react";
const api = import.meta.env.VITE_BACKEND_API;

const ConnectWithContractor = () => {
    const [file, setFile] = useState(null);
    const [change, setChange] = useState()
    const notifysuc = () => toast("File Uploaded!!");
    const notifyfail = () => toast("We regret to inform you that we were unable to process your file!!!!");

    const schema = yup.object().shape({
        picture: yup.mixed()
            .test('required', "You need to provide a file", (value) => {
                return value && value.length
            })
            .test("fileSize", "The file is too large", (value, context) => {
                return value && value[0] && value[0].size <= 200000;
            })
            .test("type", "We only support jpeg,   .txt , .docx , .xlsx", function (value) {
                return value && value[0] && value[0].type === "text/plain" ||
                    value && value[0] && value[0].type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || value && value[0] && value[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }),
        name: yup.string().required(),
        phone_number: yup.string().required(),
        role_position: yup.string().required(),
        linkportfolio: yup.string().required(),
        email: yup.string().required(),
    });
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),
    })
    const handleChange = (event) => {
        setFile(event.target.files[0]);
        console.log(file)
    };
    const onSubmit = async (data) => {
        console.log(data.picture, data.name)
        // Store meta info , give and error if they try storing images , show progress when uploading the firebase 
        //steps 1) store info to database first , display network error, display error if failed
        const uploadFile = () => {
            for (const file of data.picture) {
                const storageRef = ref(storage, 'files/' + file.name);
                const uploadTask = uploadBytesResumable(storageRef, file);
                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        switch (error.code) {
                            case 'storage/unauthorized':
                                notifyfail()
                                console.log('failed')
                                // User doesn't have permission to access the object
                                break;
                            case 'storage/canceled':
                                notifyfail()
                                console.log('failed')
                                // User canceled the upload
                                break;

                            // ...

                            case 'storage/unknown':
                                console.log('failed')
                                // Unknown error occurred, inspect error.serverResponse
                                notifyfail()
                                break;
                        }
                    },
                    () => {
                        // Upload completed successfully, now we can get the download URL
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            const payload = {
                                email: data.email,
                                link_portfolio: data.linkportfolio,
                                role_postion: data.role_postion,
                                name: data.name,
                                pdfurl: downloadURL
                            }
                            axios.post(`${api}contractors`, payload, {
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json"
                                }
                            }).then((res) => {
                                if (res.status === 201) {
                                    notifysuc()
                                    console.log('stored info')
                                    console.log('File available at', downloadURL);
                                }
                            })
                        }).catch((err) => {
                            notifyfail()
                            console.log(err.message)
                        })

                    }
                )
            }
        }
        uploadFile()
    }
    return (
        <div>
            <div>
                <Link to="/">
                    <motion.img initial={{x: -100, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{type:"spring", stiffness: 260, duration: 2000}} src={LOGO} className="md:w-[200px] w-[130px]" alt=""/>
                </Link>
            </div>
            <section>
                <div className="px-2 text-center md:px-10">
                    <div className="text-center">
                        <p className="font-bold my-4 p-2 text-3xl">Our Partners</p>
                        <p className="font-semibold text-base">Would you like to be connected with any of the following partners? Kindly fill in your details.</p>
                    </div>
                    <div className="flex flex-wrap flex-col md:flex-row items-center justify-center gap-2 my-5">
                        <div className="w-44 aspect-square">
                            <img src={contractor1} alt=""/>
                        </div>
                        <div className="w-44 aspect-square">
                            <img src={contractor2} alt=""/>
                        </div>
                        <div className="w-44 aspect-square">
                            <img src={contractor3} alt=""/>
                        </div>
                        <div className="w-44 aspect-square">
                            <img src={contractor4} alt=""/>
                        </div>
                        <div className="w-44 aspect-square">
                            <img src={contractor5} alt=""/>
                        </div>
                        <div className="w-44 aspect-square">
                            <img src={contractor6} alt=""/>
                        </div>
                    </div>
                </div>
            </section>
            <section className="px-2 md:px-14 my-5 md:my-10">
                <div className="md:pt-10 md:w-[600px] mx-auto p-6 bg-BLUE rounded-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-BLUE">
                        <ToastContainer />
                        {/* <input type="file" onChange={handleChange} /> */}
                        <div className="mb-2 block">
                            <input   {...register("name", { required: true })} className="md:text-lg h-10 md:h-14 text-white placeholder:font-semibold font-medium px-2 py-3 rounded-md w-full bg-transparent border-[1px] text-base border-textColor my-2 focus:outline-2 focus:outline-textColor" type="text" name="name" id="" placeholder="Name" />
                            <p className='text-red-600  text-sm'>{errors.name?.message}</p>
                        </div>
                        <div className="mb-2 block">
                            <input  {...register("email", { required: true })} className="md:text-lg h-10 md:h-14 text-white placeholder:font-semibold font-medium px-2 py-3 rounded-md w-full bg-transparent border-[1px] text-base border-textColor my-2 focus:outline-2 focus:outline-textColor" type="text" name="email" id="" placeholder="Email Address" />
                            <p className='text-red-600  text-sm'>{errors.email?.message}</p>
                        </div>
                        <div className="mb-2 block">
                            <input  {...register("phone_number", { required: true })} className="md:text-lg h-10 md:h-14 text-white placeholder:font-semibold font-medium px-2 py-3 rounded-md w-full bg-transparent border-[1px] text-base border-textColor my-2 focus:outline-2 focus:outline-textColor" type="text" name="phone_number" id="" placeholder="Phone Number" />
                            {errors.phone_number?.message ? <p className='text-red-600  text-sm'>phone number is required</p> : ''}
                        </div>
                        <div className="mb-2 block">
                            <input  {...register("role_position", { required: true })} className="md:text-lg h-10 md:h-14 text-white placeholder:font-semibold font-medium px-2 py-3 rounded-md w-full bg-transparent border-[1px] text-base border-textColor my-2 focus:outline-2 focus:outline-textColor" type="text" name="role_position" id="" placeholder="Role/position" />
                            {errors.role_position?.message ? <p className='text-red-600  text-sm'>role and position is required</p> : ''}
                        </div>
                        <div className="mb-2 block">
                            <input  {...register("linkportfolio", { required: true })} className="md:text-lg h-10 md:h-14 text-white placeholder:font-semibold font-medium px-2 py-3 rounded-md w-full bg-transparent border-[1px] text-base border-textColor my-2 focus:outline-2 focus:outline-textColor" type="text" name="linkportfolio" id="" placeholder="Link to Portfolio" />
                            {errors.linkportfolio?.message ? <p className='text-red-600  text-sm'>link and Portfolio is required</p> : ''}
                        </div>
                        <div className="mb-2 block">
                            <input className="md:text-lg text-white placeholder:font-semibold font-medium px-2 py-3 rounded-md w-full bg-transparent border-[1px] text-base border-textColor my-2 focus:outline-2 focus:outline-textColor customFileInput" id="picture"  {...register("picture")} type="file" placeholder="CV/Resume" />
                            <p className='text-red-600  text-sm'>{errors.picture?.message}</p>
                        </div>
                        <button className="text-xl font-semibold hover:bg-white hover:text-BLUE duration-300 text-white px-2 py-1 md:px-4 md:py-3 rounded-lg md:rounded-xl border-textColor border-[1px]" type="submit">Submit</button>
                    </form>
                </div>
            </section>
            <Footer black="bg-black text-white" />
        </div>
    )
}

export default ConnectWithContractor;