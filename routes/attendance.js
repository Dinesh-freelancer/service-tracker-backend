const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
const constants = require('../utils/constants');
const attendanceController = require('../controllers/attendanceController');
router.use(authenticateToken)
router.use(sensitiveInfoToggle);
// GET /api/attendance?date=YYYY-MM-DD&workerId=4
// Only Owner, Admin and Workers can view attendance
router.get(
    '/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER),
    attendanceController.listAttendance);

// GET /api/attendance/:attendanceId
// Only Owner, Admin and Workers can get attendance
router.get('/:attendanceId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER),
    attendanceController.getAttendance);

// POST /api/attendance
// Only Owner and Admin can create attendance
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    attendanceController.createAttendance);

module.exports = router;