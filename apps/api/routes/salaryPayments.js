const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const salaryPaymentController = require('../controllers/salaryPaymentController');

router.use(authenticateToken);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];
router.use(authorize(...ADMIN_OWNER));

/**
 * @swagger
 * tags:
 *   name: SalaryPayments
 *   description: Worker salary payments management
 */

/**
 * @swagger
 * /salary-payments:
 *   get:
 *     summary: List worker salary payments sorted by createdtime desc
 *     tags: [SalaryPayments]
 *     parameters:
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: integer
 *         description: Filter by workerId
 *     responses:
 *       200:
 *         description: List of salary payments
 */
router.get('/', salaryPaymentController.listSalaryPayments);

/**
 * @swagger
 * /salary-payments:
 *   post:
 *     summary: Create a new worker salary payment
 *     tags: [SalaryPayments]
 *     responses:
 *       201:
 *         description: Salary payment created
 */
router.post('/', salaryPaymentController.createSalaryPayment);

/**
 * @swagger
 * /salary-payments/{id}:
 *   put:
 *     summary: Update a worker salary payment
 *     tags: [SalaryPayments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salary payment updated
 */
router.put('/:id', salaryPaymentController.updateSalaryPayment);

/**
 * @swagger
 * /salary-payments/{id}:
 *   delete:
 *     summary: Delete a worker salary payment
 *     tags: [SalaryPayments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Salary payment deleted
 */
router.delete('/:id', salaryPaymentController.deleteSalaryPayment);

module.exports = router;
