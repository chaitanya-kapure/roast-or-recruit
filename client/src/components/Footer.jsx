import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link
              to="/"
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              RoastOrRecruit
            </Link>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              Get roasted or get hired.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/leaderboard"
                  className="text-gray-500 hover:text-gray-200 transition-colors duration-200 text-sm"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-500 hover:text-gray-200 transition-colors duration-200 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-500 hover:text-gray-200 transition-colors duration-200 text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-500 hover:text-gray-200 transition-colors duration-200 text-sm"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-gray-600 text-sm">
              &copy; 2026 RoastOrRecruit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
