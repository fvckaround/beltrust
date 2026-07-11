import mongoose from "mongoose";

const BillPaySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    payeeName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["utilities", "rent", "credit_card", "insurance", "subscription", "other"],
      default: "other",
    },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ["one_time", "weekly", "monthly"],
      default: "one_time",
    },
    nextPaymentDate: { type: Date, required: true },
    lastPaidDate: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "paid", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.models.BillPay || mongoose.model("BillPay", BillPaySchema);