const Message = require('../models/Message');

exports.sendMessage = async (req, res) =>
{
    const { receiverId, content, media_url, message_type } = req.body;

    try
    {
        const newMessage = new Message({
            sender_id: req.user.id,
            receiver_id: receiverId,
            content,
            media_url,
            message_type,
        });

        await newMessage.save();
        res.json(newMessage);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


exports.getMessages = async (req, res) =>
{
    try
    {
        const messages = await Message.find({
            $or: [
                { sender_id: req.user.id, receiver_id: req.params.userId },
                { sender_id: req.params.userId, receiver_id: req.user.id },
            ],
        }).sort({ sent_at: 1 });

        res.json(messages);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

