require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const demoUsers = [
  {
    fullName: "Super Admin",
    email: "admin@fairjudge.com",
    role: "superadmin",
    isVerified: true
  },
  {
    fullName: "Organizer User",
    email: "organizer@fairjudge.com",
    role: "organizer",
    organizerDetails: { organization: "FairJudge Org" },
    isVerified: true
  },
  {
    fullName: "Judge User",
    email: "judge@fairjudge.com",
    role: "judge",
    judgeDetails: { expertise: ["AI/ML", "Web3"], yearsOfExperience: 5 },
    isVerified: true
  },
  {
    fullName: "Participant User",
    email: "participant@fairjudge.com",
    role: "participant",
    participantDetails: { skills: ["React", "Python"], experience: "Intermediate" },
    isVerified: true
  }
];

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash("Password@123", salt);

    for (const user of demoUsers) {
      await usersCollection.deleteOne({ email: user.email });
      await usersCollection.insertOne({
        ...user,
        passwordHash: passwordHash,
        sessions: [],
        loginAttempts: 0,
        isDeleted: false,
        deleted: { isDeleted: false },
        passwordHistory: [passwordHash],
        createdAt: new Date(),
        updatedAt: new Date()
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