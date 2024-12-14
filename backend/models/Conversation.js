const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    last_message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    updated_at: { type: Date, default: Date.now }
});

ConversationSchema.index({ updated_at: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
