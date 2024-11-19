const express = require('express');
const {
    register,
    login,
    verifyEmail,
    logout,            // Add logout
    forgotPassword,    // Add forgotPassword
    resetPassword,     // Add resetPassword
    getMe,
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
router.get('/verify/:token', verifyEmail);
router.get('/me', protect, getMe);

module.exports = router;
