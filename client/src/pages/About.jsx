import { Link } from "react-router-dom";
import { ArrowLeft, Shield, User, FileText } from "lucide-react";
import { developerInfo } from "../config/socialLinks.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function About() {
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
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-accent)' }}>
            About RoastOrRecruit
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            RoastOrRecruit is an AI-powered resume analysis platform that evaluates resumes from two unique perspectives
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="glass-card rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent-glow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔥</span>
              <h2 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>Roaster Mode</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Provides humorous, constructive criticism and identifies weak points in resumes.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent-glow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">👔</span>
              <h2 className="text-xl font-bold" style={{ color: 'var(--accent-secondary)' }}>Recruiter Mode</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Provides ATS scoring, strengths, weaknesses, and actionable recommendations to improve hiring chances.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <User className="w-6 h-6" style={{ color: 'var(--accent-secondary)' }} />
            Developer
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0">
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 shadow-xl shadow-black/30" style={{ borderColor: 'var(--border)' }}>
                <img
                  src="/c.jpeg"
                  alt={developerInfo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.classList.add("flex", "items-center", "justify-center", "bg-gradient-to-br", "from-orange-500/20", "to-blue-500/20");
                    e.target.parentElement.innerHTML = `<span class="text-4xl text-gray-400">📸</span>`;
                  }}
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{developerInfo.name}</h3>
              <p className="text-sm mb-1" style={{ color: 'var(--accent-secondary)' }}>{developerInfo.role}</p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{developerInfo.college}</p>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>E-Mail</h4>
                <div className="flex flex-wrap gap-2">
                  {developerInfo.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 rounded-lg text-xs backdrop-blur-xl"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
