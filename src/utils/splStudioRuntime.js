import { runSPL } from "./splEngine.js";

/** Unified evaluation used by Search, Dashboards, and Alerts. */
export function evaluateStudioQuery(spl, datasets) {
  return runSPL(String(spl || "").trim(), datasets);
}

export function numberForPanel(result) {
  const first = result?.results?.[0];
  if (first) {
    const numeric = Object.keys(first).find((key) => key !== "_time" && typeof first[key] === "number" && Number.isFinite(first[key]));
    if (numeric) return { label: numeric, value: first[numeric] };
  }
  return { label: "matched events", value: result?.count ?? 0 };
}

export function chartKeys(result) {
  const rows = result?.results || [];
  if (!rows.length) return null;
  const keys = Object.keys(rows[0]);
  const xKey = result?.mode === "timechart" && keys.includes("_time")
    ? "_time" : keys.find((k) => k !== "count" && k !== "percent") || keys[0];
  const yKey = keys.find((k) => k !== xKey && rows.some((r) => typeof r[k] === "number" && Number.isFinite(r[k])));
  return xKey && yKey ? { xKey, yKey } : null;
}

export function evaluateStudioAlert(alert, datasets) {
  const out = evaluateStudioQuery(alert?.spl, datasets);
  if (out.error) return { ok: false, error: out.error };
  const metric = alert?.metric === "resultRows" ? "resultRows" : "events";
  const observed = metric === "resultRows" ? out.totalRows : out.count;
  const threshold = Number(alert?.threshold);
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 1000000) {
    return { ok: false, error: "Threshold must be a whole number from 0 to 1,000,000." };
  }
  const operators = {
    ">=": (a, b) => a >= b,
    ">": (a, b) => a > b,
    "==": (a, b) => a === b,
    "<=": (a, b) => a <= b,
    "<": (a, b) => a < b,
  };
  if (!operators[alert.operator]) return { ok: false, error: "Choose a supported comparison operator." };
  return { ok: true, triggered: operators[alert.operator](observed, threshold), observed, metric, matchedEvents: out.count, resultRows: out.totalRows };
}
