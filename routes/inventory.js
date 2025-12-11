const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const inventoryController = require('../controllers/inventoryController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/inventory
// Users: Admins and Owners
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryController.listInventory);

// GET /api/inventory/:partId
// Users: Admins and Owners
router.get('/:partId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryController.getInventoryItem);

// POST /api/inventory
// Users: Admins and Owners
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    inventoryController.createInventoryItem);

module.exports = router;