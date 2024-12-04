const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) =>
{
    try
    {
        let token;

        // Lấy token từ các nguồn khác nhau
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.body.token)
        {
            token = req.body.token;
        } else if (req.query.token)
        {
            token = req.query.token;
        }

        // Nếu không có token, trả lỗi
        if (!token)
        {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Token missing.',
            });
        }

        // Xác thực token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Lấy thông tin user từ database
        const user = await User.findById(decoded.id).select('-password');
        if (!user)
        {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        // Kiểm tra trạng thái xác minh của user
        if (!user.is_verified)
        {
            return res.status(403).json({
                success: false,
                message: 'Email is not verified',
            });
        }

        // Gắn thông tin user vào request object
        req.user = user;
        next();
    } catch (error)
    {
        // Xử lý lỗi token hết hạn hoặc không hợp lệ
        if (error.name === 'TokenExpiredError')
        {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }
        if (error.name === 'JsonWebTokenError')
        {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error in authorization',
        });
    }
};

const authorize = (...roles) =>
{
    return (req, res, next) =>
    {
        if (!roles.includes(req.user.account_type))
        {
            return res.status(403).json({
                success: false,
                message: `User role ${ req.user.account_type } is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
