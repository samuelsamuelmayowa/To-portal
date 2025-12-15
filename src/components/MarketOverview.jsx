import React from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
// import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
// import { Badge } from "lucide-react";
// import Badge
// import { getMarketOverview } from "@/lib/marketApi";
import { getMarketOverview } from "../lib/marketApi";

export default function MarketOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["market-overview"],
    queryFn: getMarketOverview,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  if (isLoading) return <p className="p-6">Loading market data…</p>;
  if (error) return <p className="p-6 text-red-500">Failed to load market</p>;

  return (
    <div className="p-6 space-y-6">
      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Summary
          title="Top Gainer"
          symbol={data.topGainer.symbol}
          value={`+${data.topGainer.changePercent}%`}
          icon={<TrendingUp className="text-green-500" />}
        />

        <Summary
          title="Top Loser"
          symbol={data.topLoser.symbol}
          value={`${data.topLoser.changePercent}%`}
          icon={<TrendingDown className="text-red-500" />}
        />

        <Summary
          title="Most Active"
          symbol={data.mostActive.symbol}
          value={`${data.mostActive.volume.toLocaleString()} vol`}
          icon={<Activity className="text-blue-500" />}
        />
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MarketTable title="Top Gainers" data={data.gainers} positive />
        <MarketTable title="Top Losers" data={data.losers} />
      </div>

      <MarketTable title="Most Active Stocks" data={data.mostActiveList} />
    </div>
  );
}

/* ---------- Components ---------- */

function Summary({ title, symbol, value, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{symbol}</p>
        <p className="text-sm">{value}</p>
      </CardContent>
    </Card>
  );
}

function MarketTable({ title, data, positive }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((stock) => (
          <div
            key={stock.symbol}
            className="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p className="font-medium">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground">
                ${stock.price}
              </p>
            </div>

            <Badge variant={positive ? "success" : "destructive"}>
              {stock.changePercent}%
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
