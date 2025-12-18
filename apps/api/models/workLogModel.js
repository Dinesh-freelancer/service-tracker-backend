const pool = require('../db');

/**
 * Retrieves all work logs with pagination.
 * @param {string|null} [jobNumber=null] - Filter by job number.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllworklogs(jobNumber = null, limit, offset) {
    let query = 'SELECT * FROM worklog';
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

    let countQuery = 'SELECT COUNT(*) as count FROM worklog';
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
async function getworklogById(workLogId) {
    const [rows] = await pool.query(
        'SELECT * FROM worklog WHERE worklogId = ?', [workLogId]
    );
    return rows[0];
}

// Create new work log entry
async function addworklog(data) {
    const {
        JobNumber,
        SubStatus,
        WorkDone,
        workerId,
        workerName,
        StartTime,
        EndTime,
        Notes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO worklog (
      JobNumber, SubStatus, WorkDone, workerId, workerName,
      StartTime, EndTime, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            JobNumber,
            SubStatus,
            WorkDone,
            workerId,
            workerName,
            StartTime,
            EndTime,
            Notes
        ]
    );
    return await getworklogById(result.insertId);
}

module.exports = {
    getAllworklogs,
    getworklogById,
    addworklog
};