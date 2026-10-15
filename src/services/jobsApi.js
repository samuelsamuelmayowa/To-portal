/** Call YOUR backend, never OpenWeb Ninja from the browser. */
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
    query, category, location, workplace, employmentType, seniority,
    datePosted, page: String(page), cursor,
  };
  Object.entries(filters).forEach(([name, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(name, String(value));
    }
  });

  const response = await fetch(`/api/jobs?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Jobs request failed (${response.status}).`);
  }
  if (!Array.isArray(payload.jobs) || !payload.pagination || typeof payload.pagination !== "object") {
    throw new Error("The jobs service returned an unexpected response.");
  }
  return payload;
}

// export async function fetchCareerJobs({
//   query,
//   category,
//   location,
//   workplace,
//   employmentType,
//   seniority,
//   datePosted,
//   page = 1,
//   cursor,
//   signal,
// } = {}) {
//   const params = new URLSearchParams();
//   const filters = {
//     query,
//     category,
//     location,
//     workplace,
//     employmentType,
//     seniority,
//     datePosted,
//     page: String(page),
//     cursor,
//   };
//   Object.entries(filters).forEach(([name, value]) => {
//     if (value !== undefined && value !== null && String(value).trim()) {
//       params.set(name, String(value));
//     }
//   });

//   const response = await fetch(`/api/jobs?${params.toString()}`, { signal });
//   const payload = await response.json().catch(() => ({}));
//   if (!response.ok) {
//     throw new Error(payload.error || `Jobs request failed (${response.status}).`);
//   }
//   if (!Array.isArray(payload.jobs) || !payload.pagination) {
//     throw new Error("The jobs service returned an unexpected response.");
//   }
//   return payload;
// }
