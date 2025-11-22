const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const attendanceController = require('../controllers/attendanceController');

// GET /api/attendance?date=YYYY-MM-DD&workerId=4
// Only Owner and Admin can view attendance
router.get(
    '/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    attendanceController.listAttendance);

// GET /api/attendance/:attendanceId
// Only Owner and Admin can get attendance
router.get('/:attendanceId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    attendanceController.getAttendance);

// POST /api/attendance
// Only Owner and Admin can create attendance
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    attendanceController.createAttendance);

module.exports = router;