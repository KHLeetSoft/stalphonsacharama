const mongoose = require("mongoose");

const schoolManagementSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    photo: { 
      type: String, 
      default: "" 
    },
    category: {
      type: String,
      enum: ['community', 'announcement', 'event', 'news', 'achievement'],
      default: 'community'
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    tags: [{ 
      type: String 
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    publishedDate: { 
      type: Date, 
      default: Date.now 
    },
    expiryDate: { 
      type: Date 
    },
    viewCount: { 
      type: Number, 
      default: 0 
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
schoolManagementSchema.index({ isActive: 1, category: 1, publishedDate: -1 });

module.exports = mongoose.model("SchoolManagement", schoolManagementSchema); 