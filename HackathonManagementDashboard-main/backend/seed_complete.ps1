Set-Content -Path "seed_complete.js" -Value @''
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB Atlas...");

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("Password@123", salt);

  const demoAccounts = [
    {
      fullName: "Super Admin",
      email: "admin@fairjudge.com",
      passwordHash: passwordHash,
      role: "superadmin",
      isVerified: true,
      deleted: { isDeleted: false },
      isDeleted: false,
      sessions: [],
      loginAttempts: 0,
      passwordHistory: [passwordHash],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullName: "Organizer User",
      email: "organizer@fairjudge.com",
      passwordHash: passwordHash,
      role: "organizer",
      organizerDetails: { organization: "FairJudge Org" },
      isVerified: true,
      deleted: { isDeleted: false },
      isDeleted: false,
      sessions: [],
      loginAttempts: 0,
      passwordHistory: [passwordHash],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullName: "Judge User",
      email: "judge@fairjudge.com",
      passwordHash: passwordHash,
      role: "judge",
      judgeDetails: { expertise: ["AI/ML", "Web3"], yearsOfExperience: 5 },
      isVerified: true,
      deleted: { isDeleted: false },
      isDeleted: false,
      sessions: [],
      loginAttempts: 0,
      passwordHistory: [passwordHash],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullName: "Participant User",
      email: "participant@fairjudge.com",
      passwordHash: passwordHash,
      role: "participant",
      participantDetails: { skills: ["React", "Python"], experience: "Intermediate" },
      isVerified: true,
      deleted: { isDeleted: false },
      isDeleted: false,
      sessions: [],
      loginAttempts: 0,
      passwordHistory: [passwordHash],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const acc of demoAccounts) {
    await usersCollection.deleteOne({ email: acc.email });
    await usersCollection.insertOne(acc);
    console.log(`Seeded account: ${acc.email}`);
  }

  console.log("\nDatabase ready!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
''
node seed_complete.js
