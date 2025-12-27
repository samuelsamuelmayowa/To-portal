export function LineChart({ rows, xKey, yKey }) {
  const max = Math.max(...rows.map((r) => Number(r[yKey] || 0)), 1);

  return (
    <svg viewBox="0 0 100 40" className="w-full h-40">
      <polyline
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        points={rows
          .slice(0, 20)
          .map((r, i) => {
            const x = (i / 19) * 100;
            const y = 40 - (r[yKey] / max) * 35;
            return `${x},${y}`;
          })
          .join(" ")}
      />
    </svg>
  );
}
