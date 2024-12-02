const redisClient = require('../config/redis');

// Lưu trạng thái thiết bị
const saveDeviceState = async (userId, deviceId, refreshToken) =>
{
    const key = `user:${ userId }:devices`;
    const ttl = 7 * 24 * 60 * 60; // 7 ngày

    const devices = await redisClient.hGetAll(key);

    if (Object.keys(devices).length >= 5)
    {
        // Xóa thiết bị cũ nhất
        const oldestDevice = Object.entries(devices)
            .map(([deviceId, value]) => ({ deviceId, ...JSON.parse(value) }))
            .sort((a, b) => new Date(a.lastAccess) - new Date(b.lastAccess))[0];
        await redisClient.hDel(key, oldestDevice.deviceId);
    }

    const deviceState = JSON.stringify({ refreshToken, lastAccess: new Date().toISOString() });
    await redisClient.hSet(key, deviceId, deviceState);
    await redisClient.expire(key, ttl);
};

// Thu hồi các thiết bị khác
const revokeOtherDevices = async (userId, currentDeviceId) =>
{
    const key = `user:${ userId }:devices`;
    const devices = await redisClient.hGetAll(key);

    for (const [deviceId, value] of Object.entries(devices))
    {
        if (deviceId !== currentDeviceId)
        {
            await redisClient.hDel(key, deviceId);
        }
    }
};

// Kiểm tra thiết bị
const checkDevice = async (userId, deviceId) =>
{
    const key = `user:${ userId }:devices`;
    const deviceState = await redisClient.hGet(key, deviceId);
    if (!deviceState) throw new Error('Invalid device');

    const updatedState = JSON.stringify({ ...JSON.parse(deviceState), lastAccess: new Date().toISOString() });
    await redisClient.hSet(key, deviceId, updatedState);
};

module.exports = { saveDeviceState, revokeOtherDevices, checkDevice };
