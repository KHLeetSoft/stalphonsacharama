const express = require("express");
const app = express();
const mainRoutes = require("../routes/mainRoutes");
const homeContentRoutes = require("../routes/homeContentRoutes");

// Basic configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", "src/views");

// Routes
app.use("/", mainRoutes);
app.use("/api/home-content", homeContentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
