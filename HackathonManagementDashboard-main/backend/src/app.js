require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const checkDbConnection = require("./middleware/dbCheck");

const authRouter = require("./routes/auth");
const hackathonsRouter = require("./routes/hackathons");
const adminRouter = require("./routes/admin");
const participantsRouter = require("./routes/participants");
const reviewsRouter = require("./routes/reviews");

const startCronJob = require("./jobs/hackathonStatusCron");

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001,https://*.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

// Core Middleware Configuration
app.use(helmet()); 
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true, // Required for secure cookie context transmission (CSRF & Refresh Tokens)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
}));
app.use(express.json());
app.use(cookieParser());

// Dynamic CSRF Protection Setup
const csrfProtection = csrf({
  cookie: {
    key: "fairjudge_csrf_v2",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

// Environment Check: Provide a selective bypass middleware shell for development convenience
const conditionalCsrf = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    return next(); // Skip CSRF assertion passes during fast local debugging cycles
  }
  return csrfProtection(req, res, next);
};

// Endpoint to issue the CSRF token for production frontend architectures
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api", apiLimiter, checkDbConnection); // Apply API resource throttling and DB connection checks globally


// Base Health Probe Route Context
app.get("/health", (req, res) => res.json({ status: "ok", service: "fairjudge-backend" }));

// Route Mount Matrix with dynamic development-safe environment filtering parameters
app.use("/api/auth", conditionalCsrf, authRouter);
app.use("/api/hackathons", conditionalCsrf, hackathonsRouter);
app.use("/api/admin", conditionalCsrf, adminRouter);
app.use("/api/participants", conditionalCsrf, participantsRouter);
app.use("/api/reviews", conditionalCsrf, reviewsRouter);
app.use("/api/teams", conditionalCsrf, require("./routes/userTeams"));
app.use("/api/projects", conditionalCsrf, require("./routes/projects"));
app.use("/api/evaluations", conditionalCsrf, require("./routes/evaluations"));
app.use("/api/certificates", conditionalCsrf, require("./routes/certificates"));

// Global Error Catchment Interceptor Layer
app.use(errorHandler);

// Start serving requests only after the database is ready. Otherwise the API
// can return transient 503 responses during the connection startup window.
const startServer = async () => {
  const connection = await connectDB();
  if (!connection || connection.connection.readyState !== 1) {
    throw new Error("Database connection could not be established");
  }

  startCronJob();
  app.listen(PORT, () => {
    console.log(`FAIRJUDGE backend completely online and listening on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error(`FAIRJUDGE backend failed to start: ${err.message}`);
    process.exit(1);
  });
}

module.exports = app;