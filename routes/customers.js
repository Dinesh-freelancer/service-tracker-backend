const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const customerController = require('../controllers/customerController');

// GET /api/customers
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    customerController.listCustomers);

// GET /api/customers/:id
// Users: Admins and Owners
router.get('/:id',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    customerController.getCustomer);

// POST /api/customers
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    customerController.createCustomer);

module.exports = router;