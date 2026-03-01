const express = require('express');
const router = express.Router();
const windingDetailsController = require('../controllers/windingDetailsController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');

router.use(authenticateToken);

// Winding details are technical, restricted to Staff
const STAFF_ROLES = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER];

/**
 * @swagger
 * tags:
 *   name: Winding Details
 *   description: Motor winding specifications
 */

/**
 * @swagger
 * /winding-details/asset/{assetId}:
 *   get:
 *     summary: Get winding details for an asset
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Winding details object
 */
router.get('/asset/:assetId',
    authorize(...STAFF_ROLES),
    windingDetailsController.getWindingDetails);

/**
 * @swagger
 * /winding-details/asset/{assetId}:
 *   post:
 *     summary: Save (Upsert) winding details for an asset
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hp:
 *                 type: number
 *               phase:
 *                 type: string
 *     responses:
 *       200:
 *         description: Saved details
 */
router.post('/asset/:assetId',
    authorize(...STAFF_ROLES),
    windingDetailsController.saveWindingDetails);

module.exports = router;
