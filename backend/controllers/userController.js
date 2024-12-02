const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// Get current user's information
exports.getCurrentUser = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id).populate('profile');
        console.log("user info from backend", user);
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user information.',
            error: error.message,
        });
    }
};

// Update current user's information
exports.updateUser = async (req, res) =>
{
    try
    {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error updating user information.',
            error: error.message,
        });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) =>
{
    try
    {
        const users = await User.find().populate('profile');
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error retrieving users list.',
            error: error.message,
        });
    }
};

// Get user details by ID
exports.getUserById = async (req, res) =>
{
    try
    {
        const { userId } = req.params;

        // Check access permissions
        if (req.user.account_type !== 'Admin' && req.user.id !== userId)
        {
            return res.status(403).json({
                success: false,
                message: 'Access denied to view this user information.',
            });
        }

        const user = await User.findById(userId).populate('profile');
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user details.',
            error: error.message,
        });
    }
};

// Delete a user (Admin only)
exports.deleteUser = async (req, res) =>
{
    try
    {
        const { userId } = req.params;

        // Only Admin has permission to delete
        if (req.user.account_type !== 'Admin')
        {
            return res.status(403).json({
                success: false,
                message: 'Access denied to delete user.',
            });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'User successfully deleted.',
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error deleting user.',
            error: error.message,
        });
    }
};

// Update current user's profile
exports.updateUserProfile = async (req, res) =>
{
    try
    {
        const updates = req.body;

        // Find the current user
        const user = await User.findById(req.user.id);
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // Update profile
        const profile = await UserProfile.findByIdAndUpdate(user.profile, updates, { new: true });
        if (!profile)
        {
            return res.status(404).json({
                success: false,
                message: 'Profile not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error updating profile.',
            error: error.message,
        });
    }
};
