const mongoose = require('mongoose');

// User Model
const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    gender: { type: String },
    accountType: { type: String, enum: ['regular', 'premium', 'vip'], default: 'regular' },
    created_at: { type: Date, default: Date.now },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
    actionLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserAction' }],
    idNumber: { type: String },
    userSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSubscription' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);