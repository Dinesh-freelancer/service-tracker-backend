const pool = require('../db');

// Get all payments with filters
async function getAllPayments(filters, hideSensitive = true) {
    let query = 'SELECT * FROM payments ORDER BY PaymentDate DESC';
    let params = [];

    // If we need to filter by job or date
    let whereClauses = [];
    if (filters.jobNumber) {
        whereClauses.push('JobNumber = ?');
        params.push(filters.jobNumber);
    }

    if (whereClauses.length > 0) {
        query = 'SELECT * FROM payments WHERE ' + whereClauses.join(' AND ') + ' ORDER BY PaymentDate DESC';
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getPaymentsByJob(jobNumber, hideSensitive = true) {
    const [rows] = await pool.query(
        'SELECT * FROM payments WHERE JobNumber = ? ORDER BY PaymentDate DESC', [jobNumber]
    );
    return rows;
}

async function getPaymentById(paymentId) {
    // Maybe join with ServiceRequest to check ownership/permissions if needed
    // For now simple select
    const [rows] = await pool.query(
        'SELECT * FROM payments WHERE PaymentId = ?', [paymentId]
    );
    return rows[0];
}

async function createPayment(paymentData) {
    const fields = Object.keys(paymentData);
    const values = Object.values(paymentData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO payments (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return result.insertId;
}

async function updatePayment(paymentId, paymentData) {
    const fields = Object.keys(paymentData).map(field => `${field} = ?`);
    const values = Object.values(paymentData);
    values.push(paymentId);

    await pool.query(
        `UPDATE payments SET ${fields.join(', ')} WHERE PaymentId = ?`,
        values
    );
}

async function deletePayment(paymentId) {
    await pool.query('DELETE FROM payments WHERE PaymentId = ?', [paymentId]);
}

module.exports = {
    getAllPayments,
    getPaymentsByJob,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
};
