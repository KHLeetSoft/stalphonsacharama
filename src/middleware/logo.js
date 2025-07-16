const Logo = require('../models/Logo');

// Middleware to set res.locals.logoUrl for all views
module.exports = async (req, res, next) => {
  try {
    const logoDoc = await Logo.findOne();
    res.locals.logoUrl = logoDoc ? logoDoc.logoUrl : '/logo.png';
  } catch (err) {
    res.locals.logoUrl = '/logo.png';
  }
  next();
}; 