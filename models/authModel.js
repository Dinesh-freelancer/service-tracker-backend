const pool = require('../db');
const bcrypt = require('bcrypt');

// Register a new user
async function registerUser(userData) {
    const { Username, Password, Role, WorkerId, CustomerId } = userData;
    const hashedPassword = await bcrypt.hash(Password, 10);
    const [result] = await pool.query(
        `INSERT INTO users (Username, PasswordHash, Role, WorkerId, CustomerId)
     VALUES (?, ?, ?, ?, ?)`, [Username, hashedPassword, Role, WorkerId, CustomerId]
    );
    return result.insertId;
}

// Find user by username
async function findUserByUsername(username) {
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE Username = ? AND IsActive = 1', [username]
    );
    return rows[0];
}

// Update user password
async function updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
        'UPDATE users SET PasswordHash = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE UserId = ?', [hashedPassword, userId]
    );
}

module.exports = {
    registerUser,
    findUserByUsername,
    updatePassword
};