export default function ScoreBar({ label, value, max = 100, color = "red", suffix = "" }) {
  const pct = Math.min((value / max) * 100, 100);
  const low = color === "red" ? "from-red-500" : "from-blue-500";
  const mid = color === "red" ? "via-orange-400" : "via-cyan-400";
  const high = color === "red" ? "to-green-400" : "to-emerald-400";

  let barColor;
  if (pct < 40) barColor = `bg-gradient-to-r ${low} to-red-400`;
  else if (pct < 70) barColor = `bg-gradient-to-r ${mid} to-yellow-400`;
  else barColor = `bg-gradient-to-r ${high} to-green-400`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className={`text-lg font-bold ${color === "red" ? "text-red-400" : "text-blue-400"}`}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
