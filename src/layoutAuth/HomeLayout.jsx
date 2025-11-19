import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom"
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Messages from "../components/Messages";
import CartItemContext from "../context/CartItemContext";


function HomeLayout() {
    const location = useLocation()
    const { COURSES } = useContext(CartItemContext);
    const paths = COURSES.map((course) => `/courses/${course.courseName}`)
    return (
        <>
            <div>
                <NavBar />
                <Outlet />
                {
                    location.pathname === "/" ||
                    location.pathname === "/blog" ||
                    location.pathname === "/career" ||
                    location.pathname === "/courses"||
                    location.pathname ==="/sessions"||
                    location.pathname === "/contact" ||
                    location.pathname === "/checkout" ||
                    (COURSES.map((course, index) => location.pathname  === `${paths[index]}`) && location.pathname !== "/about")
                    ? <Footer black="bg-black text-white" /> : <Footer />
                }
                {/* <Messages /> */}
            </div>
        </>
    )
}

export default HomeLayout