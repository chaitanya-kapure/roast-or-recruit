import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const RESEND_FROM = process.env.RESEND_FROM;

if (!resend) {
  console.error("[Auth] ⚠ RESEND_API_KEY not set — emails will not be sent");
}
if (!RESEND_FROM) {
  console.error("[Auth] ⚠ RESEND_FROM not set — emails will not be sent");
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

async function sendEmail(to, subject, html) {
  if (!resend || !RESEND_FROM) {
    console.error(`[Auth] Email skipped — RESEND_API_KEY or RESEND_FROM not configured`);
    return false;
  }
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Auth] Email sent via Resend to ${to}`);
    return true;
  } catch (err) {
    console.log(`[Auth] Resend error: ${err.message}`);
    return false;
  }
}

function buildOtpEmailHtml(otp, type = "signup") {
  const title = type === "reset" ? "Password Reset Code" : "Email Verification Code";
  const subtitle = type === "reset"
    ? "You requested a password reset for your RoastOrRecruit account."
    : "Use this code to verify your email address for RoastOrRecruit.";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:32px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px">
        <tr>
          <td align="center" style="padding-bottom:8px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:10px;height:28px;background:linear-gradient(180deg,#a855f7,#3b82f6);border-radius:4px 0 0 4px"></td>
              <td style="padding:0 12px;font-size:20px;font-weight:800;color:#ffffff">RoastOrRecruit</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border:1px solid #1f1f1f;border-radius:16px;padding:40px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" style="width:56px;height:56px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:14px">
                    <tr><td align="center" style="font-size:24px">🛡️</td></tr>
                  </table>
                </td>
              </tr>
              <tr><td height="20"></td></tr>
              <tr><td align="center" style="font-size:22px;font-weight:700;color:#f3f4f6">${title}</td></tr>
              <tr><td height="8"></td></tr>
              <tr><td align="center" style="font-size:14px;color:#9ca3af;line-height:1.5">${subtitle}</td></tr>
              <tr><td height="24"></td></tr>
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:16px 40px;display:inline-block">
                    <tr><td align="center" style="font-size:36px;font-weight:bold;color:#fbbf24;letter-spacing:12px;font-family:monospace">${otp}</td></tr>
                  </table>
                </td>
              </tr>
              <tr><td height="24"></td></tr>
              <tr><td align="center" style="font-size:13px;color:#6b7280">This code expires in <strong style="color:#9ca3af">10 minutes</strong></td></tr>
              <tr><td height="8"></td></tr>
              <tr><td align="center" style="font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email.</td></tr>
            </table>
          </td>
        </tr>
        <tr><td height="24"></td></tr>
        <tr>
          <td align="center" style="font-size:12px;color:#525252;line-height:1.6">
            Sent by <strong style="color:#737373">RoastOrRecruit Security Team</strong><br>
            You received this because someone attempted to ${type === "reset" ? "reset the password for your RoastOrRecruit account" : "create a RoastOrRecruit account with this email address"}.<br>
            If you have questions, contact <a href="mailto:support@roastorrecruit.live" style="color:#6b7280;text-decoration:underline">support@roastorrecruit.live</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

async function sendOtpEmail(email, otp, type = "signup") {
  const subject = type === "reset"
    ? "Reset your RoastOrRecruit password — OTP enclosed"
    : "Verify your RoastOrRecruit email — OTP enclosed";
  const html = buildOtpEmailHtml(otp, type);

  if (await sendEmail(email, subject, html)) return true;
  console.error(`[Auth] Email delivery FAILED for ${email} (type: ${type})`);
  return false;
}

// Rate limiter store (in-memory)
const rateLimitStore = new Map();
function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count++;
  }
  rateLimitStore.set(key, entry);
  return { allowed: entry.count <= maxAttempts, remaining: Math.max(0, maxAttempts - entry.count) };
}

// ─── Signup ──────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.verified) {
        return res.status(409).json({ error: "Email already registered" });
      }
      await User.deleteOne({ email });
      await Otp.deleteMany({ email });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, name: name || null });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({ email, otp, type: "signup", expiresAt });

    const sent = await sendOtpEmail(email, otp, "signup");
    if (!sent) {
      await User.deleteOne({ email });
      await Otp.deleteMany({ email });
      return res.status(500).json({ error: "Failed to send OTP email. Please try again." });
    }
    console.log(`[Auth] Signup OTP sent: ${email}`);
    res.json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error("[Auth] Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Resend OTP ──────────────────────────────────────────────────
router.post("/resend-otp", async (req, res) => {
  try {
    const { email, type = "signup" } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const rl = checkRateLimit(`resend:${email}`, 3, 60000);
    if (!rl.allowed) {
      return res.status(429).json({ error: `Too many requests. Try again in 60s.` });
    }

    await Otp.deleteMany({ email, type, used: false });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({ email, otp, type, expiresAt });

    const sent = await sendOtpEmail(email, otp, type);
    if (!sent) {
      await Otp.deleteOne({ email, otp });
      return res.status(500).json({ error: "Failed to send OTP email. Please try again." });
    }
    console.log(`[Auth] Resend OTP ${type}: ${email}`);
    res.json({ message: "OTP resent", email });
  } catch (err) {
    console.error("[Auth] Resend OTP error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Verify OTP ──────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
    }

    const rl = checkRateLimit(`verify:${email}`, 10, 60000);
    if (!rl.allowed) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    const record = await Otp.findOne({ email, otp, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await Otp.findByIdAndUpdate(record._id, { used: true });
    await User.findOneAndUpdate({ email }, { verified: true });
    const user = await User.findOne({ email }).select("_id email name verified");
    const token = createToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, verified: user.verified } });
  } catch (err) {
    console.error("[Auth] Verify OTP error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Login ───────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const rl = checkRateLimit(`login:${email}`, 10, 60000);
    if (!rl.allowed) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.verified) {
      return res.status(403).json({ error: "Email not verified. Please verify first.", needsOtp: true, email });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = createToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, verified: user.verified } });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Forgot Password (send OTP) ──────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const rl = checkRateLimit(`forgot:${email}`, 3, 60000);
    if (!rl.allowed) {
      return res.status(429).json({ error: "Too many requests. Try again in 60s." });
    }

    await Otp.deleteMany({ email, type: "reset", used: false });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({ email, otp, type: "reset", expiresAt });
    await User.updateOne({ email }, { resetOtp: otp, resetOtpExpires: expiresAt });

    const sent = await sendOtpEmail(email, otp, "reset");
    if (!sent) {
      await Otp.deleteOne({ email, otp });
      await User.updateOne({ email }, { resetOtp: null, resetOtpExpires: null });
      return res.status(500).json({ error: "Failed to send OTP email. Please try again." });
    }
    console.log(`[Auth] Forgot password OTP sent: ${email}`);
    res.json({ message: "Reset OTP sent to email", email });
  } catch (err) {
    console.error("[Auth] Forgot password error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Reset Password ──────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ error: "Email, OTP, and new password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const rl = checkRateLimit(`reset:${email}`, 5, 60000);
    if (!rl.allowed) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    const record = await Otp.findOne({ email, otp, type: "reset", used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { password: hashed, resetOtp: null, resetOtpExpires: null });
    await Otp.findByIdAndUpdate(record._id, { used: true });
    await Otp.deleteMany({ email, type: "reset", used: false });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("[Auth] Reset password error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Change Password (authenticated) ─────────────────────────────
router.post("/change-password", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("[Auth] Change password error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get current user ────────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id email name verified");
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user: { id: user._id, email: user.email, name: user.name, verified: user.verified } });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
