const pool = require('../db');

// Get all workers
async function getAllworkers() {
    const [rows] = await pool.query(
        'SELECT * FROM worker ORDER BY workerName'
    );
    return rows;
}

// Get a worker by ID
async function getworkerById(workerId) {
    const [rows] = await pool.query(
        'SELECT * FROM worker WHERE workerId = ?', [workerId]
    );
    return rows[0];
}

// Add new worker
async function addworker(data) {
    const {
        workerName,
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
        `INSERT INTO worker (
      workerName, MobileNumber, AlternateNumber, WhatsappNumber,
      Address, DateOfJoining, Skills, IsActive, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            workerName,
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
    return await getworkerById(result.insertId);
}

module.exports = {
    getAllworkers,
    getworkerById,
    addworker
};