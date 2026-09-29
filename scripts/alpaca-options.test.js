import test from 'node:test';
import assert from 'node:assert/strict';
import { createOptionsHandler } from '../api/options-chain.js';
import { normalizeAlpacaContract } from '../src/lib/optionsSimulator.js';

const snapshot = { latestQuote: { bp: 4, ap: 6, t: '2026-09-28T14:30:00Z' }, latestTrade: { p: 7 } };
const env = { ALPACA_API_KEY: 'test-key', ALPACA_API_SECRET: 'test-secret' };
function response() { return { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
const request = { method: 'GET', url: '/api/options-chain?symbol=AAPL&expiration=2026-10-02' };

test('Alpaca OCC symbols, midpoint, timestamps and trade fallback normalize', () => {
  const row = normalizeAlpacaContract('AAPL261002C00200000', snapshot, 'AAPL', 'indicative');
  assert.equal(row.strike, 200); assert.equal(row.expiration, '2026-10-02'); assert.equal(row.premium, 5); assert.equal(row.type, 'call'); assert.equal(row.timestamp, snapshot.latestQuote.t);
  assert.equal(normalizeAlpacaContract('AAPL261002P00200000', { latestTrade: { p: 7 } }, 'AAPL', 'opra').premium, 7);
  assert.equal(normalizeAlpacaContract('AAPL1261002C00200000', snapshot, 'AAPL', 'opra'), null);
  assert.equal(normalizeAlpacaContract('AAPL261002C00200000', {}, 'AAPL', 'opra'), null);
});
test('server authenticates, falls back from OPRA, paginates and caches', async () => {
  const calls = [];
  const handler = createOptionsHandler(env, async (url, options) => {
    calls.push(url); assert.equal(options.headers['APCA-API-SECRET-KEY'], 'test-secret');
    if (calls.length === 1) return { ok: false, status: 403 };
    const secondPage = new URL(url).searchParams.has('page_token');
    return { ok: true, json: async () => ({ snapshots: { [secondPage ? 'AAPL261002P00200000' : 'AAPL261002C00200000']: snapshot }, next_page_token: secondPage ? null : 'next' }) };
  });
  const res = response(); await handler(request, res);
  assert.equal(res.code, 200); assert.equal(res.body.feed, 'indicative'); assert.equal(res.body.contracts.length, 2); assert.equal(calls.length, 3);
  assert.ok(calls[1].includes('feed=indicative')); assert.ok(!JSON.stringify(res.body).includes('test-secret'));
  await handler(request, response()); assert.equal(calls.length, 3);
});
test('missing credentials, invalid requests, and upstream failures are explicit', async () => {
  const res = response(); await createOptionsHandler({})(request, res); assert.equal(res.code, 503);
  const invalid = response(); await createOptionsHandler(env)({ ...request, url: '/?symbol=AAPL&expiration=2026-02-31' }, invalid); assert.equal(invalid.code, 400);
  for (const status of [401, 403, 429, 500]) {
    const failed = response(); await createOptionsHandler({ ...env, ALPACA_OPTIONS_FEED: 'opra' }, async () => ({ ok: false, status }))(request, failed);
    assert.equal(failed.code, status === 429 ? 429 : 502); assert.ok(failed.body.error);
  }
});
