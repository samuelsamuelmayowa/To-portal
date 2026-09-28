export async function fetchCareerJobs({ signal } = {}) {
  const response = await fetch("/api/jobs", { signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Jobs request failed (" + response.status + ").");
  if (!Array.isArray(payload.jobs)) throw new Error("The jobs service returned an unexpected response.");
  return payload.jobs.map((job) => {
    const document = new DOMParser().parseFromString(job.description || "", "text/html");
    document.querySelectorAll("script, style").forEach((node) => node.remove());
    return { ...job, description: document.body.textContent.replace(/\s+/g, " ").trim() };
  });
}
