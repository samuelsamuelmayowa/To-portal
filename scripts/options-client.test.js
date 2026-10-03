import test from 'node:test';
import assert from 'node:assert/strict';
import { createOptionsClient } from '../src/services/optionsClient.js';

test('HTML 404 identifies the missing backend release rather than an empty account', async () => {
  const request = createOptionsClient({ fetcher: async () => new Response('<pre>Cannot GET /api/options/account</pre>', { status: 404 }) });
  await assert.rejects(request('account'), error => error.code === 'OPTIONS_ROUTE_MISSING' && error.status === 404 && /backend release/.test(error.message));
});

test('Options preserves classified backend errors and empty successes', async () => {
  for (const [status, code] of [[401, 'AUTH_REQUIRED'], [429, 'ALPACA_RATE_LIMITED'], [503, 'DATABASE_MIGRATION_REQUIRED'], [502, 'ALPACA_ACCESS_DENIED'], [500, 'SERVER_ERROR']]) {
    const request = createOptionsClient({ fetcher: async () => Response.json({ code, error: 'Specific reason' }, { status }) });
    await assert.rejects(request('account'), error => error.code === code && error.status === status && error.message === 'Specific reason');
  }
  for (const data of [{ positions: [] }, { history: [] }, { expirations: [] }, { contracts: [] }]) {
    assert.deepEqual(await createOptionsClient({ fetcher: async () => Response.json(data) })('positions'), data);
  }
});

test('authenticated requests use the existing API base and Supabase bearer token only', async () => {
  let seen;
  const request = createOptionsClient({ apiBaseUrl: 'https://backend.example/api', getSession: async () => ({ access_token: 'test-session' }), fetcher: async (url, options) => { seen = { url, ...options }; return Response.json({ status: 'ok' }); } });
  await request('orders', { authenticated: true, body: { symbol: 'test' } });
  assert.equal(seen.url, 'https://backend.example/api/options/orders');
  assert.equal(seen.method, 'POST');
  assert.equal(seen.headers.Authorization, 'Bearer test-session');
  assert.equal(seen.credentials, 'omit');
  await request('expirations?symbol=AAPL');
  assert.equal(seen.headers.Authorization, undefined);
  assert.equal(seen.method, 'GET');
});

test('missing auth rejects before network and non-JSON success is a configuration error', async () => {
  const request = createOptionsClient({ getSession: async () => null, fetcher: () => { throw new Error('must not fetch'); } });
  await assert.rejects(request('account', { authenticated: true }), { code: 'AUTH_REQUIRED' });
  await assert.rejects(createOptionsClient({ fetcher: async () => new Response('<html>Vite fallback</html>') })('account'), { code: 'INVALID_RESPONSE' });
});

test('network failure, request timeout, and query cancellation remain distinct', async () => {
  await assert.rejects(createOptionsClient({ fetcher: async () => { throw new TypeError('Failed to fetch'); } })('expirations'), { code: 'BACKEND_UNREACHABLE' });
  const pending = (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  const request = createOptionsClient({ timeoutMs: 10, fetcher: pending });
  await assert.rejects(request('expirations', { signal: new AbortController().signal }), { code: 'BACKEND_TIMEOUT' });
  const controller = new AbortController();
  const result = request('expirations', { signal: controller.signal });
  controller.abort();
  await assert.rejects(result, { name: 'AbortError' });
});
