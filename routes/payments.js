const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const paymentsController = require('../controllers/paymentsController');

// GET /api/payments?jobNumber=...
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    paymentsController.listPayments);

// GET /api/payments/:paymentId
// Users: Admins and Owners
router.get('/:paymentId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    paymentsController.getPayment);

// POST /api/payments
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    paymentsController.createPayment);

module.exports = router;