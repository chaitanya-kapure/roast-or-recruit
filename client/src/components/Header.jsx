import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

export default function Header({ onBack }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isInfoPage = ["/about", "/privacy", "/contact", "/signup", "/login", "/verify-otp", "/forgot-password", "/profile"].includes(location.pathname);

  const navLinks = [
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/privacy", label: "Privacy" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A0A]/80 border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
        >
          RoastOrRecruit
        </Link>

        <div className="flex items-center gap-3">
          {isInfoPage ? (
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-gray-300 hover:text-white"
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
                    className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <div className="flex items-center gap-1 ml-2 pl-3 border-l border-white/10">
                    <Link
                      to="/profile"
                      className="px-3 py-1.5 rounded-lg text-xs text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-all"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="ml-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </nav>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-gray-300 hover:text-white"
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
        <div className="sm:hidden border-t border-white/[0.04] bg-[#0A0A0A]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 mt-2">
              {user ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-purple-400 hover:bg-purple-500/10 transition-all"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-center text-white bg-gradient-to-r from-purple-600 to-blue-500"
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
