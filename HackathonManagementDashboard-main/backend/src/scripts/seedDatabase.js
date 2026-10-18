const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const {
  User,
  Hackathon,
  Registration,
  Team,
  Project,
  Evaluation,
} = require("../models");

const seedDataInternal = async () => {
  console.log("🌱 Populating database seed data...");

  // Wipe existing
  await User.deleteMany({});
  await Hackathon.deleteMany({});
  await Registration.deleteMany({});
  await Team.deleteMany({});
  await Project.deleteMany({});
  await Evaluation.deleteMany({});

  // 1. Create Super Admin
  const superAdmin = await User.create({
    fullName: "Super Admin",
    email: "admin@fairjudge.com",
    passwordHash: "Admin@123",
    role: "super_admin",
    superAdminDetails: { permissions: ["all"] },
  });

  // 2. Create Organizers
  const organizers = [];
  const organizerEmails = ["organizer1@fairjudge.com", "organizer2@fairjudge.com", "organizer3@fairjudge.com"];
  for (let i = 0; i < 3; i++) {
    const org = await User.create({
      fullName: `Organizer ${i + 1}`,
      email: organizerEmails[i],
      passwordHash: "Admin@123",
      role: "organizer",
      organizerDetails: { organization: faker.company.name(), verified: true },
    });
    organizers.push(org);
  }

  // 3. Create Judges
  const judges = [];
  const judgeEmails = [
    "judge1@fairjudge.com",
    "judge2@fairjudge.com",
    "judge3@fairjudge.com",
    "judge4@fairjudge.com",
    "judge5@fairjudge.com",
    "judge6@fairjudge.com",
  ];
  for (let i = 0; i < judgeEmails.length; i++) {
    const judge = await User.create({
      fullName: `Judge ${i + 1}`,
      email: judgeEmails[i],
      passwordHash: "Admin@123",
      role: "judge",
      judgeDetails: {
        expertise: [faker.helpers.arrayElement(["AI", "Web3", "Frontend", "Backend"])],
        yearsOfExperience: faker.number.int({ min: 2, max: 15 }),
        evaluationHistory: [],
      },
    });
    judges.push(judge);
  }

  // 4. Create Participants
  const participants = [];
  for (let i = 0; i < 20; i++) {
    const participant = await User.create({
      fullName: i === 0 ? "Participant One" : faker.person.fullName(),
      email: i === 0 ? "participant1@fairjudge.com" : faker.internet.email().toLowerCase(),
      passwordHash: "Admin@123",
      role: "participant",
      participantDetails: {
        skills: faker.helpers.arrayElements(["React", "Node.js", "Python", "MongoDB", "Figma"], 2),
      },
    });
    participants.push(participant);
  }

  // 5. Create Hackathons
  const upcomingHackathon = await Hackathon.create({
    title: "Global AI Summit Hackathon 2026",
    description: faker.lorem.paragraph(),
    organizerId: organizers[0]._id,
    status: "registration_open",
    verificationStatus: "verified",
    timeline: {
      registrationStart: faker.date.past(),
      registrationEnd: faker.date.soon({ days: 10 }),
      hackathonStart: faker.date.soon({ days: 12 }),
      hackathonEnd: faker.date.soon({ days: 14 }),
      submissionDeadline: faker.date.soon({ days: 15 }),
    },
    rubric: [
      { criteria: "Innovation", weight: 40, description: "Uniqueness of idea" },
      { criteria: "Technical Implementation", weight: 40, description: "Code quality and tech stack" },
      { criteria: "Presentation", weight: 20, description: "Pitch and UI/UX" },
    ],
    problemStatements: [
      { title: "AI for Good", description: "Use AI to solve climate issues.", category: "AI" },
    ],
  });

  const ongoingHackathon = await Hackathon.create({
    title: "Web3 Disruptors Hack",
    description: faker.lorem.paragraph(),
    organizerId: organizers[1]._id,
    status: "ongoing",
    verificationStatus: "verified",
    timeline: {
      registrationStart: faker.date.past(),
      registrationEnd: faker.date.soon({ days: 2 }),
      hackathonStart: faker.date.recent(),
      hackathonEnd: faker.date.soon({ days: 2 }),
      submissionDeadline: faker.date.soon({ days: 3 }),
    },
    rubric: [
      { criteria: "Smart Contract Security", weight: 50 },
      { criteria: "User Experience", weight: 25 },
      { criteria: "Business Viability", weight: 25 },
    ],
    problemStatements: [
      { title: "DeFi Innovation", description: "Create a new DeFi protocol", category: "Blockchain" },
    ],
  });

  // 6. Create Registrations
  for (const participant of participants) {
    await Registration.create({
      hackathonId: upcomingHackathon._id,
      userId: participant._id,
      status: "confirmed",
    });
  }

  const ongoingRegs = [];
  for (const participant of participants) {
    const reg = await Registration.create({
      hackathonId: ongoingHackathon._id,
      userId: participant._id,
      status: "confirmed",
    });
    ongoingRegs.push(reg);
  }

  // 7. Form Teams
  const teams = [];
  for (let i = 0; i < 5; i++) {
    const teamMembers = participants.slice(i * 4, i * 4 + 4).map(p => p._id);
    const team = await Team.create({
      hackathonId: ongoingHackathon._id,
      name: faker.company.catchPhrase(),
      members: teamMembers,
      problemStatementId: ongoingHackathon.problemStatements[0]._id,
    });
    teams.push(team);

    const memberRegIds = ongoingRegs
      .filter(r => teamMembers.some(uid => uid.equals(r.userId)))
      .map(r => r._id);
    await Registration.updateMany(
      { _id: { $in: memberRegIds } },
      { $set: { teamId: team._id } }
    );
  }

  // 8. Create Projects
  for (const team of teams) {
    await Project.create({
      hackathonId: ongoingHackathon._id,
      teamId: team._id,
      title: faker.commerce.productName(),
      description: faker.lorem.sentences(3),
      problemStatementId: ongoingHackathon.problemStatements[0]._id,
      techStack: ["Solidity", "React", "Node.js"],
      status: "submitted",
    });
  }

  console.log("✅ Seed data populated successfully.");
};

if (require.main === module) {
  require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });
  const connectDB = require("../config/db");
  connectDB().then(async () => {
    await seedDataInternal();
    process.exit(0);
  }).catch(err => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
}

module.exports = { seedDataInternal };

