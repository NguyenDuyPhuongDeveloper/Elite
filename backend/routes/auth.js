const express = require('express');
const {
    register,
    login,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    getMe,
    sendPasswordResetOTP,
    verifyOTPAndResetPassword
} = require('../controllers/authController');
const router = express.Router();

// Validation middleware
const { validateRegistration, validateLogin } = require('../middlewares/validation.middleware');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/logout', protect, logout); // Logout requires authentication
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/send-password-reset-otp', sendPasswordResetOTP);
router.post('/verify-otp-reset-password', verifyOTPAndResetPassword);
router.get('/verify-email/', verifyEmail);
router.get('/me', protect, getMe);

module.exports = router;
