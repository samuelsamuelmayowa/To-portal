
import React, { useEffect, useMemo, useState } from "react";
import { supabase, ensureVisitorSession } from "../supabaseClient";
import {
  Wallet,
  Search,
  Activity,
  Trophy,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getErrorMessage(error, fallback = "Something went wrong.") {
  return error?.context?.body?.error || error?.message || fallback;
}

function getPositionQuantity(position) {
  return Number(position.quantity ?? position.qty ?? 0);
}

function getAveragePrice(position) {
  return Number(
    position.average_price ??
      position.avg_price ??
      position.average_cost ??
      position.cost_basis ??
      0,
  );
}

export default function PaperTrading() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState(null);
  const [positionQuotes, setPositionQuotes] = useState({});
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState("buy");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      setInitializing(true);
      setMessage("");

      const session = await ensureVisitorSession();
      const userId = session.user.id;

      const [, loadedPositions] = await Promise.all([
        loadAccount(userId),
        loadPortfolio(userId),
        loadOrders(userId),
      ]);

      await Promise.all([
        getQuote("AAPL", false),
        refreshPositionQuotes(loadedPositions || []),
      ]);
    } catch (error) {
      console.error(error);
      showMessage(getErrorMessage(error), "error");
    } finally {
      setInitializing(false);
    }
  }

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  async function loadAccount(userId) {
    const { data, error } = await supabase
      .from("paper_accounts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: newAccount, error: createError } = await supabase
        .from("paper_accounts")
        .insert({
          user_id: userId,
          starting_cash: 100000,
          cash_balance: 100000,
        })
        .select()
        .single();

      if (createError) throw createError;
      setAccount(newAccount);
      return newAccount;
    }

    setAccount(data);
    return data;
  }

  async function loadPortfolio(userId) {
    const { data, error } = await supabase
      .from("paper_positions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const nextPositions = data || [];
    setPositions(nextPositions);
    return nextPositions;
  }

  async function loadOrders(userId) {
    const { data, error } = await supabase
      .from("paper_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) throw error;
    setOrders(data || []);
    return data || [];
  }

  async function requestQuote(requestedSymbol) {
    const cleanSymbol = String(requestedSymbol || "").trim().toUpperCase();
    if (!cleanSymbol) throw new Error("Enter a stock symbol first.");

    await ensureVisitorSession();
    const { data, error } = await supabase.functions.invoke("stock-quote", {
      body: { symbol: cleanSymbol },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    if (!data?.marketPrice) throw new Error(`No market price found for ${cleanSymbol}.`);

    return data;
  }

  async function getQuote(requestedSymbol = symbol, displayErrors = true) {
    try {
      setLoading(true);
      if (displayErrors) showMessage("");

      const data = await requestQuote(requestedSymbol);
      setQuote(data);
      setSymbol(data.symbol || String(requestedSymbol).toUpperCase());
      return data;
    } catch (error) {
      console.error(error);
      if (displayErrors) showMessage(getErrorMessage(error), "error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function refreshPositionQuotes(items = positions) {
    const symbols = [...new Set(items.map((item) => item.symbol).filter(Boolean))];
    if (!symbols.length) {
      setPositionQuotes({});
      return;
    }

    const results = await Promise.allSettled(
      symbols.map(async (itemSymbol) => {
        const data = await requestQuote(itemSymbol);
        return [itemSymbol.toUpperCase(), data];
      }),
    );

    const nextQuotes = {};
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        nextQuotes[result.value[0]] = result.value[1];
      }
    });
    setPositionQuotes(nextQuotes);
  }

  async function executeTrade() {
    const cleanQuantity = Number(quantity);
    const cleanSymbol = symbol.trim().toUpperCase();

    if (!cleanSymbol) {
      showMessage("Enter a stock symbol first.", "error");
      return;
    }

    if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0) {
      showMessage("Quantity must be a whole number greater than zero.", "error");
      return;
    }

    try {
      setLoading(true);
      showMessage("");

      const session = await ensureVisitorSession();
      const { data, error } = await supabase.functions.invoke("paper-trade", {
        body: {
          assetType: "stock",
          symbol: cleanSymbol,
          side,
          quantity: cleanQuantity,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const userId = session.user.id;
      const [, nextPositions] = await Promise.all([
        loadAccount(userId),
        loadPortfolio(userId),
        loadOrders(userId),
      ]);
      await refreshPositionQuotes(nextPositions || []);

      showMessage(
        `${side === "buy" ? "Buy" : "Sell"} order for ${cleanQuantity} ${cleanSymbol} share${cleanQuantity === 1 ? "" : "s"} completed.`,
        "success",
      );
    } catch (error) {
      console.error(error);
      showMessage(getErrorMessage(error, "Trade could not be completed."), "error");
    } finally {
      setLoading(false);
    }
  }

  const positionRows = useMemo(
    () =>
      positions.map((position) => {
        const positionSymbol = String(position.symbol || "").toUpperCase();
        const shares = getPositionQuantity(position);
        const averagePrice = getAveragePrice(position);
        const currentPrice = Number(
          positionQuotes[positionSymbol]?.marketPrice ??
            position.current_price ??
            averagePrice,
        );
        const marketValue = shares * currentPrice;
        const costBasis = shares * averagePrice;
        const profitLoss = marketValue - costBasis;
        const profitLossPercent = costBasis ? (profitLoss / costBasis) * 100 : 0;

        return {
          ...position,
          positionSymbol,
          shares,
          averagePrice,
          currentPrice,
          marketValue,
          profitLoss,
          profitLossPercent,
        };
      }),
    [positions, positionQuotes],
  );

  const portfolioValue = positionRows.reduce((sum, row) => sum + row.marketValue, 0);
  const totalProfitLoss = positionRows.reduce((sum, row) => sum + row.profitLoss, 0);
  const cashBalance = Number(account?.cash_balance ?? 100000);
  const totalAccountValue = cashBalance + portfolioValue;

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black grid place-items-center text-white">
        <div className="flex items-center gap-3 text-purple-200">
          <RefreshCw className="animate-spin" /> Loading your trading account...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black p-4 sm:p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">TO Analytics Trading Lab</h1>
        <p className="text-purple-300 mb-8">Practice stock trading with virtual money</p>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Wallet />} label="Cash Balance" value={money.format(cashBalance)} color="text-purple-400" />
          <StatCard icon={<Activity />} label="Portfolio Value" value={money.format(portfolioValue)} color="text-green-400" />
          <StatCard icon={<Trophy />} label="Account Value" value={money.format(totalAccountValue)} color="text-yellow-400" />
          <StatCard
            icon={totalProfitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
            label="Open Profit / Loss"
            value={money.format(totalProfitLoss)}
            color={totalProfitLoss >= 0 ? "text-green-400" : "text-red-400"}
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <section className="lg:col-span-3 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-4">Market Search</h2>
            <div className="flex gap-3">
              <input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                onKeyDown={(event) => event.key === "Enter" && getQuote()}
                placeholder="Enter symbol, e.g. AAPL"
                className="min-w-0 flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => getQuote()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 rounded-xl transition"
                aria-label="Search stock"
              >
                <Search />
              </button>
            </div>

            {quote && (
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Latest market price</p>
                  <h3 className="text-3xl font-bold">{quote.symbol}</h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{money.format(Number(quote.marketPrice))}</p>
                  <p className={Number(quote.change) >= 0 ? "text-green-400" : "text-red-400"}>
                    {Number(quote.change) >= 0 ? "+" : ""}{Number(quote.change || 0).toFixed(2)} ({Number(quote.changePercent || 0).toFixed(2)}%)
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="lg:col-span-2 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-5">Execute Paper Trade</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setSide("buy")}
                className={`py-3 rounded-xl font-bold transition ${side === "buy" ? "bg-green-600 ring-2 ring-green-300" : "bg-white/10 hover:bg-white/20"}`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setSide("sell")}
                className={`py-3 rounded-xl font-bold transition ${side === "sell" ? "bg-red-600 ring-2 ring-red-300" : "bg-white/10 hover:bg-white/20"}`}
              >
                SELL
              </button>
            </div>
            <label className="block text-sm text-slate-300 mb-2">Number of shares</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 mb-4 outline-none focus:border-purple-400"
            />
            <button
              type="button"
              disabled={loading || !quote}
              onClick={executeTrade}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 px-8 py-3 rounded-xl font-bold transition"
            >
              {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
            </button>
          </section>
        </div>

        {message && (
          <div className={`mb-8 rounded-xl border px-4 py-3 ${messageType === "error" ? "border-red-500/40 bg-red-500/10 text-red-200" : messageType === "success" ? "border-green-500/40 bg-green-500/10 text-green-200" : "border-purple-500/40 bg-purple-500/10 text-purple-200"}`}>
            {message}
          </div>
        )}

        <section className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl mb-8">
          <div className="flex items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-xl font-bold">My Portfolio</h2>
              <p className="text-sm text-slate-400">Your open stock positions</p>
            </div>
            <button
              type="button"
              onClick={() => refreshPositionQuotes()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
            >
              <RefreshCw size={17} /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-black/30 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Shares</th>
                  <th className="px-6 py-4">Average Cost</th>
                  <th className="px-6 py-4">Current Price</th>
                  <th className="px-6 py-4">Market Value</th>
                  <th className="px-6 py-4">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {positionRows.map((row) => (
                  <tr key={row.id || row.positionSymbol} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-bold">{row.positionSymbol}</td>
                    <td className="px-6 py-4">{row.shares.toLocaleString()}</td>
                    <td className="px-6 py-4">{money.format(row.averagePrice)}</td>
                    <td className="px-6 py-4">{money.format(row.currentPrice)}</td>
                    <td className="px-6 py-4">{money.format(row.marketValue)}</td>
                    <td className={`px-6 py-4 font-semibold ${row.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {money.format(row.profitLoss)}
                      <span className="block text-xs">{row.profitLoss >= 0 ? "+" : ""}{row.profitLossPercent.toFixed(2)}%</span>
                    </td>
                  </tr>
                ))}
                {!positionRows.length && (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">You do not have any open positions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold">Trade History</h2>
            <p className="text-sm text-slate-400">Your 25 most recent paper trades</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-black/30 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Side</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Fill Price</th>
                  <th className="px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.map((order) => {
                  const orderQuantity = Number(order.quantity ?? order.qty ?? 0);
                  const fillPrice = Number(order.fill_price ?? order.price ?? order.executed_price ?? 0);
                  const orderSide = String(order.side || "").toLowerCase();
                  return (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-slate-300">{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</td>
                      <td className="px-6 py-4 font-bold">{order.symbol}</td>
                      <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${orderSide === "buy" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{orderSide || "—"}</span></td>
                      <td className="px-6 py-4">{orderQuantity.toLocaleString()}</td>
                      <td className="px-6 py-4">{money.format(fillPrice)}</td>
                      <td className="px-6 py-4">{money.format(orderQuantity * fillPrice)}</td>
                    </tr>
                  );
                })}
                {!orders.length && (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">No trades have been placed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-sm text-slate-300">{label}</p>
      <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}


// import React, { useEffect, useState } from "react";
// import { supabase, ensureVisitorSession } from "../supabaseClient";

// import { Wallet, Search, Activity, Trophy } from "lucide-react";

// export default function PaperTrading() {
//   const [loading, setLoading] = useState(false);

//   const [symbol, setSymbol] = useState("AAPL");

//   const [quote, setQuote] = useState(null);

//   const [account, setAccount] = useState(null);

//   const [positions, setPositions] = useState([]);

//   const [orders, setOrders] = useState([]);

//   const [quantity, setQuantity] = useState(1);

//   const [side, setSide] = useState("buy");

//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     initialize();
//   }, []);

//   async function initialize() {
//     try {
//       const session = await ensureVisitorSession();

//       const userId = session.user.id;

//       await loadAccount(userId);

//       await loadPortfolio(userId);

//       await loadOrders(userId);

//       await getQuote();
//     } catch (error) {
//       console.error(error);

//       setMessage(error.message);
//     }
//   }

//   async function loadAccount(userId) {
//     const { data, error } = await supabase
//       .from("paper_accounts")
//       .select("*")
//       .eq("user_id", userId)
//       .maybeSingle();

//     if (error) {
//       console.error(error);

//       return;
//     }

//     if (!data) {
//       const { data: newAccount, error: createError } = await supabase
//         .from("paper_accounts")
//         .insert({
//           user_id: userId,

//           starting_cash: 100000,

//           cash_balance: 100000,
//         })
//         .select()
//         .single();

//       if (createError) {
//         console.error("Account creation failed:", createError);

//         return;
//       }

//       setAccount(newAccount);

//       return;
//     }

//     setAccount(data);
//   }

//   async function loadPortfolio(userId) {
//     const { data, error } = await supabase
//       .from("paper_positions")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", {
//         ascending: false,
//       });

//     if (error) {
//       console.error(error);

//       return;
//     }

//     setPositions(data || []);
//   }

//   async function loadOrders(userId) {
//     const { data, error } = await supabase
//       .from("paper_orders")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", {
//         ascending: false,
//       })
//       .limit(10);

//     if (error) {
//       console.error(error);

//       return;
//     }

//     setOrders(data || []);
//   }

//   async function getQuote() {
//     try {
//       setLoading(true);

//       await ensureVisitorSession();

//       const { data, error } = await supabase.functions.invoke(
//         "stock-quote",

//         {
//           body: {
//             symbol,
//           },
//         },
//       );

//          console.log("FULL QUOTE RESPONSE:", data);
//       if (error) {
//         throw error;
//       }

//       setQuote(data);
//     } catch (error) {
//       console.error(error);

//       setMessage(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function executeTrade() {
//     try {
//       setLoading(true);

//       setMessage("");

//       await ensureVisitorSession();

//       const { data, error } = await supabase.functions.invoke(
//         "paper-trade",

//         {
//           body: {
//             assetType: "stock",

//             symbol,

//             side,

//             quantity: Number(quantity),
//           },
//         },
//       );

//       if (error) {
//         throw error;
//       }

//       if (data?.error) {
//         throw new Error(data.error);
//       }

//       setMessage("Trade executed successfully");

//       await initialize();
//     } catch (error) {
//       console.error(error);

//       setMessage(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div
//       className="
// min-h-screen
// bg-gradient-to-br
// from-purple-950
// via-slate-950
// to-black
// p-6
// text-white
// "
//     >
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-4xl font-bold mb-2">TO Analytics Trading Lab</h1>

//         <p className="text-purple-300 mb-8">
//           Practice stock trading with virtual money
//         </p>

//         <div className="grid md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">
//             <Wallet className="text-purple-400 mb-3" />

//             <p>Cash Balance</p>

//             <h2 className="text-3xl font-bold">
//               $
//               {account?.cash_balance
//                 ? Number(account.cash_balance).toLocaleString()
//                 : "100,000"}
//             </h2>
//           </div>

//           <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">
//             <Activity className="text-green-400 mb-3" />

//             <p>Positions</p>

//             <h2 className="text-3xl font-bold">{positions.length}</h2>
//           </div>

//           <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-xl">
//             <Trophy className="text-yellow-400 mb-3" />

//             <p>Trades</p>

//             <h2 className="text-3xl font-bold">{orders.length}</h2>
//           </div>
//         </div>

//         <div className="bg-white/10 rounded-2xl p-6 mb-8">
//           <h2 className="text-xl font-bold mb-4">Market Search</h2>

//           <div className="flex gap-3">
//             <input
//               value={symbol}
//               onChange={(e) => setSymbol(e.target.value.toUpperCase())}
//               className="
// flex-1
// bg-black/40
// border
// border-white/20
// rounded-xl
// px-4
// py-3
// "
//             />

//             <button
//               onClick={getQuote}
//               className="
// bg-purple-600
// px-6
// rounded-xl
// "
//             >
//               <Search />
//             </button>
//           </div>

//           {quote && (
//             <div className="mt-6">
//               <h3 className="text-3xl font-bold">{quote.symbol}</h3>

//               <p className="text-green-400 text-2xl">
//                 ${Number(quote.marketPrice).toFixed(2)}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="bg-white/10 rounded-2xl p-6">
//           <h2 className="text-xl font-bold mb-5">Execute Paper Trade</h2>

//           <div className="flex flex-wrap gap-4">
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               className="
// w-32
// bg-black/40
// border
// border-white/20
// rounded-xl
// px-4
// py-3
// "
//             />

//             <button
//               onClick={() => setSide("buy")}
//               className="
// bg-green-600
// px-6
// rounded-xl
// "
//             >
//               BUY
//             </button>

//             <button
//               onClick={() => setSide("sell")}
//               className="
// bg-red-600
// px-6
// rounded-xl
// "
//             >
//               SELL
//             </button>

//             <button
//               disabled={loading}
//               onClick={executeTrade}
//               className="
// bg-purple-600
// px-8
// rounded-xl
// font-bold
// "
//             >
//               {loading ? "Processing..." : "Trade"}
//             </button>
//           </div>

//           {message && <p className="mt-5 text-purple-300">{message}</p>}
//         </div>
//       </div>
//     </div>
//   );
// }
