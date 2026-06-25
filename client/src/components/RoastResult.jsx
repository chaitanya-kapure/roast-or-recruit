import ScoreBar from "./ScoreBar.jsx";

const roastEmojis = ["😬", "😂", "💀", "🔥", "😭", "🤡", "📉", "🎯", "💅", "👀", "🙈", "💩"];

export default function RoastResult({ data, onBack }) {
  const { summary, roasts, brutalityScore, verdict } = data;

  const scoreEmoji =
    brutalityScore >= 80 ? "💀" : brutalityScore >= 60 ? "🔥" : brutalityScore >= 40 ? "😅" : "😇";

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-8 text-center" style={{ borderColor: "var(--accent-glow)" }}>
        <span className="text-6xl">{scoreEmoji}</span>
        <h1 className="text-3xl font-bold mt-4" style={{ color: "var(--accent)" }}>Roast Results</h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>Here's how badly you got cooked</p>
      </div>

      <div className="glass rounded-2xl p-8" style={{ borderColor: "var(--accent-glow)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--accent)" }}>📝 Roast Summary</h2>
        <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{summary}</p>
      </div>

      <div className="glass rounded-2xl p-8" style={{ borderColor: "var(--accent-glow)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--accent)" }}>💀 Brutality Score {scoreEmoji}</h2>
        <ScoreBar label="How hard you got roasted" value={brutalityScore} suffix="/100" />
      </div>

      <div className="glass rounded-2xl p-8" style={{ borderColor: "var(--accent-glow)" }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: "var(--accent)" }}>Top Roasts</h2>
        <div className="space-y-4">
          {roasts?.map((roast, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl"
              style={{ backgroundColor: "var(--bg-card-hover)", borderColor: "var(--accent-glow)" }}
            >
              <span className="text-xl shrink-0">{roastEmojis[i % roastEmojis.length]}</span>
              <p style={{ color: "var(--text-secondary)" }}>{roast}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-8 text-center" style={{ borderColor: "var(--accent-glow)" }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--accent)" }}>⚡ Final Verdict</h2>
        <p className="text-xl italic" style={{ color: "var(--text-primary)" }}>"{verdict}"</p>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="btn-roast">
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
