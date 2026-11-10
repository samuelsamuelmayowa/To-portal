import { app } from "../../../firebase.config";
import { useStateContext } from '../../context/ContextProvider';
import { getAuth, signOut } from "firebase/auth";
import { cookieAuthApi } from "../../lib/cookieAuth";
// import { getIdToken, GithubAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";


const Dashboard = () => {
    const { setToken, setUser } = useStateContext()
    const auth = getAuth(app);
    const signout = async () => {
        try {
            await cookieAuthApi.post("/api/session/logout");
            await signOut(auth).catch(() => {});
            localStorage.removeItem("user");
            setToken(false);
            setUser(null);
        } catch (err) {
            console.log(err.message);
        }
    }
    return (
        <div>
            <button onClick={signout} >signOut</button>
        </div>
    )
}

export default Dashboard;
