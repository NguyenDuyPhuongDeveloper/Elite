const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProfile',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserProfile'
    },
    type: {
        type: String,
        enum: [
            'MATCH',
            'MESSAGE',
            'LIKE',
            'SUPER_LIKE',
            'PROFILE_VIEW',
            'COMPATIBILITY_UPDATE',
            'SYSTEM_ALERT'
        ],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['Matching', 'Message', 'Interaction', 'UserProfile']
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
}, {
    timestamps: true
});

// Indexing for performance
NotificationSchema.index({
    recipient: 1,
    read: 1,
    createdAt: -1
});
module.exports = mongoose.model('Notification', NotificationSchema);