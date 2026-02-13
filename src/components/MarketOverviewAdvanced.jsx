import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  Bookmark,
  ChevronDown,
  Clock,
  Moon,
  RefreshCw,
  Search,
  Star,
  Sun,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import Dropdownstock from "./DropdownStock";
import { getMarketOverview } from "../lib/marketApi";
import { formatPercent } from "../lib/formatters";

/* =========================================================
   MarketOverviewAdvanced
   - Sticky header + dark mode persistence
   - Search + sort + filters
   - Tabs (Overview/Gainers/Losers/Active)
   - Auto refresh toggle
   - Watchlist (localStorage)
   - Skeleton loaders
   - Mini sparkline charts per row
========================================================= */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "gainers", label: "Top Gainers" },
  { id: "losers", label: "Top Losers" },
  { id: "active", label: "Most Active" },
];

const SORTS = [
  { id: "symbol", label: "Symbol" },
  { id: "price", label: "Price" },
  { id: "change", label: "Change %" },
  { id: "volume", label: "Volume" },
];

const WATCHLIST_KEY = "to_watchlist_symbols";
const THEME_KEY = "theme";

export default function MarketOverviewAdvanced() {
  const [userEmail, setUserEmail] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(THEME_KEY) === "dark"
  );

  const [tab, setTab] = useState("overview");

  // Search + filter controls
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("change");
  const [sortDir, setSortDir] = useState("desc"); // asc | desc
  const [minPrice, setMinPrice] = useState("");
  const [showOnlyWatchlist, setShowOnlyWatchlist] = useState(false);

  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSeconds, setRefreshSeconds] = useState(60);

  // Watchlist
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  // Set user + theme
  useEffect(() => {
    setUserEmail(localStorage.getItem("user") || "");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? "dark" : "light");
  }, [darkMode]);

  // react-query refresh based on toggle
  const refetchInterval = autoRefresh ? refreshSeconds * 1000 : false;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["market-overview"],
    queryFn: getMarketOverview,
    staleTime: 1000 * 30,
    refetchInterval,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const updatedLabel = useMemo(() => {
    if (!dataUpdatedAt) return "—";
    const d = new Date(dataUpdatedAt);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [dataUpdatedAt]);

  // Derived lists - safely handle undefined/null data
  const gainers = data?.gainers ?? [];
  const losers = data?.losers ?? [];
  const active = data?.mostActiveList ?? [];
  const overviewHighlights = useMemo(() => {
    return [
      {
        title: "Top Gainer",
        symbol: data?.topGainer?.symbol ?? "—",
        value:
          data?.topGainer?.changePercent != null
            // ? `+${Number(data.topGainer.changePercent).toFixed(2)}%`
              ? formatPercent(data.topGainer.changePercent, { alwaysSign: true })
            : "N/A",
        icon: TrendingUp,
        tone: "green",
      },
      {
        title: "Top Loser",
        symbol: data?.topLoser?.symbol ?? "—",
        value:
          data?.topLoser?.changePercent != null
            ?formatPercent(data.topLoser.changePercent) 
            : "N/A",
        icon: TrendingDown,
        tone: "red",
      },
      {
        title: "Most Active",
        symbol: data?.mostActive?.symbol ?? "—",
        value:
          data?.mostActive?.volume != null
            ? `${Number(data.mostActive.volume).toLocaleString()} vol`
            : "Volume N/A",
        icon: Activity,
        tone: "blue",
      },
    ];
  }, [data]);

  // pick current table list by tab
  const currentList = useMemo(() => {
    if (tab === "gainers") return gainers;
    if (tab === "losers") return losers;
    if (tab === "active") return active;
    // overview uses "active" as default table
    // return active;
      return [...gainers, ...losers, ...active];
  }, [tab, gainers, losers, active]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toUpperCase();

    let list = Array.isArray(currentList) ? [...currentList] : [];

    // watchlist filter
    if (showOnlyWatchlist) {
      const set = new Set(watchlist);
      list = list.filter((s) => set.has(String(s.symbol || "").toUpperCase()));
    }

    // search
    if (q) {
      list = list.filter((s) =>
        String(s.symbol || "").toUpperCase().includes(q)
      );
    }

    // min price
    const minP = minPrice === "" ? null : Number(minPrice);
    if (minP != null && !Number.isNaN(minP)) {
      list = list.filter((s) => Number(s.price || 0) >= minP);
    }

    // sort
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const A = normalizeSortValue(a, sortBy);
      const B = normalizeSortValue(b, sortBy);
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });

    return list;
  }, [currentList, query, minPrice, sortBy, sortDir, showOnlyWatchlist, watchlist]);

  const onToggleWatch = (symbol) => {
    const sym = String(symbol || "").toUpperCase().trim();
    if (!sym) return;
    setWatchlist((prev) =>
      prev.includes(sym) ? prev.filter((x) => x !== sym) : [sym, ...prev]
    );
  };

  const onClearFilters = () => {
    setQuery("");
    setMinPrice("");
    setSortBy("change");
    setSortDir("desc");
    setShowOnlyWatchlist(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* <StickyHeader
        userEmail={userEmail}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isFetching={isFetching}
        updatedLabel={updatedLabel}
        onManualRefresh={() => refetch()}
      /> */}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <StickyHeader
        userEmail={userEmail}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isFetching={isFetching}
        updatedLabel={updatedLabel}
        onManualRefresh={() => refetch()}
      />
        {/* Top controls + tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <Tabs tab={tab} setTab={setTab} />
          </div>

          <div className="lg:col-span-4 flex gap-3 items-center justify-start lg:justify-end">
            <AutoRefreshControl
              autoRefresh={autoRefresh}
              setAutoRefresh={setAutoRefresh}
              refreshSeconds={refreshSeconds}
              setRefreshSeconds={setRefreshSeconds}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-red-200 dark:border-red-900/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400">
                  Couldn’t load market data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Check your connection or API key, then try again.
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 transition"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {/* Overview highlight cards */}
        {tab === "overview" && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading
              ? [1, 2, 3].map((i) => <SummarySkeleton key={i} />)
              : overviewHighlights.map((c) => (
                  <SummaryCard key={c.title} {...c} />
                ))}
          </section>
        )}

        {/* Filters + Watchlist row */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <SearchInput value={query} onChange={setQuery} />

              <div className="flex gap-3">
                <Field
                  label="Min Price"
                  right="$"
                  value={minPrice}
                  onChange={setMinPrice}
                  placeholder="0"
                  inputMode="decimal"
                />

                <SortDropdown
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  sortDir={sortDir}
                  setSortDir={setSortDir}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-between lg:justify-end">
              <button
                onClick={() => setShowOnlyWatchlist((v) => !v)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition
                ${
                  showOnlyWatchlist
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <Star size={16} />
                Watchlist
              </button>

              <button
                onClick={onClearFilters}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
        </Card>

        {/* Main table */}
        <section>
          <MarketTableAdvanced
            title={tabTitle(tab)}
            subtitle={isLoading ? "Loading…" : `${filteredSorted.length} symbols`}
            data={filteredSorted}
            loading={isLoading}
            watchlist={watchlist}
            onToggleWatch={onToggleWatch}
          />
        </section>

        {/* Bottom: Watchlist quick panel */}
        <WatchlistPanel
          watchlist={watchlist}
          onRemove={(sym) => onToggleWatch(sym)}
          onPick={(sym) => setQuery(sym)}
        />
      </div>

      <FooterNote />
    </div>
  );
}

/* ============================ Helpers ============================ */

function normalizeSortValue(stock, sortBy) {
  const sym = String(stock.symbol || "").toUpperCase();
  const price = Number(stock.price ?? 0);
  const change = Number(stock.changePercent ?? 0);
  const volume = Number(stock.volume ?? 0);

  if (sortBy === "symbol") return sym;
  if (sortBy === "price") return price;
  if (sortBy === "volume") return volume;
  return change; // default change
}

function tabTitle(tab) {
  if (tab === "gainers") return "🚀 Top Gainers";
  if (tab === "losers") return "📉 Top Losers";
  if (tab === "active") return "🔥 Most Active Stocks";
  return "Market Snapshot";
}

/* ============================ UI Parts ============================ */

function StickyHeader({ userEmail, darkMode, setDarkMode, isFetching, updatedLabel, onManualRefresh }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/75 backdrop-blur dark:border-gray-800 dark:bg-gray-950/65">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold truncate">
            To-Analytics — Stocks & Options Dashboard
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              Updated: {updatedLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bookmark size={14} />
              Learning Portal
            </span>
            {isFetching && (
              <span className="inline-flex items-center gap-1">
                <RefreshCw size={14} className="animate-spin" />
                Refreshing…
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300 truncate max-w-[240px]">
            {userEmail}
          </div>

          <Dropdownstock />

          <button
            onClick={onManualRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
            title="Refresh"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Tabs({ tab, setTab }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm border transition
              ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800 dark:hover:bg-gray-800"
              }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function AutoRefreshControl({ autoRefresh, setAutoRefresh, refreshSeconds, setRefreshSeconds }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setAutoRefresh((v) => !v)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition
        ${
          autoRefresh
            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-200"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
        }`}
        title="Auto refresh"
      >
        <Bell size={16} />
        Auto
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Every</span>
        <select
          value={refreshSeconds}
          onChange={(e) => setRefreshSeconds(Number(e.target.value))}
          disabled={!autoRefresh}
          className="px-3 py-2 rounded-xl border text-sm bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800 disabled:opacity-60"
        >
          {[15, 30, 60, 120, 300].map((s) => (
            <option key={s} value={s}>
              {s}s
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <div className="flex-1 relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search symbol (e.g. AAPL, TSLA)…"
        className="w-full pl-9 pr-3 py-2 rounded-xl border bg-white border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-gray-900 dark:border-gray-800"
      />
    </div>
  );
}

function Field({ label, right, value, onChange, placeholder, inputMode }) {
  return (
    <div className="min-w-[160px]">
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="relative">
        {right && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {right}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`w-full ${right ? "pl-8" : "pl-3"} pr-3 py-2 rounded-xl border bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800`}
        />
      </div>
    </div>
  );
}

function SortDropdown({ sortBy, setSortBy, sortDir, setSortDir }) {
  return (
    <div className="min-w-[200px]">
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Sort</div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none px-3 py-2 rounded-xl border bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="px-3 py-2 rounded-xl border bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800"
          title="Toggle sort direction"
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
}

/* ============================ Cards & Tables ============================ */

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      {children}
    </div>
  );
}

function SummaryCard({ title, symbol, value, icon: Icon, tone }) {
  const toneClass =
    tone === "green"
      ? "from-emerald-500/15 to-emerald-600/5 border-emerald-500/20"
      : tone === "red"
      ? "from-red-500/15 to-red-600/5 border-red-500/20"
      : "from-blue-500/15 to-blue-600/5 border-blue-500/20";

  const iconClass =
    tone === "green"
      ? "text-emerald-500"
      : tone === "red"
      ? "text-red-500"
      : "text-blue-500";

  return (
    <div
      className={`rounded-2xl p-5 border bg-gradient-to-br ${toneClass}
      hover:translate-y-[-2px] hover:shadow-md transition`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
        <Icon className={iconClass} size={22} />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold">{symbol}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{value}</p>
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="mt-4">
        <div className="h-7 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

function MarketTableAdvanced({ title, subtitle, data, loading, watchlist, onToggleWatch }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          Tip: click ☆ to save symbols
        </div>
      </div>

      {/* table header */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
        <div className="col-span-3">Symbol</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2">Change</div>
        <div className="col-span-3">Trend</div>
        <div className="col-span-2 text-right">Volume</div>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No results. Try clearing filters.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((stock) => (
            <StockRow
              key={String(stock.symbol)}
              stock={stock}
              watched={watchlist.includes(String(stock.symbol || "").toUpperCase())}
              onToggleWatch={onToggleWatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-3 items-center animate-pulse">
      <div className="col-span-3 h-4 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="col-span-2 h-4 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="col-span-2 h-4 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="col-span-3 h-8 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="col-span-2 h-4 rounded bg-gray-200 dark:bg-gray-800 justify-self-end w-24" />
    </div>
  );
}

function toFiniteNumber(v) {
  if (v == null) return null;

  // if it’s a string like "1.23%" or " 1,234.5 "
  const cleaned =
    typeof v === "string" ? v.replace(/[%,$,\s]/g, "") : v;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function StockRow({ stock, watched, onToggleWatch }) {
  if (!stock) return null;

  const symbol = String(stock?.symbol || "").toUpperCase().trim();
  const price = Number(stock?.price ?? 0);
  const change = Number(stock?.changePercent ?? 0);
  const changeNum = toFiniteNumber(stock?.changePercent);
  const volume = Number(stock?.volume ?? 0);
  const isUp = change >= 0;

  if (!symbol || price <= 0) return null;

  // Fake mini-trend if you don't have history.
  // If later you add real "history" array, just swap it in.
  // const spark = useMemo(() => makeSparklineData(price, change), [price, change]);

  const spark = useMemo(
  () => makeSparklineData(price, changeNum, symbol),
  [price, changeNum, symbol]
);


const trendLabel =
  changeNum == null
    ? "No data"
    : changeNum > 1
    ? "Strong uptrend"
    : changeNum > 0
    ? "Uptrend"
    : changeNum < -1
    ? "Strong downtrend"
    : "Downtrend";


  return (
    <div className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Symbol + watch */}
        <div className="col-span-12 md:col-span-3 flex items-center gap-3">
          <button
            onClick={() => onToggleWatch(symbol)}
            className={`p-1.5 rounded-lg border transition ${
              watched
                ? "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-200"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star size={14} className={watched ? "fill-current" : ""} />
          </button>

          <div>
            <div className="font-semibold">{symbol}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
              Vol: {volume ? volume.toLocaleString() : "—"}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="col-span-4 md:col-span-2">
          <div className="font-medium">${price.toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
            {isUp ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        </div>

        {/* Change */}
        <div className="col-span-4 md:col-span-2 hidden md:block">
          <span className={`font-semibold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
            {isUp ? "" : ""}
            {/* {change.toFixed(2)}% */}
             {formatPercent(changeNum, { alwaysSign: true })}
          </span>
        </div>

        {/* Sparkline */}

        <div className="col-span-8 md:col-span-3">
  <div className="w-full">
    <div className="text-[10px] text-gray-400 mb-1 leading-none">
      {trendLabel}
    </div>

    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={spark}>
          <Line
            type="monotone"
            dataKey="v"
            dot={false}
            strokeWidth={2}
            stroke={isUp ? "#10b981" : "#ef4444"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

        {/* <div className="col-span-8 md:col-span-3">
          <div className="h-10 w-full">
            <div className="text-[10px] text-gray-400 mb-1">{trendLabel}</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark}>
                <Line
                  type="monotone"
                  dataKey="v"
                  dot={false}
                  strokeWidth={2}
                  // NOTE: not setting explicit colors would be ideal, but Recharts needs a stroke.
                  stroke={isUp ? "#10b981" : "#ef4444"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Volume */}
        <div className="col-span-12 md:col-span-2 text-right hidden md:block">
          <div className="text-sm font-medium">
            {volume ? volume.toLocaleString() : "—"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Volume</div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Watchlist Panel ============================ */

function WatchlistPanel({ watchlist, onRemove, onPick }) {
  if (!watchlist?.length) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold inline-flex items-center gap-2">
          <Star size={16} className="text-yellow-500" /> Watchlist
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {watchlist.length} symbols
        </span>
      </div>

      <div className="p-4 flex flex-wrap gap-2">
        {watchlist.map((sym) => (
          <div
            key={sym}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
          >
            <button
              onClick={() => onPick(sym)}
              className="text-sm font-semibold hover:underline"
              title="Search this symbol"
            >
              {sym}
            </button>

            <button
              onClick={() => onRemove(sym)}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterNote() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-6">
        Prices shown are for learning/demo use. Add “Quote” endpoint later for realtime quote page + history.
      </div>
    </div>
  );
}

/* ============================ Sparkline Generator ============================ */

// function makeSparklineData(price, changePercent) {
//   // Creates a tiny synthetic curve (so UI looks premium even without history API).
//   // When you add real history, replace this with actual points.
//   const base = Math.max(1, Number(price) || 1);
//   const c = Number(changePercent) || 0;

//   // 20 points
//   const n = 20;
//   const drift = (c / 100) * base;
//   const start = base - drift;

//   // random-ish but stable curve
//   const seed = hashToFloat(String(base) + ":" + String(c));
//   const data = [];

//   let v = start;
//   for (let i = 0; i < n; i++) {
//     const t = i / (n - 1);
//     const noise = (seed - 0.5) * 0.25 * base * 0.02;
//     const step = (drift / (n - 1)) + noise * (Math.sin(i * 0.9) * 0.6);
//     v = v + step;
//     data.push({ i, v: Number(v.toFixed(2)) });
//   }
//   return data;
// }

function makeSparklineData(price, changePercent, seedKey) {
  const base = Math.max(1, Number(price) || 1);
  const c = Number(changePercent) || 0;

  const n = 20;
  const drift = (c / 100) * base;
  const start = base - drift;

  const seed = hashToFloat(seedKey + ":" + base + ":" + c);
  const data = [];

  let v = start;
  for (let i = 0; i < n; i++) {
    const noise = (seed - 0.5) * base * 0.01;
    v += drift / (n - 1) + noise * Math.sin(i * 0.7);
    data.push({ i, v: Number(v.toFixed(2)) });
  }

  return data;
}


function hashToFloat(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 0..1
  return (h >>> 0) / 4294967295;
}
