const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

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
  multipleStatements: true, // Enable multiple statements for the seed script
};

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database server.');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'service_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} created or already exists.`);

    await connection.changeUser({ database: dbName });
    console.log(`Switched to database ${dbName}.`);

    // --- Schema Creation ---
    console.log('Creating tables...');

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        UserId INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(255) UNIQUE NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        Role ENUM('Owner', 'Admin', 'Worker', 'Customer') NOT NULL,
        WorkerId INT DEFAULT NULL,
        CustomerId INT DEFAULT NULL,
        IsActive TINYINT(1) DEFAULT 1,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Customers Table (customerdetails)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customerdetails (
        CustomerId INT AUTO_INCREMENT PRIMARY KEY,
        CustomerName VARCHAR(255) NOT NULL,
        CompanyName VARCHAR(255),
        Address TEXT,
        City VARCHAR(100),
        State VARCHAR(100),
        ZipCode VARCHAR(20),
        Phone1 VARCHAR(20),
        Phone2 VARCHAR(20),
        WhatsApp VARCHAR(20),
        Email VARCHAR(255),
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Workers Table (worker)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS worker (
        WorkerId INT AUTO_INCREMENT PRIMARY KEY,
        WorkerName VARCHAR(255) NOT NULL,
        Phone VARCHAR(20),
        Skills TEXT,
        DateOfJoining DATE,
        IsActive TINYINT(1) DEFAULT 1,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add Foreign Keys to Users (Circular dependency handling: Create tables first, then add FKs if needed, or just rely on IDs existing)
    // For simplicity in seed, we assume order is fine or allow loose FK creation if tables exist.
    // Alter table to add constraints if strictly needed, but standard creates work if referenced table exists.
    // Since users references worker/customer, those must exist. But logic in app is often loose.
    // We will add constraints via ALTER to be safe if they don't exist yet, but for now simple CREATE is okay.
    // Actually, `users` references `worker` and `customerdetails`. So we should create them first?
    // The previous schema had `users` referencing them. Let's do that properly.
    // Re-ordering: create worker/customer first, then users. But users is often root.
    // Let's stick to the order: worker -> customerdetails -> users.

    // Inventory Table (inventory)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        PartId INT NOT NULL AUTO_INCREMENT,
        PartName VARCHAR(255) NOT NULL UNIQUE,
        Unit ENUM('Nos', 'Kg', 'Ltr', 'Meter', 'Pair') NOT NULL,
        QuantityInStock DECIMAL(10,2) NOT NULL DEFAULT 0,
        LowStockThreshold DECIMAL(10,2) NOT NULL DEFAULT 0,
        CostPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        SellingPrice DECIMAL(10,2),
        SupplierId INT,
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (PartId)
      )
    `);

    // Service Requests (Jobs) Table (servicerequest)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS servicerequest (
        JobNumber VARCHAR(50) NOT NULL PRIMARY KEY,
        CustomerId INT NOT NULL,
        PumpBrand VARCHAR(100),
        PumpModel VARCHAR(100),
        MotorBrand VARCHAR(100),
        MotorModel VARCHAR(100),
        MotorSerialNo VARCHAR(100),
        HP DECIMAL(5,2),
        KW DECIMAL(5,2),
        Phase VARCHAR(50),
        Poles INT,
        DateReceived DATETIME NOT NULL,
        EstimatedCompletionDate DATE,
        EstimatedAmount DECIMAL(12,2),
        BilledAmount DECIMAL(12,2),
        Status ENUM('Received', 'Estimated', 'Approved By Customer', 'Declined By Customer', 'Work In Progress', 'Completed', 'Delivered', 'Closed') DEFAULT 'Received',
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId)
      )
    `);

    // Work Logs Table (worklog)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS worklog (
        WorkLogId INT NOT NULL AUTO_INCREMENT,
        JobNumber VARCHAR(50) NOT NULL,
        WorkDescription VARCHAR(255),
        SubStatus ENUM('Inspection', 'Winding', 'Lathe Machining', 'Assembling', 'Testing', 'Delivery Prep') NOT NULL,
        AssignedWorker INT NOT NULL,
        StartTime DATETIME,
        EndTime DATETIME,
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (WorkLogId),
        FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
        FOREIGN KEY (AssignedWorker) REFERENCES worker(WorkerId)
      )
    `);

    // Parts Used Table (partsused)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partsused (
        PartUsedId INT NOT NULL AUTO_INCREMENT,
        JobNumber VARCHAR(50) NOT NULL,
        PartId INT NOT NULL,
        Qty DECIMAL(10,2) NOT NULL DEFAULT 0,
        CostPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        SellingPrice DECIMAL(10,2),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (PartUsedId),
        FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
        FOREIGN KEY (PartId) REFERENCES inventory(PartId)
      )
    `);

    // Notifications Table (notifications)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        NotificationId INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NOT NULL,
        Type ENUM('JobStatus', 'StockAlert', 'Assignment', 'General') NOT NULL,
        Message TEXT NOT NULL,
        IsRead BOOLEAN DEFAULT FALSE,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserId) REFERENCES users(UserId) ON DELETE CASCADE
      )
    `);

    console.log('Tables created successfully.');

    // --- Seeding Data ---
    console.log('Seeding initial data...');

    // 1. Seed Users (Owner, Admin, Worker, Customer)
    const saltRounds = 10;
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if users exist to avoid duplicates if re-run (rudimentary check)
    const [existingUsers] = await connection.query('SELECT Count(*) as count FROM users');

    if (existingUsers[0].count === 0) {
        // Create Workers & Customers first to get IDs?
        // For simplicity in this seed, we create users first with NULL FKs, then update if needed,
        // OR we just create them as standalone since this is a basic seed.

        const usersValues = [
            ['owner', hashedPassword, 'Owner'],
            ['admin', hashedPassword, 'Admin'],
            ['worker1', hashedPassword, 'Worker'],
            ['customer1', hashedPassword, 'Customer']
        ];
        // Note: Missing WorkerId/CustomerId in values, assuming defaults NULL are fine for now.
        await connection.query('INSERT INTO users (Username, PasswordHash, Role) VALUES ?', [usersValues]);
        console.log('Users seeded.');

        // Get UserIds
        const [users] = await connection.query('SELECT UserId, Username, Role FROM users');
        const workerUser = users.find(u => u.Role === 'Worker');
        const customerUser = users.find(u => u.Role === 'Customer');

        // 2. Seed Workers
        if (workerUser) {
            await connection.query('INSERT INTO worker (WorkerName, Phone, Skills) VALUES (?, ?, ?)',
                ['Rajesh Kumar', '9876543210', 'Winding, Assembly']);
            console.log('Workers seeded.');
            // Link back to User
            const [workers] = await connection.query('SELECT WorkerId FROM worker LIMIT 1');
            if(workers.length > 0) {
                 await connection.query('UPDATE users SET WorkerId = ? WHERE UserId = ?', [workers[0].WorkerId, workerUser.UserId]);
            }
        }

        // 3. Seed Customers
        if (customerUser) {
            await connection.query('INSERT INTO customerdetails (CustomerName, CompanyName, Email, Phone1, Address) VALUES (?, ?, ?, ?, ?)',
                ['Alpha Industries', 'Alpha Corp', 'sharma@alpha.com', '9876543210', '123 Industrial Estate, Guindy, Chennai']);
            console.log('Customers seeded.');
             // Link back to User
            const [customers] = await connection.query('SELECT CustomerId FROM customerdetails LIMIT 1');
            if(customers.length > 0) {
                 await connection.query('UPDATE users SET CustomerId = ? WHERE UserId = ?', [customers[0].CustomerId, customerUser.UserId]);
            }
        }

        // 4. Seed Inventory
        const inventoryValues = [
            ['Copper Wire 24SWG', 'Kg', 50, 10, 850.00, 'Rack A1'],
            ['Ball Bearing 6204', 'Nos', 20, 5, 250.00, 'Rack B2']
        ];
        await connection.query('INSERT INTO inventory (PartName, Unit, QuantityInStock, LowStockThreshold, CostPrice, Notes) VALUES ?', [inventoryValues]);
        console.log('Inventory seeded.');

        // 5. Seed Service Requests (Jobs)
        const [customers] = await connection.query('SELECT CustomerId FROM customerdetails LIMIT 1');
        if (customers.length > 0) {
             const customerId = customers[0].CustomerId;
             const [workers] = await connection.query('SELECT WorkerId FROM worker LIMIT 1'); // Fixed table name
             // const workerId = workers.length > 0 ? workers[0].WorkerId : null;

             // servicerequest (JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, DateReceived, Status, EstimatedAmount, Notes)
             // JobNumber must be unique string
             const jobsValues = [
                 ['JOB-2023-001', customerId, 'Kirloskar', 'KDS', 'Siemens', '1HP', 1.0, new Date(), 'Received', 1500, 'Motor burnt out'],
                 ['JOB-2023-002', customerId, 'Texmo', 'T-500', 'Texmo', '5HP', 5.0, new Date(), 'Work In Progress', 5000, 'Water seal leakage']
             ];
             await connection.query('INSERT INTO servicerequest (JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, DateReceived, Status, EstimatedAmount, Notes) VALUES ?', [jobsValues]);
             console.log('Service Requests seeded.');
        }

    } else {
        console.log('Data already exists, skipping seed insertion.');
    }

    console.log('Database seeded successfully.');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
