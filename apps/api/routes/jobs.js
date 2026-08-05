const failureReasonController = require('../controllers/failureReasonController');
const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const serviceRequestController = require('../controllers/serviceRequestController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const { validateRequest, createServiceRequestValidators } = require('../middleware/validationMiddleware');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

// Roles
const ALL_ROLES = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER, constants.AUTH_ROLE_CUSTOMER];
const STAFF_ROLES = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER];

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Service Request management
 */

/**
 * @swagger
 * /jobs:
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
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', authorize(...ALL_ROLES), serviceRequestController.listServiceRequests);

/**
 * @swagger
 * /jobs/next-job-number:
 *   get:
 *     summary: Get next auto-generated job number
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Next job number
 */
router.get('/next-job-number', authorize(...STAFF_ROLES), serviceRequestController.getNextJobNumber);

router.get('/failure-reasons', authorize(...ALL_ROLES), failureReasonController.getFailureReasons);

/**
 * @swagger
 * /jobs/{jobNumber}:
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
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:jobNumber', authorize(...ALL_ROLES), serviceRequestController.getServiceRequest);

/**
 * @swagger
 * /jobs:
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
 *               - DateReceived
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
 *               DateReceived:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created
 */
router.post('/', authorize(...STAFF_ROLES), createServiceRequestValidators, validateRequest, serviceRequestController.createServiceRequest);

/**
 * @swagger
 * /jobs/{jobNumber}:
 *   put:
 *     summary: Update a service request
 *     tags: [Jobs]
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
 *               BilledAmount:
 *                 type: number
 *               PaymentStatus:
 *                 type: string
 *               Status:
 *                 type: string
 *               Notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated
 */
router.put('/:jobNumber', authorize(...ALL_ROLES), serviceRequestController.updateServiceRequest);

module.exports = router;
