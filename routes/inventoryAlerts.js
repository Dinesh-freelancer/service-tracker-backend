const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const inventoryAlertController = require('../controllers/inventoryAlertController');

// GET /api/inventory-alerts/low-stock
// Users: Admins and Owners
router.get('/low-stock',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryAlertController.lowStockAlerts);

// GET /api/inventory-alerts/out-of-stock
// Users: Admins and Owners
router.get('/out-of-stock',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryAlertController.outOfStockAlerts);

module.exports = router;