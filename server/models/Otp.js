import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  used: { type: Boolean, default: false },
  type: { type: String, enum: ["signup", "reset"], default: "signup" },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 });

export default mongoose.model("Otp", otpSchema);
