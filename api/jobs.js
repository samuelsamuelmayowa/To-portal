const RAPID_API_HOST = "linkedin-job-search-api.p.rapidapi.com";
const RAPID_API_URL = `https://${RAPID_API_HOST}/active-jb`;

/*
 * These searches focus only on technology roles.
 * Finance roles have been removed.
 */
const SEARCH_QUERIES = {
  all: [
    '"Software Engineer"',
    '"Software Developer"',
    '"Frontend Developer"',
    '"Front End Developer"',
    '"Backend Developer"',
    '"Back End Developer"',
    '"Full Stack Developer"',
    '"Web Developer"',
    '"React Developer"',
    '"Node.js Developer"',
    '"Python Developer"',
    '"Java Developer"',
    '"Mobile Developer"',
    '"React Native Developer"',
    '"Android Developer"',
    '"iOS Developer"',
    '"Cloud Engineer"',
    '"Cloud Architect"',
    '"DevOps Engineer"',
    '"Site Reliability Engineer"',
    '"Platform Engineer"',
    '"AWS Engineer"',
    '"Azure Engineer"',
    '"Cybersecurity Analyst"',
    '"Security Engineer"',
    '"SOC Analyst"',
    '"Security Operations Analyst"',
    '"Splunk Engineer"',
    '"Splunk Developer"',
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
    '"Test Automation Engineer"',
    '"Database Administrator"',
    '"IT Support Specialist"',
    '"Technical Support Engineer"',
  ].join(" OR "),

  splunk: [
    '"Splunk Engineer"',
    '"Splunk Developer"',
    '"Splunk Administrator"',
    '"Splunk Architect"',
    '"Splunk Analyst"',
    '"SIEM Engineer"',
    '"SIEM Analyst"',
    '"SOC Analyst"',
    '"Security Operations Analyst"',
  ].join(" OR "),

  linux: [
    '"Linux Engineer"',
    '"Linux Administrator"',
    '"Linux System Administrator"',
    '"Unix Administrator"',
    '"System Administrator"',
    '"Infrastructure Engineer"',
    '"Platform Engineer"',
  ].join(" OR "),

  software: [
    '"Software Engineer"',
    '"Software Developer"',
    '"Frontend Developer"',
    '"Backend Developer"',
    '"Full Stack Developer"',
    '"Web Developer"',
    '"React Developer"',
    '"Node.js Developer"',
    '"Python Developer"',
    '"Java Developer"',
  ].join(" OR "),

  cloud: [
    '"Cloud Engineer"',
    '"Cloud Architect"',
    '"DevOps Engineer"',
    '"Site Reliability Engineer"',
    '"Platform Engineer"',
    '"AWS Engineer"',
    '"Azure Engineer"',
    '"Google Cloud Engineer"',
    '"Kubernetes Engineer"',
  ].join(" OR "),

  cybersecurity: [
    '"Cybersecurity Analyst"',
    '"Cyber Security Analyst"',
    '"Security Engineer"',
    '"SOC Analyst"',
    '"Security Operations Analyst"',
    '"Incident Response Analyst"',
    '"Penetration Tester"',
    '"Information Security Analyst"',
    '"SIEM Engineer"',
  ].join(" OR "),

  data: [
    '"Data Engineer"',
    '"Data Analyst"',
    '"Data Scientist"',
    '"Machine Learning Engineer"',
    '"AI Engineer"',
    '"Business Intelligence Developer"',
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
    '"Systems Support Engineer"',
  ].join(" OR "),
};

const TECH_KEYWORDS = [
  "software",
  "developer",
  "engineer",
  "frontend",
  "front end",
  "backend",
  "back end",
  "full stack",
  "react",
  "node.js",
  "javascript",
  "typescript",
  "python",
  "java",
  "mobile",
  "android",
  "ios",
  "flutter",
  "cloud",
  "aws",
  "azure",
  "google cloud",
  "devops",
  "kubernetes",
  "docker",
  "site reliability",
  "platform engineer",
  "cybersecurity",
  "cyber security",
  "security analyst",
  "security engineer",
  "soc analyst",
  "siem",
  "splunk",
  "linux",
  "unix",
  "system administrator",
  "network engineer",
  "data engineer",
  "data analyst",
  "data scientist",
  "machine learning",
  "artificial intelligence",
  "ai engineer",
  "database administrator",
  "quality assurance",
  "qa engineer",
  "test automation",
  "technical support",
  "it support",
  "help desk",
];

function getSingleQueryValue(value, fallback = "") {
  if (Array.isArray(value)) {
    return String(value[0] ?? fallback);
  }

  return String(value ?? fallback);
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function extractJobs(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.jobs)) return payload.jobs;
  if (Array.isArray(payload?.results)) return payload.results;

  return [];
}

function getApplyUrl(job) {
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
      (url) => typeof url === "string" && /^https?:\/\//i.test(url.trim()),
    )?.trim() || ""
  );
}

function getJobSearchText(job) {
  return [
    job?.title,
    job?.description_text,
    job?.description,
    job?.ai_requirements_summary,
    job?.ai_core_responsibilities,
    job?.organization,
    job?.company,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isTechnologyJob(job) {
  const text = getJobSearchText(job);

  return TECH_KEYWORDS.some((keyword) => text.includes(keyword));
}

function prepareJobs(payload) {
  const seen = new Set();

  return extractJobs(payload)
    .map((job) => {
      const url = getApplyUrl(job);

      return {
        ...job,
        url,
      };
    })
    .filter((job) => {
      return (
        job &&
        typeof job.title === "string" &&
        job.title.trim() &&
        job.url &&
        isTechnologyJob(job)
      );
    })
    .filter((job) => {
      const uniqueKey = String(
        job.linkedin_id ||
          job.id ||
          `${job.title}-${job.organization || job.company}-${job.url}`,
      );

      if (seen.has(uniqueKey)) {
        return false;
      }

      seen.add(uniqueKey);
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

  const requestedCategory = getSingleQueryValue(
    request.query.category,
    "all",
  ).toLowerCase();

  const category = SEARCH_QUERIES[requestedCategory]
    ? requestedCategory
    : "all";

  const location = getSingleQueryValue(
    request.query.location,
    "United States",
  ).trim();

  const timeFrame = getSingleQueryValue(
    request.query.time_frame,
    "7d",
  ).trim();

  const limit = clampInteger(request.query.limit, 100, 1, 100);
  const offset = clampInteger(request.query.offset, 0, 0, 10000);

  const params = new URLSearchParams({
    time_frame: timeFrame,
    title: SEARCH_QUERIES[category],
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
          "Content-Type": "application/json",
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
      console.error("RapidAPI jobs request failed:", {
        status: rapidResponse.status,
        payload,
      });

      let errorMessage =
        payload?.message ||
        payload?.error ||
        `RapidAPI request failed with status ${rapidResponse.status}.`;

      if (rapidResponse.status === 403) {
        errorMessage =
          "RapidAPI rejected the request. Confirm that your RapidAPI application is subscribed to the LinkedIn Job Search API.";
      }

      if (rapidResponse.status === 429) {
        errorMessage =
          "The RapidAPI jobs request limit has been reached. Try again later or review your RapidAPI plan.";
      }

      return response.status(rapidResponse.status).json({
        error: errorMessage,
      });
    }

    const jobs = prepareJobs(payload);

    response.setHeader(
      "Cache-Control",
      "s-maxage=1800, stale-while-revalidate=3600",
    );

    return response.status(200).json({
      jobs,
      count: jobs.length,
      category,
      location,
      offset,
      limit,
      timeFrame,
    });
  } catch (error) {
    console.error("Career jobs API error:", error);

    return response.status(500).json({
      error: "Unable to load jobs right now.",
    });
  }
}



// const RAPID_API_HOST = "linkedin-job-search-api.p.rapidapi.com";
// const RAPID_API_URL = `https://${RAPID_API_HOST}/active-jb`;

// const SEARCH_QUERIES = {
//   all: 'Splunk OR SIEM OR Linux OR "Financial Analyst" OR "Finance Analyst" OR "Investment Analyst" OR "Risk Analyst" OR FinTech',
//   splunk: 'Splunk OR SIEM OR "Security Information and Event Management"',
//   linux: 'Linux OR Unix OR "System Administrator"',
//   finance:
//     '"Financial Analyst" OR "Finance Analyst" OR "Investment Analyst" OR "Risk Analyst" OR FinTech OR "Credit Analyst" OR "Treasury Analyst"',
// };

// function clampInteger(value, fallback, min, max) {
//   const parsed = Number.parseInt(value, 10);
//   if (!Number.isFinite(parsed)) return fallback;
//   return Math.min(max, Math.max(min, parsed));
// }

// function extractJobs(payload) {
//   if (Array.isArray(payload)) return payload;
//   if (Array.isArray(payload?.data)) return payload.data;
//   if (Array.isArray(payload?.jobs)) return payload.jobs;
//   if (Array.isArray(payload?.results)) return payload.results;
//   return [];
// }

// export default async function handler(request, response) {
//   if (request.method !== "GET") {
//     response.setHeader("Allow", "GET");
//     return response.status(405).json({ error: "Method not allowed" });
//   }

//   if (!process.env.RAPIDAPI_KEY) {
//     return response.status(500).json({
//       error: "RAPIDAPI_KEY is not configured on the server.",
//     });
//   }

//   const category = String(request.query.category || "all").toLowerCase();
//   const location = String(request.query.location || "United States").trim();
//   const limit = clampInteger(request.query.limit, 100, 1, 100);
//   const offset = clampInteger(request.query.offset, 0, 0, 10000);
//   const timeFrame = String(request.query.time_frame || "7d");

//   const params = new URLSearchParams({
//     time_frame: timeFrame,
//     title: SEARCH_QUERIES[category] || SEARCH_QUERIES.all,
//     limit: String(limit),
//     offset: String(offset),
//     description_format: "text",
//   });

//   if (location) {
//     params.set("location", location);
//   }

//   try {
//     const rapidResponse = await fetch(`${RAPID_API_URL}?${params.toString()}`, {
//       headers: {
//         "Content-Type": "application/json",
//         "x-rapidapi-host": RAPID_API_HOST,
//         "x-rapidapi-key": process.env.RAPIDAPI_KEY,
//       },
//     });

//     const payload = await rapidResponse.json().catch(() => null);

//     if (!rapidResponse.ok) {
//       return response.status(rapidResponse.status).json({
//         error:
//           payload?.message ||
//           payload?.error ||
//           `RapidAPI request failed with status ${rapidResponse.status}.`,
//       });
//     }

//     const jobs = extractJobs(payload).filter(
//       (job) => job && typeof job.url === "string" && job.url.trim(),
//     );

//     response.setHeader(
//       "Cache-Control",
//       "s-maxage=1800, stale-while-revalidate=3600",
//     );

//     return response.status(200).json({
//       jobs,
//       count: jobs.length,
//       offset,
//       limit,
//       category,
//       location,
//     });
//   } catch (error) {
//     console.error("Career jobs API error:", error);
//     return response.status(500).json({
//       error: "Unable to load jobs right now.",
//     });
//   }
// }
