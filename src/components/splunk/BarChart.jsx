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
