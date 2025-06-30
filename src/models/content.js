const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  page: { type: String, required: true }, // home, about, teachers, academics
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Content", contentSchema);
