export async function fetchCareerJobs({
  query,
  category,
  location,
  workplace,
  employmentType,
  seniority,
  datePosted,
  page = 1,
  cursor,
  signal,
} = {}) {
  const params = new URLSearchParams();
  const filters = {
    query,
    category,
    location,
    workplace,
    employmentType,
    seniority,
    datePosted,
    page: String(page),
    cursor,
  };
  Object.entries(filters).forEach(([name, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(name, String(value));
    }
  });

  const response = await fetch(`/api/jobs?${params.toString()}`, { signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Jobs request failed (${response.status}).`);
  }
  if (!Array.isArray(payload.jobs) || !payload.pagination) {
    throw new Error("The jobs service returned an unexpected response.");
  }
  return payload;
}
