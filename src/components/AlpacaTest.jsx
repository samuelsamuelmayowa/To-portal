import { useState } from "react";
import {
  supabase,
  ensureVisitorSession,
} from "../supabaseClient";

export default function AlpacaTest() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const testAlpacaConnection = async () => {
    setLoading(true);
    setQuote(null);
    setErrorMessage("");

    try {
      // Make sure every visitor has a Supabase session.
      await ensureVisitorSession();

      const { data, error } = await supabase.functions.invoke(
        "stock-quote",
        {
          body: {
            symbol: "AAPL",
          },
        }
      );

      if (error) {
        throw new Error(
          error.message || "The stock quote function failed."
        );
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setQuote(data);
      console.log("AAPL quote:", data);
    } catch (error) {
      console.error("Alpaca test failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to retrieve the stock price."
      );
    } finally {
      setLoading(false);
    }
  };

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
        className="px-5 py-3 font-semibold text-white bg-purple-600 rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Getting price..." : "Test AAPL Price"}
      </button>

      {errorMessage && (
        <div className="p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
          {errorMessage}
        </div>
      )}

   {quote && (
  <div className="p-4 mt-4 space-y-2 bg-green-100 rounded-lg">
    <p>
      <strong>Symbol:</strong> {quote.symbol}
    </p>

    <p>
      <strong>Current price:</strong>{" "}
      {quote.marketPrice != null
        ? `$${Number(quote.marketPrice).toFixed(2)}`
        : "Unavailable"}
    </p>

    <p>
      <strong>Change:</strong>{" "}
      <span
        className={
          Number(quote.change) >= 0
            ? "text-green-700"
            : "text-red-700"
        }
      >
        {Number(quote.change) >= 0 ? "+" : ""}
        ${Number(quote.change).toFixed(2)}
        {" ("}
        {Number(quote.changePercent) >= 0 ? "+" : ""}
        {Number(quote.changePercent).toFixed(2)}%)
      </span>
    </p>

    <p>
      <strong>Open:</strong>{" "}
      ${Number(quote.open).toFixed(2)}
    </p>

    <p>
      <strong>High:</strong>{" "}
      ${Number(quote.high).toFixed(2)}
    </p>

    <p>
      <strong>Low:</strong>{" "}
      ${Number(quote.low).toFixed(2)}
    </p>

    <p>
      <strong>Previous close:</strong>{" "}
      ${Number(quote.previousClose).toFixed(2)}
    </p>

    <p>
      <strong>Volume:</strong>{" "}
      {Number(quote.volume).toLocaleString()}
    </p>

    <p>
      <strong>Feed:</strong>{" "}
      {quote.feed?.toUpperCase() || "Unavailable"}
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


// import { useState } from "react";
// // import { createClient } from "@supabase/supabase-js";

// // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error(
//     "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY."
//   );
// }

// // const supabase = createClient(supabaseUrl, supabaseKey);


// import {
//   supabase,
//   ensureVisitorSession,
// } from "../supabaseClient";

// export default function AlpacaTest() {
//   const [loading, setLoading] = useState(false);
//   const [quote, setQuote] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");
// await ensureVisitorSession();

// const { data, error } = await supabase.functions.invoke(
//   "stock-quote",
//   {
//     body: {
//       symbol: "AAPL",
//     },
//   }
// );
//   const testAlpacaConnection = async () => {
//   setLoading(true);
//   setQuote(null);
//   setErrorMessage("");

//   try {
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


//   return (
//     <div className="p-6 bg-white rounded-xl shadow-md">
//       <h2 className="mb-2 text-xl font-bold">
//         Alpaca Connection Test
//       </h2>

//       <p className="mb-4 text-gray-600">
//         Test the current Apple stock quote.
//       </p>

//       <button
//         type="button"
//         onClick={testAlpacaConnection}
//         disabled={loading}
//         className="px-5 py-3 font-semibold text-white bg-purple-600 rounded-lg disabled:opacity-50"
//       >
//         {loading ? "Getting price..." : "Test AAPL Price"}
//       </button>

//       {errorMessage && (
//         <div className="p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
//           {errorMessage}
//         </div>
//       )}

//       {quote && (
//         <div className="p-4 mt-4 bg-green-100 rounded-lg">
//           <p>
//             <strong>Symbol:</strong> {quote.symbol}
//           </p>

//           <p>
//             <strong>Ask price:</strong>{" "}
//             {quote.askPrice != null
//               ? `$${Number(quote.askPrice).toFixed(2)}`
//               : "Unavailable"}
//           </p>

//           <p>
//             <strong>Bid price:</strong>{" "}
//             {quote.bidPrice != null
//               ? `$${Number(quote.bidPrice).toFixed(2)}`
//               : "Unavailable"}
//           </p>

//           <p>
//             <strong>Feed:</strong> {quote.feed}
//           </p>

//           <p>
//             <strong>Updated:</strong>{" "}
//             {quote.timestamp
//               ? new Date(quote.timestamp).toLocaleString()
//               : "Unavailable"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }