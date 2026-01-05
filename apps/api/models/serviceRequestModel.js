const pool = require('../db');

// Get all service requests with filters and pagination
async function getAllServiceRequests(filters = {}, limit = 10, offset = 0) {
    let query = `
        SELECT sr.*, c.CustomerName, c.PrimaryContact, c.CustomerType, c.OrganizationId, o.OrganizationName
        FROM servicerequest sr
        LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
        LEFT JOIN organizations o ON c.OrganizationId = o.OrganizationId
    `;
    let countQuery = `SELECT COUNT(*) as count FROM servicerequest sr`;

    // Filters object contains { sql, params } from queryHelper
    let params = [];

    // Check if filters is the processed object { sql, params }
    if (filters.sql) {
        // queryHelper returns "WHERE ..." or empty string
        query += ` ${filters.sql}`;
        countQuery += ` ${filters.sql}`;
        params = [...(filters.params || [])];
    }

    // Sort by DateReceived descending
    query += ` ORDER BY sr.DateReceived DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query parameters (exclude limit/offset)
    const countParams = filters.params || [];
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
