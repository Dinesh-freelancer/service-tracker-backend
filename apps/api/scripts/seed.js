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

    // 1. users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        UserId INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(255) UNIQUE NOT NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        Role ENUM('Admin', 'Owner', 'Worker', 'Customer') NOT NULL,
        WorkerId INT DEFAULT NULL,
        CustomerId INT DEFAULT NULL,
        IsActive TINYINT(1) DEFAULT 1,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. customerdetails Table
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

    // 3. enquiry Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enquiry (
        EnquiryId INT AUTO_INCREMENT PRIMARY KEY,
        CustomerId INT NOT NULL,
        MotorDetails TEXT,
        EnquiryDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        Status ENUM('New', 'Contacted', 'Quoted', 'Closed') DEFAULT 'New',
        FollowUpNotes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId)
      )
    `);

    // 4. servicerequest Table
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

    // 6. worker Table (Created before worklog for FK)
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

    // 5. worklog Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS worklog (
        WorkLogId INT AUTO_INCREMENT PRIMARY KEY,
        JobNumber VARCHAR(50) NOT NULL,
        WorkDescription VARCHAR(255),
        SubStatus ENUM('Inspection', 'Winding', 'Lathe Machining', 'Assembling', 'Testing', 'Delivery Prep') NOT NULL,
        AssignedWorker INT NOT NULL,
        StartTime DATETIME,
        EndTime DATETIME,
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
        FOREIGN KEY (AssignedWorker) REFERENCES worker(WorkerId)
      )
    `);

    // 7. attendance Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        AttendanceId INT AUTO_INCREMENT PRIMARY KEY,
        WorkerId INT NOT NULL,
        AttendanceDate DATE NOT NULL,
        Status ENUM('Present', 'Absent', 'Leave', 'Holiday') DEFAULT 'Present',
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (WorkerId) REFERENCES worker(WorkerId)
      )
    `);

    // 11. suppliers Table (Created before inventory for FK)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        SupplierId INT AUTO_INCREMENT PRIMARY KEY,
        SupplierName VARCHAR(255) NOT NULL UNIQUE,
        ContactName VARCHAR(255),
        ContactPhone VARCHAR(50),
        ContactEmail VARCHAR(255),
        Address TEXT,
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 8. inventory Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        PartId INT AUTO_INCREMENT PRIMARY KEY,
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
        FOREIGN KEY (SupplierId) REFERENCES suppliers(SupplierId)
      )
    `);

    // 9. partsused Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partsused (
        PartUsedId INT AUTO_INCREMENT PRIMARY KEY,
        JobNumber VARCHAR(50) NOT NULL,
        PartId INT NOT NULL,
        Qty DECIMAL(10,2) NOT NULL DEFAULT 0,
        CostPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        SellingPrice DECIMAL(10,2),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
        FOREIGN KEY (PartId) REFERENCES inventory(PartId)
      )
    `);

    // 10. payments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        PaymentId INT AUTO_INCREMENT PRIMARY KEY,
        JobNumber VARCHAR(50) NOT NULL,
        PaymentDate DATETIME NOT NULL,
        Amount DECIMAL(12,2) NOT NULL,
        PaymentType ENUM('Advance', 'Partial', 'Final') DEFAULT 'Final',
        PaymentMode ENUM('Cash', 'Cheque', 'Online', 'Credit') DEFAULT 'Cash',
        ReceivedBy INT,
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
        FOREIGN KEY (ReceivedBy) REFERENCES users(UserId)
      )
    `);

    // 12. purchases Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        PurchaseId INT AUTO_INCREMENT PRIMARY KEY,
        PurchaseDate DATETIME NOT NULL,
        SupplierId INT NOT NULL,
        PurchasedBy INT NOT NULL,
        Notes TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (SupplierId) REFERENCES suppliers(SupplierId),
        FOREIGN KEY (PurchasedBy) REFERENCES users(UserId)
      )
    `);

    // 13. purchaseitems Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchaseitems (
        PurchaseItemId INT AUTO_INCREMENT PRIMARY KEY,
        PurchaseId INT NOT NULL,
        PartId INT NOT NULL,
        Qty DECIMAL(10,2) NOT NULL DEFAULT 0,
        UnitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        TotalPrice DECIMAL(10,2) AS (Qty * UnitPrice) STORED,
        Notes TEXT,
        PRIMARY KEY (PurchaseItemId),
        FOREIGN KEY (PurchaseId) REFERENCES purchases(PurchaseId) ON DELETE CASCADE,
        FOREIGN KEY (PartId) REFERENCES inventory(PartId)
      )
    `);

    // 14. windingdetails Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS windingdetails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jobNumber VARCHAR(50) NOT NULL,
        hp DECIMAL(5,2) NOT NULL,
        kw DECIMAL(5,2),
        phase ENUM('1-PHASE', '3-PHASE') NOT NULL,
        connection_type ENUM('STAR', 'DELTA', 'NONE') DEFAULT 'NONE',
        swg_run INT,
        swg_start INT,
        swg_3phase INT,
        wire_id_run DECIMAL(5,3),
        wire_od_run DECIMAL(5,3),
        wire_id_start DECIMAL(5,3),
        wire_od_start DECIMAL(5,3),
        wire_id_3phase DECIMAL(5,3),
        wire_od_3phase DECIMAL(5,3),
        turns_run INT,
        turns_start INT,
        turns_3phase INT,
        slot_turns_run JSON,
        slot_turns_start JSON,
        slot_turns_3phase JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_winding_job FOREIGN KEY (jobNumber) REFERENCES servicerequest(JobNumber)
      )
    `);

    // 15. documents Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        DocumentId INT AUTO_INCREMENT PRIMARY KEY,
        JobNumber VARCHAR(50) NULL,
        CustomerId INT NULL,
        DocumentType ENUM('Quote', 'Invoice', 'Photo', 'Other') NOT NULL,
        EmbedTag TEXT NOT NULL,
        CreatedBy INT NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
        FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId),
        FOREIGN KEY (CreatedBy) REFERENCES users(UserId)
      )
    `);

    // 16. auditdetails Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS auditdetails (
        AuditId INT AUTO_INCREMENT PRIMARY KEY,
        ActionType VARCHAR(255) NOT NULL,
        ChangedBy INT NOT NULL,
        Details TEXT,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ChangedBy) REFERENCES users(UserId)
      )
    `);

    // 17. summaryreports Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS summaryreports (
        ReportId INT AUTO_INCREMENT PRIMARY KEY,
        ReportDate DATE NOT NULL,
        ReportType ENUM('Daily', 'Weekly', 'Monthly') NOT NULL,
        JobsCount INT DEFAULT 0,
        PaymentsCount INT DEFAULT 0,
        PaymentsTotal DECIMAL(12,2) DEFAULT 0,
        AttendanceCount INT DEFAULT 0,
        PartsUsedCount INT DEFAULT 0,
        PartsUsedTotal DECIMAL(12,2) DEFAULT 0,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_report (ReportDate, ReportType)
      )
    `);

    // 18. leads Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        LeadId INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255) NOT NULL,
        Phone VARCHAR(20) NOT NULL,
        PumpType VARCHAR(100),
        ApproxWeight VARCHAR(50),
        Location VARCHAR(255),
        Status ENUM('New', 'Contacted', 'Converted', 'Closed') DEFAULT 'New',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications Table (Added in previous step, ensuring it's here)
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

        const usersValues = [
            ['owner', hashedPassword, 'Owner'],
            ['admin', hashedPassword, 'Admin'],
            ['worker1', hashedPassword, 'Worker'],
            ['customer1', hashedPassword, 'Customer']
        ];
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
