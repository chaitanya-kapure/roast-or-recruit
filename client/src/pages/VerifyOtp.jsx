import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (cooldown > 0) {
      const t = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(t);
    }
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const copy = [...otp];
    copy[i] = val;
    setOtp(copy);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e) => {
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
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
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

  if (!email) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No email provided.</p>
          <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-5">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Verify Your Email</h1>
          <p className="text-gray-500 text-sm mb-2">Enter the 6-digit code sent to</p>
          <p className="text-purple-400 text-sm font-medium mb-6">{email}</p>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center gap-2 mb-6">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
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
          <div className="mt-4">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-xs text-gray-500 hover:text-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
