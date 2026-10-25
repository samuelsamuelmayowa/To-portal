import { SPL_LOOKUPS } from "../data/splLookups.js";
/**
 * T.O Analytics educational SPL engine (SPL1-inspired subset).
 * This is NOT a replacement for Splunk Enterprise / Cloud.
 * No eval(), Function(), or network access; all data stays in the browser.
 * runSPL(query, { indexName: [events] }) -> {mode,index,count,results,trace,...}
 */
const MAX_QUERY_LENGTH = 4000;
const MAX_OUTPUT = 500;
const MAX_INPUT_ROWS = 25000;

const epoch = (value) => {
  if (typeof value === "number") return value < 1e11 ? value * 1000 : value;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
};
const fail = (message) => { throw new Error(message); };
const unquote = (value) => {
  const s = String(value ?? "").trim();
  return (s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'")
    ? s.slice(1, -1).replace(/\\(["'\\])/g, "$1")
    : s;
};

function splitOutside(input, delimiter = "|") {
  const parts = [];
  let current = "", quote = null, depth = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote) {
      current += c;
      if (c === "\\" && i + 1 < input.length) current += input[++i];
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") { quote = c; current += c; }
    else if (c === "(") { depth++; current += c; }
    else if (c === ")") { depth--; if (depth < 0) fail("Unexpected ')' in the query."); current += c; }
    else if (depth === 0 && c === delimiter) { parts.push(current.trim()); current = ""; }
    else current += c;
  }
  if (quote || depth !== 0) fail("Check quotation marks and parentheses in your SPL.");
  parts.push(current.trim());
  if (parts.some((p) => !p)) fail("An empty pipeline stage was found near '|'.");
  return parts;
}
function words(input) {
  const items = [];
  let token = "", quote = null;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote) {
      token += c;
      if (c === "\\" && i + 1 < input.length) token += input[++i];
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") { quote = c; token += c; }
    else if (/\s/.test(c)) { if (token) items.push(token); token = ""; }
    else token += c;
  }
  if (quote) fail("Unclosed quotation mark in search.");
  if (token) items.push(token);
  return items;
}
const fieldList = (s) => s.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
const num = (v) => v === null || v === undefined || v === "" ? NaN : Number(v);
const equal = (a, b) => String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();
const compare = (a, op, b) => {
  const an = num(a), bn = num(b);
  const [x, y] = Number.isFinite(an) && Number.isFinite(bn) ? [an, bn] : [String(a ?? "").toLowerCase(), String(b ?? "").toLowerCase()];
  if (op === "=" || op === "==") return equal(x, y);
  if (op === "!=") return !equal(x, y);
  if (op === ">") return x > y;
  if (op === "<") return x < y;
  if (op === ">=") return x >= y;
  if (op === "<=") return x <= y;
  return false;
};
function searchTerm(row, item) {
  const match = item.match(/^([\w.]+)(!=|>=|<=|=|>|<)(.+)$/);
  if (!match) {
    const term = unquote(item).toLowerCase();
    return String(row._raw ?? JSON.stringify(row)).toLowerCase().includes(term) ||
      JSON.stringify(row).toLowerCase().includes(term);
  }
  const [, field, operator, rhs] = match;
  const value = unquote(rhs);
  if ((operator === "=" || operator === "!=") && value.includes("*")) {
    const pattern = "^" + value.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$";
    const ok = new RegExp(pattern, "i").test(String(row[field] ?? ""));
    return operator === "=" ? ok : !ok;
  }
  return compare(row[field], operator, value);
}
function filterSearch(rows, input) {
  const tokens = words(input).filter((item) => !/^index=/i.test(item) && !/^(earliest|latest)=/i.test(item));
  if (!tokens.length) return rows;
  // SPL basics: implicit AND, explicit AND / OR / NOT. Parenthesized search
  // expressions are deliberately not supported in the teaching subset.
  return rows.filter((row) => {
    let accum = false, group = true, negate = false;
    for (const token of tokens) {
      if (/^OR$/i.test(token)) { accum ||= group; group = true; negate = false; continue; }
      if (/^AND$/i.test(token)) continue;
      if (/^NOT$/i.test(token)) { negate = !negate; continue; }
      const yes = searchTerm(row, token);
      group = group && (negate ? !yes : yes);
      negate = false;
    }
    return accum || group;
  });
}
function parseTime(value, now) {
  if (!value) return null;
  const text = unquote(value);
  if (/^now(?:\(\))?$/i.test(text)) return now;
  if (text === "0") return null;
  const rel = text.match(/^([+-])(\d+)(s|m|h|d|w)(?:@(s|m|h|d))?$/i);
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
  if (rel) {
    let t = now + (rel[1] === "-" ? -1 : 1) * Number(rel[2]) * ms[rel[3].toLowerCase()];
    if (rel[4]) t = Math.floor(t / ms[rel[4].toLowerCase()]) * ms[rel[4].toLowerCase()];
    return t;
  }
  if (/^@(s|m|h|d)$/i.test(text)) return Math.floor(now / ms[text[1].toLowerCase()]) * ms[text[1].toLowerCase()];
  if (/^\d{10,13}$/.test(text)) return epoch(Number(text));
  const t = Date.parse(text);
  if (Number.isFinite(t)) return t;
  fail(`Unsupported time modifier "${value}". Try earliest=-24h latest=now.`);
}
function durationMs(text) {
  const match = String(text).match(/^(\d+)(s|m|h|d)$/i);
  if (!match || !Number(match[1])) fail('Use a span such as "5m", "15m", "1h", or "1d".');
  return Number(match[1]) * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2].toLowerCase()];
}

// Small, explicitly whitelisted expression parser. No user-provided JavaScript runs.
function expressionTokens(input) {
  const tokens = [];
  const rex = /\s*(>=|<=|!=|==|=|>|<|\+|-|\*|\/|%|\(|\)|,|\bAND\b|\bOR\b|\bNOT\b|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\d+(?:\.\d+)?|[A-Za-z_][\w.]*)/giy;
  let pos = 0;
  while (pos < input.length) {
    if (/^\s+$/.test(input.slice(pos))) break;
    rex.lastIndex = pos;
    const hit = rex.exec(input);
    if (!hit || hit.index !== pos) fail(`Cannot parse expression near: ${input.slice(pos, pos + 25)}`);
    tokens.push(hit[1]); pos = rex.lastIndex;
    if (tokens.length > 140) fail("Expression is too long for the training simulator.");
  }
  return tokens;
}
function evaluate(input, row) {
  const t = expressionTokens(input);
  let i = 0, depth = 0;
  const peek = () => t[i];
  const pop = () => t[i++];
  function primary() {
    if (++depth > 32) fail("Expression is nested too deeply.");
    try {
      const item = pop();
      if (item == null) fail("An expression is incomplete.");
      if (item === "(") { const result = logic(); if (pop() !== ")") fail("Missing ')' in expression."); return result; }
      if (item === "-") return -Number(primary());
      if (/^NOT$/i.test(item)) return !Boolean(primary());
      if (/^\d/.test(item)) return Number(item);
      if (/^['"]/.test(item)) return unquote(item);
      if (/^true$/i.test(item)) return true;
      if (/^false$/i.test(item)) return false;
      if (/^null$/i.test(item)) return null;
      if (peek() !== "(") return row[item];
      pop();
      const args = [];
      if (peek() !== ")") {
        do { args.push(logic()); if (peek() !== ",") break; pop(); } while (true);
      }
      if (pop() !== ")") fail(`Missing ')' in ${item}().`);
      switch (item.toLowerCase()) {
        case "round": return Math.round(num(args[0]) * 10 ** (Number(args[1]) || 0)) / 10 ** (Number(args[1]) || 0);
        case "lower": return String(args[0] ?? "").toLowerCase();
        case "upper": return String(args[0] ?? "").toUpperCase();
        case "len": return String(args[0] ?? "").length;
        case "if": return args[0] ? args[1] : args[2];
        case "coalesce": return args.find((v) => v !== null && v !== undefined && v !== "") ?? null;
        case "tonumber": return num(args[0]);
        case "tostring": return String(args[0] ?? "");
        default: fail(`Unknown eval function: ${item}(). Supported: if, round, lower, upper, len, coalesce, tonumber, tostring.`);
      }
    } finally { depth--; }
  }
  function mul() { let x = primary(); while (["*", "/", "%"].includes(peek())) { const op = pop(), y = primary(); x = op === "*" ? Number(x) * Number(y) : op === "/" ? Number(x) / Number(y) : Number(x) % Number(y); } return x; }
  function add() { let x = mul(); while (["+", "-"].includes(peek())) { const op = pop(), y = mul(); x = op === "+" ? Number(x) + Number(y) : Number(x) - Number(y); } return x; }
  function comparisons() { let x = add(); while (["=", "==", "!=", ">", "<", ">=", "<="].includes(peek())) { const op = pop(), y = add(); x = compare(x, op, y); } return x; }
  function logic() { let x = comparisons(); while (/^(AND|OR)$/i.test(peek() ?? "")) { const op = pop().toUpperCase(), y = comparisons(); x = op === "AND" ? Boolean(x) && Boolean(y) : Boolean(x) || Boolean(y); } return x; }
  const result = logic();
  if (i !== t.length) fail(`Unexpected expression token: ${peek()}`);
  return result;
}
function parseAggs(body) {
  const grouped = body.match(/^(.*?)(?:\s+by\s+([\w.,\s]+))?$/i);
  const measures = splitOutside(grouped[1], ",").map((part) => {
    const m = part.match(/^(count|sum|avg|min|max|dc|values)(?:\(([\w.]+)\))?(?:\s+as\s+([\w.]+))?$/i);
    if (!m) fail(`Unsupported stats expression: "${part}". Example: stats count, avg(response_time) as avg_ms by status`);
    const fn = m[1].toLowerCase(), field = m[2] || null;
    if (fn !== "count" && !field) fail(`${fn} requires a field, like ${fn}(response_time).`);
    return { fn, field, as: m[3] || (fn === "count" ? "count" : `${fn}(${field})`) };
  });
  return { measures, by: grouped[2] ? fieldList(grouped[2]) : [] };
}
function aggregate(rows, measures) {
  const result = {};
  for (const { fn, field, as } of measures) {
    const vals = field ? rows.map((r) => r[field]).filter((v) => v !== undefined && v !== null && v !== "") : [];
    const nums = vals.map(Number).filter(Number.isFinite);
    if (fn === "count") result[as] = field ? vals.length : rows.length;
    else if (fn === "dc") result[as] = new Set(vals.map(String)).size;
    else if (fn === "values") result[as] = [...new Set(vals.map(String))].slice(0, 15).join(", ");
    else if (fn === "sum") result[as] = nums.reduce((s, v) => s + v, 0);
    else if (fn === "avg") result[as] = nums.length ? Math.round((nums.reduce((s, v) => s + v, 0) / nums.length) * 100) / 100 : null;
    else if (fn === "min") result[as] = nums.length ? Math.min(...nums) : null;
    else if (fn === "max") result[as] = nums.length ? Math.max(...nums) : null;
  }
  return result;
}
function stats(rows, parsed) {
  if (!parsed.by.length) return [aggregate(rows, parsed.measures)];
  const groups = new Map();
  for (const row of rows) {
    const key = JSON.stringify(parsed.by.map((f) => row[f] ?? "(null)"));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()].map(([key, group]) => ({
    ...Object.fromEntries(parsed.by.map((f, i) => [f, JSON.parse(key)[i]])),
    ...aggregate(group, parsed.measures),
  }));
}
function timechart(rows, command) {
  const m = command.match(/^timechart\s+(?:span=(\d+[smhd])\s+)?(.+)$/i);
  if (!m) fail("Try: timechart span=15m count or timechart span=1h avg(response_time).");
  const spanMs = durationMs(m[1] || "15m");
  const parsed = parseAggs(m[2]);
  if (parsed.by.length > 1 || parsed.measures.length !== 1) fail("In this simulator timechart supports one measure and optionally one BY field.");
  const by = parsed.by[0];
  const buckets = new Map();
  for (const row of rows) {
    const t = epoch(row._time);
    if (t === null) continue;
    const key = Math.floor(t / spanMs) * spanMs;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(row);
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([t, bucket]) => {
    if (!by) return { _time: t, ...aggregate(bucket, parsed.measures) };
    const groups = stats(bucket, { ...parsed, by: [by] }).slice(0, 12);
    return { _time: t, ...Object.fromEntries(groups.map((r) => [String(r[by]), r[parsed.measures[0].as]])) };
  });
}
/** Compile a deliberately small, named-capture subset of rex.
 * JavaScript RegExp is not PCRE: advanced PCRE features and sed modes are excluded.
 */
function extractRex(rows, body) {
  const fieldMatch = body.match(/(?:^|\s)field=([\w.]+)/i);
  const field = fieldMatch ? fieldMatch[1] : "_raw";
  if (/\bmode\s*=\s*sed\b/i.test(body)) fail("This lesson supports rex field extraction, not mode=sed.");
  if (/\bmax_match\s*=\s*(?!1(?:\s|$))\S+/i.test(body)) fail("In this simulator rex supports max_match=1 only.");
  const remainder = body.replace(/(?:^|\s)field=[\w.]+/i, " ").replace(/(?:^|\s)max_match=1(?:\s|$)/i, " ").trim();
  if (!remainder || !/^(['"]).*\1$/s.test(remainder)) fail('rex example: rex field=_raw "(?<action>\\w+)"');
  let pattern = unquote(remainder).replace(/\(\?P<([A-Za-z_]\w*)>/g, "(?<$1>");
  if (pattern.length > 180) fail("For this practice lab, keep rex patterns under 180 characters.");
  if (!/\(\?<([A-Za-z_]\w*)>/.test(pattern)) fail("Use a named capture group, for example (?<action>\\w+).");
  if (/\\[1-9]/.test(pattern) || /\(\?(?:=|!|<=|<!)/.test(pattern) || /\([^)]*[+*][^)]*\)\s*(?:[+*]|\{)/.test(pattern)) {
    fail("This advanced regular expression is outside the safe training subset. Use simple named captures.");
  }
  let regex;
  try { regex = new RegExp(pattern); }
  catch { fail("Invalid rex pattern. Check the named groups and escaping."); }
  return rows.map((row) => {
    const value = String(row[field] ?? "").slice(0, 5000);
    const matched = regex.exec(value);
    return matched?.groups ? { ...row, ...matched.groups } : { ...row };
  });
}
function findLookup(name) {
  const key = Object.keys(SPL_LOOKUPS).find((x) => x.toLowerCase() === String(name).toLowerCase());
  if (!key) fail(`Unknown lookup "${name}". Open Lookup Tables to see the included CSV datasets.`);
  return { name: key, rows: SPL_LOOKUPS[key] };
}
function loadLookup(body) {
  const tokens = words(body);
  if (tokens.length !== 1) fail("inputlookup example: | inputlookup user_directory.csv");
  return findLookup(unquote(tokens[0]));
}
function applyLookup(rows, body) {
  const tokens = words(body.replace(/,/g, " "));
  const { rows: reference } = findLookup(tokens.shift());
  const outputAt = tokens.findIndex((t) => /^OUTPUT(?:NEW)?$/i.test(t));
  const keyTokens = outputAt < 0 ? tokens : tokens.slice(0, outputAt);
  const outputTokens = outputAt < 0 ? [] : tokens.slice(outputAt + 1);
  if (!keyTokens.length || keyTokens.length > 3 || (keyTokens.length > 1 && (keyTokens.length !== 3 || keyTokens[1].toUpperCase() !== "AS"))) {
    fail("lookup example: lookup user_directory.csv user OUTPUT department role");
  }
  const lookupKey = keyTokens[0], eventKey = keyTokens.length === 3 ? keyTokens[2] : lookupKey;
  if (outputAt >= 0 && !outputTokens.length) fail("OUTPUT needs at least one field name.");
  const outputFields = [];
  if (!outputTokens.length) {
    for (const key of Object.keys(reference[0] || {})) if (key !== lookupKey) outputFields.push([key, key]);
  } else {
    for (let i = 0; i < outputTokens.length; i++) {
      if (/^AS$/i.test(outputTokens[i])) fail("Provide a field before AS in lookup OUTPUT.");
      const key = outputTokens[i], rename = /^AS$/i.test(outputTokens[i + 1] ?? "");
      const alias = rename ? outputTokens[i + 2] : key;
      if (rename && !alias) fail("Missing destination field after AS.");
      outputFields.push([key, alias]); if (rename) i += 2;
    }
  }
  for (const [name] of outputFields) if (!reference.some((r) => Object.hasOwn(r, name))) fail(`Lookup field "${name}" is not in the chosen CSV table.`);
  const onlyMissing = outputAt >= 0 && tokens[outputAt].toUpperCase() === "OUTPUTNEW";
  const referenceMap = new Map(reference.map((row) => [String(row[lookupKey] ?? "").toLowerCase(), row]));
  return rows.map((row) => {
    const matched = referenceMap.get(String(row[eventKey] ?? "").toLowerCase());
    if (!matched) return { ...row };
    const updated = { ...row };
    for (const [from, to] of outputFields) {
      if (!onlyMissing || updated[to] == null || updated[to] === "") updated[to] = matched[from];
    }
    return updated;
  });
}
function correlateTransactions(rows, body) {
  const tokens = words(body);
  const fields = tokens.filter((x) => !/^\w+=/.test(x));
  if (fields.length !== 1 || !/^\w+$/.test(fields[0])) fail("transaction example: transaction session_id maxspan=30m");
  const unsupported = tokens.filter((x) => x !== fields[0] && !/^(maxspan|maxevents)=/i.test(x));
  if (unsupported.length) fail("The teaching version of transaction supports maxspan and maxevents only.");
  const maxspanToken = tokens.find((t) => /^maxspan=/i.test(t));
  const maxeventsToken = tokens.find((t) => /^maxevents=/i.test(t));
  const maxspan = maxspanToken ? durationMs(maxspanToken.split("=")[1]) : Infinity;
  const maxevents = maxeventsToken ? Number(maxeventsToken.split("=")[1]) : 1000;
  if (!Number.isInteger(maxevents) || maxevents < 1 || maxevents > 5000) fail("maxevents must be between 1 and 5000.");
  const field = fields[0];
  const ordered = rows.filter((r) => r[field] != null && epoch(r._time) !== null).sort((a, b) => epoch(a._time) - epoch(b._time));
  const byField = new Map();
  for (const row of ordered) {
    const key = String(row[field]);
    const time = epoch(row._time);
    if (!byField.has(key)) byField.set(key, []);
    const sessions = byField.get(key);
    let current = sessions.at(-1);
    if (!current || time - epoch(current[0]._time) > maxspan || current.length >= maxevents) {
      current = []; sessions.push(current);
    }
    current.push(row);
  }
  const summary = [];
  for (const sessions of byField.values()) for (const group of sessions) {
    const first = group[0], last = group.at(-1);
    const start = epoch(first._time), end = epoch(last._time);
    summary.push({
      [field]: first[field], _time: last._time, start_time: first._time, end_time: last._time,
      duration: Math.round((end - start) / 1000), eventcount: group.length,
      activities: [...new Set(group.map((r) => r.activity).filter(Boolean))].join(", "),
      outcomes: [...new Set(group.map((r) => r.outcome).filter(Boolean))].join(", "),
      user: last.user, outcome: last.outcome, source: last.source,
      message: `${group.length} related events across ${Math.round((end - start) / 1000)}s`,
    });
  }
  return summary.sort((a, b) => epoch(b._time) - epoch(a._time));
}
function applyPipe(rows, pipe) {
  const match = pipe.match(/^([a-z][\w]*)\b\s*(.*)$/i);
  if (!match) fail(`Invalid command "${pipe}".`);
  const name = match[1].toLowerCase(), body = match[2].trim();
  let mode = "events", next = rows;
  switch (name) {
    case "search": next = filterSearch(rows, body); break;
    case "where": if (!body) fail("where requires a condition, for example: where status>=400"); next = rows.filter((r) => Boolean(evaluate(body, r))); break;
    case "eval": {
      const m = body.match(/^([\w.]+)\s*=\s*(.+)$/);
      if (!m) fail('eval example: eval seconds=round(response_time/1000,2)');
      next = rows.map((r) => ({ ...r, [m[1]]: evaluate(m[2], r) })); break;
    }
    case "table": {
      const cols = fieldList(body);
      if (!cols.length) fail("table requires field names.");
      next = rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c] ?? null]))); mode = "table"; break;
    }
    case "fields": {
      if (!body) fail("fields requires field names.");
      const exclude = /^-\s*/.test(body);
      const cols = fieldList(body.replace(/^[+-]\s*/, ""));
      next = rows.map((r) => exclude ? Object.fromEntries(Object.entries(r).filter(([k]) => !cols.includes(k))) : Object.fromEntries(Object.entries(r).filter(([k]) => cols.includes(k))));
      break;
    }
    case "head": case "tail": {
      const amount = Number(body || 10);
      if (!Number.isInteger(amount) || amount < 0 || amount > MAX_INPUT_ROWS) fail(`${name} needs a nonnegative whole number.`);
      next = name === "head" ? rows.slice(0, amount) : (amount === 0 ? [] : rows.slice(-amount)); break;
    }
    case "sort": {
      const fields = fieldList(body.replace(/^0\s+/, ""));
      if (!fields.length) fail("sort example: sort -count");
      next = [...rows].sort((a, b) => {
        for (const token of fields) {
          const descending = token[0] === "-";
          const key = token.replace(/^[+-]/, "");
          const va = a[key], vb = b[key];
          const aa = num(va), bb = num(vb);
          const cmp = Number.isFinite(aa) && Number.isFinite(bb) ? aa - bb : String(va ?? "").localeCompare(String(vb ?? ""));
          if (cmp) return descending ? -cmp : cmp;
        }
        return 0;
      }); break;
    }
    case "dedup": {
      const fields = fieldList(body);
      if (!fields.length) fail("dedup example: dedup user");
      const keys = new Set();
      next = rows.filter((r) => { const key = JSON.stringify(fields.map((f) => r[f])); if (keys.has(key)) return false; keys.add(key); return true; }); break;
    }
    case "rename": {
      const m = body.match(/^([\w.]+)\s+as\s+([\w.]+)$/i);
      if (!m) fail("rename example: rename response_time AS latency_ms");
      next = rows.map((r) => { const x = { ...r }; if (m[1] in x) { x[m[2]] = x[m[1]]; delete x[m[1]]; } return x; }); break;
    }
    case "fillnull": {
      const m = body.match(/^value=("[^"]*"|'[^']*'|\S+)(?:\s+(.+))?$/i);
      if (!m) fail('fillnull example: fillnull value="unknown" user');
      const value = unquote(m[1]), fields = m[2] ? fieldList(m[2]) : [...new Set(rows.flatMap(Object.keys))];
      next = rows.map((r) => { const x = { ...r }; for (const f of fields) if (x[f] == null || x[f] === "") x[f] = value; return x; }); break;
    }
    case "bin": {
      const m = body.match(/^([\w.]+)\s+span=(\d+[smhd])$/i);
      if (!m) fail("bin example: bin _time span=1h");
      const span = durationMs(m[2]);
      next = rows.map((r) => ({ ...r, [m[1]]: Math.floor((m[1] === "_time" ? epoch(r._time) : Number(r[m[1]])) / span) * span })); break;
    }
    case "rex": next = extractRex(rows, body); break;
    case "lookup": next = applyLookup(rows, body); break;
    case "inputlookup": next = loadLookup(body).rows.map((r) => ({ ...r })); mode = "table"; break;
    case "transaction": next = correlateTransactions(rows, body); mode = "table"; break;
    case "stats": next = stats(rows, parseAggs(body)); mode = "table"; break;
    case "timechart": next = timechart(rows, pipe); mode = "timechart"; break;
    case "top": case "rare": {
      const m = body.match(/^([\w.]+)(?:\s+limit=(\d+))?$/i);
      if (!m) fail(`${name} example: ${name} status limit=10`);
      const limit = m[2] ? Math.min(Number(m[2]), MAX_OUTPUT) : 10;
      next = stats(rows, { measures: [{ fn: "count", field: null, as: "count" }], by: [m[1]] })
        .map((r) => ({ ...r, percent: rows.length ? Math.round(r.count / rows.length * 1000) / 10 : 0 }))
        .sort((a, b) => name === "top" ? b.count - a.count : a.count - b.count).slice(0, limit);
      mode = "table"; break;
    }
    default: fail(`Unsupported command "${name}". Open Command Explorer to see what this training engine supports.`);
  }
  return { rows: next, mode, name };
}
export function runSPL(query, datasets) {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    const raw = String(query ?? "").trim();
    if (!raw) fail("Enter a search, for example: index=_internal");
    if (raw.length > MAX_QUERY_LENGTH) fail("Keep queries under 4000 characters in this lab.");
    const normalized = raw.replace(/^\|\s*/, "");
    const pipes = splitOutside(normalized);
    const first = pipes[0];
    const isLookupStart = /^inputlookup\s+/i.test(first);
    let indexName, rows, count, mode;
    if (isLookupStart) {
      const table = loadLookup(first.replace(/^inputlookup\s+/i, ""));
      indexName = `lookup:${table.name}`;
      rows = table.rows.map((r) => ({ ...r }));
      count = rows.length; mode = "table";
    } else {
      const baseSearch = first.replace(/^search\s+/i, "");
      indexName = (baseSearch.match(/(?:^|\s)index=([\w-]+)/i) || [])[1];
      if (!indexName) fail("Specify an index, for example: index=training_web. Or start with | inputlookup user_directory.csv");
      if (!datasets || !Array.isArray(datasets[indexName])) fail(`Unknown index=${indexName}. Choose a dataset from the selector.`);
      const from = parseTime((baseSearch.match(/(?:^|\s)earliest=("[^"]+"|\S+)/i) || [])[1], Date.now());
      const until = parseTime((baseSearch.match(/(?:^|\s)latest=("[^"]+"|\S+)/i) || [])[1], Date.now());
      const sourceRows = datasets[indexName].slice(0, MAX_INPUT_ROWS);
      rows = sourceRows.filter((row) => {
        const t = epoch(row._time);
        return (from === null || (t !== null && t >= from)) && (until === null || (t !== null && t < until));
      });
      rows = filterSearch(rows, baseSearch);
      rows.sort((a, b) => (epoch(b._time) || 0) - (epoch(a._time) || 0));
      count = rows.length; mode = "events";
    }
    const trace = [{ command: isLookupStart ? "inputlookup" : "search", explanation: isLookupStart ? "Load sample CSV lookup rows." : `Search ${indexName} and apply initial filters.`, outputRows: rows.length }];
    for (const pipe of pipes.slice(1)) {
      const out = applyPipe(rows, pipe);
      rows = out.rows;
      if (["table", "timechart"].includes(out.mode)) mode = out.mode;
      trace.push({ command: pipe, explanation: commandDescription(out.name), outputRows: rows.length });
    }
    return { index: indexName, count, totalRows: rows.length, mode, results: rows.slice(0, MAX_OUTPUT), trace, truncated: rows.length > MAX_OUTPUT, elapsedMs: Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Query could not be executed." };
  }
}
export function commandDescription(name) {
  return ({ search: "Filter events by matching fields or keywords.", where: "Keep rows that satisfy a condition.", eval: "Create a calculated field for each event.", table: "Display selected fields as table columns.", fields: "Include or remove fields.", head: "Keep the first results.", tail: "Keep the last results.", sort: "Sort rows by one or more fields.", dedup: "Remove duplicate field combinations.", rename: "Change a field name.", fillnull: "Fill missing values with a default.", rex: "Extract named fields from raw text with a regular expression.", lookup: "Enrich events with a preloaded CSV-style table.", inputlookup: "Read a teaching CSV lookup table as search results.", transaction: "Correlate events with a shared key within a time window.", bin: "Group numeric/time values into buckets.", stats: "Aggregate events into counts and statistics.", timechart: "Aggregate values over time intervals.", top: "Find the most common field values.", rare: "Find the least common field values." })[name] || "Run a pipeline command.";
}
