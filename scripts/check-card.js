const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const card = await db.collection("cards").findOne({
    _id: new mongoose.Types.ObjectId("6a4cf655558e793629ba3c09"),
  });

  console.log(JSON.stringify(card, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});