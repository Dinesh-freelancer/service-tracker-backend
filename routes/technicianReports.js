const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const technicianReportController = require('../controllers/technicianReportController');

// GET /api/technician-reports/work-log-summary
// Users: Admins and Owners
router.get('/work-log-summary',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.workLogSummary);

// GET /api/technician-reports/attendance-summary
// Users: Admins and Owners
router.get('/attendance-summary',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.attendanceSummary);

// GET /api/technician-reports/job-completion-rate
// Users: Admins and Owners
router.get('/job-completion-rate',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.jobCompletionRate);

module.exports = router;