const FeeStructure = require('../models/FeeStructure');

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    'tuition': 'primary',
    'transport': 'success',
    'library': 'info',
    'laboratory': 'warning',
    'sports': 'danger',
    'computer': 'dark',
    'examination': 'secondary',
    'development': 'primary',
    'other': 'light'
  };
  return colors[category] || 'secondary';
};

// Helper function to get frequency color
const getFrequencyColor = (frequency) => {
  const colors = {
    'monthly': 'primary',
    'quarterly': 'success',
    'half-yearly': 'warning',
    'annually': 'info',
    'one-time': 'dark'
  };
  return colors[frequency] || 'secondary';
};

// Helper function to get ordinal suffix
function getOrdinalSuffix(n) {
  if (!n) return '';
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Get all fee structures (admin)
exports.getAllFeeStructures = async (req, res) => {
  try {
    const { class: classFilter, academicYear, status, search } = req.query;
    let query = {};
    
    // Filter by class
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }
    
    // Filter by academic year
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { academicYear: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'fees.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const feeStructures = await FeeStructure.find(query)
      .populate('createdBy', 'name')
      .sort({ class: 1, academicYear: -1 });
    
    res.render('admin/fee-structures/index', {
      feeStructures,
      admin: req.admin,
      title: 'Fee Structures',
      filters: { class: classFilter, academicYear, status, search },
      getCategoryColor,
      getFrequencyColor
    });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).render('admin/fee-structures/index', {
      feeStructures: [],
      admin: req.admin,
      title: 'Fee Structures',
      error: 'Failed to load fee structures.',
      filters: {},
      getCategoryColor,
      getFrequencyColor
    });
  }
};

// Show create form
exports.showCreateForm = (req, res) => {
  res.render('admin/fee-structures/create', {
    admin: req.admin,
    title: 'Add Fee Structure'
  });
};

// Create new fee structure
exports.createFeeStructure = async (req, res) => {
  try {
    const { 
      class: classValue, 
      academicYear, 
      paymentSchedule, 
      dueDate, 
      lateFee, 
      discount, 
      notes,
      fees 
    } = req.body;
    
    // Parse fees array
    const feesArray = [];
    if (Array.isArray(fees)) {
      fees.forEach(fee => {
        if (fee.category && fee.name && fee.amount && fee.frequency) {
          feesArray.push({
            category: fee.category,
            name: fee.name,
            amount: parseFloat(fee.amount) || 0,
            frequency: fee.frequency,
            isRequired: fee.isRequired === 'true',
            description: fee.description || ''
          });
        }
      });
    }
    
    const feeStructure = new FeeStructure({
      class: classValue,
      academicYear,
      fees: feesArray,
      paymentSchedule,
      dueDate: parseInt(dueDate) || 5,
      lateFee: parseFloat(lateFee) || 0,
      discount: parseFloat(discount) || 0,
      notes,
      createdBy: req.admin._id
    });
    
    // Calculate totals
    feeStructure.calculateTotals();
    
    await feeStructure.save();
    res.redirect('/admin/fee-structures');
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).render('admin/fee-structures/create', {
      admin: req.admin,
      title: 'Add Fee Structure',
      error: 'Failed to create fee structure.',
      formData: req.body
    });
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);
    if (!feeStructure) {
      return res.redirect('/admin/fee-structures');
    }
    
    res.render('admin/fee-structures/edit', {
      feeStructure,
      admin: req.admin,
      title: 'Edit Fee Structure'
    });
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.redirect('/admin/fee-structures');
  }
};

// Update fee structure
exports.updateFeeStructure = async (req, res) => {
  try {
    const { 
      class: classValue, 
      academicYear, 
      paymentSchedule, 
      dueDate, 
      lateFee, 
      discount, 
      notes,
      fees 
    } = req.body;
    
    const feeStructure = await FeeStructure.findById(req.params.id);
    if (!feeStructure) {
      return res.redirect('/admin/fee-structures');
    }
    
    // Parse fees array
    const feesArray = [];
    if (Array.isArray(fees)) {
      fees.forEach(fee => {
        if (fee.category && fee.name && fee.amount && fee.frequency) {
          feesArray.push({
            category: fee.category,
            name: fee.name,
            amount: parseFloat(fee.amount) || 0,
            frequency: fee.frequency,
            isRequired: fee.isRequired === 'true',
            description: fee.description || ''
          });
        }
      });
    }
    
    feeStructure.class = classValue;
    feeStructure.academicYear = academicYear;
    feeStructure.fees = feesArray;
    feeStructure.paymentSchedule = paymentSchedule;
    feeStructure.dueDate = parseInt(dueDate) || 5;
    feeStructure.lateFee = parseFloat(lateFee) || 0;
    feeStructure.discount = parseFloat(discount) || 0;
    feeStructure.notes = notes;
    feeStructure.lastUpdated = new Date();
    
    // Calculate totals
    feeStructure.calculateTotals();
    
    await feeStructure.save();
    res.redirect('/admin/fee-structures');
  } catch (error) {
    console.error('Error updating fee structure:', error);
    res.redirect('/admin/fee-structures');
  }
};

// Delete fee structure
exports.deleteFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);
    if (!feeStructure) {
      return res.redirect('/admin/fee-structures');
    }
    
    await FeeStructure.findByIdAndDelete(req.params.id);
    res.redirect('/admin/fee-structures');
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    res.redirect('/admin/fee-structures');
  }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findById(req.params.id);
    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    
    feeStructure.isActive = !feeStructure.isActive;
    await feeStructure.save();
    
    res.json({ 
      success: true, 
      isActive: feeStructure.isActive,
      message: feeStructure.isActive ? 'Fee structure activated successfully' : 'Fee structure deactivated successfully'
    });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

// Get public fee structures
exports.getPublicFeeStructures = async (req, res) => {
  try {
    const { class: classFilter, academicYear, search } = req.query;
    let query = { isActive: true };
    
    // Filter by class
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }
    
    // Filter by academic year
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { academicYear: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'fees.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    const feeStructures = await FeeStructure.find(query)
      .populate('createdBy', 'name')
      .sort({ class: 1, academicYear: -1 });
    
    // Group by class
    const feeStructuresByClass = {};
    feeStructures.forEach(feeStructure => {
      if (!feeStructuresByClass[feeStructure.class]) {
        feeStructuresByClass[feeStructure.class] = [];
      }
      feeStructuresByClass[feeStructure.class].push(feeStructure);
    });
    
    res.render('pages/fee-structures', {
      feeStructures,
      feeStructuresByClass,
      title: 'Fee Structure',
      classFilter: classFilter || 'all',
      academicYear: academicYear || 'all',
      search: search || '',
      getCategoryColor,
      getFrequencyColor,
      getOrdinalSuffix
    });
  } catch (error) {
    console.error('Error fetching public fee structures:', error);
    res.render('pages/fee-structures', {
      feeStructures: [],
      feeStructuresByClass: {},
      title: 'Fee Structure',
      classFilter: 'all',
      academicYear: 'all',
      search: '',
      getCategoryColor,
      getFrequencyColor,
      getOrdinalSuffix
    });
  }
};

// Get fee structure for specific class
exports.getFeeStructureByClass = async (req, res) => {
  try {
    const { class: classValue } = req.params;
    const { academicYear } = req.query;
    
    let query = { class: classValue, isActive: true };
    
    // Filter by academic year
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    
    const feeStructures = await FeeStructure.find(query)
      .populate('createdBy', 'name')
      .sort({ academicYear: -1 });
    
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
    
    res.render('pages/fee-structure-class', {
      feeStructures,
      classValue,
      className: classNames[classValue] || classValue,
      title: `${classNames[classValue] || classValue} Fee Structure`,
      academicYear: academicYear || 'all',
      getCategoryColor,
      getFrequencyColor,
      getOrdinalSuffix
    });
  } catch (error) {
    console.error('Error fetching fee structure by class:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the fee structure.'
    });
  }
};

// Get statistics for admin dashboard
exports.getStatistics = async (req, res) => {
  try {
    const totalFeeStructures = await FeeStructure.countDocuments();
    const activeFeeStructures = await FeeStructure.countDocuments({ isActive: true });
    const feeStructuresByClass = await FeeStructure.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      statistics: {
        total: totalFeeStructures,
        active: activeFeeStructures,
        byClass: feeStructuresByClass
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
}; 