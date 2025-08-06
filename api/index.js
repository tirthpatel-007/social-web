// Load environment variables
require('dotenv').config();

// Import the configured Express app from your src folder
const app = require('../src/app.js');

// Import and run the database connection
const connectDB = require('../src/config/db.js');
connectDB();

// Export the app for Vercel's serverless environment
module.exports = app;