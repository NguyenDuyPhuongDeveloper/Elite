const mongoose = require('mongoose');

const MatchingSchema = new mongoose.Schema({
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng đầu tiên
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng thứ hai
    compatibilityScore: { type: Number, required: true, default: 0 }, // Điểm tương thích
    status: {
        type: String,
        enum: ['Pending', 'Matched', 'Rejected', 'Unmatched'], // Trạng thái ghép cặp
        default: 'Pending',
    },
    matchedAt: { type: Date, default: null }, // Thời gian ghép cặp thành công
    unmatchedAt: { type: Date, default: null }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt
MatchingSchema.index({ user1: 1, user2: 1 }, { unique: true });
module.exports = mongoose.model('Matching', MatchingSchema);
