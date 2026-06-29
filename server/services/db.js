import mongoose from "mongoose";
import UsageLog from "../models/UsageLog.js";
import User from "../models/User.js";
import Visit from "../models/Visit.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roast-or-recruit";

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("[DB] MongoDB connected:", MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//<credentials>@"));
  } catch (err) {
    console.error("[DB] MongoDB connection error:", err.message);
    console.error("[DB] Set MONGO_URI in .env to your Atlas connection string.");
    console.error("[DB] Get one free at https://atlas.mongodb.com");
    process.exit(1);
  }
}

export async function logUsage({ 
  mode, 
  fileName, 
  fileSize, 
  score, 
  verdict, 
  success = true, 
  cached = false, 
  userEmail,
  // New ranking system fields
  displayScore,
  rankingScore,
  // Recruit tie-breaker fields
  completenessScore,
  achievementsCount,
  metricsCount,
  skillRelevanceCount,
  resumeQualityScore,
  // Roast tie-breaker fields
  totalRoastPoints,
  weaknessesCount,
  missingSectionsCount,
  grammarIssueCount,
  formattingIssueCount,
  // Submission timestamp
  submissionTimestamp,
}) {
  try {
    await UsageLog.create({ 
      mode, 
      fileName, 
      fileSize, 
      score, 
      verdict, 
      success, 
      cached, 
      userEmail,
      displayScore,
      rankingScore,
      completenessScore,
      achievementsCount,
      metricsCount,
      skillRelevanceCount,
      resumeQualityScore,
      totalRoastPoints,
      weaknessesCount,
      missingSectionsCount,
      grammarIssueCount,
      formattingIssueCount,
      submissionTimestamp,
    });
  } catch (err) {
    console.error("[DB] Failed to log usage:", err.message);
  }
}

export async function logVisit(path = "/") {
  try {
    await Visit.create({ path });
  } catch (err) {
    console.error("[DB] Failed to log visit:", err.message);
  }
}

export async function getStats() {
  const total = await UsageLog.countDocuments();
  const byMode = await UsageLog.aggregate([
    { $group: { _id: "$mode", count: { $sum: 1 } } },
    { $project: { mode: "$_id", count: 1, _id: 0 } },
  ]);
  const byDay = await UsageLog.aggregate([
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
    { $limit: 30 },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);
  const last24h = await UsageLog.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  const totalUsers = await User.countDocuments();
  const totalVisits = await Visit.countDocuments();
  const visitsToday = await Visit.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  return { total, byMode, byDay, last24h, totalUsers, totalVisits, visitsToday };
}

export async function getLeaderboard({ mode, limit = 10 } = {}) {
  const matchStage = { success: true, userEmail: { $ne: null, $ne: "", $exists: true }, rankingScore: { $exists: true, $ne: null } };
  if (mode) matchStage.mode = mode;

  const pipeline = [
    { $match: matchStage },
    { $sort: { displayScore: -1, submissionTimestamp: 1 } },
    { $group: {
      _id: "$userEmail",
      bestScore: { $first: "$score" },
      bestDisplayScore: { $first: "$displayScore" },
      bestRankingScore: { $first: "$rankingScore" },
      verdict: { $first: "$verdict" },
      fileName: { $first: "$fileName" },
      submissionTimestamp: { $first: "$submissionTimestamp" },
      createdAt: { $first: "$createdAt" },
    }},
    { $sort: { bestDisplayScore: -1, submissionTimestamp: 1 } },
    { $limit: limit },
    { $project: {
      _id: 0,
      userEmail: "$_id",
      score: "$bestScore",
      displayScore: "$bestDisplayScore",
      rankingScore: "$bestRankingScore",
      verdict: 1,
      fileName: 1,
      submissionTimestamp: 1,
      createdAt: 1,
    }},
  ];

  if (mode) {
    return await UsageLog.aggregate(pipeline);
  }
  const [roast, recruit] = await Promise.all([
    UsageLog.aggregate([...pipeline]),
    UsageLog.aggregate([
      { $match: { ...matchStage, mode: "recruit" } },
      { $sort: { displayScore: -1, submissionTimestamp: 1 } },
      { $group: {
        _id: "$userEmail",
        bestScore: { $first: "$score" },
        bestDisplayScore: { $first: "$displayScore" },
        bestRankingScore: { $first: "$rankingScore" },
        verdict: { $first: "$verdict" },
        fileName: { $first: "$fileName" },
        submissionTimestamp: { $first: "$submissionTimestamp" },
        createdAt: { $first: "$createdAt" },
      }},
      { $sort: { bestDisplayScore: -1, submissionTimestamp: 1 } },
      { $limit: limit },
      { $project: {
        _id: 0,
        userEmail: "$_id",
        score: "$bestScore",
        displayScore: "$bestDisplayScore",
        rankingScore: "$bestRankingScore",
        verdict: 1,
        fileName: 1,
        submissionTimestamp: 1,
        createdAt: 1,
      }},
    ]),
  ]);
  return { roast, recruit };
}
