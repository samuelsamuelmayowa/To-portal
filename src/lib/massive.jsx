import axios from "axios";

const BASE = import.meta.env.VITE_MASSIVE_BASE || "https://api.polygon.io";
const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY;

// Log to debug
console.log("Massive API Base:", BASE);
console.log("Massive API Key exists:", !!API_KEY);

export const massive = axios.create({
  baseURL: BASE,
  headers: API_KEY ? {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  } : {
    "Content-Type": "application/json",
  },
  params: API_KEY ? {} : { apiKey: API_KEY },
});

// Add response interceptor for debugging
massive.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Massive API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      endpoint: error.config?.url,
    });
    return Promise.reject(error);
  }
);
