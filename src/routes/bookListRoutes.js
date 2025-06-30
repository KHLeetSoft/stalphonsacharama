const express = require('express');
const router = express.Router();
const bookListController = require('../controllers/bookListController');
const auth = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Admin Book List Routes
router.get('/book-lists', auth, bookListController.getAllBookLists);
router.get('/book-lists/create', auth, bookListController.showCreateForm);
router.post('/book-lists/create', auth, upload.single('coverImage'), bookListController.createBookList);
router.get('/book-lists/edit/:id', auth, bookListController.showEditForm);
router.post('/book-lists/edit/:id', auth, upload.single('coverImage'), bookListController.updateBookList);
router.post('/book-lists/delete/:id', auth, bookListController.deleteBookList);
router.post('/book-lists/toggle-required/:id', auth, bookListController.toggleRequiredStatus);
router.post('/book-lists/toggle-active/:id', auth, bookListController.toggleActiveStatus);
router.post('/book-lists/update-priority/:id', auth, bookListController.updatePriority);

module.exports = router; 