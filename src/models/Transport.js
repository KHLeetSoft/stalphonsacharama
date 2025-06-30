const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  vehicleImage: String, // URL or path to the image
  rules: String,
  time: String,
  driverName: String,
  driverPhone: String,
  route: String,
}, {
  timestamps: true
});

module.exports = mongoose.model("Transport", transportSchema);
