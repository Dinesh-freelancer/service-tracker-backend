const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const serviceRequestController = require('../controllers/serviceRequestController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const { validateRequest, createServiceRequestValidators } = require('../middleware/validationMiddleware');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/servicerequests
// Users: Admins and Owners
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.listServiceRequests);

// GET /api/servicerequests/:jobNumber
// Users: Admins and Owners
router.get('/:jobNumber',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.getServiceRequest);

// POST /api/servicerequests
// Users: Admins and Owners
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    createServiceRequestValidators,
    validateRequest,
    serviceRequestController.createServiceRequest);

module.exports = router;