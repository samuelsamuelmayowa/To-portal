import { massive } from "./massive";

/**
 * Ensures we ALWAYS return an array
 */
const safeArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

export async function getMarketOverview() {
  const [gainersRes, losersRes, activeRes] = await Promise.all([
    massive.get("/stocks/gainers"),
    massive.get("/stocks/losers"),
    massive.get("/stocks/most-active"),
  ]);

  const gainers = safeArray(gainersRes?.data);
  const losers = safeArray(losersRes?.data);
  const mostActiveList = safeArray(activeRes?.data);

  return {
    gainers,
    losers,
    mostActiveList,
    topGainer: gainers[0] ?? {},
    topLoser: losers[0] ?? {},
    mostActive: mostActiveList[0] ?? {},
  };
}

// import { massive } from "./massive";

// // Example endpoints (adjust to Massive docs)
// export async function getMarketOverview() {
//   const [gainers, losers, active] = await Promise.all([
//     massive.get("/stocks/gainers"),
//     massive.get("/stocks/losers"),
//     massive.get("/stocks/most-active"),
//   ]);

//   return {
//     gainers: gainers.data.slice(0, 5),
//     losers: losers.data.slice(0, 5),
//     mostActiveList: active.data.slice(0, 8),
//     topGainer: gainers.data[0],
//     topLoser: losers.data[0],
//     mostActive: active.data[0],
//   };
// }
