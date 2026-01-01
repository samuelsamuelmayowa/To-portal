import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import DashboardDropdown from "./components/Dropdown";

// Single all-in-one Massive dashboard for US stocks + options + news
export default function MassiveStockDashboard({ defaultSymbol = "AAPL" }) {
  const API_KEY = import.meta.env.VITE_MASSIVE_API_KEY || "YOUR_MASSIVE_API_KEY";
  const BASE_URL = "https://api.massive.com";
    const [assignment, setAssignment] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
  
    useEffect(() => {
      const e = localStorage.getItem("user") || "";
      setUserEmail(e);
    });

  const [symbol, setSymbol] = useState(defaultSymbol.toUpperCase());
  const [inputSymbol, setInputSymbol] = useState(defaultSymbol.toUpperCase());

  const [company, setCompany] = useState(null);
  const [lastTrade, setLastTrade] = useState(null);
  const [bars, setBars] = useState([]); // OHLC
  const [optionsChain, setOptionsChain] = useState([]);
  const [news, setNews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simple check so we don't call Massive without a key
  const hasApiKey = Boolean(API_KEY && API_KEY !== "YOUR_MASSIVE_API_KEY");

  useEffect(() => {
    if (!hasApiKey) return;
    fetchAllForSymbol(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      // Try to read error body but don't crash if it's not JSON
      let message = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch (_) {}
      throw new Error(message);
    }
    return res.json();
  }

  async function fetchAllForSymbol(sym) {
    setLoading(true);
    setError("");
    setCompany(null);
    setLastTrade(null);
    setBars([]);
    setOptionsChain([]);
    setNews([]);

    const upper = sym.toUpperCase();

    // Date range for candles: last ~90 days
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    const toStr = to.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);

    try {
      const [
        companyRes,
        lastTradeRes,
        barsRes,
        optionsRes,
        newsRes,
      ] = await Promise.allSettled([
        // Ticker overview
        fetchJson(
          `${BASE_URL}/v3/reference/tickers/${upper}?apiKey=${API_KEY}`
        ),
        // Latest trade
        fetchJson(
          `${BASE_URL}/v2/last/trade/${upper}?apiKey=${API_KEY}`
        ),
        // Custom OHLC bars (daily)
        fetchJson(
          `${BASE_URL}/v2/aggs/ticker/${upper}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${API_KEY}`
        ),
        // Options chain snapshot (requires Options plan)
        fetchJson(
          `${BASE_URL}/v3/snapshot/options/${upper}?limit=100&apiKey=${API_KEY}`
        ),
        // News for ticker
        fetchJson(
          `${BASE_URL}/v2/reference/news?ticker=${upper}&limit=10&order=desc&sort=published_utc&apiKey=${API_KEY}`
        ),
      ]);

      // --- Company ---
      if (companyRes.status === "fulfilled") {
        setCompany(companyRes.value?.results || null);
      }

      // --- Last trade ---
      if (lastTradeRes.status === "fulfilled") {
        const data = lastTradeRes.value;
        // Massive last-trade shape is usually { status, results: { p, s, t, ... } }
        const lt = data.results || data.last || null;
        setLastTrade(lt);
      }

      // --- OHLC bars ---
      if (barsRes.status === "fulfilled") {
        const data = barsRes.value;
        const rawBars = data.results || [];
        const mapped = rawBars.map((b) => ({
          x: new Date(b.t), // timestamp in ms
          y: [b.o, b.h, b.l, b.c],
        }));
        setBars(mapped);
      }

      // --- Options chain ---
      if (optionsRes.status === "fulfilled") {
        const data = optionsRes.value;
        setOptionsChain(data.results || []);
      } else if (optionsRes.status === "rejected") {
        // Often this means you don't have an Options plan or permissions
        console.warn("Options error:", optionsRes.reason);
      }

      // --- News ---
      if (newsRes.status === "fulfilled") {
        const data = newsRes.value;
        setNews(data.results || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // Derived values
  const calls = optionsChain.filter(
    (o) => o.details?.contract_type?.toLowerCase() === "call"
  );
  const puts = optionsChain.filter(
    (o) => o.details?.contract_type?.toLowerCase() === "put"
  );

  const lastPrice = lastTrade?.p ?? lastTrade?.price ?? null;
  const lastSize = lastTrade?.s ?? lastTrade?.size ?? null;
  const lastTime =
    lastTrade?.t || lastTrade?.sip_timestamp || lastTrade?.participant_timestamp;

  const chartSeries = [
    {
      name: symbol,
      data: bars,
    },
  ];

  const chartOptions = {
    chart: {
      type: "candlestick",
      toolbar: { show: true },
      animations: { enabled: true },
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (inputSymbol.trim()) {
      setSymbol(inputSymbol.trim().toUpperCase());
    }
  }

  return (
    <div
      style={{
        // maxWidth: "100px",
        // margin: "2rem auto",
        padding: "1.5rem",
        borderRadius: "1rem",
        border: "1px solid #e5e7eb",
        background: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >

           {/* <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                      To-Analytics Stock and Options  Portal
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Professional Splunk Bootcamp Dashboard
                    </p>
                  </div>
        
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {userEmail}
                    </div>
        
                 
                    {DashboardDropdown && <DashboardDropdown />}
        
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="px-3 py-1 rounded-lg text-sm 
                    bg-gray-100 text-gray-800 
                    dark:bg-gray-800 dark:text-white
                    border border-gray-300 dark:border-gray-700
                    hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>
                </div>
              </div> */}
      {/* HEADER + SYMBOL INPUT */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            US Stocks & Options Dashboard
          </h1>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            Powered by Massive REST API — 
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <input
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            placeholder="AAPL, TSLA, SPY..."
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #4b5563",
              background: "#020617",
              color: "#e5e7eb",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "0.5rem",
              border: "none",
              background:
                "linear-gradient(135deg, rgba(59,130,246,1), rgba(147,51,234,1))",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Load
          </button>
        </form>
      </div>

      {!hasApiKey && (
        <div
          style={{
            background: "#fecaca22",
            border: "1px solid #f87171",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          Set <code>VITE_MASSIVE_API_KEY</code> in your <code>.env</code> file to
          start calling Massive from the frontend.
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#f9731622",
            border: "1px solid #f97316",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
          Loading data for <strong>{symbol}</strong>...
        </p>
      )}

      {/* TOP ROW: COMPANY + PRICE SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.5fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Company card */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1f2937",
            background:
              "linear-gradient(145deg, rgba(15,23,42,1), rgba(30,64,175,0.5))",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Company Overview
          </h2>
          {company ? (
            <>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {company.branding?.logo_url && (
                  <img
                    src={company.branding.logo_url}
                    alt={company.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      borderRadius: "999px",
                      background: "#020617",
                    }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {company.name} ({company.ticker})
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                    {company.sic_description || company.description || "—"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "0.75rem",
                  marginTop: "0.9rem",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <div style={{ opacity: 0.6 }}>Exchange</div>
                  <div>{company.primary_exchange || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6 }}>Market Cap</div>
                  <div>
                    {company.market_cap
                      ? `$${Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 2,
                        }).format(company.market_cap)}`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.6 }}>Employees</div>
                  <div>{company.total_employees || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6 }}>List Date</div>
                  <div>{company.list_date || "—"}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6 }}>Locale / Market</div>
                  <div>
                    {company.locale || "—"} / {company.market || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ opacity: 0.6 }}>Website</div>
                  {company.homepage_url ? (
                    <a
                      href={company.homepage_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#93c5fd" }}
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {loading ? "Loading company data..." : "No company data loaded yet."}
            </p>
          )}
        </div>

        {/* Price summary */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1f2937",
            background:
              "linear-gradient(145deg, rgba(15,23,42,1), rgba(16,185,129,0.4))",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Latest Trade
          </h2>
          {lastPrice ? (
            <>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  marginBottom: "0.25rem",
                }}
              >
                ${lastPrice.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.75rem" }}>
                Size: {lastSize || "—"} • Exchange ID:{" "}
                {lastTrade?.x ?? lastTrade?.exchange ?? "—"}
              </div>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Time:{" "}
                {lastTime
                  ? new Date(
                      String(lastTime).length > 13
                        ? Number(String(lastTime).slice(0, 13))
                        : Number(lastTime)
                    ).toLocaleString()
                  : "—"}
              </div>
              <p style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "0.5rem" }}>
                Note: On Stocks Starter, data is typically 15-minute delayed.
              </p>
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {loading ? "Loading last trade..." : "No trade data yet."}
            </p>
          )}
        </div>
      </div>

      {/* CANDLE CHART */}
      <div
        style={{
          padding: "1rem",
          borderRadius: "0.75rem",
          border: "1px solid #1f2937",
          background: "#020617",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Price Chart (Last ~90 Days)
        </h2>
        {bars.length > 0 ? (
          <Chart options={chartOptions} series={chartSeries} type="candlestick" height={360} />
        ) : (
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            {loading ? "Loading OHLC bars..." : "No bar data for this range."}
          </p>
        )}
      </div>

      {/* OPTIONS + NEWS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: "1rem",
        }}
      >
        {/* OPTIONS CHAIN */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1f2937",
            background: "#020617",
            minHeight: "260px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Options Chain Snapshot
          </h2>
          <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.75rem" }}>
            Requires an Options plan on Massive. Filtered here in the UI into Calls & Puts.
          </p>

          {optionsChain.length === 0 ? (
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {loading
                ? "Loading options chain..."
                : "No options data returned. Check your Options subscription or symbol."}
            </p>
          ) : (
            <div style={{ maxHeight: "320px", overflow: "auto", fontSize: "0.8rem" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "100%",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Strike</th>
                    <th style={thStyle}>Exp</th>
                    <th style={thStyle}>Last</th>
                    <th style={thStyle}>IV</th>
                    <th style={thStyle}>Δ</th>
                    <th style={thStyle}>Γ</th>
                    <th style={thStyle}>Θ</th>
                    <th style={thStyle}>Vega</th>
                    <th style={thStyle}>OI</th>
                  </tr>
                </thead>
                <tbody>
                  {optionsChain.map((opt, idx) => {
                    const d = opt.details || {};
                    const g = opt.greeks || {};
                    const lastQuote = opt.last_quote || {};
                    const lastTrade = opt.last_trade || {};
                    const last =
                      lastTrade?.price ??
                      lastTrade?.p ??
                      lastQuote?.mid ??
                      null;

                    return (
                      <tr key={idx}>
                        <td style={tdStyle}>
                          {(d.contract_type || "").toUpperCase()}
                        </td>
                        <td style={tdStyle}>{d.strike_price ?? "—"}</td>
                        <td style={tdStyle}>
                          {d.expiration_date
                            ? d.expiration_date
                            : "—"}
                        </td>
                        <td style={tdStyle}>
                          {last != null ? last.toFixed(2) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {opt.implied_volatility != null
                            ? (opt.implied_volatility * 100).toFixed(1) + "%"
                            : "—"}
                        </td>
                        <td style={tdStyle}>
                          {g.delta != null ? g.delta.toFixed(3) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {g.gamma != null ? g.gamma.toFixed(3) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {g.theta != null ? g.theta.toFixed(3) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {g.vega != null ? g.vega.toFixed(3) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {opt.open_interest ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* NEWS FEED */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #1f2937",
            background: "#020617",
            minHeight: "260px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Latest News for {symbol}
          </h2>
          {news.length === 0 ? (
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              {loading ? "Loading news..." : "No news returned for this ticker."}
            </p>
          ) : (
            <div style={{ maxHeight: "320px", overflow: "auto" }}>
              {news.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "0.6rem 0",
                    borderBottom: "1px solid #111827",
                    fontSize: "0.82rem",
                  }}
                >
                  <a
                    href={n.article_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: "#93c5fd",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {n.title}
                  </a>
                  <div style={{ opacity: 0.6, marginBottom: "0.25rem" }}>
                    {n.publisher?.name || "Unknown source"} •{" "}
                    {n.published_utc
                      ? new Date(n.published_utc).toLocaleString()
                      : ""}
                  </div>
                  {n.description && (
                    <div style={{ opacity: 0.75 }}>
                      {n.description.slice(0, 160)}
                      {n.description.length > 160 ? "..." : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "0.35rem 0.4rem",
  borderBottom: "1px solid #111827",
  position: "sticky",
  top: 0,
  background: "#020617",
  fontWeight: 600,
};

const tdStyle = {
  padding: "0.25rem 0.4rem",
  borderBottom: "1px solid #111827",
  whiteSpace: "nowrap",
};
