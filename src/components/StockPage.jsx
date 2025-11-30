import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export default function StockDashboard() {
  const FINNHUB_KEY = "d4lr7u9r01qr851q60q0d4lr7u9r01qr851q60qg"; // <<<< ADD API KEY HERE

  const symbols = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "MSFT", name: "Microsoft Corp." },
  ];

  const [stocks, setStocks] = useState([]);

  // Fetch live prices from Finnhub
  const fetchStockData = async () => {
    try {
      const updated = await Promise.all(
        symbols.map(async ({ symbol, name }) => {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
          );
          const data = await res.json();

          return {
            symbol,
            name,
            price: data.c, // current price
            change: data.d, // daily change
          };
        })
      );

      setStocks(updated);
    } catch (error) {
      console.error("Finnhub Error:", error);
    }
  };

  // Fetch immediately, then every 5 seconds
  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Stock & Options Dashboard
          </h1>
          <p className="text-gray-400 mt-3 text-sm sm:text-base">
            Live stock prices powered by Finnhub — sleek Splunk-style dashboard.
          </p>
        </motion.div>

        {/* Stock Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((s) => (
            <motion.div
              key={s.symbol}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700 hover:border-green-400/40 shadow-md"
            >
              {/* Price & Symbol */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-white">{s.symbol}</h2>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    s.change >= 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {s.change >= 0 ? "↑ Gain" : "↓ Loss"}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-2">{s.name}</p>

              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold">
                  ${s.price ? s.price.toFixed(2) : "—"}
                </p>
                {s.change >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>

              {/* Animated Change */}
              <motion.p
                key={s.change}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-sm mt-2 ${
                  s.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {s.change >= 0 ? "+" : ""}
                {s.change ? s.change.toFixed(2) : "0.00"} today
              </motion.p>

              {/* Subtle Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">
            Want to learn how to trade these movements?
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto hover:shadow-lg hover:scale-[1.03] transition">
            Explore Trading Strategies
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}




// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

// const SYMBOLS = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "NVDA"];

// export default function StockDashboard() {
//   const [stocks, setStocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [error, setError] = useState("");

//   const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY;

//   // 🔥 Fetch stock quotes from Massive API
//   async function fetchMassiveQuotes() {
//     setLoading(true);
//     setError("");
//     try {
//       const url = `https://api.massive.com/v3/market/quote?symbols=${SYMBOLS.join(
//         ","
//       )}&apiKey=${API_KEY}`;

//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const json = await res.json();
//       const data = json.results || [];

//       const formatted = data.map((s) => ({
//         symbol: s.symbol,
//         name: s.name || s.description || s.symbol,
//         price: s.last || s.price || 0,
//         change: s.change || 0,
//         percent: s.changePercent || 0,
//         prevClose: s.previousClose || s.last - (s.change || 0),
//       }));

//       setStocks(formatted);
//       setLastUpdated(new Date());
//     } catch (e) {
//       console.error("Massive API error:", e);
//       setError("Failed to fetch data from Massive API. Check your key or network.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchMassiveQuotes();
//     const id = setInterval(fetchMassiveQuotes, 15000); // refresh every 15s
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#0d1117] text-gray-100 py-12 px-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
//           <div>
//             <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
//               Live Stock Dashboard
//             </h1>
//             <p className="text-gray-400 mt-2">
//               Powered by{" "}
//               <span className="text-green-400 font-semibold">Massive API</span>
//               . Auto-refresh every 15 seconds.
//             </p>
//           </div>

//           <button
//             onClick={fetchMassiveQuotes}
//             disabled={loading}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:border-green-400/50 transition"
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//             Refresh
//           </button>
//         </div>

//         {/* Status */}
//         <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
//           <span>{loading ? "Updating…" : "Live"}</span>
//           {lastUpdated && (
//             <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
//           )}
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
//             {error}
//           </div>
//         )}

//         {/* Cards */}
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {stocks.map((s) => {
//             const up = (s.change ?? 0) >= 0;
//             return (
//               <motion.div
//                 key={s.symbol}
//                 whileHover={{ y: -5, scale: 1.02 }}
//                 transition={{ duration: 0.2 }}
//                 className="relative rounded-2xl p-5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 hover:border-green-400/40 shadow-md"
//               >
//                 <div className="flex items-center justify-between mb-1">
//                   <h2 className="text-2xl font-bold">{s.symbol}</h2>
//                   <span
//                     className={`text-xs px-2.5 py-1 rounded-full ${
//                       up
//                         ? "bg-green-500/20 text-green-400"
//                         : "bg-red-500/20 text-red-400"
//                     }`}
//                   >
//                     {up ? "↑ Gain" : "↓ Loss"}
//                   </span>
//                 </div>

//                 <p className="text-gray-400 text-xs mb-3 line-clamp-1">
//                   {s.name}
//                 </p>

//                 <div className="flex items-end justify-between">
//                   <p className="text-3xl font-extrabold">
//                     ${s.price?.toFixed(2)}
//                   </p>
//                   {up ? (
//                     <TrendingUp className="w-6 h-6 text-green-400" />
//                   ) : (
//                     <TrendingDown className="w-6 h-6 text-red-400" />
//                   )}
//                 </div>

//                 <motion.p
//                   key={`${s.symbol}-${s.change}`}
//                   initial={{ opacity: 0, y: -5 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.25 }}
//                   className={`mt-2 text-sm ${
//                     up ? "text-green-400" : "text-red-400"
//                   }`}
//                 >
//                   {(up ? "+" : "")}{(s.change ?? 0).toFixed(2)} (
//                   {(s.percent ?? 0).toFixed(2)}%)
//                 </motion.p>

//                 <p className="text-xs text-gray-500 mt-1">
//                   Prev Close: ${s.prevClose?.toFixed(2)}
//                 </p>

//                 <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

// export default function StockDashboard() {
//   const [stocks, setStocks] = useState([
//     { symbol: "AAPL", name: "Apple Inc.", price: 228.92, change: +1.34 },
//     { symbol: "TSLA", name: "Tesla Inc.", price: 256.81, change: -2.11 },
//     { symbol: "GOOGL", name: "Alphabet Inc.", price: 164.73, change: +0.84 },
//     { symbol: "AMZN", name: "Amazon.com Inc.", price: 180.25, change: +2.65 },
//     { symbol: "NVDA", name: "NVIDIA Corp.", price: 121.45, change: -1.02 },
//     { symbol: "MSFT", name: "Microsoft Corp.", price: 433.78, change: +3.14 },
//   ]);

//   // Fake price fluctuation every few seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setStocks((prev) =>
//         prev.map((s) => {
//           const delta = (Math.random() - 0.5) * 2; // random small change
//           const newPrice = Math.max(1, s.price + delta);
//           const change = parseFloat((newPrice - s.price).toFixed(2));
//           return { ...s, price: parseFloat(newPrice.toFixed(2)), change };
//         })
//       );
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#0d1117] text-gray-100 py-12 px-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -15 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-12"
//         >
//           <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
//             {/* 📈 Stock & Options Dashboard */}
//           </h1>
//           <p className="text-gray-400 mt-3 text-sm sm:text-base">
//             Track live stock market changes and visualize trends just like
//             Splunk dashboards — fast, sleek, and interactive.
//           </p>
//         </motion.div>

//         {/* Stock Grid */}
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {stocks.map((s, i) => (
//             <motion.div
//               key={s.symbol}
//               whileHover={{ y: -5, scale: 1.02 }}
//               transition={{ duration: 0.2 }}
//               className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700 hover:border-green-400/40 shadow-md"
//             >
//               {/* Price & Symbol */}
//               <div className="flex justify-between items-center mb-2">
//                 <h2 className="text-xl font-semibold text-white">
//                   {s.symbol}
//                 </h2>
//                 <span
//                   className={`text-sm px-3 py-1 rounded-full font-medium ${
//                     s.change >= 0
//                       ? "bg-green-500/20 text-green-400"
//                       : "bg-red-500/20 text-red-400"
//                   }`}
//                 >
//                   {s.change >= 0 ? "↑ Gain" : "↓ Loss"}
//                 </span>
//               </div>

//               <p className="text-gray-400 text-sm mb-2">{s.name}</p>

//               <div className="flex items-end justify-between">
//                 <p className="text-3xl font-bold">
//                   ${s.price.toFixed(2)}
//                 </p>
//                 {s.change >= 0 ? (
//                   <TrendingUp className="w-6 h-6 text-green-400" />
//                 ) : (
//                   <TrendingDown className="w-6 h-6 text-red-400" />
//                 )}
//               </div>

//               {/* Animated Change */}
//               <motion.p
//                 key={s.change}
//                 initial={{ opacity: 0, y: -5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className={`text-sm mt-2 ${
//                   s.change >= 0 ? "text-green-400" : "text-red-400"
//                 }`}
//               >
//                 {s.change >= 0 ? "+" : ""}
//                 {s.change.toFixed(2)} today
//               </motion.p>

//               {/* Subtle Glow */}
//               <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
//             </motion.div>
//           ))}
//         </div>

//         {/* Call to Action */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="mt-16 text-center"
//         >
//           <p className="text-gray-400 mb-4">
//             Want to learn how to trade these movements?
//           </p>
//           <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto hover:shadow-lg hover:scale-[1.03] transition">
//             Explore Trading Strategies
//             <ArrowRight className="w-5 h-5" />
//           </button>
//         </motion.div>
//       </div>
//     </div>
//   );
// }
