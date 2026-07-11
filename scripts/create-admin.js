// scripts/create-admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collection = db.collection("users");

  const email = "admin@beltrustbank.com"; // change if you want a different email
  const plainPassword = "BeltrustAdmin2026!"; // change this after first login

  const existing = await collection.findOne({ email });

  if (existing) {
    await collection.updateOne({ email }, { $set: { role: "admin" } });
    console.log(`Promoted existing user ${email} to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    await collection.insertOne({
      firstName: "Beltrust",
      lastName: "Admin",
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      kycStatus: "not_started",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Created new admin user: ${email} / ${plainPassword}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});