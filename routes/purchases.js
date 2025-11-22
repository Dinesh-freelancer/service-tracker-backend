const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// All routes protected and accessible by Admin & Owner only
router.use(authenticateToken, authorize('Admin', 'Owner'));

router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);

module.exports = router;