import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LOGO from "../assets/images/logo.jpg";


const CreateNewPassword = () => {
    return (
        <section className="min-h-screen flex justify-center items-center bg-black opacity-80">
            <motion.div exit={{ x: -100, }} className="border-2 border-black md:w-[400px] p-5 bg-white rounded-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Link to="/"><img src={LOGO} className="w-[150px] pl-0" alt="" /></Link>
                    </div>
                </div>
                <div className='flex items-center gap-1'>
                    <p className="font-bold">Create New Password</p>
                </div>
                <p className="text-sm md:text-sm text-slate-700 font-medium">Please ensure your new password is unique from those previously used</p>
                <form>
                    <div className="my-4">
                        <label className="font-bold" htmlFor="new-password">New Password
                            <input name="new-password"
                                type="password" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                        </label>
                    </div>
                    <div className="my-4">
                        <label className="font-bold" htmlFor="confirm-password">Confirm Password
                            <input name="confirm-password"
                                type="password" id="" className="text-base pl-2 h-10 rounded-xl w-full border-2 border-inputColor bg-inputColor" />
                        </label>
                    </div>
                    <button type="submit" className="my-4 w-full rounded-xl hover:text-BLUE border-2 hover:bg-transparent border-BLUE duration-300 bg-BLUE py-2 font-semibold text-white text-base md:text-xl">Reset Password</button>
                </form>
            </motion.div>
        </section>
    )
}

export default CreateNewPassword