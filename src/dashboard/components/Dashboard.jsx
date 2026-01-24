import { app } from "../../../firebase.config";
import { useStateContext } from '../../context/ContextProvider';
import { getAuth, signOut } from "firebase/auth";
// import { getIdToken, GithubAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";


const Dashboard = () => {
    const { setToken } = useStateContext()
    const auth = getAuth(app);
    const signout = () => {
        signOut(auth).then((user) => {
            // window.localStorage.removeItem("ACCESS_TOKEN");
            setToken(null)
        }).catch((err) => console.log(err.message))
    }
    return (
        <div>
            <button onClick={signout} >signOut</button>
        </div>
    )
}

export default Dashboard;