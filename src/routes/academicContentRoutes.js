const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Academic = require("../models/Academic");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Get all academic content
router.get("/", async (req, res) => {
  try {
    const academics = await Academic.find();
    res.render("pages/academics", { content: academics });
  } catch (error) {
    res.status(500).json({ error: "Error fetching academic content" });
  }
});

// Admin routes for managing academic content
router.get("/admin/academics", async (req, res) => {
  try {
    const academics = await Academic.find();
    ////console.log(academics);
    res.render("admin/academics/index", { content: academics });
  } catch (error) {
    res.status(500).json({ error: "Error fetching academic content" });
  }
});

// Display form to add new academic program
router.get("/admin/academics/add", (req, res) => {
  res.render("admin/academics/add", { title: "Add Academic Content" });
});

// Create new academic content
router.post("/admin/academics", upload.single("image"), async (req, res) => {
  try {
    // Trim whitespace from form inputs
    const title = req.body.title ? req.body.title.trim() : "";
    const description = req.body.description ? req.body.description.trim() : "";

    if (!title || !description) {
      return res.status(400).render("admin/academics/add", {
        title: "Add Academic Content",
        error: "Title and description are required",
        formData: { title, description },
      });
    }

    if (!req.file) {
      return res.status(400).render("admin/academics/add", {
        title: "Add Academic Content",
        error: "Image is required",
        formData: { title, description },
      });
    }

    const newAcademic = new Academic({
      title: title,
      description: description,
      image: `/uploads/${req.file.filename}`,
    });

    await newAcademic.save();
    req.flash("success", "Academic content created successfully");
    return res.redirect("/admin/academics");
  } catch (error) {
    console.error("Error creating academic content:", error);
    return res.status(500).render("admin/academics/add", {
      title: "Add Academic Content",
      error: "An error occurred while creating academic content",
      formData: req.body,
    });
  }
});

// Update academic content
router.post(
  "/admin/academics/update",
  upload.single("image"),
  async (req, res) => {
    ////console.log("Update request received", req.body);
    try {
      const { title, description, programs } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res
          .status(400)
          .json({ error: "Title and description are required" });
      }

      // Validate file upload if image is provided
      if (req.file) {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({
            error:
              "Invalid file type. Only JPEG, PNG and GIF images are allowed",
          });
        }
        if (req.file.size > 5 * 1024 * 1024) {
          // 5MB limit
          return res
            .status(400)
            .json({ error: "File size too large. Maximum size is 5MB" });
        }
      }

      let updateData = {
        title,
        description,
        updatedAt: Date.now(),
      };

      // Handle image upload if provided
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      // Handle programs data if provided
      if (programs) {
        let parsedPrograms;
        try {
          parsedPrograms =
            typeof programs === "string" ? JSON.parse(programs) : programs;
          if (!Array.isArray(parsedPrograms)) {
            parsedPrograms = [parsedPrograms];
          }

          // Filter out any null or undefined program objects and trim fields
          parsedPrograms = parsedPrograms
            .filter((program) => program && typeof program === "object")
            .map((program) => {
              // Only include programs that have at least one non-empty field
              const trimmedProgram = {
                title: program.title?.trim() || "",
                description: program.description?.trim() || "",
                duration: program.duration?.trim() || "",
                requirements: program.requirements?.trim() || "",
                curriculum: program.curriculum?.trim() || "",
              };

              // Check if any field has content
              const hasContent = Object.values(trimmedProgram).some(
                (value) => value !== ""
              );
              return hasContent ? trimmedProgram : null;
            })
            .filter((program) => program !== null); // Remove null programs

          updateData.programs = parsedPrograms;
        } catch (error) {
          console.error("Error parsing programs data:", error);
          return res
            .status(400)
            .json({ error: "Invalid programs data format" });
        }
      }

      // Find and update the academic content
      try {
        const academic = await Academic.findOne();
        if (!academic) {
          const newAcademic = new Academic(updateData);
          await newAcademic.save();
        } else {
          // If programs is not provided in the update, keep existing programs
          if (!programs) {
            delete updateData.programs;
          }
          await Academic.findByIdAndUpdate(academic._id, updateData, {
            new: true,
            runValidators: true, // Enable mongoose validation
          });
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        return res.status(400).json({
          error: validationError.message || "Invalid data provided",
        });
      }

      res
        .status(200)
        .json({ message: "Academic content updated successfully" });
    } catch (error) {
      console.error("Error updating academic content:", error);
      res.status(500).json({ error: "Error updating academic content" });
    }
  }
);

// Delete academic content
router.delete("/admin/academics/:id", async (req, res) => {
  try {
    await Academic.findByIdAndDelete(req.params.id);
    res.redirect("/admin/academics");
  } catch (error) {
    console.error("Error deleting academic content:", error);
    res.status(500).json({ error: "Error deleting academic content" });
  }
});

module.exports = router;
