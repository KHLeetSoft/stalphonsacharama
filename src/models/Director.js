const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Director'
  },
  message: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Director', directorSchema); 