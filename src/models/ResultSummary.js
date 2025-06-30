const mongoose = require("mongoose");

const resultSummarySchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    academicYear: { 
      type: String, 
      required: true 
    },
    class: {
      type: String,
      required: true,
      enum: ['nursery', 'lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'all']
    },
    examType: {
      type: String,
      required: true,
      enum: ['unit-test', 'mid-term', 'final', 'board', 'competitive', 'other']
    },
    examDate: {
      type: Date,
      required: true
    },
    totalStudents: {
      type: Number,
      required: true,
      min: 0
    },
    appearedStudents: {
      type: Number,
      required: true,
      min: 0
    },
    passedStudents: {
      type: Number,
      required: true,
      min: 0
    },
    distinctionStudents: {
      type: Number,
      default: 0,
      min: 0
    },
    firstDivisionStudents: {
      type: Number,
      default: 0,
      min: 0
    },
    secondDivisionStudents: {
      type: Number,
      default: 0,
      min: 0
    },
    thirdDivisionStudents: {
      type: Number,
      default: 0,
      min: 0
    },
    passPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100
    },
    highestScore: {
      type: Number,
      min: 0,
      max: 100
    },
    lowestScore: {
      type: Number,
      min: 0,
      max: 100
    },
    subjectWiseResults: [{
      subject: {
        type: String,
        required: true
      },
      averageScore: {
        type: Number,
        min: 0,
        max: 100
      },
      highestScore: {
        type: Number,
        min: 0,
        max: 100
      },
      passPercentage: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    topPerformers: [{
      rank: {
        type: Number,
        required: true
      },
      studentName: {
        type: String,
        required: true
      },
      rollNumber: {
        type: String,
        required: true
      },
      totalScore: {
        type: Number,
        required: true
      },
      percentage: {
        type: Number,
        required: true
      }
    }],
    description: { 
      type: String 
    },
    remarks: { 
      type: String 
    },
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    publishedDate: { 
      type: Date 
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

// Index for efficient queries
resultSummarySchema.index({ class: 1, academicYear: 1, examType: 1, isPublished: 1 });

// Virtual for formatted class name
resultSummarySchema.virtual('className').get(function() {
  const classNames = {
    'nursery': 'Nursery',
    'lkg': 'LKG',
    'ukg': 'UKG',
    '1': 'Class 1',
    '2': 'Class 2',
    '3': 'Class 3',
    '4': 'Class 4',
    '5': 'Class 5',
    '6': 'Class 6',
    '7': 'Class 7',
    '8': 'Class 8',
    '9': 'Class 9',
    '10': 'Class 10',
    '11': 'Class 11',
    '12': 'Class 12',
    'all': 'All Classes'
  };
  return classNames[this.class] || this.class;
});

// Virtual for exam type display name
resultSummarySchema.virtual('examTypeName').get(function() {
  const examTypes = {
    'unit-test': 'Unit Test',
    'mid-term': 'Mid Term',
    'final': 'Final Exam',
    'board': 'Board Exam',
    'competitive': 'Competitive Exam',
    'other': 'Other'
  };
  return examTypes[this.examType] || this.examType;
});

// Method to calculate pass percentage
resultSummarySchema.methods.calculatePassPercentage = function() {
  if (this.appearedStudents > 0) {
    this.passPercentage = Math.round((this.passedStudents / this.appearedStudents) * 100);
  }
  return this.passPercentage;
};

// Method to calculate average score
resultSummarySchema.methods.calculateAverageScore = function() {
  if (this.subjectWiseResults && this.subjectWiseResults.length > 0) {
    const totalScore = this.subjectWiseResults.reduce((sum, subject) => sum + (subject.averageScore || 0), 0);
    this.averageScore = Math.round(totalScore / this.subjectWiseResults.length);
  }
  return this.averageScore;
};

module.exports = mongoose.model("ResultSummary", resultSummarySchema); 