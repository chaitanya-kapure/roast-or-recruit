export default function ModeCard({ type, title, icon, description, detail, onClick }) {
  const isRoast = type === "roast";
  const btnClass = isRoast ? "btn-roast" : "btn-recruit";

  return (
    <div
      className="group relative glass-card rounded-2xl p-8 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
      style={{ borderColor: "var(--glass-border)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, var(--accent-glow), transparent)",
        }}
      />
      <div className="relative">
        {icon && (
          <div
            className="inline-flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 p-4 rounded-xl"
            style={{ backgroundColor: "var(--accent-glow)" }}
          >
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--accent)" }}>
          {title}
        </h2>
        <p className="mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
          {detail}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={btnClass}
        >
          {isRoast ? "Try Roaster Mode" : "Try Recruiter Mode"}
        </button>
      </div>
    </div>
  );
}
