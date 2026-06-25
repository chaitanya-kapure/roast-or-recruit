import ScoreBar from "./ScoreBar.jsx";

const ratingEmojis = { Good: "✅", Average: "⚠️", Poor: "❌" };

const semanticColors = {
  green: { bg: "rgba(16,185,129,0.1)", text: "#10B981", border: "rgba(16,185,129,0.3)" },
  yellow: { bg: "rgba(234,179,8,0.1)", text: "#EAB308", border: "rgba(234,179,8,0.3)" },
  red: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", border: "rgba(239,68,68,0.3)" },
  blue: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6", border: "rgba(59,130,246,0.3)" },
};

function Badge({ text, color }) {
  const c = semanticColors[color] || semanticColors.blue;
  const recEmojis = { green: "✅", yellow: "👀", red: "📈" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
      }}
    >
      {recEmojis[color] || ""} {text}
    </span>
  );
}

function Section({ title, children, color = "blue" }) {
  const c = semanticColors[color] || semanticColors.blue;
  return (
    <div className="glass rounded-2xl p-8" style={{ borderColor: c.border }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: c.text }}>
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
      <div className="glass rounded-2xl p-8 text-center" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
        <span className="text-6xl">{scoreEmoji}</span>
        <h1 className="text-3xl font-bold mt-4" style={{ color: "var(--accent-secondary)" }}>ATS Analysis Results</h1>
        <div className="mt-4">
          <Badge text={recommendation} color={recColor} />
        </div>
      </div>

      <Section title="📊 ATS Score" color="blue">
        <ScoreBar label="ATS Compatibility" value={atsScore} suffix="/100" />
      </Section>

      <Section title="📋 Resume Summary" color="blue">
        <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>{summary}</p>
      </Section>

      <div className="grid md:grid-cols-2 gap-8">
        <Section title="✅ Strengths" color="green">
          <ul className="space-y-3">
            {strengths?.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0" style={{ color: "var(--accent)" }}>💪</span>
                <span style={{ color: "var(--text-secondary)" }}>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="❌ Weaknesses" color="red">
          <ul className="space-y-3">
            {weaknesses?.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0" style={{ color: "#EF4444" }}>🚩</span>
                <span style={{ color: "var(--text-secondary)" }}>{w}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="🔍 Missing Elements" color="yellow">
        <ul className="space-y-3">
          {missingElements?.map((m, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0" style={{ color: "#EAB308" }}>❗</span>
              <span style={{ color: "var(--text-secondary)" }}>{m}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="💡 Improvement Suggestions" color="blue">
        {improvements && (
          <div className="grid md:grid-cols-2 gap-6">
            {improvements.skills && (
              <div className="space-y-2">
                <h3 className="font-semibold" style={{ color: "var(--accent-secondary)" }}>🛠️ Skills</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{improvements.skills}</p>
              </div>
            )}
            {improvements.projects && (
              <div className="space-y-2">
                <h3 className="font-semibold" style={{ color: "var(--accent-secondary)" }}>🚀 Projects</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{improvements.projects}</p>
              </div>
            )}
            {improvements.experience && (
              <div className="space-y-2">
                <h3 className="font-semibold" style={{ color: "var(--accent-secondary)" }}>💼 Experience</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{improvements.experience}</p>
              </div>
            )}
            {improvements.education && (
              <div className="space-y-2">
                <h3 className="font-semibold" style={{ color: "var(--accent-secondary)" }}>🎓 Education</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{improvements.education}</p>
              </div>
            )}
          </div>
        )}
      </Section>

      {projectFeedback?.length > 0 && (
        <Section title="📁 Project Feedback" color="blue">
          <div className="space-y-6">
            {projectFeedback.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: "var(--accent-glow)",
                  borderColor: "var(--accent-glow)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {projectEmojis[i % projectEmojis.length]} {p.name}
                  </h3>
                  <Badge
                    text={(ratingEmojis[p.rating] || "") + " " + p.rating}
                    color={p.rating === "Good" ? "green" : p.rating === "Average" ? "yellow" : "red"}
                  />
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{p.feedback}</p>
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
