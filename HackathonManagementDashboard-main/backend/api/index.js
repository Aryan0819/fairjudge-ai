const app = require("../src/app");
const connectDB = require("../src/config/db");

let connectionPromise;

module.exports = async (req, res) => {
  const requestOrigin = req.headers.origin;
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

  if (requestOrigin && isAllowedOrigin(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.url === "/health") {
    return app(req, res);
  }

  connectionPromise ??= connectDB();
  let connection;
  try {
    connection = await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    console.error("Database connection failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Database connection could not be established",
    });
  }

  if (!connection || connection.connection.readyState !== 1) {
    connectionPromise = undefined;
    return res.status(503).json({
      success: false,
      message: "Database connection could not be established",
    });
  }

  // Vercel removes the `/api` function prefix before invoking this handler.
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
};