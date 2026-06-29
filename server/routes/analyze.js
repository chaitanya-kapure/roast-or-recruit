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
import { 
  analyzeResumeMetrics, 
  analyzeRoastMetrics, 
  calculateRecruitRankingScore, 
  calculateRoastRankingScore,
  enhanceScorePrecision,
  normalizeDisplayScore 
} from "../services/scoringService.js";

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
    
    // Normalize display score to ensure uniqueness across leaderboard
    const rawBrutalityScore = typeof result.brutalityScore === "number" ? result.brutalityScore : parseFloat(result.brutalityScore) || 50;
    const displayScore = await normalizeDisplayScore(rawBrutalityScore, "roast", req.file.originalname + text.length);
    
    // Calculate ranking score for internal sorting
    const resumeMetrics = analyzeResumeMetrics(text);
    const roastMetrics = analyzeRoastMetrics(result);
    const rankingScore = calculateRoastRankingScore({ brutalityScore: rawBrutalityScore, ...roastMetrics, resumeMetrics });
    const enhancedRankingScore = enhanceScorePrecision(rankingScore, resumeMetrics);
    
    console.log(`[Roast] Result: displayScore=${displayScore}, roasts=${result.roasts?.length}, rankingScore=${enhancedRankingScore.toFixed(3)}`);
    
    await logUsage({ 
      mode: "roast", 
      fileName: req.file.originalname, 
      fileSize: req.file.size, 
      score: rawBrutalityScore, 
      verdict: result.verdict, 
      cached: cached ? 1 : 0, 
      userEmail: email, 
      ip: email ? undefined : req.ip,
      displayScore,
      rankingScore: enhancedRankingScore,
      totalRoastPoints: roastMetrics.totalRoastPoints,
      weaknessesCount: roastMetrics.weaknessesCount,
      missingSectionsCount: roastMetrics.missingSectionsCount,
      grammarIssueCount: roastMetrics.grammarIssueCount,
      formattingIssueCount: roastMetrics.formattingIssueCount,
      submissionTimestamp: new Date(),
    });
    
    safeJson(res, { ...result, brutalityScore: displayScore, _rateLimit: { used: limit.used + 1, limit: MAX_ANALYSES } });
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
    
    // Normalize display score to ensure uniqueness across leaderboard
    const rawAtsScore = typeof result.atsScore === "number" ? result.atsScore : parseFloat(result.atsScore) || 50;
    const displayScore = await normalizeDisplayScore(rawAtsScore, "recruit", req.file.originalname + text.length);
    
    // Calculate ranking score for internal sorting
    const resumeMetrics = analyzeResumeMetrics(text);
    const rankingScore = calculateRecruitRankingScore({ atsScore: rawAtsScore, ...resumeMetrics });
    const enhancedRankingScore = enhanceScorePrecision(rankingScore, resumeMetrics);
    
    console.log(`[Recruit] Result: displayScore=${displayScore}, recommendation=${result.recommendation}, rankingScore=${enhancedRankingScore.toFixed(3)}`);
    
    await logUsage({ 
      mode: "recruit", 
      fileName: req.file.originalname, 
      fileSize: req.file.size, 
      score: rawAtsScore, 
      verdict: result.recommendation, 
      cached: cached ? 1 : 0, 
      userEmail: email, 
      ip: email ? undefined : req.ip,
      displayScore,
      rankingScore: enhancedRankingScore,
      completenessScore: resumeMetrics.completenessScore,
      achievementsCount: resumeMetrics.achievementsCount,
      metricsCount: resumeMetrics.metricsCount,
      skillRelevanceCount: resumeMetrics.skillRelevanceCount,
      resumeQualityScore: resumeMetrics.resumeQualityScore,
      submissionTimestamp: new Date(),
    });
    
    safeJson(res, { ...result, atsScore: displayScore, _rateLimit: { used: limit.used + 1, limit: MAX_ANALYSES } });
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

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

router.get("/admin/migrate-scores", async (req, res) => {
  try {
    const results = {};
    for (const mode of ["roast", "recruit"]) {
      const entries = await UsageLog.find({
        mode, success: true,
        userEmail: { $ne: null, $ne: "", $exists: true },
      }).sort({ createdAt: 1 }).lean();

      const usedScores = new Set();
      let updated = 0;

      for (const entry of entries) {
        let score = entry.displayScore ?? entry.score ?? 50;
        score = Math.round(score * 10) / 10;
        score = Math.min(100, Math.max(0, score));

        if (usedScores.has(score)) {
          const seed = (entry.fileName || "") + (entry.userEmail || "") + String(entry.createdAt);
          const h = djb2Hash(seed);
          const direction = h % 2 === 0 ? 1 : -1;
          let offset = 0.1;
          let candidate = score;
          for (let attempt = 0; attempt < 50; attempt++) {
            candidate = Math.round((score + direction * offset) * 10) / 10;
            if (candidate > 100) candidate = Math.round((100 - (candidate - 100)) * 10) / 10;
            if (candidate < 0) candidate = Math.round(Math.abs(candidate) * 10) / 10;
            candidate = Math.min(100, Math.max(0, candidate));
            if (!usedScores.has(candidate)) break;
            offset += 0.1;
          }
          score = candidate;
          await UsageLog.updateOne({ _id: entry._id }, { $set: { displayScore: score } });
          updated++;
        }
        usedScores.add(score);
      }
      results[mode] = { total: entries.length, updated, uniqueScores: usedScores.size };
    }
    safeJson(res, results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
