const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const technicianReportController = require('../controllers/technicianReportController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

/**
 * @swagger
 * tags:
 *   name: Technician Reports
 *   description: Worker performance reports
 */

/**
 * @swagger
 * /technician-reports/work-log-summary:
 *   get:
 *     summary: Work log summary per technician
 *     tags: [Technician Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Work log stats
 */
router.get('/work-log-summary',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.workLogSummary);

/**
 * @swagger
 * /technician-reports/attendance-summary:
 *   get:
 *     summary: Attendance summary per technician
 *     tags: [Technician Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Attendance stats
 */
router.get('/attendance-summary',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.attendanceSummary);

/**
 * @swagger
 * /technician-reports/job-completion-rate:
 *   get:
 *     summary: Job completion rate per technician
 *     tags: [Technician Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Completion rates
 */
router.get('/job-completion-rate',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.jobCompletionRate);

module.exports = router;