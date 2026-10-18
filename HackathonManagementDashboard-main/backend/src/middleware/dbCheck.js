const mongoose = require("mongoose");

const checkDbConnection = (req, res, next) => {
  // Check if Mongoose database connection is active (1 = connected)
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is disconnected. Please ensure your IP address is whitelisted on MongoDB Atlas under Network Access, or start a local MongoDB service.",
      readyState: mongoose.connection.readyState,
    });
  }
  next();
};

module.exports = checkDbConnection;
