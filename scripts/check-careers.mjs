import assert from 'node:assert/strict';

const realFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url) => {
  calls.push(url);
  return { ok: true, json: async () => url.includes('remotive') ? {
    jobs: [
      { id: 1, title: 'Splunk Engineer', company_name: 'Example', url: 'https://remotive.com/remote-jobs/1', publication_date: '2026-09-01', candidate_required_location: 'USA' },
      { id: 3, title: 'UK Developer', company_name: 'Example', url: 'https://remotive.com/remote-jobs/3', publication_date: '2026-09-01', candidate_required_location: 'United Kingdom' },
      { id: 4, title: 'Canadian Analyst', company_name: 'Example', url: 'https://remotive.com/remote-jobs/4', publication_date: '2026-09-01', candidate_required_location: 'Canada' },
      { id: 5, title: 'German Engineer', company_name: 'Example', url: 'https://remotive.com/remote-jobs/5', publication_date: '2026-09-01', candidate_required_location: 'Germany' },
      { id: 6, title: 'Australian Designer', company_name: 'Example', url: 'https://remotive.com/remote-jobs/6', publication_date: '2026-09-01', candidate_required_location: 'Australia' },
      { id: 2, title: 'Unsafe URL', url: 'javascript:alert(1)' },
    ],
  } : { data: [{ slug: 'finance', title: 'Financial Analyst', company_name: 'Example', url: 'https://www.arbeitnow.com/jobs/finance', created_at: 1788220800, remote: false }] } };
};
function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
}
const { default: handler } = await import('../api/jobs.js?test=success');
let result = response();
await handler({ method: 'GET' }, result);
assert.equal(result.code, 200);
assert.equal(result.data.jobs.length, 4);
assert.ok(result.data.jobs.every(job => /\b(?:US|USA|United Kingdom|Canada|Germany)\b/i.test(job.location)));
assert.equal(result.data.jobs.find(job => job.source === 'Remotive').remote, true);
assert.equal(result.data.jobs.find(job => job.source === 'Arbeitnow').remote, false);
assert.ok(result.data.jobs.every(job => job.date_posted));
await handler({ method: 'GET' }, response());
assert.equal(calls.length, 2, 'Repeated requests should use cache');
result = response();
await handler({ method: 'POST' }, result);
assert.equal(result.code, 405);
globalThis.fetch = async () => { throw new Error('offline'); };
const { default: unavailable } = await import('../api/jobs.js?test=offline');
result = response();
await unavailable({ method: 'GET' }, result);
assert.equal(result.code, 502);
globalThis.fetch = async (url) => {
  if (url.includes('remotive')) throw new Error('offline');
  return { ok: true, json: async () => ({ data: [{ slug: 'one', title: 'Developer', url: 'https://www.arbeitnow.com/jobs/one', created_at: 1788220800 }] }) };
};
const { default: partial } = await import('../api/jobs.js?test=partial');
result = response();
await partial({ method: 'GET' }, result);
assert.equal(result.code, 200);
assert.equal(result.data.partial, true);
assert.equal(result.data.jobs.length, 0);
console.log('Careers checks passed: normalization, unsafe URLs, caching, method handling, total and partial outages.');
globalThis.fetch = realFetch;
if (process.argv.includes('--live')) {
  const { default: live } = await import('../api/jobs.js?test=live');
  result = response();
  await live({ method: 'GET' }, result);
  console.log(JSON.stringify({ status: result.code, count: result.data.count, partial: result.data.partial, error: result.data.error, sources: [...new Set((result.data.jobs || []).map(job => job.source))] }));
  assert.equal(result.code, 200);
  assert.ok(result.data.jobs.length > 0);
}
