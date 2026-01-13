import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BASE = "https://api.massive.com/v1";
const KEY = import.meta.env.VITE_MASSIVE_API_KEY;

export function useStockQuote(symbol) {
  return useQuery({
    queryKey: ["stock-quote", symbol],
    enabled: !!symbol,
    staleTime: 60_000,
    queryFn: async () => {
      const headers = {
        Authorization: `Bearer ${KEY}`,
      };

      const [quoteRes, snapshotRes] = await Promise.all([
        axios.get(`${BASE}/stocks/${symbol}/quote`, { headers }),
        axios.get(`${BASE}/stocks/${symbol}/snapshot`, { headers }),
      ]);

      console.log(quoteRes)

      return {
        quote: quoteRes.data,
        stats: snapshotRes.data,
      };
    },
  });
}

// // hooks/useStockQuote.js
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY;
// const BASE = "https://api.massive.com/v1";

// export function useStockQuote(symbol) {
//   return useQuery({
//     queryKey: ["quote", symbol],
//     queryFn: async () => {
//       const [quote, candles, stats] = await Promise.all([
//         axios.get(`${BASE}/stocks/quote`, {
//           params: { symbol },
//           headers: { Authorization: `Bearer ${API_KEY}` },
//         }),
//         axios.get(`${BASE}/stocks/ohlc`, {
//           params: { symbol, interval: "5min", range: "1D" },
//           headers: { Authorization: `Bearer ${API_KEY}` },
//         }),
//         axios.get(`${BASE}/stocks/snapshot`, {
//           params: { symbol },
//           headers: { Authorization: `Bearer ${API_KEY}` },
//         }),
//       ]);

//       return {
//         quote: quote.data,
//         candles: candles.data,
//         stats: stats.data,
//       };
//     },
//     staleTime: 60_000,
//   });
// }
