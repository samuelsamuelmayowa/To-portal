const DEFAULT_PRODUCTION_ORIGIN = "https://to-backendapi-v1-kctb.onrender.com";

const configuredApi = import.meta.env?.VITE_BACKEND_API || import.meta.env?.VITE_API_URL;
const defaultOrigin = import.meta.env?.PROD ? DEFAULT_PRODUCTION_ORIGIN : "http://localhost:9000";
const configuredBase = String(configuredApi || defaultOrigin).trim().replace(/\/+$/, "");
export const MARKET_DATA_API_BASE = `${configuredBase.replace(/\/api$/, "")}/api`;

const websocketUrl = new URL(configuredBase.replace(/\/api$/, ""));
websocketUrl.protocol = websocketUrl.protocol === "https:" ? "wss:" : websocketUrl.protocol === "http:" ? "ws:" : websocketUrl.protocol;
websocketUrl.pathname = "/api/market-data/stream";
websocketUrl.search = "";
websocketUrl.hash = "";
export const MARKET_DATA_STREAM_URL = websocketUrl.toString();
