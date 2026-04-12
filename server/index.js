// server/index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const multer = require("multer");
const { google } = require("googleapis");
const stream = require("stream");

// Import Chat Handler
const ChatHandler = require("./chatHandler");
const Document = require("./models/Document");

const app = express();

// ==========================
// CONFIG
// ==========================
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/collaborative-editor";

// ==========================
// MIDDLEWARE
// ==========================
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ==========================
// SERVER + SOCKET
// ==========================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize Chat Handler
new ChatHandler(io);

// ==========================
// MONGODB CONNECTION
// ==========================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ==========================
// HELPERS
// ==========================

// Generate custom string document ID
function generateDocumentId() {
  return (
    "doc_" +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

// Helper: find or create document
async function findOrCreateDocument(id, owner = "anonymous") {
  try {
    if (!id) return null;

    let doc = await Document.findById(id);
    if (doc) return doc;

    doc = await Document.create({
      _id: id,
      owner,
      title: "Untitled Document",
      data: { ops: [] },
      pages: [{ id: 1, content: { ops: [] } }],
      pageConfig: { name: "A4", width: 210, height: 297 },
    });

    console.log(`📄 New document created: ${doc._id} for owner: ${owner}`);
    return doc;
  } catch (error) {
    console.error("❌ Error in findOrCreateDocument:", error);
    return null;
  }
}

// Helper function to clean data before emitting
function cleanDataForEmission(data) {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => cleanDataForEmission(item));
  }

  if (typeof data === "object" && data !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "function" && value !== undefined) {
        if (typeof value === "object" && value !== null) {
          if (value instanceof Date) {
            cleaned[key] = value.toISOString();
          } else if (Array.isArray(value)) {
            cleaned[key] = cleanDataForEmission(value);
          } else if (Object.prototype.toString.call(value) === "[object Object]") {
            cleaned[key] = cleanDataForEmission(value);
          } else {
            cleaned[key] = value;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  return data;
}

// ==========================
// SOCKET.IO HANDLERS
// ==========================
io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  let currentDocumentId = null;

  // --------------------------
  // GET DOCUMENT
  // --------------------------
  socket.on("get-document", async (payload) => {
    try {
      let documentId, userId, userName, userEmail;

      if (typeof payload === "string") {
        documentId = payload;
      } else if (typeof payload === "object" && payload !== null) {
        documentId = payload.documentId || payload.id || payload.docId;
        userId = payload.userId || payload.owner || "anonymous";
        userName = payload.userName || "Anonymous";
        userEmail = payload.userEmail || "anonymous@example.com";
      }

      if (!documentId) {
        socket.emit("load-document", { ops: [] });
        return;
      }

      currentDocumentId = documentId;

      console.log(
        `📖 Loading document: ${documentId} for user: ${userName} (${userEmail})`
      );

      const doc = await findOrCreateDocument(documentId, userId || "anonymous");

      if (!doc) {
        socket.emit("load-document", { ops: [] });
        return;
      }

      socket.join(documentId);

      socket.userData = {
        id: userId || socket.id,
        name: userName,
        email: userEmail,
      };

      socket.to(documentId).emit("user-joined", socket.userData);

      const cleanDocumentData = cleanDataForEmission({
        _id: doc._id,
        title: doc.title,
        content: doc.data,
        pages: doc.pages || [{ id: 1, content: doc.data || { ops: [] } }],
        pageConfig: doc.pageConfig || { name: "A4" },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });

      socket.emit("load-document", cleanDocumentData);

      // Send collaborators
      const room = io.sockets.adapter.rooms.get(documentId);
      if (room) {
        const collaborators = [];
        for (const socketId of room) {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.userData) {
            collaborators.push(clientSocket.userData);
          }
        }
        socket.emit("collaborators-update", collaborators);
      }
    } catch (error) {
      console.error("❌ Error in get-document handler:", error);
      socket.emit("load-document", { ops: [] });
    }
  });

  // --------------------------
  // SEND CHANGES
  // --------------------------
  socket.on("send-changes", (data) => {
    try {
      if (!currentDocumentId) return;

      const cleanData = cleanDataForEmission(data);
      console.log(
        `🔄 Changes received for document: ${currentDocumentId}`,
        data?.pageId ? `on page ${data.pageId}` : ""
      );

      socket.broadcast.to(currentDocumentId).emit("receive-changes", cleanData);
    } catch (err) {
      console.error("❌ Error broadcasting changes:", err);
    }
  });

  // --------------------------
  // SAVE DOCUMENT
  // --------------------------
  socket.on("save-document", async (data) => {
    try {
      if (!currentDocumentId) return;

      console.log(`💾 Saving document: ${currentDocumentId}`);

      const updateData = {
        updatedAt: new Date(),
      };

      const cleanData = cleanDataForEmission(data);

      if (Array.isArray(cleanData.content)) {
        updateData.pages = cleanData.content;

        if (cleanData.content.length > 0 && cleanData.content[0].content) {
          updateData.data = cleanData.content[0].content;
        }
      } else {
        updateData.data = cleanData.content || { ops: [] };
        updateData.pages = [{ id: 1, content: cleanData.content || { ops: [] } }];
      }

      if (cleanData.name) {
        updateData.title = cleanData.name;
      }

      if (cleanData.pageConfig) {
        updateData.pageConfig = cleanData.pageConfig;
      }

      const updatedDoc = await Document.findByIdAndUpdate(
        currentDocumentId,
        updateData,
        { new: true, upsert: true }
      );

      const broadcastData = cleanDataForEmission({
        savedAt: new Date(),
        title: updatedDoc.title,
        pages: updatedDoc.pages,
        pageConfig: updatedDoc.pageConfig,
      });

      io.to(currentDocumentId).emit("document-saved", broadcastData);

      console.log(
        `✅ Document saved successfully: ${currentDocumentId} with ${updatedDoc.pages.length} pages`
      );
    } catch (error) {
      console.error("❌ Error saving document:", error);
    }
  });

  // --------------------------
  // UPDATE DOCUMENT NAME
  // --------------------------
  socket.on("update-document-name", async (data) => {
    try {
      const { documentId: docId, name } = data;
      if (!docId || !name) return;

      console.log(`📝 Updating document name: ${docId} to "${name}"`);

      await Document.findByIdAndUpdate(
        docId,
        { title: name, updatedAt: new Date() },
        { new: true }
      );

      io.to(docId).emit("document-name-updated", name);
      console.log(`✅ Document name updated: ${docId} -> "${name}"`);
    } catch (error) {
      console.error("❌ Error updating document name:", error);
    }
  });

  // --------------------------
  // PAGE STRUCTURE CHANGE
  // --------------------------
  socket.on("page-structure-changed", async (data) => {
    try {
      const cleanData = cleanDataForEmission(data);
      const { documentId: docId, pages, pageConfig } = cleanData;

      if (!docId || !pages) return;

      console.log(
        `📄 Page structure changed for document: ${docId}, pages: ${pages.length}`
      );

      const updatedDoc = await Document.findByIdAndUpdate(
        docId,
        {
          pages: pages,
          pageConfig: pageConfig,
          updatedAt: new Date(),
        },
        { new: true }
      );

      const broadcastData = cleanDataForEmission({
        pages: updatedDoc.pages,
        pageConfig: updatedDoc.pageConfig,
      });

      socket.broadcast.to(docId).emit("page-structure-updated", broadcastData);

      console.log(
        `✅ Page structure updated: ${docId} now has ${updatedDoc.pages.length} pages`
      );
    } catch (error) {
      console.error("❌ Error updating page structure:", error);
    }
  });

  // --------------------------
  // REQUEST FULL DOCUMENT
  // --------------------------
  socket.on("request-document", async () => {
    try {
      if (!currentDocumentId) return;

      const fresh = await Document.findById(currentDocumentId);
      if (!fresh) return;

      const cleanDocumentData = cleanDataForEmission({
        _id: fresh._id,
        title: fresh.title,
        content: fresh.data,
        pages: fresh.pages || [{ id: 1, content: fresh.data || { ops: [] } }],
        pageConfig: fresh.pageConfig || { name: "A4" },
      });

      socket.emit("load-document", cleanDocumentData);
    } catch (err) {
      console.error("❌ Error in request-document:", err);
    }
  });

  // --------------------------
  // LEAVE DOCUMENT
  // --------------------------
  socket.on("leave-document", (documentId) => {
    if (documentId) {
      socket.leave(documentId);
      if (socket.userData) {
        socket.to(documentId).emit("user-left", socket.userData.id);
      }
    }
  });

  // --------------------------
  // DISCONNECT
  // --------------------------
  socket.on("disconnect", (reason) => {
    console.log(`🔴 Socket disconnected: ${socket.id} - Reason: ${reason}`);

    if (currentDocumentId && socket.userData) {
      socket.to(currentDocumentId).emit("user-left", socket.userData.id);
    }
  });
});

// ==========================
// REST API ROUTES
// ==========================

// Simple login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt: ${email}`);

  if (email && password) {
    return res.json({
      ok: true,
      user: {
        uid: "user_" + Date.now(),
        displayName: email.split("@")[0],
        email,
      },
    });
  }

  return res.json({ ok: false, error: "Invalid credentials" });
});

// Fetch all documents for a user
app.get("/api/user/:userId/documents", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📋 Fetching documents for user: ${userId}`);

    const docs = await Document.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .lean();

    const transformedDocs = docs.map((doc) =>
      cleanDataForEmission({
        _id: doc._id,
        title: doc.title,
        content: doc.data,
        pages: doc.pages,
        pageConfig: doc.pageConfig,
        owner: doc.owner,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })
    );

    console.log(`✅ Found ${transformedDocs.length} documents for user: ${userId}`);
    res.json({ ok: true, docs: transformedDocs });
  } catch (err) {
    console.error("❌ Error fetching user documents:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch documents" });
  }
});

// Create a new document
app.post("/api/documents", async (req, res) => {
  try {
    const { owner, title } = req.body;

    console.log("📄 Incoming create document request body:", req.body);

    if (!owner) {
      return res.status(400).json({
        ok: false,
        error: "Owner is required to create document",
      });
    }

    const docId = generateDocumentId();

    const doc = new Document({
      _id: docId,
      owner: owner || "anonymous",
      title: title || "Untitled Document",
      data: { ops: [] },
      pages: [{ id: 1, content: { ops: [] } }],
      pageConfig: { name: "A4", width: 210, height: 297 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await doc.save();

    console.log(`✅ New document created successfully: ${doc._id}`);

    return res.status(201).json({
      ok: true,
      doc: cleanDataForEmission(doc),
    });
  } catch (err) {
    console.error("❌ Error creating document:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Failed to create document",
    });
  }
});

// Update document endpoint
app.put("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, pages, pageConfig } = req.body;

    console.log(`📝 Updating document: ${id}`);

    const updateData = { updatedAt: new Date() };

    if (title) updateData.title = title;
    if (content) updateData.data = content;
    if (pages) updateData.pages = pages;
    if (pageConfig) updateData.pageConfig = pageConfig;

    const doc = await Document.findByIdAndUpdate(id, updateData, { new: true });

    if (!doc) {
      return res.status(404).json({ ok: false, error: "Document not found" });
    }

    console.log(`✅ Document updated: ${id}`);
    res.json({ ok: true, doc: cleanDataForEmission(doc) });
  } catch (err) {
    console.error("❌ Error updating document:", err);
    res.status(500).json({ ok: false, error: "Failed to update document" });
  }
});

// ==========================
// DELETE DOCUMENT  ✅ ADDED
// ==========================
app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete request received for document: ${id}`);

    const deletedDoc = await Document.findByIdAndDelete(id);

    if (!deletedDoc) {
      return res.status(404).json({
        ok: false,
        error: "Document not found",
      });
    }

    // Notify connected users if any are inside this document room
    io.to(id).emit("document-deleted", {
      documentId: id,
      message: "This document has been deleted.",
    });

    console.log(`✅ Document deleted successfully: ${id}`);

    res.json({
      ok: true,
      message: "Document deleted successfully",
      deletedId: id,
      doc: cleanDataForEmission(deletedDoc),
    });
  } catch (err) {
    console.error("❌ Error deleting document:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to delete document",
    });
  }
});

// Get single document
app.get("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📖 Fetching document: ${id}`);

    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ ok: false, error: "Document not found" });
    }

    const documentData = cleanDataForEmission({
      _id: doc._id,
      title: doc.title,
      content: doc.data,
      pages: doc.pages,
      pageConfig: doc.pageConfig,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });

    console.log(`✅ Document fetched: ${id}`);
    res.json({ ok: true, doc: documentData });
  } catch (err) {
    console.error("❌ Error fetching document:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch document" });
  }
});

// ==========================
// GOOGLE DRIVE UPLOAD
// ==========================
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload-to-drive", upload.single("file"), async (req, res) => {
  try {
    console.log("☁️ Google Drive upload requested");

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file uploaded" });
    }

    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REFRESH_TOKEN
    ) {
      return res.status(500).json({ ok: false, error: "Google Drive not configured" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const fileMetadata = {
      name: req.file.originalname,
      mimeType: req.file.mimetype,
    };

    const media = {
      mimeType: req.file.mimetype,
      body: bufferStream,
    };

    const createRes = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    await drive.permissions.create({
      fileId: createRes.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    console.log(`✅ File uploaded to Google Drive: ${createRes.data.webViewLink}`);
    res.json({ ok: true, link: createRes.data.webViewLink });
  } catch (err) {
    console.error("❌ Drive upload error:", err);
    res.status(500).json({ ok: false, error: "Drive upload failed" });
  }
});

// ==========================
// UTILITY ROUTES
// ==========================
app.get("/api/health", (req, res) => {
  console.log("🏥 Health check requested");
  res.json({
    ok: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/user/:id", (req, res) => {
  console.log(`👤 User info requested: ${req.params.id}`);
  res.json({ ok: true, id: req.params.id });
});

app.get("/api/status", (req, res) => {
  const status = {
    ok: true,
    server: "running",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: io.engine.clientsCount,
  };
  console.log("📊 Server status checked");
  res.json(status);
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🗄️ MongoDB URI: ${MONGO_URI}`);
  console.log("💬 Chat system initialized");
  console.log("✅ Server is ready to accept connections");
});

// ==========================
// GRACEFUL SHUTDOWN
// ==========================
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server shut down successfully");
    process.exit(0);
  });
});