export async function fetchCareerJobs({
  category = "all",
  location = "United States",
  limit = 100,
  offset = 0,
  timeFrame = "7d",
  signal,
} = {}) {
  const params = new URLSearchParams({
    category,
    location,
    limit: String(limit),
    offset: String(offset),
    time_frame: timeFrame,
  });

  const response = await fetch(`/api/career-jobs?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        `Unable to load jobs. Request failed with status ${response.status}.`,
    );
  }

  return Array.isArray(payload?.jobs) ? payload.jobs : [];
}