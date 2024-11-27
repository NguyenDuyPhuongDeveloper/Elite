const jwt = require('jsonwebtoken');

const createAccessToken = (userId) =>
{
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_JWT_EXPIRE });
};

const createRefreshToken = (userId) =>
{
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_JWT_EXPIRE });
};

const verifyToken = (token, secret) =>
{
    try
    {
        return jwt.verify(token, secret);
    } catch (err)
    {
        return null;
    }
};

module.exports = { createAccessToken, createRefreshToken, verifyToken };
