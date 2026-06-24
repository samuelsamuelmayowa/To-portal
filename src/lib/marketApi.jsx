import { massive } from "./massive";

const safeArray = (v) =>
  Array.isArray(v) ? v : Array.isArray(v?.results) ? v.results : [];

export async function getMarketOverview() {
  console.log("Fetching real Polygon/Massive market data...");

  const snapRes = await massive.get(
    "/v2/snapshot/locale/us/markets/stocks/tickers"
  );

  const tickers = safeArray(snapRes.data?.tickers);

  console.log("Polygon tickers received:", tickers.length);

  if (!tickers.length) {
    throw new Error("Polygon API returned no tickers");
  }

  return processTickers(tickers.slice(0, 1200));
}

function processTickers(tickers) {
  const quotes = tickers
    .map((t) => {
      const symbol = String(t.ticker || "").toUpperCase();

      const price = Number(t.day?.c ?? t.prevDay?.c ?? 0);
      const previousClose = Number(t.prevDay?.c ?? 0);

      const volume = Number(t.day?.v ?? t.prevDay?.v ?? 0);

      let changePercent = Number(t.todaysChangePerc ?? 0);
      let dollarChange = Number(t.todaysChange ?? 0);

      // Backup calculation if API does not send todaysChange
      if (!dollarChange && price > 0 && previousClose > 0) {
        dollarChange = price - previousClose;
      }

      // Backup calculation if API does not send todaysChangePerc
      if (!changePercent && price > 0 && previousClose > 0) {
        changePercent = ((price - previousClose) / previousClose) * 100;
      }

      const dollarVolume = price * volume;

      return {
        symbol,
        price,
        previousClose,
        volume,
        dollarChange,
        dollarVolume,
        changePercent,
      };
    })
    .filter((q) => q.symbol && q.price > 0 && q.volume > 0)
    .filter((q, idx, arr) => arr.findIndex((a) => a.symbol === q.symbol) === idx);

  const gainers = [...quotes]
    .filter((q) => q.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 100);

  const losers = [...quotes]
    .filter((q) => q.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 100);

  const mostActive = [...quotes]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 100);

  return {
    gainers,
    losers,
    mostActiveList: mostActive,
    topGainer: gainers[0] || null,
    topLoser: losers[0] || null,
    mostActive: mostActive[0] || null,
    isDemoData: false,
  };
}

// import { massive } from "./massive";
// import { toFiniteNumber } from "./formatters";

// const SNAPSHOT_ENDPOINT = "/v2/snapshot/locale/us/markets/stocks/tickers";
// const MAX_TICKERS_TO_PROCESS = 1200;
// const LIST_LIMIT = 100;

// const FALLBACK_DATA = [
//   { ticker: "AAPL", day: { c: 185.5, v: 52000000 }, prevDay: { c: 183.2, v: 49000000 } },
//   { ticker: "MSFT", day: { c: 370.2, v: 25000000 }, prevDay: { c: 368.5, v: 23000000 } },
//   { ticker: "GOOGL", day: { c: 139.8, v: 22000000 }, prevDay: { c: 138.9, v: 21000000 } },
//   { ticker: "AMZN", day: { c: 170.5, v: 35000000 }, prevDay: { c: 171.2, v: 34000000 } },
//   { ticker: "NVDA", day: { c: 875.5, v: 45000000 }, prevDay: { c: 870.3, v: 42000000 } },
//   { ticker: "META", day: { c: 475.2, v: 18000000 }, prevDay: { c: 473.8, v: 17000000 } },
//   { ticker: "TSLA", day: { c: 245.8, v: 95000000 }, prevDay: { c: 242.5, v: 91000000 } },
//   { ticker: "NFLX", day: { c: 385.5, v: 8000000 }, prevDay: { c: 384.2, v: 7500000 } },
// ];

// const safeArray = (v) => {
//   if (Array.isArray(v)) return v;
//   if (Array.isArray(v?.results)) return v.results;
//   if (Array.isArray(v?.tickers)) return v.tickers;
//   return [];
// };

// const firstNumber = (...values) => {
//   for (const value of values) {
//     const n = toFiniteNumber(value);
//     if (n != null) return n;
//   }
//   return null;
// };

// export async function getMarketOverview() {
//   try {
//     console.log("Fetching market data...");

//     const snapRes = await massive.get(SNAPSHOT_ENDPOINT);

//     const tickers = safeArray(snapRes.data?.tickers ?? snapRes.data);
//     console.log("Tickers received:", tickers.length);

//     if (!tickers.length) {
//       console.warn("No API tickers found. Using fallback data.");
//       return processTickers(FALLBACK_DATA);
//     }

//     return processTickers(tickers.slice(0, MAX_TICKERS_TO_PROCESS));
//   } catch (error) {
//     console.error("Market API error. Using fallback data:", error?.message);
//     return processTickers(FALLBACK_DATA);
//   }
// }

// function processTickers(tickers) {
//   const unique = new Map();

//   for (const rawTicker of tickers) {
//     const quote = normalizeTicker(rawTicker);
//     if (!quote) continue;

//     const existing = unique.get(quote.symbol);

//     // Keep the better quote if duplicate symbol exists.
//     if (!existing || quote.volume > existing.volume) {
//       unique.set(quote.symbol, quote);
//     }
//   }

//   const quotes = Array.from(unique.values());

//   const gainers = rankList(
//     quotes
//       .filter((q) => q.changePercent > 0)
//       .sort((a, b) => b.changePercent - a.changePercent)
//       .slice(0, LIST_LIMIT)
//   );

//   const losers = rankList(
//     quotes
//       .filter((q) => q.changePercent < 0)
//       .sort((a, b) => a.changePercent - b.changePercent)
//       .slice(0, LIST_LIMIT)
//   );

//   const mostActiveList = rankList(
//     [...quotes]
//       .sort((a, b) => b.volume - a.volume)
//       .slice(0, LIST_LIMIT)
//   );

//   const strongestMomentum = rankList(
//     [...quotes]
//       .sort((a, b) => b.momentumScore - a.momentumScore)
//       .slice(0, LIST_LIMIT)
//   );

//   const stats = buildMarketStats(quotes);

//   console.log("Processed quotes:", quotes.length);
//   console.log(
//     "Gainers:",
//     gainers.length,
//     "| Losers:",
//     losers.length,
//     "| Active:",
//     mostActiveList.length
//   );

//   return {
//     quotes,
//     gainers,
//     losers,
//     mostActiveList,
//     strongestMomentum,

//     topGainer: gainers[0] || null,
//     topLoser: losers[0] || null,
//     mostActive: mostActiveList[0] || null,
//     strongestStock: strongestMomentum[0] || null,

//     stats,
//   };
// }

// function normalizeTicker(t) {
//   const symbol = String(t.ticker || t.T || t.symbol || "")
//     .toUpperCase()
//     .trim();

//   if (!symbol) return null;

//   const price = firstNumber(
//     t.day?.c,
//     t.lastTrade?.p,
//     t.min?.c,
//     t.close,
//     t.prevDay?.c
//   );

//   const previousClose = firstNumber(
//     t.prevDay?.c,
//     t.previousClose,
//     t.day?.o
//   );

//   const open = firstNumber(t.day?.o, t.open);
//   const high = firstNumber(t.day?.h, t.high);
//   const low = firstNumber(t.day?.l, t.low);

//   const volume = firstNumber(
//     t.day?.v,
//     t.volume,
//     t.min?.av,
//     t.prevDay?.v
//   );

//   if (!price || price <= 0) return null;
//   if (!volume || volume <= 0) return null;

//   let changePercent = firstNumber(t.todaysChangePerc, t.changePercent);
//   let dollarChange = firstNumber(t.todaysChange, t.change);

//   // Calculate dollar change when API does not provide it.
//   if (dollarChange == null && previousClose && previousClose > 0) {
//     dollarChange = price - previousClose;
//   }

//   // Calculate percent change when API does not provide it.
//   // This also fixes your fallback data.
//   if (
//     (changePercent == null || changePercent === 0) &&
//     previousClose &&
//     previousClose > 0 &&
//     price !== previousClose
//   ) {
//     changePercent = ((price - previousClose) / previousClose) * 100;
//   }

//   if (changePercent == null) changePercent = 0;
//   if (dollarChange == null) dollarChange = 0;

//   const dollarVolume = price * volume;

//   const rangePercent =
//     high && low && low > 0 ? ((high - low) / low) * 100 : null;

//   const volumePower = Math.log10(Math.max(volume, 10));
//   const momentumScore = changePercent * volumePower;

//   const direction =
//     changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";

//   return {
//     symbol,
//     price,
//     previousClose,
//     open,
//     high,
//     low,
//     volume,
//     dollarVolume,
//     dollarChange,
//     changePercent,
//     rangePercent,
//     momentumScore,
//     direction,
//   };
// }

// function buildMarketStats(quotes) {
//   const total = quotes.length;

//   if (!total) {
//     return {
//       total: 0,
//       advancers: 0,
//       decliners: 0,
//       unchanged: 0,
//       breadthPercent: 0,
//       averageChange: 0,
//       medianChange: 0,
//       totalVolume: 0,
//       totalDollarVolume: 0,
//       positiveVolume: 0,
//       negativeVolume: 0,
//       volumeBreadthPercent: 0,
//     };
//   }

//   const advancers = quotes.filter((q) => q.changePercent > 0).length;
//   const decliners = quotes.filter((q) => q.changePercent < 0).length;
//   const unchanged = total - advancers - decliners;

//   const changes = quotes.map((q) => q.changePercent);
//   const totalChange = changes.reduce((sum, n) => sum + n, 0);

//   const totalVolume = quotes.reduce((sum, q) => sum + q.volume, 0);
//   const totalDollarVolume = quotes.reduce((sum, q) => sum + q.dollarVolume, 0);

//   const positiveVolume = quotes
//     .filter((q) => q.changePercent > 0)
//     .reduce((sum, q) => sum + q.volume, 0);

//   const negativeVolume = quotes
//     .filter((q) => q.changePercent < 0)
//     .reduce((sum, q) => sum + q.volume, 0);

//   const activeDirectionalVolume = positiveVolume + negativeVolume;

//   return {
//     total,
//     advancers,
//     decliners,
//     unchanged,

//     breadthPercent:
//       advancers + decliners > 0
//         ? (advancers / (advancers + decliners)) * 100
//         : 0,

//     averageChange: totalChange / total,
//     medianChange: median(changes),

//     totalVolume,
//     totalDollarVolume,

//     positiveVolume,
//     negativeVolume,

//     volumeBreadthPercent:
//       activeDirectionalVolume > 0
//         ? (positiveVolume / activeDirectionalVolume) * 100
//         : 0,

//     upDownRatio: decliners > 0 ? advancers / decliners : advancers,
//   };
// }

// function rankList(list) {
//   return list.map((item, index) => ({
//     ...item,
//     rank: index + 1,
//   }));
// }

// function median(values) {
//   if (!values.length) return 0;

//   const sorted = [...values].sort((a, b) => a - b);
//   const mid = Math.floor(sorted.length / 2);

//   if (sorted.length % 2) return sorted[mid];

//   return (sorted[mid - 1] + sorted[mid]) / 2;
// }
// // import { massive } from "./massive";

// // const safeArray = (v) =>
// //   Array.isArray(v) ? v : Array.isArray(v?.results) ? v.results : [];

// // // Fallback sample data for development/testing
// // const FALLBACK_DATA = [
// //   { ticker: "AAPL", day: { c: 185.50, v: 52000000 }, prevDay: { c: 183.20 } },
// //   { ticker: "MSFT", day: { c: 370.20, v: 25000000 }, prevDay: { c: 368.50 } },
// //   { ticker: "GOOGL", day: { c: 139.80, v: 22000000 }, prevDay: { c: 138.90 } },
// //   { ticker: "AMZN", day: { c: 170.50, v: 35000000 }, prevDay: { c: 171.20 } },
// //   { ticker: "NVDA", day: { c: 875.50, v: 45000000 }, prevDay: { c: 870.30 } },
// //   { ticker: "META", day: { c: 475.20, v: 18000000 }, prevDay: { c: 473.80 } },
// //   { ticker: "TSLA", day: { c: 245.80, v: 95000000 }, prevDay: { c: 242.50 } },
// //   { ticker: "NFLX", day: { c: 385.50, v: 8000000 }, prevDay: { c: 384.20 } },
// // ];

// // export async function getMarketOverview() {
// //   try {
// //     console.log("Fetching market data...");
    
// //     const snapRes = await massive.get(
// //       "/v2/snapshot/locale/us/markets/stocks/tickers"
// //     );

// //     const tickers = safeArray(snapRes.data?.tickers);
// //     console.log("Tickers received:", tickers.length);

// //     if (!tickers || tickers.length === 0) {
// //       console.warn("No tickers from API, using fallback data");
// //       return processTickers(FALLBACK_DATA);
// //     }

// //     // Process more tickers to ensure we have enough for each tab
// //     return processTickers(tickers.slice(0, 500));
// //   } catch (error) {
// //     console.error("API Error, using fallback data:", error.message);
// //     return processTickers(FALLBACK_DATA);
// //   }
// // }

// // function processTickers(tickers) {
// //   const quotes = tickers
// //     .map((t) => {
// //       // ✅ PRICE: Prefer day.c, fall back to prevDay.c
// //       let price = Number(t.day?.c ?? 0);
// //       if (price === 0) {
// //         price = Number(t.prevDay?.c ?? 0); // Use previous close if today has no data
// //       }

// //       // ✅ VOLUME: Prefer day.v, fall back to prevDay.v
// //       let volume = Number(t.day?.v ?? 0);
// //       if (volume === 0) {
// //         volume = Number(t.prevDay?.v ?? 0);
// //       }

// //       // ✅ CHANGE: Use todaysChangePerc from API
// //       const changePercent = Number(t.todaysChangePerc ?? 0);

// //       return {
// //         symbol: String(t.ticker || "").toUpperCase(),
// //         price,
// //         volume,
// //         changePercent,
// //       };
// //     })
// //     // 🚨 Filter: keep only valid quotes (has symbol AND price > 0 AND volume > 0)
// //     .filter((q) => q.symbol && q.price > 0 && q.volume > 0)
// //     // Remove duplicates by symbol
// //     .filter((q, idx, arr) => arr.findIndex(a => a.symbol === q.symbol) === idx);

// //   console.log("✅ Processed quotes:", quotes.length, "from", tickers.length, "tickers");

// //   // Sort for each tab
// //   const gainers = [...quotes]
// //     .sort((a, b) => b.changePercent - a.changePercent)
// //     .slice(0, 100); // Top 100 gainers

// //   const losers = [...quotes]
// //     .sort((a, b) => a.changePercent - b.changePercent)
// //     .slice(0, 100); // Top 100 losers

// //   const mostActive = [...quotes]
// //     .sort((a, b) => b.volume - a.volume)
// //     .slice(0, 100); // Top 100 most active

// //   console.log("📊 Gainers:", gainers.length, "| Losers:", losers.length, "| Active:", mostActive.length);

// //   return {
// //     gainers,
// //     losers,
// //     mostActiveList: mostActive,
// //     topGainer: gainers[0] || null,
// //     topLoser: losers[0] || null,
// //     mostActive: mostActive[0] || null,
// //   };
// // }

// // // import { massive } from "./massive";

// // // const safeArray = (v) =>
// // //   Array.isArray(v) ? v : Array.isArray(v?.results) ? v.results : [];

// // // export async function getMarketOverview() {
// // //   // 1️⃣ Market snapshot (ALL stocks)
// // //   const snapRes = await massive.get(
// // //     "/v2/snapshot/locale/us/markets/stocks/tickers"
// // //   );

// // //   const tickers = safeArray(snapRes.data?.tickers);

// // //   // limit for performance
// // //   const quotes = tickers.slice(0, 50).map((t) => {
// // //     const price = Number(t.lastTrade?.p ?? 0);
// // //     const prev = Number(t.prevDay?.c ?? 0);
// // //     const volume = Number(t.day?.v ?? 0);

// // //     const changePercent =
// // //       prev > 0 ? ((price - prev) / prev) * 100 : 0;

// // //     return {
// // //       symbol: t.ticker,
// // //       price,
// // //       volume,
// // //       changePercent,
// // //     };
// // //   });

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


// // // import { massive } from "./massive";

// // // /**
// // //  * Always return array
// // //  */
// // // const safeArray = (value) => {
// // //   if (Array.isArray(value)) return value;
// // //   if (Array.isArray(value?.data)) return value.data;
// // //   if (Array.isArray(value?.results)) return value.results;
// // //   return [];
// // // };

// // // const normalizeQuote = (q) => {
// // //   const price = Number(q.price ?? q.last ?? 0);
// // //   const prev = Number(q.prevClose ?? q.previousClose ?? 0);
// // //   const volume = Number(q.volume ?? 0);

// // //   const changePercent =
// // //     q.changePercent ??
// // //     q.percentChange ??
// // //     (prev > 0 ? ((price - prev) / prev) * 100 : 0);

// // //   return {
// // //     ...q,
// // //     price,
// // //     volume,
// // //     changePercent,
// // //   };
// // // };

// // // export async function getMarketOverview() {
// // //   // 1️⃣ Fetch tickers
// // //   const tickersRes = await massive.get("/reference/tickers", {
// // //     params: { limit: 20 },
// // //   });

// // //   const tickers = safeArray(tickersRes.data);

// // //   // 🔥 IMPORTANT: Massive uses `ticker`, not `symbol`
// // //   const symbols = tickers
// // //     .map((t) => t.ticker)
// // //     .filter(Boolean)
// // //     .join(",");

// // //   if (!symbols) {
// // //     return {
// // //       gainers: [],
// // //       losers: [],
// // //       mostActiveList: [],
// // //       topGainer: {},
// // //       topLoser: {},
// // //       mostActive: {},
// // //     };
// // //   }

// // //   // 2️⃣ Fetch quotes
// // //   const quotesRes = await massive.get("/snapshot/quotes", {
// // //     params: { symbols },
// // //   });

// // //   const rawQuotes = safeArray(quotesRes.data);
// // //   const quotes = rawQuotes.map(normalizeQuote);

// // //   // 3️⃣ Compute market views
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
// // //     topGainer: gainers[0] ?? {},
// // //     topLoser: losers[0] ?? {},
// // //     mostActive: mostActive[0] ?? {},
// // //   };
// // // }

// // // // import { massive } from "./massive";

// // // // /**
// // // //  * Ensures we ALWAYS return an array
// // // //  */
// // // // const safeArray = (value) => {
// // // //   if (Array.isArray(value)) return value;
// // // //   if (Array.isArray(value?.data)) return value.data;
// // // //   if (Array.isArray(value?.results)) return value.results;
// // // //   return [];
// // // // };

// // // // const normalizeQuote = (q) => {
// // // //   const price = Number(q.price ?? q.last ?? 0);
// // // //   const prev = Number(q.prevClose ?? q.previousClose ?? 0);
// // // //   const volume = Number(q.volume ?? 0);

// // // //   const changePercent =
// // // //     q.changePercent ??
// // // //     q.percentChange ??
// // // //     (prev > 0 ? ((price - prev) / prev) * 100 : 0);

// // // //   return {
// // // //     ...q,
// // // //     price,
// // // //     volume,
// // // //     changePercent: Number(changePercent),
// // // //   };
// // // // };

// // // // export async function getMarketOverview() {
// // // //   // 1️⃣ Fetch tickers
// // // //   const tickersRes = await massive.get("/reference/tickers", {
// // // //     params: { limit: 50 },
// // // //   });

// // // //   const tickers = safeArray(tickersRes.data);

// // // //   const symbols = tickers
// // // //     .slice(0, 20)
// // // //     .map((t) => t.symbol)
// // // //     .filter(Boolean)
// // // //     .join(",");

// // // //   if (!symbols) {
// // // //     return {
// // // //       gainers: [],
// // // //       losers: [],
// // // //       mostActiveList: [],
// // // //       topGainer: {},
// // // //       topLoser: {},
// // // //       mostActive: {},
// // // //     };
// // // //   }

// // // //   // 2️⃣ Fetch quotes
// // // //   const quotesRes = await massive.get("/quotes", {
// // // //     params: { symbols },
// // // //   });

// // // //   const rawQuotes = safeArray(quotesRes.data);

// // // //   const quotes = rawQuotes.map(normalizeQuote);

// // // //   // 3️⃣ Compute market views
// // // //   const gainers = [...quotes].sort(
// // // //     (a, b) => b.changePercent - a.changePercent
// // // //   );

// // // //   const losers = [...quotes].sort(
// // // //     (a, b) => a.changePercent - b.changePercent
// // // //   );

// // // //   const mostActive = [...quotes].sort(
// // // //     (a, b) => b.volume - a.volume
// // // //   );

// // // //   return {
// // // //     gainers,
// // // //     losers,
// // // //     mostActiveList: mostActive,
// // // //     topGainer: gainers[0] ?? {},
// // // //     topLoser: losers[0] ?? {},
// // // //     mostActive: mostActive[0] ?? {},
// // // //   };
// // // // }

// // // // // import { massive } from "./massive";

// // // // // /**
// // // // //  * Ensures we ALWAYS return an array
// // // // //  */
// // // // // const safeArray = (value) => {
// // // // //   if (Array.isArray(value)) return value;
// // // // //   if (Array.isArray(value?.data)) return value.data;
// // // // //   if (Array.isArray(value?.results)) return value.results;
// // // // //   return [];
// // // // // };

// // // // // export async function getMarketOverview() {
// // // // //   const tickersRes = await massive.get("/reference/tickers", {
// // // // //     params: { limit: 50 },
// // // // //   });

// // // // //   const symbols = tickersRes.data.results
// // // // //     .slice(0, 20)
// // // // //     .map(t => t.symbol)
// // // // //     .join(",");

// // // // //   const quotesRes = await massive.get("/quotes", {
// // // // //     params: { symbols },
// // // // //   });

// // // // //   const quotes = quotesRes.data.results || [];

// // // // //   const gainers = [...quotes].sort(
// // // // //     (a, b) => b.changePercent - a.changePercent
// // // // //   );

// // // // //   const losers = [...quotes].sort(
// // // // //     (a, b) => a.changePercent - b.changePercent
// // // // //   );

// // // // //   const mostActive = [...quotes].sort(
// // // // //     (a, b) => b.volume - a.volume
// // // // //   );

// // // // //   return {
// // // // //     gainers,
// // // // //     losers,
// // // // //     mostActiveList: mostActive,
// // // // //     topGainer: gainers[0],
// // // // //     topLoser: losers[0],
// // // // //     mostActive: mostActive[0],
// // // // //   };
// // // // // }

// // // // // // export async function getMarketOverview() {
// // // // // //   const [gainersRes, losersRes, activeRes] = await Promise.all([
// // // // // //     massive.get("/stocks/gainers"),
// // // // // //     massive.get("/stocks/losers"),
// // // // // //     massive.get("/stocks/most-active"),
// // // // // //   ]);

// // // // // //   const gainers = safeArray(gainersRes?.data);
// // // // // //   const losers = safeArray(losersRes?.data);
// // // // // //   const mostActiveList = safeArray(activeRes?.data);

// // // // // //   return {
// // // // // //     gainers,
// // // // // //     losers,
// // // // // //     mostActiveList,
// // // // // //     topGainer: gainers[0] ?? {},
// // // // // //     topLoser: losers[0] ?? {},
// // // // // //     mostActive: mostActiveList[0] ?? {},
// // // // // //   };
// // // // // // }

// // // // // // import { massive } from "./massive";

// // // // // // // Example endpoints (adjust to Massive docs)
// // // // // // export async function getMarketOverview() {
// // // // // //   const [gainers, losers, active] = await Promise.all([
// // // // // //     massive.get("/stocks/gainers"),
// // // // // //     massive.get("/stocks/losers"),
// // // // // //     massive.get("/stocks/most-active"),
// // // // // //   ]);

// // // // // //   return {
// // // // // //     gainers: gainers.data.slice(0, 5),
// // // // // //     losers: losers.data.slice(0, 5),
// // // // // //     mostActiveList: active.data.slice(0, 8),
// // // // // //     topGainer: gainers.data[0],
// // // // // //     topLoser: losers.data[0],
// // // // // //     mostActive: active.data[0],
// // // // // //   };
// // // // // // }
