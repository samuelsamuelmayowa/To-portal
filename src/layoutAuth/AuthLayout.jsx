import NavBar from "../components/NavBar";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom"
import { useStateContext } from "../context/ContextProvider"
import { getIdToken, GithubAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";
import { app } from "../../firebase.config";
import { useEffect } from "react";
import Footer from "../components/Footer";
const api = 'http://localhost:8000/api/'
import Messages from "../components/Messages";
function AuthLayout() {
    const {  token ,  setToken , user, setUser } = useStateContext();
    if (!token) {
        return <Navigate to="/" />
    }
    const auth = getAuth(app);
    const signout = () => {
        signOut(auth).then((user) => {
            // window.localStorage.removeItem("ACCESS_TOKEN");
            setToken(null)
        }).catch((err) => console.log(err.message))
    }
    // useEffect(() => {
    //     const maintoken = window.localStorage.getItem("ACCESS_TOKEN")
    //     fetch(`${api}users`, {
    //         method: "GET",
    //         headers: {
    //             "Authorization":`Bearer ${maintoken}`,
    //             "Content-Type": "application/json"
    //         }
    //     }).then((res) => {
    //         return res.json()
    //     }).catch((data) => {
    //         console.log(data)
    //     }).catch((err)=>console.log(err.message))
    // })
    return (
        <>
            <NavBar />
            <div className="mt-32">
                <Outlet />
            </div>
            <Messages />
            {
                location.pathname === "/dashboard" ||
                location.pathname === "/dashboard/makePayment" ||
                location.pathname === "/dashboard/comment" ||
                location.pathname === "/dashboard/links" ||
                location.pathname === "/dashboard/materials"
                ? <Footer black="bg-black text-white" /> : <Footer />
            }
        </>
    )
}

export default AuthLayout