module.exports = (req, res, next) => {
  // Make admin object available to all views
  res.locals.admin = req.admin || null;
  next();
};
