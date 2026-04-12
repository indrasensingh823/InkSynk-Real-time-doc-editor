// server/chatServer.js
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// Chat schema
const ChatSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", ChatSchema);

function startChatServer(httpServer, FRONTEND_URL) {
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    console.log(`💬 Chat connected: ${socket.id}`);

    // Load chat history
    const history = await Chat.find().sort({ timestamp: 1 }).limit(50);
    socket.emit("chat-history", history);

    // When a user joins with username
    socket.on("join-chat", (username) => {
      socket.username = username || "Anonymous";
      console.log(`👤 ${socket.username} joined the chat`);
      socket.broadcast.emit("user-joined", socket.username);
    });

    // When user sends a message
    socket.on("chat-message", async (data) => {
      const chatMessage = {
        username: socket.username || "Anonymous",
        message: data.message,
        timestamp: new Date(),
      };

      // Save message to DB
      const saved = await Chat.create(chatMessage);

      // Send message to everyone
      io.emit("chat-message", saved);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.username)
        io.emit("user-left", socket.username);
      console.log(`❌ Chat disconnected: ${socket.username || socket.id}`);
    });
  });

  console.log("💬 Chat server initialized successfully!");
}

module.exports = startChatServer;
