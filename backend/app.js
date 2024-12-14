const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

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
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your_secret_key', // Chuỗi bí mật để mã hóa session
        resave: false, // Không lưu lại session nếu không thay đổi
        saveUninitialized: false, // Không lưu session trống
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Bật HTTPS ở môi trường production
            maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (1 ngày)
        },
    })
);

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