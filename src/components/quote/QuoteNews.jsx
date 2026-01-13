import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE = "https://api.massive.com/v1";
const KEY = import.meta.env.VITE_MASSIVE_API_KEY;

export default function QuoteNews({ symbol }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["quote-news", symbol],
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const res = await axios.get(`${BASE}/stocks/news`, {
        params: { symbol, limit: 10 },
        headers: {
          Authorization: `Bearer ${KEY}`,
        },
      });
      return res.data;
    },
  });

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading news…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Failed to load news
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No recent news for {symbol}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <a
          key={item.id || item.url}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl bg-white/5 p-4 hover:bg-white/10 transition"
        >
          <h3 className="font-semibold text-white text-sm">
            {item.headline}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>{item.source}</span>
            <span>•</span>
            <span>
              {new Date(item.publishedAt).toLocaleDateString()}
            </span>
          </div>

          {item.summary && (
            <p className="text-xs text-gray-300 mt-2 line-clamp-3">
              {item.summary}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
[]