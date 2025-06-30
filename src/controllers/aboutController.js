const About = require("../models/About");
const path = require("path");
const fs = require("fs");

const { getTestimonialsForAboutPage } = require("./testimonialController");

exports.getAboutPage = async (req, res) => {
  try {
    const [about, testimonials] = await Promise.all([
      About.findOne(),
      getTestimonialsForAboutPage(),
    ]);
    res.render("pages/about", { about, testimonials });
  } catch (error) {
    console.error("Error fetching about content:", error);
    res.status(500).send("Error loading about page");
  }
};

exports.getVisionMissionPage = async (req, res) => {
  try {
    const about = await About.findOne();
    res.render("pages/vision-mission", { about, title: "Vision & Mission" });
  } catch (error) {
    console.error("Error loading vision-mission page:", error);
    res.status(500).send("Error loading vision-mission page");
  }
};

exports.getAdminAboutEdit = async (req, res) => {
  try {
    const about = await About.findOne();
    
    // If no about document exists, create one with default values
    if (!about) {
      const defaultAbout = new About({
        missionTitle: "Our Mission",
        mission: "To provide quality education that empowers students to become responsible, creative, and successful global citizens through innovative teaching methods and holistic development.",
        visionTitle: "Our Vision",
        vision: "To be a leading educational institution that nurtures excellence, innovation, and character development, preparing students to become responsible global citizens who contribute positively to society.",
        historyTitle: "Our History",
        history: "Founded with a vision to provide excellence in education, our school has been shaping young minds for generations.",
        image: "",
      });
      await defaultAbout.save();
      
      return res.render("admin/about/edit", {
        about: defaultAbout,
        missionTitle: defaultAbout.missionTitle,
        missionContent: defaultAbout.mission,
        visionTitle: defaultAbout.visionTitle,
        visionContent: defaultAbout.vision,
        historyTitle: defaultAbout.historyTitle,
        historyContent: defaultAbout.history,
        image: defaultAbout.image,
        admin: req.admin,
        title: "Edit About Content",
      });
    }

    res.render("admin/about/edit", {
      about,
      missionTitle: about.missionTitle,
      missionContent: about.mission,
      visionTitle: about.visionTitle,
      visionContent: about.vision,
      historyTitle: about.historyTitle,
      historyContent: about.history,
      image: about.image,
      admin: req.admin,
      title: "Edit About Content",
    });
  } catch (error) {
    console.error("Error fetching about content for edit:", error);
    res.status(500).send("Error loading edit page");
  }
};

exports.updateAboutContent = async (req, res) => {
  try {
    const {
      missionTitle,
      missionContent,
      visionTitle,
      visionContent,
      historyTitle,
      historyContent,
      coreValuesTitle,
    } = req.body;

    // Create update data object
    const updateData = {
      missionTitle: missionTitle || "Our Mission",
      mission: missionContent || "",
      visionTitle: visionTitle || "Our Vision",
      vision: visionContent || "",
      historyTitle: historyTitle || "Our History",
      history: historyContent || "",
      coreValuesTitle: coreValuesTitle || "Our Core Values",
    };

    // Handle core values
    if (req.body.coreValues) {
      const coreValues = [];
      const coreValuesData = req.body.coreValues;
      
      // Convert to array if it's not already
      const valuesArray = Array.isArray(coreValuesData) ? coreValuesData : [coreValuesData];
      
      valuesArray.forEach((value, index) => {
        if (value && value.title && value.description) {
          coreValues.push({
            title: value.title,
            description: value.description,
            icon: value.icon || "fas fa-star",
            color: value.color || "text-primary",
            order: parseInt(value.order) || index + 1,
          });
        }
      });
      
      // Sort by order
      coreValues.sort((a, b) => a.order - b.order);
      updateData.coreValues = coreValues;
    }

    // Handle file upload
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Please upload a valid image file (JPG, PNG, GIF)",
          message: "Invalid file type",
        });
      }
      
      // Delete old image if exists
      const existingAbout = await About.findOne();
      if (existingAbout && existingAbout.image) {
        const oldImagePath = path.join("public", existingAbout.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Find existing about document or create new one
    let about = await About.findOne();
    if (!about) {
      about = new About(updateData);
    } else {
      Object.assign(about, updateData);
    }

    // Save the document
    await about.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: "About content updated successfully",
      image: about.image,
    });
  } catch (error) {
    console.error("Error updating about content:", error);
    res.status(500).json({
      error: "Failed to update about content",
      message: "Please try again later",
    });
  }
};

exports.getAdminVisionMission = async (req, res) => {
  try {
    const about = await About.findOne();
    
    // If no about document exists, create one with default values
    if (!about) {
      const defaultAbout = new About({
        missionTitle: "Our Mission",
        mission: "To provide quality education that empowers students to become responsible, creative, and successful global citizens through innovative teaching methods and holistic development.",
        visionTitle: "Our Vision",
        vision: "To be a leading educational institution that nurtures excellence, innovation, and character development, preparing students to become responsible global citizens who contribute positively to society.",
        historyTitle: "Our History",
        history: "Founded with a vision to provide excellence in education, our school has been shaping young minds for generations.",
        image: "",
      });
      await defaultAbout.save();
      
      return res.render("admin/about/vision-mission", {
        about: defaultAbout,
        missionTitle: defaultAbout.missionTitle,
        missionContent: defaultAbout.mission,
        visionTitle: defaultAbout.visionTitle,
        visionContent: defaultAbout.vision,
        coreValuesTitle: defaultAbout.coreValuesTitle,
        coreValues: defaultAbout.coreValues,
        admin: req.admin,
        title: "Manage Vision & Mission",
      });
    }

    res.render("admin/about/vision-mission", {
      about,
      missionTitle: about.missionTitle,
      missionContent: about.mission,
      visionTitle: about.visionTitle,
      visionContent: about.vision,
      coreValuesTitle: about.coreValuesTitle,
      coreValues: about.coreValues,
      admin: req.admin,
      title: "Manage Vision & Mission",
    });
  } catch (error) {
    console.error("Error fetching vision-mission content for edit:", error);
    res.status(500).send("Error loading vision-mission edit page");
  }
};
