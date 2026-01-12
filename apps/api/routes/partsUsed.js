const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const partsUsedController = require('../controllers/partsUsedController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];
const WORKER_ALLOWED = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER];

/**
 * @swagger
 * tags:
 *   name: Parts Used
 *   description: Tracking parts usage
 */

/**
 * @swagger
 * /partsused:
 *   get:
 *     summary: List parts used
 *     tags: [Parts Used]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobNumber
 *         schema:
 *           type: string
 *         description: Filter by Job Number
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of parts used
 */
router.get('/',
    authorize(...WORKER_ALLOWED),
    partsUsedController.listPartsUsed);

/**
 * @swagger
 * /partsused/{partUsedId}:
 *   get:
 *     summary: Get part used record by ID
 *     tags: [Parts Used]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partUsedId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Part used details
 *       404:
 *         description: Not found
 */
router.get('/:partUsedId',
    authorize(...WORKER_ALLOWED),
    partsUsedController.getPartUsed);

/**
 * @swagger
 * /partsused:
 *   post:
 *     summary: Record part usage
 *     tags: [Parts Used]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - JobNumber
 *               - PartName
 *               - Qty
 *             properties:
 *               JobNumber:
 *                 type: string
 *               PartName:
 *                 type: string
 *               Unit:
 *                 type: string
 *               Qty:
 *                 type: number
 *               CostPrice:
 *                 type: number
 *               BilledPrice:
 *                 type: number
 *               Supplier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recorded successfully
 */
router.post('/',
    authorize(...WORKER_ALLOWED),
    partsUsedController.createPartUsed);

module.exports = router;