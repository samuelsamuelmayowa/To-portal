import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AlpacaTest() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const testAlpacaConnection = async () => {
    setLoading(true);
    setQuote(null);
    setErrorMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "You must log in before testing the stock price."
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "stock-quote",
        {
          body: {
            symbol: "AAPL",
          },
        }
      );

      if (error) {
        throw error;
      }

      setQuote(data);
      console.log("AAPL quote:", data);
    } catch (error) {
      console.error("Alpaca test failed:", error);

      setErrorMessage(
        error?.message || "Unable to retrieve the stock price."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-2">
        Alpaca Connection Test
      </h2>

      <p className="text-gray-600 mb-4">
        Test the current Apple stock quote.
      </p>

      <button
        type="button"
        onClick={testAlpacaConnection}
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-purple-600 text-white font-semibold disabled:opacity-50"
      >
        {loading ? "Getting price..." : "Test AAPL Price"}
      </button>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      {quote && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p>
            <strong>Symbol:</strong> {quote.symbol}
          </p>

          <p>
            <strong>Ask price:</strong>{" "}
            {quote.askPrice !== null
              ? `$${quote.askPrice}`
              : "Unavailable"}
          </p>

          <p>
            <strong>Bid price:</strong>{" "}
            {quote.bidPrice !== null
              ? `$${quote.bidPrice}`
              : "Unavailable"}
          </p>

          <p>
            <strong>Feed:</strong> {quote.feed}
          </p>

          <p>
            <strong>Updated:</strong>{" "}
            {quote.timestamp
              ? new Date(quote.timestamp).toLocaleString()
              : "Unavailable"}
          </p>
        </div>
      )}
    </div>
  );
}