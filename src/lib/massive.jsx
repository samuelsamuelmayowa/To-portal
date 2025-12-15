import axios from "axios";

const BASE = import.meta.env.VITE_MASSIVE_BASE;
const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY;

export const massive = axios.create({
  baseURL: BASE,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});
