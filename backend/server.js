// src/server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = app.listen(PORT, () =>
{
    console.log(`Server running in ${ process.env.NODE_ENV } mode on port ${ PORT }`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) =>
{
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() =>
    {
        process.exit(1);
    });
});