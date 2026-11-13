// Browser API calls use the Vercel same-origin proxy in production so session
// cookies remain first-party in Safari and other privacy-focused browsers.
// Local Vite development can still use the existing backend on port 8000.
const configuredLocalApi = String(import.meta.env.VITE_LOCAL_API_URL || "http://localhost:8000").trim().replace(/\/+$/, "");

export const API_ORIGIN = import.meta.env.DEV
  ? configuredLocalApi || "http://localhost:8000"
  : "";

export const API_ROOT = `${API_ORIGIN}/api`;
