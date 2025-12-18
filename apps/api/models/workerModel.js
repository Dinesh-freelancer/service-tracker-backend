const pool = require('../db');

// Get all workers (optionally filter by active status)
async function getAllWorkers(isActive) {
    let query = 'SELECT * FROM worker ORDER BY WorkerName';
    let params = [];

    // Controller seems to pass nothing or boolean
    if (isActive !== undefined) {
        query = 'SELECT * FROM worker WHERE IsActive = ? ORDER BY WorkerName';
        params.push(isActive ? 1 : 0);
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getWorkerById(workerId) {
    const [rows] = await pool.query(
        'SELECT * FROM worker WHERE WorkerId = ?', [workerId]
    );
    return rows[0];
}

async function addWorker(workerData) {
    const { WorkerName, Phone, Skills, DateOfJoining } = workerData;
    const [result] = await pool.query(
        `INSERT INTO worker (WorkerName, Phone, Skills, DateOfJoining)
     VALUES (?, ?, ?, ?)`,
        [WorkerName, Phone, Skills, DateOfJoining]
    );
    const [rows] = await pool.query('SELECT * FROM worker WHERE WorkerId = ?', [result.insertId]);
    return rows[0];
}

async function updateWorker(workerId, workerData) {
    const fields = Object.keys(workerData).map(field => `${field} = ?`);
    const values = Object.values(workerData);
    values.push(workerId);

    await pool.query(
        `UPDATE worker SET ${fields.join(', ')} WHERE WorkerId = ?`,
        values
    );
    const [rows] = await pool.query('SELECT * FROM worker WHERE WorkerId = ?', [workerId]);
    return rows[0];
}

async function deleteWorker(workerId) {
    // Soft delete usually, but here hard delete for now or update IsActive
    // await pool.query('DELETE FROM Worker WHERE WorkerId = ?', [workerId]);
    await pool.query('UPDATE worker SET IsActive = 0 WHERE WorkerId = ?', [workerId]);
}

module.exports = {
    getAllWorkers,
    getWorkerById,
    addWorker,
    updateWorker,
    deleteWorker
};
