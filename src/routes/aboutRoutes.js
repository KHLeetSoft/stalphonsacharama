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

module.exports = router;
