const Gallery = require("../models/Gallery");

exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.render("pages/gallery", { images });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).send("Error fetching gallery images");
  }
};

exports.getAdminGallery = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.render("admin/gallery/index", { images });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).send("Error fetching gallery images");
  }
};

exports.createGalleryImage = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const newGalleryImage = new Gallery({
      title,
      description,
      image,
    });

    await newGalleryImage.save();
    res.redirect("/admin/gallery");
  } catch (error) {
    console.error("Error creating gallery image:", error);
    res.status(500).send("Error creating gallery image");
  }
};

exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    const updateData = {
      title,
      description,
      isActive: isActive === "true",
      updatedAt: Date.now(),
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await Gallery.findByIdAndUpdate(id, updateData);
    res.redirect("/admin/gallery");
  } catch (error) {
    console.error("Error updating gallery image:", error);
    res.status(500).send("Error updating gallery image");
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    await Gallery.findByIdAndDelete(id);
    res.redirect("/admin/gallery");
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).send("Error deleting gallery image");
  }
};
