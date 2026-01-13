import axios from "axios";

const BASE = import.meta.env.VITE_MASSIVE_BASE;
const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY

export const massive = axios.create({
  baseURL: "https://api.massive.com/v3/reference",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});
