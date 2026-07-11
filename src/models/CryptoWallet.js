import mongoose from "mongoose";

const HoldingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true }, // e.g. "BTC", "ETH"
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    averageBuyPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const CryptoWalletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    holdings: [HoldingSchema],
    totalInvestedUSD: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.CryptoWallet || mongoose.model("CryptoWallet", CryptoWalletSchema);