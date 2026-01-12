const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const OWNER_ONLY = [constants.AUTH_ROLE_OWNER];

// All routes protected and accessible by Owner only
router.use(authorize(...OWNER_ONLY));

/**
 * @swagger
 * tags:
 *   name: Purchases
 *   description: Purchase management
 */

/**
 * @swagger
 * /purchases:
 *   get:
 *     summary: List purchases
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of purchases
 */
router.get('/', purchaseController.getAllPurchases);

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     summary: Get purchase by ID
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Purchase details
 *       404:
 *         description: Not found
 */
router.get('/:id', purchaseController.getPurchaseById);

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Create purchase
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchase
 *               - items
 *             properties:
 *               purchase:
 *                 type: object
 *                 properties:
 *                   SupplierId:
 *                     type: integer
 *                   PurchaseDate:
 *                     type: string
 *                     format: date-time
 *                   Notes:
 *                     type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     PartId:
 *                       type: integer
 *                     Qty:
 *                       type: number
 *                     UnitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Purchase created
 */
router.post('/', purchaseController.createPurchase);

module.exports = router;