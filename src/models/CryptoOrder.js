import mongoose from "mongoose";

const CryptoOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    action: { type: String, enum: ["buy", "sell"], required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
    holdTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String, trim: true },
    reference: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.CryptoOrder || mongoose.model("CryptoOrder", CryptoOrderSchema);