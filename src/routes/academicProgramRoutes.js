const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const academicProgramController = require("../controllers/academicProgramController");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// List all programs
router.get("/", academicProgramController.getAllPrograms);

// Create program routes
router.get("/create", academicProgramController.getCreateForm);
router.post(
  "/create",
  upload.single("image"),
  academicProgramController.createProgram
);

// Edit program routes
router.get("/:id/edit", academicProgramController.getEditForm);
router.post(
  "/:id/edit",
  upload.single("image"),
  academicProgramController.updateProgram
);

// Delete program route
router.post("/:id/delete", academicProgramController.deleteProgram);

// Toggle program status
router.get("/:id/toggle", academicProgramController.toggleStatus);

module.exports = router;
