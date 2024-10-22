const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nationality: { type: String },
    city: { type: String },
    dob: { type: Date },
    gender: { type: String },
    preferredAgeRange: {
        min: { type: Number },
        max: { type: Number }
    },
    education: { type: String },
    occupation: { type: String },
    workplace: { type: String },
    languages: [{ type: String }],
    relationshipStatus: { type: String },
    religion: { type: String },
    height: { type: Number },
    weight: { type: Number },
    hobbies: [{ type: String }],
    smoking: { type: String },
    drinking: { type: String },
    preferences: { type: mongoose.Schema.Types.Mixed },
    accountStatus: { type: String },
    is_verified: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
