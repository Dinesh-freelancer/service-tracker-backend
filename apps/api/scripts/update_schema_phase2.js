const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load .env if running standalone

async function updateSchema() {
  let connection;
  try {
    // Connect to MySQL
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true, // Allow multiple SQL statements
    };

    // If DB_NAME is set, connect to it directly, otherwise connect to server to create DB
    if (process.env.DB_NAME) {
      connectionConfig.database = process.env.DB_NAME;
    } else {
        connectionConfig.database = 'service_db';
    }

    console.log('Connecting to database...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected.');

    // 1. Create organizations table
    console.log('Creating organizations table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        OrganizationId INT AUTO_INCREMENT PRIMARY KEY,
        OrganizationName VARCHAR(255) NOT NULL,
        Email VARCHAR(255),
        PrimaryContact VARCHAR(20),
        Address TEXT,
        City VARCHAR(100),
        State VARCHAR(100),
        ZipCode VARCHAR(20),
        GSTNumber VARCHAR(50),
        OrganizationType ENUM('Company', 'Apartments', 'Dealers', 'Electricals', 'Other') DEFAULT 'Company',
        Role VARCHAR(100),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Create customermobilenumbers table
    console.log('Creating customermobilenumbers table...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS customermobilenumbers (
            MobileId INT NOT NULL AUTO_INCREMENT,
            CustomerId INT NOT NULL,
            MobileNumber VARCHAR(20) DEFAULT NULL,
            PRIMARY KEY (MobileId),
            KEY CustomerId (CustomerId),
            CONSTRAINT customermobilenumbers_ibfk_1 FOREIGN KEY (CustomerId) REFERENCES customerdetails (CustomerId) ON DELETE CASCADE
        )
    `);

    // 3. Alter customerdetails table
    console.log('Altering customerdetails table...');

    // Check if columns exist before adding to be idempotent
    const [columns] = await connection.query(`SHOW COLUMNS FROM customerdetails`);
    const columnNames = columns.map(c => c.Field);

    // Rename WhatsappNumber -> PrimaryContact (if WhatsappNumber exists and PrimaryContact doesn't)
    if (columnNames.includes('WhatsappNumber') && !columnNames.includes('PrimaryContact')) {
        await connection.query(`ALTER TABLE customerdetails CHANGE COLUMN WhatsappNumber PrimaryContact VARCHAR(20)`);
        console.log('Renamed WhatsappNumber to PrimaryContact');
    } else if (!columnNames.includes('PrimaryContact')) {
        // If WhatsappNumber didn't exist (fresh DB?) or was already renamed
        // Check if Phone1 exists (from previous seed) and rename THAT or add new
        if (columnNames.includes('Phone1')) {
             await connection.query(`ALTER TABLE customerdetails CHANGE COLUMN Phone1 PrimaryContact VARCHAR(20)`);
             console.log('Renamed Phone1 to PrimaryContact');
        } else {
             await connection.query(`ALTER TABLE customerdetails ADD COLUMN PrimaryContact VARCHAR(20)`);
             console.log('Added PrimaryContact column');
        }
    }

    // Add OrganizationId
    if (!columnNames.includes('OrganizationId')) {
        await connection.query(`ALTER TABLE customerdetails ADD COLUMN OrganizationId INT DEFAULT NULL`);
        await connection.query(`ALTER TABLE customerdetails ADD FOREIGN KEY (OrganizationId) REFERENCES organizations(OrganizationId)`);
        console.log('Added OrganizationId column');
    }

    // Add CustomerType
    if (!columnNames.includes('CustomerType')) {
        await connection.query(`ALTER TABLE customerdetails ADD COLUMN CustomerType ENUM('Individual', 'OrganizationMember') DEFAULT 'Individual'`);
        console.log('Added CustomerType column');
    }

    // Add Designation
    if (!columnNames.includes('Designation')) {
        await connection.query(`ALTER TABLE customerdetails ADD COLUMN Designation VARCHAR(100)`);
        console.log('Added Designation column');
    }

    console.log('Schema update complete.');

  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateSchema();
