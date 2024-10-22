const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import các routes
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Middleware để phân tích JSON

app.use('/api/auth', authRoutes); // Sử dụng route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${ PORT }`));
