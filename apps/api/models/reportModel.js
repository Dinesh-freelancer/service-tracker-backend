const pool = require('../db');

// Get counts of service requests by status, optionally filtered by date range
async function getJobStatusSummary(startDate, endDate) {
    let sql = 'SELECT Status, COUNT(*) AS count FROM servicerequest';
    const params = [];

    if (startDate && endDate) {
        sql += ' WHERE DateReceived BETWEEN ? AND ?';
        params.push(startDate, endDate);
    } else if (startDate) {
        sql += ' WHERE DateReceived >= ?';
        params.push(startDate);
    } else if (endDate) {
        sql += ' WHERE DateReceived <= ?';
        params.push(endDate);
    }

    sql += ' GROUP BY Status ORDER BY Status';

    const [rows] = await pool.query(sql, params);
    return rows;
}

// Kept for backward compatibility if needed, but redundant now
async function getJobStatusSummaryByDate(startDate, endDate) {
    return getJobStatusSummary(startDate, endDate);
}

module.exports = {
    getJobStatusSummary,
    getJobStatusSummaryByDate
};
