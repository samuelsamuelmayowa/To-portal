import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const AdminViewCourses = () => {
    const location = useLocation()
    return (
        <div>
            <div className="md:p-5 border-2">
                <div className="flex justify-between items-center my-2 md:my-6">
                    <h1 className="text-xs md:text-2xl font-bold">Courses</h1>
                    <NavLink to="/gg" className="md:text-base text-xs bg-BLUE text-white px-2 py-2 md:px-5 md:py-2 rounded-md md:rounded-xl font-semibold">UPLOAD VIDEO</NavLink>
                </div>
                <div className="bg-grayBG p-2 md:p-5 rounded-md">
                    <ul className="text-xs md:text-base w-fit bg-white px-5 py-3 rounded-md md:rounded-2xl mx-auto flex justify-center gap-3 md:gap-10">
                        <li><NavLink className={({isActive})=> isActive && location.pathname === "/ADMIN-DASHBOARD/viewcourses" ? "bg-BLUE text-white px-2 py-2 md:px-3 md:py-2 rounded-md md:rounded-xl font-semibold" : "text-black px-2 py-2 md:px-3 md:py-2 font-semibold"} to="/ADMIN-DASHBOARD/viewcourses">All Courses</NavLink></li>
                        <li><NavLink className={({isActive})=> isActive ? "bg-BLUE text-white px-2 py-2 md:px-3 md:py-2 rounded-md md:rounded-xl font-semibold" : "text-black px-2 py-2 md:px-3 md:py-2 font-semibold"} to="published">Published</NavLink></li>
                        <li><NavLink className={({isActive})=> isActive ? "bg-BLUE text-white px-2 py-2 md:px-3 md:py-2 rounded-md md:rounded-xl font-semibold" : "text-black px-2 py-2 md:px-3 md:py-2 font-semibold"} to="draft">Draft</NavLink></li>
                    </ul>
                    <div className="relative search-box my-4">
                        <input type="text" className="w-full md:w-1/2 h-8 md:h-10 rounded-lg md:rounded-xl" placeholder="Search names Here" />
                        <FaSearch size={15} className="absolute" />
                    </div>
                    <div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminViewCourses