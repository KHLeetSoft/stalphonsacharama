const express = require("express");
const router = express.Router();
const HomeContent = require("../models/HomeContent");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Get home content for API
router.get("/", async (req, res) => {
  try {
    const content = (await HomeContent.findOne()) || new HomeContent({});
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update home content - DISABLED: This route conflicts with admin routes
// The admin routes handle home content updates with proper file handling
/*
router.post("/update", upload.any(), async (req, res) => {
  try {
    // Get existing home content or create a new one if it doesn't exist
    let content = (await HomeContent.findOne()) || new HomeContent({});

    // Parse banner slides from form data
    const bannerSlides = [];
    const filesMap = {};

    // Build a map of uploaded files
    req.files.forEach((file) => {
      const field = file.fieldname;
      filesMap[field] = `/uploads/${file.filename}`;
    });

    // Collect banner slides from form fields
    if (req.body["bannerSlides[0][title]"] !== undefined) {
      let index = 0;
      while (req.body[`bannerSlides[${index}][title]`] !== undefined) {
        bannerSlides.push({
          title: req.body[`bannerSlides[${index}][title]`],
          subtitle: req.body[`bannerSlides[${index}][subtitle]`],
          ctaText: req.body[`bannerSlides[${index}][ctaText]`],
          ctaLink: req.body[`bannerSlides[${index}][ctaLink]`],
          imageUrl:
            filesMap[`bannerSlides[${index}][image]`] ||
            (content.bannerSlides[index] &&
              content.bannerSlides[index].imageUrl) ||
            "",
        });
        index++;
      }
    }

    // Featured sections (same logic as banner slides)
    const featuredSections = [];
    if (req.body["featuredSections[0][title]"] !== undefined) {
      let index = 0;
      while (req.body[`featuredSections[${index}][title]`] !== undefined) {
        featuredSections.push({
          title: req.body[`featuredSections[${index}][title]`],
          content: req.body[`featuredSections[${index}][content]`],
          icon: req.body[`featuredSections[${index}][icon]`],
          link: req.body[`featuredSections[${index}][link]`],
        });
        index++;
      }
    }

    // Update the content object with new data
    content.bannerSlides = bannerSlides; // Overwrite the old banner slides with the new ones
    content.welcomeTitle = req.body.welcomeTitle || "";
    content.welcomeContent = req.body.welcomeContent || "";
    content.featuredSections = featuredSections;
    content.updatedAt = Date.now();

    // Save the updated content to the database
    await content.save();

    // Redirect to the admin home page
    res.redirect("/admin/home");
  } catch (err) {
    console.error(err);
    res.status(400).send("Error updating home content");
  }
});
*/

module.exports = router;
