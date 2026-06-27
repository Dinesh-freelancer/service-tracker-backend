ALTER TABLE `servicerequest`
  ADD COLUMN `IsWarranty` boolean NOT NULL DEFAULT FALSE,
  ADD COLUMN `BillingType` enum('Chargeable', 'Free of Cost', 'Split Bill') NOT NULL DEFAULT 'Chargeable';

CREATE TABLE `warranty_claims` (
  `ClaimId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `OEMManufacturer` varchar(100) DEFAULT NULL,
  `WarrantyStatus` enum('Pending SR Completion', 'Claim Submitted', 'FOC Approved', 'FOC Annexure sent through Post') NOT NULL DEFAULT 'Pending SR Completion',
  `ClaimReferenceNumber` varchar(100) DEFAULT NULL,
  `PartReplacementDetails` json DEFAULT NULL,
  `OEMCreditNoteAmount` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ClaimId`),
  UNIQUE KEY `uk_job_number` (`JobNumber`),
  CONSTRAINT `fk_warranty_sr` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
);
