import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountNumber: { type: String, required: true, unique: true },
    routingNumber: { type: String, default: "031176110" },
    type: { type: String, enum: ["checking", "savings"], required: true },
    nickname: { type: String, trim: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
    },
    interestRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);