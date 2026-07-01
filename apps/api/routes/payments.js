const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const paymentsController = require('../controllers/paymentsController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: List payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobNumber
 *         schema:
 *           type: string
 *         description: Filter by Job Number
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/',
    authorize(...ADMIN_OWNER),
    paymentsController.listPayments);

/**
 * @swagger
 * /payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId',
    authorize(...ADMIN_OWNER),
    paymentsController.getPayment);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - JobNumber
 *               - Amount
 *               - PaymentDate
 *             properties:
 *               JobNumber:
 *                 type: string
 *               Amount:
 *                 type: number
 *               PaymentDate:
 *                 type: string
 *                 format: date-time
 *               PaymentType:
 *                 type: string
 *                 enum: [Advance, Partial, Final, Refund, Other]
 *               PaymentMode:
 *                 type: string
 *                 enum: [Cash, Cheque, Online, Credit]
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post('/',
    authorize(...ADMIN_OWNER),
    paymentsController.createPayment);


/**
 * @swagger
 * /payments/{paymentId}:
 *   put:
 *     summary: Update a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Amount:
 *                 type: number
 *               PaymentDate:
 *                 type: string
 *                 format: date-time
 *               PaymentType:
 *                 type: string
 *                 enum: [Advance, Partial, Final, Refund, Other]
 *               PaymentMode:
 *                 type: string
 *                 enum: [Cash, Cheque, Online, Credit]
 *     responses:
 *       200:
 *         description: Payment updated
 */
router.put('/:paymentId',
    authorize(...ADMIN_OWNER),
    paymentsController.updatePayment);

/**
 * @swagger
 * /payments/{paymentId}:
 *   delete:
 *     summary: Delete a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment deleted
 */
router.delete('/:paymentId',
    authorize(...ADMIN_OWNER),
    paymentsController.deletePayment);
module.exports = router;
