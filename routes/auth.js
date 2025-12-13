const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    validateRequest,
    registerValidators,
    loginValidators
} = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (Admin/Owner only)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Password
 *               - Role
 *             properties:
 *               Username:
 *                 type: string
 *               Password:
 *                 type: string
 *               Role:
 *                 type: string
 *                 enum: [Admin, Owner, Worker, Customer]
 *               WorkerId:
 *                 type: integer
 *               CustomerId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 */
router.post('/register', authLimiter, registerValidators, validateRequest, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Password
 *             properties:
 *               Username:
 *                 type: string
 *               Password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 Role:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginValidators, validateRequest, authController.login);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - NewPassword
 *             properties:
 *               Username:
 *                 type: string
 *               NewPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       404:
 *         description: User not found
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;