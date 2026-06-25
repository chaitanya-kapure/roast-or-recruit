export default function Hero({ onSelectMode }) {
  const roastComments = [
    { text: '"Passionate" detected x7', x: "10%", y: "20%", delay: "0s" },
    { text: '"Team player" — really?', x: "5%", y: "45%", delay: "1s" },
    { text: "Buzzword overload! 🚨", x: "12%", y: "70%", delay: "2s" },
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
        <div className="w-1/2 h-full bg-gradient-to-br from-[#0A0A0A] via-[#1a0a04] to-[#0A0A0A]" />
        <div className="w-1/2 h-full bg-gradient-to-bl from-[#0A0A0A] via-[#040a1a] to-[#0A0A0A]" />
      </div>

      <div className="absolute inset-0 flex pointer-events-none">
        <div className="w-1/2 h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]" style={{ animationDelay: "2s" }} />
        </div>
        <div className="w-1/2 h-full">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(30)].map((_, i) => {
          const side = i < 15 ? "left" : "right";
          const size = 2 + Math.random() * 4;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size + "px",
                height: size + "px",
                left: side === "left" ? Math.random() * 45 + "%" : 55 + Math.random() * 45 + "%",
                top: Math.random() * 100 + "%",
                background: side === "left"
                  ? `rgba(255, ${100 + Math.random() * 55}, ${Math.random() * 50}, ${0.3 + Math.random() * 0.5})`
                  : `rgba(${50 + Math.random() * 100}, ${150 + Math.random() * 105}, 255, ${0.3 + Math.random() * 0.5})`,
                animation: `particle ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: Math.random() * 10 + "s",
                opacity: 0,
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
          <div className="glass-card rounded-xl px-3 py-1.5 text-xs text-orange-300/70 border-orange-500/10 whitespace-nowrap">
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
          <div className="glass-card rounded-xl px-3 py-1.5 text-xs text-blue-300/70 border-blue-500/10 whitespace-nowrap">
            {c.text}
          </div>
        </div>
      ))}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/[0.06] mb-8 text-xs text-gray-400 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          
        </div> */}

        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight leading-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 via-purple-400 to-blue-400">
            RoastOrRecruit
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 font-light mb-3">
          Get roasted <span className="text-orange-400 font-normal">or</span> get hired.
        </p>
        <p className="text-gray-600 max-w-xl mx-auto mb-10 text-sm md:text-base">
          One resume. Two opinions. Upload yours and see it through two completely different lenses.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => onSelectMode("roast")} className="btn-roast text-base px-10">
            🔥 Roast Me
          </button>
          <button onClick={() => onSelectMode("recruit")} className="btn-recruit text-base px-10">
            👔 Recruit Me
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
    </section>
  );
}
