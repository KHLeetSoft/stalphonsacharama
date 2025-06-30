const Admission = require("../models/Admission");

const admissionController = {
  // Get all admissions
  getAllAdmissions: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const totalAdmissions = await Admission.countDocuments();
      const totalPages = Math.ceil(totalAdmissions / limit);

      const admissions = await Admission.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.render("admin/admissions/list", { 
        admissions,
        currentPage: page,
        totalPages
      });
    } catch (error) {
      console.error("Error fetching admissions:", error);
      res.status(500).send("Error fetching admissions");
    }
  },

  // Get admission details
  getAdmissionDetails: async (req, res) => {
    try {
      const admission = await Admission.findById(req.params.id);
      if (!admission) {
        return res.status(404).send("Admission not found");
      }
      res.render("admin/admissions/view", { admission });
    } catch (error) {
      console.error("Error fetching admission details:", error);
      res.status(500).send("Error fetching admission details");
    }
  },

  // Get admission creation form
  getCreateForm: (req, res) => {
    res.render("admin/admissions/create");
  },

  // Create new admission
  createAdmission: async (req, res) => {
    try {
      const {
        title,
        description,
        requirements,
        deadline,
        applicationProcess,
        fees,
        status,
      } = req.body;
      const admission = new Admission({
        title,
        description,
        requirements: requirements.filter((req) => req.trim() !== ""),
        deadline: new Date(deadline),
        applicationProcess: JSON.parse(applicationProcess),
        fees: parseFloat(fees),
        status,
      });
      await admission.save();
      res.redirect("/admin/admissions");
    } catch (error) {
      console.error("Error creating admission:", error);
      res.status(500).send("Error creating admission");
    }
  },

  // Get admission edit form
  getEditForm: async (req, res) => {
    try {
      const admission = await Admission.findById(req.params.id);
      if (!admission) {
        return res.status(404).send("Admission not found");
      }
      res.render("admin/admissions/edit", { admission });
    } catch (error) {
      console.error("Error fetching admission:", error);
      res.status(500).send("Error fetching admission");
    }
  },

  // Update admission
  updateAdmission: async (req, res) => {
    try {
      const {
        title,
        description,
        requirements,
        deadline,
        applicationProcess,
        fees,
        status
      } = req.body;

      const admission = await Admission.findById(req.params.id);
      if (!admission) {
        return res.status(404).send("Admission not found");
      }

      // Update admission fields
      admission.title = title;
      admission.description = description;
      admission.requirements = requirements.filter(req => req.trim() !== "");
      admission.deadline = new Date(deadline);
      admission.applicationProcess = JSON.parse(applicationProcess);
      admission.fees = parseFloat(fees);
      admission.status = status;
      admission.updatedAt = Date.now();

      await admission.save();
      res.redirect("/admin/admissions");
    } catch (error) {
      console.error("Error updating admission:", error);
      res.status(500).send("Error updating admission");
    }
  },

  // Delete admission
  deleteAdmission: async (req, res) => {
    try {
      const admission = await Admission.findByIdAndDelete(req.params.id);
      if (!admission) {
        return res.status(404).send("Admission not found");
      }
      res.redirect("/admin/admissions");
    } catch (error) {
      console.error("Error deleting admission:", error);
      res.status(500).send("Error deleting admission");
    }
  },

  // Get public admissions page
  getPublicAdmissions: async (req, res) => {
    try {
      const admissions = await Admission.find({ status: "open" }).sort({
        deadline: 1,
      });
      res.render("pages/admissions", { admissions });
    } catch (error) {
      console.error("Error fetching public admissions:", error);
      res.status(500).send("Error fetching admissions");
    }
  },
};

module.exports = admissionController;
