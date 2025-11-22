const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const workLogController = require('../controllers/workLogController');

// GET /api/worklogs?jobNumber=...
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workLogController.listWorkLogs);
// Users: Admins and Owners

// GET /api/worklogs/:workLogId
// Users: Admins and Owners
router.get('/:workLogId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workLogController.getWorkLog);

// POST /api/worklogs
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workLogController.createWorkLog);

module.exports = router;