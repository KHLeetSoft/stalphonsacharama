const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const auth = require("../middleware/auth");
const upload = require("../middleware/fileUpload");

// Public routes
router.get("/", (req, res, next) => {
  ////console.log(res)
  if (req.baseUrl === "/admin/activities") {
    return activityController.renderAdminActivities(req, res, next);
  }
  return activityController.getAllActivities(req, res, next);
});

// Public activity detail route
router.get("/:id", (req, res, next) => {
  if (req.baseUrl === "/admin/activities") {
    return next();
  }
  return activityController.getActivityById(req, res, next);
});

// Admin routes
router.get("/create", auth, (req, res) => {
  res.render("admin/activities/create", {
    title: "Create Activity",
    layout: "admin/layouts/admin",
  });
});

// Admin edit activity route
router.get("/edit/:id", auth, async (req, res) => {
  try {
    const activity = await require("../models/Activity").findById(
      req.params.id
    );
    if (!activity) {
      return res.status(404).send("Activity not found");
    }
    res.render("admin/activities/edit", {
      title: "Edit Activity",
      layout: "admin/layouts/admin",
      ...activity.toObject(),
    });
  } catch (error) {
    console.error("Error fetching activity for edit:", error);
    res.status(500).send("Error fetching activity");
  }
});

router.post(
  "/",
  auth,
  upload.single("image"),
  activityController.createActivity
);
router.post(
  "/update/:id",
  auth,
  upload.single("image"),
  activityController.updateActivity
);
router.delete("/:id", auth, activityController.deleteActivity);

// Admin activity management route
router.get("/manage", auth, (req, res) => {
  res.render("admin/activities/index", {
    title: "Manage Activities",
    layout: "admin/layouts/admin",
  });
});

module.exports = router;
