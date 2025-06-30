const express = require("express");
const router = express.Router();
const mainRouter = require("./main");
const Transport = require("../models/Transport");
const facilityRoutes = require('./facilityRoutes');
const bookListController = require('../controllers/bookListController');
const feeStructureController = require('../controllers/feeStructureController');

// Include main routes (including home page and academics)
router.use("/", mainRouter);

// Include admin routes
router.use("/admin", require("./adminRoutes"));
router.use("/admin", require("./userRoutes"));

// Public Book List Routes
router.get("/book-lists", bookListController.getPublicBookLists);
router.get("/book-lists/:class", bookListController.getBooksByClass);

// Public Fee Structure Routes
router.get("/fee-structure", feeStructureController.getPublicFeeStructures);
router.get("/fee-structure/:class", feeStructureController.getFeeStructureByClass);

// Home page route
router.get("/", async (req, res) => {
  try {
    const Contact = require("../models/Contact");
    const contact = await Contact.findOne();
    res.render("pages/home", {
      // ...other data
      transport: contact?.Transport || "",
    });
  } catch (error) {
    res.status(500).render("pages/home", {
      transport: "",
      error: "Failed to load transport info."
    });
  }
});

// Public Transport Page
router.get("/transport", async (req, res) => {
  try {
    const transports = await Transport.find();
    res.render("pages/transport", { transports });
  } catch (error) {
    res.status(500).render("pages/transport", { transports: [], error: "Failed to load transport info." });
  }
});

router.use(facilityRoutes);

module.exports = router;
