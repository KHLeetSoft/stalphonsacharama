const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
  },
  latitude: {
    type: Number,
    default: 0,
  },
  longitude: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
  },
  Transport: {
    type: String,
  },
  Reception: {
    type: String,
  },
  Accounts: {
    type: String,
  },
  email: {
    type: String,
  },
  formSubmissions: [
    {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      subject: {
        type: String,
      },
      message: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Contact", contactSchema);
