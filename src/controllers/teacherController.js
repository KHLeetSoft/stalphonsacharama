const Teacher = require("../models/Teacher");
const upload = require("../middleware/fileUpload");

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true });
    res.render("pages/teachers", { teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).send("Error fetching teachers");
  }
};

exports.getAdminTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.render("admin/teachers/index", { teachers, title: "Manage Teachers" });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).send("Error fetching teachers");
  }
};

exports.getAddTeacher = (req, res) => {
  res.render("admin/teachers/add", { title: "Add New Teacher" });
};

exports.addTeacher = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.fileValidationError) {
        return res.status(400).render("admin/teachers/add", {
          title: "Add New Teacher",
          error: req.fileValidationError,
          formData: req.body,
        });
      }

      const teacherData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        experience: req.body.experience,
        qualification: req.body.qualification,
        specialization: req.body.specialization,
        bio: req.body.bio,
        achievements: req.body.achievements
          ? req.body.achievements
              .split("\n")
              .filter((achievement) => achievement.trim())
          : [],
        image: req.file ? `/uploads/${req.file.filename}` : "",
      };

      const existingTeacher = await Teacher.findOne({
        email: teacherData.email,
      });
      if (existingTeacher) {
        return res.status(400).render("admin/teachers/add", {
          title: "Add New Teacher",
          error: "A teacher with this email already exists",
          formData: req.body,
        });
      }

      const teacher = new Teacher(teacherData);
      await teacher.save();
      res.redirect("/admin/teachers");
    } catch (error) {
      console.error("Error adding teacher:", error);
      if (error.name === "ValidationError") {
        return res.status(400).render("admin/teachers/add", {
          title: "Add New Teacher",
          error: error.message,
          formData: req.body,
        });
      }
      res.status(500).send("Error adding teacher");
    }
  },
];

exports.getEditTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).send("Teacher not found");
    }
    res.render("admin/teachers/edit", { teacher, title: "Edit Teacher" });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).send("Error fetching teacher");
  }
};

exports.updateTeacher = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.fileValidationError) {
        const teacher = await Teacher.findById(req.params.id);
        return res.status(400).render("admin/teachers/edit", {
          title: "Edit Teacher",
          error: req.fileValidationError,
          teacher: { ...teacher.toObject(), ...req.body },
        });
      }

      const teacherData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        experience: req.body.experience,
        qualification: req.body.qualification,
        specialization: req.body.specialization,
        bio: req.body.bio,
        achievements: req.body.achievements
          ? req.body.achievements
              .split("\n")
              .filter((achievement) => achievement.trim())
          : [],
      };

      if (req.file) {
        teacherData.image = `/uploads/${req.file.filename}`;
      }

      const existingTeacher = await Teacher.findOne({
        email: teacherData.email,
        _id: { $ne: req.params.id },
      });

      if (existingTeacher) {
        const teacher = await Teacher.findById(req.params.id);
        return res.status(400).render("admin/teachers/edit", {
          title: "Edit Teacher",
          error: "A teacher with this email already exists",
          teacher: { ...teacher.toObject(), ...req.body },
        });
      }

      const teacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        teacherData,
        { new: true, runValidators: true }
      );

      if (!teacher) {
        return res.status(404).send("Teacher not found");
      }

      res.redirect("/admin/teachers");
    } catch (error) {
      console.error("Error updating teacher:", error);
      if (error.name === "ValidationError") {
        const teacher = await Teacher.findById(req.params.id);
        return res.status(400).render("admin/teachers/edit", {
          title: "Edit Teacher",
          error: error.message,
          teacher: { ...teacher.toObject(), ...req.body },
        });
      }
      res.status(500).send("Error updating teacher");
    }
  },
];

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).send("Teacher not found");
    }
    res.redirect("/admin/teachers");
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).send("Error deleting teacher");
  }
};
