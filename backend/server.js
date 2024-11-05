// Mongoose schemas for MongoDB to implement the redesigned class diagram
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Middleware để phân tích JSON

// Import các routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');

app.use('/api/auth', authRoutes); // Sử dụng route
app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) =>
{
    console.log('New client connected');

    socket.on('sendMessage', ({ senderId, receiverId, content }) =>
    {
        io.to(receiverId).emit('receiveMessage', {
            senderId,
            content,
            timestamp: new Date(),
        });
    });

    socket.on('disconnect', () =>
    {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${ PORT }`));
