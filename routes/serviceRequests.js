const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const serviceRequestController = require('../controllers/serviceRequestController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const { validateRequest, createServiceRequestValidators } = require('../middleware/validationMiddleware');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Service Request management
 */

/**
 * @swagger
 * /servicerequests:
 *   get:
 *     summary: List service requests
 *     tags: [Jobs]
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
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.listServiceRequests);

/**
 * @swagger
 * /servicerequests/{jobNumber}:
 *   get:
 *     summary: Get job by number
 *     tags: [Jobs]
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
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:jobNumber',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.getServiceRequest);

/**
 * @swagger
 * /servicerequests:
 *   post:
 *     summary: Create a new service request
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CustomerId
 *               - PumpsetBrand
 *               - DateReceived
 *             properties:
 *               CustomerId:
 *                 type: integer
 *               PumpsetBrand:
 *                 type: string
 *               PumpsetModel:
 *                 type: string
 *               DateReceived:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created
 */
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    createServiceRequestValidators,
    validateRequest,
    serviceRequestController.createServiceRequest);

module.exports = router;