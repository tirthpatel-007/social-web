const mongoose = require('mongoose');

const connectDB = async () => {
  // --- START DEBUG LOGGING ---
  console.log("--- Starting Database Connection ---");
  console.log("Attempting to use MONGO_URL:", process.env.MONGO_URL);

  if (!process.env.MONGO_URL) {
    console.error("CRITICAL ERROR: MONGO_URL environment variable not found in Vercel!");
    process.exit(1);
  }
  // --- END DEBUG LOGGING ---

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("SUCCESS: MongoDB Connection Succeeded.");
  } catch (error) {
    // --- This will catch and print the exact connection error ---
    console.error("CRITICAL MONGODB CONNECTION ERROR on Vercel:");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    // The full error object can be very large, so we log the most important parts.
    process.exit(1);
  }
};

module.exports = connectDB;