import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: null },
  verified: { type: Boolean, default: false },
  resetOtp: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
