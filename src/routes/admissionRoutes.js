const express = require("express");
const router = express.Router();
const admissionController = require("../controllers/admissionController");

// Admin routes
router.get("/admin/admissions", admissionController.getAllAdmissions);
router.get("/admin/admissions/create", admissionController.getCreateForm);
router.post("/admin/admissions/create", admissionController.createAdmission);
router.get(
  "/admin/admissions/:id/view",
  admissionController.getAdmissionDetails
);
router.get("/admin/admissions/:id/edit", admissionController.getEditForm);
router.post("/admin/admissions/:id/edit", admissionController.updateAdmission);
router.post(
  "/admin/admissions/:id/delete",
  admissionController.deleteAdmission
);

// Public routes
router.get("/admissions", admissionController.getPublicAdmissions);

module.exports = router;
