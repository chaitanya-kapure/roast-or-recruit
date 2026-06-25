import { useState, useRef } from "react";

export default function FileUpload({ mode, onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const isRoast = mode === "roast";
  const accent = isRoast ? "red" : "blue";

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "application/pdf" || f.type === "text/plain")) {
      setFile(f);
    }
  };

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = () => {
    if (file) onAnalyze(file);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  return (
    <div className="glass rounded-2xl p-8">
      <div className="text-center mb-6">
        <span className="text-4xl">{isRoast ? "🔥" : "👔"}</span>
        <h2 className={`text-2xl font-bold mt-3 ${isRoast ? "text-red-400" : "text-blue-400"}`}>
          {isRoast ? "Upload Your Resume to Get Roasted" : "Upload Your Resume for ATS Analysis"}
        </h2>
        <p className="text-gray-400 mt-2">PDF or TXT files (max 5MB)</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? `border-${accent}-400 bg-${accent}-500/5`
            : file
            ? `border-${accent}-500/50 bg-${accent}-500/5`
            : "border-gray-700 hover:border-gray-500"
        }`}
        style={{
          borderColor: dragOver
            ? (isRoast ? "#f87171" : "#60a5fa")
            : file
            ? (isRoast ? "#ef4444" : "#3b82f6")
            : undefined,
        }}
      >
        {file ? (
          <div className="space-y-3">
            <div className="text-5xl">{isRoast ? "📄" : "📄"}</div>
            <p className="text-lg font-medium text-gray-200">{file.name}</p>
            <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-sm text-gray-500 hover:text-gray-300 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">📄</div>
            <p className="text-gray-300">
              <span className={`text-${accent}-400 font-medium`}>Click to upload</span> or drag and drop
            </p>
            <p className="text-gray-500 text-sm">PDF or TXT files only</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full mt-6 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
          isRoast
            ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25"
            : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          `Analyze Resume`
        )}
      </button>
    </div>
  );
}
