const pool = require('../db');

// Get all payments (optionally filter by job)
async function getAllPayments(jobNumber = null) {
    if (jobNumber) {
        const [rows] = await pool.query(
            'SELECT * FROM Payments WHERE JobNumber = ? ORDER BY PaymentDate DESC', [jobNumber]
        );
        return rows;
    } else {
        const [rows] = await pool.query(
            'SELECT * FROM Payments ORDER BY PaymentDate DESC'
        );
        return rows;
    }
}

// Get single payment by PaymentId
async function getPaymentById(paymentId) {
    const [rows] = await pool.query(
        'SELECT * FROM Payments WHERE PaymentId = ?', [paymentId]
    );
    return rows[0];
}

// Get payments by CustomerId
async function getPaymentsByCustomerId(customerId) {
    const [rows] = await pool.query(`
        SELECT p.*
        FROM Payments p
        JOIN ServiceRequest sr ON p.JobNumber = sr.JobNumber
        WHERE sr.CustomerId = ?
        ORDER BY p.PaymentDate DESC
    `, [customerId]);
    return rows;
}

// Create a payment
async function addPayment(data) {
    const {
        JobNumber,
        Amount,
        PaymentDate,
        PaymentType,
        PaymentMode,
        Notes
    } = data;
    const [result] = await pool.query(
        `INSERT INTO Payments (
      JobNumber, Amount, PaymentDate, PaymentType, PaymentMode, Notes
    ) VALUES (?, ?, ?, ?, ?, ?)`, [JobNumber, Amount, PaymentDate, PaymentType, PaymentMode, Notes]
    );
    return await getPaymentById(result.insertId);
}

module.exports = {
    getAllPayments,
    getPaymentById,
    getPaymentsByCustomerId,
    addPayment
};