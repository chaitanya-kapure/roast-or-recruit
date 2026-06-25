import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { socialLinks, developerInfo } from "../config/socialLinks.js";
import { useTheme } from "../context/ThemeContext.jsx";

function SocialCard({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-4 p-4 rounded-xl backdrop-blur-xl ${link.bg} ${link.border} border ${link.hoverBg} transition-all duration-300 hover:scale-[1.02]`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {link.icon === "Github" ? (
          <FaGithub className={`w-5 h-5 ${link.color}`} />
        ) : link.icon === "Linkedin" ? (
          <FaLinkedin className={`w-5 h-5 ${link.color}`} />
        ) : link.icon === "X" ? (
          <FaTwitter className={`w-5 h-5 ${link.color}`} />
        ) : (
          <span className={`text-lg ${link.color}`}>
            {link.icon === "Code2" && "{ }"}
            {link.icon === "ChefHat" && "👨‍🍳"}
            {link.icon === "Terminal" && ">_"}
          </span>
        )}
      </div>
      <span className={`flex-1 text-sm font-medium ${link.color}`}>{link.name}</span>
      <ExternalLink className="w-4 h-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
    </a>
  );
}

export default function Contact() {
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

        <div className="glass-card rounded-2xl p-8 md:p-10 mb-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 shadow-xl shadow-black/30" style={{ borderColor: 'var(--border)' }}>
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{developerInfo.name}</h1>
              <p className="text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>B.Tech IT Student | Full Stack Developer</p>
              <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
                {developerInfo.bio}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Social Profiles</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {socialLinks.map((link) => (
            <SocialCard key={link.name} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}
