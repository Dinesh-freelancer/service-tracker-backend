const pool = require('../db');

// Get all suppliers
async function getAllSuppliers() {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY SupplierName');
    return rows;
}

async function getSupplierById(supplierId) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE SupplierId = ?', [supplierId]);
    return rows[0];
}

async function createSupplier(supplierData) {
    const fields = Object.keys(supplierData);
    const values = Object.values(supplierData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO suppliers (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return result.insertId;
}

async function updateSupplier(supplierId, supplierData) {
    const fields = Object.keys(supplierData).map(field => `${field} = ?`);
    const values = Object.values(supplierData);
    values.push(supplierId);

    await pool.query(
        `UPDATE suppliers SET ${fields.join(', ')} WHERE SupplierId = ?`,
        values
    );
}

async function deleteSupplier(supplierId) {
    await pool.query('DELETE FROM suppliers WHERE SupplierId = ?', [supplierId]);
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
