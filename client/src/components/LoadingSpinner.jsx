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
  const color = isRoast ? "text-red-400" : "text-blue-400";
  const borderColor = isRoast ? "border-red-500" : "border-blue-500";

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="glass rounded-2xl p-12 space-y-6">
        <div className={`relative mx-auto w-20 h-20`}>
          <div className={`absolute inset-0 rounded-full border-4 ${borderColor}/30`} />
          <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${borderColor} animate-spin`} />
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
            {isRoast ? "🔥" : "👔"}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`text-xl font-bold ${color}`}>
            {isRoast ? "Preparing the Roast..." : "Analyzing Your Resume..."}
          </h3>
          <p className="text-gray-400 text-sm animate-pulse" id="loading-message">
            {messages[0]}
          </p>
          <p className="text-gray-600 text-xs">This usually takes a few seconds</p>
          {onCancel && (
            <button onClick={onCancel} className="mt-4 text-sm text-gray-500 hover:text-gray-300 underline transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
