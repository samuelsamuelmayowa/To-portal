import React from "react";

/* ---------- SINGLE VALUE ---------- */
export function SingleValue({ value, label }) {
  return (
    <div className="text-center py-10">
      <div className="text-5xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-gray-400 mt-2">{label}</div>
    </div>
  );
}

/* ---------- BAR CHART ---------- */
export function BarChart({ rows, xKey, yKey }) {
  const max = Math.max(...rows.map((r) => Number(r[yKey] || 0)), 1);

  return (
    <div className="flex items-end gap-3 h-44">
      {rows.slice(0, 12).map((r, i) => {
        const h = Math.round((r[yKey] / max) * 160);
        return (
          <div key={i} className="flex-1 text-center">
            <div
              className="rounded-xl bg-gradient-to-t from-cyan-500 to-blue-500"
              style={{ height: h }}
            />
            <div className="mt-2 text-[10px] text-gray-400 truncate">
              {String(r[xKey])}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- LINE CHART (TIME) ---------- */
export function LineChart({ rows, xKey, yKey }) {
  const max = Math.max(...rows.map((r) => Number(r[yKey] || 0)), 1);

  const points = rows
    .slice(0, 20)
    .map((r, i) => {
      const x = (i / 19) * 100;
      const y = 40 - (r[yKey] / max) * 35;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 40" className="w-full h-40">
      <polyline
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

/* ---------- PIE / DONUT ---------- */
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
