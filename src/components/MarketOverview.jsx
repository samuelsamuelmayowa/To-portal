import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { getMarketOverview } from "../lib/marketApi";

export default function MarketOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["market-overview"],
    queryFn: getMarketOverview,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <p className="p-6">Loading market data…</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load market</p>;

  return (
    <div className="p-6 space-y-8">
      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Top Gainer"
          symbol={data.topGainer.symbol}
          value={`+${data.topGainer.changePercent}%`}
          icon={TrendingUp}
          gradient="from-green-500/20 to-green-700/20"
          iconColor="text-green-400"
        />

        <SummaryCard
          title="Top Loser"
          symbol={data.topLoser.symbol}
          value={`${data.topLoser.changePercent}%`}
          icon={TrendingDown}
          gradient="from-red-500/20 to-red-700/20"
          iconColor="text-red-400"
        />

        <SummaryCard
          title="Most Active"
          symbol={data.mostActive.symbol}
          value={`${data.mostActive.volume.toLocaleString()} vol`}
          icon={Activity}
          gradient="from-blue-500/20 to-blue-700/20"
          iconColor="text-blue-400"
        />
      </div>

      {/* ===== TABLES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MarketTable title="🚀 Top Gainers" data={data.gainers} positive />
        <MarketTable title="📉 Top Losers" data={data.losers} />
      </div>

      <MarketTable title="🔥 Most Active Stocks" data={data.mostActiveList} />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ title, symbol, value, icon: Icon, gradient, iconColor }) {
  return (
    <div
      className={`rounded-xl p-5 bg-gradient-to-br ${gradient} 
      backdrop-blur border border-white/10 
      hover:scale-[1.03] transition-transform duration-300`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon className={`${iconColor}`} size={22} />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{symbol}</p>
        <p className="text-sm text-gray-300">{value}</p>
      </div>
    </div>
  );
}

function MarketTable({ title, data, positive }) {
  return (
    <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10">
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <div className="divide-y divide-white/10">
        {data.map((stock) => {
          const isUp = stock.changePercent >= 0;

          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition"
            >
              <div>
                <p className="font-medium text-white">{stock.symbol}</p>
                <p className="text-xs text-gray-400">
                  ${stock.price}
                </p>
              </div>

              <span
                className={`text-sm font-semibold ${
                  isUp ? "text-green-400" : "text-red-400"
                }`}
              >
                {isUp ? "+" : ""}
                {stock.changePercent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
