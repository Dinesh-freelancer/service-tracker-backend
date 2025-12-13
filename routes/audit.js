const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const constants = require('../utils/constants');
const auditController = require('../controllers/auditController');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit logs
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: List audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobNumber
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    auditController.listAudits);

/**
 * @swagger
 * /audit:
 *   post:
 *     summary: Create an audit log
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ActionType
 *               - ChangedBy
 *             properties:
 *               JobNumber:
 *                 type: string
 *               ActionType:
 *                 type: string
 *               ChangedBy:
 *                 type: integer
 *               Details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    auditController.createAudit);

module.exports = router;