import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Flame, Briefcase, Database, Zap, Users, Eye, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function Admin() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

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
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400">
            Usage Analytics
          </h1>
          <p className="text-gray-500 text-sm">Track users, visits, and resume analyses.</p>
        </div>

        {!stats ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="glass-card rounded-2xl p-6 text-center">
                <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-100">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500 mt-1">Registered Users</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <Eye className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-100">{stats.totalVisits}</div>
                <div className="text-xs text-gray-500 mt-1">Total Visits</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <Activity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-100">{stats.visitsToday}</div>
                <div className="text-xs text-gray-500 mt-1">Visits Today</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <Database className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-100">{stats.total}</div>
                <div className="text-xs text-gray-500 mt-1">Total Analyses</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <Zap className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-100">{stats.last24h}</div>
                <div className="text-xs text-gray-500 mt-1">Last 24h</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-100">
                  {stats.byMode?.find((m) => m.mode === "roast")?.count || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">Roasts</div>
              </div>
            </div>

            {stats.byDay?.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Daily Analyses (Last 30 Days)</h2>
                <div className="space-y-2">
                  {stats.byDay.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 w-24 shrink-0">{day.date}</span>
                      <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-purple-500/40 to-blue-500/40 transition-all"
                          style={{ width: `${Math.min(100, (day.count / Math.max(...stats.byDay.map((d) => d.count))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
