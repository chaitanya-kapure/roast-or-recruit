import { Router } from "express";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/upload.js";
import { createGeminiService } from "../services/geminiService.js";
import { logUsage, logVisit, getStats, getLeaderboard } from "../services/db.js";
import UsageLog from "../models/UsageLog.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET;
const MAX_ANALYSES = 4;
const router = Router();

function getUserEmail(req) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    return decoded.email || null;
  } catch {
    return null;
  }
}

function safeJson(res, data, status = 200) {
  if (data === null || data === undefined) {
    console.error("[safeJson] Data is null/undefined, sending fallback");
    return res.status(status).json({ error: "Server returned empty response" });
  }
  const body = JSON.stringify(data);
  if (!body || body === "null" || body === "undefined") {
    console.error("[safeJson] JSON.stringify produced empty result");
    return res.status(status).json({ error: "Server serialization failed" });
  }
  return res.status(status).json(data);
}

async function extractText(filePath, mimetype) {
  if (mimetype === "text/plain") {
    return await fs.readFile(filePath, "utf-8");
  }
  if (mimetype === "application/pdf") {
    const buf = await fs.readFile(filePath);
    const data = await pdfParse(buf);
    return data.text;
  }
  throw new Error("Unsupported file type");
}

async function checkRateLimit(email, ip) {
  const key = email || ip || "global";
  const field = email ? "userEmail" : "ip";
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const records = await UsageLog.find({ [field]: key, success: true, cached: false, createdAt: { $gte: since } }).sort({ createdAt: 1 }).select("createdAt").lean();
  const count = records.length;
  if (count < MAX_ANALYSES) return { allowed: true, used: count, limit: MAX_ANALYSES };
  const oldest = new Date(records[0].createdAt);
  const resetAt = new Date(oldest.getTime() + 60 * 60 * 1000);
  return { allowed: false, used: count, limit: MAX_ANALYSES, resetAt: resetAt.toISOString() };
}

router.post("/roast", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const email = getUserEmail(req);
    if (!email) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(401).json({ error: "Sign in required to analyze" });
    }
    const limit = await checkRateLimit(email, req.ip);
    if (!limit.allowed) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      const waitMs = limit.resetAt ? new Date(limit.resetAt).getTime() - Date.now() : 3600000;
      const waitMin = Math.ceil(waitMs / 60000);
      return res.status(429).json({ error: `Free limit reached (${limit.used}/${limit.limit}). Try again in ${waitMin} min.`, used: limit.used, limit: limit.limit, resetAt: limit.resetAt });
    }
    console.log(`[Roast] File: ${req.file.originalname} (${req.file.size} bytes) | User: ${email || req.ip}`);
    const text = await extractText(req.file.path, req.file.mimetype);
    console.log(`[Roast] Extracted text: ${text.length} chars`);
    const service = createGeminiService();
    const { data: result, cached } = await service.analyzeRoast(text);
    await fs.unlink(req.file.path).catch(() => {});
    console.log(`[Roast] Result: brutalityScore=${result.brutalityScore}, roasts=${result.roasts?.length}`);
    await logUsage({ mode: "roast", fileName: req.file.originalname, fileSize: req.file.size, score: result.brutalityScore, verdict: result.verdict, cached: cached ? 1 : 0, userEmail: email, ip: email ? undefined : req.ip });
    safeJson(res, { ...result, _rateLimit: { used: limit.used + 1, limit: MAX_ANALYSES } });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    const msg = err?.message || err?.toString() || "Analysis failed";
    console.error("[Roast Error]", msg);
    await logUsage({ mode: "roast", fileName: req.file?.originalname, fileSize: req.file?.size, success: 0, userEmail: getUserEmail(req), ip: getUserEmail(req) ? undefined : req.ip });
    res.status(500).json({ error: msg });
  }
});

router.post("/recruit", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const email = getUserEmail(req);
    if (!email) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(401).json({ error: "Sign in required to analyze" });
    }
    const limit = await checkRateLimit(email, req.ip);
    if (!limit.allowed) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      const waitMs = limit.resetAt ? new Date(limit.resetAt).getTime() - Date.now() : 3600000;
      const waitMin = Math.ceil(waitMs / 60000);
      return res.status(429).json({ error: `Free limit reached (${limit.used}/${limit.limit}). Try again in ${waitMin} min.`, used: limit.used, limit: limit.limit, resetAt: limit.resetAt });
    }
    console.log(`[Recruit] File: ${req.file.originalname} (${req.file.size} bytes) | User: ${email || req.ip}`);
    const text = await extractText(req.file.path, req.file.mimetype);
    console.log(`[Recruit] Extracted text: ${text.length} chars`);
    const service = createGeminiService();
    const { data: result, cached } = await service.analyzeRecruit(text);
    await fs.unlink(req.file.path).catch(() => {});
    console.log(`[Recruit] Result: atsScore=${result.atsScore}, recommendation=${result.recommendation}`);
    await logUsage({ mode: "recruit", fileName: req.file.originalname, fileSize: req.file.size, score: result.atsScore, verdict: result.recommendation, cached: cached ? 1 : 0, userEmail: email, ip: email ? undefined : req.ip });
    safeJson(res, { ...result, _rateLimit: { used: limit.used + 1, limit: MAX_ANALYSES } });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    const msg = err?.message || err?.toString() || "Analysis failed";
    console.error("[Recruit Error]", msg);
    await logUsage({ mode: "recruit", fileName: req.file?.originalname, fileSize: req.file?.size, success: 0, userEmail: getUserEmail(req), ip: getUserEmail(req) ? undefined : req.ip });
    res.status(500).json({ error: msg });
  }
});

router.get("/stats", async (req, res) => {
  safeJson(res, await getStats());
});

router.post("/visit", async (req, res) => {
  await logVisit(req.body?.path || "/");
  res.json({ ok: true });
});

router.get("/leaderboard", async (req, res) => {
  const mode = req.query.mode || null;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  safeJson(res, await getLeaderboard({ mode, limit }));
});

export default router;
