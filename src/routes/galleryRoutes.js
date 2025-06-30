const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const galleryController = require("../controllers/galleryController");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Public routes
router.get("/gallery", galleryController.getAllGalleryImages);

// Admin routes
router.get("/admin/gallery", galleryController.getAdminGallery);
router.post(
  "/admin/gallery/create",
  upload.single("image"),
  galleryController.createGalleryImage
);
router.post(
  "/admin/gallery/update/:id",
  upload.single("image"),
  galleryController.updateGalleryImage
);
router.post("/admin/gallery/delete/:id", galleryController.deleteGalleryImage);

module.exports = router;
