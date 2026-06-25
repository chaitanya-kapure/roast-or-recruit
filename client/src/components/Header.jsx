import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header({ onBack }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isInfoPage = ["/about", "/privacy", "/contact", "/signup", "/login", "/verify-otp"].includes(location.pathname);

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
            <nav className="items-center gap-1 hidden sm:flex">
              <Link
                to="/leaderboard"
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                Leaderboard
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                Contact
              </Link>
              <Link
                to="/privacy"
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                Privacy
              </Link>
              {user ? (
                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/10">
                  <span className="text-xs text-purple-400 font-medium truncate max-w-[100px]">{user.email}</span>
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
    </header>
  );
}
