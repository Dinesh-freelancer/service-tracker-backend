const pool = require('../db');

let tableEnsured = false;

async function ensureSalaryPaymentsTable() {
    if (tableEnsured) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS salarypayments (
            id INT NOT NULL AUTO_INCREMENT,
            workerId INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            paymentType ENUM('Salary','Advance','Overtime') NOT NULL DEFAULT 'Salary',
            paymentMode VARCHAR(30) DEFAULT 'Cash',
            notes TEXT,
            createdtime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY fk_salarypayment_worker (workerId),
            KEY idx_salarypayment_createdtime (createdtime),
            CONSTRAINT fk_salarypayment_worker FOREIGN KEY (workerId) REFERENCES worker (WorkerId) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    tableEnsured = true;
}

/**
 * Get all salary payments with optional workerId filter, sorted by createdtime DESC.
 */
async function getAllSalaryPayments({ workerId } = {}) {
    await ensureSalaryPaymentsTable();
    let query = `
        SELECT
            sp.id,
            sp.workerId,
            w.WorkerName,
            sp.amount,
            sp.paymentType,
            sp.paymentMode,
            sp.notes,
            sp.createdtime
        FROM salarypayments sp
        LEFT JOIN worker w ON sp.workerId = w.WorkerId
    `;
    const params = [];

    if (workerId) {
        query += ' WHERE sp.workerId = ?';
        params.push(workerId);
    }

    query += ' ORDER BY sp.createdtime DESC, sp.id DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

/**
 * Get a single salary payment by id.
 */
async function getSalaryPaymentById(id) {
    await ensureSalaryPaymentsTable();
    const [rows] = await pool.query(
        `SELECT
            sp.id,
            sp.workerId,
            w.WorkerName,
            sp.amount,
            sp.paymentType,
            sp.paymentMode,
            sp.notes,
            sp.createdtime
         FROM salarypayments sp
         LEFT JOIN worker w ON sp.workerId = w.WorkerId
         WHERE sp.id = ?`,
        [id]
    );
    return rows[0];
}

/**
 * Create a new salary payment row.
 */
async function createSalaryPayment(data) {
    await ensureSalaryPaymentsTable();
    const {
        workerId,
        amount,
        paymentType = 'Salary',
        paymentMode = 'Cash',
        notes = null,
        createdtime = null
    } = data;

    let query;
    let params;

    if (createdtime) {
        query = `
            INSERT INTO salarypayments (workerId, amount, paymentType, paymentMode, notes, createdtime)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        params = [workerId, amount, paymentType, paymentMode, notes, createdtime];
    } else {
        query = `
            INSERT INTO salarypayments (workerId, amount, paymentType, paymentMode, notes)
            VALUES (?, ?, ?, ?, ?)
        `;
        params = [workerId, amount, paymentType, paymentMode, notes];
    }

    const [result] = await pool.query(query, params);
    return getSalaryPaymentById(result.insertId);
}

/**
 * Update an existing salary payment by id.
 */
async function updateSalaryPayment(id, data) {
    await ensureSalaryPaymentsTable();
    const allowedFields = ['workerId', 'amount', 'paymentType', 'paymentMode', 'notes', 'createdtime'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(data[field]);
        }
    }

    if (updates.length > 0) {
        values.push(id);
        await pool.query(
            `UPDATE salarypayments SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
    }

    return getSalaryPaymentById(id);
}

/**
 * Delete a salary payment by id.
 */
async function deleteSalaryPayment(id) {
    await ensureSalaryPaymentsTable();
    await pool.query('DELETE FROM salarypayments WHERE id = ?', [id]);
}

module.exports = {
    getAllSalaryPayments,
    getSalaryPaymentById,
    createSalaryPayment,
    updateSalaryPayment,
    deleteSalaryPayment
};
