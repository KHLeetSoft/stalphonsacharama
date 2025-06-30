const AnnualReport = require('../models/AnnualReport');
const fs = require('fs');
const path = require('path');

// Get all annual reports
exports.getAllAnnualReports = async (req, res) => {
  try {
    const reports = await AnnualReport.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.render('admin/annual-reports/index', {
      reports,
      admin: req.admin,
      title: 'Annual Reports'
    });
  } catch (error) {
    console.error('Error fetching annual reports:', error);
    res.status(500).render('admin/annual-reports/index', {
      reports: [],
      admin: req.admin,
      title: 'Annual Reports',
      error: 'Failed to load annual reports.'
    });
  }
};

// Show create form
exports.showCreateForm = (req, res) => {
  res.render('admin/annual-reports/create', {
    admin: req.admin,
    title: 'Add Annual Report'
  });
};

// Create new annual report
exports.createAnnualReport = async (req, res) => {
  try {
    const { title, description, academicYear, tags } = req.body;
    
    let reportFile = '';
    let coverImage = '';
    
    // Handle file uploads
    if (req.files) {
      if (req.files.reportFile) {
        reportFile = `/uploads/${req.files.reportFile[0].filename}`;
      }
      if (req.files.coverImage) {
        coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
    }
    
    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    const annualReport = new AnnualReport({
      title,
      description,
      academicYear,
      reportFile,
      coverImage,
      tags: tagsArray,
      createdBy: req.admin._id
    });
    
    await annualReport.save();
    res.redirect('/admin/annual-reports');
  } catch (error) {
    console.error('Error creating annual report:', error);
    res.status(500).render('admin/annual-reports/create', {
      admin: req.admin,
      title: 'Add Annual Report',
      error: 'Failed to create annual report.',
      formData: req.body
    });
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report) {
      return res.redirect('/admin/annual-reports');
    }
    
    res.render('admin/annual-reports/edit', {
      report,
      admin: req.admin,
      title: 'Edit Annual Report'
    });
  } catch (error) {
    console.error('Error fetching annual report:', error);
    res.redirect('/admin/annual-reports');
  }
};

// Update annual report
exports.updateAnnualReport = async (req, res) => {
  try {
    const { title, description, academicYear, tags } = req.body;
    const report = await AnnualReport.findById(req.params.id);
    
    if (!report) {
      return res.redirect('/admin/annual-reports');
    }
    
    // Handle file uploads
    if (req.files) {
      if (req.files.reportFile) {
        // Delete old file if exists
        if (report.reportFile) {
          const oldFilePath = path.join(__dirname, '..', 'public', report.reportFile);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        report.reportFile = `/uploads/${req.files.reportFile[0].filename}`;
      }
      if (req.files.coverImage) {
        // Delete old file if exists
        if (report.coverImage) {
          const oldFilePath = path.join(__dirname, '..', 'public', report.coverImage);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        report.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
    }
    
    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    report.title = title;
    report.description = description;
    report.academicYear = academicYear;
    report.tags = tagsArray;
    
    await report.save();
    res.redirect('/admin/annual-reports');
  } catch (error) {
    console.error('Error updating annual report:', error);
    res.redirect('/admin/annual-reports');
  }
};

// Delete annual report
exports.deleteAnnualReport = async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report) {
      return res.redirect('/admin/annual-reports');
    }
    
    // Delete associated files
    if (report.reportFile) {
      const filePath = path.join(__dirname, '..', 'public', report.reportFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    if (report.coverImage) {
      const imagePath = path.join(__dirname, '..', 'public', report.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await AnnualReport.findByIdAndDelete(req.params.id);
    res.redirect('/admin/annual-reports');
  } catch (error) {
    console.error('Error deleting annual report:', error);
    res.redirect('/admin/annual-reports');
  }
};

// Toggle publish status
exports.togglePublishStatus = async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    report.isPublished = !report.isPublished;
    if (report.isPublished) {
      report.publishedDate = new Date();
    } else {
      report.publishedDate = null;
    }
    
    await report.save();
    res.json({ 
      success: true, 
      isPublished: report.isPublished,
      message: report.isPublished ? 'Report published successfully' : 'Report unpublished successfully'
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ success: false, message: 'Error updating publish status' });
  }
};

// Download report
exports.downloadReport = async (req, res) => {
  try {
    const report = await AnnualReport.findById(req.params.id);
    if (!report || !report.reportFile) {
      return res.status(404).send('Report not found');
    }
    
    // Increment download count
    report.downloadCount += 1;
    await report.save();
    
    const filePath = path.join(__dirname, '..', 'public', report.reportFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    
    res.download(filePath, `${report.title}_${report.academicYear}.pdf`);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).send('Error downloading report');
  }
}; 