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

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-none">
          <span style={{ color: "#EF4444" }}>Roast</span>
          <span style={{ color: "var(--text-muted)" }}>Or</span>
          <span style={{ color: "#3B82F6" }}>Recruit</span>
        </h1>

        <p className="text-xl md:text-2xl font-light mb-3" style={{ color: "var(--text-muted)" }}>
          Get roasted <span style={{ color: "var(--accent-secondary)" }}>or</span> get hired.
        </p>
        <p className="max-w-xl mx-auto mb-10 text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
          One resume. Two opinions. Upload yours and see it through two completely different lenses.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => handleMode("roast")} className="btn-roast text-base px-10">
            Roast Me
          </button>
          <button onClick={() => handleMode("recruit")} className="btn-recruit text-base px-10">
            Recruit Me
          </button>
        </div>
      </div>
    </section>
  );
}
