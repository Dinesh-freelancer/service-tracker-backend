const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const enquiryController = require('../controllers/enquiryController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');

router.use(authenticateToken);
router.use(sensitiveInfoToggle);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

/**
 * @swagger
 * tags:
 *   name: Enquiries
 *   description: Customer enquiries
 */

/**
 * @swagger
 * /enquiries:
 *   get:
 *     summary: List enquiries
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: enquiryDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: linkedJobNumber
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of enquiries
 */
router.get('/',
    authorize(...ADMIN_OWNER),
    enquiryController.listEnquiries);

/**
 * @swagger
 * /enquiries/{enquiryId}:
 *   get:
 *     summary: Get enquiry by ID
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enquiryId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Enquiry details
 *       404:
 *         description: Not found
 */
router.get('/:enquiryId',
    authorize(...ADMIN_OWNER),
    enquiryController.getEnquiry);

/**
 * @swagger
 * /enquiries:
 *   post:
 *     summary: Create new enquiry
 *     tags: [Enquiries]
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
 *               - ContactNumber
 *               - NatureOfQuery
 *             properties:
 *               EnquiryDate:
 *                 type: string
 *                 format: date-time
 *               CustomerName:
 *                 type: string
 *               ContactNumber:
 *                 type: string
 *               NatureOfQuery:
 *                 type: string
 *               QueryDetails:
 *                 type: string
 *               NextFollowUpDate:
 *                 type: string
 *                 format: date-time
 *               FollowUpNotes:
 *                 type: string
 *               EnteredBy:
 *                 type: integer
 *               LinkedJobNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/',
    authorize(...ADMIN_OWNER),
    enquiryController.createEnquiry);

module.exports = router;