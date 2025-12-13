const pool = require('../db');

/**
 * Retrieves all customers with pagination.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllCustomers(limit, offset) {
    let query = 'SELECT * FROM CustomerDetails ORDER BY CustomerName';
    const params = [];

    if (limit !== undefined && offset !== undefined) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
    }

    const [rows] = await pool.query(query, params);

    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM CustomerDetails');
    const totalCount = countResult[0].count;

    return { rows, totalCount };
}

// Get customer by ID
async function getCustomerById(id) {
    const [rows] = await pool.query('SELECT * FROM CustomerDetails WHERE CustomerId = ?', [id]);
    return rows[0];
}

// Add new customer
async function addCustomer(data) {
    const { CustomerName, CompanyName, Address, WhatsappNumber, WhatsappSameAsMobile } = data;
    const [result] = await pool.query(
        'INSERT INTO CustomerDetails (CustomerName, CompanyName, Address, WhatsappNumber, WhatsappSameAsMobile) VALUES (?, ?, ?, ?, ?)', [CustomerName, CompanyName, Address, WhatsappNumber, !!WhatsappSameAsMobile]
    );
    return await getCustomerById(result.insertId);
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    addCustomer
};