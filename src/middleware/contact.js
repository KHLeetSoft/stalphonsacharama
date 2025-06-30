const Contact = require("../models/Contact");

const contactMiddleware = async (req, res, next) => {
  try {
    const contactInfo = await Contact.findOne();
    res.locals.contactInfo = contactInfo;
    next();
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.locals.contactInfo = null;
    next();
  }
};

module.exports = contactMiddleware;
