import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Briefcase, Trophy, Medal, Skull } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Leaderboard() {
  const [tab, setTab] = useState("roast");
  const [data, setData] = useState({ roast: [], recruit: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.roast) setData(d);
        else setData({ roast: d, recruit: [] });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = tab === "roast" ? data.roast : data.recruit;

  const getBadge = (index) => {
    if (index === 0) return { icon: Trophy, color: "var(--accent-tertiary)", bg: "var(--accent-glow)" };
    if (index === 1) return { icon: Medal, color: "var(--text-secondary)", bg: "var(--bg-card-hover)" };
    if (index === 2) return { icon: Medal, color: "var(--accent)", bg: "var(--accent-glow)" };
    return { icon: null, color: "", bg: "" };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all text-sm hover:text-white mb-10"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: 'var(--accent-glow)', border: '1px solid var(--accent-glow)' }}>
            <Trophy className="w-8 h-8" style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-accent)' }}>
            Leaderboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">The most brutally roasted and top-scoring resumes.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setTab("roast")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all border ${
              tab === "roast" ? "" : ""
            }`}
            style={tab === "roast" ? { backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', borderColor: 'var(--accent-glow)' } : { backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            <Flame className="w-4 h-4" />
            Roasts
          </button>
          <button
            onClick={() => setTab("recruit")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all border ${
              tab === "recruit" ? "" : ""
            }`}
            style={tab === "recruit" ? { backgroundColor: 'var(--accent-glow)', color: 'var(--accent-secondary)', borderColor: 'var(--accent-glow)' } : { backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            <Briefcase className="w-4 h-4" />
            Recruits
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No entries yet. Be the first!</div>
        ) : (
          <div className="space-y-3">
            {items.map((entry, i) => {
              const badge = getBadge(i);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={entry._id || entry.id}
                  className={`glass-card rounded-2xl p-5 flex items-center gap-5 transition-all duration-300${i < 3 ? "" : ""}`}
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: badge.bg }}>
                    {BadgeIcon ? (
                      <BadgeIcon className="w-5 h-5" style={{ color: badge.color }} />
                    ) : (
                      <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {entry.userEmail || entry.file_name || "Anonymous"}
                      </span>
                      {tab === "roast" && (
                        <Skull className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                      )}
                    </div>
                    {entry.verdict && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{entry.verdict}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black" style={{ color: tab === "roast" ? 'var(--accent)' : 'var(--accent-secondary)' }}>
                      {entry.score}
                      <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(entry.createdAt || entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
