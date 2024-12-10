const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); // Hàm gửi email
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); // Twilio client


/**
 * Hàm xác minh OTP
 * @param {string} identifier - Email hoặc số điện thoại người dùng
 * @param {string} otpCode - Mã OTP người dùng nhập
 * @param {string} type - Loại định danh ('email' hoặc 'phone')
 * @returns {object} user - Đối tượng người dùng đã xác minh OTP
 * @throws {Error} - Lỗi nếu OTP không hợp lệ hoặc hết hạn
 */
const verifyOTP = async (identifier, otpCode, type) =>
{
    if (!['email', 'phone'].includes(type))
    {
        throw new Error('Invalid identifier type. Must be either "email" or "phone".');
    }

    const hashedOTP = crypto.createHmac('sha256', process.env.SECRET_KEY)
        .update(otpCode)
        .digest('hex');

    // Tạo điều kiện tìm kiếm dựa trên loại định danh
    const query = {
        [type]: identifier, // email hoặc phone
        'verification.code': hashedOTP,
        'verification.expires': { $gt: Date.now() }, // OTP chưa hết hạn
    };

    const user = await User.findOne(query);

    // Nếu OTP không hợp lệ, tăng `failedAttempts`
    if (!user)
    {
        await User.updateOne(
            { [type]: identifier },
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
/**
 * Gửi OTP qua email hoặc SMS
 * @param {Object} options - Các tùy chọn để gửi OTP
 * @param {string} options.identifier - Email hoặc số điện thoại
 * @param {string} options.type - Loại gửi OTP ('email' hoặc 'phone')
 * @param {Object} options.user - Đối tượng người dùng từ cơ sở dữ liệu
 */
const sendOTP = async ({ identifier, type, user }) =>
{
    if (!['email', 'phone'].includes(type))
    {
        throw new Error('Invalid identifier type. Must be either "email" or "phone".');
    }
    // Kiểm tra giới hạn gửi OTP (chống spam)
    if (user.verification && user.verification.expires > Date.now() - 60 * 1000)
    {
        throw new Error('Please wait at least 1 minute before requesting another OTP.');
    }

    // Tạo mã OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHmac('sha256', process.env.SECRET_KEY)
        .update(otpCode)
        .digest('hex');
    const otpExpires = Date.now() + 1 * 60 * 1000; // 1 phút

    // Lưu OTP vào đối tượng người dùng
    user.verification = {
        code: hashedOTP,
        expires: otpExpires,
        failedAttempts: 0, // Reset lại số lần nhập sai
    };
    await user.save();

    // Gửi OTP qua phương thức phù hợp
    if (type === 'email')
    {
        // Gửi qua email
        await sendEmail({
            email: identifier,
            subject: 'Email Verification OTP',
            html: `<p>Your OTP code is:</p>
                   <h2>${ otpCode }</h2>
                   <p>This code will expire in 1 minutes.</p>`,
        });
    } else if (type === 'phone')
    {
        // Gửi qua SMS
        await client.messages.create({
            body: `Your OTP code is: ${ otpCode }. It will expire in 1 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: identifier,
        });
    }

    return otpCode; // Chỉ trả về cho mục đích kiểm thử, không gửi đến client trong sản phẩm thực tế
};
module.exports = {
    verifyOTP,
    sendOTP
};
