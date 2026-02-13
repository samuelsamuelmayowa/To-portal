function toFiniteNumber(v) {
  if (v == null) return null;

  // if it’s a string like "1.23%" or " 1,234.5 "
  const cleaned =
    typeof v === "string" ? v.replace(/[%,$,\s]/g, "") : v;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatPercent(v, { alwaysSign = false } = {}) {
  const n = toFiniteNumber(v);
  if (n == null) return "—";

  const sign = n > 0 ? "+" : "";
  return `${alwaysSign ? sign : sign}${n.toFixed(2)}%`;
}
