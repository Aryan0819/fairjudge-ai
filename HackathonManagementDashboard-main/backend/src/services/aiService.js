const axios = require("axios");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const configuredAIUrl = process.env.AI_SERVICE_URL?.trim();
const AI_URL = (
  configuredAIUrl || (process.env.VERCEL ? "" : "http://localhost:8000")
).replace(/\/+$/, "");

// Axios instance with 10s timeout
const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 10000,
});

const formTeamsLocally = (participants, config = {}) => {
  const configuredSize = Number(config.maxTeamSize);
  const maxTeamSize = Number.isInteger(configuredSize) && configuredSize > 0
    ? configuredSize
    : 4;
  const participantsWithSkills = participants.map((participant) => {
    const user = participant.userId && typeof participant.userId === "object"
      ? participant.userId
      : {};
    const rawSkills = participant.skills || [];
    const skills = [...new Set(
      (Array.isArray(rawSkills) ? rawSkills : String(rawSkills).split(","))
        .filter((skill) => typeof skill === "string")
        .map((skill) => skill.trim())
        .filter(Boolean)
    )];

    return {
      registration_id: String(participant._id || ""),
      user_id: String(user._id || participant.userId || ""),
      name: user.fullName || participant.name || "Unknown",
      email: user.email || participant.email || "",
      skills,
      total_skill_score: skills.length,
    };
  }).filter((participant) => participant.registration_id && participant.user_id);

  const teamCount = Math.ceil(participantsWithSkills.length / maxTeamSize);
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    team_id: index + 1,
    total_score: 0,
    category_coverage: {},
    members: [],
  }));
  const sortedParticipants = participantsWithSkills.sort(
    (left, right) => right.total_skill_score - left.total_skill_score
  );

  sortedParticipants.forEach((participant, index) => {
    const round = Math.floor(index / teamCount);
    const position = index % teamCount;
    const teamIndex = round % 2 === 0 ? position : teamCount - position - 1;
    const team = teams[teamIndex];
    team.members.push(participant);
    team.total_score += participant.total_skill_score;
  });

  return teams;
};

exports.checkDuplicate = async (userData, existingParticipants) => {
  let attempts = 0;
  const maxRetries = 2;

  while (attempts <= maxRetries) {
    try {
      const payload = {
        name: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "0000000000",
        college: userData.institution || "Unknown",
        skills: Array.isArray(userData.skills) ? userData.skills : (typeof userData.skills === 'string' ? userData.skills.split(',') : [])
      };
      
      const response = await aiClient.post("/api/duplicate-check", payload);
      return response.data;
    } catch (err) {
      attempts++;
      if (attempts > maxRetries) {
        console.error("AI Service completely failed after retries:", err.message);
        throw new Error("AI_SERVICE_UNAVAILABLE");
      }
      console.warn(`AI Service failed, retrying (${attempts}/${maxRetries})...`);
    }
  }
};

exports.formTeams = async (participants, config) => {
  if (!AI_URL) {
    console.warn("AI_SERVICE_URL is not configured; forming teams locally.");
    return formTeamsLocally(participants, config);
  }

  try {
    const response = await aiClient.post("/api/team-form", {
      participants,
      config,
    }, {
      timeout: 90000,
    });
    return response.data;
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.detail || err.response?.data?.message;
    const message = status
      ? `AI Service returned ${status}${detail ? `: ${detail}` : ""}`
      : `AI Service request failed (${err.code || err.message})`;
    console.warn(`${message}; falling back to local team formation.`);
    return formTeamsLocally(participants, config);
  }
};

exports.assignReviewers = async (judges, projects, config) => {
  try {
    const payload = { judges, projects, ...config };
    const response = await aiClient.post("/api/reviewer-assign", payload);
    return response.data; // { assignments: [{ projectId, reviewerIds: [] }] }
  } catch (err) {
    console.error("AI Reviewer assignment failed:", err.message);
    throw new Error("Failed to assign reviewers via AI Service");
  }
};

exports.detectBias = async (feedbackText, scores, rubric) => {
  try {
    const response = await aiClient.post("/api/bias-detect", {
      feedbackText,
      scores,
      rubric,
    });
    return response.data; // { biasDetected: boolean, flags: string[], confidence: number }
  } catch (err) {
    console.warn("AI Bias Detection failed, bypassing check:", err.message);
    return { biasDetected: false, flags: [], confidence: 0 };
  }
};

exports.getReviewSuggestions = async (projectData, rubric) => {
  try {
    const response = await aiClient.post("/api/review-agent", {
      projectData,
      rubric,
    });
    return response.data; // { suggestedScores: { criteria: score }, rationale: string }
  } catch (err) {
    console.warn("AI Review Agent failed:", err.message);
    return null;
  }
};

exports.checkHealth = async () => {
  try {
    const response = await aiClient.get("/health");
    return response.data;
  } catch (err) {
    return { status: "down", error: err.message };
  }
};

exports.extractTextFromResume = async (fileBuffer, mimeType) => {
  try {
    if (mimeType === "application/pdf") {
      const data = await pdf(fileBuffer);
      return data.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    }
    // Generic fallback for plain text or doc types
    return fileBuffer.toString("utf8");
  } catch (err) {
    console.error("Failed to extract text from resume:", err);
    return ""; // Proceed with empty text if parsing fails
  }
};
