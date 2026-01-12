const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const { validateAsset } = require('../middleware/validationMiddleware');
const { AUTH_ROLE_ADMIN, AUTH_ROLE_WORKER, AUTH_ROLE_CUSTOMER, AUTH_ROLE_OWNER } = require('../utils/constants');

// Apply global middleware for this router
router.use(authenticateToken);
router.use(sensitiveInfoToggle);

// Shared roles
const ALL_ROLES = [AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER, AUTH_ROLE_WORKER, AUTH_ROLE_CUSTOMER];
const STAFF_ROLES = [AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER, AUTH_ROLE_WORKER];

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Asset management
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Get assets (optionally filtered by customer)
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by Customer ID
 *     responses:
 *       200:
 *         description: List of assets
 */
router.get('/', authorize(...ALL_ROLES), assetController.listAssets);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get asset details
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asset details
 */
router.get('/:id', authorize(...ALL_ROLES), assetController.getAsset);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Create a new asset
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [CustomerId, PumpBrand, PumpModel]
 *             properties:
 *               CustomerId:
 *                 type: integer
 *               PumpBrand:
 *                 type: string
 *               PumpModel:
 *                 type: string
 *               MotorBrand:
 *                 type: string
 *               MotorModel:
 *                 type: string
 *               SerialNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset created
 */
router.post('/', authorize(...STAFF_ROLES), validateAsset, assetController.createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Update an asset
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Asset updated
 */
router.put('/:id', authorize(...STAFF_ROLES), assetController.updateAsset);

module.exports = router;
