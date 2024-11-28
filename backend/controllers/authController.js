const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile')
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { createAccessToken, createRefreshToken, verifyToken } = require('../utils/jwt');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// Register user
exports.register = async (req, res) =>
{
    try
    {
        // Validate input
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

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;


        // Create a new user profile
        const newUserProfile = new UserProfile({
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
        });

        await newUserProfile.save();  // Save the profile

        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
            phone,
            verification: {
                code: otpCode,
                expires: otpExpires,
            },
            profile: newUserProfile._id,  // Link the user to the profile
        });

        await newUser.save();

        // Send verification email
        await sendEmail({
            email, // Người nhận
            subject: 'Email Verification',
            html: `<p>Hi ${ username },</p>
                   <p>Your verification OTP is:</p>
                   <h2>${ otpCode }</h2>
                   <p>This code will expire in 10 minutes.</p>`,
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for the verification OTP.',
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
// Verify email
exports.verifyEmail = async (req, res) =>
{
    try
    {
        const { email, otpCode } = req.body;

        const user = await User.findOne({
            'verification.code': otpCode,
            'verification.expires': { $gt: Date.now() }
        });

        if (!user)
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
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
        const accessToken = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);
        console.log(refreshToken);

        res.cookie('token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS khi ở môi trường production
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'Strict'
        });

        res.status(200).json({
            success: true,
            token: accessToken,
            user,
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
    try
    {
        // Clear the refresh token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ áp dụng khi ở môi trường production
            sameSite: 'Strict'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error in user logout',
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
exports.sendPasswordResetOTP = async (req, res) =>
{
    try
    {
        const { phone } = req.body;

        // Kiểm tra số điện thoại có tồn tại trong hệ thống không
        const user = await User.findOne({ phone });
        if (!user)
        {
            return res.status(404).json({ success: false, message: 'User with this phone number not found' });
        }

        // Tạo mã OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút

        // Cập nhật OTP và thời gian hết hạn vào cơ sở dữ liệu
        user.otpCode = otpCode;
        user.otpExpires = otpExpires;
        await user.save();

        // Gửi OTP qua SMS
        await client.messages.create({
            body: `Your password reset OTP is: ${ otpCode }. It will expire in 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error)
    {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
    }
};

exports.verifyOTPAndResetPassword = async (req, res) =>
{
    try
    {
        const { phone, otpCode, newPassword } = req.body;

        // Tìm người dùng dựa trên số điện thoại và mã OTP
        const user = await User.findOne({
            phone,
            otpCode,
            otpExpires: { $gt: Date.now() }, // OTP phải còn hiệu lực
        });

        if (!user)
        {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        user.otpCode = undefined; // Xóa OTP sau khi sử dụng
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error)
    {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
    }
};
exports.refreshToken = async (req, res) =>
{

    try
    {
        // Lấy Refresh Token từ cookie
        const refreshToken = req.cookies.token;
        if (!refreshToken)
        {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided',
            });
        }

        // Xác minh Refresh Token
        const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded)
        {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }

        // Tìm người dùng từ token
        const user = await User.findById(decoded.id);
        if (!user)
        {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Tạo Access Token mới
        const newAccessToken = createAccessToken(user._id);

        res.status(200).json({
            success: true,
            token: newAccessToken, // Trả Access Token mới cho frontend
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error refreshing token',
            error: error.message,
        });
    }
};





