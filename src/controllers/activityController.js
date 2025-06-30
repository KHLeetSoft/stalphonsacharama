const Activity = require("../models/Activity");

const activityController = {
  // Admin: Render activities list
  renderAdminActivities: async (req, res) => {
    try {
      const activities = await Activity.find();
      res.render("admin/activities/index", {
        title: "Activities Management",
        layout: "admin/layouts/admin",
        activities: activities,
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).send("Error fetching activities");
    }
  },
  // Get all activities
  getAllActivities: async (req, res) => {
    try {
      const activities = await Activity.find({ isActive: true });
      ////console.log(activities);
      res.render("pages/activity", { activities });
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).send("Error fetching activities");
    }
  },

  // Get single activity by ID
  getActivityById: async (req, res) => {
    try {
      const activity = await Activity.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Error fetching activity" });
    }
  },

  // Admin: Create new activity
  createActivity: async (req, res) => {
    try {
      const activityData = req.body;
      const requiredFields = [
        "title",
        "category",
        "description",
        "schedule",
        "location",
        "participants",
      ];

      // Validate required fields
      const missingFields = requiredFields.filter(
        (field) => !activityData[field]
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      // Handle image upload
      if (req.file) {
        activityData.image = `/uploads/${req.file.filename}`;
      }

      // Handle sub-activities array
      if (activityData.activities) {
        activityData.activities = Object.keys(activityData.activities)
          .map((key) => ({
            title: activityData.activities[key].title,
            description: activityData.activities[key].description,
            schedule: activityData.activities[key].schedule,
            location: activityData.activities[key].location,
            participants: activityData.activities[key].participants,
          }))
          .filter((activity) => activity.title && activity.description);
      }

      const newActivity = new Activity(activityData);
      await newActivity.save();
      res.status(201).json({
        success: true,
        message: "Activity created successfully",
        activity: newActivity,
      });
    } catch (error) {
      console.error("Error creating activity:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: Object.values(error.errors)
            .map((err) => err.message)
            .join(", "),
        });
      }
      res.status(500).json({ error: "Error creating activity" });
    }
  },

  // Admin: Update activity
  updateActivity: async (req, res) => {
    try {
      const activityData = req.body;

      // Handle image upload if present
      if (req.file) {
        activityData.image = `/uploads/${req.file.filename}`;
      }

      // Parse activities array if present
      if (activityData.activities) {
        try {
          if (typeof activityData.activities === "string") {
            activityData.activities = JSON.parse(activityData.activities);
          }
        } catch (parseError) {
          console.error("Error parsing activities:", parseError);
          return res
            .status(400)
            .json({ error: "Invalid activities data format" });
        }
      }

      // Validate required fields
      if (
        !activityData.title ||
        !activityData.description ||
        !activityData.category
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updatedActivity = await Activity.findByIdAndUpdate(
        req.params.id,
        { ...activityData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!updatedActivity) {
        return res.status(404).json({ error: "Activity not found" });
      }

      res.json({
        message: "Activity updated successfully",
        activity: updatedActivity,
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ error: "Error updating activity" });
    }
  },

  // Admin: Delete activity
  deleteActivity: async (req, res) => {
    try {
      const deletedActivity = await Activity.findByIdAndDelete(req.params.id);
      if (!deletedActivity) {
        return res
          .status(404)
          .json({ success: false, error: "Activity not found" });
      }
      res.json({ success: true, message: "Activity deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity:", error);
      res
        .status(500)
        .json({ success: false, error: "Error deleting activity" });
    }
  },

  // Admin: Render activity management page
  renderAdminActivities: async (req, res) => {
    try {
      const activities = await Activity.find().sort({ createdAt: -1 });
      res.render("admin/activities/index", { activities });
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).send("Error fetching activities");
    }
  },
};

module.exports = activityController;
