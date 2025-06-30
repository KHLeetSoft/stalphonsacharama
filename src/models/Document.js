const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  shareLink: {
    type: String,
    unique: true,
    sparse: true,
  },
  shareLinkExpiry: {
    type: Date,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Document", documentSchema);
