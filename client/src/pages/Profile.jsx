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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to view your profile.</p>
          <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-xl mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <User className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">{user.name || "User"}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {user.verified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Email Verified</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-400">Email Not Verified</span>
              </>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                  placeholder="Current password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                  placeholder="At least 6 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {success && <p className="text-green-400 text-xs">{success}</p>}
            <button
              type="submit"
              disabled={changing}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all disabled:opacity-50 text-sm"
            >
              {changing ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
