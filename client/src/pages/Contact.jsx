import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { socialLinks, developerInfo } from "../config/socialLinks.js";

function SocialCard({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-4 p-4 rounded-xl backdrop-blur-xl ${link.bg} ${link.border} border ${link.hoverBg} transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className={`w-10 h-10 rounded-lg ${link.bg} border ${link.border} flex items-center justify-center`}>
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
      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
    </a>
  );
}

export default function Contact() {
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

        <div className="glass-card rounded-2xl p-8 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 shadow-xl shadow-black/30">
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">{developerInfo.name}</h1>
              <p className="text-purple-400 text-sm mb-2">B.Tech IT Student | Full Stack Developer</p>
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                {developerInfo.bio}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-200 mb-6 text-center">Social Profiles</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {socialLinks.map((link) => (
            <SocialCard key={link.name} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}
