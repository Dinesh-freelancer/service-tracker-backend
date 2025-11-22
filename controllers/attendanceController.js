const attendanceModel = require('../models/attendanceModel');

// List attendance (optionally filter by date/worker)
async function listAttendance(req, res, next) {
    try {
        const { date, workerId } = req.query;
        const records = await attendanceModel.getAttendance({ date, workerId });
        res.json(records);
    } catch (err) {
        next(err);
    }
}

// Get by attendance record ID
async function getAttendance(req, res, next) {
    try {
        const attendance = await attendanceModel.getAttendanceById(req.params.attendanceId);
        if (!attendance) return res.status(404).json({ error: 'Attendance record not found' });
        res.json(attendance);
    } catch (err) {
        next(err);
    }
}

// Add attendance record
async function createAttendance(req, res, next) {
    try {
        const attendance = await attendanceModel.addAttendance(req.body);
        res.status(201).json(attendance);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listAttendance,
    getAttendance,
    createAttendance
};