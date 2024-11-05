const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    subscriptionPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
    },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    approved_by_admin: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
