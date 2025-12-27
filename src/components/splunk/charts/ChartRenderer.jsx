import {
  BarChart,
  LineChart,
  PieChart,
  SingleValue,
} from "./Charts";

export default function ChartRenderer({
  type,
  rows,
  xKey,
  yKey,
  res,
}) {
  if (type === "number") {
    return (
      <SingleValue
        value={res?.count ?? rows?.[0]?.[yKey] ?? 0}
        label="Total events"
      />
    );
  }

  if (!rows?.length) return null;

  if (type === "line")
    return <LineChart rows={rows} xKey={xKey} yKey={yKey} />;

  if (type === "pie")
    return <PieChart rows={rows} xKey={xKey} yKey={yKey} />;

  // default = bar
  return <BarChart rows={rows} xKey={xKey} yKey={yKey} />;
}

// // import { BarChart } from "./BarChart";
// import { LineChart } from "../LineChart";
// import { PieChart } from "../PieChart";
// // import { SingleValue } from "./SingleValue";
// import { SingleValue } from "../SingleChart";
// import { BarChart } from "../BarChart";
// export default function ChartRenderer({ type, rows, xKey, yKey, res }) {
//   if (type === "number") {
//     return (
//       <SingleValue
//         value={res.count ?? rows?.[0]?.[yKey] ?? 0}
//         label="Total events"
//       />
//     );
//   }

//   if (!rows?.length) return null;

//   if (type === "line") return <LineChart rows={rows} xKey={xKey} yKey={yKey} />;
//   if (type === "pie") return <PieChart rows={rows} xKey={xKey} yKey={yKey} />;

//   return <BarChart rows={rows} xKey={xKey} yKey={yKey} />;
// }
