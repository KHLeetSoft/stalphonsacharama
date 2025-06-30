const Principal = require("../models/Principal");
const fileUpload = require("../middleware/fileUpload");

exports.getPrincipal = async (req, res) => {
  try {
    const principal = await Principal.findOne();
    res.json(principal || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePrincipal = async (req, res) => {
  try {
    let principal = await Principal.findOne();

    if (!principal) {
      principal = new Principal();
    }

    if (req.file) {
      principal.imageUrl = "/uploads/" + req.file.filename;
    }

    if (req.body.name) principal.name = req.body.name;
    if (req.body.title) principal.title = req.body.title;
    if (req.body.message) principal.message = req.body.message;

    await principal.save();
    res.json(principal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
