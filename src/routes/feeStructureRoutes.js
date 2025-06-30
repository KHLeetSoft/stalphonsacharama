const express = require('express');
const router = express.Router();
const feeStructureController = require('../controllers/feeStructureController');
const auth = require('../middleware/auth');

// Admin Fee Structure Routes
router.get('/fee-structures', auth, feeStructureController.getAllFeeStructures);
router.get('/fee-structures/create', auth, feeStructureController.showCreateForm);
router.post('/fee-structures/create', auth, feeStructureController.createFeeStructure);
router.get('/fee-structures/edit/:id', auth, feeStructureController.showEditForm);
router.post('/fee-structures/edit/:id', auth, feeStructureController.updateFeeStructure);
router.post('/fee-structures/delete/:id', auth, feeStructureController.deleteFeeStructure);
router.post('/fee-structures/toggle-active/:id', auth, feeStructureController.toggleActiveStatus);

module.exports = router; 