const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  personName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  highlightedWords: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
