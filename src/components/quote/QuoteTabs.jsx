import { useState } from "react";
// import QuoteNews from "./QuoteNews";
// import QuoteOverview from "./QuoteOverview";
// import QuoteHistory from "./QuoteHistory";
import QuoteHistory from "./QuoteHistory";
import QuoteOverview from "./QuoteOverview";
import QuoteNews from "./QuoteNews";


export default function QuoteTabs({ symbol }) {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <div className="flex gap-6 border-b border-gray-700 mb-4">
        {["overview", "news", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-semibold ${
              tab === t
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && <QuoteOverview symbol={symbol} />}
      {tab === "news" && <QuoteNews symbol={symbol} />}
      {tab === "history" && <QuoteHistory symbol={symbol} />}
    </>
  );
}

// // components/quote/QuoteTabs.jsx
// import { useState } from "react";
// import QuoteNews from "./QuoteNews";

// export default function QuoteTabs({ symbol }) {
//   const [tab, setTab] = useState("overview");

//   return (
//     <>
//       <div className="flex gap-4 border-b">
//         {["overview", "news", "history"].map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`pb-2 ${
//               tab === t ? "border-b-2 border-blue-500" : ""
//             }`}
//           >
//             {t.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {tab === "news" && <QuoteNews symbol={symbol} />}
//     </>
//   );
// }
