const mongoose = require('mongoose');
const UserProfileSchema = require('./UserProfile');
const UserSubscriptionSchema = require('./UserSubscription');


const UserSchema = new mongoose.Schema({
    // Account Information
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true, select: false, minlength: 8 },
    phone: { type: String, unique: true, sparse: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        city: { type: String },
        country: { type: String }
    },
    // State
    account_type: { type: String, enum: ['Basic', 'Premium', 'VIP'], default: 'Basic' },
    account_status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },

    is_verified: { type: Boolean, default: false },
    thirdPartyVerified: { type: Boolean, default: false },
    // Security Settings
    isTwoFactorAuthEnabled: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
    },

    // userSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSubscription' },
    // events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
