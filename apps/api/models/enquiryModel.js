const pool = require('../db');

// Get all enquiries with filters
async function getAllEnquiry(filters) {
    let query = 'SELECT * FROM enquiry WHERE 1=1';
    let params = [];

    if (filters.customerId) {
        query += ' AND CustomerId = ?';
        params.push(filters.customerId);
    }

    if (filters.status) {
        query += ' AND Status = ?';
        params.push(filters.status);
    }

    query += ' ORDER BY EnquiryDate DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getEnquiryById(enquiryId) {
    const [rows] = await pool.query('SELECT * FROM enquiry WHERE EnquiryId = ?', [enquiryId]);
    return rows[0];
}

async function createEnquiry(enquiryData) {
    const fields = Object.keys(enquiryData);
    const values = Object.values(enquiryData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO enquiry (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return result.insertId;
}

async function updateEnquiry(enquiryId, enquiryData) {
    const fields = Object.keys(enquiryData).map(field => `${field} = ?`);
    const values = Object.values(enquiryData);
    values.push(enquiryId);

    await pool.query(
        `UPDATE enquiry SET ${fields.join(', ')} WHERE EnquiryId = ?`,
        values
    );
}

module.exports = {
    getAllEnquiry,
    getEnquiryById,
    createEnquiry,
    updateEnquiry
};
