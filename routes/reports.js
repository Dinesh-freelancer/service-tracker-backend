const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const reportController = require('../controllers/reportController');

// GET /api/reports/job-status-summary
// Users: Admins and Owners
router.get('/job-status-summary',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    reportController.jobStatusSummary);

// GET /api/reports/job-status-summary-by-date?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Users: Admins and Owners
router.get('/job-status-summary-by-date',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    reportController.jobStatusSummaryByDate);

module.exports = router;