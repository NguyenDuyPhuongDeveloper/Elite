const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media_url: { type: String },
    sent_at: { type: Date, default: Date.now },
    message_type: { type: String }
});

module.exports = mongoose.model('Message', messageSchema);
