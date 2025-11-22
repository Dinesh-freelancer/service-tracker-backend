const pool = require('../db');

// Get all suppliers
async function getAllSuppliers() {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY SupplierName');
    return rows;
}

// Get supplier by ID
async function getSupplierById(supplierId) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE SupplierId = ?', [supplierId]);
    return rows[0];
}

// Add a new supplier
async function addSupplier(data) {
    const { SupplierName, ContactName, ContactPhone, ContactEmail, Address, Notes } = data;
    const [result] = await pool.query(
        `INSERT INTO suppliers (SupplierName, ContactName, ContactPhone, ContactEmail, Address, Notes)
     VALUES (?, ?, ?, ?, ?, ?)`, [SupplierName, ContactName, ContactPhone, ContactEmail, Address, Notes]
    );
    return getSupplierById(result.insertId);
}

// Update supplier
async function updateSupplier(supplierId, data) {
    const { SupplierName, ContactName, ContactPhone, ContactEmail, Address, Notes } = data;
    await pool.query(
        `UPDATE suppliers 
     SET SupplierName = ?, ContactName = ?, ContactPhone = ?, ContactEmail = ?, Address = ?, Notes = ?, UpdatedAt = CURRENT_TIMESTAMP
     WHERE SupplierId = ?`, [SupplierName, ContactName, ContactPhone, ContactEmail, Address, Notes, supplierId]
    );
    return getSupplierById(supplierId);
}

// Delete supplier
async function deleteSupplier(supplierId) {
    await pool.query('DELETE FROM suppliers WHERE SupplierId = ?', [supplierId]);
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    addSupplier,
    updateSupplier,
    deleteSupplier
};