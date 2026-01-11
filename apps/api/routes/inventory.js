const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const inventoryController = require('../controllers/inventoryController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];
const WORKER_ALLOWED = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER];

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: List all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by Part Name
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get('/',
    authorize(...WORKER_ALLOWED),
    inventoryController.listInventory);

/**
 * @swagger
 * /inventory/{partId}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Inventory item details
 *       404:
 *         description: Item not found
 */
router.get('/:partId',
    authorize(...WORKER_ALLOWED),
    inventoryController.getInventoryItem);

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Add new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - PartName
 *               - Unit
 *             properties:
 *               PartName:
 *                 type: string
 *               Unit:
 *                 type: string
 *                 enum: [Nos, Kg, Ltr, Meter, Pair]
 *               QuantityInStock:
 *                 type: number
 *               LowStockThreshold:
 *                 type: number
 *               DefaultCostPrice:
 *                 type: number
 *               DefaultSellingPrice:
 *                 type: number
 *               Supplier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 */
router.post('/',
    authorize(...ADMIN_OWNER),
    inventoryController.createInventoryItem);

module.exports = router;