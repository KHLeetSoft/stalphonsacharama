const mongoose = require("mongoose");

const academicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  programs: [
    {
      title: {
        type: String,
        required: false,
        default: "",
      },
      description: {
        type: String,
        required: false,
        default: "",
      },
      duration: {
        type: String,
        required: false,
        default: "",
      },
      requirements: {
        type: String,
        required: false,
        default: "",
      },
      curriculum: {
        type: String,
        required: false,
        default: "",
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Academic", academicSchema);
