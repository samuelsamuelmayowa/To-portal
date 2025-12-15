import { massive } from "./massive";

// Example endpoints (adjust to Massive docs)
export async function getMarketOverview() {
  const [gainers, losers, active] = await Promise.all([
    massive.get("/stocks/gainers"),
    massive.get("/stocks/losers"),
    massive.get("/stocks/most-active"),
  ]);

  return {
    gainers: gainers.data.slice(0, 5),
    losers: losers.data.slice(0, 5),
    mostActiveList: active.data.slice(0, 8),
    topGainer: gainers.data[0],
    topLoser: losers.data[0],
    mostActive: active.data[0],
  };
}
