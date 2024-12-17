const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const passport = require('./config/passportConfig')
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const matchRoutes = require('./routes/match');
const messageRoutes = require('./routes/message');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notification');
const interactionRoutes = require('./routes/interaction');
const conversationRoutes = require('./routes/conversation');
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Địa chỉ frontend
    credentials: true, // Cho phép gửi cookie
};

const app = express();

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // Sử dụng URI của MongoDB Atlas
        ttl: 14 * 24 * 60 * 60, // Thời gian sống của session (14 ngày)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Bật secure cookie nếu production
        httpOnly: true,
    }
}));

app.use(passport.initialize());
app.use(passport.session());
// Routes will be added here
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/match', matchRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/message', messageRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/interaction', interactionRoutes);
app.use('/api/v1/conversations', conversationRoutes);

// Error handling middleware
app.use((err, req, res, next) =>
{
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;