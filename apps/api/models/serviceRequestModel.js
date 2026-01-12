const pool = require('../db');

// Get all service requests with filters and pagination
async function getAllServiceRequests(filters = {}, limit = 10, offset = 0) {
    // JOIN assets to get pump/motor details and InternalTag
    let query = `
        SELECT sr.*,
               c.CustomerName, c.PrimaryContact, c.CustomerType, c.OrganizationId,
               o.OrganizationName,
               a.InternalTag, a.Brand, a.AssetType, a.PumpModel, a.MotorModel, a.SerialNumber, a.HP, a.WarrantyExpiry
        FROM servicerequest sr
        LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
        LEFT JOIN organizations o ON c.OrganizationId = o.OrganizationId
        LEFT JOIN assets a ON sr.AssetId = a.AssetId
    `;
    // We need to handle the WHERE clause. If search terms are for asset fields, the queryHelper must support table aliases
    // or we assume column names are unique enough.
    // Note: queryHelper usually produces "WHERE (InternalTag LIKE ? OR ...)"
    // Since we are JOINing, we should be careful about ambiguous columns.
    // `filters.sql` from queryHelper should be constructed knowing this query structure.

    let countQuery = `
        SELECT COUNT(*) as count
        FROM servicerequest sr
        LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
        LEFT JOIN assets a ON sr.AssetId = a.AssetId
    `;

    let params = [];

    if (filters.sql) {
        query += ` ${filters.sql}`;
        countQuery += ` ${filters.sql}`;
        params = [...(filters.params || [])];
    }

    query += ` ORDER BY sr.DateReceived DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    const countParams = filters.params || [];
    const [countRows] = await pool.query(countQuery, countParams);

    return { rows, totalCount: countRows[0].count };
}

async function getServiceRequestByJobNumber(jobNumber, connection = null) {
    const db = connection || pool;
    // Also JOIN here to get full details for single view
    const [rows] = await db.query(
        `SELECT sr.*,
                c.CustomerName, c.PrimaryContact, c.CustomerType, c.OrganizationId,
                o.OrganizationName,
                a.InternalTag, a.Brand, a.AssetType, a.PumpModel, a.MotorModel, a.SerialNumber, a.HP, a.WarrantyExpiry, a.InstallationDate
         FROM servicerequest sr
         LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
         LEFT JOIN organizations o ON c.OrganizationId = o.OrganizationId
         LEFT JOIN assets a ON sr.AssetId = a.AssetId
         WHERE sr.JobNumber = ?`,
        [jobNumber]
    );
    return rows[0];
}

async function addServiceRequest(jobData, connection = null) {
    const db = connection || pool;
    const fields = Object.keys(jobData);
    const values = Object.values(jobData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
        `INSERT INTO servicerequest (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    // Return the inserted row
    return getServiceRequestByJobNumber(jobData.JobNumber, db);
}

async function updateServiceRequest(jobNumber, updateData) {
    const fields = Object.keys(updateData).map(field => `${field} = ?`);
    const values = Object.values(updateData);
    values.push(jobNumber);

    const query = `UPDATE servicerequest SET ${fields.join(', ')} WHERE JobNumber = ?`;
    await pool.query(query, values);

    return getServiceRequestByJobNumber(jobNumber);
}

// Helper to generate JobNumber (YYYYMMDDNNN)
async function generateJobNumber(connection = null) {
    const db = connection || pool;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    const [rows] = await db.query(
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

async function getHistoryByJobNumber(jobNumber) {
    const [rows] = await pool.query(
        `SELECT * FROM servicerequest_history WHERE JobNumber = ? ORDER BY ChangedAt DESC`,
        [jobNumber]
    );
    return rows;
}

module.exports = {
    getAllServiceRequests,
    getServiceRequestByJobNumber,
    addServiceRequest,
    updateServiceRequest,
    generateJobNumber,
    getHistoryByJobNumber
};
