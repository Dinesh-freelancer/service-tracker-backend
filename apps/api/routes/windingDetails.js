const express = require('express');
const router = express.Router();
const windingDetailsController = require('../controllers/windingDetailsController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');

router.use(authenticateToken);

// Winding details are technical, restricted to Staff (Worker, Admin, Owner)
const STAFF_ROLES = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER];

/**
 * @swagger
 * tags:
 *   name: Winding Details
 *   description: Motor winding specifications
 */

/**
 * @swagger
 * /winding/{jobNumber}:
 *   get:
 *     summary: Get winding details for a job
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Winding details object
 */
router.get('/:jobNumber',
    authorize(...STAFF_ROLES),
    windingDetailsController.getWindingDetails);

/**
 * @swagger
 * /winding/{jobNumber}:
 *   post:
 *     summary: Save (Upsert) winding details for a job
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               WireGauge:
 *                 type: string
 *               TurnCount:
 *                 type: integer
 *               CoilWeight:
 *                 type: number
 *               ConnectionType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Saved details
 */
router.post('/:jobNumber',
    authorize(...STAFF_ROLES),
    windingDetailsController.saveWindingDetails);

module.exports = router;
