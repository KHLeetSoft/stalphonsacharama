const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

// Public routes
router.get("/teachers", teacherController.getAllTeachers);

// Admin routes
router.get("/admin/teachers", teacherController.getAdminTeachers);
router.get("/admin/teachers/add", teacherController.getAddTeacher);
router.post("/admin/teachers/add", teacherController.addTeacher);
router.get("/admin/teachers/edit/:id", teacherController.getEditTeacher);
router.post("/admin/teachers/edit/:id", teacherController.updateTeacher);
router.delete("/admin/teachers/delete/:id", teacherController.deleteTeacher);

module.exports = router;
