const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    content: { type: String, required: true },
    message_type: { type: String, enum: ['text', 'image', 'video', 'file'], required: true },
    attachments: [{
        url: String,
        type: String,
        size: Number,
        name: String
    }],
    sent_at: { type: Date, default: Date.now },
    delivered_at: Date,
    read_at: Date,
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    }
});
MessageSchema.index({ sender: 1, receiver: 1, sentAt: -1 });
module.exports = mongoose.model('Message', MessageSchema);
