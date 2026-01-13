// components/quote/QuoteHeader.jsx
export default function QuoteHeader({ quote }) {
  const changeUp = quote.change >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
      <h1 className="text-3xl font-bold">{quote.symbol}</h1>

      <div className="flex items-end gap-4 mt-2">
        <span className="text-4xl font-bold">
          ${quote.price.toFixed(2)}
        </span>

        <span
          className={`text-lg font-semibold ${
            changeUp ? "text-green-500" : "text-red-500"
          }`}
        >
          {changeUp ? "+" : ""}
          {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
