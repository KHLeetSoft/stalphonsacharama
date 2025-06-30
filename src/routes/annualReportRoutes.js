const express = require('express');
const router = express.Router();
const annualReportController = require('../controllers/annualReportController');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Admin routes for Annual Reports
router.get('/admin/annual-reports', auth, annualReportController.getAllAnnualReports);
router.get('/admin/annual-reports/create', auth, annualReportController.showCreateForm);
router.post('/admin/annual-reports/create', auth, upload.fields([
  { name: 'reportFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), annualReportController.createAnnualReport);
router.get('/admin/annual-reports/edit/:id', auth, annualReportController.showEditForm);
router.post('/admin/annual-reports/edit/:id', auth, upload.fields([
  { name: 'reportFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), annualReportController.updateAnnualReport);
router.post('/admin/annual-reports/delete/:id', auth, annualReportController.deleteAnnualReport);
router.post('/admin/annual-reports/toggle-publish/:id', auth, annualReportController.togglePublishStatus);

// Public routes for viewing and downloading reports
router.get('/annual-reports', async (req, res) => {
  try {
    const AnnualReport = require('../models/AnnualReport');
    const reports = await AnnualReport.find({ isPublished: true })
      .populate('createdBy', 'name')
      .sort({ publishedDate: -1 });
    
    res.render('pages/annual-reports', {
      reports,
      title: 'Annual Reports'
    });
  } catch (error) {
    console.error('Error fetching annual reports:', error);
    res.render('pages/annual-reports', {
      reports: [],
      title: 'Annual Reports'
    });
  }
});

router.get('/annual-reports/download/:id', annualReportController.downloadReport);

module.exports = router; 