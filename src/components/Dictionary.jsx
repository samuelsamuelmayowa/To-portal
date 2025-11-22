import React, { useMemo, useState } from "react";
import DashboardDropdown from "./Dropdown";
import {
  Search,
  Sun,
  Moon,
  Copy,
  Sparkles,
  BookOpenCheck,
  BrainCircuit,
  Filter,
  HelpCircle,
} from "lucide-react";

const TERMS = [
  // ======== ARCHITECTURE ========
  {
    term: "Indexer",
    definition: "Splunk component that receives, indexes, and stores data.",
    student:
      "Think of the indexer as the 'database' where all your logs end up.",
    workplace:
      "Production environments often have indexer clusters for high availability and performance.",
    interview:
      "Q: What is the difference between a Search Head and an Indexer?\nA: The Indexer stores and indexes data, the Search Head runs searches and presents results.",
    example: "A bank uses 6 indexers to handle security and application logs.",
    level: "Intermediate",
    category: "Architecture",
  },
  {
    term: "Search Head",
    definition:
      "Splunk component where users run searches, create dashboards, and interact with data.",
    student:
      "This is the web interface where you type SPL, build reports, and view dashboards.",
    workplace:
      "Search Head Clusters are used for high availability and to share knowledge objects.",
    interview:
      "Q: What happens if an indexer is down but the search head is up?\nA: You can still log in and run searches, but results may be incomplete or slow.",
    example:
      "SOC analysts log into the search head to investigate incidents using SPL.",
    level: "Beginner",
    category: "Architecture",
  },
  {
    term: "Forwarder (Universal Forwarder)",
    definition: "Lightweight Splunk agent that sends data to indexers.",
    student:
      "Installed on servers to collect logs and ship them to Splunk, but doesn’t do heavy parsing.",
    workplace:
      "Thousands of universal forwarders may be deployed across Linux/Windows servers.",
    interview:
      "Q: Difference between Universal Forwarder and Heavy Forwarder?\nA: UF only forwards (minimal parsing), HF can parse, filter, and route data.",
    example:
      "UF on a web server sends access.log to indexers in the security environment.",
    level: "Intermediate",
    category: "Data Ingestion",
  },
  {
    term: "Heavy Forwarder",
    definition:
      "Full Splunk instance used as a forwarder with parsing and filtering capabilities.",
    student:
      "Heavier than a UF — can do transforms, filtering, and routing before data reaches indexers.",
    workplace:
      "Used for complex routing, filtering sensitive fields, or applying props/transforms centrally.",
    interview:
      "Q: When would you use a Heavy Forwarder?\nA: When you need advanced parsing, routing, or integration (e.g., syslog aggregation).",
    example:
      "HF receives firewall syslog and routes different sourcetypes to different indexes.",
    level: "Advanced",
    category: "Data Ingestion",
  },
  {
    term: "Sourcetype",
    definition: "Describes the format and structure of incoming data.",
    student:
      "It tells Splunk 'what kind of log this is' (e.g., apache:access, wineventlog).",
    workplace:
      "Good sourcetype naming and configuration makes field extraction and correlation easier.",
    interview:
      "Q: Why is sourcetype important?\nA: It controls how data is parsed, what fields are extracted, and how CIM mappings work.",
    example:
      "sourcetype=access_combined for Apache web logs with standard fields.",
    level: "Beginner",
    category: "Data Ingestion",
  },
  {
    term: "Index",
    definition: "Logical repository where Splunk stores indexed data.",
    student:
      "Like a separate 'bucket' for different data types: security, app, infra, etc.",
    workplace:
      "Indexes are used for access control (roles), retention, and performance tuning.",
    interview:
      "Q: Why split data into multiple indexes?\nA: For security (RBAC), different retention, and faster searches.",
    example:
      "index=security for SOC logs, index=web for website traffic, index=winevents for Windows logs.",
    level: "Beginner",
    category: "Architecture",
  },

  // ======== SPL & COMMANDS ========
  {
    term: "stats",
    definition:
      "SPL command used to calculate aggregate statistics over events.",
    student:
      "Use it to get counts, sums, averages, min/max, etc., grouped by fields.",
    workplace:
      "Used heavily in dashboards and reports for KPIs, error counts, user metrics.",
    interview:
      "Q: Difference between stats and eventstats?\nA: stats collapses events into a new table; eventstats adds aggregates back to each event.",
    example: "index=web | stats count BY status",
    level: "Beginner",
    category: "SPL & Commands",
  },
  {
    term: "eval",
    definition: "Creates or modifies fields using expressions or functions.",
    student:
      "Think of it like a calculator that can build new fields on the fly.",
    workplace:
      "Used everywhere: cleaning fields, building flags (is_error), classifying events.",
    interview:
      "Q: What are common eval functions?\nA: if, case, len, tostring, coalesce, round, now, etc.",
    example: `... | eval is_error = if(status>=500, 1, 0)`,
    level: "Beginner",
    category: "SPL & Commands",
  },
  {
    term: "where",
    definition: "Filters results using eval-style Boolean expressions.",
    student:
      "Similar to search, but allows more complex logic using field values and functions.",
    workplace:
      "Common in security use cases when you need expression-based filtering.",
    interview:
      "Q: Difference between search and where?\nA: search is keyword-based and simple operators; where uses eval expressions and functions.",
    example: `... | where status>=500 AND like(uri, "/api%")`,
    level: "Intermediate",
    category: "SPL & Commands",
  },
  {
    term: "timechart",
    definition:
      "Creates a time-based statistical chart, typically used in line charts.",
    student:
      "Use it when you want values over time, e.g., errors per minute or log volume per hour.",
    workplace:
      "Most dashboards with trends use timechart for visualizing metrics.",
    interview:
      "Q: When would you use stats vs timechart?\nA: stats for generic tables; timechart when you specifically need time-based buckets.",
    example: `index=web | timechart count BY status`,
    level: "Intermediate",
    category: "SPL & Commands",
  },
  {
    term: "rex",
    definition: "Extracts fields using regular expressions.",
    student:
      "Use rex when automatic field extraction doesn't get what you need.",
    workplace:
      "Critical for ad-hoc parsing and quick extractions in investigations.",
    interview:
      "Q: When do you use rex vs field extractions in props.conf?\nA: rex for search-time ad-hoc extraction; props for reusable, production-grade extraction.",
    example: `... | rex "user=(?<username>[^ ]+)"`,
    level: "Intermediate",
    category: "SPL & Commands",
  },
  {
    term: "transaction",
    definition: "Groups related events into a single transaction based on fields.",
    student:
      "Use it to combine login events, session events, or multi-step flows.",
    workplace:
      "Powerful but can be expensive; often replaced with stats-based approaches.",
    interview:
      "Q: When would you avoid transaction?\nA: On very large datasets due to performance; use stats with sessionization instead.",
    example:
      "index=web | transaction JSESSIONID maxspan=30m",
    level: "Advanced",
    category: "SPL & Commands",
  },

  // ======== DASHBOARDS & VISUALIZATION ========
  {
    term: "Token (Dashboard Token)",
    definition:
      "A variable used in Splunk dashboards to pass values between inputs, searches, and panels.",
    student:
      "Tokens make dashboards interactive: time pickers, dropdowns, drilldowns.",
    workplace:
      "Used in enterprise dashboards to control filters, environment switching, and drilldowns.",
    interview:
      "Q: What is the difference between input tokens and drilldown tokens?\nA: Input tokens come from form inputs; drilldown tokens come from clicking on panels.",
    example:
      "Using $server$ token from a dropdown to filter searches: index=web host=$server$",
    level: "Intermediate",
    category: "Dashboards",
  },
  {
    term: "Base Search",
    definition:
      "A primary search used in a dashboard panel that other panels can reuse via post-process searches.",
    student:
      "One main search that runs once, then multiple panels refine it without rerunning everything.",
    workplace:
      "Reduces load by avoiding duplicated long searches across panels.",
    interview:
      "Q: Why use base searches?\nA: Performance and efficiency in dashboards with multiple related visualizations.",
    example:
      "Base search gets all events; child searches use stats/timechart for specific outputs.",
    level: "Advanced",
    category: "Dashboards",
  },
  {
    term: "Drilldown",
    definition:
      "Dashboard interaction where clicking one panel opens another search, panel, or dashboard.",
    student:
      "Click on a bar and jump into detailed events or another dashboard.",
    workplace:
      "Common in SOC workflows: high-level summary → drilldown into raw events.",
    interview:
      "Q: Name examples of drilldown actions.\nA: Set tokens, open a new dashboard, link to external URLs, show raw events.",
    example:
      "Clicking on a src_ip opens another dashboard filtered by that IP.",
    level: "Intermediate",
    category: "Dashboards",
  },

  // ======== SECURITY / SOC / SIEM ========
  {
    term: "Notable Event",
    definition:
      "An event generated by ES correlation searches to highlight potential security issues.",
    student:
      "Think of it as an alert in the ES Incident Review dashboard.",
    workplace:
      "SOC analysts triage notable events for true/false positives and incident handling.",
    interview:
      "Q: What generates notable events?\nA: Correlation searches in Splunk Enterprise Security.",
    example:
      "Multiple failed logins followed by a success from a new country creates a notable.",
    level: "Intermediate",
    category: "Security / ES",
  },
  {
    term: "Correlation Search",
    definition:
      "Scheduled or real-time search in Enterprise Security that detects suspicious patterns.",
    student:
      "A saved SPL search that looks for bad behavior and creates notable events.",
    workplace:
      "Core of ES detection content; mapped to MITRE techniques.",
    interview:
      "Q: What makes a good correlation search?\nA: Clear purpose, low false positives, mapped to use case, and tunable.",
    example:
      "Detection of lateral movement by correlating authentication and endpoint logs.",
    level: "Advanced",
    category: "Security / ES",
  },

  // ======== TROUBLESHOOTING ========
  {
    term: "btool",
    definition:
      "Splunk CLI utility to view the combined, effective configuration from all conf files.",
    student:
      "Use it when configs are not behaving as expected (e.g., props, transforms).",
    workplace:
      "Important for debugging complex environments with many app layers.",
    interview:
      "Q: When would you use btool?\nA: To see which settings are actually applied after app/priority merges.",
    example:
      "splunk btool props list --debug",
    level: "Advanced",
    category: "Troubleshooting",
  },
  {
    term: "splunkd",
    definition: "The main Splunk server daemon that handles most Splunk operations.",
    student:
      "The core Splunk service — if splunkd is down, Splunk is essentially down.",
    workplace:
      "Monitoring splunkd logs is essential for health and performance troubleshooting.",
    interview:
      "Q: Where do you check when Splunk behaves strangely?\nA: splunkd.log on the relevant instance.",
    example:
      "$SPLUNK_HOME/var/log/splunk/splunkd.log",
    level: "Intermediate",
    category: "Troubleshooting",
  },
];

const LEVEL_COLORS = {
  Beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Intermediate: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  Advanced: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40",
};

const CATEGORIES = [
  "All",
  "Architecture",
  "SPL & Commands",
  "Data Ingestion",
  "Dashboards",
  "Security / ES",
  "Troubleshooting",
];

const SplunkDictionary = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isDark, setIsDark] = useState(true);
  const [quizTerm, setQuizTerm] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredTerms = useMemo(() => {
    return TERMS.filter((t) => {
      const matchesCategory =
        category === "All" || t.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, category]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleCopy = async (item) => {
    const text = [
      `Term: ${item.term}`,
      `Definition: ${item.definition}`,
      `Student view: ${item.student}`,
      `Workplace view: ${item.workplace}`,
      `Interview: ${item.interview}`,
      `Example: ${item.example}`,
      `Level: ${item.level}`,
      `Category: ${item.category}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard ✅");
    } catch {
      alert("Could not copy. Please copy manually.");
    }
  };

  const startQuiz = () => {
    if (!TERMS.length) return;
    const randomIndex = Math.floor(Math.random() * TERMS.length);
    setQuizTerm(TERMS[randomIndex]);
    setShowAnswer(false);
  };

  const containerClasses = isDark
    ? "min-h-screen bg-[#020617] text-slate-100"
    : "min-h-screen bg-slate-50 text-slate-900";

  const cardClasses = (extra = "") =>
    isDark
      ? `bg-[#020617]/70 border border-slate-700 shadow-md ${extra}`
      : `bg-white border border-slate-200 shadow-sm ${extra}`;

  return (
    <div className={containerClasses + " p-6"}>
      <DashboardDropdown />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/40 mb-2">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>T.O Analytics · Splunk Bootcamp</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <BookOpenCheck className="h-8 w-8 text-cyan-400" />
            Splunk Dictionary
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
            A practical Splunk terms dictionary for students, job interviews, and
            real-world work. Search, learn, copy, and quiz yourself in one place.
          </p>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={
            (isDark
              ? "bg-slate-800 border-slate-600 text-slate-100"
              : "bg-white border-slate-200 text-slate-900") +
            " inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium shadow-sm"
          }
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Light mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-500" />
              <span>Dark mode</span>
            </>
          )}
        </button>
      </header>

      {/* Controls */}
      <section className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className={cardClasses("flex-1 flex items-center px-4 py-3 rounded-2xl")}>
          <Search
            className={
              "h-5 w-5 mr-2 " +
              (isDark ? "text-cyan-400" : "text-cyan-600")
            }
          />
          <input
            type="text"
            placeholder="Search Splunk terms, e.g. indexer, stats, token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={
              "w-full bg-transparent outline-none text-sm md:text-base " +
              (isDark ? "placeholder:text-slate-500" : "placeholder:text-slate-400")
            }
          />
        </div>

        {/* Category filter */}
        <div
          className={cardClasses(
            "flex items-center gap-2 px-4 py-3 rounded-2xl"
          )}
        >
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={
              "bg-transparent outline-none text-sm md:text-base flex-1 " +
              (isDark ? "text-slate-100" : "text-slate-900")
            }
          >
            {CATEGORIES.map((c) => (
              <option
                key={c}
                value={c}
                className={isDark ? "bg-slate-900" : "bg-white"}
              >
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Quiz launcher */}
        <button
          onClick={startQuiz}
          className={
            "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold " +
            (isDark
              ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white shadow-lg"
              : "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md")
          }
        >
          <BrainCircuit className="h-4 w-4" />
          Quiz me
        </button>
      </section>

      {/* Quiz area */}
      {quizTerm && (
        <section className={cardClasses("mb-6 rounded-2xl p-4 md:p-5")}>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-400">
              Quick Quiz
            </span>
          </div>
          <p className="text-sm md:text-base font-semibold mb-2">
            What is: <span className="text-cyan-400">{quizTerm.term}</span>?
          </p>
          <p className="text-xs md:text-sm text-slate-400 mb-3">
            Think about the definition, where it's used, and a simple example.
          </p>
          {showAnswer ? (
            <div
              className={
                "mt-2 rounded-xl px-3 py-3 text-xs md:text-sm " +
                (isDark ? "bg-slate-900/80" : "bg-slate-100")
              }
            >
              <p className="font-semibold mb-1">Definition</p>
              <p className="mb-1">{quizTerm.definition}</p>
              <p className="font-semibold mt-2 mb-1">Workplace</p>
              <p className="mb-1">{quizTerm.workplace}</p>
              <p className="font-semibold mt-2 mb-1">Interview angle</p>
              <pre className="whitespace-pre-wrap text-xs">
                {quizTerm.interview}
              </pre>
            </div>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowAnswer((v) => !v)}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium border " +
                (isDark
                  ? "border-slate-600 hover:border-slate-400"
                  : "border-slate-300 hover:border-slate-500")
              }
            >
              {showAnswer ? "Hide answer" : "Show answer"}
            </button>
            <button
              onClick={startQuiz}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium " +
                (isDark
                  ? "bg-cyan-600 hover:bg-cyan-500"
                  : "bg-cyan-500 hover:bg-cyan-400") +
                " text-white"
              }
            >
              Next question
            </button>
          </div>
        </section>
      )}

      {/* Main list */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-10">
        {filteredTerms.map((item) => (
          <article
            key={item.term}
            className={cardClasses(
              "rounded-2xl p-4 md:p-5 flex flex-col justify-between"
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-lg md:text-xl font-semibold">
                  {item.term}
                </h2>
                <span
                  className={
                    "px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border " +
                    (LEVEL_COLORS[item.level] || LEVEL_COLORS.Beginner)
                  }
                >
                  {item.level}
                </span>
              </div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                {item.category}
              </p>

              <p className="text-sm md:text-[15px] mb-2">
                {item.definition}
              </p>

              <div className="space-y-1.5 text-xs md:text-sm text-slate-400">
                <p>
                  <span className="font-semibold text-slate-300">
                    🎓 Student:
                  </span>{" "}
                  {item.student}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">
                    🏢 Workplace:
                  </span>{" "}
                  {item.workplace}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">
                    💼 Interview:
                  </span>
                  <br />
                  <span className="whitespace-pre-wrap">
                    {item.interview}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-300">
                    💡 Example:
                  </span>{" "}
                  {item.example}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(item)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border " +
                  (isDark
                    ? "border-slate-600 hover:border-cyan-500"
                    : "border-slate-300 hover:border-cyan-500")
                }
              >
                <Copy className="h-3 w-3" />
                Copy cheat sheet
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Extra: Link to command reference */}
      <section className={cardClasses("rounded-2xl p-4 md:p-5")}>
        <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold mb-1">
          <BookOpenCheck className="h-4 w-4 text-cyan-400" />
          Splunk Command Reference (PDF)
        </h3>
        <p className="text-xs md:text-sm text-slate-400 mb-2">
          For quick reference of SPL commands, eval functions, stats functions,
          regex, and time formats.
        </p>
        <a
          href="https://drive.google.com/file/d/1jAkmrbTWQApPg7qg43bBfAe4bEg8o0VT/preview"
          target="_blank"
          rel="noreferrer"
          className={
            "inline-flex items-center gap-1 text-xs md:text-sm font-medium underline " +
            (isDark ? "text-cyan-300" : "text-cyan-700")
          }
        >
          Open Splunk reference PDF
        </a>
      </section>
    </div>
  );
};

export default SplunkDictionary;
