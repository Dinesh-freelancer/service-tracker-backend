const pool = require('../db');

// Get all customers
async function getAllCustomers() {
    const [rows] = await pool.query('SELECT * FROM CustomerDetails ORDER BY CustomerName');
    return rows;
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