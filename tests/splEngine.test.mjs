import test from 'node:test';
import assert from 'node:assert/strict';
import { runSPL } from '../src/utils/splEngine.js';
const now = Date.now();
const time = (backMins) => new Date(now - backMins * 60000).toISOString();
const LOGS = { training_web: [
  { _time: time(10), status: 200, endpoint: '/login', response_time: 100, user: 'ade', message: 'ok' },
  { _time: time(20), status: 404, endpoint: '/missing', response_time: 750, user: 'zainab', message: 'not found' },
  { _time: time(30), status: 500, endpoint: '/login', response_time: 850, user: 'ade', message: 'error' },
  { _time: time(60), status: 200, endpoint: '/login', response_time: 300, user: 'ade', message: 'ok' },
] };
const run = (q) => runSPL(q, LOGS);
const succeeds = (q) => { const result = run(q); assert.ok(!result.error, `${q}: ${result.error}`); return result; };
test('keeps familiar contract and base searches', () => {
  const result = succeeds('index=training_web');
  assert.equal(result.count, 4);
  assert.equal(result.mode, 'events');
  assert.equal(result.results.length, 4);
  assert.equal(succeeds('index=training_web status=404').count, 1);
  assert.equal(succeeds('index=training_web error').count, 1);
  assert.equal(succeeds('index=training_web status>=400').count, 2);
});
test('search stage, filters, and time range', () => {
  assert.equal(succeeds('index=training_web | search status=500').totalRows, 1);
  assert.equal(succeeds('index=training_web | where response_time>500').totalRows, 2);
  assert.equal(succeeds('index=training_web | where status>=400 AND response_time>800').totalRows, 1);
  assert.equal(succeeds('index=training_web earliest=-24h latest=now').count, 4);
  assert.equal(succeeds('index=training_web earliest=-15m latest=now').count, 1);
});
test('stats count by and multiple measures', () => {
  const counts = succeeds('index=training_web | stats count by status').results;
  assert.equal(counts.length, 3);
  assert.equal(counts.find((x) => x.status === 200).count, 2);
  const rows = succeeds('index=training_web | stats count, avg(response_time) as latency, dc(user) as users by endpoint').results;
  assert.equal(rows.find((r) => r.endpoint === '/login').latency, 416.67);
  assert.equal(rows.find((r) => r.endpoint === '/login').users, 1);
  assert.equal(succeeds('index=training_web | stats count').results[0].count, 4);
});
test('series, chart grouping and chart friendly output', () => {
  const tc = succeeds('index=training_web | timechart span=15m count');
  assert.equal(tc.mode, 'timechart');
  assert.ok(tc.results.length > 0);
  assert.ok('_time' in tc.results[0] && 'count' in tc.results[0]);
  assert.ok(succeeds('index=training_web | timechart span=1h avg(response_time)').results.length > 0);
  assert.ok(succeeds('index=training_web | timechart span=1h count by endpoint').results.length > 0);
});
test('eval, table, and field selection', () => {
  const x = succeeds('index=training_web | eval seconds=round(response_time/1000,2) | table seconds').results;
  assert.equal(x[0].seconds, .1);
  const y = succeeds('index=training_web | eval health=if(status>=400,"Error","OK") | stats count by health').results;
  assert.equal(y.find((r) => r.health === 'Error').count, 2);
  assert.deepEqual(Object.keys(succeeds('index=training_web | fields - message | head 1').results[0]).includes('message'), false);
  assert.equal(succeeds('index=training_web | table status endpoint').mode, 'table');
});
test('top, rare, dedup, sort, fillnull, and bin', () => {
  assert.equal(succeeds('index=training_web | top user limit=2').results[0].user, 'ade');
  assert.equal(succeeds('index=training_web | rare user').results[0].user, 'zainab');
  assert.equal(succeeds('index=training_web | dedup user').totalRows, 2);
  assert.equal(succeeds('index=training_web | sort -response_time | head 1').results[0].response_time, 850);
  assert.equal(succeeds('index=training_web | rename response_time AS latency_ms').results[0].latency_ms, 100);
  assert.equal(succeeds('index=training_web | fillnull value="unknown" missing').results[0].missing, 'unknown');
  assert.ok(succeeds('index=training_web | bin _time span=1h | stats count by _time').results.length > 0);
});
test('unknown commands and invalid queries are errors', () => {
  assert.match(run('index=training_web | unsupported field').error, /Unsupported command/);
  assert.match(run('index=nope').error, /Unknown index/);
  assert.match(run('hello').error, /Specify an index/);
  assert.match(run('index=training_web | eval x=unknownfunc(status)').error, /Unknown eval function/);
});
