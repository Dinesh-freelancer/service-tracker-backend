const path = require('path');
const dotenv = require('dotenv');

// Load .env from apps/api/ (primary) or root (fallback)
const apiEnvPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: apiEnvPath });
if (result.error) {
    const rootEnvPath = path.resolve(__dirname, '../../.env');
    dotenv.config({ path: rootEnvPath });
}

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'service_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

module.exports = pool;