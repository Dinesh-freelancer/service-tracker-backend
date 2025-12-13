const pool = require('../db');

/**
 * Retrieves all work logs with pagination.
 * @param {string|null} [jobNumber=null] - Filter by job number.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllWorkLogs(jobNumber = null, limit, offset) {
    let query = 'SELECT * FROM WorkLog';
    const params = [];

    if (jobNumber) {
        query += ' WHERE JobNumber = ?';
        params.push(jobNumber);
    }

    query += ' ORDER BY StartTime';

    if (limit !== undefined && offset !== undefined) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
    }

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM WorkLog';
    const countParams = [];
    if (jobNumber) {
        countQuery += ' WHERE JobNumber = ?';
        countParams.push(jobNumber);
    }
    const [countResult] = await pool.query(countQuery, countParams);
    const totalCount = countResult[0].count;

    return { rows, totalCount };
}

// Get a single work log entry
async function getWorkLogById(workLogId) {
    const [rows] = await pool.query(
        'SELECT * FROM WorkLog WHERE WorkLogId = ?', [workLogId]
    );
    return rows[0];
}

// Create new work log entry
async function addWorkLog(data) {
    const {
        JobNumber,
        SubStatus,
        WorkDone,
        WorkerId,
        WorkerName,
        StartTime,
        EndTime,
        Notes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO WorkLog (
      JobNumber, SubStatus, WorkDone, WorkerId, WorkerName,
      StartTime, EndTime, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            JobNumber,
            SubStatus,
            WorkDone,
            WorkerId,
            WorkerName,
            StartTime,
            EndTime,
            Notes
        ]
    );
    return await getWorkLogById(result.insertId);
}

module.exports = {
    getAllWorkLogs,
    getWorkLogById,
    addWorkLog
};