const mongoose = require('mongoose');
// UserProfile Schema
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

// UserSubscription Schema
const userSubscriptionSchema = new mongoose.Schema({
    subscriptionPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
    },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    approved_by_admin: { type: Boolean, default: false }
});

// User Schema
const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    account_type: { type: String, enum: ['Basic', 'Premium', 'VIP'], default: 'Basic' },
    created_at: { type: Date, default: Date.now },
    profile: UserProfileSchema,
    userSubscription: UserSubscriptionSchema,
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

// Message Schema
const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    message_type: { type: String, enum: ['text', 'image', 'video', 'file'], required: true },
    attachments: [String], // Đường dẫn tới các tệp đính kèm nếu có
    sent_at: { type: Date, default: Date.now },
    is_read: { type: Boolean, default: false },
});

// Event Schema
const EventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event_name: String,
    purpose: String,
    type: { type: String, enum: ['Online', 'Offline'] },
    visibility: { type: String, enum: ['Public', 'Private'] },
    start_time: Date,
    location: String,
    registration_limit: Number,
    description: String,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    created_at: { type: Date, default: Date.now },
});

// SubscriptionPlan Schema
const subscriptionPlanSchema = new mongoose.Schema({
    plan_name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in days
    features: [{ type: String }],
    created_at: { type: Date, default: Date.now }
});

// Third Party Schema
const ThirdPartySchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: String,
    actionsLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ActionLog' }],
});

// Interaction Schema
const InteractionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    interaction_type: String,
    interaction_date: { type: Date, default: Date.now },
});

// UserAction Schema
const UserActionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action_type: String,
    action_date: { type: Date, default: Date.now },
    reason: String,
});

// ActionLog Schema
const ActionLogSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action_type: String,
    action_date: { type: Date, default: Date.now },
    reason: String,
});

// StatisticsAndReporting Schema
const StatisticsAndReportingSchema = new mongoose.Schema({
    title: String,
    content: String,
    reportType: String,
    generate_date: { type: Date, default: Date.now },
    format: { type: String, enum: ['PDF', 'CSV'] },
});

// PolicyAndRegulation Schema
const PolicyAndRegulationSchema = new mongoose.Schema({
    title: String,
    content: String,
    type: String,
    create_date: { type: Date, default: Date.now },
    update_date: Date,
});

// Models
const User = mongoose.model('User', UserSchema);
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema);
const Event = mongoose.model('Event', EventSchema);
const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
const ThirdParty = mongoose.model('ThirdParty', ThirdPartySchema);
const Message = mongoose.model('Message', MessageSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);
const UserAction = mongoose.model('UserAction', UserActionSchema);
const ActionLog = mongoose.model('ActionLog', ActionLogSchema);
const StatisticsAndReporting = mongoose.model('StatisticsAndReporting', StatisticsAndReportingSchema);
const PolicyAndRegulation = mongoose.model('PolicyAndRegulation', PolicyAndRegulationSchema);

module.exports = {
    User,
    UserProfile,
    UserSubscription,
    Event,
    SubscriptionPlan,
    ThirdParty,
    Message,
    Interaction,
    UserAction,
    ActionLog,
    StatisticsAndReporting,
    PolicyAndRegulation,
};