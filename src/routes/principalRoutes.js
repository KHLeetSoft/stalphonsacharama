const express = require('express');
const router = express.Router();
const Principal = require('../models/Principal');
const { getTestimonialsForAboutPage } = require('../controllers/testimonialController');

// Public route for Principal's Message page
router.get('/principal-message', async (req, res) => {
  try {
    const [principal, testimonials] = await Promise.all([
      Principal.findOne(),
      getTestimonialsForAboutPage()
    ]);
    res.render('pages/principal-message', {
      principal,
      testimonials,
      title: "Principal's Message"
    });
  } catch (error) {
    console.error('Error loading principal message page:', error);
    res.status(500).render('pages/principal-message', {
      principal: null,
      testimonials: [],
      title: "Principal's Message"
    });
  }
});

module.exports = router;
