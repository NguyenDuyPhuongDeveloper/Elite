const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserProfileSchema = require('./UserProfile');
const UserSubscriptionSchema = require('./UserSubscription');


const UserSchema = new mongoose.Schema({
    // Account Information
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true, select: false, minlength: 8 },
    phone: { type: String, unique: true, sparse: true },

    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date },
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

    // Verification
    is_verified: { type: Boolean, default: false },
    thirdPartyVerified: { type: Boolean, default: false },
    verification: {
        token: { type: String, select: false },
        expires: { type: Date, select: false },
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpire: {
        type: Date,
        select: false,
    },
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

UserSchema.pre('save', async function (next)
{
    if (!this.isModified('password')) return next(); // Chỉ hash nếu mật khẩu được sửa đổi
    this.password = await bcrypt.hash(this.password, 10); // Hash mật khẩu với saltRounds = 10
    next();
});

UserSchema.methods.comparePassword = async function (password)
{
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
