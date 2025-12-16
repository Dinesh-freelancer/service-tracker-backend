const pool = require('../db');

// Get counts of service requests by status
async function getJobStatusSummary() {
    const [rows] = await pool.query(`
    SELECT Status, COUNT(*) AS count
    FROM servicerequest
    GROUP BY Status
    ORDER BY Status
  `);
    return rows;
}

// Get counts filtered by date range (optional)
async function getJobStatusSummaryByDate(startDate, endDate) {
    const [rows] = await pool.query(`
    SELECT Status, COUNT(*) AS count
    FROM servicerequest
    WHERE DateReceived >= ? AND DateReceived <= ?
    GROUP BY Status
    ORDER BY Status
  `, [startDate, endDate]);
    return rows;
}

module.exports = {
    getJobStatusSummary,
    getJobStatusSummaryByDate
};