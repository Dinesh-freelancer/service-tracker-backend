const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const constants = require('../utils/constants');
const attendanceController = require('../controllers/attendanceController');
router.use(authenticateToken)
router.use(sensitiveInfoToggle);
/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance tracking
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: List attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: workerId
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get(
    '/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER),
    attendanceController.listAttendance);

/**
 * @swagger
 * /attendance/{attendanceId}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attendanceId
 *         required: true
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/HideSensitive'
 *     responses:
 *       200:
 *         description: Attendance record
 *       404:
 *         description: Not found
 */
router.get('/:attendanceId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER),
    attendanceController.getAttendance);

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Create attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - WorkerId
 *               - AttendanceDate
 *               - Status
 *             properties:
 *               WorkerId:
 *                 type: integer
 *               AttendanceDate:
 *                 type: string
 *                 format: date
 *               Status:
 *                 type: string
 *                 enum: [Present, Absent, Leave, Holiday]
 *               CheckInTime:
 *                 type: string
 *               CheckOutTime:
 *                 type: string
 *               Notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    attendanceController.createAttendance);

module.exports = router;