const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) =>
{
    try
    {
        let token;

        // Check token in headers (e.g., Authorization: Bearer <token>)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check token in request body
        else if (req.body.token)
        {
            token = req.body.token;
        }
        // Check token in query parameters (e.g., ?token=<token>)
        else if (req.query.token)
        {
            token = req.query.token;
        }

        // If token is not provided, return error
        if (!token)
        {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        // Check if user exists
        if (!user)
        {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if user is verified
        if (!user.is_verified)
        {
            return res.status(403).json({
                success: false,
                message: 'Email is not verified',
            });
        }

        req.user = user;
        next();
    } catch (error)
    {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
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
