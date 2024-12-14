const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { emitMessage } = require('../services/socketService');

// Lấy danh sách các cuộc trò chuyện của người dùng
exports.getConversations = async (req, res) =>
{
    try
    {
        const userId = req.user.id; // ID người dùng từ auth middleware
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username avatar')
            .populate('last_message')
            .sort({ updated_at: -1 });

        res.status(200).json({ success: true, conversations });
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Error fetching conversations', error });
    }
};

// Tạo hoặc lấy cuộc trò chuyện giữa hai người dùng
exports.getOrCreateConversation = async (req, res) =>
{
    try
    {
        const { userId } = req.params; // ID người nhận
        const senderId = req.user.id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, userId] }
        }).populate('last_message');

        if (!conversation)
        {
            conversation = new Conversation({
                participants: [senderId, userId]
            });
            await conversation.save();
        }

        res.status(200).json({ success: true, conversation });
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Error creating conversation', error });
    }
};

// Lấy tất cả tin nhắn của một cuộc trò chuyện
exports.getMessages = async (req, res) =>
{
    try
    {
        const { conversationId } = req.params;
        const { limit = 20, offset = 0 } = req.query; // Lấy limit và offset từ query

        // Tìm tin nhắn theo conversationId, sắp xếp từ mới đến cũ
        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 }) // Tin nhắn mới nhất trước
            .skip(Number(offset)) // Bỏ qua số lượng offset
            .limit(Number(limit)) // Giới hạn số lượng tin nhắn
            .exec();

        res.status(200).json({
            success: true,
            messages,
        });
    } catch (error)
    {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
        });
    }
};

// Gửi tin nhắn mới
exports.sendMessage = async (req, res) =>
{
    try
    {
        const { conversationId, content, message_type, attachments } = req.body;
        const sender = req.user.id;

        // Kiểm tra xem conversation có tồn tại không
        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
        {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Tạo tin nhắn
        const newMessage = new Message({
            sender,
            receiver: conversation.participants.find(p => p.toString() !== sender),
            conversation: conversationId,
            content,
            message_type,
            attachments
        });
        await newMessage.save();

        // Cập nhật conversation
        conversation.last_message = newMessage._id;
        conversation.updated_at = Date.now();
        await conversation.save();
        emitMessage(conversationId, newMessage);

        res.status(201).json({ success: true, message: newMessage, conversation });
    } catch (error)
    {
        res.status(500).json({ success: false, message: 'Error sending message', error });
    }
};
