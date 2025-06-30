const mongoose = require("mongoose");

const academicProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  requirements: { type: String },
  curriculum: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AcademicProgram", academicProgramSchema);
