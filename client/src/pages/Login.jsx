import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsOtp) { navigate(`/verify-otp?email=${encodeURIComponent(email)}`); return; }
        throw new Error(data.error);
      }
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">Welcome Back</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                  placeholder="Your password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">Forgot Password?</Link>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
