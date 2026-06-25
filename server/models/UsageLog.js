import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userEmail: { type: String, default: null },
  ip: { type: String, default: null },
  mode: { type: String, required: true, enum: ["roast", "recruit"] },
  fileName: { type: String, default: null },
  fileSize: { type: Number, default: null },
  score: { type: Number, default: null },
  verdict: { type: String, default: null },
  success: { type: Boolean, default: true },
  cached: { type: Boolean, default: false },
}, { timestamps: true });

usageLogSchema.index({ userEmail: 1, createdAt: -1 });
usageLogSchema.index({ ip: 1, createdAt: -1 });
usageLogSchema.index({ score: -1 });
usageLogSchema.index({ mode: 1, score: -1 });

export default mongoose.model("UsageLog", usageLogSchema);
