const express = require("express");
const router = express.Router();
const Content = require("../models/content");
const Message = require("../models/message");
const HomeContent = require("../models/HomeContent");
const AcademicProgram = require("../models/AcademicProgram");
const About = require("../models/About");
const Activity = require("../models/Activity");

router.get("/", async (req, res) => {
  try {
    const [content, homeContent, principal] = await Promise.all([
      Content.findOne(),
      HomeContent.findOne(),
      require("../models/Principal").findOne(),
    ]);

    res.render("pages/home", {
      content,
      homeContent,
      principal,
      title: "Home",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading home page");
  }
});

router.get("/about", async (req, res) => {
  try {
    const {
      getTestimonialsForAboutPage,
    } = require("../controllers/testimonialController");
    const [about, testimonials] = await Promise.all([
      About.findOne(),
      getTestimonialsForAboutPage(),
    ]);
    res.render("pages/about", { about, testimonials, title: "About Us" });
  } catch (error) {
    console.error("Error loading about page:", error);
    res.status(500).send("Error loading about page");
  }
});

router.get("/vision-mission", async (req, res) => {
  try {
    const about = await About.findOne();
    res.render("pages/vision-mission", { about, title: "Vision & Mission" });
  } catch (error) {
    console.error("Error loading vision-mission page:", error);
    res.status(500).send("Error loading vision-mission page");
  }
});

router.get("/teachers", async (req, res) => {
  try {
    const Teacher = require("../models/Teacher");
    const teachers = await Teacher.find({ isActive: true });
    res.render("pages/teachers", { teachers, title: "Our Teachers" });
  } catch (error) {
    console.error("Error loading teachers page:", error);
    res.status(500).send("Error loading teachers page");
  }
});

router.get("/academics", async (req, res) => {
  try {
    ////console.log("Fetching academic content...");

    const [programs, academics] = await Promise.all([
      AcademicProgram.find({ isActive: true }).sort({ createdAt: -1 }),
      Content.find({ page: "academics", isActive: true }).sort({ order: 1 }),
    ]);

    res.render("pages/academics", {
      programs,
      academics,
      title: "Academic Programs",
    });
  } catch (error) {
    console.error("Error loading academic content:", error);
    res.status(500).send("Error loading academic programs");
  }
});

router.get("/academics/:id", async (req, res) => {
  try {
    const program = await AcademicProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).send("Activity not found");
    }
    res.render("pages/academic-detail", {
      program,
      title: program.title,
    });
  } catch (error) {
    console.error("Error loading academic:", error);
    res.status(500).send("Error loading activity details");
  }
});

// Add an alias route for /activity/:id
router.get("/activity/:id", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.render("pages/error", {
        title: "Error",
        message: "Invalid activity ID format",
        error: { status: 404 },
      });
    }

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.render("pages/error", {
        title: "Error",
        message: "Activity not found",
        error: { status: 404 },
      });
    }

    res.render("pages/activity-detail", {
      activity,
      title: activity.title,
    });
  } catch (error) {
    console.error("Error loading activity:", error);
    res.render("pages/error", {
      title: "Error",
      message: "Error loading activity details",
      error: { status: 500 },
    });
  }
});

router.get("/contact", async (req, res) => {
  try {
    const Contact = require("../models/Contact");
    const contactInfo = await Contact.findOne();
    res.render("pages/contact", { title: "Contact Us", contactInfo });
  } catch (error) {
    console.error("Error loading contact page:", error);
    res.status(500).send("Error loading contact page");
  }
});

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  await Message.create({ name, email, message });
  res.redirect("/contact");
});

module.exports = router;
