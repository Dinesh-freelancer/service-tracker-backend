const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const financialReportController = require('../controllers/financialReportController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

/**
 * @swagger
 * tags:
 *   name: Financial Reports
 *   description: Financial summary reports
 */

/**
 * @swagger
 * /financial-reports/all-jobs:
 *   get:
 *     summary: Financial summary for all jobs
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of job financials
 */
router.get('/all-jobs',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.summaryAllJobs);

/**
 * @swagger
 * /financial-reports/customer/{customerId}:
 *   get:
 *     summary: Financial summary for a customer
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Customer financial details
 */
router.get('/customer/:customerId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.summaryByCustomer);

/**
 * @swagger
 * /financial-reports/totals:
 *   get:
 *     summary: Aggregate financial totals
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Financial totals
 */
router.get('/totals',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.financialTotals);

module.exports = router;