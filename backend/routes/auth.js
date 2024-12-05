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
    sendPhoneOTP,
    sendMailOTP,
    verifyPhone,
    refreshToken,
    googleCallback
} = require('../controllers/authController');
const router = express.Router();

// Validation middleware
const passport = require('passport');
const { validateRegistration, validateLogin } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/send-password-reset-otp', resetPasswordByPhone);
router.post('/send-otp-phone', sendPhoneOTP);
router.post('/send-otp-mail', sendMailOTP);
router.post('/verify-phone', verifyPhone);
router.post('/verify-email/', verifyEmail);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', }));
// Google Callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleCallback
);
module.exports = router;
