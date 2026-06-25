export default function ModeCard({ type, title, icon, description, detail, onClick }) {
  const isRoast = type === "roast";
  const btnClass = isRoast ? "btn-roast" : "btn-recruit";
  const accent = isRoast ? "text-orange-400" : "text-blue-400";

  return (
    <div
      className="group relative glass-card rounded-2xl p-8 hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-500 cursor-pointer"
      onClick={onClick}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${isRoast ? "from-orange-500/[0.03] to-transparent" : "from-blue-500/[0.03] to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${accent}`}>
          {title}
        </h2>
        <p className="text-gray-300 mb-3 leading-relaxed">{description}</p>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{detail}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={btnClass}
        >
          {isRoast ? "🔥 Try Roaster Mode" : "👔 Try Recruiter Mode"}
        </button>
      </div>
    </div>
  );
}
