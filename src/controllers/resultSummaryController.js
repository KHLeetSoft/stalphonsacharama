const ResultSummary = require('../models/ResultSummary');

// Get all result summaries (Admin)
exports.getAllResultSummaries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalResults = await ResultSummary.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    const results = await ResultSummary.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render('admin/result-summaries/index', {
      results,
      currentPage: page,
      totalPages,
      admin: req.admin,
      title: 'Result Summaries'
    });
  } catch (error) {
    console.error('Error fetching result summaries:', error);
    res.status(500).render('admin/result-summaries/index', {
      results: [],
      currentPage: 1,
      totalPages: 1,
      admin: req.admin,
      title: 'Result Summaries',
      error: 'Failed to load result summaries.'
    });
  }
};

// Show create form
exports.showCreateForm = (req, res) => {
  res.render('admin/result-summaries/create', {
    admin: req.admin,
    title: 'Add Result Summary'
  });
};

// Create new result summary
exports.createResultSummary = async (req, res) => {
  try {
    const {
      title,
      academicYear,
      class: className,
      examType,
      examDate,
      totalStudents,
      appearedStudents,
      passedStudents,
      distinctionStudents,
      firstDivisionStudents,
      secondDivisionStudents,
      thirdDivisionStudents,
      averageScore,
      highestScore,
      lowestScore,
      description,
      remarks,
      tags
    } = req.body;

    // Parse subject-wise results
    const subjectWiseResults = [];
    if (req.body.subjects && Array.isArray(req.body.subjects)) {
      req.body.subjects.forEach((subject, index) => {
        if (subject && req.body.subjectScores && req.body.subjectScores[index]) {
          subjectWiseResults.push({
            subject: subject,
            averageScore: parseFloat(req.body.subjectScores[index]) || 0,
            highestScore: parseFloat(req.body.subjectHighestScores[index]) || 0,
            passPercentage: parseFloat(req.body.subjectPassPercentages[index]) || 0
          });
        }
      });
    }

    // Parse top performers
    const topPerformers = [];
    if (req.body.performerNames && Array.isArray(req.body.performerNames)) {
      req.body.performerNames.forEach((name, index) => {
        if (name && req.body.performerRollNumbers && req.body.performerRollNumbers[index]) {
          topPerformers.push({
            rank: parseInt(req.body.performerRanks[index]) || (index + 1),
            studentName: name,
            rollNumber: req.body.performerRollNumbers[index],
            totalScore: parseFloat(req.body.performerScores[index]) || 0,
            percentage: parseFloat(req.body.performerPercentages[index]) || 0
          });
        }
      });
    }

    // Calculate pass percentage
    const passPercentage = appearedStudents > 0 ? Math.round((passedStudents / appearedStudents) * 100) : 0;

    const resultSummary = new ResultSummary({
      title,
      academicYear,
      class: className,
      examType,
      examDate: new Date(examDate),
      totalStudents: parseInt(totalStudents),
      appearedStudents: parseInt(appearedStudents),
      passedStudents: parseInt(passedStudents),
      distinctionStudents: parseInt(distinctionStudents) || 0,
      firstDivisionStudents: parseInt(firstDivisionStudents) || 0,
      secondDivisionStudents: parseInt(secondDivisionStudents) || 0,
      thirdDivisionStudents: parseInt(thirdDivisionStudents) || 0,
      passPercentage,
      averageScore: parseFloat(averageScore) || 0,
      highestScore: parseFloat(highestScore) || 0,
      lowestScore: parseFloat(lowestScore) || 0,
      subjectWiseResults,
      topPerformers,
      description,
      remarks,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      createdBy: req.admin._id
    });

    await resultSummary.save();

    req.flash('success', 'Result summary created successfully!');
    res.redirect('/admin/result-summaries');
  } catch (error) {
    console.error('Error creating result summary:', error);
    req.flash('error', 'Failed to create result summary. Please try again.');
    res.redirect('/admin/result-summaries/create');
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const resultSummary = await ResultSummary.findById(req.params.id);
    if (!resultSummary) {
      req.flash('error', 'Result summary not found.');
      return res.redirect('/admin/result-summaries');
    }

    res.render('admin/result-summaries/edit', {
      resultSummary,
      admin: req.admin,
      title: 'Edit Result Summary'
    });
  } catch (error) {
    console.error('Error fetching result summary:', error);
    req.flash('error', 'Failed to load result summary.');
    res.redirect('/admin/result-summaries');
  }
};

// Update result summary
exports.updateResultSummary = async (req, res) => {
  try {
    const {
      title,
      academicYear,
      class: className,
      examType,
      examDate,
      totalStudents,
      appearedStudents,
      passedStudents,
      distinctionStudents,
      firstDivisionStudents,
      secondDivisionStudents,
      thirdDivisionStudents,
      averageScore,
      highestScore,
      lowestScore,
      description,
      remarks,
      tags
    } = req.body;

    // Parse subject-wise results
    const subjectWiseResults = [];
    if (req.body.subjects && Array.isArray(req.body.subjects)) {
      req.body.subjects.forEach((subject, index) => {
        if (subject && req.body.subjectScores && req.body.subjectScores[index]) {
          subjectWiseResults.push({
            subject: subject,
            averageScore: parseFloat(req.body.subjectScores[index]) || 0,
            highestScore: parseFloat(req.body.subjectHighestScores[index]) || 0,
            passPercentage: parseFloat(req.body.subjectPassPercentages[index]) || 0
          });
        }
      });
    }

    // Parse top performers
    const topPerformers = [];
    if (req.body.performerNames && Array.isArray(req.body.performerNames)) {
      req.body.performerNames.forEach((name, index) => {
        if (name && req.body.performerRollNumbers && req.body.performerRollNumbers[index]) {
          topPerformers.push({
            rank: parseInt(req.body.performerRanks[index]) || (index + 1),
            studentName: name,
            rollNumber: req.body.performerRollNumbers[index],
            totalScore: parseFloat(req.body.performerScores[index]) || 0,
            percentage: parseFloat(req.body.performerPercentages[index]) || 0
          });
        }
      });
    }

    // Calculate pass percentage
    const passPercentage = appearedStudents > 0 ? Math.round((passedStudents / appearedStudents) * 100) : 0;

    const updateData = {
      title,
      academicYear,
      class: className,
      examType,
      examDate: new Date(examDate),
      totalStudents: parseInt(totalStudents),
      appearedStudents: parseInt(appearedStudents),
      passedStudents: parseInt(passedStudents),
      distinctionStudents: parseInt(distinctionStudents) || 0,
      firstDivisionStudents: parseInt(firstDivisionStudents) || 0,
      secondDivisionStudents: parseInt(secondDivisionStudents) || 0,
      thirdDivisionStudents: parseInt(thirdDivisionStudents) || 0,
      passPercentage,
      averageScore: parseFloat(averageScore) || 0,
      highestScore: parseFloat(highestScore) || 0,
      lowestScore: parseFloat(lowestScore) || 0,
      subjectWiseResults,
      topPerformers,
      description,
      remarks,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    await ResultSummary.findByIdAndUpdate(req.params.id, updateData);

    req.flash('success', 'Result summary updated successfully!');
    res.redirect('/admin/result-summaries');
  } catch (error) {
    console.error('Error updating result summary:', error);
    req.flash('error', 'Failed to update result summary. Please try again.');
    res.redirect(`/admin/result-summaries/edit/${req.params.id}`);
  }
};

// Delete result summary
exports.deleteResultSummary = async (req, res) => {
  try {
    await ResultSummary.findByIdAndDelete(req.params.id);
    req.flash('success', 'Result summary deleted successfully!');
    res.redirect('/admin/result-summaries');
  } catch (error) {
    console.error('Error deleting result summary:', error);
    req.flash('error', 'Failed to delete result summary.');
    res.redirect('/admin/result-summaries');
  }
};

// Toggle publish status
exports.togglePublishStatus = async (req, res) => {
  try {
    const resultSummary = await ResultSummary.findById(req.params.id);
    if (!resultSummary) {
      return res.status(404).json({ success: false, message: 'Result summary not found.' });
    }

    resultSummary.isPublished = !resultSummary.isPublished;
    if (resultSummary.isPublished) {
      resultSummary.publishedDate = new Date();
    } else {
      resultSummary.publishedDate = null;
    }

    await resultSummary.save();

    res.json({ 
      success: true, 
      message: `Result summary ${resultSummary.isPublished ? 'published' : 'unpublished'} successfully.`,
      isPublished: resultSummary.isPublished
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ success: false, message: 'Failed to update publish status.' });
  }
};

// Get result summary details (Admin)
exports.getResultSummaryDetails = async (req, res) => {
  try {
    const resultSummary = await ResultSummary.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!resultSummary) {
      req.flash('error', 'Result summary not found.');
      return res.redirect('/admin/result-summaries');
    }

    res.render('admin/result-summaries/view', {
      resultSummary,
      admin: req.admin,
      title: 'Result Summary Details'
    });
  } catch (error) {
    console.error('Error fetching result summary details:', error);
    req.flash('error', 'Failed to load result summary details.');
    res.redirect('/admin/result-summaries');
  }
};

// Get public result summaries
exports.getPublicResultSummaries = async (req, res) => {
  try {
    const { class: className, examType, academicYear } = req.query;
    
    // For testing, let's show all results, not just published ones
    let query = {}; // Remove isPublished filter temporarily
    
    // Only add filters if they have actual values (not empty strings)
    if (className && className !== '' && className !== 'all') {
      query.class = className;
    }
    if (examType && examType !== '' && examType !== 'all') {
      query.examType = examType;
    }
    if (academicYear && academicYear !== '' && academicYear !== 'all') {
      query.academicYear = academicYear;
    }

    ////console.log('Query:', query); // Debug log
    ////console.log('Query parameters:', { className, examType, academicYear }); // Debug log

    // Check total count first
    const totalCount = await ResultSummary.countDocuments();
    const publishedCount = await ResultSummary.countDocuments({ isPublished: true });
    ////console.log('Total result summaries:', totalCount);
    ////console.log('Published result summaries:', publishedCount);

    const results = await ResultSummary.find(query)
      .populate('createdBy', 'name')
      .sort({ examDate: -1, createdAt: -1 })
      .lean(); // Use lean() for better performance

    ////console.log('Found results:', results.length); // Debug log

    // Get unique values for filters from all results (not just published)
    const classes = await ResultSummary.distinct('class');
    const examTypes = await ResultSummary.distinct('examType');
    const academicYears = await ResultSummary.distinct('academicYear');

    ////console.log('Filter options:', { classes, examTypes, academicYears }); // Debug log

    // Add virtual properties manually since we're using lean()
    const resultsWithVirtuals = results.map(result => ({
      ...result,
      className: result.class === 'nursery' ? 'Nursery' :
                 result.class === 'lkg' ? 'LKG' :
                 result.class === 'ukg' ? 'UKG' :
                 result.class === 'all' ? 'All Classes' :
                 `Class ${result.class}`,
      examTypeName: result.examType === 'unit-test' ? 'Unit Test' :
                    result.examType === 'mid-term' ? 'Mid Term' :
                    result.examType === 'final' ? 'Final Exam' :
                    result.examType === 'board' ? 'Board Exam' :
                    result.examType === 'competitive' ? 'Competitive Exam' :
                    result.examType === 'other' ? 'Other' : result.examType
    }));

    res.render('pages/result-summaries', {
      results: resultsWithVirtuals,
      classes,
      examTypes,
      academicYears,
      currentFilters: { class: className, examType, academicYear },
      title: 'Result Summaries'
    });
  } catch (error) {
    console.error('Error fetching public result summaries:', error);
    res.render('pages/result-summaries', {
      results: [],
      classes: [],
      examTypes: [],
      academicYears: [],
      currentFilters: {},
      title: 'Result Summaries',
      error: 'Failed to load result summaries.'
    });
  }
};

// Get public result summary details
exports.getPublicResultSummaryDetails = async (req, res) => {
  try {
    const resultSummary = await ResultSummary.findById(req.params.id)
      .populate('createdBy', 'name');
    
    ////console.log('Looking for result summary with ID:', req.params.id);
    ////console.log('Found result summary:', resultSummary ? 'Yes' : 'No');
    if (resultSummary) {
      ////console.log('Published status:', resultSummary.isPublished);
      ////console.log('Title:', resultSummary.title);
    }
    
    if (!resultSummary) {
      return res.status(404).render('pages/error', {
        title: 'Result Summary Not Found',
        error: { status: 404 },
        message: 'The requested result summary could not be found.'
      });
    }

    // Temporarily remove published check for debugging
    // if (!resultSummary.isPublished) {
    //   return res.status(404).render('pages/error', {
    //     title: 'Result Summary Not Found',
    //     error: { status: 404 },
    //     message: 'The requested result summary is not published.'
    //   });
    // }

    // Add virtual properties manually
    const resultSummaryWithVirtuals = {
      ...resultSummary.toObject(),
      className: resultSummary.class === 'nursery' ? 'Nursery' :
                 resultSummary.class === 'lkg' ? 'LKG' :
                 resultSummary.class === 'ukg' ? 'UKG' :
                 resultSummary.class === 'all' ? 'All Classes' :
                 `Class ${resultSummary.class}`,
      examTypeName: resultSummary.examType === 'unit-test' ? 'Unit Test' :
                    resultSummary.examType === 'mid-term' ? 'Mid Term' :
                    resultSummary.examType === 'final' ? 'Final Exam' :
                    resultSummary.examType === 'board' ? 'Board Exam' :
                    resultSummary.examType === 'competitive' ? 'Competitive Exam' :
                    resultSummary.examType === 'other' ? 'Other' : resultSummary.examType
    };

    res.render('pages/result-summary-detail', {
      resultSummary: resultSummaryWithVirtuals,
      title: resultSummary.title
    });
  } catch (error) {
    console.error('Error fetching result summary details:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      error: { status: 500 },
      message: 'Failed to load result summary details.'
    });
  }
};

// Get statistics for admin dashboard
exports.getStatistics = async (req, res) => {
  try {
    const totalResults = await ResultSummary.countDocuments();
    const publishedResults = await ResultSummary.countDocuments({ isPublished: true });
    const resultsByClass = await ResultSummary.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const resultsByExamType = await ResultSummary.aggregate([
      { $group: { _id: '$examType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      statistics: {
        total: totalResults,
        published: publishedResults,
        byClass: resultsByClass,
        byExamType: resultsByExamType
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
}; 