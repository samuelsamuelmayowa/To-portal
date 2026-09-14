import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default function AlpacaTest() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const testAlpacaConnection = async () => {
  setLoading(true);
  setQuote(null);
  setErrorMessage("");

  try {
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

    if (data?.error) {
      throw new Error(data.error);
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
  // const testAlpacaConnection = async () => {
  //   setLoading(true);
  //   setQuote(null);
  //   setErrorMessage("");

  //   try {
  //     const {
  //       data: { session },
  //       error: sessionError,
  //     } = await supabase.auth.getSession();

  //     if (sessionError) {
  //       throw sessionError;
  //     }

  //     if (!session) {
  //       throw new Error(
  //         "You must log in before testing the stock price."
  //       );
  //     }

  //     const { data, error } = await supabase.functions.invoke(
  //       "stock-quote",
  //       {
  //         body: {
  //           symbol: "AAPL",
  //         },
  //       }
  //     );

  //     if (error) {
  //       throw error;
  //     }

  //     if (data?.error) {
  //       throw new Error(data.error);
  //     }

  //     setQuote(data);
  //     console.log("AAPL quote:", data);
  //   } catch (error) {
  //     console.error("Alpaca test failed:", error);

  //     setErrorMessage(
  //       error?.message || "Unable to retrieve the stock price."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="mb-2 text-xl font-bold">
        Alpaca Connection Test
      </h2>

      <p className="mb-4 text-gray-600">
        Test the current Apple stock quote.
      </p>

      <button
        type="button"
        onClick={testAlpacaConnection}
        disabled={loading}
        className="px-5 py-3 font-semibold text-white bg-purple-600 rounded-lg disabled:opacity-50"
      >
        {loading ? "Getting price..." : "Test AAPL Price"}
      </button>

      {errorMessage && (
        <div className="p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
          {errorMessage}
        </div>
      )}

      {quote && (
        <div className="p-4 mt-4 bg-green-100 rounded-lg">
          <p>
            <strong>Symbol:</strong> {quote.symbol}
          </p>

          <p>
            <strong>Ask price:</strong>{" "}
            {quote.askPrice != null
              ? `$${Number(quote.askPrice).toFixed(2)}`
              : "Unavailable"}
          </p>

          <p>
            <strong>Bid price:</strong>{" "}
            {quote.bidPrice != null
              ? `$${Number(quote.bidPrice).toFixed(2)}`
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