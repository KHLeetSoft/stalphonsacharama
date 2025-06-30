const express = require("express");
const router = express.Router();
const Academic = require("../models/Academic");

// Public Academics Page
router.get("/academics", async (req, res) => {
  try {
    const academic = await Academic.findOne();
    res.render("index", {
      title: academic?.title || "Our Academics",
      description: academic?.description || "",
      image: academic?.image || "",
      programs: academic?.programs || []
    });
  } catch (error) {
    console.error("Error loading academics content:", error);
    res.status(500).render("index", {
      title: "Our Academics",
      description: "",
      image: "",
      programs: []
    });
  }
});

module.exports = router; 