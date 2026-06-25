import ScoreBar from "./ScoreBar.jsx";

const ratingEmojis = { Good: "✅", Average: "⚠️", Poor: "❌" };

function Badge({ text, color }) {
  const colors = {
    green: "bg-green-500/10 text-green-400 border-green-500/30",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };
  const recEmojis = { green: "✅", yellow: "👀", red: "📈" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border ${colors[color] || colors.blue}`}>
      {recEmojis[color] || ""} {text}
    </span>
  );
}

function Section({ title, children, color = "blue" }) {
  const borderKey = color === "green" ? "emerald" : color;
  return (
    <div className={`glass rounded-2xl p-8 border border-${borderKey}-500/20`}>
      <h2 className={`text-xl font-bold text-${color === "green" ? "emerald" : color}-400 mb-4`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function RecruitResult({ data, onBack }) {
  const { atsScore, summary, strengths, weaknesses, missingElements, improvements, projectFeedback, recommendation } = data;

  const recColor = recommendation?.includes("Strong")
    ? "green"
    : recommendation?.includes("Consider")
    ? "yellow"
    : "red";

  const scoreEmoji = atsScore >= 80 ? "🏆" : atsScore >= 60 ? "👍" : atsScore >= 40 ? "👌" : "📉";

  const projectEmojis = ["📱", "🌐", "⚙️", "🎮", "📊", "🤖", "🛠️", "🧩", "🚀"];

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-8 border border-blue-500/20 text-center">
        <span className="text-6xl">{scoreEmoji}</span>
        <h1 className="text-3xl font-bold text-blue-400 mt-4">ATS Analysis Results</h1>
        <div className="mt-4">
          <Badge text={recommendation} color={recColor} />
        </div>
      </div>

      <Section title="📊 ATS Score" color="blue">
        <ScoreBar label="ATS Compatibility" value={atsScore} color="blue" suffix="/100" />
      </Section>

      <Section title="📋 Resume Summary" color="blue">
        <p className="text-gray-300 leading-relaxed">{summary}</p>
      </Section>

      <div className="grid md:grid-cols-2 gap-8">
        <Section title="✅ Strengths" color="green">
          <ul className="space-y-3">
            {strengths?.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-400 shrink-0">💪</span>
                <span className="text-gray-300">{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="❌ Weaknesses" color="red">
          <ul className="space-y-3">
            {weaknesses?.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-red-400 shrink-0">🚩</span>
                <span className="text-gray-300">{w}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="🔍 Missing Elements" color="yellow">
        <ul className="space-y-3">
          {missingElements?.map((m, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-yellow-400 shrink-0">❗</span>
              <span className="text-gray-300">{m}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="💡 Improvement Suggestions" color="blue">
        {improvements && (
          <div className="grid md:grid-cols-2 gap-6">
            {improvements.skills && (
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-300">🛠️ Skills</h3>
                <p className="text-gray-400 text-sm">{improvements.skills}</p>
              </div>
            )}
            {improvements.projects && (
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-300">🚀 Projects</h3>
                <p className="text-gray-400 text-sm">{improvements.projects}</p>
              </div>
            )}
            {improvements.experience && (
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-300">💼 Experience</h3>
                <p className="text-gray-400 text-sm">{improvements.experience}</p>
              </div>
            )}
            {improvements.education && (
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-300">🎓 Education</h3>
                <p className="text-gray-400 text-sm">{improvements.education}</p>
              </div>
            )}
          </div>
        )}
      </Section>

      {projectFeedback?.length > 0 && (
        <Section title="📁 Project Feedback" color="blue">
          <div className="space-y-6">
            {projectFeedback.map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-200">
                    {projectEmojis[i % projectEmojis.length]} {p.name}
                  </h3>
                  <Badge
                    text={(ratingEmojis[p.rating] || "") + " " + p.rating}
                    color={p.rating === "Good" ? "green" : p.rating === "Average" ? "yellow" : "red"}
                  />
                </div>
                <p className="text-gray-400 text-sm">{p.feedback}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="text-center">
        <button onClick={onBack} className="btn-recruit">
          🔄 Analyze Another Resume
        </button>
      </div>
    </div>
  );
}
