const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const constants = require('../utils/constants');
const auditController = require('../controllers/auditController');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/audit?jobNumber=...
// Users: Admins and Owners
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    auditController.listAudits);

// POST /api/audit
// Users: Admins and Owners
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    auditController.createAudit);

module.exports = router;