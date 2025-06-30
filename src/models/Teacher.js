const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    achievements: {
      type: [String],
      default: [],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Teacher", teacherSchema);
