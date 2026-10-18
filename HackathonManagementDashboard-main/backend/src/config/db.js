const mongoose = require("mongoose");

// Disable Mongoose command buffering globally to prevent 10000ms buffering timeouts
mongoose.set("bufferCommands", false);

let memoryServerInstance = null;

const connectDB = async () => {
  // 1. Primary Attempt: MongoDB Atlas / Custom MONGO_URI
  if (process.env.MONGO_URI) {
    try {
      console.log("Attempting MongoDB Atlas connection...");
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        bufferCommands: false,
      });
      console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (atlasErr) {
      console.warn(`⚠️ Primary MongoDB Atlas connection unavailable: ${atlasErr.message}`);
    }
  }

  // Local and in-memory fallbacks are useful during development only.
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // 2. Secondary Attempt: Local MongoDB Instance
  try {
    console.log("Attempting local MongoDB connection (mongodb://127.0.0.1:27017/fairjudge)...");
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/fairjudge", {
      serverSelectionTimeoutMS: 2000,
      bufferCommands: false,
    });
    console.log(`✅ Local MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (localErr) {
    console.warn("⚠️ Local MongoDB instance not reachable.");
  }

  // 3. Tertiary Fallback: Automated In-Memory MongoDB Server
  try {
    console.log("🚀 Initializing In-Memory MongoDB Server fallback...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();

    const conn = await mongoose.connect(memUri, {
      bufferCommands: false,
    });
    console.log(`✅ In-Memory MongoDB connected successfully at ${memUri}`);

    // Automatically seed data into the in-memory instance for testing
    const { seedDataInternal } = require("../scripts/seedDatabase");
    await seedDataInternal();

    return conn;
  } catch (memErr) {
    console.error("❌ All MongoDB connection strategies failed:", memErr.message);
  }
};

module.exports = connectDB;
