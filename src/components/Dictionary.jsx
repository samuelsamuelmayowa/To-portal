import { useState } from "react";
import { Search } from "lucide-react";

const SplunkDictionary = () => {
  const [search, setSearch] = useState("");

  const terms = [
    {
      term: "Index",
      definition: "A place where Splunk stores ingested data.",
      interview: "Difference between index and sourcetype?",
      example: "index=security | stats count",
      level: "Beginner",
      category: "Splunk Fundamentals"
    },
    {
      term: "Forwarder",
      definition: "Sends logs from source machines to Splunk indexers.",
      interview: "Difference between Universal and Heavy Forwarder?",
      example: "Used on Linux servers",
      level: "Intermediate",
      category: "Splunk Architecture"
    },
    {
      term: "Search Head",
      definition: "Component where users run searches and see dashboards.",
      interview: "Difference between Search Head and Indexer?",
      example: "Users interact on search head",
      level: "Beginner",
      category: "Architecture"
    }
  ];

  const filtered = terms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#0f172a] text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-cyan-400 mb-4">
        Splunk Dictionary
      </h1>

      <div className="flex items-center bg-[#1e293b] px-4 py-3 rounded-xl mb-6 max-w-md">
        <Search className="text-cyan-400 mr-2" />
        <input
          placeholder="Search Splunk terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none w-full text-white"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item, index) => (
          <div key={index} className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
            <h2 className="text-xl text-cyan-400 font-semibold">
              {item.term}
            </h2>

            <p className="mt-2 text-gray-300">
              {item.definition}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              💼 Interview: {item.interview}
            </p>

            <p className="text-sm text-gray-500 mt-1">
               Level: {item.level}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SplunkDictionary;
