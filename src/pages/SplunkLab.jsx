import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { splunkLabApi } from "../services/splunkLabApi";
import AdvancedPractice from "../components/splunk/AdvancedPractice";

const CASES = [
  {
    id: "credential-storm",
    code: "INC-1042",
    title: "Credential Storm",
    subtitle: "Brute-force attack followed by account compromise",
    difficulty: "Intermediate",
    duration: 35,
    accent: "rose",
    briefing:
      "At 09:18 UTC, the identity team reported a spike in failed VPN logins. Determine the attacking source, affected user, and whether any login succeeded.",
    index: "auth",
    sourcetype: "vpn:auth",
    fields: ["_time", "user", "src_ip", "action", "country", "device"],
    events: [
      { _time: "09:14:02", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
      { _time: "09:14:19", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
      { _time: "09:14:41", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
      { _time: "09:15:03", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
      { _time: "09:15:22", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
      { _time: "09:15:55", user: "d.adeleke", src_ip: "185.220.101.44", action: "success", country: "NL", device: "Chrome/Linux" },
      { _time: "09:17:20", user: "m.okafor", src_ip: "102.89.33.18", action: "success", country: "NG", device: "Edge/Windows" },
    ],
    missions: [
      {
        id: "scope",
        title: "Scope failed authentication",
        instruction: "Search the authentication index for failed VPN events.",
        points: 20,
        required: ["index=auth", "action=failure"],
        recommended: ["sourcetype=vpn:auth"],
        result: [{ user: "d.adeleke", failures: 5, src_ip: "185.220.101.44" }],
        hint: "Start with index=auth and filter action to failure.",
        explanation: "Filtering the index and action early limits the events entering the pipeline.",
      },
      {
        id: "aggregate",
        title: "Identify targeted accounts",
        instruction: "Count failures by user and source IP, then keep accounts with at least five failures.",
        points: 30,
        required: ["index=auth", "action=failure", "stats", "count", "by", "user", "src_ip", "where"],
        anyOf: [[">=5", "> 4", ">4"]],
        result: [{ user: "d.adeleke", src_ip: "185.220.101.44", failures: 5 }],
        hint: "Use stats count AS failures BY user, src_ip, followed by where.",
        explanation: "stats creates the grouped evidence; where applies the detection threshold after aggregation.",
      },
      {
        id: "confirm",
        title: "Confirm compromise",
        instruction: "Show failure and success counts per user and source IP with conditional aggregation.",
        points: 35,
        required: ["index=auth", "stats", "count(eval", "action=", "failure", "success", "by", "user", "src_ip"],
        result: [{ user: "d.adeleke", src_ip: "185.220.101.44", failures: 5, successes: 1, verdict: "Likely compromised" }],
        hint: "Use count(eval(action=\"failure\")) and count(eval(action=\"success\")).",
        explanation: "Conditional aggregation preserves both sides of the authentication sequence in one result row.",
      },
    ],
    questions: [
      { id: "actor", label: "Malicious source IP", answer: "185.220.101.44", placeholder: "e.g. 10.0.0.5" },
      { id: "account", label: "Compromised account", answer: "d.adeleke", placeholder: "Username" },
    ],
    conclusion: "Five failures and one success from the same unfamiliar overseas IP strongly indicate credential compromise.",
  },
  {
    id: "powershell",
    code: "INC-1078",
    title: "Encoded PowerShell",
    subtitle: "Endpoint execution and command-line investigation",
    difficulty: "Advanced",
    duration: 45,
    accent: "violet",
    briefing:
      "EDR detected PowerShell on a finance workstation shortly after a document was opened. Find the suspicious command, its parent process, and the affected host.",
    index: "endpoint",
    sourcetype: "sysmon:xml",
    fields: ["_time", "host", "user", "Image", "ParentImage", "CommandLine", "EventCode"],
    events: [
      { _time: "11:02:11", host: "FIN-WS17", user: "a.bello", Image: "WINWORD.EXE", ParentImage: "explorer.exe", CommandLine: "WINWORD.EXE invoice.docm", EventCode: 1 },
      { _time: "11:02:17", host: "FIN-WS17", user: "a.bello", Image: "powershell.exe", ParentImage: "WINWORD.EXE", CommandLine: "powershell -nop -w hidden -enc SQBFAFgA", EventCode: 1 },
      { _time: "11:02:23", host: "FIN-WS17", user: "a.bello", Image: "rundll32.exe", ParentImage: "powershell.exe", CommandLine: "rundll32.exe C:\\ProgramData\\cache.dll,Start", EventCode: 1 },
      { _time: "11:03:05", host: "HR-WS04", user: "k.obi", Image: "powershell.exe", ParentImage: "explorer.exe", CommandLine: "powershell Get-Printer", EventCode: 1 },
    ],
    missions: [
      {
        id: "encoded",
        title: "Find encoded execution",
        instruction: "Find process-creation events containing encoded PowerShell switches.",
        points: 25,
        required: ["index=endpoint", "eventcode=1", "powershell"],
        anyOf: [["-enc", "encodedcommand", "*enc*"]],
        result: [{ host: "FIN-WS17", user: "a.bello", Image: "powershell.exe", ParentImage: "WINWORD.EXE" }],
        hint: "Search EventCode=1, powershell, and an encoded-command term such as *-enc*.",
        explanation: "Process creation logs expose executable, parent, and command-line context.",
      },
      {
        id: "extract",
        title: "Extract the encoded payload",
        instruction: "Use rex with a named group called encoded_payload to extract the value following -enc.",
        points: 35,
        required: ["index=endpoint", "rex", "?<encoded_payload>", "commandline", "-enc"],
        result: [{ host: "FIN-WS17", encoded_payload: "SQBFAFgA", parent: "WINWORD.EXE" }],
        hint: "Use | rex field=CommandLine \"-enc\\s+(?<encoded_payload>\\S+)\".",
        explanation: "rex performs search-time extraction; a named capture group becomes a result field.",
      },
      {
        id: "chain",
        title: "Build the process chain",
        instruction: "Create a chronological table containing time, host, user, parent, process, and command line.",
        points: 25,
        required: ["index=endpoint", "sort", "_time", "table", "host", "user", "parentimage", "image", "commandline"],
        result: [
          { _time: "11:02:11", parent: "explorer.exe", process: "WINWORD.EXE" },
          { _time: "11:02:17", parent: "WINWORD.EXE", process: "powershell.exe" },
          { _time: "11:02:23", parent: "powershell.exe", process: "rundll32.exe" },
        ],
        hint: "Filter to FIN-WS17, sort by _time, then use table with the requested fields.",
        explanation: "A chronological process tree explains how the suspicious activity began and what executed next.",
      },
    ],
    questions: [
      { id: "host", label: "Affected host", answer: "FIN-WS17", placeholder: "Hostname" },
      { id: "parent", label: "Suspicious parent process", answer: "WINWORD.EXE", placeholder: "Process name" },
    ],
    conclusion: "A macro-enabled Word document spawned hidden encoded PowerShell, which then launched rundll32 from ProgramData.",
  },
  {
    id: "exfiltration",
    code: "INC-1121",
    title: "Midnight Exfiltration",
    subtitle: "Proxy anomaly and outbound data investigation",
    difficulty: "Expert",
    duration: 50,
    accent: "cyan",
    briefing:
      "Network monitoring shows an unusual outbound transfer after midnight. Identify the host, destination, and volume, then write a useful detection query.",
    index: "proxy",
    sourcetype: "web:proxy",
    fields: ["_time", "src", "dest_domain", "bytes_out", "action", "user_agent"],
    events: [
      { _time: "00:41:02", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 188000000, action: "allowed", user_agent: "python-requests/2.31" },
      { _time: "00:43:14", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 244000000, action: "allowed", user_agent: "python-requests/2.31" },
      { _time: "00:47:51", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 221000000, action: "allowed", user_agent: "python-requests/2.31" },
      { _time: "00:55:09", src: "10.20.8.14", dest_domain: "updates.microsoft.com", bytes_out: 8400000, action: "allowed", user_agent: "WindowsUpdate" },
      { _time: "01:04:33", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 197000000, action: "allowed", user_agent: "python-requests/2.31" },
    ],
    missions: [
      {
        id: "volume",
        title: "Measure outbound volume",
        instruction: "Sum bytes sent by source and destination, convert the result to MB, and sort highest first.",
        points: 30,
        required: ["index=proxy", "stats", "sum(bytes_out)", "by", "src", "dest_domain", "eval"],
        anyOf: [["/1024/1024", "/ 1024 / 1024", "/1048576"]],
        result: [{ src: "10.20.5.77", dest_domain: "sync-storage.cc", outbound_mb: 810.62 }, { src: "10.20.8.14", dest_domain: "updates.microsoft.com", outbound_mb: 8.01 }],
        hint: "Use stats sum(bytes_out) AS total_bytes BY src, dest_domain, then eval outbound_mb=round(total_bytes/1024/1024,2).",
        explanation: "Aggregate raw bytes before converting units so the result reflects the complete transfer.",
      },
      {
        id: "timeline",
        title: "Plot the transfer timeline",
        instruction: "Create a 5-minute timechart of outbound bytes by destination domain.",
        points: 25,
        required: ["index=proxy", "timechart", "span=5m", "sum(bytes_out)", "by", "dest_domain"],
        result: [{ _time: "00:40", "sync-storage.cc": 432000000 }, { _time: "00:45", "sync-storage.cc": 221000000 }, { _time: "01:00", "sync-storage.cc": 197000000 }],
        hint: "Use | timechart span=5m sum(bytes_out) BY dest_domain.",
        explanation: "timechart returns time-series results and makes burst patterns visible.",
      },
      {
        id: "detect",
        title: "Author a reusable detection",
        instruction: "Find sources sending over 500 MB in an hour and retain source, destination, and total bytes.",
        points: 30,
        required: ["index=proxy", "bin", "_time", "span=1h", "stats", "sum(bytes_out)", "by", "src", "dest_domain", "where"],
        anyOf: [[">500", "> 500", ">524288000", "> 524288000"]],
        result: [{ hour: "00:00", src: "10.20.5.77", dest_domain: "sync-storage.cc", outbound_mb: 810.62, severity: "high" }],
        hint: "Bucket _time to one hour, aggregate bytes, convert to MB if needed, and apply the threshold with where.",
        explanation: "Time bucketing plus aggregation creates a reusable threshold-based exfiltration analytic.",
      },
    ],
    questions: [
      { id: "source", label: "Suspected source host/IP", answer: "10.20.5.77", placeholder: "IP address" },
      { id: "destination", label: "Suspicious destination", answer: "sync-storage.cc", placeholder: "Domain" },
    ],
    conclusion: "The host transferred roughly 811 MB to an uncommon domain with a scripting user-agent shortly after midnight.",
  },
];

const LEARNING_GUIDES = {
  scope: {
    concept: "Filter events using fields",
    plain: "An index is a collection of searchable data. A field filter keeps only events whose field has the value you request.",
    syntax: "index=<data> field=<value>",
    example: "index=shop status=cancelled",
    starter: "index=auth sourcetype=vpn:auth action=_____",
    checks: ["Choose the auth index", "Choose the vpn:auth log type", "Filter action to failed logins"],
  },
  aggregate: {
    concept: "Count and group related events",
    plain: "stats count calculates how many events belong to each group. BY user src_ip creates a separate row for each user and source address.",
    syntax: "| stats count AS <name> BY <fields>",
    example: "| stats count AS orders BY customer",
    starter: "index=auth action=failure\n| stats count AS failures BY _____ _____\n| where failures>=_____",
    checks: ["Keep failed events", "Group by user and source IP", "Keep counts of at least five"],
  },
  confirm: {
    concept: "Count different conditions in one row",
    plain: "count(eval(...)) counts only events that meet a condition. This lets you compare failures and successes for the same account.",
    syntax: "count(eval(field=\"value\")) AS name",
    example: "count(eval(status=\"error\")) AS errors",
    starter: "index=auth\n| stats count(eval(action=\"_____\")) AS failures, count(eval(action=\"_____\")) AS successes BY user src_ip",
    checks: ["Count failures", "Count successes", "Group both counts by user and source IP"],
  },
  encoded: {
    concept: "Find suspicious command-line text",
    plain: "Endpoint process events show which program ran and the command used to start it. Wildcards help find text inside a longer command line.",
    syntax: "index=<data> Field=value *search-term*",
    example: "index=endpoint EventCode=1 *script*",
    starter: "index=endpoint EventCode=1 powershell *_____*",
    checks: ["Search process-creation events", "Find PowerShell", "Look for its encoded-command switch"],
  },
  extract: {
    concept: "Extract text into a new field",
    plain: "rex applies a regular expression to a field. A named capture group creates a new searchable result field.",
    syntax: "| rex field=Field \"pattern(?<new_field>...)\"",
    example: "| rex field=message \"user=(?<username>\\S+)\"",
    starter: "index=endpoint powershell *-enc*\n| rex field=CommandLine \"-enc\\s+(?<encoded_payload>_____)\"",
    checks: ["Limit the search to encoded PowerShell", "Run rex on CommandLine", "Create encoded_payload"],
  },
  chain: {
    concept: "Build a chronological process story",
    plain: "sort arranges events, while table shows only the fields needed to explain what happened.",
    syntax: "| sort _time | table field1 field2",
    example: "| sort _time | table _time host process",
    starter: "index=endpoint host=FIN-WS17\n| sort _time\n| table _time _____ _____ _____ _____ _____",
    checks: ["Focus on the affected host", "Sort by time", "Display the requested process fields"],
  },
  volume: {
    concept: "Measure and convert transferred data",
    plain: "stats sum adds all outbound bytes. eval creates a new field and converts bytes into megabytes.",
    syntax: "| stats sum(field) AS total BY fields | eval mb=round(total/1024/1024,2)",
    example: "| stats sum(size) AS total BY host",
    starter: "index=proxy\n| stats sum(bytes_out) AS total_bytes BY _____ _____\n| eval outbound_mb=round(total_bytes/1024/1024,2)\n| sort - outbound_mb",
    checks: ["Sum outbound bytes", "Group by source and destination", "Convert bytes to MB"],
  },
  timeline: {
    concept: "See activity over time",
    plain: "timechart groups events into time buckets. span=5m creates one bucket every five minutes.",
    syntax: "| timechart span=5m sum(field) BY category",
    example: "| timechart span=5m count BY status",
    starter: "index=proxy\n| timechart span=_____ sum(_____) BY _____",
    checks: ["Use five-minute buckets", "Sum outbound bytes", "Split the chart by destination"],
  },
  detect: {
    concept: "Turn an investigation into a detection",
    plain: "bin creates hourly buckets, stats measures each bucket, and where keeps activity above the alert threshold.",
    syntax: "| bin _time span=1h | stats ... | where total>threshold",
    example: "| bin _time span=1h | stats count BY _time user",
    starter: "index=proxy\n| bin _time span=1h\n| stats sum(bytes_out) AS total_bytes BY _time src dest_domain\n| where total_bytes>_____",
    checks: ["Create hourly buckets", "Measure each source and destination", "Apply the 500 MB threshold"],
  },
};

const COMMAND_REFERENCE = [
  ["index=", "Chooses the dataset to search."],
  ["sourcetype=", "Chooses the format or source of the events."],
  ["field=value", "Keeps events with a matching field value."],
  ["|", "Sends results into the next SPL command."],
  ["stats", "Calculates counts, totals, averages, minimums, or maximums."],
  ["BY", "Creates a separate result for each field value."],
  ["where", "Filters calculated results."],
  ["eval", "Creates or calculates a new field."],
  ["rex", "Extracts text into a new field."],
  ["timechart", "Groups calculated results into time buckets."],
];

const cx = (...values) => values.filter(Boolean).join(" ");
const normalize = (value) => value.toLowerCase().replace(/[`']/g, '"').replace(/\s+/g, " ").trim();

function gradeQuery(query, mission) {
  const value = normalize(query);
  const missing = mission.required.filter((token) => !value.includes(token.toLowerCase()));
  const missingChoice = (mission.anyOf || []).filter((set) => !set.some((token) => value.includes(token.toLowerCase())));
  const recommendedMissing = (mission.recommended || []).filter((token) => !value.includes(token.toLowerCase()));
  if (!value) return { passed: false, score: 0, message: "Enter an SPL search before running it.", missing: mission.required.slice(0, 3) };
  if (missing.length || missingChoice.length) {
    const coverage = Math.max(0, mission.required.length - missing.length - missingChoice.length);
    return {
      passed: false,
      score: Math.round((coverage / (mission.required.length + (mission.anyOf || []).length)) * mission.points * 0.45),
      message: "The search ran, but it does not yet satisfy the mission objective.",
      missing: [...missing.slice(0, 3), ...missingChoice.map((set) => `one of: ${set.join(" / ")}`).slice(0, 1)],
    };
  }
  return {
    passed: true,
    score: mission.points,
    message: recommendedMissing.length ? "Mission passed. Add the recommended filter for a more efficient search." : "Mission passed. The SPL returns the required evidence.",
    missing: [],
    optimization: recommendedMissing,
  };
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-700 bg-slate-800/80 text-slate-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  };
  return <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", tones[tone])}>{children}</span>;
}

function Table({ rows }) {
  if (!rows?.length) return <p className="p-5 text-sm text-slate-500">No matching events.</p>;
  const columns = Object.keys(rows[0]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left font-mono text-xs">
        <thead className="border-y border-slate-800 bg-slate-950/70 text-slate-500">
          <tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-800/30">
              {columns.map((column) => <td key={column} className="max-w-[320px] whitespace-nowrap px-4 py-3 text-slate-300">{String(row[column])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModeSelector({ mode, onChange }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:grid-cols-2">
      {[{
        id: "learn", title: "Learn Mode", text: "Guided lessons, starter searches, command explanations, and locked progression.", badge: "Best for beginners",
      }, {
        id: "challenge", title: "SOC Challenge", text: "Minimal guidance, open mission navigation, and an assessment-style experience.", badge: "For experienced learners",
      }].map((item) => (
        <button key={item.id} type="button" onClick={() => onChange(item.id)} className={cx("rounded-xl border p-4 text-left transition", mode === item.id ? "border-violet-400 bg-violet-500/10" : "border-slate-800 bg-slate-950/50 hover:border-slate-600")}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">{item.badge}</span>
          <b className="mt-1 block">{item.title}</b>
          <span className="mt-1 block text-xs leading-5 text-slate-400">{item.text}</span>
        </button>
      ))}
    </div>
  );
}

function LearningPanel({ mission, onUseStarter }) {
  const guide = LEARNING_GUIDES[mission.id];
  const [open, setOpen] = useState(true);
  if (!guide) return null;
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-500/25 bg-cyan-500/5">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Learn before you search</p><h3 className="mt-1 font-extrabold">{guide.concept}</h3></div>
        <span className="text-cyan-300">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="grid gap-4 border-t border-cyan-500/20 p-5 lg:grid-cols-2">
        <div>
          <p className="text-sm leading-6 text-slate-300">{guide.plain}</p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Command pattern</p>
          <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-cyan-200">{guide.syntax}</code>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Unrelated example</p>
          <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-violet-200">{guide.example}</code>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your thinking checklist</p>
          <ol className="mt-3 space-y-2">{guide.checks.map((step, index) => <li key={step} className="flex gap-3 text-sm text-slate-300"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300">{index + 1}</span>{step}</li>)}</ol>
          <button type="button" onClick={() => onUseStarter(guide.starter)} className="mt-5 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20">Use starter search</button>
          <p className="mt-2 text-[11px] text-slate-500">Replace every _____ blank before running the search.</p>
        </div>
      </div>}
    </section>
  );
}

function CommandReference() {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between text-left"><div><h2 className="font-bold">SPL quick reference</h2><p className="mt-1 text-xs text-slate-500">Plain-language command help</p></div><span>{open ? "−" : "+"}</span></button>
      {open && <dl className="mt-4 space-y-3 border-t border-slate-800 pt-4">{COMMAND_REFERENCE.map(([command, explanation]) => <div key={command}><dt className="font-mono text-xs font-bold text-cyan-300">{command}</dt><dd className="mt-1 text-xs leading-5 text-slate-400">{explanation}</dd></div>)}</dl>}
    </section>
  );
}

function CasePicker({ onSelect, history, mode, onModeChange, onAdvanced }) {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/toskillab" className="flex items-center gap-3 font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-PURPLE to-violet-500">TO</span> Skill Lab</Link>
          <Badge tone="emerald">Simulator online</Badge>
        </header>
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl">
            <Badge tone="violet">Splunk SOC Workspace</Badge>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">Investigate real incidents.<br/><span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Prove your SPL skills.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Work through realistic security data, write searches in a simulated Splunk console, collect evidence, and submit a defensible analyst conclusion.</p>
          </div>
          <button onClick={onAdvanced} className="mt-8 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-6 py-5 text-left hover:bg-cyan-500/20"><span className="block text-xs font-bold uppercase tracking-widest text-cyan-300">New · Advanced practice</span><strong className="mt-2 block text-xl">Start your next analyst shift →</strong><span className="mt-2 block text-sm text-slate-300">21 tasks · event replay · real search results · investigation reports</span></button>
          <div className="mt-9 max-w-3xl"><ModeSelector mode={mode} onChange={onModeChange} /></div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {CASES.map((item, index) => {
              const completed = history[item.id];
              return (
                <motion.button key={item.id} type="button" onClick={() => onSelect(index)} whileHover={{ y: -6 }} className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-2xl shadow-black/20 transition hover:border-violet-500/50">
                  <div className="flex items-center justify-between"><Badge tone={item.accent}>{item.difficulty}</Badge><span className="font-mono text-xs text-slate-600">{item.code}</span></div>
                  <div className="my-8 grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-950 text-2xl">{index === 0 ? "⌁" : index === 1 ? ">_" : "↗"}</div>
                  <h2 className="text-xl font-extrabold">{item.title}</h2>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">{item.subtitle}</p>
                  <div className="mt-7 flex items-center justify-between border-t border-slate-800 pt-5 text-sm"><span className="text-slate-500">{item.duration} min · {item.missions.length} missions</span><span className="font-bold text-violet-300">{completed ? `${completed.score}% complete` : "Start case →"}</span></div>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function LabWorkspace({ caseData, onExit, onComplete, mode }) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [query, setQuery] = useState(`index=${caseData.index} sourcetype=${caseData.sourcetype}`);
  const [run, setRun] = useState(null);
  const [completed, setCompleted] = useState({});
  const [hints, setHints] = useState({});
  const [findings, setFindings] = useState({});
  const [tab, setTab] = useState("events");
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [connection, setConnection] = useState("connecting");
  const [running, setRunning] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const mission = caseData.missions[missionIndex];
  const learnMode = mode === "learn";

  useEffect(() => {
    let active = true;

    const startAttempt = async () => {
      setConnection("connecting");
      setApiMessage("");

      try {
        const attempt = await splunkLabApi.start(caseData.id);
        if (!active) return;
        setAttemptId(attempt.attemptId);
        setConnection("online");
      } catch (error) {
        if (!active) return;
        setAttemptId(null);
        setConnection("local");
        setApiMessage(
          error?.response?.data?.message ||
            "The online simulator is unavailable. Local practice mode is active."
        );
      }
    };

    startAttempt();
    return () => { active = false; };
  }, [caseData.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`toSplunkLab:${caseData.id}`);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setMissionIndex(parsed.missionIndex || 0);
      setCompleted(parsed.completed || {});
      setHints(parsed.hints || {});
      setFindings(parsed.findings || {});
    } catch { localStorage.removeItem(`toSplunkLab:${caseData.id}`); }
  }, [caseData.id]);

  useEffect(() => {
    localStorage.setItem(`toSplunkLab:${caseData.id}`, JSON.stringify({ missionIndex, completed, hints, findings }));
  }, [caseData.id, missionIndex, completed, hints, findings]);

  const runLocalSearch = () => {
    const grade = gradeQuery(query, mission);
    const result = { ...grade, rows: grade.passed ? mission.result : [] };
    setRun(result);
    if (grade.passed) {
      setCompleted((value) => ({
        ...value,
        [mission.id]: Math.max(value[mission.id] || 0, grade.score),
      }));
    }
  };

  const runSearch = async () => {
    if (!query.trim() || running) return;
    setRunning(true);
    setTab("results");
    setApiMessage("");

    if (!attemptId || connection !== "online") {
      runLocalSearch();
      setRunning(false);
      return;
    }

    try {
      const result = await splunkLabApi.run(
        attemptId,
        mission.key || mission.id,
        query
      );

      setRun({
        ...result,
        score: result.points || 0,
        rows: result.rows || [],
      });

      if (result.passed) {
        setCompleted((value) => ({
          ...value,
          [mission.id]: Math.max(
            value[mission.id] || 0,
            result.points || mission.points
          ),
        }));
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "The server could not run this search.";

      setRun({
        passed: false,
        score: 0,
        rows: [],
        message,
        command: error?.response?.data?.command,
      });
      setApiMessage(message);
    } finally {
      setRunning(false);
    }
  };

  const revealHint = async () => {
    const existing = Array.isArray(hints[mission.id])
      ? hints[mission.id]
      : hints[mission.id]
        ? [hints[mission.id]]
        : [];
    if (existing.length >= 3) return;

    if (attemptId && connection === "online") {
      try {
        const result = await splunkLabApi.hint(
          attemptId,
          mission.key || mission.id
        );
        setHints((value) => ({
          ...value,
          [mission.id]: [...existing, result.hint || mission.hint],
        }));
        return;
      } catch (error) {
        setApiMessage(
          error?.response?.data?.message ||
            "The online hint could not be loaded. Showing the local hint."
        );
      }
    }

    const guide = LEARNING_GUIDES[mission.id];
    const localHints = [
      guide?.plain,
      `Command pattern: ${guide?.syntax || mission.hint}`,
      mission.hint,
    ].filter(Boolean);
    setHints((value) => ({
      ...value,
      [mission.id]: [...existing, localHints[Math.min(existing.length, localHints.length - 1)]],
    }));
  };

  const missionPoints = Object.values(completed).reduce((sum, value) => sum + value, 0);
  const maxMissionPoints = caseData.missions.reduce((sum, item) => sum + item.points, 0);
  const correctFindings = caseData.questions.filter((item) => normalize(findings[item.id] || "") === normalize(item.answer)).length;
  const hintsUsed = Object.values(hints).reduce((total, value) => total + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
  const canSubmit = Object.keys(completed).length === caseData.missions.length && caseData.questions.every((item) => findings[item.id]?.trim());
  const score = Math.max(0, Math.round(((missionPoints + correctFindings * 15) / (maxMissionPoints + caseData.questions.length * 15)) * 100) - hintsUsed * 3);

  const submit = async () => {
    if (!canSubmit) return;

    if (attemptId && connection === "online") {
      try {
        await splunkLabApi.submit(attemptId);
      } catch (error) {
        setApiMessage(
          error?.response?.data?.message ||
            "Your result was saved on this device, but the server copy could not be completed."
        );
      }
    }

    setSubmitted(true);
    onComplete({ caseId: caseData.id, score, elapsed, completedAt: new Date().toISOString(), hintsUsed });
  };

  const clock = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  if (submitted) {
    const strong = score >= 80;
    return (
      <main className="min-h-screen bg-[#070b14] px-5 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-7 shadow-2xl sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-6"><div><Badge tone={strong ? "emerald" : score >= 60 ? "amber" : "rose"}>Case completed</Badge><h1 className="mt-4 text-3xl font-black">Investigation report</h1><p className="mt-2 text-slate-400">{caseData.code} · {caseData.title}</p></div><div className="grid h-28 w-28 place-items-center rounded-full border-8 border-violet-500/30 bg-violet-500/10"><div className="text-center"><b className="text-3xl">{score}%</b><span className="block text-[10px] uppercase tracking-widest text-slate-400">score</span></div></div></div>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">{[["SPL missions", `${Object.keys(completed).length}/${caseData.missions.length}`], ["Evidence accuracy", `${correctFindings}/${caseData.questions.length}`], ["Investigation time", clock]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6"><h2 className="font-bold text-violet-300">Analyst conclusion</h2><p className="mt-3 leading-7 text-slate-300">{caseData.conclusion}</p></section>
            <section className="mt-5 rounded-2xl border border-slate-800 p-6"><h2 className="font-bold">Hiring signal</h2><p className="mt-2 text-slate-400">{score >= 85 ? "Strong evidence of practical Splunk investigation ability. Ready for an advanced technical interview." : score >= 70 ? "Good investigation foundation. Review the missed evidence before a technical interview." : "Complete the case again without hints and strengthen SPL transformation commands."}</p></section>
            <div className="mt-8 flex flex-wrap gap-3"><button onClick={onExit} className="rounded-xl bg-violet-600 px-6 py-3 font-bold hover:bg-violet-500">Choose another case</button><button onClick={() => window.location.reload()} className="rounded-xl border border-slate-700 px-6 py-3 font-bold hover:bg-slate-800">Retry case</button></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <header className="border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4"><button onClick={onExit} className="text-sm font-bold text-slate-400 hover:text-white">← Case library</button><div className="hidden text-center sm:block"><p className="text-sm font-bold">{caseData.code} · {caseData.title}</p><p className="text-[11px] text-slate-500">{learnMode ? "Guided learning environment" : "Professional challenge environment"}</p></div><div className="flex items-center gap-3"><Badge tone={learnMode ? "cyan" : "violet"}>{learnMode ? "Learn" : "Challenge"}</Badge><span className="font-mono text-sm text-slate-300">{clock}</span></div></div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 p-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 xl:min-h-[calc(100vh-90px)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Investigation</p>
          <h1 className="mt-3 text-xl font-black">{caseData.title}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{caseData.briefing}</p>
          <div className="my-5 h-px bg-slate-800" />
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Missions</p>
          <div className="space-y-2">{caseData.missions.map((item, index) => {
            const locked = learnMode && index > 0 && !completed[caseData.missions[index - 1].id];
            return <button key={item.id} disabled={locked} onClick={() => { setMissionIndex(index); setRun(null); setTab("events"); }} className={cx("flex w-full gap-3 rounded-xl border p-3 text-left transition", index === missionIndex ? "border-violet-500/50 bg-violet-500/10" : "border-transparent hover:bg-slate-800/60", locked && "cursor-not-allowed opacity-45")}><span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold", completed[item.id] ? "bg-emerald-500 text-slate-950" : index === missionIndex ? "bg-violet-500" : "bg-slate-800 text-slate-500")}>{completed[item.id] ? "✓" : locked ? "🔒" : index + 1}</span><span><b className="block text-sm">{item.title}</b><small className="text-slate-500">{locked ? "Complete the previous mission" : `${item.points} points`}</small></span></button>;
          })}</div>
          <div className="mt-6 rounded-xl bg-slate-950/70 p-4"><div className="flex justify-between text-xs"><span className="text-slate-500">Case progress</span><b>{Object.keys(completed).length}/{caseData.missions.length}</b></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${(Object.keys(completed).length / caseData.missions.length) * 100}%` }} /></div></div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-300">Mission {missionIndex + 1}</p><h2 className="mt-1 text-lg font-bold">{mission.title}</h2></div><Badge tone={completed[mission.id] ? "emerald" : "amber"}>{completed[mission.id] ? "Passed" : `${mission.points} pts`}</Badge></div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{mission.instruction}</p>
          </div>

          {learnMode && <LearningPanel mission={mission} onUseStarter={setQuery} />}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b101b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3"><div className="flex gap-1.5"><i className="h-3 w-3 rounded-full bg-rose-500"/><i className="h-3 w-3 rounded-full bg-amber-400"/><i className="h-3 w-3 rounded-full bg-emerald-500"/></div><span className="font-mono text-xs text-slate-500">search & reporting</span><span className={cx("text-xs", connection === "online" ? "text-emerald-400" : connection === "connecting" ? "text-cyan-400" : "text-amber-400")}>{connection === "online" ? "● backend connected" : connection === "connecting" ? "● connecting" : "● local practice"}</span></div>
            <div className="p-4">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">SPL search</label>
              <textarea value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false} className="h-32 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-6 text-cyan-200 outline-none transition focus:border-violet-500" placeholder="index=... | stats ..." />
              {apiMessage && <p className="mt-2 text-xs text-amber-300">{apiMessage}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-slate-500">Time range: <b className="text-slate-300">Last 24 hours</b></div><button disabled={running || !query.trim()} onClick={runSearch} className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">{running ? "Running…" : "▶ Run search"}</button></div>
            </div>
            <div className="flex gap-1 border-y border-slate-800 px-4">{["events", "results"].map((item) => <button key={item} onClick={() => setTab(item)} className={cx("border-b-2 px-4 py-3 text-xs font-bold capitalize", tab === item ? "border-violet-400 text-white" : "border-transparent text-slate-500")}>{item} {item === "events" ? `(${caseData.events.length})` : run?.rows ? `(${run.rows.length})` : ""}</button>)}</div>
            <div className="min-h-[250px]">
              {tab === "events" ? <Table rows={caseData.events} /> : run ? <><div className={cx("m-4 rounded-xl border p-4 text-sm", run.passed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-amber-500/30 bg-amber-500/10 text-amber-100")}><b>{run.message}</b>{run.missing?.length > 0 && <p className="mt-2 text-xs opacity-80">Still needed: {run.missing.join(", ")}</p>}{run.optimization?.length > 0 && <p className="mt-2 text-xs opacity-80">Optimization: add {run.optimization.join(", ")}</p>}</div><Table rows={run.rows} /></> : <p className="p-8 text-center text-sm text-slate-500">Run your SPL to view mission results.</p>}
            </div>
          </div>

          <div className="flex justify-between gap-3"><button disabled={missionIndex === 0} onClick={() => { setMissionIndex((v) => v - 1); setRun(null); }} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold disabled:opacity-30">Previous</button><button disabled={!completed[mission.id] || missionIndex === caseData.missions.length - 1} onClick={() => { setMissionIndex((v) => v + 1); setRun(null); setTab("events"); }} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30">Next mission →</button></div>
        </section>

        <aside className="space-y-4">
          {learnMode && <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">How to use this lab</p><ol className="mt-3 space-y-2 text-xs leading-5 text-slate-300"><li>1. Read the learning card.</li><li>2. Inspect the raw events and fields.</li><li>3. Complete the starter search blanks.</li><li>4. Run the search and study the results.</li><li>5. Record evidence in the notebook.</li></ol></section>}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Data source</h2><Badge>{caseData.events.length} events</Badge></div><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-slate-500">index</dt><dd className="font-mono text-cyan-300">{caseData.index}</dd></div><div className="flex justify-between"><dt className="text-slate-500">sourcetype</dt><dd className="font-mono text-cyan-300">{caseData.sourcetype}</dd></div></dl><div className="mt-4 flex flex-wrap gap-1.5">{caseData.fields.map((field) => <span key={field} className="rounded bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-400">{field}</span>)}</div></section>
          {learnMode && <CommandReference />}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Analyst notebook</h2><span className="text-xs text-slate-500">Evidence</span></div><div className="mt-4 space-y-4">{caseData.questions.map((item) => <label key={item.id} className="block text-xs text-slate-400">{item.label}<input value={findings[item.id] || ""} onChange={(event) => setFindings((value) => ({ ...value, [item.id]: event.target.value }))} placeholder={item.placeholder} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-violet-500" /></label>)}</div></section>
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-amber-200">Progressive hints</h2><span className="text-xs text-amber-400">−3 pts each</span></div>{hints[mission.id] && <ol className="mt-3 space-y-2">{(Array.isArray(hints[mission.id]) ? hints[mission.id] : [hints[mission.id]]).map((hint, index) => <li key={`${hint}-${index}`} className="rounded-lg bg-slate-950/40 p-3 text-sm leading-6 text-amber-100/80"><b className="mr-2 text-amber-300">Hint {index + 1}:</b>{hint}</li>)}</ol>}<button onClick={revealHint} disabled={(Array.isArray(hints[mission.id]) ? hints[mission.id].length : hints[mission.id] ? 1 : 0) >= 3} className="mt-3 text-sm font-bold text-amber-300 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40">{hints[mission.id] ? "Reveal next hint" : "Reveal first hint"}</button></section>
          <button disabled={!canSubmit} onClick={submit} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-black shadow-lg shadow-violet-950/40 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-40">Submit investigation</button>
          {!canSubmit && <p className="text-center text-xs leading-5 text-slate-500">Complete every mission and fill in the evidence notebook to submit.</p>}
        </aside>
      </div>
    </main>
  );
}

export default function SplunkLab() {
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(() => localStorage.getItem("toSplunkLabMode") || "learn");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("toSplunkLabHistory") || "{}"); } catch { return {}; }
  });

  const changeMode = (nextMode) => {
    setMode(nextMode);
    localStorage.setItem("toSplunkLabMode", nextMode);
  };

  const complete = (result) => {
    setHistory((value) => {
      const next = { ...value, [result.caseId]: result };
      localStorage.setItem("toSplunkLabHistory", JSON.stringify(next));
      return next;
    });
  };

  if (advanced) return <AdvancedPractice onExit={() => setAdvanced(false)} />;

  return (
    <AnimatePresence mode="wait">
      {selected === null ? <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CasePicker onSelect={setSelected} history={history} mode={mode} onModeChange={changeMode} onAdvanced={() => setAdvanced(true)} /></motion.div> : <motion.div key={`${CASES[selected].id}-${mode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LabWorkspace caseData={CASES[selected]} onExit={() => setSelected(null)} onComplete={complete} mode={mode} /></motion.div>}
    </AnimatePresence>
  );
}



// import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { AnimatePresence, motion } from "framer-motion";

// const CASES = [
//   {
//     id: "credential-storm",
//     code: "INC-1042",
//     title: "Credential Storm",
//     subtitle: "Brute-force attack followed by account compromise",
//     difficulty: "Intermediate",
//     duration: 35,
//     accent: "rose",
//     briefing:
//       "At 09:18 UTC, the identity team reported a spike in failed VPN logins. Determine the attacking source, affected user, and whether any login succeeded.",
//     index: "auth",
//     sourcetype: "vpn:auth",
//     fields: ["_time", "user", "src_ip", "action", "country", "device"],
//     events: [
//       { _time: "09:14:02", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
//       { _time: "09:14:19", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
//       { _time: "09:14:41", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
//       { _time: "09:15:03", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
//       { _time: "09:15:22", user: "d.adeleke", src_ip: "185.220.101.44", action: "failure", country: "NL", device: "unknown" },
//       { _time: "09:15:55", user: "d.adeleke", src_ip: "185.220.101.44", action: "success", country: "NL", device: "Chrome/Linux" },
//       { _time: "09:17:20", user: "m.okafor", src_ip: "102.89.33.18", action: "success", country: "NG", device: "Edge/Windows" },
//     ],
//     missions: [
//       {
//         id: "scope",
//         title: "Scope failed authentication",
//         instruction: "Search the authentication index for failed VPN events.",
//         points: 20,
//         required: ["index=auth", "action=failure"],
//         recommended: ["sourcetype=vpn:auth"],
//         result: [{ user: "d.adeleke", failures: 5, src_ip: "185.220.101.44" }],
//         hint: "Start with index=auth and filter action to failure.",
//         explanation: "Filtering the index and action early limits the events entering the pipeline.",
//       },
//       {
//         id: "aggregate",
//         title: "Identify targeted accounts",
//         instruction: "Count failures by user and source IP, then keep accounts with at least five failures.",
//         points: 30,
//         required: ["index=auth", "action=failure", "stats", "count", "by", "user", "src_ip", "where"],
//         anyOf: [[">=5", "> 4", ">4"]],
//         result: [{ user: "d.adeleke", src_ip: "185.220.101.44", failures: 5 }],
//         hint: "Use stats count AS failures BY user, src_ip, followed by where.",
//         explanation: "stats creates the grouped evidence; where applies the detection threshold after aggregation.",
//       },
//       {
//         id: "confirm",
//         title: "Confirm compromise",
//         instruction: "Show failure and success counts per user and source IP with conditional aggregation.",
//         points: 35,
//         required: ["index=auth", "stats", "count(eval", "action=", "failure", "success", "by", "user", "src_ip"],
//         result: [{ user: "d.adeleke", src_ip: "185.220.101.44", failures: 5, successes: 1, verdict: "Likely compromised" }],
//         hint: "Use count(eval(action=\"failure\")) and count(eval(action=\"success\")).",
//         explanation: "Conditional aggregation preserves both sides of the authentication sequence in one result row.",
//       },
//     ],
//     questions: [
//       { id: "actor", label: "Malicious source IP", answer: "185.220.101.44", placeholder: "e.g. 10.0.0.5" },
//       { id: "account", label: "Compromised account", answer: "d.adeleke", placeholder: "Username" },
//     ],
//     conclusion: "Five failures and one success from the same unfamiliar overseas IP strongly indicate credential compromise.",
//   },
//   {
//     id: "powershell",
//     code: "INC-1078",
//     title: "Encoded PowerShell",
//     subtitle: "Endpoint execution and command-line investigation",
//     difficulty: "Advanced",
//     duration: 45,
//     accent: "violet",
//     briefing:
//       "EDR detected PowerShell on a finance workstation shortly after a document was opened. Find the suspicious command, its parent process, and the affected host.",
//     index: "endpoint",
//     sourcetype: "sysmon:xml",
//     fields: ["_time", "host", "user", "Image", "ParentImage", "CommandLine", "EventCode"],
//     events: [
//       { _time: "11:02:11", host: "FIN-WS17", user: "a.bello", Image: "WINWORD.EXE", ParentImage: "explorer.exe", CommandLine: "WINWORD.EXE invoice.docm", EventCode: 1 },
//       { _time: "11:02:17", host: "FIN-WS17", user: "a.bello", Image: "powershell.exe", ParentImage: "WINWORD.EXE", CommandLine: "powershell -nop -w hidden -enc SQBFAFgA", EventCode: 1 },
//       { _time: "11:02:23", host: "FIN-WS17", user: "a.bello", Image: "rundll32.exe", ParentImage: "powershell.exe", CommandLine: "rundll32.exe C:\\ProgramData\\cache.dll,Start", EventCode: 1 },
//       { _time: "11:03:05", host: "HR-WS04", user: "k.obi", Image: "powershell.exe", ParentImage: "explorer.exe", CommandLine: "powershell Get-Printer", EventCode: 1 },
//     ],
//     missions: [
//       {
//         id: "encoded",
//         title: "Find encoded execution",
//         instruction: "Find process-creation events containing encoded PowerShell switches.",
//         points: 25,
//         required: ["index=endpoint", "eventcode=1", "powershell"],
//         anyOf: [["-enc", "encodedcommand", "*enc*"]],
//         result: [{ host: "FIN-WS17", user: "a.bello", Image: "powershell.exe", ParentImage: "WINWORD.EXE" }],
//         hint: "Search EventCode=1, powershell, and an encoded-command term such as *-enc*.",
//         explanation: "Process creation logs expose executable, parent, and command-line context.",
//       },
//       {
//         id: "extract",
//         title: "Extract the encoded payload",
//         instruction: "Use rex with a named group called encoded_payload to extract the value following -enc.",
//         points: 35,
//         required: ["index=endpoint", "rex", "?<encoded_payload>", "commandline", "-enc"],
//         result: [{ host: "FIN-WS17", encoded_payload: "SQBFAFgA", parent: "WINWORD.EXE" }],
//         hint: "Use | rex field=CommandLine \"-enc\\s+(?<encoded_payload>\\S+)\".",
//         explanation: "rex performs search-time extraction; a named capture group becomes a result field.",
//       },
//       {
//         id: "chain",
//         title: "Build the process chain",
//         instruction: "Create a chronological table containing time, host, user, parent, process, and command line.",
//         points: 25,
//         required: ["index=endpoint", "sort", "_time", "table", "host", "user", "parentimage", "image", "commandline"],
//         result: [
//           { _time: "11:02:11", parent: "explorer.exe", process: "WINWORD.EXE" },
//           { _time: "11:02:17", parent: "WINWORD.EXE", process: "powershell.exe" },
//           { _time: "11:02:23", parent: "powershell.exe", process: "rundll32.exe" },
//         ],
//         hint: "Filter to FIN-WS17, sort by _time, then use table with the requested fields.",
//         explanation: "A chronological process tree explains how the suspicious activity began and what executed next.",
//       },
//     ],
//     questions: [
//       { id: "host", label: "Affected host", answer: "FIN-WS17", placeholder: "Hostname" },
//       { id: "parent", label: "Suspicious parent process", answer: "WINWORD.EXE", placeholder: "Process name" },
//     ],
//     conclusion: "A macro-enabled Word document spawned hidden encoded PowerShell, which then launched rundll32 from ProgramData.",
//   },
//   {
//     id: "exfiltration",
//     code: "INC-1121",
//     title: "Midnight Exfiltration",
//     subtitle: "Proxy anomaly and outbound data investigation",
//     difficulty: "Expert",
//     duration: 50,
//     accent: "cyan",
//     briefing:
//       "Network monitoring shows an unusual outbound transfer after midnight. Identify the host, destination, and volume, then write a useful detection query.",
//     index: "proxy",
//     sourcetype: "web:proxy",
//     fields: ["_time", "src", "dest_domain", "bytes_out", "action", "user_agent"],
//     events: [
//       { _time: "00:41:02", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 188000000, action: "allowed", user_agent: "python-requests/2.31" },
//       { _time: "00:43:14", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 244000000, action: "allowed", user_agent: "python-requests/2.31" },
//       { _time: "00:47:51", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 221000000, action: "allowed", user_agent: "python-requests/2.31" },
//       { _time: "00:55:09", src: "10.20.8.14", dest_domain: "updates.microsoft.com", bytes_out: 8400000, action: "allowed", user_agent: "WindowsUpdate" },
//       { _time: "01:04:33", src: "10.20.5.77", dest_domain: "sync-storage.cc", bytes_out: 197000000, action: "allowed", user_agent: "python-requests/2.31" },
//     ],
//     missions: [
//       {
//         id: "volume",
//         title: "Measure outbound volume",
//         instruction: "Sum bytes sent by source and destination, convert the result to MB, and sort highest first.",
//         points: 30,
//         required: ["index=proxy", "stats", "sum(bytes_out)", "by", "src", "dest_domain", "eval"],
//         anyOf: [["/1024/1024", "/ 1024 / 1024", "/1048576"]],
//         result: [{ src: "10.20.5.77", dest_domain: "sync-storage.cc", outbound_mb: 810.62 }, { src: "10.20.8.14", dest_domain: "updates.microsoft.com", outbound_mb: 8.01 }],
//         hint: "Use stats sum(bytes_out) AS total_bytes BY src, dest_domain, then eval outbound_mb=round(total_bytes/1024/1024,2).",
//         explanation: "Aggregate raw bytes before converting units so the result reflects the complete transfer.",
//       },
//       {
//         id: "timeline",
//         title: "Plot the transfer timeline",
//         instruction: "Create a 5-minute timechart of outbound bytes by destination domain.",
//         points: 25,
//         required: ["index=proxy", "timechart", "span=5m", "sum(bytes_out)", "by", "dest_domain"],
//         result: [{ _time: "00:40", "sync-storage.cc": 432000000 }, { _time: "00:45", "sync-storage.cc": 221000000 }, { _time: "01:00", "sync-storage.cc": 197000000 }],
//         hint: "Use | timechart span=5m sum(bytes_out) BY dest_domain.",
//         explanation: "timechart returns time-series results and makes burst patterns visible.",
//       },
//       {
//         id: "detect",
//         title: "Author a reusable detection",
//         instruction: "Find sources sending over 500 MB in an hour and retain source, destination, and total bytes.",
//         points: 30,
//         required: ["index=proxy", "bin", "_time", "span=1h", "stats", "sum(bytes_out)", "by", "src", "dest_domain", "where"],
//         anyOf: [[">500", "> 500", ">524288000", "> 524288000"]],
//         result: [{ hour: "00:00", src: "10.20.5.77", dest_domain: "sync-storage.cc", outbound_mb: 810.62, severity: "high" }],
//         hint: "Bucket _time to one hour, aggregate bytes, convert to MB if needed, and apply the threshold with where.",
//         explanation: "Time bucketing plus aggregation creates a reusable threshold-based exfiltration analytic.",
//       },
//     ],
//     questions: [
//       { id: "source", label: "Suspected source host/IP", answer: "10.20.5.77", placeholder: "IP address" },
//       { id: "destination", label: "Suspicious destination", answer: "sync-storage.cc", placeholder: "Domain" },
//     ],
//     conclusion: "The host transferred roughly 811 MB to an uncommon domain with a scripting user-agent shortly after midnight.",
//   },
// ];

// const cx = (...values) => values.filter(Boolean).join(" ");
// const normalize = (value) => value.toLowerCase().replace(/[`']/g, '"').replace(/\s+/g, " ").trim();

// function gradeQuery(query, mission) {
//   const value = normalize(query);
//   const missing = mission.required.filter((token) => !value.includes(token.toLowerCase()));
//   const missingChoice = (mission.anyOf || []).filter((set) => !set.some((token) => value.includes(token.toLowerCase())));
//   const recommendedMissing = (mission.recommended || []).filter((token) => !value.includes(token.toLowerCase()));
//   if (!value) return { passed: false, score: 0, message: "Enter an SPL search before running it.", missing: mission.required.slice(0, 3) };
//   if (missing.length || missingChoice.length) {
//     const coverage = Math.max(0, mission.required.length - missing.length - missingChoice.length);
//     return {
//       passed: false,
//       score: Math.round((coverage / (mission.required.length + (mission.anyOf || []).length)) * mission.points * 0.45),
//       message: "The search ran, but it does not yet satisfy the mission objective.",
//       missing: [...missing.slice(0, 3), ...missingChoice.map((set) => `one of: ${set.join(" / ")}`).slice(0, 1)],
//     };
//   }
//   return {
//     passed: true,
//     score: mission.points,
//     message: recommendedMissing.length ? "Mission passed. Add the recommended filter for a more efficient search." : "Mission passed. The SPL returns the required evidence.",
//     missing: [],
//     optimization: recommendedMissing,
//   };
// }

// function Badge({ children, tone = "slate" }) {
//   const tones = {
//     slate: "border-slate-700 bg-slate-800/80 text-slate-300",
//     emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
//     amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
//     rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
//     violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
//     cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
//   };
//   return <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", tones[tone])}>{children}</span>;
// }

// function Table({ rows }) {
//   if (!rows?.length) return <p className="p-5 text-sm text-slate-500">No matching events.</p>;
//   const columns = Object.keys(rows[0]);
//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full text-left font-mono text-xs">
//         <thead className="border-y border-slate-800 bg-slate-950/70 text-slate-500">
//           <tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}</tr>
//         </thead>
//         <tbody className="divide-y divide-slate-800/80">
//           {rows.map((row, rowIndex) => (
//             <tr key={rowIndex} className="hover:bg-slate-800/30">
//               {columns.map((column) => <td key={column} className="max-w-[320px] whitespace-nowrap px-4 py-3 text-slate-300">{String(row[column])}</td>)}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function CasePicker({ onSelect, history }) {
//   return (
//     <main className="min-h-screen bg-[#070b14] text-white">
//       <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8">
//         <header className="flex flex-wrap items-center justify-between gap-4">
//           <Link to="/toskillab" className="flex items-center gap-3 font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-PURPLE to-violet-500">TO</span> Skill Lab</Link>
//           <Badge tone="emerald">Simulator online</Badge>
//         </header>
//         <section className="py-16 lg:py-24">
//           <div className="max-w-4xl">
//             <Badge tone="violet">Splunk SOC Workspace</Badge>
//             <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">Investigate real incidents.<br/><span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Prove your SPL skills.</span></h1>
//             <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Work through realistic security data, write searches in a simulated Splunk console, collect evidence, and submit a defensible analyst conclusion.</p>
//           </div>
//           <div className="mt-12 grid gap-5 lg:grid-cols-3">
//             {CASES.map((item, index) => {
//               const completed = history[item.id];
//               return (
//                 <motion.button key={item.id} type="button" onClick={() => onSelect(index)} whileHover={{ y: -6 }} className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-left shadow-2xl shadow-black/20 transition hover:border-violet-500/50">
//                   <div className="flex items-center justify-between"><Badge tone={item.accent}>{item.difficulty}</Badge><span className="font-mono text-xs text-slate-600">{item.code}</span></div>
//                   <div className="my-8 grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-950 text-2xl">{index === 0 ? "⌁" : index === 1 ? ">_" : "↗"}</div>
//                   <h2 className="text-xl font-extrabold">{item.title}</h2>
//                   <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">{item.subtitle}</p>
//                   <div className="mt-7 flex items-center justify-between border-t border-slate-800 pt-5 text-sm"><span className="text-slate-500">{item.duration} min · {item.missions.length} missions</span><span className="font-bold text-violet-300">{completed ? `${completed.score}% complete` : "Start case →"}</span></div>
//                 </motion.button>
//               );
//             })}
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

// function LabWorkspace({ caseData, onExit, onComplete }) {
//   const [missionIndex, setMissionIndex] = useState(0);
//   const [query, setQuery] = useState(`index=${caseData.index} sourcetype=${caseData.sourcetype}`);
//   const [run, setRun] = useState(null);
//   const [completed, setCompleted] = useState({});
//   const [hints, setHints] = useState({});
//   const [findings, setFindings] = useState({});
//   const [tab, setTab] = useState("events");
//   const [elapsed, setElapsed] = useState(0);
//   const [submitted, setSubmitted] = useState(false);
//   const mission = caseData.missions[missionIndex];

//   useEffect(() => {
//     const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
//     return () => window.clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const saved = localStorage.getItem(`toSplunkLab:${caseData.id}`);
//     if (!saved) return;
//     try {
//       const parsed = JSON.parse(saved);
//       setMissionIndex(parsed.missionIndex || 0);
//       setCompleted(parsed.completed || {});
//       setHints(parsed.hints || {});
//       setFindings(parsed.findings || {});
//     } catch { localStorage.removeItem(`toSplunkLab:${caseData.id}`); }
//   }, [caseData.id]);

//   useEffect(() => {
//     localStorage.setItem(`toSplunkLab:${caseData.id}`, JSON.stringify({ missionIndex, completed, hints, findings }));
//   }, [caseData.id, missionIndex, completed, hints, findings]);

//   const runSearch = () => {
//     const grade = gradeQuery(query, mission);
//     setRun({ ...grade, rows: grade.passed ? mission.result : [] });
//     setTab("results");
//     if (grade.passed) setCompleted((value) => ({ ...value, [mission.id]: Math.max(value[mission.id] || 0, grade.score) }));
//   };

//   const missionPoints = Object.values(completed).reduce((sum, value) => sum + value, 0);
//   const maxMissionPoints = caseData.missions.reduce((sum, item) => sum + item.points, 0);
//   const correctFindings = caseData.questions.filter((item) => normalize(findings[item.id] || "") === normalize(item.answer)).length;
//   const hintsUsed = Object.keys(hints).length;
//   const canSubmit = Object.keys(completed).length === caseData.missions.length && caseData.questions.every((item) => findings[item.id]?.trim());
//   const score = Math.max(0, Math.round(((missionPoints + correctFindings * 15) / (maxMissionPoints + caseData.questions.length * 15)) * 100) - hintsUsed * 3);

//   const submit = () => {
//     if (!canSubmit) return;
//     setSubmitted(true);
//     onComplete({ caseId: caseData.id, score, elapsed, completedAt: new Date().toISOString(), hintsUsed });
//   };

//   const clock = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

//   if (submitted) {
//     const strong = score >= 80;
//     return (
//       <main className="min-h-screen bg-[#070b14] px-5 py-10 text-white">
//         <div className="mx-auto max-w-5xl">
//           <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-7 shadow-2xl sm:p-10">
//             <div className="flex flex-wrap items-start justify-between gap-6"><div><Badge tone={strong ? "emerald" : score >= 60 ? "amber" : "rose"}>Case completed</Badge><h1 className="mt-4 text-3xl font-black">Investigation report</h1><p className="mt-2 text-slate-400">{caseData.code} · {caseData.title}</p></div><div className="grid h-28 w-28 place-items-center rounded-full border-8 border-violet-500/30 bg-violet-500/10"><div className="text-center"><b className="text-3xl">{score}%</b><span className="block text-[10px] uppercase tracking-widest text-slate-400">score</span></div></div></div>
//             <div className="mt-9 grid gap-4 sm:grid-cols-3">{[["SPL missions", `${Object.keys(completed).length}/${caseData.missions.length}`], ["Evidence accuracy", `${correctFindings}/${caseData.questions.length}`], ["Investigation time", clock]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
//             <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6"><h2 className="font-bold text-violet-300">Analyst conclusion</h2><p className="mt-3 leading-7 text-slate-300">{caseData.conclusion}</p></section>
//             <section className="mt-5 rounded-2xl border border-slate-800 p-6"><h2 className="font-bold">Hiring signal</h2><p className="mt-2 text-slate-400">{score >= 85 ? "Strong evidence of practical Splunk investigation ability. Ready for an advanced technical interview." : score >= 70 ? "Good investigation foundation. Review the missed evidence before a technical interview." : "Complete the case again without hints and strengthen SPL transformation commands."}</p></section>
//             <div className="mt-8 flex flex-wrap gap-3"><button onClick={onExit} className="rounded-xl bg-violet-600 px-6 py-3 font-bold hover:bg-violet-500">Choose another case</button><button onClick={() => window.location.reload()} className="rounded-xl border border-slate-700 px-6 py-3 font-bold hover:bg-slate-800">Retry case</button></div>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-[#070b14] text-white">
//       <header className="border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
//         <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4"><button onClick={onExit} className="text-sm font-bold text-slate-400 hover:text-white">← Case library</button><div className="hidden text-center sm:block"><p className="text-sm font-bold">{caseData.code} · {caseData.title}</p><p className="text-[11px] text-slate-500">Simulation environment</p></div><div className="flex items-center gap-3"><Badge tone="emerald">Live</Badge><span className="font-mono text-sm text-slate-300">{clock}</span></div></div>
//       </header>

//       <div className="mx-auto grid max-w-[1500px] gap-4 p-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
//         <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 xl:min-h-[calc(100vh-90px)]">
//           <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Investigation</p>
//           <h1 className="mt-3 text-xl font-black">{caseData.title}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{caseData.briefing}</p>
//           <div className="my-5 h-px bg-slate-800" />
//           <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Missions</p>
//           <div className="space-y-2">{caseData.missions.map((item, index) => <button key={item.id} onClick={() => { setMissionIndex(index); setRun(null); setTab("events"); }} className={cx("flex w-full gap-3 rounded-xl border p-3 text-left transition", index === missionIndex ? "border-violet-500/50 bg-violet-500/10" : "border-transparent hover:bg-slate-800/60")}><span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold", completed[item.id] ? "bg-emerald-500 text-slate-950" : index === missionIndex ? "bg-violet-500" : "bg-slate-800 text-slate-500")}>{completed[item.id] ? "✓" : index + 1}</span><span><b className="block text-sm">{item.title}</b><small className="text-slate-500">{item.points} points</small></span></button>)}</div>
//           <div className="mt-6 rounded-xl bg-slate-950/70 p-4"><div className="flex justify-between text-xs"><span className="text-slate-500">Case progress</span><b>{Object.keys(completed).length}/{caseData.missions.length}</b></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${(Object.keys(completed).length / caseData.missions.length) * 100}%` }} /></div></div>
//         </aside>

//         <section className="min-w-0 space-y-4">
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
//             <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-300">Mission {missionIndex + 1}</p><h2 className="mt-1 text-lg font-bold">{mission.title}</h2></div><Badge tone={completed[mission.id] ? "emerald" : "amber"}>{completed[mission.id] ? "Passed" : `${mission.points} pts`}</Badge></div>
//             <p className="mt-3 text-sm leading-6 text-slate-400">{mission.instruction}</p>
//           </div>

//           <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b101b] shadow-2xl">
//             <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3"><div className="flex gap-1.5"><i className="h-3 w-3 rounded-full bg-rose-500"/><i className="h-3 w-3 rounded-full bg-amber-400"/><i className="h-3 w-3 rounded-full bg-emerald-500"/></div><span className="font-mono text-xs text-slate-500">search & reporting</span><span className="text-xs text-emerald-400">● connected</span></div>
//             <div className="p-4">
//               <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">SPL search</label>
//               <textarea value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false} className="h-32 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-6 text-cyan-200 outline-none transition focus:border-violet-500" placeholder="index=... | stats ..." />
//               <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-slate-500">Time range: <b className="text-slate-300">Last 24 hours</b></div><button onClick={runSearch} className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-400">▶ Run search</button></div>
//             </div>
//             <div className="flex gap-1 border-y border-slate-800 px-4">{["events", "results"].map((item) => <button key={item} onClick={() => setTab(item)} className={cx("border-b-2 px-4 py-3 text-xs font-bold capitalize", tab === item ? "border-violet-400 text-white" : "border-transparent text-slate-500")}>{item} {item === "events" ? `(${caseData.events.length})` : run?.rows ? `(${run.rows.length})` : ""}</button>)}</div>
//             <div className="min-h-[250px]">
//               {tab === "events" ? <Table rows={caseData.events} /> : run ? <><div className={cx("m-4 rounded-xl border p-4 text-sm", run.passed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-amber-500/30 bg-amber-500/10 text-amber-100")}><b>{run.message}</b>{run.missing?.length > 0 && <p className="mt-2 text-xs opacity-80">Still needed: {run.missing.join(", ")}</p>}{run.optimization?.length > 0 && <p className="mt-2 text-xs opacity-80">Optimization: add {run.optimization.join(", ")}</p>}</div><Table rows={run.rows} /></> : <p className="p-8 text-center text-sm text-slate-500">Run your SPL to view mission results.</p>}
//             </div>
//           </div>

//           <div className="flex justify-between gap-3"><button disabled={missionIndex === 0} onClick={() => { setMissionIndex((v) => v - 1); setRun(null); }} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold disabled:opacity-30">Previous</button><button disabled={!completed[mission.id] || missionIndex === caseData.missions.length - 1} onClick={() => { setMissionIndex((v) => v + 1); setRun(null); setTab("events"); }} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30">Next mission →</button></div>
//         </section>

//         <aside className="space-y-4">
//           <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Data source</h2><Badge>{caseData.events.length} events</Badge></div><dl className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><dt className="text-slate-500">index</dt><dd className="font-mono text-cyan-300">{caseData.index}</dd></div><div className="flex justify-between"><dt className="text-slate-500">sourcetype</dt><dd className="font-mono text-cyan-300">{caseData.sourcetype}</dd></div></dl><div className="mt-4 flex flex-wrap gap-1.5">{caseData.fields.map((field) => <span key={field} className="rounded bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-400">{field}</span>)}</div></section>
//           <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Analyst notebook</h2><span className="text-xs text-slate-500">Evidence</span></div><div className="mt-4 space-y-4">{caseData.questions.map((item) => <label key={item.id} className="block text-xs text-slate-400">{item.label}<input value={findings[item.id] || ""} onChange={(event) => setFindings((value) => ({ ...value, [item.id]: event.target.value }))} placeholder={item.placeholder} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-violet-500" /></label>)}</div></section>
//           <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-amber-200">Need a hint?</h2><span className="text-xs text-amber-400">−3 pts</span></div>{hints[mission.id] ? <p className="mt-3 text-sm leading-6 text-amber-100/80">{mission.hint}</p> : <button onClick={() => setHints((value) => ({ ...value, [mission.id]: true }))} className="mt-3 text-sm font-bold text-amber-300 hover:text-amber-200">Reveal mission hint</button>}</section>
//           <button disabled={!canSubmit} onClick={submit} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-black shadow-lg shadow-violet-950/40 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-40">Submit investigation</button>
//           {!canSubmit && <p className="text-center text-xs leading-5 text-slate-500">Complete every mission and fill in the evidence notebook to submit.</p>}
//         </aside>
//       </div>
//     </main>
//   );
// }

// export default function SplunkLab() {
//   const [selected, setSelected] = useState(null);
//   const [history, setHistory] = useState(() => {
//     try { return JSON.parse(localStorage.getItem("toSplunkLabHistory") || "{}"); } catch { return {}; }
//   });

//   const complete = (result) => {
//     setHistory((value) => {
//       const next = { ...value, [result.caseId]: result };
//       localStorage.setItem("toSplunkLabHistory", JSON.stringify(next));
//       return next;
//     });
//   };

//   return (
//     <AnimatePresence mode="wait">
//       {selected === null ? <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CasePicker onSelect={setSelected} history={history} /></motion.div> : <motion.div key={CASES[selected].id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LabWorkspace caseData={CASES[selected]} onExit={() => setSelected(null)} onComplete={complete} /></motion.div>}
//     </AnimatePresence>
//   );
// }
