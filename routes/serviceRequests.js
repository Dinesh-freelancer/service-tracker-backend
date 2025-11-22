const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const serviceRequestController = require('../controllers/serviceRequestController');

// GET /api/servicerequests
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.listServiceRequests);

// GET /api/servicerequests/:jobNumber
// Users: Admins and Owners
router.get('/:jobNumber',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.getServiceRequest);

// POST /api/servicerequests
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    serviceRequestController.createServiceRequest);

module.exports = router;