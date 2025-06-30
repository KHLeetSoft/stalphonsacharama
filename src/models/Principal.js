const mongoose = require("mongoose");

const principalSchema = new mongoose.Schema({
  name: String,
  title: String,
  message: String,
  imageUrl: String,
});

module.exports = mongoose.model("Principal", principalSchema);
