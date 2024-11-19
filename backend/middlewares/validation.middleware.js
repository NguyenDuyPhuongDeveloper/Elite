const { check, validationResult } = require('express-validator');

exports.validateRegistration = [
    check('username', 'User name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        next();
    },
];

exports.validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        next();
    },
];

exports.validateForgotPassword = [
    check('email', 'Please include a valid email').isEmail(),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        next();
    },
];

exports.validateResetPassword = [
    check('password', 'Please enter a new password with 6 or more characters').isLength({ min: 6 }),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }
        next();
    },
];
