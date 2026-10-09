const DEFAULT_BACKEND_URL = "https://to-backendapi-v1-kctb.onrender.com";
const serverEnv = globalThis.process ? globalThis.process.env : {};

export default async function handler(request, response, options = {}) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const backendUrl = String(
    options.backendUrl ||
      serverEnv.BACKEND_API_URL ||
      serverEnv.VITE_BACKEND_API ||
      serverEnv.VITE_API_URL ||
      DEFAULT_BACKEND_URL,
  ).trim().replace(/\/+$/, "");
  let search;
  try {
    search = new URL(request.url, "http://localhost").search;
  } catch {
    return response.status(400).json({ error: "Invalid jobs request." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 13_000);
  try {
    const upstream = await fetch(`${backendUrl}/api/jobs${search}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const payload = await upstream.json();
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) response.setHeader("Cache-Control", cacheControl);
    return response.status(upstream.status).json(payload);
  } catch {
    return response
      .status(502)
      .json({ error: "Live job search is temporarily unavailable. Please try again later." });
  } finally {
    clearTimeout(timeout);
  }
}
