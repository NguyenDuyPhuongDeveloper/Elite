const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) =>
{
    const { sender, receiver, content, messageType, attachments } = req.body;

    try
    {
        const message = new Message({
            sender,
            receiver,
            content,
            message_type: messageType,
            attachments,
        });
        await message.save();

        res.status(201).json({ success: true, data: message });
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Failed to send message.', error });
    }
};

// Get messages in a conversation
exports.getMessages = async (req, res) =>
{
    const { conversationId } = req.params;

    try
    {
        const messages = await Message.find({
            $or: [{ sender: conversationId }, { receiver: conversationId }],
        }).sort({ sent_at: -1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Failed to get messages.', error });
    }
};

// Mark a message as read
exports.markAsRead = async (req, res) =>
{
    const { messageId } = req.params;

    try
    {
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { read_at: new Date(), status: 'read' },
            { new: true }
        );

        if (updatedMessage)
        {
            // Đồng bộ qua Socket.io
            io.to(updatedMessage.conversation).emit('messageRead', {
                messageId: updatedMessage._id,
                status: 'read',
                read_at: updatedMessage.read_at,
            });

            res.status(200).json({ success: true, data: updatedMessage });
        } else
        {
            res.status(404).json({ success: false, message: 'Message not found' });
        }
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Failed to mark message as read', error });
    }
};

// Delete a message
exports.deleteMessage = async (req, res) =>
{
    const { messageId } = req.params;
    const { conversationId } = req.body;

    try
    {
        // Xóa tin nhắn khỏi DB
        await Message.findByIdAndDelete(messageId);

        // Thông báo qua Socket.io
        io.to(conversationId).emit('messageDeleted', { messageId });

        res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Failed to delete message.', error });
    }
};
