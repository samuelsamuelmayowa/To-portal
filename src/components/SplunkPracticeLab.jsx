import { useState } from "react";
// import { internalLogs } from "./data/internalLogs";
import { internalLogs } from "../data/internalLogs";
// import Logs
import { LOGS } from "../data/logs";
import { runSPL } from "../utils/splEngine";
// import { runSPL } from "./utils/runSPL";
// import { runSPL } from "../utils/runSPL";
export default function SplunkPracticeLab() {
  const [query, setQuery] = useState("index=_internal");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const runSearch = () => {
    const res = runSPL(query, LOGS);
    if (res?.error) {
      setError(res.error);
      setResults([]);
    } else {
      setError("");
      setResults(res);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">🧪 Splunk Practice Lab</h1>
      <p className="text-gray-400 mb-6">
        Simulated live Splunk environment for learning SPL
      </p>

      {/* Search Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl flex gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none font-mono text-sm"
        />
        <button
          onClick={runSearch}
          className="bg-cyan-600 px-5 py-2 rounded-lg text-sm"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-600/20 border border-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="bg-[#1b1f2a] rounded-xl p-4">
        <div className="text-sm text-gray-400 mb-2">
          Showing {results.length} results
        </div>

        {results.length === 0 ? (
          <p className="text-gray-500">No results</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-left">
                {Object.keys(results[0]).map((k) => (
                  <th key={k} className="pb-2">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i} className="border-t border-gray-700">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="py-2">{String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
