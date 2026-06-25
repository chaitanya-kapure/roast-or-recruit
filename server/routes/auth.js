import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  connectionTimeout: 15000,
  socketTimeout: 15000,
});

async function sendOtpEmail(email, otp) {
  if (process.env.SMTP_USER) {
    try {
      await transporter.sendMail({
        from: `"RoastOrRecruit" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your OTP for RoastOrRecruit",
        html: `<div style="background:#0A0A0A;padding:40px;font-family:sans-serif;text-align:center">
          <h1 style="color:#a855f7">RoastOrRecruit</h1>
          <p style="color:#9ca3af">Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;color:#f97316;letter-spacing:8px;margin:20px 0">${otp}</div>
          <p style="color:#6b7280;font-size:12px">Valid for 10 minutes</p>
        </div>`,
      });
      console.log(`[Auth] OTP email sent to ${email}`);
      return true;
    } catch (err) {
      console.log(`[Auth] Failed to send email: ${err.message}`);
      return false;
    }
  }
  return false;
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.verified) {
        return res.status(409).json({ error: "Email already registered" });
      }
      // Unverified user — delete old record and let them retry
      await User.deleteOne({ email });
      await Otp.deleteMany({ email });
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, name: name || null });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.create({ email, otp, expiresAt });

    sendOtpEmail(email, otp).catch(() => {});
    console.log(`[Auth] Signup: ${email} | OTP: ${otp}`);
    res.json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error("[Auth] Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.verified) {
      return res.status(403).json({ error: "Email not verified. Please sign up again.", needsOtp: true, email });
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

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id email name");
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
