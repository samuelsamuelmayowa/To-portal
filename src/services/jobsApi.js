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

  const response = await fetch(`/api/jobs?${params.toString()}`, { signal });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load career jobs.");
  }

  return Array.isArray(payload?.jobs) ? payload.jobs : [];
}
