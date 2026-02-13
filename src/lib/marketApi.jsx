import { massive } from "./massive";

const safeArray = (v) =>
  Array.isArray(v) ? v : Array.isArray(v?.results) ? v.results : [];

// Fallback sample data for development/testing
const FALLBACK_DATA = [
  { ticker: "AAPL", day: { c: 185.50, v: 52000000 }, prevDay: { c: 183.20 } },
  { ticker: "MSFT", day: { c: 370.20, v: 25000000 }, prevDay: { c: 368.50 } },
  { ticker: "GOOGL", day: { c: 139.80, v: 22000000 }, prevDay: { c: 138.90 } },
  { ticker: "AMZN", day: { c: 170.50, v: 35000000 }, prevDay: { c: 171.20 } },
  { ticker: "NVDA", day: { c: 875.50, v: 45000000 }, prevDay: { c: 870.30 } },
  { ticker: "META", day: { c: 475.20, v: 18000000 }, prevDay: { c: 473.80 } },
  { ticker: "TSLA", day: { c: 245.80, v: 95000000 }, prevDay: { c: 242.50 } },
  { ticker: "NFLX", day: { c: 385.50, v: 8000000 }, prevDay: { c: 384.20 } },
];

export async function getMarketOverview() {
  try {
    console.log("Fetching market data...");
    
    const snapRes = await massive.get(
      "/v2/snapshot/locale/us/markets/stocks/tickers"
    );

    const tickers = safeArray(snapRes.data?.tickers);
    console.log("Tickers received:", tickers.length);

    if (!tickers || tickers.length === 0) {
      console.warn("No tickers from API, using fallback data");
      return processTickers(FALLBACK_DATA);
    }

    // Process more tickers to ensure we have enough for each tab
    return processTickers(tickers.slice(0, 500));
  } catch (error) {
    console.error("API Error, using fallback data:", error.message);
    return processTickers(FALLBACK_DATA);
  }
}

function processTickers(tickers) {
  const quotes = tickers
    .map((t) => {
      // ✅ PRICE: Prefer day.c, fall back to prevDay.c
      let price = Number(t.day?.c ?? 0);
      if (price === 0) {
        price = Number(t.prevDay?.c ?? 0); // Use previous close if today has no data
      }

      // ✅ VOLUME: Prefer day.v, fall back to prevDay.v
      let volume = Number(t.day?.v ?? 0);
      if (volume === 0) {
        volume = Number(t.prevDay?.v ?? 0);
      }

      // ✅ CHANGE: Use todaysChangePerc from API
      const changePercent = Number(t.todaysChangePerc ?? 0);

      return {
        symbol: String(t.ticker || "").toUpperCase(),
        price,
        volume,
        changePercent,
      };
    })
    // 🚨 Filter: keep only valid quotes (has symbol AND price > 0 AND volume > 0)
    .filter((q) => q.symbol && q.price > 0 && q.volume > 0)
    // Remove duplicates by symbol
    .filter((q, idx, arr) => arr.findIndex(a => a.symbol === q.symbol) === idx);

  console.log("✅ Processed quotes:", quotes.length, "from", tickers.length, "tickers");

  // Sort for each tab
  const gainers = [...quotes]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 100); // Top 100 gainers

  const losers = [...quotes]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 100); // Top 100 losers

  const mostActive = [...quotes]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 100); // Top 100 most active

  console.log("📊 Gainers:", gainers.length, "| Losers:", losers.length, "| Active:", mostActive.length);

  return {
    gainers,
    losers,
    mostActiveList: mostActive,
    topGainer: gainers[0] || null,
    topLoser: losers[0] || null,
    mostActive: mostActive[0] || null,
  };
}

// import { massive } from "./massive";

// const safeArray = (v) =>
//   Array.isArray(v) ? v : Array.isArray(v?.results) ? v.results : [];

// export async function getMarketOverview() {
//   // 1️⃣ Market snapshot (ALL stocks)
//   const snapRes = await massive.get(
//     "/v2/snapshot/locale/us/markets/stocks/tickers"
//   );

//   const tickers = safeArray(snapRes.data?.tickers);

//   // limit for performance
//   const quotes = tickers.slice(0, 50).map((t) => {
//     const price = Number(t.lastTrade?.p ?? 0);
//     const prev = Number(t.prevDay?.c ?? 0);
//     const volume = Number(t.day?.v ?? 0);

//     const changePercent =
//       prev > 0 ? ((price - prev) / prev) * 100 : 0;

//     return {
//       symbol: t.ticker,
//       price,
//       volume,
//       changePercent,
//     };
//   });

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
//     topGainer: gainers[0],
//     topLoser: losers[0],
//     mostActive: mostActive[0],
//   };
// }


// import { massive } from "./massive";

// /**
//  * Always return array
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
//     changePercent,
//   };
// };

// export async function getMarketOverview() {
//   // 1️⃣ Fetch tickers
//   const tickersRes = await massive.get("/reference/tickers", {
//     params: { limit: 20 },
//   });

//   const tickers = safeArray(tickersRes.data);

//   // 🔥 IMPORTANT: Massive uses `ticker`, not `symbol`
//   const symbols = tickers
//     .map((t) => t.ticker)
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
//   const quotesRes = await massive.get("/snapshot/quotes", {
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

// // const normalizeQuote = (q) => {
// //   const price = Number(q.price ?? q.last ?? 0);
// //   const prev = Number(q.prevClose ?? q.previousClose ?? 0);
// //   const volume = Number(q.volume ?? 0);

// //   const changePercent =
// //     q.changePercent ??
// //     q.percentChange ??
// //     (prev > 0 ? ((price - prev) / prev) * 100 : 0);

// //   return {
// //     ...q,
// //     price,
// //     volume,
// //     changePercent: Number(changePercent),
// //   };
// // };

// // export async function getMarketOverview() {
// //   // 1️⃣ Fetch tickers
// //   const tickersRes = await massive.get("/reference/tickers", {
// //     params: { limit: 50 },
// //   });

// //   const tickers = safeArray(tickersRes.data);

// //   const symbols = tickers
// //     .slice(0, 20)
// //     .map((t) => t.symbol)
// //     .filter(Boolean)
// //     .join(",");

// //   if (!symbols) {
// //     return {
// //       gainers: [],
// //       losers: [],
// //       mostActiveList: [],
// //       topGainer: {},
// //       topLoser: {},
// //       mostActive: {},
// //     };
// //   }

// //   // 2️⃣ Fetch quotes
// //   const quotesRes = await massive.get("/quotes", {
// //     params: { symbols },
// //   });

// //   const rawQuotes = safeArray(quotesRes.data);

// //   const quotes = rawQuotes.map(normalizeQuote);

// //   // 3️⃣ Compute market views
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
// //     topGainer: gainers[0] ?? {},
// //     topLoser: losers[0] ?? {},
// //     mostActive: mostActive[0] ?? {},
// //   };
// // }

// // // import { massive } from "./massive";

// // // /**
// // //  * Ensures we ALWAYS return an array
// // //  */
// // // const safeArray = (value) => {
// // //   if (Array.isArray(value)) return value;
// // //   if (Array.isArray(value?.data)) return value.data;
// // //   if (Array.isArray(value?.results)) return value.results;
// // //   return [];
// // // };

// // // export async function getMarketOverview() {
// // //   const tickersRes = await massive.get("/reference/tickers", {
// // //     params: { limit: 50 },
// // //   });

// // //   const symbols = tickersRes.data.results
// // //     .slice(0, 20)
// // //     .map(t => t.symbol)
// // //     .join(",");

// // //   const quotesRes = await massive.get("/quotes", {
// // //     params: { symbols },
// // //   });

// // //   const quotes = quotesRes.data.results || [];

// // //   const gainers = [...quotes].sort(
// // //     (a, b) => b.changePercent - a.changePercent
// // //   );

// // //   const losers = [...quotes].sort(
// // //     (a, b) => a.changePercent - b.changePercent
// // //   );

// // //   const mostActive = [...quotes].sort(
// // //     (a, b) => b.volume - a.volume
// // //   );

// // //   return {
// // //     gainers,
// // //     losers,
// // //     mostActiveList: mostActive,
// // //     topGainer: gainers[0],
// // //     topLoser: losers[0],
// // //     mostActive: mostActive[0],
// // //   };
// // // }

// // // // export async function getMarketOverview() {
// // // //   const [gainersRes, losersRes, activeRes] = await Promise.all([
// // // //     massive.get("/stocks/gainers"),
// // // //     massive.get("/stocks/losers"),
// // // //     massive.get("/stocks/most-active"),
// // // //   ]);

// // // //   const gainers = safeArray(gainersRes?.data);
// // // //   const losers = safeArray(losersRes?.data);
// // // //   const mostActiveList = safeArray(activeRes?.data);

// // // //   return {
// // // //     gainers,
// // // //     losers,
// // // //     mostActiveList,
// // // //     topGainer: gainers[0] ?? {},
// // // //     topLoser: losers[0] ?? {},
// // // //     mostActive: mostActiveList[0] ?? {},
// // // //   };
// // // // }

// // // // import { massive } from "./massive";

// // // // // Example endpoints (adjust to Massive docs)
// // // // export async function getMarketOverview() {
// // // //   const [gainers, losers, active] = await Promise.all([
// // // //     massive.get("/stocks/gainers"),
// // // //     massive.get("/stocks/losers"),
// // // //     massive.get("/stocks/most-active"),
// // // //   ]);

// // // //   return {
// // // //     gainers: gainers.data.slice(0, 5),
// // // //     losers: losers.data.slice(0, 5),
// // // //     mostActiveList: active.data.slice(0, 8),
// // // //     topGainer: gainers.data[0],
// // // //     topLoser: losers.data[0],
// // // //     mostActive: active.data[0],
// // // //   };
// // // // }
