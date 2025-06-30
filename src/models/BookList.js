const mongoose = require('mongoose');

const bookListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    enum: ['nursery', 'lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    default: '1'
  },
  subject: {
    type: String,
    required: true,
    enum: ['english', 'hindi', 'mathematics', 'science', 'social-studies', 'computer', 'art', 'music', 'physical-education', 'general-knowledge', 'other'],
    default: 'english'
  },
  bookType: {
    type: String,
    required: true,
    enum: ['textbook', 'workbook', 'reference', 'storybook', 'activity-book', 'other'],
    default: 'textbook'
  },
  publisher: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  edition: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  coverImage: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
bookListSchema.index({ title: 'text', author: 'text', publisher: 'text', tags: 'text' });
bookListSchema.index({ class: 1, subject: 1, academicYear: 1 });

// Virtual for formatted class name
bookListSchema.virtual('className').get(function() {
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
    '12': 'Class 12'
  };
  return classNames[this.class] || this.class;
});

// Virtual for formatted subject name
bookListSchema.virtual('subjectName').get(function() {
  const subjectNames = {
    'english': 'English',
    'hindi': 'Hindi',
    'mathematics': 'Mathematics',
    'science': 'Science',
    'social-studies': 'Social Studies',
    'computer': 'Computer',
    'art': 'Art',
    'music': 'Music',
    'physical-education': 'Physical Education',
    'general-knowledge': 'General Knowledge',
    'other': 'Other'
  };
  return subjectNames[this.subject] || this.subject;
});

// Virtual for formatted book type
bookListSchema.virtual('bookTypeName').get(function() {
  const bookTypeNames = {
    'textbook': 'Textbook',
    'workbook': 'Workbook',
    'reference': 'Reference Book',
    'storybook': 'Story Book',
    'activity-book': 'Activity Book',
    'other': 'Other'
  };
  return bookTypeNames[this.bookType] || this.bookType;
});

module.exports = mongoose.model('BookList', bookListSchema); 