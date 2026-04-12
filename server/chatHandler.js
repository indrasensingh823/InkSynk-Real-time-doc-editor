// server/chatHandler.js
const { Server } = require('socket.io');

class ChatHandler {
  constructor(io) {
    this.chatNamespace = io.of('/chat');
    this.setupChatHandlers();
  }

  setupChatHandlers() {
    this.chatNamespace.on('connection', (socket) => {
      console.log(`💬 Chat socket connected: ${socket.id}`);

      // Join document chat room
      socket.on('join-document-chat', (data) => {
        const { documentId, userId, userName } = data;
        socket.join(`doc-${documentId}`);
        
        console.log(`💬 User ${userName} joined document chat: ${documentId}`);
        
        // Notify others in the room
        socket.to(`doc-${documentId}`).emit('user-joined-chat', {
          userId,
          userName,
          message: `${userName} joined the chat`,
          timestamp: new Date()
        });
      });

      // Send message
      socket.on('send-chat-message', (data) => {
        const { documentId, userId, userName, message, timestamp } = data;
        
        console.log(`💬 Chat message in ${documentId}: ${userName}: ${message}`);
        
        // Broadcast message to all in the document chat room (including sender)
        this.chatNamespace.to(`doc-${documentId}`).emit('receive-chat-message', {
          userId,
          userName,
          message,
          timestamp: timestamp || new Date(),
          messageId: Date.now() + Math.random()
        });
      });

      // Typing indicator
      socket.on('typing-start', (data) => {
        const { documentId, userName } = data;
        socket.to(`doc-${documentId}`).emit('user-typing', {
          userName,
          isTyping: true
        });
      });

      socket.on('typing-stop', (data) => {
        const { documentId, userName } = data;
        socket.to(`doc-${documentId}`).emit('user-typing', {
          userName,
          isTyping: false
        });
      });

      // Leave document chat
      socket.on('leave-document-chat', (data) => {
        const { documentId, userId, userName } = data;
        socket.leave(`doc-${documentId}`);
        
        socket.to(`doc-${documentId}`).emit('user-left-chat', {
          userId,
          userName,
          message: `${userName} left the chat`,
          timestamp: new Date()
        });
      });

      socket.on('disconnect', () => {
        console.log(`💬 Chat socket disconnected: ${socket.id}`);
      });
    });
  }
}

module.exports = ChatHandler;