const User = require('../models/User');

exports.getUserProfile = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id).select('-password'); // Không lấy trường password
        if (!user)
        {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.updateUserProfile = async (req, res) =>
{
    const { fullname, phone, account_type } = req.body;

    const profileFields = {};
    if (fullname) profileFields.fullname = fullname;
    if (phone) profileFields.phone = phone;
    if (account_type) profileFields.account_type = account_type;

    try
    {
        let user = await User.findById(req.user.id);
        if (!user)
        {
            return res.status(404).json({ msg: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        );

        res.json(user);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.searchUsers = async (req, res) =>
{
    const { fullname, gender, account_type } = req.query;

    try
    {
        const query = {};
        if (fullname) query.fullname = { $regex: fullname, $options: 'i' };
        if (gender) query.gender = gender;
        if (account_type) query.account_type = account_type;

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.getMatches = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id);
        if (!user)
        {
            return res.status(404).json({ msg: 'User not found' });
        }

        const matches = await User.find({
            _id: { $ne: req.user.id }, // Không lấy chính mình
            hobbies: { $in: user.profile.hobbies },
        }).select('-password');

        res.json(matches);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};



