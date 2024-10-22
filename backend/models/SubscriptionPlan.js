const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    plan_name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in days
    features: [{ type: String }],
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
