const express = require("express");
const router = express.Router();
const multer = require("multer");
const aboutController = require("../controllers/aboutController");
const upload = require("../middleware/fileUpload");
const auth = require("../middleware/auth");

// Public route for viewing about page
router.get("/", aboutController.getAboutPage);

// Public route for viewing vision-mission page
router.get("/vision-mission", aboutController.getVisionMissionPage);

// Admin routes for managing about content
router.get("/admin/about/edit", auth, aboutController.getAdminAboutEdit);
router.get("/admin/vision-mission", auth, aboutController.getAdminVisionMission);
router.post(
  "/admin/about/update",
  auth,
  upload.single("image"),
  aboutController.updateAboutContent
);

module.exports = router;
