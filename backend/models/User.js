const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    account_type: { type: String, enum: ['Basic', 'Premium', 'VIP'], default: 'Basic' },
    created_at: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next)
{
    if (!this.isModified('password'))
    {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
