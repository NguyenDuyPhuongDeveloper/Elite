const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
    nationality: String,
    status: String,
    goals: String,
    dob: Date,
    location: String,
    preferenceAgeRange: {
        min: Number,
        max: Number,
    },
    occupation: String,
    workLocation: String,
    religion: String,
    relationshipStatus: { type: String, enum: ['Single', 'Divorced', 'Single parent', 'Separated', 'In a relationship', 'Complicated'] },
    height: mongoose.Types.Decimal128,
    hobbies: [String],
    smoking: { type: String, enum: ['Do not smoke', 'Regularly', 'Occasionally'] },
    drinking: { type: String, enum: ['Do not drink', 'Frequently', 'Socially'] },
    is_verified: Boolean,
}, { _id: false });

module.exports = mongoose.model('UserProfile', userProfileSchema);
