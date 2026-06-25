import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | otp | reset | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const t = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(t);
    }
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { setError("Enter your email"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("otp");
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const copy = [...otp];
    copy[i] = val;
    setOtp(copy);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("reset");
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "signup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: "", password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {step === "email" && (
            <>
              <h1 className="text-2xl font-bold text-gray-100 mb-2 text-center">Forgot Password</h1>
              <p className="text-gray-500 text-sm text-center mb-6">Enter your email to receive a reset OTP</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
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
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? "Sending..." : "Send Reset OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="text-2xl font-bold text-gray-100 mb-2 text-center">Enter Reset Code</h1>
              <p className="text-gray-500 text-sm text-center mb-2">Enter the 6-digit code sent to</p>
              <p className="text-purple-400 text-sm font-medium text-center mb-6">{email}</p>
              <form onSubmit={handleVerifyOtp}>
                <div className="flex items-center justify-center gap-2 mb-6">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center bg-white/5 border border-white/10 rounded-xl text-xl font-bold text-gray-200 focus:outline-none focus:border-purple-500/40 transition-colors"
                    />
                  ))}
                </div>
                {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="text-xs text-gray-500 hover:text-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">Set New Password</h1>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                      placeholder="At least 6 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mb-5">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">Password Reset</h1>
              <p className="text-gray-500 text-sm mb-6">Your password has been reset successfully.</p>
              <Link
                to="/login"
                className="inline-block w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 transition-all text-sm text-center"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
