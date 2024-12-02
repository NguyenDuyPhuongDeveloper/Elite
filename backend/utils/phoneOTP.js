const crypto = require('crypto');
const User = require('../models/User');

/**
 * Hàm xác minh OTP
 * @param {string} phone - Số điện thoại người dùng
 * @param {string} otpCode - Mã OTP người dùng nhập
 * @returns {object} user - Đối tượng người dùng đã xác minh OTP
 * @throws {Error} - Lỗi nếu OTP không hợp lệ hoặc hết hạn
 */
const verifyOTP = async (phone, otpCode) =>
{
    const hashedOTP = crypto.createHmac('sha256', process.env.SECRET_KEY)
        .update(otpCode)
        .digest('hex');

    const user = await User.findOne({
        phone,
        'verification.code': hashedOTP,
        'verification.expires': { $gt: Date.now() }, // OTP chưa hết hạn
    });


    // Nếu OTP không hợp lệ, tăng `failedAttempts`
    if (!user)
    {
        await User.updateOne(
            { phone },
            { $inc: { 'verification.failedAttempts': 1 } }
        );
        throw new Error('Invalid or expired OTP');
    }
    if (user.verification.failedAttempts >= 5)
    {
        throw new Error('Too many failed attempts. Please request a new OTP.');
    }


    // Xóa OTP sau khi xác minh thành công
    user.verification = undefined;
    await user.save();

    return user;
};

module.exports = {
    verifyOTP,
};
