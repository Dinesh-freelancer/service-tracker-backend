const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const technicianReportController = require('../controllers/technicianReportController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/technician-reports/work-log-summary
// Users: Admins and Owners
router.get('/work-log-summary',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.workLogSummary);

// GET /api/technician-reports/attendance-summary
// Users: Admins and Owners
router.get('/attendance-summary',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.attendanceSummary);

// GET /api/technician-reports/job-completion-rate
// Users: Admins and Owners
router.get('/job-completion-rate',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    technicianReportController.jobCompletionRate);

module.exports = router;