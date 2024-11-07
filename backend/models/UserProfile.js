const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
    nationality: String,
    status: String,
    goals: String,
    dob: Date,
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
        address: String
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    preferenceAgeRange: {
        min: { type: Number, min: 18 },
        max: { type: Number, max: 100 }
    },
    occupation: String,
    workLocation: String,
    religion: String,
    relationshipStatus: { type: String, enum: ['Single', 'Divorced', 'Single parent', 'Separated', 'In a relationship', 'Complicated'] },
    height: mongoose.Types.Decimal128,
    hobbies: [String],
    smoking: { type: String, enum: ['Do not smoke', 'Regularly', 'Occasionally'] },
    drinking: { type: String, enum: ['Do not drink', 'Frequently', 'Socially'] },
    photos: [{
        url: String,
        isMain: Boolean,
        uploadedAt: { type: Date, default: Date.now }
    }],
    is_verified: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
}, { _id: false });

module.exports = mongoose.model('UserProfile', userProfileSchema);
