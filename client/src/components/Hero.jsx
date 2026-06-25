import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Hero() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setMode } = useTheme();

  const handleMode = (selectedMode) => {
    if (!token) { navigate("/login"); return; }
    setMode(selectedMode);
  };

  const roastComments = [
    { text: '"Passionate" detected x7', x: "10%", y: "20%", delay: "0s" },
    { text: '"Team player" — really?', x: "5%", y: "45%", delay: "1s" },
    { text: "Buzzword overload! \uD83D\uDEA8", x: "12%", y: "70%", delay: "2s" },
    { text: "Where are the numbers?", x: "8%", y: "35%", delay: "0.5s" },
    { text: "React = \x22proficient\x22?", x: "15%", y: "55%", delay: "1.5s" },
  ];

  const recruitComments = [
    { text: "ATS Score: 68", x: "72%", y: "22%", delay: "0.3s" },
    { text: "Missing: GitHub link", x: "78%", y: "48%", delay: "1.2s" },
    { text: "Skills gap detected", x: "82%", y: "72%", delay: "2.2s" },
    { text: "Strengths: 4 | Weak: 3", x: "75%", y: "35%", delay: "0.8s" },
    { text: "Recommend: Interview", x: "70%", y: "60%", delay: "1.8s" },
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex pointer-events-none">
        <div
          className="w-1/2 h-full"
          style={{ background: "linear-gradient(135deg, var(--bg-secondary), color-mix(in srgb, var(--accent) 10%, var(--bg-secondary)), var(--bg-secondary))" }}
        />
        <div
          className="w-1/2 h-full"
          style={{ background: "linear-gradient(to bottom left, var(--bg-secondary), color-mix(in srgb, var(--accent-secondary) 10%, var(--bg-secondary)), var(--bg-secondary))" }}
        />
      </div>

      <div className="absolute inset-0 flex pointer-events-none">
        <div className="w-1/2 h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse-glow" style={{ backgroundColor: "var(--accent)", opacity: 0.1 }} />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: "var(--accent-secondary)", opacity: 0.1, animationDelay: "2s" }} />
        </div>
        <div className="w-1/2 h-full">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse-glow" style={{ backgroundColor: "var(--accent-secondary)", opacity: 0.1, animationDelay: "2s" }} />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: "var(--accent)", opacity: 0.1 }} />
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(30)].map((_, i) => {
          const side = i < 15 ? "left" : "right";
          const size = 2 + Math.random() * 4;
          return (
            <div
              key={i}
              className="hidden md:block absolute rounded-full"
              style={{
                width: size + "px",
                height: size + "px",
                left: side === "left" ? Math.random() * 45 + "%" : 55 + Math.random() * 45 + "%",
                top: Math.random() * 100 + "%",
                background: side === "left" ? "var(--accent)" : "var(--accent-secondary)",
                opacity: 0.3 + Math.random() * 0.5,
                animation: `particle ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: Math.random() * 10 + "s",
              }}
            />
          );
        })}
      </div>

      {roastComments.map((c, i) => (
        <div
          key={"roast-" + i}
          className="hidden md:block absolute pointer-events-none animate-bounce-soft"
          style={{ left: c.x, top: c.y, animationDelay: c.delay }}
        >
          <div className="glass-card rounded-xl px-3 py-1.5 text-xs whitespace-nowrap" style={{ color: "var(--accent)" }}>
            {c.text}
          </div>
        </div>
      ))}

      {recruitComments.map((c, i) => (
        <div
          key={"recruit-" + i}
          className="hidden md:block absolute pointer-events-none animate-bounce-soft"
          style={{ left: c.x, top: c.y, animationDelay: c.delay }}
        >
          <div className="glass-card rounded-xl px-3 py-1.5 text-xs whitespace-nowrap" style={{ color: "var(--accent-secondary)" }}>
            {c.text}
          </div>
        </div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-none">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-accent)" }}>
            RoastOrRecruit
          </span>
        </h1>

        <p className="text-xl md:text-2xl font-light mb-3" style={{ color: "var(--text-muted)" }}>
          Get roasted <span style={{ color: "var(--accent-secondary)" }}>or</span> get hired.
        </p>
        <p className="max-w-xl mx-auto mb-10 text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
          One resume. Two opinions. Upload yours and see it through two completely different lenses.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => handleMode("roast")} className="btn-roast text-base px-10">
            🔥 Roast Me
          </button>
          <button onClick={() => handleMode("recruit")} className="btn-recruit text-base px-10">
            👔 Recruit Me
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--bg-secondary), transparent)" }}
      />
    </section>
  );
}
