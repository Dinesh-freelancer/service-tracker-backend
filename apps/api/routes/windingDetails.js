const express = require('express');
const router = express.Router();
const controller = require('../controllers/windingDetailsController');
const constants = require('../utils/constants');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

/**
 * @swagger
 * tags:
 *   name: Winding Details
 *   description: Winding specifications
 */

/**
 * @swagger
 * /winding-details:
 *   get:
 *     summary: List all winding details
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of winding details
 */
router.get('/', authenticateToken, controller.getAllWindingDetails);

/**
 * @swagger
 * /winding-details/job/{jobNumber}:
 *   get:
 *     summary: Get winding details by job number
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobNumber
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Winding details list
 */
router.get('/job/:jobNumber', authenticateToken, controller.getByJobNumber);

/**
 * @swagger
 * /winding-details:
 *   post:
 *     summary: Create winding details
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobNumber
 *               - hp
 *               - phase
 *             properties:
 *               jobNumber:
 *                 type: string
 *               hp:
 *                 type: number
 *               kw:
 *                 type: number
 *               phase:
 *                 type: string
 *                 enum: [1-PHASE, 3-PHASE]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authorize(...ADMIN_OWNER), controller.createWindingDetail);

/**
 * @swagger
 * /winding-details/{id}:
 *   put:
 *     summary: Update winding details
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', authorize(...ADMIN_OWNER), controller.updateWindingDetail);

/**
 * @swagger
 * /winding-details/{id}:
 *   delete:
 *     summary: Delete winding details
 *     tags: [Winding Details]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', authorize(...ADMIN_OWNER), controller.deleteWindingDetail);

module.exports = router;