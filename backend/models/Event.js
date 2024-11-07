const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event_name: { type: String, required: true },
    purpose: { type: String },
    type: { type: String },
    visibility: { type: String },
    start_time: { type: Date, required: true },
    location: { type: String },
    registration_link: { type: String },
    description: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
EventSchema.index({ start_time: 1 });
EventSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
