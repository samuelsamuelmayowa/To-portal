function toFiniteNumber(v) {
  if (v == null || v === "") return null;

  const cleaned =
    typeof v === "string" ? v.replace(/[%,$,\s]/g, "") : v;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export { toFiniteNumber };

export function formatPercent(v, { alwaysSign = false, decimals = 2 } = {}) {
  const n = toFiniteNumber(v);
  if (n == null) return "—";

  const sign = alwaysSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(decimals)}%`;
}

export function formatMoney(
  v,
  { currency = "USD", compact = false, decimals = 2 } = {}
) {
  const n = toFiniteNumber(v);
  if (n == null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : decimals,
  }).format(n);
}

export function formatSignedMoney(v, options = {}) {
  const n = toFiniteNumber(v);
  if (n == null) return "—";

  const formatted = formatMoney(Math.abs(n), options);
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `-${formatted}`;
  return formatted;
}

export function formatCompact(v, { decimals = 1 } = {}) {
  const n = toFiniteNumber(v);
  if (n == null) return "—";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatNumber(v) {
  const n = toFiniteNumber(v);
  if (n == null) return "—";

  return n.toLocaleString();
}

// function toFiniteNumber(v) {
//   if (v == null) return null;

//   // if it’s a string like "1.23%" or " 1,234.5 "
//   const cleaned =
//     typeof v === "string" ? v.replace(/[%,$,\s]/g, "") : v;

//   const n = Number(cleaned);
//   return Number.isFinite(n) ? n : null;
// }

// export function formatPercent(v, { alwaysSign = false } = {}) {
//   const n = toFiniteNumber(v);
//   if (n == null) return "—";

//   const sign = n > 0 ? "+" : "";
//   return `${alwaysSign ? sign : sign}${n.toFixed(2)}%`;
// }
