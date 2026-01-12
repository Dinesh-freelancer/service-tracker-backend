const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const { validateRequest, registerValidators } = require('../middleware/validationMiddleware');

router.use(authenticateToken);

// Only Owner can manage users
const OWNER_ONLY = [constants.AUTH_ROLE_OWNER];
router.use(authorize(...OWNER_ONLY));

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: Manage system users (Owner only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [User Management]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', userController.listUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [User Management]
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
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', registerValidators, validateRequest, userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Role:
 *                 type: string
 *               IsActive:
 *                 type: boolean
 *               Password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: User deleted
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
