const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const summaryReportController = require('../controllers/summaryReportController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

/**
 * @swagger
 * tags:
 *   name: Summary Reports
 *   description: Aggregated summaries
 */

/**
 * @swagger
 * /summary-reports/daily:
 *   get:
 *     summary: Daily summary
 *     tags: [Summary Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Daily stats
 */
router.get('/daily',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    summaryReportController.dailySummary);

/**
 * @swagger
 * /summary-reports/weekly:
 *   get:
 *     summary: Weekly summary
 *     tags: [Summary Reports]
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
 *         description: Weekly stats
 */
router.get('/weekly',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    summaryReportController.weeklySummary);

/**
 * @swagger
 * /summary-reports/monthly:
 *   get:
 *     summary: Monthly summary
 *     tags: [Summary Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: yearMonth
 *         required: true
 *         schema:
 *           type: string
 *           example: 2023-11
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Monthly stats
 */
router.get('/monthly',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    summaryReportController.monthlySummary);

module.exports = router;