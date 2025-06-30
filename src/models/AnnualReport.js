const mongoose = require("mongoose");

const annualReportSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    academicYear: { 
      type: String, 
      required: true 
    },
    reportFile: { 
      type: String, 
      default: "" 
    },
    coverImage: { 
      type: String, 
      default: "" 
    },
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    publishedDate: { 
      type: Date 
    },
    downloadCount: { 
      type: Number, 
      default: 0 
    },
    tags: [{ 
      type: String 
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AnnualReport", annualReportSchema); 