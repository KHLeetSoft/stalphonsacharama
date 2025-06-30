const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["super_admin", "admin", "editor"],
    default: "admin",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Hash password before saving
adminSchema.pre("save", async function (next) {
  const admin = this;
  if (admin.isModified("password")) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});
JWT_SECRET="STALPHONSACHARAMAAAAAAA"
// Generate auth token
adminSchema.methods.generateAuthToken = async function () {
  const admin = this;
  const token = jwt.sign({ _id: admin._id.toString() }, JWT_SECRET);
  admin.tokens = admin.tokens.concat({ token });
  await admin.save();
  return token;
};

// Find admin by credentials
adminSchema.statics.findByCredentials = async function (username, password) {
  const admin = await this.findOne({ username });
  if (!admin) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return admin;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
