const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const reportController = require('../controllers/reportController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Operational reports
 */

/**
 * @swagger
 * /reports/job-status-summary:
 *   get:
 *     summary: Job status summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Optional end date
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Counts by status
 */
router.get('/job-status-summary',
    authorize(...ADMIN_OWNER),
    reportController.jobStatusSummary);

/**
 * @swagger
 * /reports/job-status-summary-by-date:
 *   get:
 *     summary: Job status summary filtered by date (Legacy)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Counts by status
 */
router.get('/job-status-summary-by-date',
    authorize(...ADMIN_OWNER),
    reportController.jobStatusSummaryByDate);

module.exports = router;
