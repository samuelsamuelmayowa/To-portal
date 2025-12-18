export function runSPL(query, data) {
  let results = [...data];

  if (query.includes("level=ERROR")) {
    results = results.filter(r => r.level === "ERROR");
  }

  if (query.includes("stats count by sourcetype")) {
    const map = {};
    results.forEach(r => {
      map[r.sourcetype] = (map[r.sourcetype] || 0) + 1;
    });

    return Object.entries(map).map(([sourcetype, count]) => ({
      sourcetype,
      count,
    }));
  }

  return results;
}
