const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    schedule: { type: String, required: true },
    location: { type: String, required: true },
    participants: { type: String, required: true },
    instructor: { type: String },
    maxParticipants: { type: Number },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    activities: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        schedule: {
          type: String,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        participants: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
