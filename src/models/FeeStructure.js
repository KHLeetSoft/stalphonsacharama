const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    enum: ['nursery', 'lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  academicYear: {
    type: String,
    required: true
  },
  fees: [{
    category: {
      type: String,
      required: true,
      enum: ['tuition', 'transport', 'library', 'laboratory', 'sports', 'computer', 'examination', 'development', 'other']
    },
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    frequency: {
      type: String,
      required: true,
      enum: ['monthly', 'quarterly', 'half-yearly', 'annually', 'one-time']
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    description: String
  }],
  totalAnnualFee: {
    type: Number,
    required: true,
    min: 0
  },
  totalMonthlyFee: {
    type: Number,
    required: true,
    min: 0
  },
  paymentSchedule: {
    type: String,
    enum: ['monthly', 'quarterly', 'half-yearly', 'annually'],
    default: 'monthly'
  },
  dueDate: {
    type: Number,
    min: 1,
    max: 31,
    default: 5
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
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

// Index for efficient queries
feeStructureSchema.index({ class: 1, academicYear: 1, isActive: 1 });

// Virtual for formatted class name
feeStructureSchema.virtual('className').get(function() {
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

// Method to calculate totals
feeStructureSchema.methods.calculateTotals = function() {
  let annualTotal = 0;
  let monthlyTotal = 0;

  this.fees.forEach(fee => {
    switch (fee.frequency) {
      case 'monthly':
        annualTotal += fee.amount * 12;
        monthlyTotal += fee.amount;
        break;
      case 'quarterly':
        annualTotal += fee.amount * 4;
        monthlyTotal += fee.amount / 3;
        break;
      case 'half-yearly':
        annualTotal += fee.amount * 2;
        monthlyTotal += fee.amount / 6;
        break;
      case 'annually':
        annualTotal += fee.amount;
        monthlyTotal += fee.amount / 12;
        break;
      case 'one-time':
        annualTotal += fee.amount;
        monthlyTotal += fee.amount / 12;
        break;
    }
  });

  this.totalAnnualFee = Math.round(annualTotal);
  this.totalMonthlyFee = Math.round(monthlyTotal);
};

module.exports = mongoose.model('FeeStructure', feeStructureSchema); 