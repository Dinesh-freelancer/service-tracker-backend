const pool = require('../db');

/**
 * Retrieves all customers with pagination and filtering.
 * @param {Object} [filters] - Search filters.
 * @param {string} [filters.sql] - WHERE clause.
 * @param {Array} [filters.params] - Parameters for WHERE clause.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllCustomers(filters = {}, limit, offset) {
    let query = 'SELECT * FROM customerdetails';
    const params = [];

    if (filters.sql) {
        query += ` ${filters.sql}`;
        params.push(...filters.params);
    }

    query += ' ORDER BY CustomerName';

    if (limit !== undefined && offset !== undefined) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
    }

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM customerdetails';
    const countParams = [];
    if (filters.sql) {
        countQuery += ` ${filters.sql}`;
        countParams.push(...filters.params);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const totalCount = countResult[0].count;

    return { rows, totalCount };
}

// Get customer by ID
async function getCustomerById(id) {
    const [rows] = await pool.query('SELECT * FROM customerdetails WHERE CustomerId = ?', [id]);
    return rows[0];
}

// Add new customer
async function addCustomer(data) {
    const { CustomerName, CompanyName, Address, WhatsappNumber, WhatsappSameAsMobile } = data;
    const [result] = await pool.query(
        'INSERT INTO customerdetails (CustomerName, CompanyName, Address, WhatsappNumber, WhatsappSameAsMobile) VALUES (?, ?, ?, ?, ?)', [CustomerName, CompanyName, Address, WhatsappNumber, !!WhatsappSameAsMobile]
    );
    return await getCustomerById(result.insertId);
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    addCustomer
};