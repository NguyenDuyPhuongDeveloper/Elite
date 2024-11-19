const nodemailer = require('nodemailer');

const sendEmail = async (options) =>
{
    try
    {
        // Kiểm tra email người nhận
        if (!options.email)
        {
            throw new Error('Recipient email is required');
        }

        // Tạo transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Định nghĩa nội dung email
        const mailOptions = {
            from: `${ process.env.FROM_NAME } <${ process.env.FROM_EMAIL }>`, // Người gửi
            to: options.email, // Người nhận
            subject: options.subject, // Tiêu đề email
            text: options.message, // Nội dung dạng text
            html: options.html || null, // Nội dung dạng HTML (nếu có)
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error)
    {
        console.error('Error sending email:', error.message);
        throw error;
    }
};

module.exports = sendEmail;
