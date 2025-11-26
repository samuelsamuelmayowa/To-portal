import { useState } from "react";
import { Search } from "lucide-react";
import DashboardDropdown from "./Dropdown";

const COMMANDS = [
  // ================= SEARCH COMMANDS =================
  {
    name: "chart / timechart",
    description: "Tabular / time-series chart output",
    category: "Search Commands",
  },
  {
    name: "dedup",
    description: "Remove duplicate events",
    category: "Search Commands",
  },
  {
    name: "eval",
    description: "Create or modify fields",
    category: "Search Commands",
  },
  {
    name: "fields",
    description: "Include or exclude fields",
    category: "Search Commands",
  },
  {
    name: "head / tail",
    description: "First or last N results",
    category: "Search Commands",
  },
  {
    name: "lookup",
    description: "Add fields from lookup tables",
    category: "Search Commands",
  },
  { name: "rename", description: "Rename fields", category: "Search Commands" },
  {
    name: "rex",
    description: "Extract fields using regex",
    category: "Search Commands",
  },
  { name: "search", description: "Filter events", category: "Search Commands" },
  { name: "sort", description: "Sort results", category: "Search Commands" },
  {
    name: "stats",
    description: "Aggregate statistics",
    category: "Search Commands",
  },
  {
    name: "mstats",
    description: "Metrics version of stats",
    category: "Search Commands",
  },
  {
    name: "table",
    description: "Show only specific fields",
    category: "Search Commands",
  },
  {
    name: "top / rare",
    description: "Most / least common values",
    category: "Search Commands",
  },
  {
    name: "transaction",
    description: "Group events",
    category: "Search Commands",
  },
  {
    name: "where",
    description: "Eval-based filtering",
    category: "Search Commands",
  },

  // ================= EVAL FUNCTIONS =================
  { name: "abs(X)", description: "Absolute value", category: "Eval Functions" },
  {
    name: "case()",
    description: "Conditional branching",
    category: "Eval Functions",
  },
  {
    name: "ceil(X)",
    description: "Ceiling integer",
    category: "Eval Functions",
  },
  {
    name: "cidrmatch()",
    description: "Match IP in CIDR",
    category: "Eval Functions",
  },
  {
    name: "coalesce()",
    description: "First non-null",
    category: "Eval Functions",
  },
  { name: "cos(X)", description: "Cosine", category: "Eval Functions" },
  { name: "exp(X)", description: "e^X", category: "Eval Functions" },
  {
    name: "if(X,Y,Z)",
    description: "Conditional logic",
    category: "Eval Functions",
  },
  {
    name: "in()",
    description: "Check value in list",
    category: "Eval Functions",
  },
  {
    name: "isbool / isint / isnull",
    description: "Type checks",
    category: "Eval Functions",
  },
  { name: "len(X)", description: "String length", category: "Eval Functions" },
  {
    name: "like(X,Y)",
    description: "Wildcard match",
    category: "Eval Functions",
  },
  { name: "log(X,Y)", description: "Logarithm", category: "Eval Functions" },
  { name: "lower(X)", description: "Lowercase", category: "Eval Functions" },
  {
    name: "ltrim / rtrim",
    description: "Trim characters",
    category: "Eval Functions",
  },
  { name: "match()", description: "Regex match", category: "Eval Functions" },
  {
    name: "max(X,...)",
    description: "Returns maximum",
    category: "Eval Functions",
  },
  {
    name: "md5(X)",
    description: "Returns MD5 hash",
    category: "Eval Functions",
  },
  {
    name: "min(X,...)",
    description: "Returns minimum",
    category: "Eval Functions",
  },
  {
    name: "mvcount(X)",
    description: "Number of values",
    category: "Eval Functions",
  },
  {
    name: "mvfilter(X)",
    description: "Filters multivalued field",
    category: "Eval Functions",
  },
  {
    name: "mvindex(X,Y,Z)",
    description: "Subset of multivalued field",
    category: "Eval Functions",
  },
  {
    name: "mvjoin(X,Y)",
    description: "Join multivalued field",
    category: "Eval Functions",
  },
  {
    name: "now()",
    description: "Current Unix time",
    category: "Eval Functions",
  },
  { name: "null()", description: "Returns NULL", category: "Eval Functions" },
  {
    name: "nullif(X,Y)",
    description: "Returns X if different from Y",
    category: "Eval Functions",
  },
  {
    name: "random()",
    description: "Random number generator",
    category: "Eval Functions",
  },
  {
    name: "relative_time(X,Y)",
    description: "Apply relative time to epoch",
    category: "Eval Functions",
  },
  {
    name: "round(X,Y)",
    description: "Round number",
    category: "Eval Functions",
  },
  {
    name: "split(X,Y)",
    description: "Split string into multivalue",
    category: "Eval Functions",
  },
  { name: "sqrt(X)", description: "Square root", category: "Eval Functions" },
  {
    name: "strftime(X,Y)",
    description: "Epoch to formatted string",
    category: "Eval Functions",
  },
  {
    name: "strptime(X,Y)",
    description: "Parse string to epoch",
    category: "Eval Functions",
  },
  {
    name: "substr(X,Y,Z)",
    description: "Substring from position",
    category: "Eval Functions",
  },
  {
    name: "time()",
    description: "Wall clock time",
    category: "Eval Functions",
  },
  {
    name: "tonumber(X,Y)",
    description: "String to number",
    category: "Eval Functions",
  },
  {
    name: "tostring(X,Y)",
    description: "Convert to string",
    category: "Eval Functions",
  },
  {
    name: "typeof(X)",
    description: "Returns field type",
    category: "Eval Functions",
  },
  {
    name: "urldecode(X)",
    description: "Decode URL",
    category: "Eval Functions",
  },
  {
    name: "validate(X,Y,...)",
    description: "Validation logic",
    category: "Eval Functions",
  },

  // ================= STATS FUNCTIONS =================
  { name: "avg(X)", description: "Average", category: "Stats Functions" },
  {
    name: "count(X)",
    description: "Count events",
    category: "Stats Functions",
  },
  { name: "dc(X)", description: "Distinct count", category: "Stats Functions" },
  {
    name: "earliest(X)",
    description: "Earliest value/time",
    category: "Stats Functions",
  },
  {
    name: "latest(X)",
    description: "Latest value/time",
    category: "Stats Functions",
  },
  {
    name: "median(X)",
    description: "Median value",
    category: "Stats Functions",
  },
  { name: "percX(Y)", description: "Percentile", category: "Stats Functions" },
  { name: "range(X)", description: "Max - Min", category: "Stats Functions" },
  {
    name: "stdev / stdevp",
    description: "Standard deviation",
    category: "Stats Functions",
  },
  { name: "sum(X)", description: "Sum of values", category: "Stats Functions" },
  {
    name: "values(X)",
    description: "Distinct list",
    category: "Stats Functions",
  },

  // ================= REGEX =================
  { name: "\\s", description: "Whitespace", category: "Regex Reference" },
  { name: "\\S", description: "Non-whitespace", category: "Regex Reference" },
  { name: "\\d", description: "Digit", category: "Regex Reference" },
  { name: "\\D", description: "Non-digit", category: "Regex Reference" },
  { name: "\\w", description: "Word character", category: "Regex Reference" },
  {
    name: "\\W",
    description: "Non-word character",
    category: "Regex Reference",
  },
  { name: "*", description: "Zero or more", category: "Regex Reference" },
  { name: "+", description: "One or more", category: "Regex Reference" },
  { name: "?", description: "Optional", category: "Regex Reference" },
  { name: "^", description: "Start of line", category: "Regex Reference" },
  { name: "$", description: "End of line", category: "Regex Reference" },

  // ================= TIME FORMATS =================
  { name: "%H", description: "Hour (00–23)", category: "Date & Time Formats" },
  { name: "%M", description: "Minute", category: "Date & Time Formats" },
  { name: "%S", description: "Seconds", category: "Date & Time Formats" },
  { name: "%Y", description: "Year full", category: "Date & Time Formats" },
  { name: "%y", description: "Year short", category: "Date & Time Formats" },
  { name: "%m", description: "Month", category: "Date & Time Formats" },
  { name: "%d", description: "Day of month", category: "Date & Time Formats" },
  { name: "%p", description: "AM / PM", category: "Date & Time Formats" },
  {
    name: "%z",
    description: "Timezone offset",
    category: "Date & Time Formats",
  },
  { name: "%Z", description: "Timezone name", category: "Date & Time Formats" },
  {
    name: "%s",
    description: "Seconds since 1970",
    category: "Date & Time Formats",
  },
];

const Commands = () => {
  const [search, setSearch] = useState("");
 const [darkMode, setDarkMode] = useState(false);
  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 mt-20">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow flex items-center justify-between">
          {/* LEFT SIDE - TITLE */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              To-Analytics Learning Portal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Professional Splunk Bootcamp Dashboard
            </p>
          </div>

          {/* RIGHT SIDE - ACTIONS */}
          <div className="flex items-center gap-4">
            {/* User Email */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {userEmail}
            </div>

            {/* Profile Button */}
            {/* <button
                   onClick={() => setProfileOpen(true)}
                   className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                 >
                   My Profile
                 </button> */}

            <DashboardDropdown />
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1 rounded text-sm 
             bg-gray-200 text-gray-800 
             dark:bg-gray-800 dark:text-white
             hover:opacity-90 transition"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-cyan-400 pt-10">
        Splunk Command Explorer
      </h1>

      {/* Search */}
      <div className="flex items-center bg-[#1e293b] p-3 rounded-xl mb-6 max-w-md">
        <Search className="text-cyan-400 mr-2" size={18} />
        <input
          type="text"
          placeholder="Search command, regex, function..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent w-full outline-none text-white placeholder:text-gray-500"
        />
      </div>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((cmd, index) => (
          <div
            key={index}
            className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition"
          >
            <h3 className="text-cyan-400 text-lg font-semibold">{cmd.name}</h3>
            <p className="text-sm text-gray-300 mt-1">{cmd.description}</p>
            <p className="text-xs text-gray-500 mt-2">{cmd.category}</p>
          </div>
        ))}
      </div>

      {/* Document preview */}
      <div className="mt-10">
        {/* <h2 className="text-xl mb-3 text-cyan-400">📖 Original Reference Document</h2>
        <div className="h-[400px] rounded-xl overflow-hidden border border-slate-700">
          <iframe
            src="/mnt/data/splunk_reference_tables.pdf"
            title="Splunk Reference"
            className="w-full h-full"
          ></iframe>
        </div> */}
      </div>
    </div>
  );
};

export default Commands;

// import { useState, useEffect } from "react";
// import DashboardDropdown from "./Dropdown";

// const Commands = () => {
//   const [assignment, setAssignment] = useState(null);
//   const [selectedDoc, setSelectedDoc] = useState(null);

//   useEffect(() => {
//     // Example assignment data
//     const data = {
//       title: "Splunk Commands",
//       description:
//         "Read all the documents below carefully and complete the required tasks.",
//       docs: [
//         // {
//         //   id: 1,
//         //   title: "Assignment Instructions",
//         //   url: "https://drive.google.com/file/d/1bf5cRkcEC3yDJ5MnzpRKDpRLhRhdUH90/preview",
//         //   dueDate: "2025-11-08",
//         // },
//         // {
//         //   id: 2,
//         //   title: "Sample Log Files",
//         //   url: "https://drive.google.com/file/d/1swg7fD7Q6DEO_E8PQZTIiPCrNtikWlSK/preview",
//         //   dueDate: "2025-11-09",
//         // },
//         // {
//         //   id: 3,
//         //   title: "Submission Template",
//         //   url: "https://drive.google.com/file/d/1zExampleTemplate123/preview",
//         //   dueDate: "2025-11-10",
//         // },
//           {
//            id: 4,
//           title: "Splunk Commands ",
//           url: "https://drive.google.com/file/d/1jAkmrbTWQApPg7qg43bBfAe4bEg8o0VT/preview",
//         //   dueDate: "2025-11-8",

//         },
//         //   {
//         //   id: 5,
//         //   title: "Splunk class 3 Assignment",
//         //   url: " https://drive.google.com/file/d/179_DKTqGoGjBrszOPRCJqGu3VFlXUbXe/preview",
//         //   dueDate: "2025-11-10",
//         // },
//       ],

//     };

//     setAssignment(data);
//     setSelectedDoc(data.docs[0]);
//   }, []);

//   if (!assignment) return <p>Loading assignment...</p>;

//   return (
//     <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
//     <DashboardDropdown/>

//       <h1 className="text-2xl font-bold text-gray-800">📝 Commands</h1>

//       <div className="bg-white shadow-md rounded-2xl p-6">
//         <h2 className="text-xl font-semibold text-gray-800 mb-2">
//           {assignment.title}
//         </h2>
//         <p className="text-gray-700 mb-3">{assignment.description}</p>

//         {/* === MULTIPLE PDF BUTTONS === */}
//         <div className="flex flex-wrap gap-3 mb-4">
//           {assignment.docs.map((doc) => (
//             <button
//               key={doc.id}
//               onClick={() => setSelectedDoc(doc)}
//               className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                 selectedDoc?.id === doc.id
//                   ? "bg-blue-600 text-white shadow"
//                   : "bg-gray-100 hover:bg-gray-200"
//               }`}
//             >
//               {doc.title}
//             </button>
//           ))}
//         </div>

//         {/* === PDF VIEWER === */}
//         <div className="w-full h-[600px] rounded-xl overflow-hidden border">
//           {selectedDoc && (
//             <iframe
//               src={selectedDoc.url}
//               title={selectedDoc.title}
//               className="w-full h-full"
//               frameBorder="0"
//               allowFullScreen
//             ></iframe>
//           )}
//         </div>

//         {/* === DETAILS BELOW VIEWER === */}
//         {selectedDoc && (
//           <div className="mt-3 text-sm text-gray-600 space-y-1">
//             <p>
//               <span className="font-semibold">Document:</span>{" "}
//               {selectedDoc.title}
//             </p>
//             <p>
//               <span className="font-semibold">Due Date:</span>{" "}
//               {selectedDoc.dueDate}
//             </p>
//             <p>
//               <span className="font-semibold">Open in new tab:</span>{" "}
//               <a
//                 href={selectedDoc.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 underline break-words"
//               >
//                 {selectedDoc.url}
//               </a>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Commands
