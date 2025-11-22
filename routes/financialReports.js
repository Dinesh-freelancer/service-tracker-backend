const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const financialReportController = require('../controllers/financialReportController');

// GET /api/financial-reports/all-jobs
// Users: Admins and Owners
router.get('/all-jobs',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.summaryAllJobs);

// GET /api/financial-reports/customer/:customerId
// Users: Admins and Owners
router.get('/customer/:customerId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.summaryByCustomer);

// GET /api/financial-reports/totals
// Users: Admins and Owners
router.get('/totals',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    financialReportController.financialTotals);

module.exports = router;