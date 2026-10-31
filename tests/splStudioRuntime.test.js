import test from "node:test";
import assert from "node:assert/strict";
import { evaluateStudioQuery, evaluateStudioAlert, numberForPanel, chartKeys } from "../src/utils/splStudioRuntime.js";

const datasets = {
  training_web: [
    { _time: "2026-10-30T16:00:00.000Z", status: 200, endpoint: "/", _raw: "200 /" },
    { _time: "2026-10-30T16:01:00.000Z", status: 404, endpoint: "/missing", _raw: "404 /missing" },
    { _time: "2026-10-30T16:02:00.000Z", status: 404, endpoint: "/broken", _raw: "404 /broken" },
  ],
};
test("dashboard can evaluate the same modern training indexes as the search console", () => {
  const output = evaluateStudioQuery("index=training_web | stats count by status", datasets);
  assert.equal(output.error, undefined);
  assert.equal(output.count, 3);
  assert.equal(output.totalRows, 2);
  assert.deepEqual(chartKeys(output), { xKey: "status", yKey: "count" });
});
test("number cards show aggregated values instead of number of groups", () => {
  const output = evaluateStudioQuery("index=training_web | stats count", datasets);
  assert.equal(numberForPanel(output).value, 3);
});
test("alert event count is distinct from aggregate result row count", () => {
  const alert = { spl: "index=training_web | stats count by status", operator: ">=", threshold: 3 };
  const byEvents = evaluateStudioAlert({ ...alert, metric: "events" }, datasets);
  const byRows = evaluateStudioAlert({ ...alert, metric: "resultRows" }, datasets);
  assert.deepEqual([byEvents.observed, byEvents.triggered], [3, true]);
  assert.deepEqual([byRows.observed, byRows.triggered], [2, false]);
});
test("invalid dataset and unsupported SPL return a clear error", () => {
  assert.match(evaluateStudioQuery("index=missing", datasets).error, /Unknown index/);
  assert.equal(evaluateStudioAlert({ spl: "index=missing", operator: ">=", threshold: 1 }, datasets).ok, false);
});
test("threshold validation rejects decimals and negative values", () => {
  for (const threshold of [NaN, -1, 1.2, 1000001]) {
    assert.equal(evaluateStudioAlert({ spl: "index=training_web", operator: ">=", threshold }, datasets).ok, false);
  }
});
