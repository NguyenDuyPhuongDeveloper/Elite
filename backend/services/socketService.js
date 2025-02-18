let io;
const Message = require('../models/Message');

// Lấy CLIENT_URL từ .env
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:3000'];

const initSocketIO = (server) =>
{
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,  // Chuyển thành danh sách allowedOrigins
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) =>
    {
        console.log(`New client connected: ${ socket.id }`);

        socket.on('initiateVideoCall', ({ conversationId, caller }) =>
        {
            socket.to(conversationId).emit('incomingVideoCall', { conversationId, caller });
        });

        socket.on('endVideoCall', ({ conversationId }) =>
        {
            socket.to(conversationId).emit('callEnded');
        });

        socket.on('offer', ({ conversationId, offer }) =>
        {
            socket.to(conversationId).emit('offer', { offer });
        });

        socket.on('answer', ({ conversationId, answer }) =>
        {
            socket.to(conversationId).emit('answer', { answer });
        });

        socket.on('iceCandidate', ({ conversationId, candidate }) =>
        {
            socket.to(conversationId).emit('iceCandidate', { candidate });
        });

        // Lắng nghe sự kiện joinConversation
        socket.on("joinConversation", (conversationId) =>
        {
            socket.join(conversationId);
            console.log(`Client ${ socket.id } joined room: ${ conversationId }`);

            const rooms = Array.from(socket.rooms);
            console.log(`Client ${ socket.id } is now in rooms:`, rooms);
        });

        // Lắng nghe sự kiện sendMessage
        socket.on("sendMessage", ({ conversationId, message }) =>
        {
            console.log(`Emitting message to room ${ conversationId }:`, message);

            // Kiểm tra danh sách client trong room
            const clients = io.sockets.adapter.rooms.get(conversationId);
            console.log(`Clients in room ${ conversationId }:`, Array.from(clients || []));

            io.to(conversationId).emit("receiveMessage", message);
        });

        socket.on('markAsRead', async ({ messageId, conversationId }) =>
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
                await Message.findByIdAndDelete(messageId);
                io.to(conversationId).emit('messageDeleted', { messageId });
            } catch (error)
            {
                console.error('Error deleting message:', error);
            }
        });

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
