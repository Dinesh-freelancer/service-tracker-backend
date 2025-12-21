const pool = require('../db');

// Get all service requests with filters and pagination
async function getAllServiceRequests(filters = {}, limit = 10, offset = 0) {
    let query = `
        SELECT sr.*, c.CustomerName, c.Phone1
        FROM servicerequest sr
        LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
    `;
    let countQuery = `SELECT COUNT(*) as count FROM servicerequest sr`;
    let params = [];
    let whereClauses = [];

    // Apply filters
    if (filters.status) {
        whereClauses.push(`sr.Status = ?`);
        params.push(filters.status);
    }

    // Add logic for date filtering, search, etc. here

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
        countQuery += whereSql;
    }

    // Sort by DateReceived descending
    query += ` ORDER BY sr.DateReceived DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query
    let countParams = params.slice(0, -2);
    const [countRows] = await pool.query(countQuery, countParams);

    return { rows, totalCount: countRows[0].count };
}

async function getServiceRequestByJobNumber(jobNumber) {
    const [rows] = await pool.query(
        `SELECT * FROM servicerequest WHERE JobNumber = ?`, [jobNumber]
    );
    return rows[0];
}

async function addServiceRequest(jobData) {
    const fields = Object.keys(jobData);
    const values = Object.values(jobData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO servicerequest (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    // Usually job number is unique, so we can fetch by it, but here we just return what was created if needed
    // Assuming JobNumber was part of input or we query by ID if auto-inc ID exists (JobId)
    // The table has JobId auto-inc.
    const [rows] = await pool.query('SELECT * FROM servicerequest WHERE JobNumber = ?', [jobData.JobNumber]);
    return rows[0];
}

async function updateServiceRequest(jobNumber, updateData) {
    const fields = Object.keys(updateData).map(field => `${field} = ?`);
    const values = Object.values(updateData);
    values.push(jobNumber);

    const query = `UPDATE servicerequest SET ${fields.join(', ')} WHERE JobNumber = ?`;
    await pool.query(query, values);

    const [rows] = await pool.query('SELECT * FROM servicerequest WHERE JobNumber = ?', [jobNumber]);
    return rows[0];
}

// Helper to generate JobNumber (YYYYMMDDNNN)
async function generateJobNumber() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    const [rows] = await pool.query(
        `SELECT JobNumber FROM servicerequest WHERE JobNumber LIKE ? ORDER BY JobNumber DESC LIMIT 1`,
        [`${dateStr}%`]
    );

    let nextNum = 1;
    if (rows.length > 0) {
        const lastNum = parseInt(rows[0].JobNumber.slice(-3));
        nextNum = lastNum + 1;
    }

    return `${dateStr}${String(nextNum).padStart(3, '0')}`;
}

module.exports = {
    getAllServiceRequests,
    getServiceRequestByJobNumber,
    addServiceRequest,
    updateServiceRequest,
    generateJobNumber
};
