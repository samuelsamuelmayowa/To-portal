import axios from "axios";
import { API_ORIGIN } from "./apiOrigin";

let csrfToken = "";

export function setCsrfToken(value) {
  csrfToken = typeof value === "string" ? value : "";
}

export function getCsrfToken() {
  return csrfToken;
}

export function cookieAuthFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const method = String(options.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  return fetch(url, { ...options, headers, credentials: "include" });
}

export const cookieAuthApi = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

cookieAuthApi.interceptors.request.use((config) => {
  config.withCredentials = true;
  const method = String(config.method || "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

cookieAuthApi.interceptors.response.use(
  (response) => {
    if (typeof response.data?.csrfToken === "string") setCsrfToken(response.data.csrfToken);
    return response;
  },
  (error) => {
    if (typeof error.response?.data?.csrfToken === "string") setCsrfToken(error.response.data.csrfToken);
    return Promise.reject(error);
  },
);
