require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });
        console.log('Connected to the database successfully.');

        // Retrieve and display test data from your CustomerDetails table
        const [rows, fields] = await connection.execute('SELECT * FROM CustomerDetails LIMIT 5;');
        console.log('Sample data from CustomerDetails:', rows);

        await connection.end();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

testConnection();