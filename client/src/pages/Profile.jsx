import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, ShieldCheck, Lock, Eye, EyeOff, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, token, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
      setChanging(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setChanging(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return null;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <p style={{ color: "var(--text-muted)" }} className="mb-4">Please sign in to view your profile.</p>
          <Link to="/login" style={{ color: "var(--accent-secondary)" }} className="hover:opacity-80">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--accent-glow)" }}>
              <User className="w-7 h-7" style={{ color: "var(--accent-secondary)" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{user.name || "User"}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {user.verified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                <span style={{ color: "var(--accent)" }}>Email Verified</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--accent-tertiary)" }} />
                <span style={{ color: "var(--accent-tertiary)" }}>Email Not Verified</span>
              </>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl px-10 py-3 text-sm transition-colors input-theme"
                  placeholder="Current password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--text-muted)" }}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl px-10 py-3 text-sm transition-colors input-theme"
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs" style={{ color: "var(--accent)" }}>{error}</p>}
            {success && <p className="text-xs" style={{ color: "var(--accent)" }}>{success}</p>}
            <button
              type="submit"
              disabled={changing}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 text-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              {changing ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ color: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
