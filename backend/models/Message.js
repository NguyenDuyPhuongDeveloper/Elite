const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    message_type: { type: String, enum: ['text', 'image', 'video', 'file'], required: true },
    attachments: [String], // Đường dẫn tới các tệp đính kèm nếu có
    sent_at: { type: Date, default: Date.now },
    is_read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Message', MessageSchema);
