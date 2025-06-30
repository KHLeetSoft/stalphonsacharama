const Testimonial = require("../models/Testimonial");
const path = require("path");
const fs = require("fs");

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.render("admin/about/testimonials", { testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).send("Error loading testimonials");
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const { message, personName, designation, highlightedWords } = req.body;
    const testimonialData = {
      message,
      personName,
      designation,
      highlightedWords: highlightedWords.split(",").map((word) => word.trim()),
    };

    if (req.file) {
      testimonialData.image = `/uploads/${req.file.filename}`;
    }

    await Testimonial.create(testimonialData);
    res.redirect("/admin/about/testimonials");
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).send("Error creating testimonial");
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, personName, designation, highlightedWords } = req.body;
    const updateData = {
      message,
      personName,
      designation,
      highlightedWords: highlightedWords.split(",").map((word) => word.trim()),
    };

    if (req.file) {
      const testimonial = await Testimonial.findById(id);
      if (testimonial && testimonial.image) {
        const oldImagePath = path.join("public", testimonial.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await Testimonial.findByIdAndUpdate(id, updateData);
    res.redirect("/admin/about/testimonials");
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).send("Error updating testimonial");
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (testimonial && testimonial.image) {
      const imagePath = path.join("public", testimonial.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Testimonial.findByIdAndDelete(id);
    res.redirect("/admin/about/testimonials");
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).send("Error deleting testimonial");
  }
};

exports.getTestimonialsForAboutPage = async () => {
  try {
    return await Testimonial.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching testimonials for about page:", error);
    return [];
  }
};
