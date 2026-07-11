import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, enum: ["virtual", "physical"], required: true },
    cardNumber: { type: String, required: true },
    cardNumberLast4: { type: String, required: true },
    cvv: { type: String, required: true },
    cardholderName: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "frozen", "cancelled", "pending_activation"],
      default: "pending_activation",
    },
    spendingLimit: { type: Number, default: null },
    purpose: { type: String, trim: true },
    color: { type: String, default: "navy" },
  },
  { timestamps: true }
);

export default mongoose.models.Card || mongoose.model("Card", CardSchema);