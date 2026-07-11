import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, enum: ["virtual", "physical"], required: true },
    network: { type: String, enum: ["visa", "mastercard"], default: "visa" },
    cardNumber: { type: String, required: true },
    cardNumberLast4: { type: String, required: true },
    cvv: { type: String, required: true },
    cardholderName: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending_approval", "pending_activation", "shipped", "active", "frozen", "cancelled", "declined"],
      default: "pending_approval",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "US" },
    },
    trackingNumber: { type: String, trim: true },
    shippedAt: { type: Date },
    spendingLimit: { type: Number, default: null },
    purpose: { type: String, trim: true },
    color: { type: String, default: "navy" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Card || mongoose.model("Card", CardSchema);