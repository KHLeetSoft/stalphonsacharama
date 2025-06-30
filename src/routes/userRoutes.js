const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().populate("createdBy", "username");
    res.render("admin/users/list", {
      users,
      admin: req.admin,
      title: "Manage Users",
    });
  } catch (error) {
    console.error("Error loading users:", error);
    res.status(500).render("admin/users/list", {
      users: [],
      admin: req.admin,
      title: "Manage Users",
      error: "Error loading users",
    });
  }
});

// Render add user form
router.get("/users/add", auth, (req, res) => {
  res.render("admin/users/add", {
    admin: req.admin,
    title: "Add New User",
  });
});

// Add new user
router.post("/users/add", auth, async (req, res) => {
  try {
    const { username, password, email, name, role } = req.body;

    if (!username || !password || !email || !name || !role) {
      return res.status(400).render("admin/users/add", {
        admin: req.admin,
        title: "Add New User",
        error: "All fields are required",
        formData: req.body,
      });
    }

    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return res.status(400).render("admin/users/add", {
        admin: req.admin,
        title: "Add New User",
        error: "Username or email already exists",
        formData: req.body,
      });
    }

    const user = new User({
      username,
      password,
      email,
      name,
      role,
      createdBy: req.admin._id,
    });

    await user.save();
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).render("admin/users/add", {
      admin: req.admin,
      title: "Add New User",
      error: "Error adding user",
      formData: req.body,
    });
  }
});

// Render edit user form
router.get("/users/edit/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).redirect("/admin/users");
    }

    res.render("admin/users/edit", {
      user,
      admin: req.admin,
      title: "Edit User",
    });
  } catch (error) {
    console.error("Error loading user:", error);
    res.status(500).redirect("/admin/users");
  }
});

// Update user
router.post("/users/edit/:id", auth, async (req, res) => {
  try {
    const { email, name, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).redirect("/admin/users");
    }

    user.email = email;
    user.name = name;
    user.role = role;
    user.isActive = !!isActive;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).render("admin/users/edit", {
      user: { ...req.body, _id: req.params.id },
      admin: req.admin,
      title: "Edit User",
      error: "Error updating user",
    });
  }
});

// Delete user
router.post("/users/delete/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.remove();
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;
