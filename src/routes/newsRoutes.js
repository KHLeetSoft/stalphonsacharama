const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Admin routes for News
router.get('/admin/news', auth, newsController.getAllNews);
router.get('/admin/news/create', auth, newsController.showCreateForm);
router.post('/admin/news/create', auth, upload.single('image'), newsController.createNews);
router.get('/admin/news/edit/:id', auth, newsController.showEditForm);
router.post('/admin/news/edit/:id', auth, upload.single('image'), newsController.updateNews);
router.post('/admin/news/delete/:id', auth, newsController.deleteNews);
router.post('/admin/news/toggle-publish/:id', auth, newsController.togglePublishStatus);
router.post('/admin/news/toggle-featured/:id', auth, newsController.toggleFeaturedStatus);
router.get('/admin/news/:id/view', auth, newsController.getNewsDetails);

// Statistics route for admin dashboard
router.get('/admin/news/statistics', auth, newsController.getStatistics);

// Debug route (remove in production)
router.get('/admin/news/debug/status', auth, newsController.debugNewsStatus);

// Publish all articles route (for testing - remove in production)
router.post('/admin/news/publish-all', auth, newsController.publishAllArticles);

// Public routes for viewing news
router.get('/news', newsController.getPublicNews);
router.get('/news/search', newsController.searchNews);
router.get('/news/category/:category', newsController.getNewsByCategory);
router.get('/news/:slug', newsController.getPublicNewsDetails);

module.exports = router; 