const pool = require('../db');

// Get all attendance records (optionally filter by date/worker)
async function getAttendance({ date, workerId } = {}) {
    let query = 'SELECT * FROM Attendance WHERE 1=1';
    const params = [];
    if (date) {
        query += ' AND AttendanceDate = ?';
        params.push(date);
    }
    if (workerId) {
        query += ' AND WorkerId = ?';
        params.push(workerId);
    }
    query += ' ORDER BY AttendanceDate DESC, WorkerId';

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get attendance by record ID
async function getAttendanceById(attendanceId) {
    const [rows] = await pool.query(
        'SELECT * FROM Attendance WHERE AttendanceId = ?', [attendanceId]
    );
    return rows[0];
}

// Add attendance record
async function addAttendance(data) {
    const {
        WorkerId,
        AttendanceDate,
        Status, // ENUM: Present, Absent, HalfDay, FieldWork, OnLeave
        CheckInTime,
        CheckOutTime,
        Notes,
        MarkedBy
    } = data;

    const [result] = await pool.query(
        `INSERT INTO Attendance (
      WorkerId, AttendanceDate, Status, CheckInTime,
      CheckOutTime, Notes, MarkedBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            WorkerId, AttendanceDate, Status, CheckInTime,
            CheckOutTime, Notes, MarkedBy
        ]
    );
    return await getAttendanceById(result.insertId);
}

module.exports = {
    getAttendance,
    getAttendanceById,
    addAttendance
};