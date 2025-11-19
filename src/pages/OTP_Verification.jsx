import React, { useState } from 'react';
import OtpInput from 'react-otp-input';

import { Link } from 'react-router-dom';
import LOGO from "../assets/images/logo.jpg";

const OTP_Verification = () => {
    const [otp, setOtp] = useState('');
    return (
        <section className="min-h-screen flex justify-center items-center bg-black opacity-80">
            <div className="border-2 border-black md:w-[400px] p-5 bg-white rounded-3xl">
                <div>
                    <Link to="/"><img src={LOGO} className="w-[150px] pl-0" alt="" /></Link>
                </div>
                <div className='flex items-center gap-1'>
                    <p className="font-bold">OTP Verification</p>
                </div>
                <p className="text-sm md:text-sm text-slate-700 font-medium">Enter the Verification code that was just sent to your email address</p>
                <div className='my-4 px-5 md:px-8'>
                    <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    inputType='tel'
                    inputStyle={{border: "2px solid gray", width: "50px", aspectRatio: "1/1", borderRadius: "10px" }}
                    renderSeparator={<div className='w-full'></div>}
                    renderInput={(props) => <input {...props} />}
                    />
                </div>
                <button onClick={()=> alert(otp)} type="submit" className="my-6 w-full rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-xl">Verify</button>
                <p className="text-sm md:text-base mt-4 font-semibold ">Didn&apos;t receive code? <a className='text-BLUE font-bold underline' href="">Resend</a></p>
            </div>

        </section>
    )
}

export default OTP_Verification