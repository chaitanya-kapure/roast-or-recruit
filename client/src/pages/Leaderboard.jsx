import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Briefcase, Trophy, Medal, Skull } from "lucide-react";
import { useState, useEffect } from "react";

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
    if (index === 0) return { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/20" };
    if (index === 1) return { icon: Medal, color: "text-gray-300", bg: "bg-gray-400/20" };
    if (index === 2) return { icon: Medal, color: "text-orange-400", bg: "bg-orange-500/20" };
    return { icon: null, color: "", bg: "" };
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-gray-300 hover:text-white mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-6">
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400">
            Leaderboard
          </h1>
          <p className="text-gray-500 text-sm">The most brutally roasted and top-scoring resumes.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setTab("roast")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === "roast"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300"
            }`}
          >
            <Flame className="w-4 h-4" />
            Roasts
          </button>
          <button
            onClick={() => setTab("recruit")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === "recruit"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Recruits
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No entries yet. Be the first!</div>
        ) : (
          <div className="space-y-3">
            {items.map((entry, i) => {
              const badge = getBadge(i);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={entry._id || entry.id}
                  className={`glass-card rounded-2xl p-5 flex items-center gap-5 transition-all duration-300 hover:border-white/[0.15] ${
                    i < 3 ? "border-white/[0.1]" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badge.bg}`}>
                    {BadgeIcon ? (
                      <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                    ) : (
                      <span className="text-sm text-gray-500 font-bold">{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {entry.userEmail || entry.file_name || "Anonymous"}
                      </span>
                      {tab === "roast" && (
                        <Skull className="w-3.5 h-3.5 text-orange-400/60 shrink-0" />
                      )}
                    </div>
                    {entry.verdict && (
                      <p className="text-xs text-gray-500 truncate">{entry.verdict}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-2xl font-black ${tab === "roast" ? "text-orange-400" : "text-blue-400"}`}>
                      {entry.score}
                      <span className="text-xs text-gray-600 font-normal">/100</span>
                    </div>
                    <div className="text-[10px] text-gray-600">
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
