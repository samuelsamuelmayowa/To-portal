import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { createChart } from "lightweight-charts";

export default function StockDashboard() {
  const FINNHUB_KEY = "d4lr7u9r01qr851q60q0d4lr7u9r01qr851q60qg";

  const symbols = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms" },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices" },
    { symbol: "INTC", name: "Intel Corp." },
    { symbol: "UBER", name: "Uber Technologies" },
    { symbol: "SHOP", name: "Shopify Inc." },
    { symbol: "DIS", name: "Disney" },
    { symbol: "V", name: "Visa" },
    { symbol: "MA", name: "Mastercard" },
    { symbol: "BAC", name: "Bank of America" },
    { symbol: "JPM", name: "JPMorgan Chase" },
    { symbol: "WMT", name: "Walmart" },
    { symbol: "XOM", name: "Exxon Mobil" },
  ];

  const [stocks, setStocks] = useState([]);

  // const fetchStockData = async () => {
  //   const updated = await Promise.all(
  //     symbols.map(async ({ symbol, name }) => {
  //       const quoteRes = await fetch(
  //         `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
  //       );
  //       const quote = await quoteRes.json();

  //       const now = Math.floor(Date.now() / 1000);
  //       const from = now - 7 * 24 * 60 * 60;
  //       const chartRes = await fetch(
  //         `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=60&from=${from}&to=${now}&token=${FINNHUB_KEY}`
  //       );
  //       const chartData = await chartRes.json();

  //       return {
  //         symbol,
  //         name,
  //         price: quote.c,
  //         change: quote.d,
  //         chart: chartData,
  //       };
  //     })
  //   );

  //   setStocks(updated);
  // };
  const fetchStockData = async () => {
  const updated = await Promise.all(
    symbols.map(async ({ symbol, name }) => {
      try {
        const quoteRes = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
        );
        const quote = await quoteRes.json();

        // Basic price fallback
        const price = quote?.c ?? 0;
        const change = quote?.d ?? 0;

        // Fetch chart safely
        const now = Math.floor(Date.now() / 1000);
        const from = now - 7 * 24 * 60 * 60;

        const chartRes = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=60&from=${from}&to=${now}&token=${FINNHUB_KEY}`
        );
        const chartData = await chartRes.json();
        
        const validChart =
          chartData &&
          chartData.s === "ok" &&
          Array.isArray(chartData.c) &&
          chartData.c.length > 0;

        return {
          symbol,
          name,
          price,
          change,
          chart: validChart ? chartData : null, // ❗ Only send VALID chart
        };
      } catch (err) {
        console.error("Fetch error:", err);
        return {
          symbol,
          name,
          price: 0,
          change: 0,
          chart: null,
        };
      }
    })
  );

  setStocks(updated);
};


  // Fetch immediately, and every 10 seconds
  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sparkline chart renderer
  // const Sparkline = ({ data }) => {
  //   const ref = useRef(null);

  //   useEffect(() => {
  //     if (!data || data.c?.length === 0) return;

  //     const chart = createChart(ref.current, {
  //       width: 250,
  //       height: 60,
  //       layout: { background: { color: "transparent" }, textColor: "#999" },
  //       grid: { vertLines: { visible: false }, horzLines: { visible: false } },
  //     });

  //     const lineSeries = chart.addLineSeries({
  //       color: data.c[0] < data.c[data.c.length - 1] ? "#22c55e" : "#ef4444",
  //       lineWidth: 2,
  //     });

  //     const formatted = data.t.map((t, i) => ({
  //       time: t,
  //       value: data.c[i],
  //     }));

  //     lineSeries.setData(formatted);

  //     return () => chart.remove();
  //   }, [data]);

  //   return <div ref={ref} />;
  // };

  // Sparkline Chart (FIXED - no more undefined errors)
const Sparkline = ({ data }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!data || !data.c || !Array.isArray(data.c) || data.c.length === 0) {
      return; // ❗ NO CHART DATA → SKIP RENDERING
    }

    const chart = createChart(ref.current, {
      width: 250,
      height: 60,
      layout: { background: { color: "transparent" }, textColor: "#999" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    });

    const lineSeries = chart.addLineSeries({
      color: data.c[0] < data.c[data.c.length - 1] ? "#22c55e" : "#ef4444",
      lineWidth: 2,
    });

    const formatted = data.t.map((t, i) => ({
      time: t,
      value: data.c[i],
    }));

    lineSeries.setData(formatted);

    return () => chart.remove();
  }, [data]);

  return <div ref={ref} />;
};


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
            Live Stock & Options Dashboard
          </h1>
          <p className="text-gray-400 mt-3">
            Real-time market movement — powered by Finnhub.
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
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{s.symbol}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
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
                <p className="text-3xl font-bold">${s.price?.toFixed(2)}</p>
                {s.change >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>

              {/* Mini Chart */}
              <div className="mt-3">
                {/* {s.chart && <Sparkline data={s.chart} />} */}
                {s.chart ? (
  <Sparkline data={s.chart} />
) : (
  <p className="text-xs text-gray-500 mt-2">No chart data</p>
)}

              </div>

              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-sm mt-2 ${
                  s.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {s.change >= 0 ? "+" : ""}
                {s.change?.toFixed(2)} today
              </motion.p>
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
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center gap-2 mx-auto hover:shadow-lg hover:scale-[1.03] transition">
            Explore Trading Strategies
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
