export function PieChart({ rows, xKey, yKey }) {
  const total = rows.reduce((s, r) => s + Number(r[yKey] || 0), 0);
  let acc = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 32 32" className="w-32 h-32 -rotate-90">
        {rows.slice(0, 6).map((r, i) => {
          const v = Number(r[yKey] || 0);
          const pct = v / total;
          const dash = `${pct * 100} ${100 - pct * 100}`;
          const el = (
            <circle
              key={i}
              r="16"
              cx="16"
              cy="16"
              fill="transparent"
              strokeWidth="8"
              strokeDasharray={dash}
              strokeDashoffset={-acc}
              stroke={`hsl(${i * 60},70%,60%)`}
            />
          );
          acc += pct * 100;
          return el;
        })}
      </svg>

      <div className="space-y-1 text-xs">
        {rows.slice(0, 6).map((r, i) => (
          <div key={i} className="text-gray-300">
            {r[xKey]} — {r[yKey]}
          </div>
        ))}
      </div>
    </div>
  );
}
