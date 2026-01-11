const pool = require('../db');
const bcrypt = require('bcrypt');

// Get all workers (with User link and Attendance)
async function getAllWorkers(isActive) {
    let query = `
        SELECT w.*, u.Username as LinkedUser, a.Status as TodayAttendance
        FROM worker w
        LEFT JOIN users u ON w.WorkerId = u.WorkerId
        LEFT JOIN attendance a ON w.WorkerId = a.WorkerId AND a.AttendanceDate = CURDATE()
    `;
    let params = [];

    if (isActive !== undefined) {
        query += ' WHERE w.IsActive = ?';
        params.push(isActive ? 1 : 0);
    }

    query += ' ORDER BY w.WorkerName';

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getWorkerById(workerId) {
    const [rows] = await pool.query(
        'SELECT * FROM worker WHERE WorkerId = ?', [workerId]
    );
    return rows[0];
}

async function addWorker(workerData, connection = null) {
    const db = connection || pool;
    const fields = Object.keys(workerData);
    const values = Object.values(workerData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
        `INSERT INTO worker (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );

    // If connection provided, we might not be able to select back immediately if not committed?
    // Actually inside transaction we can read our writes.
    // But for simplicity return the ID.
    return { WorkerId: result.insertId, ...workerData };
}

// Transactional: Create Worker + User
async function addWorkerWithUser(workerData, userData) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Worker
        const workerResult = await addWorker(workerData, connection);
        const workerId = workerResult.WorkerId;

        // 2. Create User
        if (userData && userData.Username && userData.Password) {
            const hashedPassword = await bcrypt.hash(userData.Password, 10);
            await connection.query(
                `INSERT INTO users (Username, PasswordHash, Role, WorkerId, IsActive)
                 VALUES (?, ?, ?, ?, 1)`,
                [userData.Username, hashedPassword, 'Worker', workerId]
            );

            // Update Worker to mark IsUser=1
            await connection.query('UPDATE worker SET IsUser = 1 WHERE WorkerId = ?', [workerId]);
        }

        await connection.commit();
        return { ...workerResult, LinkedUser: userData.Username };

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function updateWorker(workerId, workerData) {
    const fields = Object.keys(workerData).map(field => `${field} = ?`);
    const values = Object.values(workerData);
    values.push(workerId);

    if (fields.length > 0) {
        await pool.query(
            `UPDATE worker SET ${fields.join(', ')} WHERE WorkerId = ?`,
            values
        );
    }
    return getWorkerById(workerId);
}

async function deleteWorker(workerId) {
    // Soft delete
    await pool.query('UPDATE worker SET IsActive = 0 WHERE WorkerId = ?', [workerId]);
}

module.exports = {
    getAllWorkers,
    getWorkerById,
    addWorker,
    addWorkerWithUser,
    updateWorker,
    deleteWorker
};
