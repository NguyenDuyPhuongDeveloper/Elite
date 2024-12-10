const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema(
    {
        // Basic Information
        firstName: { type: String, trim: true, required: true },
        lastName: { type: String, trim: true, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        bio: { type: String, maxlength: 500 },
        goals: { type: String, enum: ['Conversation and friendship', 'Long-term relationships', 'Creating a family', 'Casual dating', 'Serious relationship', 'Other'], default: 'Other' },
        relationshipStatus: {
            type: String,
            enum: ['Single', 'Divorced', 'Single parent', 'Separated', 'In a relationship', 'Complicated'],
        },
        preferenceAgeRange: {
            min: { type: Number, min: 18, default: 18 },
            max: { type: Number, max: 100, default: 50 },
        },
        interestedIn: { type: String, enum: ['Male', 'Female', 'Other'] },
        children: { type: String, enum: ["Don't have children", "Have children"] },
        childrenDesire: { type: String, enum: ["I don’t want children right now, maybe later", "No, I don't want children", "I would like to have children"] },

        // Work and education
        occupation: { type: String },
        professionalStatus: { type: String, enum: ['Unemployed', 'Specialist', 'Entrepreneur', 'Workman', 'Junior manager', 'Freelancer/Self-employed', 'Student'] },
        workLocation: { type: String },
        religion: { type: String },
        education: { type: String, enum: ["Some college", "Associate, bachelor's, or master's degree", "Doctoral degree", "Vocational high school degree", "More than one academic degree", "High school degree"] },
        educationAt: [
            {
                type: String, // Name of the educational institution
                trim: true,
            },
        ],



        // Lifestyle & Preferences
        height: { type: mongoose.Types.Decimal128, default: null }, // Height in meters
        hobbies: [String],
        smoking: { type: String, enum: ['Do not smoke', 'Regularly', 'Occasionally'], default: 'Do not smoke' },
        drinking: { type: String, enum: ['Do not drink', 'Frequently', 'Socially'], default: 'Do not drink' },

        // Location Information
        nationality: { type: String },
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
        locationRadius: { type: Number, default: 50 },//km

        // Photos
        photos: [
            {
                url: { type: String, required: true },
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
