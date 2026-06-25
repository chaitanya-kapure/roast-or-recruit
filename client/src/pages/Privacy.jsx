import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const policies = [
  "Resumes are analyzed only for generating feedback.",
  "User data is not sold.",
  "Uploaded resumes are not shared with third parties.",
  "Personal information remains private.",
  "AI-generated feedback is intended for educational and professional improvement purposes.",
];

export default function Privacy() {
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
            <ShieldCheck className="w-8 h-8" style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-accent)' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Your privacy matters. Here is how we handle your data.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="space-y-6">
            {policies.map((policy, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-xl"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent-glow)', border: '1px solid var(--accent-glow)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent-secondary)' }}>{i + 1}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{policy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
