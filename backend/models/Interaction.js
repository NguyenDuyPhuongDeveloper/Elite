const InteractionSchema = new mongoose.Schema({
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true }, // Người thực hiện hành động
    userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true }, // Người nhận hành động
    type: {
        type: String,
        enum: ['Like', 'Dislike', 'SuperLike', 'Message', 'View'], // Loại tương tác
        required: true,
    },
    message: { type: String, maxlength: 500 }, // Nội dung tin nhắn (chỉ áp dụng với 'Message')
    createdAt: { type: Date, default: Date.now }, // Thời gian thực hiện
}, { timestamps: true });
InteractionSchema.index({ userFrom: 1, userTo: 1 });
module.exports = mongoose.model('Interaction', InteractionSchema);
