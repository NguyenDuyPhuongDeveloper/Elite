const express = require('express');
const {
    getCurrentUser,
    updateUser,
    getAllUsers,
    getUserById,
    deleteUser,
    updateUserProfile,
    changePassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Routes for user management
router.get('/me', protect, getCurrentUser); // Get current user's information
router.put('/update', protect, updateUser); // Update current user's information
router.get('/list', protect, authorize('Admin'), getAllUsers); // Get all users (Admin only)
router.get('/:userId', getUserById); // Get user details by ID
router.delete('/:userId', protect, authorize('Admin'), deleteUser); // Delete a user (Admin only)
router.put('/profile/update', protect, updateUserProfile); // Update current user's profile
router.put('/change-password', protect, changePassword);


module.exports = router;
