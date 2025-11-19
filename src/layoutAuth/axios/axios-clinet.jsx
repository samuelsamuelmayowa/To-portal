import axios from "axios";
const axiosclinet = axios.create({
    // baseURL:`${ import.meta.env.API_KEY}/api`
    baseURL: "http://localhost:8000/"
    // baseURL:"https://codarnetwork.online/"
});

axiosclinet.defaults.headers.post["Content-Type"] = "application/json";
axiosclinet.defaults.headers.post["Accept"] = "application/json";
axiosclinet.defaults.withCredentials = true; // generate

axiosclinet.interceptors.request.use((config) => {
    const token = localStorage.getItem("ACCESS_TOKEN")
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config
})


axiosclinet.interceptors.response.use((respone) => {
    return respone;
}, (error) => {
    try {
        const { response } = error;
        if (response.status === 401) {
            localStorage.removeItem("ACCESS_TOKEN")
        }
    } catch (err) {
        console.log(err)
    }
    throw error;
})
export default axiosclinet;