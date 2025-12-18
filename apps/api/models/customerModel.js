const pool = require('../db');

// Get all customers (with pagination logic restored)
async function getAllCustomers(filters = {}, limit = 10, offset = 0) {
    let query = 'SELECT * FROM customerdetails';
    let countQuery = 'SELECT COUNT(*) as count FROM customerdetails';
    let params = [];
    let whereClauses = [];

    // Filter logic (if any specific filters exist, add here)
    if (filters.search) {
        whereClauses.push('(CustomerName LIKE ? OR CompanyName LIKE ? OR Phone1 LIKE ?)');
        const term = `%${filters.search}%`;
        params.push(term, term, term);
    }

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
        countQuery += whereSql;
    }

    query += ' ORDER BY CreatedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query for pagination (need separate params without limit/offset)
    let countParams = params.slice(0, -2);
    const [countRows] = await pool.query(countQuery, countParams);
    const totalCount = countRows[0].count;

    return { rows, totalCount };
}

async function getCustomerById(id) {
    const [rows] = await pool.query('SELECT * FROM customerdetails WHERE CustomerId = ?', [id]);
    return rows[0];
}

async function addCustomer(customerData) {
    const { CustomerName, CompanyName, Address, WhatsappNumber, WhatsappSameAsMobile, City, State, ZipCode, Phone1, Phone2, Email, Notes } = customerData;
    // Map fields carefully if they differ. Assuming strict mapping or flexible based on usage.
    // Using explicit columns based on table schema in seed.js
    const [result] = await pool.query(
        `INSERT INTO customerdetails
        (CustomerName, CompanyName, Address, City, State, ZipCode, Phone1, Phone2, WhatsApp, Email, Notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [CustomerName, CompanyName, Address, City, State, ZipCode, Phone1, Phone2, WhatsappNumber, Email, Notes]
    );
    // Fetch and return the created object
    const [rows] = await pool.query('SELECT * FROM customerdetails WHERE CustomerId = ?', [result.insertId]);
    return rows[0];
}

async function updateCustomer(id, customerData) {
    const fields = Object.keys(customerData).map(field => `${field} = ?`);
    const values = Object.values(customerData);
    values.push(id);

    await pool.query(`UPDATE customerdetails SET ${fields.join(', ')} WHERE CustomerId = ?`, values);
    const [rows] = await pool.query('SELECT * FROM customerdetails WHERE CustomerId = ?', [id]);
    return rows[0];
}

async function deleteCustomer(id) {
    await pool.query('DELETE FROM customerdetails WHERE CustomerId = ?', [id]);
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer
};
