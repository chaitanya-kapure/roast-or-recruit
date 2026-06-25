import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Flame, Briefcase, Database, Zap, Users, Eye, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Admin() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

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
            <BarChart3 className="w-8 h-8" style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-accent)' }}>
            Usage Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">Track users, visits, and resume analyses.</p>
        </div>

        {!stats ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="glass-card rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalUsers}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Registered Users</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent-secondary)' }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalVisits}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Visits</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Activity className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent-tertiary)' }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.visitsToday}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Visits Today</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Database className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent-secondary)' }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Analyses</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.last24h}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Last 24h</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <Flame className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent-secondary)' }} />
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.byMode?.find((m) => m.mode === "roast")?.count || 0}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Roasts</div>
              </div>
            </div>

            {stats.byDay?.length > 0 && (
              <div className="glass-card rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Daily Analyses (Last 30 Days)</h2>
                <div className="space-y-2">
                  {stats.byDay.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>{day.date}</span>
                      <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
                        <div
                          className="h-full rounded-lg transition-all"
                          style={{ width: `${Math.min(100, (day.count / Math.max(...stats.byDay.map((d) => d.count))) * 100)}%`, backgroundImage: 'var(--gradient-brand)', opacity: 0.4 }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right" style={{ color: 'var(--text-secondary)' }}>{day.count}</span>
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
