const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

JWT_SECRET="STALPHONSACHARAMAAAAAAA"
const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.redirect("/admin/login");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findOne({
      _id: decoded._id,
      "tokens.token": token,
      isActive: true
    });

    if (!admin) {
      return res.redirect("/admin/login");
    }

    // Update last login time
    admin.lastLogin = new Date();
    await admin.save();

    req.token = token;
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.redirect("/admin/login");
  }
};

module.exports = auth;
