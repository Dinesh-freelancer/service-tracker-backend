CREATE TABLE IF NOT EXISTS Leads (
    LeadId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    PumpType VARCHAR(100),
    ApproxWeight VARCHAR(50),
    Location VARCHAR(255),
    Status ENUM('New', 'Contacted', 'Converted', 'Closed') DEFAULT 'New',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
