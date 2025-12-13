const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const workLogController = require('../controllers/workLogController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

/**
 * @swagger
 * tags:
 *   name: WorkLogs
 *   description: Work log management
 */

/**
 * @swagger
 * /worklogs:
 *   get:
 *     summary: List work logs
 *     tags: [WorkLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobNumber
 *         schema:
 *           type: string
 *         description: Filter by Job Number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of work logs
 */
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workLogController.listWorkLogs);

/**
 * @swagger
 * /worklogs/{workLogId}:
 *   get:
 *     summary: Get work log by ID
 *     tags: [WorkLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workLogId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Work log details
 *       404:
 *         description: Work log not found
 */
router.get('/:workLogId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workLogController.getWorkLog);

/**
 * @swagger
 * /worklogs:
 *   post:
 *     summary: Create a new work log
 *     tags: [WorkLogs]
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
 *               - SubStatus
 *               - AssignedWorker
 *             properties:
 *               JobNumber:
 *                 type: string
 *               SubStatus:
 *                 type: string
 *               WorkDescription:
 *                 type: string
 *               AssignedWorker:
 *                 type: integer
 *               StartTime:
 *                 type: string
 *                 format: date-time
 *               EndTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Work log created
 */
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workLogController.createWorkLog);

module.exports = router;