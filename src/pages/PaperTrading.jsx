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
  Brain,
  ShieldCheck,
  PieChart,
  BarChart3,
  Clock3,
  Lightbulb,
  Target,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "AMD", name: "AMD" },
  { symbol: "JPM", name: "JPMorgan" },
  { symbol: "KO", name: "Coca-Cola" },
  { symbol: "DIS", name: "Disney" },
];

async function getErrorMessage(error, fallback = "Something went wrong.") {
  const response = error?.context;

  if (response && typeof response.json === "function") {
    try {
      const body = await response.clone().json();
      return body?.error || body?.message || error?.message || fallback;
    } catch {
      // The Edge Function did not return JSON, so use its text response instead.
      try {
        const text = await response.clone().text();
        if (text) return text;
      } catch {
        // Fall through to the standard error message.
      }
    }
  }

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
      showMessage(await getErrorMessage(error), "error");
    } finally {
      setInitializing(false);
    }
  }

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function handleSymbolChange(value) {
    const cleanValue = value.toUpperCase().replace(/[^A-Z.-]/g, "").slice(0, 10);
    setSymbol(cleanValue);
    setMessage("");
  }

  async function selectStock(nextSymbol) {
    setSymbol(nextSymbol);
    setMessage("");
    await getQuote(nextSymbol);
  }

  function setQuickQuantity(amount) {
    if (amount === "max") {
      const currentPrice =
        String(quote?.symbol || "").toUpperCase() === symbol
          ? Number(quote?.marketPrice || 0)
          : 0;
      const owned = positions
        .filter(
          (position) =>
            String(position.symbol || "").toUpperCase() === symbol,
        )
        .reduce((total, position) => total + getPositionQuantity(position), 0);

      if (side === "buy" && currentPrice <= 0) {
        showMessage(`Load ${symbol}'s current price before using Max.`, "error");
        return;
      }

      setQuantity(side === "sell" ? Math.max(owned, 1) : Math.max(Math.floor(Number(account?.cash_balance || 0) / currentPrice), 1));
      return;
    }

    setQuantity(amount);
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
      if (displayErrors) showMessage(await getErrorMessage(error), "error");
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

    if (String(quote?.symbol || "").toUpperCase() !== cleanSymbol) {
      showMessage(`Search ${cleanSymbol} and load its latest price before trading.`, "error");
      return;
    }

    if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0) {
      showMessage("Quantity must be a whole number greater than zero.", "error");
      return;
    }

    if (side === "buy") {
      const estimatedCost = cleanQuantity * Number(quote?.marketPrice || 0);
      if (estimatedCost > Number(account?.cash_balance || 0)) {
        showMessage(
          `This order costs about ${money.format(estimatedCost)}, but your buying power is ${money.format(Number(account?.cash_balance || 0))}.`,
          "error",
        );
        return;
      }
    }

    if (side === "sell") {
      const ownedQuantity = positions
        .filter(
          (position) =>
            String(position.symbol || "").toUpperCase() === cleanSymbol,
        )
        .reduce(
          (total, position) => total + getPositionQuantity(position),
          0,
        );

      if (ownedQuantity <= 0) {
        showMessage(`You do not currently own any ${cleanSymbol} shares.`, "error");
        return;
      }

      if (cleanQuantity > ownedQuantity) {
        showMessage(
          `You cannot sell ${cleanQuantity} ${cleanSymbol} shares because you currently own ${ownedQuantity}.`,
          "error",
        );
        return;
      }
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
      showMessage(
        await getErrorMessage(error, "Trade could not be completed."),
        "error",
      );
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
  const quoteMatchesSymbol =
    Boolean(quote) && String(quote.symbol || "").toUpperCase() === symbol.trim().toUpperCase();
  const selectedOwnedQuantity = positions
    .filter(
      (position) => String(position.symbol || "").toUpperCase() === symbol,
    )
    .reduce((total, position) => total + getPositionQuantity(position), 0);
  const quotePrice = quoteMatchesSymbol ? Number(quote?.marketPrice || 0) : 0;
  const cleanQuantity = Math.max(Number(quantity) || 0, 0);
  const estimatedTradeValue = quotePrice * cleanQuantity;
  const maxAffordableShares = quotePrice > 0 ? Math.floor(cashBalance / quotePrice) : 0;
  const projectedCash =
    side === "buy"
      ? cashBalance - estimatedTradeValue
      : cashBalance + estimatedTradeValue;
  const dayLow = Number(quote?.low || 0);
  const dayHigh = Number(quote?.high || 0);
  const dayRangePosition =
    dayHigh > dayLow
      ? Math.min(100, Math.max(0, ((quotePrice - dayLow) / (dayHigh - dayLow)) * 100))
      : 50;
  const cashAllocation = totalAccountValue > 0 ? (cashBalance / totalAccountValue) * 100 : 100;
  const largestPosition = [...positionRows].sort((a, b) => b.marketValue - a.marketValue)[0];
  const largestConcentration =
    portfolioValue > 0 && largestPosition
      ? (largestPosition.marketValue / portfolioValue) * 100
      : 0;
  const tradeWarning =
    side === "buy" && estimatedTradeValue > cashBalance
      ? `This order is above your buying power. You can afford up to ${maxAffordableShares} shares.`
      : side === "sell" && cleanQuantity > selectedOwnedQuantity
        ? `You only own ${selectedOwnedQuantity} ${symbol} share${selectedOwnedQuantity === 1 ? "" : "s"}.`
        : side === "buy" && totalAccountValue > 0 && estimatedTradeValue / totalAccountValue > 0.2
          ? "This trade uses more than 20% of your account. Consider position-size risk."
          : "";
  const tradeBlocked =
    side === "buy"
      ? estimatedTradeValue > cashBalance
      : cleanQuantity > selectedOwnedQuantity;

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
      <br/> <br/> <br/>
      <div className="max-w-7xl mx-auto">
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-900/70 via-slate-900/80 to-blue-950/70 p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-bold text-purple-200">
                  <Zap size={14} /> BETA 1
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
                  <ShieldCheck size={14} /> Virtual money · Zero real risk
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">TO Analytics Trading Lab</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Learn how markets work, practise disciplined decisions, and understand every trade before you place it.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniMetric label="Trades" value={orders.length} />
              <MiniMetric label="Holdings" value={positions.length} />
              <MiniMetric label="Data feed" value={String(quote?.feed || "IEX").toUpperCase()} />
            </div>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Wallet />} label="Buying Power" value={money.format(cashBalance)} color="text-purple-400" helper={`${cashAllocation.toFixed(0)}% held as cash`} />
          <StatCard icon={<Activity />} label="Invested Value" value={money.format(portfolioValue)} color="text-cyan-400" helper={`${positions.length} open holding${positions.length === 1 ? "" : "s"}`} />
          <StatCard icon={<Trophy />} label="Total Account" value={money.format(totalAccountValue)} color="text-yellow-400" helper="Cash + current holdings" />
          <StatCard
            icon={totalProfitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
            label="Open Profit / Loss"
            value={money.format(totalProfitLoss)}
            color={totalProfitLoss >= 0 ? "text-green-400" : "text-red-400"}
            helper="Unrealized result"
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <section className="lg:col-span-3 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Choose Any U.S. Stock</h2>
              <p className="text-sm text-slate-400">Select a popular company or type any valid ticker symbol.</p>
            </div>
            <div className="flex gap-3">
              <input
                value={symbol}
                onChange={(event) => handleSymbolChange(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && getQuote()}
                placeholder="Try MSFT, NVDA, TSLA..."
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

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Popular stocks</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {POPULAR_STOCKS.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    disabled={loading}
                    onClick={() => selectStock(stock.symbol)}
                    title={stock.name}
                    className={`rounded-xl border px-3 py-2 text-left transition disabled:opacity-50 ${
                      symbol === stock.symbol
                        ? "border-purple-400 bg-purple-500/25"
                        : "border-white/10 bg-black/20 hover:border-purple-400/60 hover:bg-purple-500/10"
                    }`}
                  >
                    <span className="block font-bold">{stock.symbol}</span>
                    <span className="block truncate text-[11px] text-slate-400">{stock.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {quoteMatchesSymbol && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Latest market price</p>
                    <h3 className="mt-1 text-3xl font-black">{quote.symbol}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} /> {quote.timestamp ? new Date(quote.timestamp).toLocaleString() : "Latest available quote"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black">{money.format(Number(quote.marketPrice))}</p>
                    <p className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${Number(quote.change) >= 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {Number(quote.change) >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      {Number(quote.change) >= 0 ? "+" : ""}{Number(quote.change || 0).toFixed(2)} ({Number(quote.changePercent || 0).toFixed(2)}%)
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MarketMetric label="Open" value={money.format(Number(quote.open || 0))} />
                  <MarketMetric label="Previous close" value={money.format(Number(quote.previousClose || quote.close || 0))} />
                  <MarketMetric label="Day low" value={money.format(dayLow)} />
                  <MarketMetric label="Day high" value={money.format(dayHigh)} />
                </div>

                {dayHigh > dayLow && (
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-slate-400"><span>Day range</span><span>Current position</span></div>
                    <div className="relative h-2 rounded-full bg-white/10">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${dayRangePosition}%` }} />
                      <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-purple-500 shadow-lg" style={{ left: `${dayRangePosition}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-semibold"><span>{money.format(dayLow)}</span><span>{money.format(dayHigh)}</span></div>
                  </div>
                )}
              </div>
            )}
            {!quoteMatchesSymbol && symbol && (
              <p className="mt-5 text-sm text-amber-300">Press the search button to load {symbol}'s latest price.</p>
            )}
          </section>

          <section className="lg:col-span-2 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Order Ticket</h2>
                <p className="text-sm text-slate-400">Review the estimate before trading.</p>
              </div>
              <Target className="text-purple-400" />
            </div>
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
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400"
            />
            <div className="my-3 grid grid-cols-4 gap-2">
              {[1, 5, 10, "max"].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setQuickQuantity(amount)}
                  className="rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-bold uppercase text-slate-300 transition hover:border-purple-400/50 hover:bg-purple-500/10"
                >
                  {amount}
                </button>
              ))}
            </div>

            <div className="mb-4 space-y-2 rounded-xl border border-white/10 bg-black/25 p-4 text-sm">
              <OrderLine label="Market price" value={quoteMatchesSymbol ? money.format(quotePrice) : "Load a quote"} />
              <OrderLine label="Estimated total" value={money.format(estimatedTradeValue)} strong />
              <OrderLine label="You currently own" value={`${selectedOwnedQuantity} ${symbol || "shares"}`} />
              <OrderLine label="Cash after trade" value={money.format(projectedCash)} danger={projectedCash < 0} />
            </div>

            {tradeWarning && (
              <div className="mb-4 flex gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
                <AlertTriangle className="mt-0.5 shrink-0" size={16} /> {tradeWarning}
              </div>
            )}
            <button
              type="button"
              disabled={loading || !quoteMatchesSymbol || tradeBlocked}
              onClick={executeTrade}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 px-8 py-3 rounded-xl font-bold transition"
            >
              {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
            </button>
            <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">Educational simulation only. No real securities or money are used.</p>
          </section>
        </div>

        {message && (
          <div className={`mb-8 rounded-xl border px-4 py-3 ${messageType === "error" ? "border-red-500/40 bg-red-500/10 text-red-200" : messageType === "success" ? "border-green-500/40 bg-green-500/10 text-green-200" : "border-purple-500/40 bg-purple-500/10 text-purple-200"}`}>
            {message}
          </div>
        )}

        <section className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 to-blue-500/5 p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/20 p-3 text-purple-300"><Brain /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-300">Smart Learning Coach</p>
                <h2 className="text-xl font-bold">Understand the decision, not just the button</h2>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <LearningCard
                icon={<Target size={18} />}
                title="Position sizing"
                text="Keep one trade small enough that a bad outcome cannot damage the whole account."
              />
              <LearningCard
                icon={<PieChart size={18} />}
                title="Diversification"
                text="Owning different companies can reduce dependence on one stock's movement."
              />
              <LearningCard
                icon={<BarChart3 size={18} />}
                title="Price vs. value"
                text="A rising price does not automatically mean a stock is a good long-term investment."
              />
            </div>
            <div className="mt-4 flex gap-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
              <Lightbulb className="mt-0.5 shrink-0 text-cyan-300" size={20} />
              <p>
                <strong>Coach insight:</strong>{" "}
                {positions.length === 0
                  ? "Start with a small practice position, then watch how price changes affect your account."
                  : largestConcentration > 60
                    ? `${largestPosition?.positionSymbol} represents ${largestConcentration.toFixed(0)}% of your invested portfolio. Learn about concentration risk before adding more.`
                    : `Your portfolio currently has ${positions.length} holding${positions.length === 1 ? "" : "s"}. Compare their performance instead of judging the account from one trade.`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Portfolio health</p>
                <h2 className="mt-1 text-xl font-bold">Allocation</h2>
              </div>
              <ShieldCheck className="text-green-400" />
            </div>
            <AllocationBar label="Cash" value={cashAllocation} color="bg-purple-500" />
            <AllocationBar label="Invested" value={100 - cashAllocation} color="bg-cyan-500" />
            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
              <HealthRow label="Buying power available" good={cashBalance > 0} />
              <HealthRow label="No oversized sell orders" good />
              <HealthRow label="Multiple holdings" good={positions.length >= 2} />
            </div>
          </div>
        </section>

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
                  const fillPrice = Number(
                    order.execution_price ??
                      order.fill_price ??
                      order.filled_price ??
                      order.price ??
                      order.executed_price ??
                      0,
                  );
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

function StatCard({ icon, label, value, color, helper }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-white/[0.12]">
      <div className={`${color} mb-4 inline-flex rounded-xl bg-white/5 p-2.5 transition group-hover:scale-105`}>{icon}</div>
      <p className="text-sm text-slate-300">{label}</p>
      <h2 className={`mt-1 text-2xl font-black ${color}`}>{value}</h2>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="min-w-[78px] rounded-xl border border-white/10 bg-black/20 px-3 py-3">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

function MarketMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}

function OrderLine({ label, value, strong = false, danger = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className={`${strong ? "font-bold text-white" : "text-slate-200"} ${danger ? "text-red-400" : ""}`}>{value}</span>
    </div>
  );
}

function LearningCard({ icon, title, text }) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 inline-flex rounded-lg bg-purple-500/15 p-2 text-purple-300">{icon}</div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-400">{text}</p>
    </article>
  );
}

function AllocationBar({ label, value, color }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-bold">{safeValue.toFixed(0)}%</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${safeValue}%` }} /></div>
    </div>
  );
}

function HealthRow({ label, good }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-300">{label}</span>
      {good ? <CheckCircle2 className="text-green-400" size={18} /> : <GraduationCap className="text-amber-300" size={19} />}
    </div>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import { supabase, ensureVisitorSession } from "../supabaseClient";
// import {
//   Wallet,
//   Search,
//   Activity,
//   Trophy,
//   RefreshCw,
//   TrendingUp,
//   TrendingDown,
// } from "lucide-react";

// const money = new Intl.NumberFormat("en-US", {
//   style: "currency",
//   currency: "USD",
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 2,
// });

// const POPULAR_STOCKS = [
//   { symbol: "AAPL", name: "Apple" },
//   { symbol: "MSFT", name: "Microsoft" },
//   { symbol: "NVDA", name: "Nvidia" },
//   { symbol: "TSLA", name: "Tesla" },
//   { symbol: "AMZN", name: "Amazon" },
//   { symbol: "GOOGL", name: "Alphabet" },
//   { symbol: "META", name: "Meta" },
//   { symbol: "NFLX", name: "Netflix" },
//   { symbol: "AMD", name: "AMD" },
//   { symbol: "JPM", name: "JPMorgan" },
//   { symbol: "KO", name: "Coca-Cola" },
//   { symbol: "DIS", name: "Disney" },
// ];

// async function getErrorMessage(error, fallback = "Something went wrong.") {
//   const response = error?.context;

//   if (response && typeof response.json === "function") {
//     try {
//       const body = await response.clone().json();
//       return body?.error || body?.message || error?.message || fallback;
//     } catch {
//       // The Edge Function did not return JSON, so use its text response instead.
//       try {
//         const text = await response.clone().text();
//         if (text) return text;
//       } catch {
//         // Fall through to the standard error message.
//       }
//     }
//   }

//   return error?.context?.body?.error || error?.message || fallback;
// }

// function getPositionQuantity(position) {
//   return Number(position.quantity ?? position.qty ?? 0);
// }

// function getAveragePrice(position) {
//   return Number(
//     position.average_price ??
//       position.avg_price ??
//       position.average_cost ??
//       position.cost_basis ??
//       0,
//   );
// }

// export default function PaperTrading() {
//   const [loading, setLoading] = useState(false);
//   const [initializing, setInitializing] = useState(true);
//   const [symbol, setSymbol] = useState("AAPL");
//   const [quote, setQuote] = useState(null);
//   const [positionQuotes, setPositionQuotes] = useState({});
//   const [account, setAccount] = useState(null);
//   const [positions, setPositions] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [quantity, setQuantity] = useState(1);
//   const [side, setSide] = useState("buy");
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("info");

//   useEffect(() => {
//     initialize();
//   }, []);

//   async function initialize() {
//     try {
//       setInitializing(true);
//       setMessage("");

//       const session = await ensureVisitorSession();
//       const userId = session.user.id;

//       const [, loadedPositions] = await Promise.all([
//         loadAccount(userId),
//         loadPortfolio(userId),
//         loadOrders(userId),
//       ]);

//       await Promise.all([
//         getQuote("AAPL", false),
//         refreshPositionQuotes(loadedPositions || []),
//       ]);
//     } catch (error) {
//       console.error(error);
//       showMessage(await getErrorMessage(error), "error");
//     } finally {
//       setInitializing(false);
//     }
//   }

//   function showMessage(text, type = "info") {
//     setMessage(text);
//     setMessageType(type);
//   }

//   function handleSymbolChange(value) {
//     const cleanValue = value.toUpperCase().replace(/[^A-Z.-]/g, "").slice(0, 10);
//     setSymbol(cleanValue);
//     setMessage("");
//   }

//   async function selectStock(nextSymbol) {
//     setSymbol(nextSymbol);
//     setMessage("");
//     await getQuote(nextSymbol);
//   }

//   async function loadAccount(userId) {
//     const { data, error } = await supabase
//       .from("paper_accounts")
//       .select("*")
//       .eq("user_id", userId)
//       .maybeSingle();

//     if (error) throw error;

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

//       if (createError) throw createError;
//       setAccount(newAccount);
//       return newAccount;
//     }

//     setAccount(data);
//     return data;
//   }

//   async function loadPortfolio(userId) {
//     const { data, error } = await supabase
//       .from("paper_positions")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     const nextPositions = data || [];
//     setPositions(nextPositions);
//     return nextPositions;
//   }

//   async function loadOrders(userId) {
//     const { data, error } = await supabase
//       .from("paper_orders")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false })
//       .limit(25);

//     if (error) throw error;
//     setOrders(data || []);
//     return data || [];
//   }

//   async function requestQuote(requestedSymbol) {
//     const cleanSymbol = String(requestedSymbol || "").trim().toUpperCase();
//     if (!cleanSymbol) throw new Error("Enter a stock symbol first.");

//     await ensureVisitorSession();
//     const { data, error } = await supabase.functions.invoke("stock-quote", {
//       body: { symbol: cleanSymbol },
//     });

//     if (error) throw error;
//     if (data?.error) throw new Error(data.error);
//     if (!data?.marketPrice) throw new Error(`No market price found for ${cleanSymbol}.`);

//     return data;
//   }

//   async function getQuote(requestedSymbol = symbol, displayErrors = true) {
//     try {
//       setLoading(true);
//       if (displayErrors) showMessage("");

//       const data = await requestQuote(requestedSymbol);
//       setQuote(data);
//       setSymbol(data.symbol || String(requestedSymbol).toUpperCase());
//       return data;
//     } catch (error) {
//       console.error(error);
//       if (displayErrors) showMessage(await getErrorMessage(error), "error");
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function refreshPositionQuotes(items = positions) {
//     const symbols = [...new Set(items.map((item) => item.symbol).filter(Boolean))];
//     if (!symbols.length) {
//       setPositionQuotes({});
//       return;
//     }

//     const results = await Promise.allSettled(
//       symbols.map(async (itemSymbol) => {
//         const data = await requestQuote(itemSymbol);
//         return [itemSymbol.toUpperCase(), data];
//       }),
//     );

//     const nextQuotes = {};
//     results.forEach((result) => {
//       if (result.status === "fulfilled") {
//         nextQuotes[result.value[0]] = result.value[1];
//       }
//     });
//     setPositionQuotes(nextQuotes);
//   }

//   async function executeTrade() {
//     const cleanQuantity = Number(quantity);
//     const cleanSymbol = symbol.trim().toUpperCase();

//     if (!cleanSymbol) {
//       showMessage("Enter a stock symbol first.", "error");
//       return;
//     }

//     if (String(quote?.symbol || "").toUpperCase() !== cleanSymbol) {
//       showMessage(`Search ${cleanSymbol} and load its latest price before trading.`, "error");
//       return;
//     }

//     if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0) {
//       showMessage("Quantity must be a whole number greater than zero.", "error");
//       return;
//     }

//     if (side === "sell") {
//       const ownedQuantity = positions
//         .filter(
//           (position) =>
//             String(position.symbol || "").toUpperCase() === cleanSymbol,
//         )
//         .reduce(
//           (total, position) => total + getPositionQuantity(position),
//           0,
//         );

//       if (ownedQuantity <= 0) {
//         showMessage(`You do not currently own any ${cleanSymbol} shares.`, "error");
//         return;
//       }

//       if (cleanQuantity > ownedQuantity) {
//         showMessage(
//           `You cannot sell ${cleanQuantity} ${cleanSymbol} shares because you currently own ${ownedQuantity}.`,
//           "error",
//         );
//         return;
//       }
//     }

//     try {
//       setLoading(true);
//       showMessage("");

//       const session = await ensureVisitorSession();
//       const { data, error } = await supabase.functions.invoke("paper-trade", {
//         body: {
//           assetType: "stock",
//           symbol: cleanSymbol,
//           side,
//           quantity: cleanQuantity,
//         },
//       });

//       if (error) throw error;
//       if (data?.error) throw new Error(data.error);

//       const userId = session.user.id;
//       const [, nextPositions] = await Promise.all([
//         loadAccount(userId),
//         loadPortfolio(userId),
//         loadOrders(userId),
//       ]);
//       await refreshPositionQuotes(nextPositions || []);

//       showMessage(
//         `${side === "buy" ? "Buy" : "Sell"} order for ${cleanQuantity} ${cleanSymbol} share${cleanQuantity === 1 ? "" : "s"} completed.`,
//         "success",
//       );
//     } catch (error) {
//       console.error(error);
//       showMessage(
//         await getErrorMessage(error, "Trade could not be completed."),
//         "error",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   const positionRows = useMemo(
//     () =>
//       positions.map((position) => {
//         const positionSymbol = String(position.symbol || "").toUpperCase();
//         const shares = getPositionQuantity(position);
//         const averagePrice = getAveragePrice(position);
//         const currentPrice = Number(
//           positionQuotes[positionSymbol]?.marketPrice ??
//             position.current_price ??
//             averagePrice,
//         );
//         const marketValue = shares * currentPrice;
//         const costBasis = shares * averagePrice;
//         const profitLoss = marketValue - costBasis;
//         const profitLossPercent = costBasis ? (profitLoss / costBasis) * 100 : 0;

//         return {
//           ...position,
//           positionSymbol,
//           shares,
//           averagePrice,
//           currentPrice,
//           marketValue,
//           profitLoss,
//           profitLossPercent,
//         };
//       }),
//     [positions, positionQuotes],
//   );

//   const portfolioValue = positionRows.reduce((sum, row) => sum + row.marketValue, 0);
//   const totalProfitLoss = positionRows.reduce((sum, row) => sum + row.profitLoss, 0);
//   const cashBalance = Number(account?.cash_balance ?? 100000);
//   const totalAccountValue = cashBalance + portfolioValue;
//   const quoteMatchesSymbol =
//     Boolean(quote) && String(quote.symbol || "").toUpperCase() === symbol.trim().toUpperCase();

//   if (initializing) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black grid place-items-center text-white">
//         <div className="flex items-center gap-3 text-purple-200">
//           <RefreshCw className="animate-spin" /> Loading your trading account...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black p-4 sm:p-6 text-white">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl sm:text-4xl font-bold mb-2">TO Analytics Trading Lab</h1>
//         <p className="text-purple-300 mb-8">Practice stock trading with virtual money</p>

//         <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
//           <StatCard icon={<Wallet />} label="Cash Balance" value={money.format(cashBalance)} color="text-purple-400" />
//           <StatCard icon={<Activity />} label="Portfolio Value" value={money.format(portfolioValue)} color="text-green-400" />
//           <StatCard icon={<Trophy />} label="Account Value" value={money.format(totalAccountValue)} color="text-yellow-400" />
//           <StatCard
//             icon={totalProfitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
//             label="Open Profit / Loss"
//             value={money.format(totalProfitLoss)}
//             color={totalProfitLoss >= 0 ? "text-green-400" : "text-red-400"}
//           />
//         </div>

//         <div className="grid lg:grid-cols-5 gap-6 mb-8">
//           <section className="lg:col-span-3 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
//             <div className="mb-4">
//               <h2 className="text-xl font-bold">Choose Any U.S. Stock</h2>
//               <p className="text-sm text-slate-400">Select a popular company or type any valid ticker symbol.</p>
//             </div>
//             <div className="flex gap-3">
//               <input
//                 value={symbol}
//                 onChange={(event) => handleSymbolChange(event.target.value)}
//                 onKeyDown={(event) => event.key === "Enter" && getQuote()}
//                 placeholder="Try MSFT, NVDA, TSLA..."
//                 className="min-w-0 flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400"
//               />
//               <button
//                 type="button"
//                 disabled={loading}
//                 onClick={() => getQuote()}
//                 className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 rounded-xl transition"
//                 aria-label="Search stock"
//               >
//                 <Search />
//               </button>
//             </div>

//             <div className="mt-5">
//               <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Popular stocks</p>
//               <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                 {POPULAR_STOCKS.map((stock) => (
//                   <button
//                     key={stock.symbol}
//                     type="button"
//                     disabled={loading}
//                     onClick={() => selectStock(stock.symbol)}
//                     title={stock.name}
//                     className={`rounded-xl border px-3 py-2 text-left transition disabled:opacity-50 ${
//                       symbol === stock.symbol
//                         ? "border-purple-400 bg-purple-500/25"
//                         : "border-white/10 bg-black/20 hover:border-purple-400/60 hover:bg-purple-500/10"
//                     }`}
//                   >
//                     <span className="block font-bold">{stock.symbol}</span>
//                     <span className="block truncate text-[11px] text-slate-400">{stock.name}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {quoteMatchesSymbol && (
//               <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
//                 <div>
//                   <p className="text-sm text-slate-400">Latest market price</p>
//                   <h3 className="text-3xl font-bold">{quote.symbol}</h3>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-3xl font-bold">{money.format(Number(quote.marketPrice))}</p>
//                   <p className={Number(quote.change) >= 0 ? "text-green-400" : "text-red-400"}>
//                     {Number(quote.change) >= 0 ? "+" : ""}{Number(quote.change || 0).toFixed(2)} ({Number(quote.changePercent || 0).toFixed(2)}%)
//                   </p>
//                 </div>
//               </div>
//             )}
//             {!quoteMatchesSymbol && symbol && (
//               <p className="mt-5 text-sm text-amber-300">Press the search button to load {symbol}'s latest price.</p>
//             )}
//           </section>

//           <section className="lg:col-span-2 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
//             <h2 className="text-xl font-bold mb-5">Execute Paper Trade</h2>
//             <div className="grid grid-cols-2 gap-3 mb-4">
//               <button
//                 type="button"
//                 onClick={() => setSide("buy")}
//                 className={`py-3 rounded-xl font-bold transition ${side === "buy" ? "bg-green-600 ring-2 ring-green-300" : "bg-white/10 hover:bg-white/20"}`}
//               >
//                 BUY
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setSide("sell")}
//                 className={`py-3 rounded-xl font-bold transition ${side === "sell" ? "bg-red-600 ring-2 ring-red-300" : "bg-white/10 hover:bg-white/20"}`}
//               >
//                 SELL
//               </button>
//             </div>
//             <label className="block text-sm text-slate-300 mb-2">Number of shares</label>
//             <input
//               type="number"
//               min="1"
//               step="1"
//               value={quantity}
//               onChange={(event) => setQuantity(event.target.value)}
//               className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 mb-4 outline-none focus:border-purple-400"
//             />
//             <button
//               type="button"
//               disabled={loading || !quoteMatchesSymbol}
//               onClick={executeTrade}
//               className="w-full bg-purple-600 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 px-8 py-3 rounded-xl font-bold transition"
//             >
//               {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
//             </button>
//           </section>
//         </div>

//         {message && (
//           <div className={`mb-8 rounded-xl border px-4 py-3 ${messageType === "error" ? "border-red-500/40 bg-red-500/10 text-red-200" : messageType === "success" ? "border-green-500/40 bg-green-500/10 text-green-200" : "border-purple-500/40 bg-purple-500/10 text-purple-200"}`}>
//             {message}
//           </div>
//         )}

//         <section className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl mb-8">
//           <div className="flex items-center justify-between gap-4 p-6">
//             <div>
//               <h2 className="text-xl font-bold">My Portfolio</h2>
//               <p className="text-sm text-slate-400">Your open stock positions</p>
//             </div>
//             <button
//               type="button"
//               onClick={() => refreshPositionQuotes()}
//               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
//             >
//               <RefreshCw size={17} /> Refresh
//             </button>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[820px] text-left">
//               <thead className="bg-black/30 text-xs uppercase tracking-wide text-slate-400">
//                 <tr>
//                   <th className="px-6 py-4">Symbol</th>
//                   <th className="px-6 py-4">Shares</th>
//                   <th className="px-6 py-4">Average Cost</th>
//                   <th className="px-6 py-4">Current Price</th>
//                   <th className="px-6 py-4">Market Value</th>
//                   <th className="px-6 py-4">Profit / Loss</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/10">
//                 {positionRows.map((row) => (
//                   <tr key={row.id || row.positionSymbol} className="hover:bg-white/5">
//                     <td className="px-6 py-4 font-bold">{row.positionSymbol}</td>
//                     <td className="px-6 py-4">{row.shares.toLocaleString()}</td>
//                     <td className="px-6 py-4">{money.format(row.averagePrice)}</td>
//                     <td className="px-6 py-4">{money.format(row.currentPrice)}</td>
//                     <td className="px-6 py-4">{money.format(row.marketValue)}</td>
//                     <td className={`px-6 py-4 font-semibold ${row.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
//                       {money.format(row.profitLoss)}
//                       <span className="block text-xs">{row.profitLoss >= 0 ? "+" : ""}{row.profitLossPercent.toFixed(2)}%</span>
//                     </td>
//                   </tr>
//                 ))}
//                 {!positionRows.length && (
//                   <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">You do not have any open positions yet.</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </section>

//         <section className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
//           <div className="p-6">
//             <h2 className="text-xl font-bold">Trade History</h2>
//             <p className="text-sm text-slate-400">Your 25 most recent paper trades</p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[760px] text-left">
//               <thead className="bg-black/30 text-xs uppercase tracking-wide text-slate-400">
//                 <tr>
//                   <th className="px-6 py-4">Date</th>
//                   <th className="px-6 py-4">Symbol</th>
//                   <th className="px-6 py-4">Side</th>
//                   <th className="px-6 py-4">Quantity</th>
//                   <th className="px-6 py-4">Fill Price</th>
//                   <th className="px-6 py-4">Total</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/10">
//                 {orders.map((order) => {
//                   const orderQuantity = Number(order.quantity ?? order.qty ?? 0);
//                   const fillPrice = Number(
//                     order.execution_price ??
//                       order.fill_price ??
//                       order.filled_price ??
//                       order.price ??
//                       order.executed_price ??
//                       0,
//                   );
//                   const orderSide = String(order.side || "").toLowerCase();
//                   return (
//                     <tr key={order.id} className="hover:bg-white/5">
//                       <td className="px-6 py-4 text-slate-300">{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</td>
//                       <td className="px-6 py-4 font-bold">{order.symbol}</td>
//                       <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${orderSide === "buy" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{orderSide || "—"}</span></td>
//                       <td className="px-6 py-4">{orderQuantity.toLocaleString()}</td>
//                       <td className="px-6 py-4">{money.format(fillPrice)}</td>
//                       <td className="px-6 py-4">{money.format(orderQuantity * fillPrice)}</td>
//                     </tr>
//                   );
//                 })}
//                 {!orders.length && (
//                   <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">No trades have been placed yet.</td></tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color }) {
//   return (
//     <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
//       <div className={`${color} mb-3`}>{icon}</div>
//       <p className="text-sm text-slate-300">{label}</p>
//       <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
//     </div>
//   );
// }

// // import React, { useEffect, useMemo, useState } from "react";
// // import { supabase, ensureVisitorSession } from "../supabaseClient";
// // import {
// //   Wallet,
// //   Search,
// //   Activity,
// //   Trophy,
// //   RefreshCw,
// //   TrendingUp,
// //   TrendingDown,
// // } from "lucide-react";

// // const money = new Intl.NumberFormat("en-US", {
// //   style: "currency",
// //   currency: "USD",
// //   minimumFractionDigits: 2,
// //   maximumFractionDigits: 2,
// // });

// // const POPULAR_STOCKS = [
// //   { symbol: "AAPL", name: "Apple" },
// //   { symbol: "MSFT", name: "Microsoft" },
// //   { symbol: "NVDA", name: "Nvidia" },
// //   { symbol: "TSLA", name: "Tesla" },
// //   { symbol: "AMZN", name: "Amazon" },
// //   { symbol: "GOOGL", name: "Alphabet" },
// //   { symbol: "META", name: "Meta" },
// //   { symbol: "NFLX", name: "Netflix" },
// //   { symbol: "AMD", name: "AMD" },
// //   { symbol: "JPM", name: "JPMorgan" },
// //   { symbol: "KO", name: "Coca-Cola" },
// //   { symbol: "DIS", name: "Disney" },
// // ];

// // function getErrorMessage(error, fallback = "Something went wrong.") {
// //   return error?.context?.body?.error || error?.message || fallback;
// // }

// // function getPositionQuantity(position) {
// //   return Number(position.quantity ?? position.qty ?? 0);
// // }

// // function getAveragePrice(position) {
// //   return Number(
// //     position.average_price ??
// //       position.avg_price ??
// //       position.average_cost ??
// //       position.cost_basis ??
// //       0,
// //   );
// // }

// // export default function PaperTrading() {
// //   const [loading, setLoading] = useState(false);
// //   const [initializing, setInitializing] = useState(true);
// //   const [symbol, setSymbol] = useState("AAPL");
// //   const [quote, setQuote] = useState(null);
// //   const [positionQuotes, setPositionQuotes] = useState({});
// //   const [account, setAccount] = useState(null);
// //   const [positions, setPositions] = useState([]);
// //   const [orders, setOrders] = useState([]);
// //   const [quantity, setQuantity] = useState(1);
// //   const [side, setSide] = useState("buy");
// //   const [message, setMessage] = useState("");
// //   const [messageType, setMessageType] = useState("info");

// //   useEffect(() => {
// //     initialize();
// //   }, []);

// //   async function initialize() {
// //     try {
// //       setInitializing(true);
// //       setMessage("");

// //       const session = await ensureVisitorSession();
// //       const userId = session.user.id;

// //       const [, loadedPositions] = await Promise.all([
// //         loadAccount(userId),
// //         loadPortfolio(userId),
// //         loadOrders(userId),
// //       ]);

// //       await Promise.all([
// //         getQuote("AAPL", false),
// //         refreshPositionQuotes(loadedPositions || []),
// //       ]);
// //     } catch (error) {
// //       console.error(error);
// //       showMessage(getErrorMessage(error), "error");
// //     } finally {
// //       setInitializing(false);
// //     }
// //   }

// //   function showMessage(text, type = "info") {
// //     setMessage(text);
// //     setMessageType(type);
// //   }

// //   function handleSymbolChange(value) {
// //     const cleanValue = value.toUpperCase().replace(/[^A-Z.-]/g, "").slice(0, 10);
// //     setSymbol(cleanValue);
// //     setMessage("");
// //   }

// //   async function selectStock(nextSymbol) {
// //     setSymbol(nextSymbol);
// //     setMessage("");
// //     await getQuote(nextSymbol);
// //   }

// //   async function loadAccount(userId) {
// //     const { data, error } = await supabase
// //       .from("paper_accounts")
// //       .select("*")
// //       .eq("user_id", userId)
// //       .maybeSingle();

// //     if (error) throw error;

// //     if (!data) {
// //       const { data: newAccount, error: createError } = await supabase
// //         .from("paper_accounts")
// //         .insert({
// //           user_id: userId,
// //           starting_cash: 100000,
// //           cash_balance: 100000,
// //         })
// //         .select()
// //         .single();

// //       if (createError) throw createError;
// //       setAccount(newAccount);
// //       return newAccount;
// //     }

// //     setAccount(data);
// //     return data;
// //   }

// //   async function loadPortfolio(userId) {
// //     const { data, error } = await supabase
// //       .from("paper_positions")
// //       .select("*")
// //       .eq("user_id", userId)
// //       .order("created_at", { ascending: false });

// //     if (error) throw error;

// //     const nextPositions = data || [];
// //     setPositions(nextPositions);
// //     return nextPositions;
// //   }

// //   async function loadOrders(userId) {
// //     const { data, error } = await supabase
// //       .from("paper_orders")
// //       .select("*")
// //       .eq("user_id", userId)
// //       .order("created_at", { ascending: false })
// //       .limit(25);

// //     if (error) throw error;
// //     setOrders(data || []);
// //     return data || [];
// //   }

// //   async function requestQuote(requestedSymbol) {
// //     const cleanSymbol = String(requestedSymbol || "").trim().toUpperCase();
// //     if (!cleanSymbol) throw new Error("Enter a stock symbol first.");

// //     await ensureVisitorSession();
// //     const { data, error } = await supabase.functions.invoke("stock-quote", {
// //       body: { symbol: cleanSymbol },
// //     });

// //     if (error) throw error;
// //     if (data?.error) throw new Error(data.error);
// //     if (!data?.marketPrice) throw new Error(`No market price found for ${cleanSymbol}.`);

// //     return data;
// //   }

// //   async function getQuote(requestedSymbol = symbol, displayErrors = true) {
// //     try {
// //       setLoading(true);
// //       if (displayErrors) showMessage("");

// //       const data = await requestQuote(requestedSymbol);
// //       setQuote(data);
// //       setSymbol(data.symbol || String(requestedSymbol).toUpperCase());
// //       return data;
// //     } catch (error) {
// //       console.error(error);
// //       if (displayErrors) showMessage(getErrorMessage(error), "error");
// //       return null;
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   async function refreshPositionQuotes(items = positions) {
// //     const symbols = [...new Set(items.map((item) => item.symbol).filter(Boolean))];
// //     if (!symbols.length) {
// //       setPositionQuotes({});
// //       return;
// //     }

// //     const results = await Promise.allSettled(
// //       symbols.map(async (itemSymbol) => {
// //         const data = await requestQuote(itemSymbol);
// //         return [itemSymbol.toUpperCase(), data];
// //       }),
// //     );

// //     const nextQuotes = {};
// //     results.forEach((result) => {
// //       if (result.status === "fulfilled") {
// //         nextQuotes[result.value[0]] = result.value[1];
// //       }
// //     });
// //     setPositionQuotes(nextQuotes);
// //   }

// //   async function executeTrade() {
// //     const cleanQuantity = Number(quantity);
// //     const cleanSymbol = symbol.trim().toUpperCase();

// //     if (!cleanSymbol) {
// //       showMessage("Enter a stock symbol first.", "error");
// //       return;
// //     }

// //     if (String(quote?.symbol || "").toUpperCase() !== cleanSymbol) {
// //       showMessage(`Search ${cleanSymbol} and load its latest price before trading.`, "error");
// //       return;
// //     }

// //     if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0) {
// //       showMessage("Quantity must be a whole number greater than zero.", "error");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       showMessage("");

// //       const session = await ensureVisitorSession();
// //       const { data, error } = await supabase.functions.invoke("paper-trade", {
// //         body: {
// //           assetType: "stock",
// //           symbol: cleanSymbol,
// //           side,
// //           quantity: cleanQuantity,
// //         },
// //       });

// //       if (error) throw error;
// //       if (data?.error) throw new Error(data.error);

// //       const userId = session.user.id;
// //       const [, nextPositions] = await Promise.all([
// //         loadAccount(userId),
// //         loadPortfolio(userId),
// //         loadOrders(userId),
// //       ]);
// //       await refreshPositionQuotes(nextPositions || []);

// //       showMessage(
// //         `${side === "buy" ? "Buy" : "Sell"} order for ${cleanQuantity} ${cleanSymbol} share${cleanQuantity === 1 ? "" : "s"} completed.`,
// //         "success",
// //       );
// //     } catch (error) {
// //       console.error(error);
// //       showMessage(getErrorMessage(error, "Trade could not be completed."), "error");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   const positionRows = useMemo(
// //     () =>
// //       positions.map((position) => {
// //         const positionSymbol = String(position.symbol || "").toUpperCase();
// //         const shares = getPositionQuantity(position);
// //         const averagePrice = getAveragePrice(position);
// //         const currentPrice = Number(
// //           positionQuotes[positionSymbol]?.marketPrice ??
// //             position.current_price ??
// //             averagePrice,
// //         );
// //         const marketValue = shares * currentPrice;
// //         const costBasis = shares * averagePrice;
// //         const profitLoss = marketValue - costBasis;
// //         const profitLossPercent = costBasis ? (profitLoss / costBasis) * 100 : 0;

// //         return {
// //           ...position,
// //           positionSymbol,
// //           shares,
// //           averagePrice,
// //           currentPrice,
// //           marketValue,
// //           profitLoss,
// //           profitLossPercent,
// //         };
// //       }),
// //     [positions, positionQuotes],
// //   );

// //   const portfolioValue = positionRows.reduce((sum, row) => sum + row.marketValue, 0);
// //   const totalProfitLoss = positionRows.reduce((sum, row) => sum + row.profitLoss, 0);
// //   const cashBalance = Number(account?.cash_balance ?? 100000);
// //   const totalAccountValue = cashBalance + portfolioValue;
// //   const quoteMatchesSymbol =
// //     Boolean(quote) && String(quote.symbol || "").toUpperCase() === symbol.trim().toUpperCase();

// //   if (initializing) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black grid place-items-center text-white">
// //         <div className="flex items-center gap-3 text-purple-200">
// //           <RefreshCw className="animate-spin" /> Loading your trading account...
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-black p-4 sm:p-6 text-white">
// //       <div className="max-w-7xl mx-auto">
// //         <h1 className="text-3xl sm:text-4xl font-bold mb-2">TO Analytics Trading Lab</h1>
// //         <p className="text-purple-300 mb-8">Practice stock trading with virtual money</p>

// //         <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
// //           <StatCard icon={<Wallet />} label="Cash Balance" value={money.format(cashBalance)} color="text-purple-400" />
// //           <StatCard icon={<Activity />} label="Portfolio Value" value={money.format(portfolioValue)} color="text-green-400" />
// //           <StatCard icon={<Trophy />} label="Account Value" value={money.format(totalAccountValue)} color="text-yellow-400" />
// //           <StatCard
// //             icon={totalProfitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
// //             label="Open Profit / Loss"
// //             value={money.format(totalProfitLoss)}
// //             color={totalProfitLoss >= 0 ? "text-green-400" : "text-red-400"}
// //           />
// //         </div>

// //         <div className="grid lg:grid-cols-5 gap-6 mb-8">
// //           <section className="lg:col-span-3 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
// //             <div className="mb-4">
// //               <h2 className="text-xl font-bold">Choose Any U.S. Stock</h2>
// //               <p className="text-sm text-slate-400">Select a popular company or type any valid ticker symbol.</p>
// //             </div>
// //             <div className="flex gap-3">
// //               <input
// //                 value={symbol}
// //                 onChange={(event) => handleSymbolChange(event.target.value)}
// //                 onKeyDown={(event) => event.key === "Enter" && getQuote()}
// //                 placeholder="Try MSFT, NVDA, TSLA..."
// //                 className="min-w-0 flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-400"
// //               />
// //               <button
// //                 type="button"
// //                 disabled={loading}
// //                 onClick={() => getQuote()}
// //                 className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 rounded-xl transition"
// //                 aria-label="Search stock"
// //               >
// //                 <Search />
// //               </button>
// //             </div>

// //             <div className="mt-5">
// //               <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Popular stocks</p>
// //               <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
// //                 {POPULAR_STOCKS.map((stock) => (
// //                   <button
// //                     key={stock.symbol}
// //                     type="button"
// //                     disabled={loading}
// //                     onClick={() => selectStock(stock.symbol)}
// //                     title={stock.name}
// //                     className={`rounded-xl border px-3 py-2 text-left transition disabled:opacity-50 ${
// //                       symbol === stock.symbol
// //                         ? "border-purple-400 bg-purple-500/25"
// //                         : "border-white/10 bg-black/20 hover:border-purple-400/60 hover:bg-purple-500/10"
// //                     }`}
// //                   >
// //                     <span className="block font-bold">{stock.symbol}</span>
// //                     <span className="block truncate text-[11px] text-slate-400">{stock.name}</span>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {quoteMatchesSymbol && (
// //               <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
// //                 <div>
// //                   <p className="text-sm text-slate-400">Latest market price</p>
// //                   <h3 className="text-3xl font-bold">{quote.symbol}</h3>
// //                 </div>
// //                 <div className="text-right">
// //                   <p className="text-3xl font-bold">{money.format(Number(quote.marketPrice))}</p>
// //                   <p className={Number(quote.change) >= 0 ? "text-green-400" : "text-red-400"}>
// //                     {Number(quote.change) >= 0 ? "+" : ""}{Number(quote.change || 0).toFixed(2)} ({Number(quote.changePercent || 0).toFixed(2)}%)
// //                   </p>
// //                 </div>
// //               </div>
// //             )}
// //             {!quoteMatchesSymbol && symbol && (
// //               <p className="mt-5 text-sm text-amber-300">Press the search button to load {symbol}'s latest price.</p>
// //             )}
// //           </section>

// //           <section className="lg:col-span-2 bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
// //             <h2 className="text-xl font-bold mb-5">Execute Paper Trade</h2>
// //             <div className="grid grid-cols-2 gap-3 mb-4">
// //               <button
// //                 type="button"
// //                 onClick={() => setSide("buy")}
// //                 className={`py-3 rounded-xl font-bold transition ${side === "buy" ? "bg-green-600 ring-2 ring-green-300" : "bg-white/10 hover:bg-white/20"}`}
// //               >
// //                 BUY
// //               </button>
// //               <button
// //                 type="button"
// //                 onClick={() => setSide("sell")}
// //                 className={`py-3 rounded-xl font-bold transition ${side === "sell" ? "bg-red-600 ring-2 ring-red-300" : "bg-white/10 hover:bg-white/20"}`}
// //               >
// //                 SELL
// //               </button>
// //             </div>
// //             <label className="block text-sm text-slate-300 mb-2">Number of shares</label>
// //             <input
// //               type="number"
// //               min="1"
// //               step="1"
// //               value={quantity}
// //               onChange={(event) => setQuantity(event.target.value)}
// //               className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 mb-4 outline-none focus:border-purple-400"
// //             />
// //             <button
// //               type="button"
// //               disabled={loading || !quoteMatchesSymbol}
// //               onClick={executeTrade}
// //               className="w-full bg-purple-600 hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 px-8 py-3 rounded-xl font-bold transition"
// //             >
// //               {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
// //             </button>
// //           </section>
// //         </div>

// //         {message && (
// //           <div className={`mb-8 rounded-xl border px-4 py-3 ${messageType === "error" ? "border-red-500/40 bg-red-500/10 text-red-200" : messageType === "success" ? "border-green-500/40 bg-green-500/10 text-green-200" : "border-purple-500/40 bg-purple-500/10 text-purple-200"}`}>
// //             {message}
// //           </div>
// //         )}

// //         <section className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl mb-8">
// //           <div className="flex items-center justify-between gap-4 p-6">
// //             <div>
// //               <h2 className="text-xl font-bold">My Portfolio</h2>
// //               <p className="text-sm text-slate-400">Your open stock positions</p>
// //             </div>
// //             <button
// //               type="button"
// //               onClick={() => refreshPositionQuotes()}
// //               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
// //             >
// //               <RefreshCw size={17} /> Refresh
// //             </button>
// //           </div>
// //           <div className="overflow-x-auto">
// //             <table className="w-full min-w-[820px] text-left">
// //               <thead className="bg-black/30 text-xs uppercase tracking-wide text-slate-400">
// //                 <tr>
// //                   <th className="px-6 py-4">Symbol</th>
// //                   <th className="px-6 py-4">Shares</th>
// //                   <th className="px-6 py-4">Average Cost</th>
// //                   <th className="px-6 py-4">Current Price</th>
// //                   <th className="px-6 py-4">Market Value</th>
// //                   <th className="px-6 py-4">Profit / Loss</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-white/10">
// //                 {positionRows.map((row) => (
// //                   <tr key={row.id || row.positionSymbol} className="hover:bg-white/5">
// //                     <td className="px-6 py-4 font-bold">{row.positionSymbol}</td>
// //                     <td className="px-6 py-4">{row.shares.toLocaleString()}</td>
// //                     <td className="px-6 py-4">{money.format(row.averagePrice)}</td>
// //                     <td className="px-6 py-4">{money.format(row.currentPrice)}</td>
// //                     <td className="px-6 py-4">{money.format(row.marketValue)}</td>
// //                     <td className={`px-6 py-4 font-semibold ${row.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
// //                       {money.format(row.profitLoss)}
// //                       <span className="block text-xs">{row.profitLoss >= 0 ? "+" : ""}{row.profitLossPercent.toFixed(2)}%</span>
// //                     </td>
// //                   </tr>
// //                 ))}
// //                 {!positionRows.length && (
// //                   <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">You do not have any open positions yet.</td></tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         </section>

// //         <section className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
// //           <div className="p-6">
// //             <h2 className="text-xl font-bold">Trade History</h2>
// //             <p className="text-sm text-slate-400">Your 25 most recent paper trades</p>
// //           </div>
// //           <div className="overflow-x-auto">
// //             <table className="w-full min-w-[760px] text-left">
// //               <thead className="bg-black/30 text-xs uppercase tracking-wide text-slate-400">
// //                 <tr>
// //                   <th className="px-6 py-4">Date</th>
// //                   <th className="px-6 py-4">Symbol</th>
// //                   <th className="px-6 py-4">Side</th>
// //                   <th className="px-6 py-4">Quantity</th>
// //                   <th className="px-6 py-4">Fill Price</th>
// //                   <th className="px-6 py-4">Total</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-white/10">
// //                 {orders.map((order) => {
// //                   const orderQuantity = Number(order.quantity ?? order.qty ?? 0);
// //                   const fillPrice = Number(order.fill_price ?? order.price ?? order.executed_price ?? 0);
// //                   const orderSide = String(order.side || "").toLowerCase();
// //                   return (
// //                     <tr key={order.id} className="hover:bg-white/5">
// //                       <td className="px-6 py-4 text-slate-300">{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</td>
// //                       <td className="px-6 py-4 font-bold">{order.symbol}</td>
// //                       <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${orderSide === "buy" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{orderSide || "—"}</span></td>
// //                       <td className="px-6 py-4">{orderQuantity.toLocaleString()}</td>
// //                       <td className="px-6 py-4">{money.format(fillPrice)}</td>
// //                       <td className="px-6 py-4">{money.format(orderQuantity * fillPrice)}</td>
// //                     </tr>
// //                   );
// //                 })}
// //                 {!orders.length && (
// //                   <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">No trades have been placed yet.</td></tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         </section>
// //       </div>
// //     </div>
// //   );
// // }

// // function StatCard({ icon, label, value, color }) {
// //   return (
// //     <div className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
// //       <div className={`${color} mb-3`}>{icon}</div>
// //       <p className="text-sm text-slate-300">{label}</p>
// //       <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
// //     </div>
// //   );
// // }
