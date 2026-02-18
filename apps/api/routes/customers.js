const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const constants = require('../utils/constants');
const customerController = require('../controllers/customerController');
const { validateRequest, createCustomerValidators } = require('../middleware/validationMiddleware');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];
// Allow customers to access their own data (controller handles the check)
const ALL_ROLES_WITH_CUSTOMER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_CUSTOMER];

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term (Name, Phone)
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/',
    authorize(...ADMIN_OWNER),
    customerController.listCustomers);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Customer not found
 */
router.get('/:id',
    authorize(...ALL_ROLES_WITH_CUSTOMER),
    customerController.getCustomer);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CustomerName
 *             properties:
 *               CustomerName:
 *                 type: string
 *               WhatsappNumber:
 *                 type: string
 *               Email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/',
    authorize(...ADMIN_OWNER),
    createCustomerValidators,
    validateRequest,
    customerController.createCustomer);

module.exports = router;
