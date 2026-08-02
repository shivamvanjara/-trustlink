require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ ERROR: MONGODB_URI not found in .env");
  process.exit(1);
}

const clearDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ SUCCESS: Connected to MongoDB");

    console.log("🧹 Clearing database...");
    await mongoose.connection.db.dropDatabase();
    console.log("✨ SUCCESS: Database 'trustlink' has been cleared.");

    await mongoose.connection.close();
    console.log("🔌 Connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
};

clearDB();
