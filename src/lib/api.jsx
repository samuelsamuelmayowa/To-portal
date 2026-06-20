// src/lib/api.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API || "http://localhost:5050/api";

function getStudentEmail() {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) return "student@example.com";

    // If user was saved as JSON object
    const parsedUser = JSON.parse(rawUser);

    return parsedUser?.email || rawUser;
  } catch {
    // If user was saved as plain email string
    return localStorage.getItem("user") || "student@example.com";
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token and student email dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");

    // For your real app, use the real token.
    // For Splunk lab testing, this fallback helps the demo backend work.
    const finalToken = token || "student-demo-token";

    config.headers.Authorization = `Bearer ${finalToken}`;
    config.headers["x-student-email"] = getStudentEmail();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const apiGet = (url) => api.get(url);
export const apiPost = (url, data) => api.post(url, data);
export const apiPut = (url, data) => api.put(url, data);
export const apiDelete = (url) => api.delete(url);

// Add this so your SplunkPracticeLab can do:
// import api from "../lib/api";
export default api;

// // src/lib/api.js
// import axios from "axios";

// const API_BASE_URL = import.meta.env.VITE_BACKEND_API || "http://localhost:5050/api",

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add token dynamically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const apiGet = (url) => api.get(url);
// export const apiPost = (url, data) => api.post(url, data);
// export const apiPut = (url, data) => api.put(url, data);
// export const apiDelete = (url) => api.delete(url);



// // // src/lib/api.js
// // import axios from "axios";

// // // 🧠 Base URL of your Node.js backend
// // const API_BASE_URL = import.meta.env.VITE_HOME_OO

// //  const token = localStorage.getItem("ACCESS_TOKEN");
// // // "https://mafaconnectbackendapi.onrender.com/api/v1"
// // // import.meta.env.VITE_HOME_OO

// // // Axios instance
// // export const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     "Content-Type": "application/json",
// //      Authorization: `Bearer ${token}` ,
// //   },
// // });

// // // GET request
// // export const apiGet = async (url) => {
// //   const response = await api.get(url, {
// //      headers: {
// //     "Content-Type": "application/json",
// //      Authorization: `Bearer ${token}` ,
// //   },
// //   });
// //   return response;
// // };

// // // POST request
// // export const apiPost = async (url, data) => {
// //   const response = await api.post(url, data);
// //   return response;
// // };

// // // PUT request
// // export const apiPut = async (url, data) => {
// //   const response = await api.put(url, data);
// //   return response;
// // };

// // // DELETE request
// // export const apiDelete = async (url) => {
// //   const response = await api.delete(url);
// //   return response;
// // };
