const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const summaryReportController = require('../controllers/summaryReportController');

// GET /api/summary-reports/daily?date=YYYY-MM-DD
// Users: Admins and Owners
router.get('/daily',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    summaryReportController.dailySummary);

// GET /api/summary-reports/weekly?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Users: Admins and Owners
router.get('/weekly',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    summaryReportController.weeklySummary);

// GET /api/summary-reports/monthly?yearMonth=YYYY-MM
// Users: Admins and Owners
router.get('/monthly',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    summaryReportController.monthlySummary);

module.exports = router;