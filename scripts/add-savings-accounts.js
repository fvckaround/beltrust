// scripts/add-savings-accounts.js
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const AccountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountNumber: { type: String, required: true, unique: true },
    routingNumber: { type: String, default: "031176110" },
    type: { type: String, enum: ["checking", "savings"], required: true },
    nickname: { type: String, trim: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["active", "frozen", "closed"], default: "active" },
    interestRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);

function generateAccountNumber() {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

async function uniqueAccountNumber() {
  let num;
  let exists = true;
  while (exists) {
    num = generateAccountNumber();
    exists = await Account.findOne({ accountNumber: num });
  }
  return num;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Find every user id that has a checking account but no savings account
  const checkingAccounts = await Account.find({ type: "checking" });
  let created = 0;

  for (const checking of checkingAccounts) {
    const existingSavings = await Account.findOne({ user: checking.user, type: "savings" });

    if (existingSavings) {
      console.log(`Skipping user ${checking.user} — already has savings`);
      continue;
    }

    const accountNumber = await uniqueAccountNumber();

    await Account.create({
      user: checking.user,
      accountNumber,
      type: "savings",
      nickname: "Savings",
      balance: 0,
      interestRate: 2.5,
    });

    created += 1;
    console.log(`Created savings account for user ${checking.user}`);
  }

  console.log(`Done. Created ${created} savings account(s).`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});