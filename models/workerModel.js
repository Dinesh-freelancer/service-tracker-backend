const pool = require('../db');

// Get all workers
async function getAllWorkers() {
    const [rows] = await pool.query(
        'SELECT * FROM Worker ORDER BY WorkerName'
    );
    return rows;
}

// Get a worker by ID
async function getWorkerById(workerId) {
    const [rows] = await pool.query(
        'SELECT * FROM Worker WHERE WorkerId = ?', [workerId]
    );
    return rows[0];
}

// Add new worker
async function addWorker(data) {
    const {
        WorkerName,
        MobileNumber,
        AlternateNumber,
        WhatsappNumber,
        Address,
        DateOfJoining,
        Skills,
        IsActive,
        Notes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO Worker (
      WorkerName, MobileNumber, AlternateNumber, WhatsappNumber,
      Address, DateOfJoining, Skills, IsActive, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            WorkerName,
            MobileNumber,
            AlternateNumber,
            WhatsappNumber,
            Address,
            DateOfJoining,
            Skills,
            IsActive,
            Notes
        ]
    );
    return await getWorkerById(result.insertId);
}

module.exports = {
    getAllWorkers,
    getWorkerById,
    addWorker
};