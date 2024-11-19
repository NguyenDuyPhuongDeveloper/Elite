const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) =>
{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Register user
exports.register = async (req, res) =>
{
    try
    {
        // Validate input (nếu dùng express-validator)
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, email, password, phone, firstName, lastName, dateOfBirth, gender, location } = req.body;

        // Check if the email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser)
        {
            return res.status(400).json({ success: false, message: 'Email or username already in use.' });
        }

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = Date.now() + 5 * 60 * 1000;

        // Create new user
        const newUser = new User({
            username,
            email,
            password,
            phone,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            location: {
                type: 'Point',
                coordinates: location?.coordinates || [],
                city: location?.city || '',
                country: location?.country || '',
            },
            verification: {
                token: verificationToken,
                expires: tokenExpires,
            },
        });

        // Save user
        await newUser.save();

        // Send verification email
        const verificationLink = `http://localhost:5000/api/v1/auth/verify/${ verificationToken }`;
        await sendEmail({
            email, // Người nhận
            subject: 'Email Verification',
            html: `<p>Hi ${ username },</p>
                   <p>Please verify your email by clicking the link below:</p>
                   <a href="${ verificationLink }">${ verificationLink }</a>`,
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
        });
    } catch (error)
    {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
        });
    }
};

// Login user
exports.login = async (req, res) =>
{
    try
    {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user)
        {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
        {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                account_type: user.account_type
            }
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error in user login',
            error: error.message
        });
    }
};

// Logout user
exports.logout = (req, res) =>
{
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    });
};

// Forgot password
exports.forgotPassword = async (req, res) =>
{
    try
    {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `${ req.protocol }://${ req.get('host') }/api/v1/auth/reset-password/${ resetToken }`;

        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: `You requested a password reset. Click here to reset your password: ${ resetUrl }`
        });

        res.status(200).json({
            success: true,
            message: 'Reset email sent'
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error in password reset request',
            error: error.message
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) =>
{
    try
    {
        const { resetToken } = req.params;
        const { password, confirmPassword } = req.body;

        // Validate password match
        if (password !== confirmPassword)
        {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Hash the reset token to compare with stored token
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Find user with matching reset token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        console.log(user);

        if (!user)
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }


        // Update user password and clear reset token fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error)
    {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

// Verify email
exports.verifyEmail = async (req, res) =>
{
    try
    {
        const { token } = req.params;

        const user = await User.findOne({
            'verification.token': token,
            'verification.expires': { $gt: Date.now() }
        });

        if (!user)
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.is_verified = true;
        user.verification = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error in email verification',
            error: error.message
        });
    }
};

// Get current user
exports.getMe = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error in getting user details',
            error: error.message
        });
    }
};
