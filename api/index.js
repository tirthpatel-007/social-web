// Load environment variables
require('dotenv').config();

// Import and run the database connection first
const connectDB = require('../src/config/db.js');
connectDB();

// Import the configured Express app
const app = require('../src/app.js');

// Export the app for Vercel's serverless environment
module.exports = app;