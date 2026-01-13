import { massive } from "./massive";

/**
 * Always return array
 */
const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const normalizeQuote = (q) => {
  const price = Number(q.price ?? q.last ?? 0);
  const prev = Number(q.prevClose ?? q.previousClose ?? 0);
  const volume = Number(q.volume ?? 0);

  const changePercent =
    q.changePercent ??
    q.percentChange ??
    (prev > 0 ? ((price - prev) / prev) * 100 : 0);

  return {
    ...q,
    price,
    volume,
    changePercent,
  };
};

export async function getMarketOverview() {
  // 1️⃣ Fetch tickers
  const tickersRes = await massive.get("/reference/tickers", {
    params: { limit: 20 },
  });

  const tickers = safeArray(tickersRes.data);

  // 🔥 IMPORTANT: Massive uses `ticker`, not `symbol`
  const symbols = tickers
    .map((t) => t.ticker)
    .filter(Boolean)
    .join(",");

  if (!symbols) {
    return {
      gainers: [],
      losers: [],
      mostActiveList: [],
      topGainer: {},
      topLoser: {},
      mostActive: {},
    };
  }

  // 2️⃣ Fetch quotes
  const quotesRes = await massive.get("/quotes", {
    params: { symbols },
  });

  const rawQuotes = safeArray(quotesRes.data);
  const quotes = rawQuotes.map(normalizeQuote);

  // 3️⃣ Compute market views
  const gainers = [...quotes].sort(
    (a, b) => b.changePercent - a.changePercent
  );

  const losers = [...quotes].sort(
    (a, b) => a.changePercent - b.changePercent
  );

  const mostActive = [...quotes].sort(
    (a, b) => b.volume - a.volume
  );

  return {
    gainers,
    losers,
    mostActiveList: mostActive,
    topGainer: gainers[0] ?? {},
    topLoser: losers[0] ?? {},
    mostActive: mostActive[0] ?? {},
  };
}

// import { massive } from "./massive";

// /**
//  * Ensures we ALWAYS return an array
//  */
// const safeArray = (value) => {
//   if (Array.isArray(value)) return value;
//   if (Array.isArray(value?.data)) return value.data;
//   if (Array.isArray(value?.results)) return value.results;
//   return [];
// };

// const normalizeQuote = (q) => {
//   const price = Number(q.price ?? q.last ?? 0);
//   const prev = Number(q.prevClose ?? q.previousClose ?? 0);
//   const volume = Number(q.volume ?? 0);

//   const changePercent =
//     q.changePercent ??
//     q.percentChange ??
//     (prev > 0 ? ((price - prev) / prev) * 100 : 0);

//   return {
//     ...q,
//     price,
//     volume,
//     changePercent: Number(changePercent),
//   };
// };

// export async function getMarketOverview() {
//   // 1️⃣ Fetch tickers
//   const tickersRes = await massive.get("/reference/tickers", {
//     params: { limit: 50 },
//   });

//   const tickers = safeArray(tickersRes.data);

//   const symbols = tickers
//     .slice(0, 20)
//     .map((t) => t.symbol)
//     .filter(Boolean)
//     .join(",");

//   if (!symbols) {
//     return {
//       gainers: [],
//       losers: [],
//       mostActiveList: [],
//       topGainer: {},
//       topLoser: {},
//       mostActive: {},
//     };
//   }

//   // 2️⃣ Fetch quotes
//   const quotesRes = await massive.get("/quotes", {
//     params: { symbols },
//   });

//   const rawQuotes = safeArray(quotesRes.data);

//   const quotes = rawQuotes.map(normalizeQuote);

//   // 3️⃣ Compute market views
//   const gainers = [...quotes].sort(
//     (a, b) => b.changePercent - a.changePercent
//   );

//   const losers = [...quotes].sort(
//     (a, b) => a.changePercent - b.changePercent
//   );

//   const mostActive = [...quotes].sort(
//     (a, b) => b.volume - a.volume
//   );

//   return {
//     gainers,
//     losers,
//     mostActiveList: mostActive,
//     topGainer: gainers[0] ?? {},
//     topLoser: losers[0] ?? {},
//     mostActive: mostActive[0] ?? {},
//   };
// }

// // import { massive } from "./massive";

// // /**
// //  * Ensures we ALWAYS return an array
// //  */
// // const safeArray = (value) => {
// //   if (Array.isArray(value)) return value;
// //   if (Array.isArray(value?.data)) return value.data;
// //   if (Array.isArray(value?.results)) return value.results;
// //   return [];
// // };

// // export async function getMarketOverview() {
// //   const tickersRes = await massive.get("/reference/tickers", {
// //     params: { limit: 50 },
// //   });

// //   const symbols = tickersRes.data.results
// //     .slice(0, 20)
// //     .map(t => t.symbol)
// //     .join(",");

// //   const quotesRes = await massive.get("/quotes", {
// //     params: { symbols },
// //   });

// //   const quotes = quotesRes.data.results || [];

// //   const gainers = [...quotes].sort(
// //     (a, b) => b.changePercent - a.changePercent
// //   );

// //   const losers = [...quotes].sort(
// //     (a, b) => a.changePercent - b.changePercent
// //   );

// //   const mostActive = [...quotes].sort(
// //     (a, b) => b.volume - a.volume
// //   );

// //   return {
// //     gainers,
// //     losers,
// //     mostActiveList: mostActive,
// //     topGainer: gainers[0],
// //     topLoser: losers[0],
// //     mostActive: mostActive[0],
// //   };
// // }

// // // export async function getMarketOverview() {
// // //   const [gainersRes, losersRes, activeRes] = await Promise.all([
// // //     massive.get("/stocks/gainers"),
// // //     massive.get("/stocks/losers"),
// // //     massive.get("/stocks/most-active"),
// // //   ]);

// // //   const gainers = safeArray(gainersRes?.data);
// // //   const losers = safeArray(losersRes?.data);
// // //   const mostActiveList = safeArray(activeRes?.data);

// // //   return {
// // //     gainers,
// // //     losers,
// // //     mostActiveList,
// // //     topGainer: gainers[0] ?? {},
// // //     topLoser: losers[0] ?? {},
// // //     mostActive: mostActiveList[0] ?? {},
// // //   };
// // // }

// // // import { massive } from "./massive";

// // // // Example endpoints (adjust to Massive docs)
// // // export async function getMarketOverview() {
// // //   const [gainers, losers, active] = await Promise.all([
// // //     massive.get("/stocks/gainers"),
// // //     massive.get("/stocks/losers"),
// // //     massive.get("/stocks/most-active"),
// // //   ]);

// // //   return {
// // //     gainers: gainers.data.slice(0, 5),
// // //     losers: losers.data.slice(0, 5),
// // //     mostActiveList: active.data.slice(0, 8),
// // //     topGainer: gainers.data[0],
// // //     topLoser: losers.data[0],
// // //     mostActive: active.data[0],
// // //   };
// // // }
