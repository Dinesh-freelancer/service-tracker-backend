const pool = require('../db');

/**
 * Retrieves all work logs, optionally filtered by job number, with pagination.
 * @param {string|null} jobNumber - The job number to filter by (optional).
 * @param {number} [limit=10] - Number of records to return.
 * @param {number} [offset=0] - Number of records to skip.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and total count.
 */
async function getAllWorkLogs(jobNumber, limit = 10, offset = 0) {
    let query = 'SELECT * FROM worklog';
    let countQuery = 'SELECT COUNT(*) as count FROM worklog';
    let params = [];
    let whereClauses = [];

    if (jobNumber) {
        whereClauses.push('JobNumber = ?');
        params.push(jobNumber);
    }

    // Add other filters if needed

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
        countQuery += whereSql;
    }

    // Use CreatedAt instead of Date as per schema
    query += ' ORDER BY CreatedAt DESC, StartTime DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query
    let countParams = params.slice(0, -2);
    const [countRows] = await pool.query(countQuery, countParams);

    return { rows, totalCount: countRows[0].count };
}

/**
 * Retrieves a single work log by its ID.
 * @param {number} workLogId - The ID of the work log.
 * @returns {Promise<Object|undefined>} The work log record or undefined if not found.
 */
async function getWorkLogById(workLogId) {
    const [rows] = await pool.query(
        'SELECT * FROM worklog WHERE WorkLogId = ?', [workLogId]
    );
    return rows[0];
}

/**
 * Adds a new work log entry.
 * @param {Object} logData - The data for the new work log.
 * @returns {Promise<Object>} The newly created work log record.
 */
async function addWorkLog(logData) {
    const fields = Object.keys(logData);
    const values = Object.values(logData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO worklog (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    const [rows] = await pool.query('SELECT * FROM worklog WHERE WorkLogId = ?', [result.insertId]);
    return rows[0];
}

/**
 * Updates an existing work log entry.
 * @param {number} workLogId - The ID of the work log to update.
 * @param {Object} logData - The key-value pairs to update.
 * @returns {Promise<Object>} The updated work log record.
 */
async function updateWorkLog(workLogId, logData) {
    const fields = Object.keys(logData).map(field => `${field} = ?`);
    const values = Object.values(logData);
    values.push(workLogId);

    await pool.query(
        `UPDATE worklog SET ${fields.join(', ')} WHERE WorkLogId = ?`,
        values
    );
    const [rows] = await pool.query('SELECT * FROM worklog WHERE WorkLogId = ?', [workLogId]);
    return rows[0];
}

/**
 * Deletes a work log entry.
 * @param {number} workLogId - The ID of the work log to delete.
 * @returns {Promise<void>}
 */
async function deleteWorkLog(workLogId) {
    await pool.query('DELETE FROM worklog WHERE WorkLogId = ?', [workLogId]);
}

module.exports = {
    getAllWorkLogs,
    getWorkLogById,
    addWorkLog,
    updateWorkLog,
    deleteWorkLog
};
