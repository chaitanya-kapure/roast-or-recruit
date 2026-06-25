export default function LoadingSpinner({ mode, onCancel }) {
  const isRoast = mode === "roast";

  const roasts = [
    "Scanning for buzzwords...",
    "Counting how many times you wrote 'passionate'...",
    "Evaluating your 'proficient in' claims...",
    "Checking if you actually know React...",
    "Analyzing your GitHub contribution graph...",
    "Measuring the exaggeration ratio...",
    "Calculating brutality score...",
  ];

  const recruits = [
    "Parsing your resume...",
    "Computing ATS compatibility...",
    "Evaluating keyword density...",
    "Checking for missing sections...",
    "Analyzing experience descriptions...",
    "Generating improvement suggestions...",
    "Calculating hiring recommendation...",
  ];

  const messages = isRoast ? roasts : recruits;

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="glass rounded-2xl p-12 space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div
            className="absolute inset-0 rounded-full border-4 animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
            {isRoast ? "⚡" : "📊"}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold" style={{ color: "var(--accent)" }}>
            {isRoast ? "Preparing the Roast..." : "Analyzing Your Resume..."}
          </h3>
          <p className="text-sm animate-pulse" style={{ color: "var(--text-muted)" }} id="loading-message">
            {messages[0]}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>This usually takes a few seconds</p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 text-sm underline transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
