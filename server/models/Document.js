// server/models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
      default: "anonymous",
    },
    title: {
      type: String,
      default: "Untitled Document",
      trim: true,
    },
    data: {
      type: Object,
      default: { ops: [] },
    },
    pageConfig: {
      type: Object,
      default: { name: "A4", width: 210, height: 297 },
    },
    pages: {
      type: Array,
      default: [{ id: 1, content: { ops: [] } }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Document || mongoose.model("Document", DocumentSchema);