import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function createTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return null;
}

async function sendEmailViaResend(to, subject, html) {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RoastOrRecruit <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.log(`[Auth] Resend API error: ${res.status} ${text}`);
      return false;
    }
    console.log(`[Auth] Email sent via Resend to ${to}`);
    return true;
  } catch (err) {
    console.log(`[Auth] Resend fetch error: ${err.message}`);
    return false;
  }
}

async function sendEmailViaSmtp(to, subject, html) {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"RoastOrRecruit" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Auth] Email sent via SMTP to ${to}`);
    return true;
  } catch (err) {
    console.log(`[Auth] SMTP error: ${err.message}`);
    return false;
  }
}

async function sendOtpEmail(email, otp, type = "signup") {
  const subject = type === "reset" ? "Password Reset OTP — RoastOrRecruit" : "Your OTP for RoastOrRecruit";
  const html = `<div style="background:#0A0A0A;padding:40px;font-family:sans-serif;text-align:center">
    <h1 style="color:#a855f7">RoastOrRecruit</h1>
    <p style="color:#9ca3af">${type === "reset" ? "Your password reset code is:" : "Your verification code is:"}</p>
    <div style="font-size:36px;font-weight:bold;color:#f97316;letter-spacing:8px;margin:20px 0">${otp}</div>
    <p style="color:#6b7280;font-size:12px">Valid for 10 minutes</p>
  </div>`;

  if (await sendEmailViaResend(to, subject, html)) return true;
  if (await sendEmailViaSmtp(to, subject, html)) return true;
  console.log(`[Auth] Email delivery failed — OTP for ${email}: ${otp}`);
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

    sendOtpEmail(email, otp, "signup");
    console.log(`[Auth] Signup: ${email} | OTP: ${otp}`);
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

    sendOtpEmail(email, otp, type);
    console.log(`[Auth] Resend OTP ${type}: ${email} | OTP: ${otp}`);
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
    const user = await User.findOne({ email }).select("_id email name");
    const token = createToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
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
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
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

    sendOtpEmail(email, otp, "reset");
    console.log(`[Auth] Forgot password OTP: ${email} | OTP: ${otp}`);
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
