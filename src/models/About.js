const mongoose = require("mongoose");

const coreValueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "text-primary",
  },
  order: {
    type: Number,
    default: 0,
  },
});

// =========================
// ABOUT MODEL
// Stores all About, Mission, Vision, and Core Values data
// Used for both public and admin vision-mission pages
// =========================

const aboutSchema = new mongoose.Schema({
  // Mission Section (public & admin)
  missionTitle: { type: String, required: true },
  mission: { type: String, required: true },
  // Vision Section (public & admin)
  visionTitle: { type: String, required: true },
  vision: { type: String, required: true },
  // History Section (public & admin)
  historyTitle: { type: String, required: false },
  history: { type: String, required: false },
  // Core Values Section
  coreValuesTitle: { type: String, default: "Our Core Values" },
  coreValues: {
    type: [coreValueSchema],
    default: [
      {
        title: "Excellence",
        description: "Striving for the highest standards in everything we do",
        icon: "fas fa-star",
        color: "text-warning",
        order: 1,
      },
      {
        title: "Integrity",
        description: "Maintaining honesty and ethical behavior in all actions",
        icon: "fas fa-heart",
        color: "text-danger",
        order: 2,
      },
      {
        title: "Respect",
        description: "Valuing diversity and treating everyone with dignity",
        icon: "fas fa-users",
        color: "text-info",
        order: 3,
      },
      {
        title: "Innovation",
        description: "Embracing creativity and new approaches to learning",
        icon: "fas fa-lightbulb",
        color: "text-warning",
        order: 4,
      },
      {
        title: "Collaboration",
        description: "Working together to achieve common goals",
        icon: "fas fa-hands-helping",
        color: "text-success",
        order: 5,
      },
      {
        title: "Growth",
        description: "Continuous learning and personal development",
        icon: "fas fa-graduation-cap",
        color: "text-primary",
        order: 6,
      },
    ],
  },
  // About Page Image
  image: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("About", aboutSchema);
