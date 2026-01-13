// pages/QuotePage.jsx
import { useParams } from "react-router-dom";
// import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockQuote } from "../hooks/useStockQuote";
// import QuoteHeader from "@/components/quote/QuoteHeader";
import QuoteHeader from "./quote/QuoteHeader";
// import QuoteChart from "@/components/quote/QuoteChart";
import QuoteChart from "./quote/QuoteChart";
// import QuoteStats from "@/components/quote/QuoteStats";
// import QuoteTabs from "@/components/quote/QuoteTabs";
import QuoteStats from "./quote/QuoteStats";
import QuoteTabs from "./quote/QuoteTabs";

export default function QuotePage() {
  const { symbol } = useParams();
  const { data, isLoading } = useStockQuote(symbol);

  if (isLoading) return <p className="p-6">Loading {symbol}…</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <QuoteHeader quote={data.quote} />
      <QuoteChart candles={data.candles} />
      <QuoteStats stats={data.stats} />
      <QuoteTabs symbol={symbol} />
    </div>
  );
}
