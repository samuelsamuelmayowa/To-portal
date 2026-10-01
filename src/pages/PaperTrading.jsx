import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase, ensureVisitorSession } from "../supabaseClient";
import StockChart from "../components/trading/StockChart";
import marketDataStream from "../services/marketDataStream";
import { MARKET_DATA_API_BASE } from "../services/marketDataConfig";
import { fetchMarketQuote, normalizeStockSearchResults } from "../services/marketDataClient";
import { getPaperTradeErrorMessage } from "../services/paperTradeErrors";
import {
  Wallet,
  Search,
  Activity,
  RefreshCw,
  Brain,
  ShieldCheck,
  PieChart,
  BarChart3,
  Lightbulb,
  Target,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Wifi,
  WifiOff,
  LoaderCircle,
} from "lucide-react";

const LazyOptionsLab = lazy(() => import("../components/OptionsLab"));

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
  const [workspace, setWorkspace] = useState("stocks");
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [streamStatus, setStreamStatus] = useState("offline");
  const [realtimeBar, setRealtimeBar] = useState(null);

  useEffect(() => {
    initialize();
    // Account initialization runs once on mount; data refreshes are user driven afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workspace !== "stocks") {
      setSearchLoading(false);
      return undefined;
    }
    const query = searchTerm.trim();
    if (!query) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const url = new URL(`${MARKET_DATA_API_BASE}/market-data/search`);
        url.searchParams.set("q", query);
        const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error("search unavailable");
        const rows = await response.json();
        if (active) setSearchResults(normalizeStockSearchResults(rows));
      } catch {
        if (active) {
          setSearchResults([]);
          setSearchError("Stock search is temporarily unavailable. You can still load a ticker directly.");
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [searchTerm, workspace]);

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
      showMessage("Your practice account is temporarily unavailable. Please try again.", "error");
    } finally {
      setInitializing(false);
    }
  }

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function handleSymbolChange(value) {
    const nextTerm = String(value || "").slice(0, 50);
    setSearchTerm(nextTerm);
    setSearchResults([]);
    setSearchError("");
    setSearchLoading(Boolean(nextTerm.trim()));
    setMessage("");
  }

  async function selectStock(nextSymbol) {
    setSearchTerm(nextSymbol);
    setSymbol(nextSymbol);
    const knownAsset = searchResults.find((asset) => asset.symbol === nextSymbol) || POPULAR_STOCKS.find((asset) => asset.symbol === nextSymbol);
    if (knownAsset) setSelectedAsset(knownAsset);
    setMessage("");
    await getQuote(nextSymbol);
  }

  async function chooseSearchResult(asset) {
    setSelectedAsset(asset);
    setSearchTerm(asset.symbol);
    setSearchResults([]);
    await selectStock(asset.symbol);
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
    return fetchMarketQuote(cleanSymbol);
  }

  async function getQuote(requestedSymbol = symbol, displayErrors = true) {
    try {
      setLoading(true);
      if (displayErrors) showMessage("");

      const data = await requestQuote(requestedSymbol);
      setQuote(data);
      setSymbol(data.symbol || String(requestedSymbol).toUpperCase());
      setSearchTerm(data.symbol || String(requestedSymbol).toUpperCase());
      return data;
    } catch (error) {
      console.error(error);
      if (displayErrors) showMessage("A market quote is unavailable for that symbol. Check the ticker and try again.", "error");
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
      showMessage(await getPaperTradeErrorMessage(error), "error");
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
  const selectedName = selectedAsset?.symbol === symbol
    ? selectedAsset.name
    : POPULAR_STOCKS.find((stock) => stock.symbol === symbol)?.name || "U.S. equity";
  const streamLabel = streamStatus === "connecting"
      ? "CONNECTING"
      : streamStatus === "reconnecting"
        ? "RECONNECTING"
        : streamStatus === "connected"
          ? (realtimeBar?.symbol === symbol ? "LIVE" : "CONNECTED")
          : "OFFLINE";
  const displayedMarketPrice = realtimeBar?.symbol === symbol && Number.isFinite(Number(realtimeBar.close))
    ? Number(realtimeBar.close)
    : quotePrice;

  useEffect(() => {
    if (workspace !== "stocks" || !quoteMatchesSymbol) return undefined;
    let active = true;
    setRealtimeBar(null);
    try {
      const removeBarListener = marketDataStream.subscribe(symbol, (bar) => {
        if (active) setRealtimeBar(bar);
      });
      const removeStatusListener = marketDataStream.subscribeStatus(({ status }) => {
        if (active) setStreamStatus(status);
      });
      return () => {
        active = false;
        removeBarListener();
        removeStatusListener();
      };
    } catch {
      setStreamStatus("offline");
      return undefined;
    }
  }, [symbol, quoteMatchesSymbol, workspace]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080d16] px-3 pb-10 pt-24 text-slate-100 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-[1440px]">
        {/* <div className="mb-4 flex justify-end"><StockDashboardDropdown /></div> */}
        <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0d1420] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">T.O. Analytics · Practice account</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Trading simulator</h1><p className="mt-1 text-sm text-slate-400">Market data for learning. Orders remain virtual.</p></div>
          <div className="flex flex-wrap items-center gap-3">
            {workspace === "stocks" && <div className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${streamLabel === "LIVE" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : ["connecting", "reconnecting"].includes(streamStatus) ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-slate-700 bg-slate-900 text-slate-400"}`} aria-live="polite">{streamLabel === "LIVE" ? <Wifi size={15} /> : ["connecting", "reconnecting"].includes(streamStatus) ? <LoaderCircle size={15} className="animate-spin" /> : <WifiOff size={15} />}{streamLabel}</div>}
            <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-400"><ShieldCheck size={15} className="text-cyan-400" /> Virtual funds · No real orders</div>
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#0d1420] p-2 sm:flex-row sm:items-center sm:justify-between" role="tablist" aria-label="Trading workspace">
          <div className="grid w-full grid-cols-2 gap-1 sm:w-auto">
            {[['stocks', 'Stocks'], ['options', 'Options']].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={workspace === value} onClick={() => setWorkspace(value)} className={`min-h-11 rounded-lg px-5 text-sm font-semibold transition ${workspace === value ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>{label}</button>)}
          </div>
          <p className="px-2 text-xs text-slate-500">Practice only · Virtual account and fills</p>
        </div>

        {workspace === "options" && <Suspense fallback={<div className="rounded-xl border border-slate-800 bg-[#0d1420] p-6 text-sm text-slate-400" role="status">Loading Options Trading…</div>}><LazyOptionsLab active /></Suspense>}
        <div hidden={workspace !== "stocks"}>

        <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0d1420] p-4 lg:flex-row lg:items-center lg:justify-between" aria-label="Selected instrument">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-end gap-3"><div><p className="text-xs text-slate-500">Selected instrument</p><h2 className="text-2xl font-bold sm:text-3xl">{symbol || "—"}</h2></div><div className="min-w-0 pb-1"><p className="truncate text-sm font-medium text-slate-300">{selectedName}</p><p className="text-xs text-slate-500">{selectedAsset?.symbol === symbol && selectedAsset.exchange ? selectedAsset.exchange : "U.S. equity"} · Regular session 9:30–16:00 ET</p></div></div>
            <div className="relative max-w-2xl">
              <label htmlFor="stock-search" className="sr-only">Search stocks by symbol or company</label>
              <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-700 bg-[#080d16] px-3 focus-within:border-cyan-500/70 focus-within:ring-2 focus-within:ring-cyan-500/15"><Search size={18} className="shrink-0 text-slate-500" /><input id="stock-search" autoComplete="off" value={searchTerm} onChange={(event) => handleSymbolChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (searchResults[0]) chooseSearchResult(searchResults[0]); else if (searchTerm.trim()) selectStock(searchTerm.trim().toUpperCase()); } if (event.key === "Escape") setSearchResults([]); }} placeholder="Search a symbol or company" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600" aria-controls="stock-search-results" aria-expanded={searchResults.length > 0 || searchLoading} />{searchLoading && <LoaderCircle size={17} className="animate-spin text-cyan-400" aria-label="Searching" />}<button type="button" onClick={() => searchTerm.trim() && (searchResults[0] ? chooseSearchResult(searchResults[0]) : selectStock(searchTerm.trim().toUpperCase()))} disabled={!searchTerm.trim() || loading} className="min-h-9 rounded-lg bg-cyan-600 px-3 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40">Load</button></div>
              {(searchResults.length > 0 || searchError || (searchTerm.trim() && !searchLoading)) && <div id="stock-search-results" role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-[#111a28] p-1 shadow-2xl">{searchResults.map((asset) => <button key={asset.symbol} type="button" role="option" aria-selected={asset.symbol === symbol} onClick={() => chooseSearchResult(asset)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"><span className="min-w-0"><strong className="mr-2 text-sm text-slate-100">{asset.symbol}</strong><span className="truncate text-sm text-slate-400">{asset.name || asset.symbol}</span></span><span className="shrink-0 text-[11px] text-slate-500">{asset.exchange || "U.S."}</span></button>)}{searchError && <p className="px-3 py-3 text-sm text-amber-200">{searchError}</p>}{!searchLoading && !searchError && searchResults.length === 0 && <p className="px-3 py-3 text-sm text-slate-400">No matching stocks. Press Load to try the ticker directly.</p>}</div>}
            </div>
            <div className="mt-3 flex max-w-2xl gap-2 overflow-x-auto pb-1" aria-label="Popular stocks">{POPULAR_STOCKS.slice(0, 8).map((stock) => <button key={stock.symbol} type="button" onClick={() => selectStock(stock.symbol)} disabled={loading} className={`min-h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold transition ${symbol === stock.symbol ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-200" : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200"}`}>{stock.symbol}</button>)}</div>
          </div>
          <div className="flex min-w-0 items-end justify-between gap-4 border-t border-slate-800 pt-4 lg:min-w-[230px] lg:justify-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"><div><p className="text-xs text-slate-500">Latest market price</p>{loading && !quoteMatchesSymbol ? <div className="mt-2 h-8 w-28 animate-pulse rounded bg-slate-800" /> : <p className="mt-1 text-2xl font-bold tabular-nums">{quoteMatchesSymbol ? money.format(displayedMarketPrice) : "—"}</p>}{realtimeBar?.symbol === symbol ? <p className="mt-1 text-xs text-emerald-300">Realtime minute bar close</p> : <p className="mt-1 text-xs text-slate-500">{quote?.timestamp ? new Date(quote.timestamp).toLocaleTimeString() : "Select a stock to load data"}</p>}</div><div className="text-right text-xs text-slate-500"><span className="block">{quoteMatchesSymbol && Number.isFinite(Number(quote.change)) ? `${Number(quote.change) >= 0 ? "+" : "−"}${money.format(Math.abs(Number(quote.change)))}` : "Market data"}</span><span className="mt-1 block">{quoteMatchesSymbol && quote.changePercent != null ? `${Number(quote.changePercent) >= 0 ? "+" : ""}${Number(quote.changePercent).toFixed(2)}%` : "IEX stream status"}</span></div></div>
        </section>

        <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <SummaryTile label="Account value" value={money.format(totalAccountValue)} hint="Cash plus open positions" icon={<Wallet size={17} />} />
          <SummaryTile label="Cash / buying power" value={money.format(cashBalance)} hint={`${cashAllocation.toFixed(0)}% held as cash`} icon={<Activity size={17} />} />
          <SummaryTile label="Invested value" value={money.format(portfolioValue)} hint={`${positions.length} open ${positions.length === 1 ? "position" : "positions"}`} icon={<BarChart3 size={17} />} />
          <SummaryTile label="Unrealized P/L" value={`${totalProfitLoss >= 0 ? "+" : "−"}${money.format(Math.abs(totalProfitLoss))}`} hint="Open positions only" icon={totalProfitLoss >= 0 ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />} positive={totalProfitLoss >= 0} />
        </div>
          {initializing && <p role="status" className="mb-4 flex items-center gap-2 text-sm text-slate-400"><LoaderCircle size={16} className="animate-spin text-cyan-400" /> Loading your practice account…</p>}
          {message && <div role={messageType === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border px-4 py-3 text-sm ${messageType === "error" ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : messageType === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-slate-700 bg-slate-900 text-slate-300"}`}>{message}</div>}
          <div className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <StockChart symbol={symbol} active={workspace === "stocks"} orders={orders} />
            <section className="h-fit rounded-2xl border border-slate-800 bg-[#0d1420] p-4 sm:p-5" aria-labelledby="order-ticket-title"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Practice order</p><h2 id="order-ticket-title" className="mt-1 text-lg font-semibold">Order ticket</h2></div><Target className="text-cyan-400" size={19} /></div><div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-[#080d16] p-1.5" role="group" aria-label="Order side"><button type="button" aria-pressed={side === "buy"} onClick={() => setSide("buy")} className={`min-h-11 rounded-lg text-sm font-bold transition ${side === "buy" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>BUY</button><button type="button" aria-pressed={side === "sell"} onClick={() => setSide("sell")} className={`min-h-11 rounded-lg text-sm font-bold transition ${side === "sell" ? "bg-rose-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>SELL</button></div><div className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3"><span className="text-sm text-slate-400">Instrument</span><span className="font-semibold">{symbol}</span></div><label htmlFor="order-quantity" className="mb-2 block text-sm text-slate-300">Shares</label><input id="order-quantity" type="number" inputMode="numeric" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-700 bg-[#080d16] px-4 text-base outline-none focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/15" /><div className="my-3 grid grid-cols-4 gap-2">{[1, 5, 10, "max"].map((amount) => <button key={amount} type="button" onClick={() => setQuickQuantity(amount)} className="min-h-10 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold uppercase text-slate-400 hover:border-slate-600 hover:text-slate-200">{amount}</button>)}</div><div className="mb-4 space-y-3 rounded-xl border border-slate-800 bg-[#080d16] p-3 text-sm"><OrderLine label="Market price" value={quoteMatchesSymbol ? money.format(quotePrice) : "Load a quote"} /><OrderLine label="Estimated value" value={money.format(estimatedTradeValue)} strong /><OrderLine label="Shares owned" value={selectedOwnedQuantity.toLocaleString()} /><OrderLine label="Buying power" value={money.format(cashBalance)} /></div>{tradeWarning && <div className="mb-4 flex gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100"><AlertTriangle size={15} className="mt-0.5 shrink-0" />{tradeWarning}</div>}<button type="button" disabled={initializing || loading || !quoteMatchesSymbol || tradeBlocked} onClick={executeTrade} className={`min-h-12 w-full rounded-xl px-4 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${side === "buy" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"}`}>{loading ? "Processing order…" : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}</button><p className="mt-3 text-center text-[11px] leading-5 text-slate-600">Estimated value only. Existing simulator rules determine virtual fills.</p></section>
          </div>
          <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="rounded-2xl border border-slate-800 bg-[#0d1420] p-4 sm:p-5"><div className="mb-4 flex items-center gap-3"><div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300"><Brain size={18} /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Learning notes</p><h2 className="font-semibold">Build steady investing habits</h2></div></div><div className="grid gap-3 sm:grid-cols-3"><LearningCard icon={<Target size={17} />} title="Position size" text="Keep each practice order within a risk level you understand." /><LearningCard icon={<PieChart size={17} />} title="Diversification" text="Compare holdings and avoid depending on one company." /><LearningCard icon={<BarChart3 size={17} />} title="Price and value" text="A price move alone does not establish a company's long-term value." /></div><div className="mt-4 flex gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm leading-6 text-slate-300"><Lightbulb size={18} className="mt-1 shrink-0 text-cyan-400" /><p><strong className="text-slate-100">Account insight:</strong> {positions.length === 0 ? "Start with a small practice position and observe how it affects the account." : largestConcentration > 60 ? `${largestPosition?.positionSymbol} is ${largestConcentration.toFixed(0)}% of invested value; consider concentration risk.` : `You have ${positions.length} open holding${positions.length === 1 ? "" : "s"}. Review each position alongside the full account.`}</p></div></div><div className="rounded-2xl border border-slate-800 bg-[#0d1420] p-4 sm:p-5"><div className="mb-5 flex items-center gap-2"><ShieldCheck size={18} className="text-cyan-400" /><div><p className="text-xs uppercase tracking-wider text-slate-500">Account mix</p><h2 className="font-semibold">Allocation</h2></div></div><AllocationBar label="Cash" value={cashAllocation} color="bg-cyan-500" /><AllocationBar label="Invested" value={100 - cashAllocation} color="bg-indigo-400" /><div className="mt-5 space-y-3 border-t border-slate-800 pt-4 text-sm"><HealthRow label="Buying power available" good={cashBalance > 0} /><HealthRow label="Open positions" good={positions.length > 0} /></div></div></section>
          <div className="mb-5 grid gap-5 xl:grid-cols-2">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1420]"><div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-4"><div><h2 className="font-semibold">Positions</h2><p className="mt-1 text-xs text-slate-500">{positionRows.length} open holdings</p></div><button type="button" onClick={() => refreshPositionQuotes()} disabled={!positionRows.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"><RefreshCw size={14} /> Refresh</button></div>{initializing ? <p className="p-6 text-sm text-slate-500">Loading positions…</p> : positionRows.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No open positions yet. Your virtual holdings will appear here.</p> : <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Shares</th><th className="px-4 py-3">Avg. price</th><th className="px-4 py-3">Market value</th><th className="px-4 py-3">Unrealized P/L</th></tr></thead><tbody className="divide-y divide-slate-800">{positionRows.map((row) => <tr key={row.id || row.positionSymbol} className="hover:bg-slate-900/50"><td className="px-4 py-3"><button type="button" onClick={() => selectStock(row.positionSymbol)} className="font-semibold text-cyan-300 hover:text-cyan-200">{row.positionSymbol}</button></td><td className="px-4 py-3 tabular-nums">{row.shares.toLocaleString()}</td><td className="px-4 py-3 tabular-nums">{money.format(row.averagePrice)}</td><td className="px-4 py-3 tabular-nums">{money.format(row.marketValue)}</td><td className={`px-4 py-3 font-medium tabular-nums ${row.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{row.profitLoss >= 0 ? "+" : "−"}{money.format(Math.abs(row.profitLoss))}<span className="ml-2 text-xs">({row.profitLoss >= 0 ? "+" : ""}{row.profitLossPercent.toFixed(2)}%)</span></td></tr>)}</tbody></table></div><div className="space-y-2 p-3 md:hidden">{positionRows.map((row) => <button key={row.id || row.positionSymbol} type="button" onClick={() => selectStock(row.positionSymbol)} className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left"><div className="flex items-center justify-between"><span className="font-semibold text-cyan-300">{row.positionSymbol}</span><span className={`text-sm font-semibold ${row.profitLoss >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{row.profitLoss >= 0 ? "+" : "−"}{money.format(Math.abs(row.profitLoss))}</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500"><span>{row.shares.toLocaleString()} shares</span><span>Avg {money.format(row.averagePrice)}</span><span>Value {money.format(row.marketValue)}</span></div></button>)}</div></>}</section>
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1420]"><div className="border-b border-slate-800 px-4 py-4"><h2 className="font-semibold">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Last 25 virtual orders</p></div>{initializing ? <p className="p-6 text-sm text-slate-500">Loading order history…</p> : orders.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No practice orders yet. Completed trades will appear here.</p> : <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Side</th><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Shares</th><th className="px-4 py-3">Fill</th><th className="px-4 py-3">Total</th></tr></thead><tbody className="divide-y divide-slate-800">{orders.map((order) => { const orderQuantity = Number(order.quantity ?? order.qty ?? 0); const fillPrice = Number(order.execution_price ?? order.fill_price ?? order.filled_price ?? order.price ?? order.executed_price ?? 0); const orderSide = String(order.side || "").toLowerCase(); return <tr key={order.id} className="hover:bg-slate-900/50"><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</td><td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${orderSide === "buy" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>{orderSide || "—"}</span></td><td className="px-4 py-3 font-semibold">{order.symbol}</td><td className="px-4 py-3 tabular-nums">{orderQuantity.toLocaleString()}</td><td className="px-4 py-3 tabular-nums">{money.format(fillPrice)}</td><td className="px-4 py-3 tabular-nums">{money.format(orderQuantity * fillPrice)}</td></tr>; })}</tbody></table></div><div className="space-y-2 p-3 md:hidden">{orders.map((order) => { const orderQuantity = Number(order.quantity ?? order.qty ?? 0); const fillPrice = Number(order.execution_price ?? order.fill_price ?? order.filled_price ?? order.price ?? order.executed_price ?? 0); const orderSide = String(order.side || "").toLowerCase(); return <article key={order.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"><div className="flex items-center justify-between"><span className="font-semibold">{order.symbol}</span><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${orderSide === "buy" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>{orderSide || "—"}</span></div><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{orderQuantity.toLocaleString()} shares · {money.format(fillPrice)}</span><span>{money.format(orderQuantity * fillPrice)}</span></div><p className="mt-1 text-[11px] text-slate-600">{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</p></article>; })}</div></>}</section>
          </div>
          <p className="text-center text-xs text-slate-600">Educational simulation only. No real securities or money are used.</p>
        </div>
      </div>
    </main>
  );
}

function SummaryTile({ label, value, hint, icon, positive }) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-800 bg-[#0d1420] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500"><span className="truncate">{label}</span><span className={positive === undefined ? "text-cyan-400" : positive ? "text-emerald-400" : "text-rose-400"}>{icon}</span></div>
      <p className={`mt-2 truncate text-lg font-semibold tabular-nums sm:text-xl ${positive === undefined ? "text-slate-100" : positive ? "text-emerald-300" : "text-rose-300"}`}>{value}</p>
      <p className="mt-1 truncate text-[11px] text-slate-600">{hint}</p>
    </article>
  );
}
SummaryTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  hint: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  positive: PropTypes.bool,
};

function OrderLine({ label, value, strong = false, danger = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className={`${strong ? "font-bold text-white" : "text-slate-200"} ${danger ? "text-red-400" : ""}`}>{value}</span>
    </div>
  );
}
OrderLine.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, strong: PropTypes.bool, danger: PropTypes.bool };

function LearningCard({ icon, title, text }) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 inline-flex rounded-lg bg-purple-500/15 p-2 text-purple-300">{icon}</div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-400">{text}</p>
    </article>
  );
}
LearningCard.propTypes = { icon: PropTypes.node.isRequired, title: PropTypes.string.isRequired, text: PropTypes.string.isRequired };

function AllocationBar({ label, value, color }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="mb-5">
      <div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-bold">{safeValue.toFixed(0)}%</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${safeValue}%` }} /></div>
    </div>
  );
}
AllocationBar.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number.isRequired, color: PropTypes.string.isRequired };

function HealthRow({ label, good }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-300">{label}</span>
      {good ? <CheckCircle2 className="text-green-400" size={18} /> : <GraduationCap className="text-amber-300" size={19} />}
    </div>
  );
}
HealthRow.propTypes = { label: PropTypes.string.isRequired, good: PropTypes.bool.isRequired };

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
