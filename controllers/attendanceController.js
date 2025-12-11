const attendanceModel = require('../models/attendanceModel');
const {STRING_HIDDEN} = require('../utils/constants');
// List attendance (optionally filter by date/worker)
async function listAttendance(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { date, workerId } = req.query;
        let records = await attendanceModel.getAttendance({ date, workerId });
        if (hideSensitive) {
            records = records.map(record => ({
                "AttendanceId": record.AttendanceId,
                "WorkerId": record.WorkerId,
                "AttendanceDate": record.AttendanceDate,
                "Status": record.Status,
                "CheckInTime": STRING_HIDDEN,
                "CheckOutTime": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "MarkedBy": record.MarkedBy,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            }));
        }
        res.json(records);
    } catch (err) {
        next(err);
    }
}

// Get by attendance record ID
async function getAttendance(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let attendance = await attendanceModel.getAttendanceById(req.params.attendanceId);
        if (!attendance) return res.status(404).json({ error: 'Attendance record not found' });
        if(hideSensitive){
            attendance = {
                "AttendanceId": attendance.AttendanceId,
                "WorkerId": attendance.WorkerId,
                "AttendanceDate": attendance.AttendanceDate,
                "Status": attendance.Status,
                "CheckInTime": STRING_HIDDEN,
                "CheckOutTime": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "MarkedBy": attendance.MarkedBy,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            };
        }
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