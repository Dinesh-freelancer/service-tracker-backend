const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// All routes protected, Admin and Owner only
router.use(authenticateToken, authorize('Admin', 'Owner'));

router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.addSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;