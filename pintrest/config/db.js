const mongoose = require('mongoose');

// This function will connect to your database.
// It uses the MONGO_URL you set in your Vercel Environment Variables.
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if connection fails
    }
};

module.exports = connectDB;