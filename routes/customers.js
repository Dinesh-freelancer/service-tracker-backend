const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const constants = require('../utils/constants');
const customerController = require('../controllers/customerController');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/customers
// Users: Admins and Owners
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    customerController.listCustomers);

// GET /api/customers/:id
// Users: Admins and Owners
router.get('/:id',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    customerController.getCustomer);

// POST /api/customers
// Users: Admins and Owners
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    customerController.createCustomer);

module.exports = router;