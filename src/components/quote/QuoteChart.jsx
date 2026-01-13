// components/quote/QuoteChart.jsx
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function QuoteChart({ candles }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={candles}>
          <XAxis dataKey="time" hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#22c55e"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
