const express = require('express');
const router = express.Router();
const resultSummaryController = require('../controllers/resultSummaryController');
const auth = require('../middleware/auth');

// Admin routes for Result Summaries
router.get('/admin/result-summaries', auth, resultSummaryController.getAllResultSummaries);
router.get('/admin/result-summaries/create', auth, resultSummaryController.showCreateForm);
router.post('/admin/result-summaries/create', auth, resultSummaryController.createResultSummary);
router.get('/admin/result-summaries/edit/:id', auth, resultSummaryController.showEditForm);
router.post('/admin/result-summaries/edit/:id', auth, resultSummaryController.updateResultSummary);
router.post('/admin/result-summaries/delete/:id', auth, resultSummaryController.deleteResultSummary);
router.post('/admin/result-summaries/toggle-publish/:id', auth, resultSummaryController.togglePublishStatus);
router.get('/admin/result-summaries/:id/view', auth, resultSummaryController.getResultSummaryDetails);

// Statistics route for admin dashboard
router.get('/admin/result-summaries/statistics', auth, resultSummaryController.getStatistics);

// Public routes for viewing result summaries
router.get('/result-summaries', resultSummaryController.getPublicResultSummaries);
router.get('/result-summaries/:id', resultSummaryController.getPublicResultSummaryDetails);

module.exports = router; 