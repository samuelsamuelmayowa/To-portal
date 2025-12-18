import { useState } from "react";
// import { internalLogs } from "./data/internalLogs";
import { internalLogs } from "../data/internalLogs";
// import { runSPL } from "./utils/runSPL";
import { runSPL } from "../utils/runSPL";
export default function SplunkPracticeLab() {
  const [query, setQuery] = useState("index=_internal");
  const [results, setResults] = useState([]);

  const handleRun = () => {
    const output = runSPL(query, internalLogs);
    setResults(output);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 text-white">
      <h2 className="text-3xl font-bold mb-4">🧪 Splunk Practice Lab</h2>

      {/* Search Bar */}
      <div className="bg-[#0f172a] p-4 rounded-xl flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none font-mono text-sm"
        />
        <button
          onClick={handleRun}
          className="bg-cyan-600 px-4 py-2 rounded text-sm"
        >
          Search
        </button>
      </div>

      {/* Results */}
      <div className="mt-6 bg-[#1b1f2a] rounded-xl p-4">
        {results.length === 0 ? (
          <p className="text-gray-400">No results</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                {Object.keys(results[0]).map((k) => (
                  <th key={k} className="pb-2">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i} className="border-t border-gray-700">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="py-2">{v}</td>
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
