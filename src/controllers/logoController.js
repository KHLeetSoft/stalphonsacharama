const Logo = require("../models/Logo");
const path = require("path");
const fs = require("fs");

exports.getLogo = async (req, res) => {
  try {
    const logo = await Logo.findOne();
    res.render("admin/logo/manage", { logo });
  } catch (error) {
    res
      .status(500)
      .render("admin/logo/manage", { logo: null, error: error.message });
  }
};

exports.updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .render("admin/logo/manage", { logo: null, error: "No file uploaded" });
    }

    const logoUrl = `/uploads/logo-${req.file.filename}`;
    // Ensure the file is saved in the public/uploads directory
    const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const oldPath = req.file.path;
    const newPath = path.join(uploadDir, `logo-${req.file.filename}`);
    fs.renameSync(oldPath, newPath);
    let logo = await Logo.findOne();

    if (logo) {
      // Delete old logo file if it exists
      if (logo.logoUrl) {
        const oldLogoPath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          logo.logoUrl.replace(/^\//, "")
        );
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      logo.logoUrl = logoUrl;
      logo.updatedAt = new Date();
      await logo.save();
    } else {
      logo = new Logo({
        logoUrl,
        updatedAt: new Date(),
      });
      await logo.save();
    }

    res.redirect("/admin/logo");
  } catch (error) {
    res
      .status(500)
      .render("admin/logo/manage", { logo: null, error: error.message });
  }
};
