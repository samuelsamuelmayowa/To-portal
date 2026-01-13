import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity, Moon, Sun } from "lucide-react";
import { getMarketOverview } from "../lib/marketApi";
import Dropdownstock from "./DropdownStock";

/* ================= PAGE ================= */

export default function MarketOverview() {
  const [userEmail, setUserEmail] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["market-overview"],
    queryFn: getMarketOverview,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setUserEmail(localStorage.getItem("user") || "");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header
        userEmail={userEmail}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {isLoading && <MarketSkeleton />}
        {error && (
          <p className="text-red-500 text-center">
            Failed to load market data
          </p>
        )}

        {data && (
          <>
            {/* ===== SUMMARY ===== */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                title="Top Gainer"
                symbol={data.topGainer?.symbol}
                value={`+${Number(
                  data.topGainer?.changePercent ?? 0
                ).toFixed(2)}%`}
                icon={TrendingUp}
                color="green"
              />

              <SummaryCard
                title="Top Loser"
                symbol={data.topLoser?.symbol}
                value={`${Number(
                  data.topLoser?.changePercent ?? 0
                ).toFixed(2)}%`}
                icon={TrendingDown}
                color="red"
              />

              <SummaryCard
                title="Most Active"
                symbol={data.mostActive?.symbol}
                value={`${Number(
                  data.mostActive?.volume ?? 0
                ).toLocaleString()} vol`}
                icon={Activity}
                color="blue"
              />
            </section>

            {/* ===== TABLES ===== */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MarketTable title="🚀 Top Gainers" data={data.gainers} />
              <MarketTable title="📉 Top Losers" data={data.losers} />
            </section>

            <MarketTable
              title="🔥 Most Active Stocks"
              data={data.mostActiveList}
            />
          </>
        )}
      </main>
    </div>
  );
}
function Header({ userEmail, darkMode, setDarkMode }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            To-Analytics Learning Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Professional Stocks & Options Bootcamp
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {userEmail}
          </span>

          <Dropdownstock />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
function SummaryCard({ title, symbol, value, icon: Icon, color }) {
  const colors = {
    green: "from-green-500/20 to-green-700/10 text-green-400",
    red: "from-red-500/20 to-red-700/10 text-red-400",
    blue: "from-blue-500/20 to-blue-700/10 text-blue-400",
  };

  return (
    <div
      className={`rounded-2xl p-6 bg-gradient-to-br ${colors[color]}
      border border-white/10 hover:scale-[1.03] transition`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-80">{title}</p>
        <Icon size={22} />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold">{symbol || "—"}</p>
        <p className="text-sm opacity-80">{value}</p>
      </div>
    </div>
  );
}
function MarketTable({ title, data = [] }) {
  if (!data.length) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 p-6 border">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">
          No market data available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-900">
      <div className="px-5 py-4 border-b font-semibold">{title}</div>

      <div className="divide-y">
        {data.map((stock) => {
          const change = Number(stock.changePercent ?? 0);
          const isUp = change >= 0;

          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <div>
                <p className="font-medium">{stock.symbol}</p>
                <p className="text-xs text-gray-500">
                  ${Number(stock.price ?? 0).toFixed(2)}
                </p>
              </div>

              <span
                className={`text-sm font-semibold ${
                  isUp ? "text-green-500" : "text-red-500"
                }`}
              >
                {isUp ? "+" : ""}
                {change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MarketSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>

      <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { TrendingUp, TrendingDown, Activity } from "lucide-react";
// import { getMarketOverview } from "../lib/marketApi";
// import Dropdownstock from "./DropdownStock";

// export default function MarketOverview() {
//    const [userEmail, setUserEmail] = useState("");
//      const [darkMode, setDarkMode] = useState(false);
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["market-overview"],
//     queryFn: getMarketOverview,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
//  useEffect(() => {
//       const e = localStorage.getItem("user") || "";
//       setUserEmail(e);
//     });
 
//     useEffect(() => {
//       document.documentElement.classList.toggle("dark", darkMode);
//     }, [darkMode]);
//   if (isLoading) return <p className="p-6">Loading market data…</p>;
//   if (error) return <p className="p-6 text-red-500">Failed to load market</p>;

//   return (
//     <>
//       <div className="max-w-7xl mx-auto mb-6">
//                 <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
//                   {/* LEFT SIDE - TITLE */}
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
//                       To-Analytics Learning Portal
//                     </h1>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {/* Professional Splunk Bootcamp Dashboard */}
//                         Professional Stock's and Options Bootcamp Dashboard
//                     </p>
//                   </div>
        
//                   {/* RIGHT SIDE - ACTIONS */}
//                   <div className="flex items-center gap-4">
//                     {/* User Email */}
//                     <div className="text-sm text-gray-600 dark:text-gray-300">
//                       {userEmail}
//                     </div>
        
//                     {/* Profile Button */}
//                     {/* <button
//                       onClick={() => setProfileOpen(true)}
//                       className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
//                     >
//                       My Profile
//                     </button> */}
        
//         <Dropdownstock/>
//                     {/* Dark Mode Toggle */}
//                     <button
//                       onClick={() => setDarkMode(!darkMode)}
//                       className="px-3 py-1 rounded text-sm 
//                 bg-gray-200 text-gray-800 
//                 dark:bg-gray-800 dark:text-white
//                 hover:opacity-90 transition"
//                     >
//                       {darkMode ? "Light Mode" : "Dark Mode"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//     <div className="max-w-7xl mx-auto mb-6">
//       {/* ===== SUMMARY ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <SummaryCard
//           title="Top Gainer"
//           symbol={data.topGainer?.symbol ?? "—"}
//           value={
//             data.topGainer?.changePercent != null
//               ? `+${Number(data.topGainer.changePercent).toFixed(2)}%`
//               : "N/A"
//           }
//           icon={TrendingUp}
//           gradient="from-green-500/20 to-green-700/20"
//           iconColor="text-green-400"
//         />

//         <SummaryCard
//           title="Top Loser"
//           symbol={data.topLoser?.symbol ?? "—"}
//           value={
//             data.topLoser?.changePercent != null
//               ? `${Number(data.topLoser.changePercent).toFixed(2)}%`
//               : "N/A"
//           }
//           icon={TrendingDown}
//           gradient="from-red-500/20 to-red-700/20"
//           iconColor="text-red-400"
//         />

//         <SummaryCard
//           title="Most Active"
//           symbol={data.mostActive?.symbol ?? "—"}
//           value={
//             data.mostActive?.volume
//               ? `${Number(data.mostActive.volume).toLocaleString()} vol`
//               : "Volume N/A"
//           }
//           icon={Activity}
//           gradient="from-blue-500/20 to-blue-700/20"
//           iconColor="text-blue-400"
//         />
//       </div>

//       {/* ===== TABLES ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <MarketTable title="🚀 Top Gainers" data={data.gainers} />
//         <MarketTable title="📉 Top Losers" data={data.losers} />
//       </div>

//       <MarketTable title="🔥 Most Active Stocks" data={data.mostActiveList} />
//     </div>
//     </>
//   );
// }

// /* ================= COMPONENTS ================= */

// function SummaryCard({ title, symbol, value, icon: Icon, gradient, iconColor }) {
//   return (
//     <div
//       className={`rounded-xl p-5 bg-gradient-to-br ${gradient}
//       backdrop-blur border border-white/10
//       hover:scale-[1.03] transition-transform duration-300`}
//     >
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-400">{title}</p>
//         <Icon className={iconColor} size={22} />
//       </div>

//       <div className="mt-4">
//         <p className="text-2xl font-bold text-white">{symbol}</p>
//         <p className="text-sm text-gray-300">{value}</p>
//       </div>
//     </div>
//   );
// }

// function MarketTable({ title, data = [] }) {
//   if (!Array.isArray(data) || data.length === 0) {
//     return (
//       <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-6">
//         <h2 className="text-lg font-semibold text-white">{title}</h2>
//         <p className="text-sm text-gray-400 mt-2">
//           No market data available
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10">
//       <div className="px-5 py-4 border-b border-white/10">
//         <h2 className="text-lg font-semibold text-white">{title}</h2>
//       </div>

//       <div className="divide-y divide-white/10">
//         {data.map((stock) => {
//           const price = Number(stock.price ?? 0);
//           const change = Number(stock.changePercent ?? 0);
//           const isUp = change >= 0;

//           return (
//             <div
//               key={stock.symbol}
//               className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition"
//             >
//               <div>
//                 <p className="font-medium text-white">{stock.symbol}</p>
//                 <p className="text-xs text-gray-400">
//                   ${price.toFixed(2)}
//                 </p>
//               </div>

//               <span
//                 className={`text-sm font-semibold ${
//                   isUp ? "text-green-400" : "text-red-400"
//                 }`}
//               >
//                 {isUp ? "+" : ""}
//                 {change.toFixed(2)}%
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
