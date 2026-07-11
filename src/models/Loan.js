import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["personal", "business"], required: true },
    amountRequested: { type: Number, required: true },
    amountApproved: { type: Number },
    interestRate: { type: Number },
    termMonths: { type: Number, required: true },
    purpose: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "paid_off"],
      default: "pending",
    },
    monthlyPayment: { type: Number },
    remainingBalance: { type: Number },
    disbursedToAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);