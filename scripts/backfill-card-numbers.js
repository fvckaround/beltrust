const mongoose = require("mongoose");

function generateCardNumber() {
  let num = "4";
  for (let i = 0; i < 15; i++) num += Math.floor(Math.random() * 10);
  return num;
}

function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collection = db.collection("cards");

  const cards = await collection
    .find({
      $or: [{ cardNumber: { $exists: false } }, { cvv: { $exists: false } }],
    })
    .toArray();

  console.log(`Found ${cards.length} card(s) missing cardNumber/cvv`);

  for (const card of cards) {
    const fullNumber = generateCardNumber();
    const cvv = generateCVV();

    const result = await collection.updateOne(
      { _id: card._id },
      {
        $set: {
          cardNumber: fullNumber,
          cardNumberLast4: fullNumber.slice(-4),
          cvv: cvv,
        },
      }
    );

    console.log(`Backfilled card ${card._id} — modified: ${result.modifiedCount}`);
  }

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});