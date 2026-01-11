const pool = require('../db');
const bcrypt = require('bcrypt');

// Get all users
async function getAllUsers() {
    const [rows] = await pool.query(
        `SELECT u.UserId, u.Username, u.Role, u.IsActive, u.CreatedAt,
                w.WorkerName, c.CustomerName
         FROM users u
         LEFT JOIN worker w ON u.WorkerId = w.WorkerId
         LEFT JOIN customerdetails c ON u.CustomerId = c.CustomerId
         ORDER BY u.CreatedAt DESC`
    );
    return rows;
}

// Get user by ID (Detailed)
async function getUserById(userId) {
    const [rows] = await pool.query(
        `SELECT u.UserId, u.Username, u.Role, u.IsActive, u.WorkerId, u.CustomerId,
                w.WorkerName, c.CustomerName
         FROM users u
         LEFT JOIN worker w ON u.WorkerId = w.WorkerId
         LEFT JOIN customerdetails c ON u.CustomerId = c.CustomerId
         WHERE u.UserId = ?`,
        [userId]
    );
    return rows[0];
}

// Create User
async function createUser(userData) {
    const { Username, Password, Role, WorkerId, CustomerId } = userData;
    const hashedPassword = await bcrypt.hash(Password, 10);
    const [result] = await pool.query(
        `INSERT INTO users (Username, PasswordHash, Role, WorkerId, CustomerId, IsActive)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [Username, hashedPassword, Role, WorkerId, CustomerId]
    );
    return getUserById(result.insertId);
}

// Update User
async function updateUser(userId, updates) {
    const fields = [];
    const values = [];

    if (updates.Role) {
        fields.push('Role = ?');
        values.push(updates.Role);
    }
    if (updates.IsActive !== undefined) {
        fields.push('IsActive = ?');
        values.push(updates.IsActive);
    }
    if (updates.Password) {
        const hashedPassword = await bcrypt.hash(updates.Password, 10);
        fields.push('PasswordHash = ?');
        values.push(hashedPassword);
    }
    if (updates.WorkerId !== undefined) { // Allow null
        fields.push('WorkerId = ?');
        values.push(updates.WorkerId);
    }
    if (updates.CustomerId !== undefined) { // Allow null
        fields.push('CustomerId = ?');
        values.push(updates.CustomerId);
    }

    if (fields.length === 0) return null;

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE UserId = ?`;

    await pool.query(query, values);
    return getUserById(userId);
}

// Delete User
async function deleteUser(userId) {
    await pool.query('DELETE FROM users WHERE UserId = ?', [userId]);
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
