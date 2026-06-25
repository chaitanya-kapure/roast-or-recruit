import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="relative border-t"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link
              to="/"
              className="text-xl font-bold transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              RoastOrRecruit
            </Link>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Get roasted or get hired.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
              Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/leaderboard"
                  className="text-sm transition-colors duration-200"
                  style={{ color: "var(--text-muted)" }}
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm transition-colors duration-200"
                  style={{ color: "var(--text-muted)" }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm transition-colors duration-200"
                  style={{ color: "var(--text-muted)" }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm transition-colors duration-200"
                  style={{ color: "var(--text-muted)" }}
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              &copy; 2026 RoastOrRecruit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
