require('dotenv').config();


const app = require('./src/app');


const connectDB = require('./src/config/db');
connectDB();

const PORT = process.env.PORT || 3000;

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});