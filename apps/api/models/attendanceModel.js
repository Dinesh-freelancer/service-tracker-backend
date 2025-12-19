const pool = require('../db');

// Get attendance records with filters (controller calls getAttendance)
async function getAttendance(filters) {
    let query = 'SELECT * FROM attendance WHERE 1=1';
    let params = [];

    if (filters.workerId) {
        query += ' AND WorkerId = ?';
        params.push(filters.workerId);
    }

    if (filters.dateFrom) {
        query += ' AND AttendanceDate >= ?';
        params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
        query += ' AND AttendanceDate <= ?';
        params.push(filters.dateTo);
    }

    // Also handle 'date' single param if passed
    if (filters.date) {
        query += ' AND AttendanceDate = ?';
        params.push(filters.date);
    }

    query += ' ORDER BY AttendanceDate DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getAttendanceById(attendanceId) {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE AttendanceId = ?', [attendanceId]
    );
    return rows[0];
}

async function addAttendance(attendanceData) {
    const { WorkerId, AttendanceDate, Status, Notes } = attendanceData;
    const [result] = await pool.query(
        `INSERT INTO attendance (WorkerId, AttendanceDate, Status, Notes)
     VALUES (?, ?, ?, ?)`,
        [WorkerId, AttendanceDate, Status, Notes]
    );
    return result.insertId;
}

async function updateAttendance(attendanceId, attendanceData) {
    const fields = Object.keys(attendanceData).map(field => `${field} = ?`);
    const values = Object.values(attendanceData);
    values.push(attendanceId);

    await pool.query(
        `UPDATE attendance SET ${fields.join(', ')} WHERE AttendanceId = ?`,
        values
    );
}

module.exports = {
    getAttendance,
    getAttendanceById,
    addAttendance,
    updateAttendance
};
