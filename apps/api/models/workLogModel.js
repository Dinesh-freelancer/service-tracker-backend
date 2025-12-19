const pool = require('../db');

// Get all work logs with filters
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

    query += ' ORDER BY Date DESC, StartTime DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query
    let countParams = params.slice(0, -2);
    const [countRows] = await pool.query(countQuery, countParams);

    return { rows, totalCount: countRows[0].count };
}

async function getWorkLogById(workLogId) {
    const [rows] = await pool.query(
        'SELECT * FROM worklog WHERE WorkLogId = ?', [workLogId]
    );
    return rows[0];
}

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
