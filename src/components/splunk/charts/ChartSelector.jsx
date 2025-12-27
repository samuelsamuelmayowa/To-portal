import { CHART_TYPES } from "./chartRegistry";

export default function ChartSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHART_TYPES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`px-3 py-1.5 rounded-xl text-xs border transition
            ${
              value === c.id
                ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-200"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          title={c.desc}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
