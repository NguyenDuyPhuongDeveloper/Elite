const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        // Account Information
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, unique: true, required: true, lowercase: true },
        password: { type: String, required: true, select: false, minlength: 8 },
        phone: { type: String, unique: true, sparse: true },

        // Account State
        account_type: { type: String, enum: ['Basic', 'Premium', 'VIP'], default: 'Basic' },
        account_status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },

        // Verification
        is_verified: { type: Boolean, default: false }, // Email verification
        verification: {
            code: { type: String },
            expires: { type: Date }
        },
        is_phone_verified: { type: Boolean, default: false }, // Phone verification
        otpCode: { type: String, select: false },
        otpExpires: { type: Date },
        //refreshToken: { type: String },
        thirdPartyVerified: { type: Boolean, default: false }, // External verification status

        // Reset password
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },

        // Security
        isTwoFactorAuthEnabled: { type: Boolean, default: false },
        twoFactorAuthSecret: { type: String, select: false },

        // Relationships
        profile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', default: null },
        userSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSubscription', default: null },

        // Metadata
        lastLogin: { type: Date }, // Last login timestamp
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Hash password before saving
UserSchema.pre('save', async function (next)
{
    if (!this.isModified('password')) return next(); // Skip if password is not modified
    try
    {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error)
    {
        next(error);
    }
});

// Compare password during login
UserSchema.methods.comparePassword = async function (password)
{
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

