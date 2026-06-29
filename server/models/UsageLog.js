import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userEmail: { type: String, default: null },
  ip: { type: String, default: null },
  mode: { type: String, required: true, enum: ["roast", "recruit"] },
  fileName: { type: String, default: null },
  fileSize: { type: Number, default: null },
  score: { type: Number, default: null }, // raw Gemini integer score (legacy)
  verdict: { type: String, default: null },
  success: { type: Boolean, default: true },
  cached: { type: Boolean, default: false },

  // Display score — decimal shown to users (e.g. 64.7, 73.2)
  displayScore: { type: Number, default: null },
  // Hidden ranking score used for leaderboard sorting
  rankingScore: { type: Number, default: null },

  // Recruit tie-breaker fields
  completenessScore: { type: Number, default: null },
  achievementsCount: { type: Number, default: null },
  metricsCount: { type: Number, default: null },
  skillRelevanceCount: { type: Number, default: null },
  resumeQualityScore: { type: Number, default: null },

  // Roast tie-breaker fields
  totalRoastPoints: { type: Number, default: null },
  weaknessesCount: { type: Number, default: null },
  missingSectionsCount: { type: Number, default: null },
  grammarIssueCount: { type: Number, default: null },
  formattingIssueCount: { type: Number, default: null },

  // Submission timestamp for tie-breaking
  submissionTimestamp: { type: Date, default: Date.now },
}, { timestamps: true });

usageLogSchema.index({ userEmail: 1, createdAt: -1 });
usageLogSchema.index({ ip: 1, createdAt: -1 });
usageLogSchema.index({ score: -1 });
usageLogSchema.index({ mode: 1, score: -1 });
usageLogSchema.index({ mode: 1, rankingScore: -1 });
usageLogSchema.index({ mode: 1, displayScore: -1 }); // for collision checks

export default mongoose.model("UsageLog", usageLogSchema);
