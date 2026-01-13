import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const BASE = "https://api.massive.com/v1";
const KEY = import.meta.env.VITE_MASSIVE_API_KEY;

export default function QuoteHistory({ symbol }) {
  const [range, setRange] = useState("1Y");

  const { data, isLoading } = useQuery({
    queryKey: ["history", symbol, range],
    queryFn: async () => {
      const res = await axios.get(`${BASE}/stocks/ohlc`, {
        params: { symbol, range, interval: "1D" },
        headers: { Authorization: `Bearer ${KEY}` },
      });
      return res.data;
    },
  });

  if (isLoading) return <p className="text-gray-400">Loading history…</p>;

  return (
    <div className="bg-white/5 rounded-xl p-5">
      {/* Range selector */}
      <div className="flex gap-3 mb-4">
        {["1M", "3M", "1Y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`text-xs px-3 py-1 rounded ${
              range === r
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
