const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const workerController = require('../controllers/workerController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
/**
 * @swagger
 * tags:
 *   name: Workers
 *   description: Worker/Technician management
 */

/**
 * @swagger
 * /workers:
 *   get:
 *     summary: List workers
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of workers
 */
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.listWorkers);

/**
 * @swagger
 * /workers/{workerId}:
 *   get:
 *     summary: Get worker by ID
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Worker details
 *       404:
 *         description: Not found
 */
router.get('/:workerId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.getWorker);

/**
 * @swagger
 * /workers:
 *   post:
 *     summary: Create new worker
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - WorkerName
 *               - MobileNumber
 *             properties:
 *               WorkerName:
 *                 type: string
 *               MobileNumber:
 *                 type: string
 *               AlternateNumber:
 *                 type: string
 *               WhatsappNumber:
 *                 type: string
 *               Address:
 *                 type: string
 *               Skills:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.createWorker);

module.exports = router;