require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcrypt');

async function seed() {
    console.log('Starting seed process...');

    try {
        const connection = await db.getConnection();

        console.log('Seeding Users...');
        const passwordHash = await bcrypt.hash('password123', 10);

        const users = [
            { Username: 'admin', Role: 'Admin' },
            { Username: 'owner', Role: 'Owner' },
            { Username: 'worker1', Role: 'Worker', WorkerId: 1 },
            { Username: 'customer1', Role: 'Customer', CustomerId: 1 }
        ];

        for (const user of users) {
            const [existing] = await connection.query('SELECT * FROM users WHERE Username = ?', [user.Username]);
            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO users (Username, PasswordHash, Role, WorkerId, CustomerId) VALUES (?, ?, ?, ?, ?)',
                    [user.Username, passwordHash, user.Role, user.WorkerId || null, user.CustomerId || null]
                );
            }
        }

        console.log('Seeding completed successfully.');
        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
