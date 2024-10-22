const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    approved_by_admin: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
