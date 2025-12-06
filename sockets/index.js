export const initializeSocket = (io) => {
    // Store user socket connections
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: ${socket.id}`);

        // User joins with their ID
        socket.on('join', (userId) => {
            userSockets.set(userId, socket.id);
            socket.join(userId);
            console.log(`👤 User ${userId} joined`);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            // Remove user from map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`👋 User ${userId} disconnected`);
                    break;
                }
            }
        });

        // Typing indicator
        socket.on('typing', ({ recipientId, isTyping }) => {
            const recipientSocketId = userSockets.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('userTyping', { isTyping });
            }
        });
    });

    return io;
};
