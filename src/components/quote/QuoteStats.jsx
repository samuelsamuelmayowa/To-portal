// components/quote/QuoteStats.jsx
export default function QuoteStats({ stats }) {
  const items = [
    ["Open", stats.open],
    ["High", stats.high],
    ["Low", stats.low],
    ["Volume", stats.volume?.toLocaleString()],
    ["Market Cap", `$${stats.marketCap}`],
    ["P/E", stats.peRatio],
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow"
        >
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-lg font-semibold">{value ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
