const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const inventoryAlertController = require('../controllers/inventoryAlertController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

/**
 * @swagger
 * tags:
 *   name: Inventory Alerts
 *   description: Stock alerts
 */

/**
 * @swagger
 * /inventory-alerts/low-stock:
 *   get:
 *     summary: Low stock alerts
 *     tags: [Inventory Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of items below threshold
 */
router.get('/low-stock',
    authorize(...ADMIN_OWNER),
    inventoryAlertController.lowStockAlerts);

/**
 * @swagger
 * /inventory-alerts/out-of-stock:
 *   get:
 *     summary: Out of stock alerts
 *     tags: [Inventory Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of items with 0 stock
 */
router.get('/out-of-stock',
    authorize(...ADMIN_OWNER),
    inventoryAlertController.outOfStockAlerts);

module.exports = router;