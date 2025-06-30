const AcademicProgram = require("../models/AcademicProgram");

const academicProgramController = {
  // Get all academic programs
  getAllPrograms: async (req, res) => {
    try {
      const programs = await AcademicProgram.find().sort({ createdAt: -1 });
      res.render("admin/programs/index", {
        programs,
        title: "Academic Programs",
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching academic programs" });
    }
  },

  // Get program creation form
  getCreateForm: (req, res) => {
    res.render("admin/programs/create", { title: "Create Academic Program" });
  },

  // Create new program
  createProgram: async (req, res) => {
    try {
      const programData = {
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        level: req.body.level,
        requirements: req.body.requirements,
        curriculum: req.body.curriculum,
      };

      if (req.file) {
        programData.image = "/uploads/" + req.file.filename;
      }

      await AcademicProgram.create(programData);
      res.redirect("/admin/programs");
    } catch (error) {
      res.status(500).json({ error: "Error creating academic program" });
    }
  },

  // Get program edit form
  getEditForm: async (req, res) => {
    try {
      const program = await AcademicProgram.findById(req.params.id);
      res.render("admin/programs/edit", {
        program,
        title: "Edit Academic Program",
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching program details" });
    }
  },

  // Update program
  updateProgram: async (req, res) => {
    try {
      const updateData = {
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        level: req.body.level,
        requirements: req.body.requirements,
        curriculum: req.body.curriculum,
        updatedAt: Date.now(),
      };

      if (req.file) {
        updateData.image = "/uploads/" + req.file.filename;
      }

      await AcademicProgram.findByIdAndUpdate(req.params.id, updateData);
      res.redirect("/admin/programs");
    } catch (error) {
      res.status(500).json({ error: "Error updating academic program" });
    }
  },

  // Delete program
  deleteProgram: async (req, res) => {
    try {
      await AcademicProgram.findByIdAndDelete(req.params.id);
      res.redirect("/admin/programs");
    } catch (error) {
      res.status(500).json({ error: "Error deleting academic program" });
    }
  },

  // Toggle program status
  toggleStatus: async (req, res) => {
    try {
      const program = await AcademicProgram.findById(req.params.id);
      program.isActive = !program.isActive;
      await program.save();
      res.redirect("/admin/programs");
    } catch (error) {
      res.status(500).json({ error: "Error toggling program status" });
    }
  },
};

module.exports = academicProgramController;
