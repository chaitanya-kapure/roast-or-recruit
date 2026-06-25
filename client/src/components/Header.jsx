import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Header({ onBack }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleMode, isRoast } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isInfoPage = ["/about", "/privacy", "/contact", "/signup", "/login", "/verify-otp", "/forgot-password", "/profile"].includes(location.pathname);

  const navLinks = [
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/privacy", label: "Privacy" },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          RoastOrRecruit
        </Link>

        <div className="flex items-center gap-3">
          {isInfoPage ? (
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border transition-all text-sm"
              style={{
                backgroundColor: "var(--glass-bg)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          ) : (
            <>
              <nav className="items-center gap-1 hidden sm:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3 py-2 rounded-lg text-sm transition-all"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  onClick={toggleMode}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: "var(--glass-bg)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {isRoast ? "Roast" : "Recruit"}
                </button>

                {user ? (
                  <div
                    className="flex items-center gap-1 ml-2 pl-3 border-l"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Link
                      to="/profile"
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ color: "var(--accent-secondary)" }}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="ml-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Sign In
                  </Link>
                )}
              </nav>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 rounded-lg transition-all"
                style={{ color: "var(--text-muted)" }}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}

          {onBack && !isInfoPage && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border transition-all text-sm"
              style={{
                backgroundColor: "var(--glass-bg)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>
      </div>

      {menuOpen && !isInfoPage && (
        <div
          className="sm:hidden border-t backdrop-blur-xl"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{ color: "var(--text-muted)" }}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => { toggleMode(); setMenuOpen(false); }}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-all"
              style={{
                backgroundColor: "var(--glass-bg)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
               {isRoast ? "Roast Mode" : "Recruit Mode"}
            </button>

            <div
              className="pt-2 border-t mt-2"
              style={{ borderColor: "var(--border)" }}
            >
              {user ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{ color: "var(--accent-secondary)" }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={{ color: "var(--accent)" }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-center text-white transition-all"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
