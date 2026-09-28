const sources = [
  { name: 'Remotive', url: 'https://remotive.com/api/remote-jobs', field: 'jobs' },
  { name: 'Arbeitnow', url: 'https://www.arbeitnow.com/api/job-board-api', field: 'data' },
];
const cache = new Map();
function normalize(job, source) {
  if (!job || typeof job.title !== 'string' || !job.title.trim()) return null;
  try { if (!['http:', 'https:'].includes(new URL(job.url).protocol)) return null; } catch { return null; }
  const date = source === 'Remotive' ? new Date(job.publication_date) : new Date(Number(job.created_at) * 1000);
  const remote = source === 'Remotive' || job.remote === true;
  return {
    id: source + '-' + (job.id || job.slug || job.url), title: job.title,
    company: job.company_name || 'Company not listed',
    location: job.candidate_required_location || job.location || 'Location not listed',
    description: typeof job.description === 'string' ? job.description : '',
    date_posted: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
    url: job.url, source, remote, ai_work_arrangement: remote ? 'Remote' : '',
  };
}
async function load(source) {
  const entry = cache.get(source.name) || {};
  if (entry.expires > Date.now()) return entry.jobs;
  if (entry.pending) return entry.pending;
  entry.pending = (async () => {
    try {
      const response = await fetch(source.url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Provider unavailable');
      const data = await response.json();
      if (!Array.isArray(data[source.field])) throw new Error('Invalid provider response');
      entry.jobs = data[source.field].map(job => normalize(job, source.name)).filter(Boolean);
      entry.expires = Date.now() + 21600000;
      return entry.jobs;
    } finally { entry.pending = null; }
  })();
  cache.set(source.name, entry);
  return entry.pending;
}
export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  const results = await Promise.allSettled(sources.map(load));
  if (results.every(result => result.status === 'rejected')) {
    response.setHeader('Cache-Control', 'no-store');
    return response.status(502).json({ error: 'Job sources are temporarily unavailable. Please try again shortly.' });
  }
  const seen = new Set();
  const jobs = results.flatMap(result => result.status === 'fulfilled' ? result.value : []).filter(job => {
    if (seen.has(job.url)) return false;
    seen.add(job.url);
    return true;
  }).sort((a, b) => (Date.parse(b.date_posted) || 0) - (Date.parse(a.date_posted) || 0));
  const partial = results.some(result => result.status === 'rejected');
  response.setHeader('Cache-Control', partial ? 'public, s-maxage=60' : 'public, s-maxage=21600, stale-while-revalidate=3600');
  return response.status(200).json({ jobs, count: jobs.length, partial });
}
