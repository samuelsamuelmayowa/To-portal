export const CHART_TYPES = [
  { id: "bar", label: "Bar", desc: "Compare categories" },
  { id: "line", label: "Line", desc: "Show trends over time" },
  { id: "pie", label: "Pie", desc: "Show proportions" },
  { id: "number", label: "Single Value", desc: "Show total count" },
];

export default function recommendChart(res) {
  if (!res) return "bar";
  if (res.mode === "timechart") return "line";
  if (res.mode === "table" && res.results?.length <= 6) return "pie";
  if (res.count !== undefined && res.results?.length <= 1) return "number";
  return "bar";
}

// export const CHART_TYPES = [
//   { id: "bar", label: "Bar", desc: "Compare categories" },
//   { id: "line", label: "Line", desc: "Show trends over time" },
//   { id: "pie", label: "Pie", desc: "Show proportions" },
//   { id: "number", label: "Single Value", desc: "Show total count" },
// ];

// export function recommendChart(res) {
//   if (!res) return "bar";

//   if (res.mode === "timechart") return "line";

//   if (res.mode === "table" && res.results?.length <= 6) return "pie";

//   if (res.count !== undefined && res.results?.length <= 1) return "number";

//   return "bar";
// }
