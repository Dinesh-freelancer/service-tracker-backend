CREATE TABLE IF NOT EXISTS free_of_cost_claims (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    JobNumber VARCHAR(50),
    SRNumber TEXT NOT NULL,
    SRDate TEXT NOT NULL,
    SRType ENUM('Repair', 'Site Visit'),
    ClaimStatus ENUM('Pending', 'On Hold', 'Submitted', 'Approved', 'Post Sent'),
    ClaimAmount DECIMAL(10, 2),
    Notes TEXT,
    FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber) ON DELETE SET NULL
);
