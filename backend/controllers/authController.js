const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile')
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { createAccessToken, createRefreshToken, verifyToken } = require('../utils/jwt');
const { verifyOTP, sendOTP } = require('../utils/OTP');

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

        // Check if the email, phone or username already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail)
        {
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername)
        {
            return res.status(400).json({ success: false, message: 'Username already in use.' });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone)
        {
            return res.status(400).json({ success: false, message: 'Phone number already in use.' });
        }


        // Tạo mã OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = crypto.createHmac('sha256', process.env.SECRET_KEY)
            .update(otpCode)
            .digest('hex');
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút


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
                code: hashedOTP,
                expires: otpExpires,
                failedAttempts: 0,
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

        const user = await verifyOTP(email, otpCode, 'email');

        user.is_verified = true;
        user.verification = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error)
    {
        if (error.message === 'Invalid or expired OTP')
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please try again.'
            });
        }
        if (error.message === 'Too many failed attempts. Please request a new OTP.')
        {
            return res.status(429).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Invalid identifier type. Must be either "email" or "phone".')
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid identifier type provided.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error in email verification or wrong OTP Code',
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

        res.cookie('token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS khi ở môi trường production
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'Strict'
        });
        const loginTime = new Date();
        console.log(`[LOGIN] User attempted to login at: ${ loginTime.toLocaleString() }`);
        console.log('accesstoken: ', accessToken);
        console.log('refreshtoken: ', refreshToken);

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

        const frontendUrl =
            process.env.NODE_ENV === 'production'
                ? process.env.frontendUrl
                : 'http://localhost:3000';

        const resetUrl = `${ frontendUrl }/reset-password/${ resetToken }`;
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
        if (!user)
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        // Check if token is already used or expired
        if (Date.now() > user.resetPasswordExpire)
        {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired',
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
exports.resetPasswordByPhone = async (req, res) =>
{
    try
    {
        const { phone, otpCode, newPassword } = req.body;

        if (!newPassword || newPassword.length < 8)
        {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.'
            });
        }

        // Kiểm tra OTP
        const user = await verifyOTP(phone, otpCode);

        // Mã hóa mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error)
    {
        res.status(400).json({
            success: false,
            message: error.message || 'Error resetting password',
        });
    }
};
exports.verifyPhone = async (req, res) =>
{
    try
    {
        const { phone, otpCode } = req.body;

        // Kiểm tra OTP
        const user = await verifyOTP(phone, otpCode, 'phone');

        // Đánh dấu số điện thoại đã được xác minh
        user.is_phone_verified = true;
        user.verification = undefined; // Xóa thông tin OTP
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Phone number verified successfully',
        });
    } catch (error)
    {
        res.status(400).json({
            success: false,
            message: error.message || 'Error verifying phone number',
        });
    }
};
exports.sendPhoneOTP = async (req, res) =>
{
    try
    {
        const { phone } = req.body;

        // Tìm người dùng
        const user = await User.findOne({ phone });
        if (!user)
        {
            return res.status(200).json({
                success: true,
                message: 'If the phone number exists, OTP has been sent successfully1.',
            });
        }

        // Gửi OTP qua phone bằng hàm sendOTP
        try
        {
            await sendOTP({ identifier: phone, type: 'phone', user });
        } catch (error)
        {
            // Xử lý lỗi từ hàm sendOTP (ví dụ: chống spam)
            return res.status(429).json({
                success: false,
                message: error.message,
            });
        }

        res.status(200).json({
            success: true,
            message: 'If the phone number exists, OTP has been sent successfully.',
        });
    } catch (error)
    {
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message,
        });
    }
};
exports.sendMailOTP = async (req, res) =>
{
    try
    {
        const { email } = req.body;

        // Kiểm tra email đầu vào
        if (!email)
        {
            return res.status(400).json({
                success: false,
                message: 'Email is required.',
            });
        }

        // Tìm người dùng dựa trên email
        const user = await User.findOne({ email });

        // Nếu người dùng không tồn tại, trả về phản hồi an toàn
        if (!user)
        {
            return res.status(200).json({
                success: true,
                message: 'If the email exists, OTP has been sent successfully.',
            });
        }

        // Gửi OTP qua email bằng hàm sendOTP
        try
        {
            await sendOTP({ identifier: email, type: 'email', user });
        } catch (error)
        {
            // Xử lý lỗi từ hàm sendOTP (ví dụ: chống spam)
            return res.status(429).json({
                success: false,
                message: error.message,
            });
        }

        // Phản hồi thành công
        res.status(200).json({
            success: true,
            message: 'If the email exists, OTP has been sent successfully.',
        });
    } catch (error)
    {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};

exports.refreshToken = async (req, res) =>
{

    try
    {
        // Lấy Refresh Token từ cookie
        const refreshToken = req.cookies.token;
        console.log("refreshToken:", refreshToken);
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
        console.log("accesstoken after provided: ", newAccessToken);

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

exports.googleCallback = async (req, res) =>
{
    try
    {
        // Người dùng được Passport.js xử lý và thêm vào req.user
        const user = req.user;

        // Tạo Access Token và Refresh Token
        const accessToken = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);

        // Lưu Refresh Token vào cookie
        res.cookie('token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            sameSite: 'Strict',
        });

        // Chuyển hướng về frontend với Access Token
        const frontendUrl =
            process.env.NODE_ENV === 'production'
                ? process.env.FRONTEND_URL
                : 'http://localhost:3000';

        res.redirect(`${ frontendUrl }/google-callback/${ accessToken }`);
    } catch (error)
    {
        console.error('Google Callback Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error handling Google callback',
        });
    }
};





