require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Find and require the project's User model directly
    let User;
    try {
      User = require("./src/models/User") || require("./src/models/user.model") || require("./models/User");
      if (User.default) User = User.default;
    } catch (e) {
      const UserModule = require("./src/models/user");
      User = UserModule.default || UserModule;
    }

    const demoUsers = [
      { name: "Super Admin", email: "admin@fairjudge.com", password: "Password@123", role: "superadmin", isVerified: true },
      { name: "Organizer User", email: "organizer@fairjudge.com", password: "Password@123", role: "organizer", isVerified: true },
      { name: "Judge User", email: "judge@fairjudge.com", password: "Password@123", role: "judge", isVerified: true },
      { name: "Participant User", email: "participant@fairjudge.com", password: "Password@123", role: "participant", isVerified: true }
    ];

    for (const u of demoUsers) {
      await User.deleteOne({ email: u.email });
      const newUser = new User(u);
      await newUser.save();
      console.log(`Created: ${u.email}`);
    }

    console.log("\nAll users created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
