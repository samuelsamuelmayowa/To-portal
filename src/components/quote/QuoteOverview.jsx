import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE = "https://api.massive.com/v1";
const KEY = import.meta.env.VITE_MASSIVE_API_KEY;

export default function QuoteOverview({ symbol }) {
  const { data, isLoading } = useQuery({
    queryKey: ["overview", symbol],
    queryFn: async () => {
      const res = await axios.get(`${BASE}/stocks/profile`, {
        params: { symbol },
        headers: { Authorization: `Bearer ${KEY}` },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return <p className="text-gray-400">Loading overview…</p>;

  const items = [
    ["Sector", data.sector],
    ["Industry", data.industry],
    ["Market Cap", `$${Number(data.marketCap).toLocaleString()}`],
    ["52W High", `$${data.week52High}`],
    ["52W Low", `$${data.week52Low}`],
    ["Avg Volume", Number(data.avgVolume).toLocaleString()],
  ];

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-white/5 p-5 rounded-xl">
        <h3 className="font-semibold mb-2 text-white">Company Overview</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          {data.description || "No description available."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="bg-white/5 rounded-lg p-4"
          >
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-white">{value ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
