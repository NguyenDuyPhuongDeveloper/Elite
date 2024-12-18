const config = require('../config'); // File config chứa thông tin Twilio hoặc các TURN servers khác

const getICEServers = () =>
{
    // Cấu hình STUN/TURN servers
    return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
            urls: [
                'turn:global.turn.twilio.com:3478?transport=udp',
                'turn:global.turn.twilio.com:3478?transport=tcp',
                'turn:global.turn.twilio.com:443?transport=tcp',
            ],
            username: config.TWILIO_API_KEY_SID,
            credential: config.TWILIO_API_KEY_SECRET
        }
    ];
};

module.exports = {
    getICEServers
};
