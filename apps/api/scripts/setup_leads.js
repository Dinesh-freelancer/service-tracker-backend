const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

// Try loading from apps/api/.env first, then fallback to root .env
const result = dotenv.config({ path: envPath });
if (result.error) {
  dotenv.config({ path: rootEnvPath });
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'service_db',
  multipleStatements: true,
};

async function setupLeads() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database server.');

    const sqlPath = path.resolve(__dirname, 'create_leads_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing create_leads_table.sql...');
    await connection.query(sql);
    console.log('Leads table created successfully.');

  } catch (err) {
    console.error('Error setting up Leads table:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupLeads();
