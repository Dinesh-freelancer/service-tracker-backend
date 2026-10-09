const pool = require('./apps/api/db');
async function run() {
  try {
    await pool.query("ALTER TABLE enquiry ADD COLUMN Status VARCHAR(50) DEFAULT 'New'").catch(() => {});

    // Add HSNCode to inventory
    try {
      await pool.query("ALTER TABLE inventory ADD COLUMN HSNCode VARCHAR(20) DEFAULT NULL");
      console.log("Added HSNCode column to inventory");
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) console.log("HSNCode:", e.message);
    }

    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        ServiceId INT AUTO_INCREMENT PRIMARY KEY,
        ServiceName VARCHAR(255) NOT NULL UNIQUE,
        SACCode VARCHAR(20) DEFAULT '998719',
        DefaultRate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        Description TEXT,
        IsActive TINYINT(1) DEFAULT 1,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Quotes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        QuoteId INT AUTO_INCREMENT PRIMARY KEY,
        QuoteNumber VARCHAR(50) NOT NULL,
        JobNumber VARCHAR(50) NOT NULL,
        Revision INT NOT NULL DEFAULT 1,
        Status ENUM('Draft','Sent','Approved','Rejected','Revised') NOT NULL DEFAULT 'Draft',
        Subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        Discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        DismantlingCharge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        TaxRate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
        TaxAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        GrandTotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        ValidityDays INT NOT NULL DEFAULT 15,
        TermsAndConditions TEXT,
        CreatedBy INT DEFAULT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_quote_number_rev (QuoteNumber, Revision),
        KEY fk_quote_job (JobNumber),
        CONSTRAINT fk_quote_job FOREIGN KEY (JobNumber) REFERENCES servicerequest (JobNumber) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Quote items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quote_items (
        QuoteItemId INT AUTO_INCREMENT PRIMARY KEY,
        QuoteId INT NOT NULL,
        ItemType ENUM('Part','Service','Custom') NOT NULL DEFAULT 'Part',
        ReferenceId INT DEFAULT NULL,
        Description VARCHAR(255) NOT NULL,
        HSNSAC VARCHAR(20) DEFAULT NULL,
        Qty DECIMAL(10,2) NOT NULL DEFAULT 1.00,
        UnitPrice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        Amount DECIMAL(10,2) GENERATED ALWAYS AS (Qty * UnitPrice) STORED,
        KEY fk_qi_quote (QuoteId),
        CONSTRAINT fk_qi_quote FOREIGN KEY (QuoteId) REFERENCES quotes (QuoteId) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Database updated successfully.");
  } catch (e) {
    console.log("Error:", e.message);
  } finally {
    process.exit(0);
  }
}
run();
