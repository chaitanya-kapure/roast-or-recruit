export default function ScoreBar({ label, value, max = 100, suffix = "" }) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
          {value}{suffix}
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card-hover)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: "var(--gradient-brand)" }}
        />
      </div>
    </div>
  );
}
