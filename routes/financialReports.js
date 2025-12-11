const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const financialReportController = require('../controllers/financialReportController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/financial-reports/all-jobs
// Users: Admins and Owners
router.get('/all-jobs',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.summaryAllJobs);

// GET /api/financial-reports/customer/:customerId
// Users: Admins and Owners
router.get('/customer/:customerId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.summaryByCustomer);

// GET /api/financial-reports/totals
// Users: Admins and Owners
router.get('/totals',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.financialTotals);

module.exports = router;