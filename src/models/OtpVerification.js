import mongoose from "mongoose";

const OtpVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    userData: { type: mongoose.Schema.Types.Mixed, required: true }, // holds pending registration data
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpVerification || mongoose.model("OtpVerification", OtpVerificationSchema);