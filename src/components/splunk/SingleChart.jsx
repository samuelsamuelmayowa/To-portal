export function SingleValue({ value, label }) {
  return (
    <div className="text-center py-10">
      <div className="text-5xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-gray-400 mt-2">{label}</div>
    </div>
  );
}
