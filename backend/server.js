// server.js
const express = require('express');
const connectDB = require('./config/db'); // Đường dẫn tới db.js
require('dotenv').config();

const app = express();

// Kết nối tới MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${ PORT }`));
