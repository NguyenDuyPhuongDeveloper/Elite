const express = require('express');
const {
    register,
    login,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
    resetPasswordByPhone,
    sendOTP,
    verifyPhone,
    refreshToken
} = require('../controllers/authController');
const router = express.Router();

// Validation middleware
const { validateRegistration, validateLogin } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout); // Logout requires authentication
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/send-password-reset-otp', resetPasswordByPhone);
router.post('/send-otp', sendOTP);
router.post('/verify-phone', verifyPhone);
router.post('/verify-email/', verifyEmail);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
module.exports = router;
