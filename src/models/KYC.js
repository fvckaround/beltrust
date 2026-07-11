import mongoose from "mongoose";

const KYCSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    idType: {
      type: String,
      enum: ["passport", "drivers_license", "national_id"],
      required: true,
    },
    idNumber: { type: String, required: true },
    idFrontImage: { type: String, required: true }, // Cloudinary URL
    idBackImage: { type: String },
    selfieImage: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.KYC || mongoose.model("KYC", KYCSchema);