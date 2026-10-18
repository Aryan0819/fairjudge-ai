require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const demoUsers = [
  {
    name: "Super Admin",
    email: "admin@fairjudge.com",
    password: "Password@123",
    role: "superadmin",
    isVerified: true
  },
  {
    name: "Organizer User",
    email: "organizer@fairjudge.com",
    password: "Password@123",
    role: "organizer",
    isVerified: true
  },
  {
    name: "Judge User",
    email: "judge@fairjudge.com",
    password: "Password@123",
    role: "judge",
    isVerified: true
  },
  {
    name: "Participant User",
    email: "participant@fairjudge.com",
    password: "Password@123",
    role: "participant",
    isVerified: true
  }
];

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: { type: String },
      role: { type: String },
      isVerified: { type: Boolean, default: true }
    }, { strict: false });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    for (const user of demoUsers) {
      await User.deleteOne({ email: user.email });
      await User.create({
        ...user,
        password: hashedPassword
      });
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log("\nAll demo accounts seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedAll();
