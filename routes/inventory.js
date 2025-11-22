const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const inventoryController = require('../controllers/inventoryController');

// GET /api/inventory
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryController.listInventory);

// GET /api/inventory/:partId
// Users: Admins and Owners
router.get('/:partId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryController.getInventoryItem);

// POST /api/inventory
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryController.createInventoryItem);

module.exports = router;