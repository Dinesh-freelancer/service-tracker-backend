const pool = require('../db');

// Get all attendance records (optionally filter by date/worker)
async function getattendance({ date, workerId } = {}) {
    let query = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];
    if (date) {
        query += ' AND attendanceDate = ?';
        params.push(date);
    }
    if (workerId) {
        query += ' AND workerId = ?';
        params.push(workerId);
    }
    query += ' ORDER BY attendanceDate DESC, workerId';

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get attendance by record ID
async function getattendanceById(attendanceId) {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE attendanceId = ?', [attendanceId]
    );
    return rows[0];
}

// Add attendance record
async function addattendance(data) {
    const {
        workerId,
        attendanceDate,
        Status, // ENUM: Present, Absent, HalfDay, FieldWork, OnLeave
        CheckInTime,
        CheckOutTime,
        Notes,
        MarkedBy
    } = data;

    const [result] = await pool.query(
        `INSERT INTO attendance (
      workerId, attendanceDate, Status, CheckInTime,
      CheckOutTime, Notes, MarkedBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            workerId, attendanceDate, Status, CheckInTime,
            CheckOutTime, Notes, MarkedBy
        ]
    );
    return await getattendanceById(result.insertId);
}

module.exports = {
    getattendance,
    getattendanceById,
    addattendance
};