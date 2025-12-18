export function runSPL(query, logs) {
  let data = [];

  // 1️⃣ INDEX SELECTION
  const indexMatch = query.match(/index=([a-zA-Z_]+)/);
  if (!indexMatch) return { error: "index not specified" };

  const indexName = indexMatch[1];
  data = logs[indexName] || [];

  // 2️⃣ SIMPLE SEARCH FILTERS
  if (query.includes("ERROR")) {
    data = data.filter(e => e.level === "ERROR");
  }

  if (query.includes("status=FAILED")) {
    data = data.filter(e => e.status === "FAILED");
  }

  // 3️⃣ STATS
  if (query.includes("stats count")) {
    return [
      { count: data.length }
    ];
  }

  if (query.includes("stats count by sourcetype")) {
    const map = {};
    data.forEach(e => {
      map[e.sourcetype] = (map[e.sourcetype] || 0) + 1;
    });

    return Object.entries(map).map(([k, v]) => ({
      sourcetype: k,
      count: v,
    }));
  }

  if (query.includes("stats count by user")) {
    const map = {};
    data.forEach(e => {
      map[e.user] = (map[e.user] || 0) + 1;
    });

    return Object.entries(map).map(([k, v]) => ({
      user: k,
      count: v,
    }));
  }

  // 4️⃣ DEFAULT = EVENTS VIEW
  return data.slice(0, 50); // like Splunk
}
