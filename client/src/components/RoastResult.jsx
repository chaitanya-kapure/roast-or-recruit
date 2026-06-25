import ScoreBar from "./ScoreBar.jsx";

const roastEmojis = ["😬", "😂", "💀", "🔥", "😭", "🤡", "📉", "🎯", "💅", "👀", "🙈", "💩"];

export default function RoastResult({ data, onBack }) {
  const { summary, roasts, brutalityScore, verdict } = data;

  const scoreEmoji =
    brutalityScore >= 80 ? "💀" : brutalityScore >= 60 ? "🔥" : brutalityScore >= 40 ? "😅" : "😇";

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-8 border border-red-500/20 text-center">
        <span className="text-6xl">{scoreEmoji}</span>
        <h1 className="text-3xl font-bold text-red-400 mt-4">Roast Results</h1>
        <p className="text-gray-500 mt-2">Here's how badly you got cooked</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-4">📝 Roast Summary</h2>
        <p className="text-gray-300 leading-relaxed">{summary}</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-4">💀 Brutality Score {scoreEmoji}</h2>
        <ScoreBar label="How hard you got roasted" value={brutalityScore} color="red" suffix="/100" />
      </div>

      <div className="glass rounded-2xl p-8 border border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-6">🔥 Top Roasts</h2>
        <div className="space-y-4">
          {roasts?.map((roast, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
            >
              <span className="text-xl shrink-0">{roastEmojis[i % roastEmojis.length]}</span>
              <p className="text-gray-300">{roast}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-8 border border-red-500/20 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚡ Final Verdict</h2>
        <p className="text-xl text-gray-200 italic">"{verdict}"</p>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="btn-roast">
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}
