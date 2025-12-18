// src/utils/splEngine.js

const toEpoch = (t) => (typeof t === "number" ? t : Date.parse(t));

const parseSpanMinutes = (span) => {
  // supports 1m, 5m, 15m, 1h
  if (!span) return 5;
  const m = span.match(/^(\d+)(m|h)$/);
  if (!m) return 5;
  const n = Number(m[1]);
  return m[2] === "h" ? n * 60 : n;
};

const tokenize = (q) =>
  q
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

const parseIndex = (raw) => {
  const m = raw.match(/index=([a-zA-Z_]+)/);
  return m ? m[1] : null;
};

const parseHead = (pipe) => {
  const m = pipe.match(/^head\s+(\d+)/i);
  return m ? Number(m[1]) : null;
};

const parseTable = (pipe) => {
  const m = pipe.match(/^table\s+(.+)$/i);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseStatsCountBy = (pipe) => {
  const m = pipe.match(/^stats\s+count(\s+by\s+([a-zA-Z0-9_]+))?$/i);
  if (!m) return null;
  return { by: m[2] || null };
};

const parseTop = (pipe) => {
  const m = pipe.match(/^top\s+([a-zA-Z0-9_]+)(\s+limit=(\d+))?$/i);
  if (!m) return null;
  return { field: m[1], limit: m[3] ? Number(m[3]) : 10 };
};

const parseTimechart = (pipe) => {
  // timechart span=5m count
  // timechart span=5m count by sourcetype
  const m = pipe.match(/^timechart(\s+span=([0-9]+[mh]))?\s+count(\s+by\s+([a-zA-Z0-9_]+))?$/i);
  if (!m) return null;
  return {
    span: m[2] || "5m",
    by: m[4] || null,
  };
};

const applyBaseSearch = (raw, events) => {
  // Supports:
  // - field=value pairs (status=FAILED)
  // - free text terms (ERROR)
  const tokens = raw
    .replace(/\|.*$/, "") // remove pipes area
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Remove index= token(s)
  const filteredTokens = tokens.filter((t) => !t.startsWith("index="));

  const kvPairs = [];
  const terms = [];

  for (const t of filteredTokens) {
    const kv = t.match(/^([a-zA-Z0-9_]+)=("?)(.+?)\2$/);
    if (kv) kvPairs.push({ field: kv[1], value: kv[3] });
    else terms.push(t);
  }

  let out = [...events];

  // field=value
  for (const { field, value } of kvPairs) {
    out = out.filter((e) => String(e[field]) === value);
  }

  // free text terms applied to message + JSON string (simple)
  for (const term of terms) {
    const t = term.toLowerCase();
    out = out.filter((e) => {
      const msg = (e.message || "").toLowerCase();
      const blob = JSON.stringify(e).toLowerCase();
      return msg.includes(t) || blob.includes(t);
    });
  }

  // Sort by time desc like Splunk
  out.sort((a, b) => toEpoch(b._time) - toEpoch(a._time));
  return out;
};

const doTable = (events, fields) =>
  events.map((e) => {
    const row = {};
    for (const f of fields) row[f] = e[f];
    return row;
  });

const doStatsCount = (events, byField) => {
  if (!byField) return [{ count: events.length }];

  const map = new Map();
  for (const e of events) {
    const k = e[byField] ?? "(null)";
    map.set(k, (map.get(k) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([k, v]) => ({ [byField]: k, count: v }))
    .sort((a, b) => b.count - a.count);
};

const doTop = (events, field, limit) => {
  const rows = doStatsCount(events, field).slice(0, limit);
  return rows.map((r) => ({
    [field]: r[field],
    count: r.count,
    percent: events.length ? Math.round((r.count / events.length) * 1000) / 10 : 0,
  }));
};

const bucketTime = (epoch, spanMins) => {
  const spanMs = spanMins * 60 * 1000;
  return Math.floor(epoch / spanMs) * spanMs;
};

const doTimechartCount = (events, span, byField) => {
  const spanMins = parseSpanMinutes(span);
  const buckets = new Map();

  for (const e of events) {
    const t = bucketTime(toEpoch(e._time), spanMins);
    const key = byField ? String(e[byField] ?? "(null)") : "__count__";

    if (!buckets.has(t)) buckets.set(t, new Map());
    const inner = buckets.get(t);
    inner.set(key, (inner.get(key) || 0) + 1);
  }

  const times = Array.from(buckets.keys()).sort((a, b) => a - b);

  // Produce rows like:
  // { _time: 12345, count: 10 } OR { _time: 12345, splunkd: 3, audittrail: 7 }
  const rows = times.map((t) => {
    const row = { _time: t };
    const inner = buckets.get(t);

    if (!byField) {
      row.count = inner.get("__count__") || 0;
    } else {
      for (const [k, v] of inner.entries()) row[k] = v;
    }
    return row;
  });

  return rows;
};

export function runSPL(query, LOGS) {
  const raw = (query || "").trim();
  if (!raw) return { error: "Empty search. Try: index=_internal" };

  const indexName = parseIndex(raw);
  if (!indexName) return { error: "Missing index=. Try: index=_internal" };

  const events = LOGS[indexName];
  if (!events) return { error: `Unknown index=${indexName}.` };

  const pipes = tokenize(raw);
  const base = applyBaseSearch(raw, events);

  // Default “events view”
  let mode = "events";
  let out = base;

  // Apply transforms in order
  for (let i = 1; i < pipes.length; i++) {
    const p = pipes[i];

    const headN = parseHead(p);
    if (headN != null) {
      out = out.slice(0, headN);
      continue;
    }

    const tableFields = parseTable(p);
    if (tableFields) {
      mode = "table";
      out = doTable(out, tableFields);
      continue;
    }

    const stats = parseStatsCountBy(p);
    if (stats) {
      mode = "table";
      out = doStatsCount(out, stats.by);
      continue;
    }

    const top = parseTop(p);
    if (top) {
      mode = "table";
      out = doTop(out, top.field, top.limit);
      continue;
    }

    const tc = parseTimechart(p);
    if (tc) {
      mode = "timechart";
      out = doTimechartCount(out, tc.span, tc.by);
      continue;
    }

    // Unknown pipe command (keep it teachable)
    return { error: `Unsupported command: "${p}". (We can add it next)` };
  }

  // Like Splunk: don’t dump all events at once
  if (mode === "events") out = out.slice(0, 200);

  return {
    mode,
    index: indexName,
    count: base.length,
    results: out,
  };
}

// export function runSPL(query, logs) {
//   let data = [];

//   // 1️⃣ INDEX SELECTION
//   const indexMatch = query.match(/index=([a-zA-Z_]+)/);
//   if (!indexMatch) return { error: "index not specified" };

//   const indexName = indexMatch[1];
//   data = logs[indexName] || [];

//   // 2️⃣ SIMPLE SEARCH FILTERS
//   if (query.includes("ERROR")) {
//     data = data.filter(e => e.level === "ERROR");
//   }

//   if (query.includes("status=FAILED")) {
//     data = data.filter(e => e.status === "FAILED");
//   }

//   // 3️⃣ STATS
//   if (query.includes("stats count")) {
//     return [
//       { count: data.length }
//     ];
//   }

//   if (query.includes("stats count by sourcetype")) {
//     const map = {};
//     data.forEach(e => {
//       map[e.sourcetype] = (map[e.sourcetype] || 0) + 1;
//     });

//     return Object.entries(map).map(([k, v]) => ({
//       sourcetype: k,
//       count: v,
//     }));
//   }

//   if (query.includes("stats count by user")) {
//     const map = {};
//     data.forEach(e => {
//       map[e.user] = (map[e.user] || 0) + 1;
//     });

//     return Object.entries(map).map(([k, v]) => ({
//       user: k,
//       count: v,
//     }));
//   }

//   // 4️⃣ DEFAULT = EVENTS VIEW
//   return data.slice(0, 50); // like Splunk
// }
