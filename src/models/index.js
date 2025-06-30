const mongoose = require('mongoose');

// Logo Schema
const logoSchema = new mongoose.Schema({
    logoUrl: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Register models
const Logo = mongoose.models.Logo || mongoose.model('Logo', logoSchema);

module.exports = {
    Logo
}; 