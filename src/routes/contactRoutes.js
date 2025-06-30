const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Public routes
router.get("/", contactController.getContactPage);
router.post("/submit", contactController.submitContactForm);

// Admin routes
router.get("/admin/contact", contactController.getAdminContact);
router.post("/admin/contact/update", contactController.updateContactInfo);
router.get("/admin/contact/submissions", contactController.getFormSubmissions);
router.get(
  "/admin/contact/submissions/add",
  contactController.getAddSubmissionForm
);
router.post("/admin/contact/submissions/add", contactController.addSubmission);

module.exports = router;
