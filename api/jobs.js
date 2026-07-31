const RAPID_API_HOST = "linkedin-job-search-api.p.rapidapi.com";
const RAPID_API_URL = `https://${RAPID_API_HOST}/active-jb`;

const SEARCH_QUERIES = {
  all: 'Splunk OR SIEM OR Linux OR "Financial Analyst" OR "Finance Analyst" OR "Investment Analyst" OR "Risk Analyst" OR FinTech',
  splunk: 'Splunk OR SIEM OR "Security Information and Event Management"',
  linux: 'Linux OR Unix OR "System Administrator"',
  finance:
    '"Financial Analyst" OR "Finance Analyst" OR "Investment Analyst" OR "Risk Analyst" OR FinTech OR "Credit Analyst" OR "Treasury Analyst"',
};

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function extractJobs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RAPIDAPI_KEY) {
    return response.status(500).json({
      error: "RAPIDAPI_KEY is not configured on the server.",
    });
  }

  const category = String(request.query.category || "all").toLowerCase();
  const location = String(request.query.location || "United States").trim();
  const limit = clampInteger(request.query.limit, 100, 1, 100);
  const offset = clampInteger(request.query.offset, 0, 0, 10000);
  const timeFrame = String(request.query.time_frame || "7d");

  const params = new URLSearchParams({
    time_frame: timeFrame,
    title: SEARCH_QUERIES[category] || SEARCH_QUERIES.all,
    limit: String(limit),
    offset: String(offset),
    description_format: "text",
  });

  if (location) {
    params.set("location", location);
  }

  try {
    const rapidResponse = await fetch(`${RAPID_API_URL}?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPID_API_HOST,
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    });

    const payload = await rapidResponse.json().catch(() => null);

    if (!rapidResponse.ok) {
      return response.status(rapidResponse.status).json({
        error:
          payload?.message ||
          payload?.error ||
          `RapidAPI request failed with status ${rapidResponse.status}.`,
      });
    }

    const jobs = extractJobs(payload).filter(
      (job) => job && typeof job.url === "string" && job.url.trim(),
    );

    response.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=3600",
    );

    return response.status(200).json({
      jobs,
      count: jobs.length,
      offset,
      limit,
      category,
      location,
    });
  } catch (error) {
    console.error("Career jobs API error:", error);
    return response.status(500).json({
      error: "Unable to load jobs right now.",
    });
  }
}
