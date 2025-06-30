const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Admin routes
router.get('/admin/facilities', auth, facilityController.adminList);
router.get('/admin/facilities/create', auth, facilityController.showCreate);
router.post('/admin/facilities/create', auth, upload.single('image'), facilityController.create);
router.get('/admin/facilities/edit/:id', auth, facilityController.showEdit);
router.post('/admin/facilities/edit/:id', auth, upload.single('image'), facilityController.update);
router.post('/admin/facilities/delete/:id', auth, facilityController.delete);

// Public route
router.get('/facilities', facilityController.publicList);

module.exports = router; 