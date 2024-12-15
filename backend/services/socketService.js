let io;
const Message = require('../models/Message');

const initSocketIO = (server) =>
{
    const socketIO = require('socket.io');
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    io.on('connection', (socket) =>
    {
        console.log(`New client connected: ${ socket.id }`);

        // Lắng nghe sự kiện joinConversation
        socket.on("joinConversation", (conversationId) =>
        {
            console.log(`Client ${ socket.id } joined room: ${ conversationId }`);
            socket.join(conversationId);

            // Log danh sách các phòng
            const rooms = Array.from(socket.rooms);
            console.log(`Client ${ socket.id } is now in rooms:`, rooms);
        });


        // Lắng nghe sự kiện sendMessage
        socket.on("sendMessage", ({ conversationId, message }) =>
        {
            console.log(`Emitting message to room ${ conversationId }:`, message);

            // Log tất cả socket trong room
            const clients = io.sockets.adapter.rooms.get(conversationId);
            console.log(`Clients in room ${ conversationId }:`, Array.from(clients || []));
            io.to(conversationId).emit("receiveMessage", message);
        });
        socket.on('markAsRead', async ({ messageId, conversationId, userId }) =>
        {
            try
            {
                const updatedMessage = await Message.findByIdAndUpdate(
                    messageId,
                    { read_at: new Date(), status: 'read' },
                    { new: true }
                );
                io.to(conversationId).emit('messageRead', {
                    messageId: updatedMessage._id,
                    status: updatedMessage.status,
                    read_at: updatedMessage.read_at,
                });
            } catch (error)
            {
                console.error('Error marking message as read:', error);
            }
        });

        socket.on('deleteMessage', async ({ messageId, conversationId }) =>
        {
            try
            {
                // Xóa tin nhắn trong DB
                await Message.findByIdAndDelete(messageId);

                // Phát sự kiện cho tất cả các client trong phòng hội thoại
                io.to(conversationId).emit('messageDeleted', { messageId });
            } catch (error)
            {
                console.error('Error deleting message:', error);
            }
        });


        // Ngắt kết nối
        socket.on('disconnect', () =>
        {
            console.log(`Client disconnected: ${ socket.id }`);
        });
    });
};

// Hàm phát tin nhắn
const emitMessage = (conversationId, message) =>
{
    if (!io)
    {
        console.error('Socket.IO is not initialized');
        return;
    }

    if (!conversationId || !message)
    {
        console.error('Invalid conversationId or message data');
        return;
    }

    const messageData = {
        ...message.toObject(),
        sender: message.sender.toString(),
        receiver: message.receiver.toString(),
        conversation: message.conversation.toString(),
        _id: message._id.toString(),
    };

    console.log(`Emitting message to room ${ conversationId }:`, messageData);
    io.to(conversationId).emit('receiveMessage', messageData);
};
const getIO = () =>
{
    if (!io)
    {
        throw new Error('Socket.IO is not initialized');
    }
    return io;
};



module.exports = { initSocketIO, emitMessage, getIO };
