const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema(
    {
        // Basic Information
        firstName: { type: String, trim: true, required: true },
        lastName: { type: String, trim: true, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        bio: { type: String, maxlength: 500 },

        // Location Information
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: { type: [Number], index: '2dsphere' }, // GeoJSON for location
            city: { type: String },
            country: { type: String },
        },
        nationality: { type: String },
        goals: { type: String }, // Personal or relationship goals
        preferenceAgeRange: {
            min: { type: Number, min: 18, default: 18 },
            max: { type: Number, max: 100, default: 50 },
        },
        occupation: { type: String },
        workLocation: { type: String },
        religion: { type: String },
        relationshipStatus: {
            type: String,
            enum: ['Single', 'Divorced', 'Single parent', 'Separated', 'In a relationship', 'Complicated'],
        },

        // Lifestyle & Preferences
        height: { type: mongoose.Types.Decimal128, default: null }, // Height in meters
        hobbies: [String],
        smoking: { type: String, enum: ['Do not smoke', 'Regularly', 'Occasionally'], default: 'Do not smoke' },
        drinking: { type: String, enum: ['Do not drink', 'Frequently', 'Socially'], default: 'Do not drink' },

        // Photos
        photos: [
            {
                url: { type: String, required: true },
                isMain: { type: Boolean, default: false }, // Main profile picture
                uploadedAt: { type: Date, default: Date.now },
            },
        ],

        // Activity
        lastActiveAt: { type: Date, default: Date.now }, // Last activity timestamp
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

// GeoSpatial index for location
UserProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
