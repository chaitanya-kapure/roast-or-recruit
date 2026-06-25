import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

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

  const handleOtpNext = () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setStep("reset");
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "reset" }),
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
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the complete OTP"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
    } catch (err) {
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {step === "email" && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">Forgot Password</h1>
              <p className="text-[var(--text-muted)] text-sm text-center mb-6">Enter your email to receive a reset OTP</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl px-10 py-3 text-sm placeholder-gray-600 transition-colors input-theme"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                {error && <p className="text-[var(--accent)] text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 text-sm"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {loading ? "Sending..." : "Send Reset OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">Enter Reset Code</h1>
              <p className="text-[var(--text-muted)] text-sm text-center mb-2">Enter the 6-digit code sent to</p>
              <p className="text-[var(--accent-secondary)] text-sm font-medium text-center mb-6">{email}</p>
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center rounded-xl text-xl font-bold transition-colors input-theme"
                  />
                ))}
              </div>
              {error && <p className="text-[var(--accent)] text-xs mb-4">{error}</p>}
              <button
                onClick={handleOtpNext}
                disabled={otp.join("").length !== 6}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 text-sm"
                style={{ background: "var(--gradient-brand)" }}
              >
                Continue
              </button>
              <div className="mt-4 text-center">
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="text-xs text-[var(--text-muted)] hover:text-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">Set New Password</h1>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl px-10 py-3 text-sm placeholder-gray-600 transition-colors input-theme"
                      placeholder="At least 6 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-[var(--accent)] text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 text-sm"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border mb-5" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                <svg className="w-7 h-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Password Reset</h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">Your password has been reset successfully.</p>
              <Link
                to="/login"
                className="inline-block w-full py-3 rounded-xl font-semibold text-white transition-all text-sm text-center"
                style={{ background: "var(--gradient-brand)" }}
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
