const RAPID_API_HOST = "linkedin-job-search-api.p.rapidapi.com";
const RAPID_API_URL = `https://${RAPID_API_HOST}/active-jb`;

const SEARCH_QUERIES = {
  all: [
    '"Software Engineer"',
    '"Software Developer"',
    '"Frontend Developer"',
    '"Backend Developer"',
    '"Full Stack Developer"',
    '"React Developer"',
    '"Node.js Developer"',
    '"Python Developer"',
    '"Java Developer"',
    '"Mobile Developer"',
    '"React Native Developer"',
    '"Android Developer"',
    '"iOS Developer"',
    '"Cloud Engineer"',
    '"DevOps Engineer"',
    '"Site Reliability Engineer"',
    '"Cybersecurity Analyst"',
    '"Security Engineer"',
    '"SOC Analyst"',
    '"Splunk Engineer"',
    '"SIEM Engineer"',
    '"Linux Engineer"',
    '"Linux Administrator"',
    '"System Administrator"',
    '"Network Engineer"',
    '"Data Engineer"',
    '"Data Analyst"',
    '"Machine Learning Engineer"',
    '"AI Engineer"',
    '"QA Engineer"',
    '"IT Support Specialist"',
  ].join(" OR "),

  splunk: [
    '"Splunk Engineer"',
    '"Splunk Developer"',
    '"Splunk Administrator"',
    '"Splunk Architect"',
    '"Splunk Analyst"',
    '"SIEM Engineer"',
    '"SOC Analyst"',
  ].join(" OR "),

  linux: [
    '"Linux Engineer"',
    '"Linux Administrator"',
    '"Linux System Administrator"',
    '"Unix Administrator"',
    '"System Administrator"',
    '"Infrastructure Engineer"',
  ].join(" OR "),

  software: [
    '"Software Engineer"',
    '"Software Developer"',
    '"Frontend Developer"',
    '"Backend Developer"',
    '"Full Stack Developer"',
    '"React Developer"',
    '"Node.js Developer"',
    '"Python Developer"',
    '"Java Developer"',
  ].join(" OR "),

  cybersecurity: [
    '"Cybersecurity Analyst"',
    '"Security Engineer"',
    '"SOC Analyst"',
    '"Security Operations Analyst"',
    '"Incident Response Analyst"',
    '"Penetration Tester"',
    '"SIEM Engineer"',
  ].join(" OR "),

  cloud: [
    '"Cloud Engineer"',
    '"Cloud Architect"',
    '"DevOps Engineer"',
    '"Site Reliability Engineer"',
    '"Platform Engineer"',
    '"AWS Engineer"',
    '"Azure Engineer"',
    '"Kubernetes Engineer"',
  ].join(" OR "),

  data: [
    '"Data Engineer"',
    '"Data Analyst"',
    '"Data Scientist"',
    '"Machine Learning Engineer"',
    '"AI Engineer"',
    '"Database Administrator"',
  ].join(" OR "),

  mobile: [
    '"Mobile Developer"',
    '"React Native Developer"',
    '"Android Developer"',
    '"iOS Developer"',
    '"Flutter Developer"',
  ].join(" OR "),

  support: [
    '"IT Support Specialist"',
    '"Technical Support Engineer"',
    '"Help Desk Technician"',
    '"Desktop Support Engineer"',
    '"Network Engineer"',
  ].join(" OR "),
};

function getQueryValue(value, fallback = "") {
  if (Array.isArray(value)) {
    return String(value[0] ?? fallback);
  }

  return String(value ?? fallback);
}

function clampInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, parsed));
}

function extractJobs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  if (Array.isArray(payload?.results)) return payload.results;

  return [];
}

function getJobUrl(job) {
  const possibleUrls = [
    job?.url,
    job?.application_url,
    job?.apply_url,
    job?.external_apply_url,
    job?.job_url,
    job?.linkedin_url,
  ];

  return (
    possibleUrls.find(
      (url) =>
        typeof url === "string" &&
        /^https?:\/\//i.test(url.trim()),
    )?.trim() || ""
  );
}

function prepareJobs(payload) {
  const seenJobs = new Set();

  return extractJobs(payload)
    .map((job) => ({
      ...job,
      url: getJobUrl(job),
    }))
    .filter((job) => {
      return (
        job &&
        typeof job.title === "string" &&
        job.title.trim() &&
        job.url
      );
    })
    .filter((job) => {
      const uniqueKey = String(
        job.linkedin_id ||
          job.id ||
          `${job.title}-${job.organization || job.company}-${job.url}`,
      );

      if (seenJobs.has(uniqueKey)) {
        return false;
      }

      seenJobs.add(uniqueKey);
      return true;
    });
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");

    return response.status(405).json({
      error: "Method not allowed.",
    });
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return response.status(500).json({
      error: "RAPIDAPI_KEY is not configured on the server.",
    });
  }

  const requestedCategory = getQueryValue(
    request.query.category,
    "all",
  ).toLowerCase();

  const category = SEARCH_QUERIES[requestedCategory]
    ? requestedCategory
    : "all";

  const location = getQueryValue(
    request.query.location,
    "United States",
  ).trim();

  const timeFrame = getQueryValue(
    request.query.time_frame,
    "7d",
  ).trim();

  const limit = clampInteger(request.query.limit, 20, 1, 20);
  const offset = clampInteger(request.query.offset, 0, 0, 10000);

  const params = new URLSearchParams({
    title: SEARCH_QUERIES[category],
    time_frame: timeFrame,
    limit: String(limit),
    offset: String(offset),
    description_format: "text",
  });

  if (location) {
    params.set("location", location);
  }

  try {
    const rapidResponse = await fetch(
      `${RAPID_API_URL}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-rapidapi-host": RAPID_API_HOST,
          "x-rapidapi-key": apiKey,
        },
      },
    );

    const responseText = await rapidResponse.text();

    let payload = null;

    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      payload = null;
    }

    if (!rapidResponse.ok) {
      console.error("RAPIDAPI JOBS ERROR:", {
        status: rapidResponse.status,
        payload,
        responseText,
      });

      let errorMessage =
        payload?.message ||
        payload?.error ||
        `RapidAPI request failed with status ${rapidResponse.status}.`;

      if (rapidResponse.status === 401) {
        errorMessage =
          "RapidAPI rejected the API key. Check RAPIDAPI_KEY.";
      }

      if (rapidResponse.status === 403) {
        errorMessage =
          "RapidAPI rejected this request. Check your LinkedIn Job Search API subscription.";
      }

      if (rapidResponse.status === 429) {
        errorMessage =
          "Your LinkedIn Job Search API monthly quota has been reached.";
      }

      return response.status(rapidResponse.status).json({
        error: errorMessage,
        rapidApiStatus: rapidResponse.status,
      });
    }

    const jobs = prepareJobs(payload);

    response.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=604800",
    );

    return response.status(200).json({
      jobs,
      count: jobs.length,
      category,
      location,
      limit,
      offset,
      timeFrame,
    });
  } catch (error) {
    console.error("CAREER JOBS SERVER ERROR:", error);

    return response.status(500).json({
      error: "Unable to connect to the jobs provider.",
    });
  }
}