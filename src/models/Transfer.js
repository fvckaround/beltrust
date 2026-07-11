import mongoose from "mongoose";

const TransferSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sourceAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    transferType: {
      type: String,
      enum: ["internal", "beltrust", "external_bank"],
      required: true,
    },
    destinationAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // internal
    destinationAccountNumber: { type: String, trim: true }, // beltrust or external_bank
    destinationBankName: { type: String, trim: true }, // external_bank only
    destinationRoutingNumber: { type: String, trim: true }, // external_bank only
    recipientName: { type: String, trim: true },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    holdTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String, trim: true },
    reference: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Transfer || mongoose.model("Transfer", TransferSchema);