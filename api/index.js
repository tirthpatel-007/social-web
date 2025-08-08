
require('dotenv').config();

const connectDB = require('../src/config/db.js');
connectDB();


const app = require('../src/app.js');

module.exports = app;