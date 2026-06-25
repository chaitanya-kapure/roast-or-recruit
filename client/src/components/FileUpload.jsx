import { useState, useRef } from "react";

export default function FileUpload({ mode, onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [hoverDrop, setHoverDrop] = useState(false);
  const inputRef = useRef(null);

  const isRoast = mode === "roast";

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

  const dropBorderColor = dragOver
    ? "var(--accent)"
    : file
    ? "var(--accent)"
    : hoverDrop
    ? "var(--border-hover)"
    : "var(--border)";

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="text-center mb-6">
        <span className="text-4xl">{isRoast ? "🔥" : "👔"}</span>
        <h2 className="text-2xl font-bold mt-3" style={{ color: "var(--accent)" }}>
          {isRoast ? "Upload Your Resume to Get Roasted" : "Upload Your Resume for ATS Analysis"}
        </h2>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>PDF or TXT files (max 5MB)</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHoverDrop(true)}
        onMouseLeave={() => setHoverDrop(false)}
        className="border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all duration-300"
        style={{
          borderColor: dropBorderColor,
          backgroundColor: (dragOver || file) ? "var(--accent-glow)" : "transparent",
        }}
      >
        {file ? (
          <div className="space-y-3">
            <div className="text-5xl">📄</div>
            <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>{file.name}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{formatSize(file.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-sm underline transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-5xl">📄</div>
            <p style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>Click to upload</span> or drag and drop
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>PDF or TXT files only</p>
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
        className="w-full mt-6 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "var(--gradient-brand)",
          boxShadow: "0 10px 15px -3px var(--accent-glow)",
        }}
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
