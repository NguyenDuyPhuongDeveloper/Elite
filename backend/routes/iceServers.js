const express = require('express');
const router = express.Router();
const iceServerService = require('../services/iceServerService');

// API để trả về danh sách ICE Servers
router.get('/', (req, res) =>
{
    try
    {
        const iceServers = iceServerService.getICEServers();
        res.json({ iceServers });
    } catch (error)
    {
        console.error('Lỗi khi lấy ICE servers:', error);
        res.status(500).json({ error: 'Không thể lấy ICE servers' });
    }
});

module.exports = router;
