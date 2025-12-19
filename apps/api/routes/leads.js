const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { body } = require('express-validator');

// Validation rules
const pickupValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required').isMobilePhone().withMessage('Invalid phone number'),
  body('pumpType').optional(),
  body('approxWeight').optional(),
  body('location').notEmpty().withMessage('Location is required'),
];

/**
 * @swagger
 * /api/leads/pickup:
 *   post:
 *     summary: Submit a pickup request
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               pumpType:
 *                 type: string
 *               approxWeight:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pickup request created successfully
 *       400:
 *         description: Validation error
 */
router.post('/pickup', pickupValidation, leadController.createLead);

module.exports = router;
