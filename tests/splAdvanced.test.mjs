import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runSPL } from '../src/utils/splEngine.js';
import { SPL_LESSONS, SPL_COMMANDS } from '../src/data/splLessons.js';

// The production app already has src/data/logs.js; this downloadable upgrade does
// not replace it. For standalone tests, substitute an empty legacy log fixture.
const fixtureCode = fs.readFileSync(new URL('../src/data/splTrainingData.js', import.meta.url), 'utf8')
  .replace('import { LOGS } from "./logs";', 'const LOGS = {};');
const { LAB_LOGS } = await import(`data:text/javascript;base64,${Buffer.from(fixtureCode).toString('base64')}`);
const run = (q) => runSPL(q, LAB_LOGS);
const success = (q) => {
  const result = run(q);
  assert.equal(result.error, undefined, `${q} -> ${result.error}`);
  return result;
};

test('rex extracts named fields from raw logs, including Python-style capture syntax', () => {
  const a = success('index=training_apps | rex field=_raw "(?<severity>ERROR|WARN|INFO)" | stats count by severity');
  assert.ok(a.results.some((x) => x.severity === 'ERROR' && x.count > 0));
  const b = success('index=training_apps | rex field=message "(?P<severity>ERROR|WARN|INFO)" | stats count by severity');
  assert.equal(b.results.find((r) => r.severity === 'ERROR').count, a.results.find((r) => r.severity === 'ERROR').count);
  assert.match(run('index=training_apps | rex field=_raw "[a-z]+"').error, /named capture/i);
  assert.match(run('index=training_apps | rex mode=sed "s/x/y/g"').error, /not mode=sed/i);
});
test('lookup enriches records using sample tables', () => {
  const x = success('index=training_security | lookup user_directory.csv user OUTPUT department role | stats count by department');
  assert.ok(x.results.some((row) => row.department === 'Engineering' && row.count > 0));
  const y = success('index=training_web | lookup asset_inventory.csv host OUTPUT owner AS asset_owner environment');
  assert.ok(y.results.every((row) => typeof row.asset_owner === 'string'));
  const z = success('index=training_web | lookup asset_inventory.csv host OUTPUTNEW owner');
  assert.ok(z.results[0].owner);
  assert.match(run('index=training_web | lookup missing.csv host').error, /Unknown lookup/);
});
test('inputlookup starts a pipeline and reads known tables', () => {
  const x = success('| inputlookup product_catalog.csv | stats count by category');
  assert.equal(x.index, 'lookup:product_catalog.csv');
  assert.equal(x.results.find((r) => r.category === 'Accessories').count, 2);
  assert.equal(success('inputlookup user_directory.csv').count, 6);
  assert.match(run('| inputlookup no.csv').error, /Unknown lookup/);
});
test('transaction correlates events by common session id and time span', () => {
  const result = success('index=training_sessions | transaction session_id maxspan=30m | table session_id user eventcount duration');
  assert.equal(result.totalRows, 30);
  assert.ok(result.results.every((r) => r.eventcount === 3 && r.duration === 360));
  const failure = success('index=training_sessions | transaction session_id maxspan=30m | search outcome=failed | stats count by user');
  assert.ok(failure.results.some((x) => x.count > 0));
  assert.equal(success('index=training_sessions | transaction session_id maxspan=1m').totalRows, 90);
  assert.match(run('index=training_sessions | transaction session_id startswith=login').error, /supports maxspan and maxevents only/);
});
test('every guided lab starter query produces expected results', () => {
  assert.equal(SPL_LESSONS.length, 22);
  for (const lesson of SPL_LESSONS) {
    const out = success(lesson.starter);
    assert.ok(lesson.check(lesson.starter, out), `Failed exercise validation for ${lesson.id}: ${lesson.title}`);
  }
  for (const name of ['rex', 'lookup', 'inputlookup', 'transaction']) assert.ok(SPL_COMMANDS.find((x) => x.name === name));
});

test('admin state supports index, monitor, retention and role workflows', async () => {
  const old = globalThis.localStorage;
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) };
  try {
    const code = fs.readFileSync(new URL('../src/data/splAdminState.js', import.meta.url), 'utf8')
      .replace('import { LAB_LOGS } from "./splTrainingData.js";', 'const LAB_LOGS = { training_web: [] };');
    const a = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    let state = a.getAdminState();
    state = a.addAdminIndex(state, { name: 'training_ops', retentionDays: 180 });
    assert.throws(() => a.addAdminIndex(state, { name: 'training_ops', retentionDays: 180 }), /already exists/);
    assert.throws(() => a.addAdminInput(state, {index:'training_ops', source:'relative/path', sourcetype:'app_json', host:'lab-01'}), /sample absolute path/);
    state = a.addAdminInput(state, {index:'training_ops', source:'/var/log/training/app.log', sourcetype:'app_json', host:'lab-01'});
    state = a.updateAdminRetention(state, 'training_ops', 60);
    state = a.assignAdminRole(state, 'analyst', 'training_ops');
    a.saveAdminState(state);
    assert.equal(a.getAdminState().indexes[0].retentionDays, 60);
    assert.equal(a.getLabLogs().training_ops.length, 48);
    assert.equal(runSPL('index=training_ops | stats count by level', a.getLabLogs()).error, undefined);
    assert.ok(a.adminConfPreview(state)['inputs.conf'].includes('monitor:///var/log/training/app.log'));
    assert.ok(a.adminProgress(state).slice(0,4).every((x) => x.done));
  } finally { globalThis.localStorage = old; }
});
