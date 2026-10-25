import React from "react";

export function MiniBarChart({ rows, xKey, yKey }) {
  const max = Math.max(...rows.map((r) => Number(r[yKey] || 0)), 1);

  return (
    <div className="flex items-end gap-3 h-44">
      {rows.slice(0, 14).map((r, i) => {
        const v = Number(r[yKey] || 0);
        const h = Math.round((v / max) * 160);
        return (
          <div key={i} className="flex-1 min-w-[18px] text-center">
            <div
              className="mx-auto w-full rounded-2xl bg-gradient-to-t from-cyan-500/90 to-blue-500/70 shadow-md"
              style={{ height: h }}
              title={`${String(r[xKey])}: ${v}`}
            />
            <div className="mt-2 text-[10px] text-gray-400 truncate" title={String(r[xKey])}>
              {String(r[xKey])}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PrettyTable({ rows, maxCols = 7, maxRows = 40 }) {
  if (!rows?.length) return null;
  const cols = Object.keys(rows[0]).slice(0, maxCols);

  return (
    <div className="overflow-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5">
          <tr className="text-gray-300">
            {cols.map((k) => (
              <th key={k} className="text-left px-4 py-3 font-medium">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, maxRows).map((row, i) => (
            <tr key={i} className="border-t border-white/10 hover:bg-white/5 transition">
              {cols.map((k) => (
                <td key={k} className="px-4 py-2 text-gray-200">
                  {k === "_time" ? new Date(row[k]).toLocaleString() : String(row[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
