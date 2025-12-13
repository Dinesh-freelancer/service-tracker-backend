const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const constants = require('../utils/constants');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management
 */

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - DocumentType
 *               - EmbedTag
 *             properties:
 *               JobNumber:
 *                 type: string
 *               CustomerId:
 *                 type: integer
 *               DocumentType:
 *                 type: string
 *               EmbedTag:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.createDocument);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.deleteDocument);

/**
 * @swagger
 * /documents/job/{jobNumber}:
 *   get:
 *     summary: Get documents by job
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobNumber
 *         required: true
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/job/:jobNumber',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.getDocumentsByJob);

/**
 * @swagger
 * /documents/customer/{customerId}:
 *   get:
 *     summary: Get documents by customer
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/customer/:customerId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.getDocumentsByCustomer);

module.exports = router;