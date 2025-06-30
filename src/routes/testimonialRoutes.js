const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const upload = require("../middleware/fileUpload");
const adminView = require("../middleware/adminView");

// Admin routes for testimonials
router.get(
  "/admin/about/testimonials",
  adminView,
  testimonialController.getAllTestimonials
);
router.post(
  "/admin/about/testimonials",
  adminView,
  upload.single("image"),
  testimonialController.createTestimonial
);
router.put(
  "/admin/about/testimonials/:id",
  adminView,
  upload.single("image"),
  testimonialController.updateTestimonial
);
router.delete(
  "/admin/about/testimonials/:id",
  adminView,
  testimonialController.deleteTestimonial
);

module.exports = router;
