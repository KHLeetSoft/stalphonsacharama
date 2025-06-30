const express = require('express');
const router = express.Router();
const schoolManagementController = require('../controllers/schoolManagementController');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Admin routes for School Management
router.get('/admin/school-management', auth, schoolManagementController.getAllSchoolManagement);
router.get('/admin/school-management/create', auth, schoolManagementController.showCreateForm);
router.post('/admin/school-management/create', auth, upload.single('photo'), schoolManagementController.createSchoolManagement);
router.get('/admin/school-management/edit/:id', auth, schoolManagementController.showEditForm);
router.post('/admin/school-management/edit/:id', auth, upload.single('photo'), schoolManagementController.updateSchoolManagement);
router.post('/admin/school-management/delete/:id', auth, schoolManagementController.deleteSchoolManagement);
router.post('/admin/school-management/toggle-status/:id', auth, schoolManagementController.toggleActiveStatus);
router.post('/admin/school-management/update-priority/:id', auth, schoolManagementController.updatePriority);

// Statistics route for admin dashboard
router.get('/admin/school-management/statistics', auth, schoolManagementController.getStatistics);

// Public routes for viewing school management entries
router.get('/school-community', schoolManagementController.getPublicSchoolManagement);
router.get('/school-community/:id', schoolManagementController.getSingleEntry);

module.exports = router; 