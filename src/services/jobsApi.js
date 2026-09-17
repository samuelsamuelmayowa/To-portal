const FUNCTION_NAME = "active-jobs";

function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("The Supabase URL or anonymous key is missing.");
  }

  return { url, anonKey };
}

export async function fetchCareerJobs({
  category = "all",
  location = "United States OR United Kingdom",
  limit = 60,
  timeFrame = "7d",
  signal,
} = {}) {
  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/functions/v1/${FUNCTION_NAME}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ category, location, limit, timeFrame }),
    signal,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Jobs request failed (${response.status}).`);
  }

  if (!Array.isArray(payload.jobs)) {
    throw new Error("The jobs service returned an unexpected response.");
  }

  return payload.jobs;
}
