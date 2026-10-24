const app = require("../src/app");
const connectDB = require("../src/config/db");
const mongoose = require("mongoose");

let connectionPromise;

const getDatabaseConnection = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    connectionPromise = connectDB().finally(() => {
      connectionPromise = undefined;
    });
  }

  return connectionPromise;
};

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

  const requestPath = req.url.split("?")[0];
  if (requestPath === "/csrf-token" || requestPath === "/api/csrf-token") {
    if (!req.url.startsWith("/api")) {
      req.url = `/api${req.url}`;
    }
    return app(req, res);
  }

  let connection;
  try {
    connection = await getDatabaseConnection();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(503).json({
      success: false,
      message: process.env.MONGO_URI
        ? "MongoDB connection failed. Verify the Vercel MONGO_URI value, MongoDB credentials, and Atlas Network Access."
        : "MONGO_URI is not configured for the deployed backend. Add it to the Vercel project environment variables.",
    });
  }

  const readyState = mongoose.connection.readyState;
  if (!connection || readyState !== 1) {
    console.error(
      "Database connection did not reach the connected state:",
      readyState
    );
    return res.status(503).json({
      success: false,
      message: "MongoDB is not connected. Verify the deployed backend MONGO_URI configuration.",
    });
  }

  // Vercel removes the `/api` function prefix before invoking this handler.
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
};