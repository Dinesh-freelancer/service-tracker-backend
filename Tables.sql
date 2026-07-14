
-- -----------------------------------------------------
-- Table `settings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (

  `SettingKey` varchar(100) NOT NULL,
  `SettingValue` text,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SettingKey`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- DATABASE RECONSTRUCTION SCRIPT
-- -----------------------------------------------------
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------
-- LEVEL 0: INDEPENDENT TABLES
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `organizations` (

  `OrganizationId` int NOT NULL AUTO_INCREMENT,
  `OrganizationName` varchar(255) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `PrimaryContact` varchar(20) DEFAULT NULL,
  `Address` text,
  `City` varchar(100) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `ZipCode` varchar(20) DEFAULT NULL,
  `GSTNumber` varchar(50) DEFAULT NULL,
  `OrganizationType` enum('Company','Apartments','Dealers','Electricals','Other') DEFAULT 'Company',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrganizationId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `suppliers` (

  `SupplierId` int NOT NULL AUTO_INCREMENT,
  `SupplierName` varchar(255) NOT NULL,
  `ContactName` varchar(255) DEFAULT NULL,
  `ContactPhone` varchar(50) DEFAULT NULL,
  `ContactEmail` varchar(255) DEFAULT NULL,
  `Address` text,
  `Notes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SupplierId`),
  UNIQUE KEY `SupplierName` (`SupplierName`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `worker` (

  `WorkerId` int NOT NULL AUTO_INCREMENT,
  `WorkerName` varchar(100) NOT NULL,
  `MobileNumber` varchar(20) DEFAULT NULL,
  `AlternateNumber` varchar(20) DEFAULT NULL,
  `WhatsappNumber` varchar(20) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `DateOfJoining` date DEFAULT NULL,
  `Skills` varchar(255) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `IsUser` tinyint(1) DEFAULT '0',
  `Notes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WorkerId`),
  KEY `idx_worker_name` (`WorkerName`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `inventory` (

  `PartId` int NOT NULL AUTO_INCREMENT,
  `PartName` varchar(100) NOT NULL,
  `Unit` varchar(10) DEFAULT 'Nos',
  `DefaultCostPrice` decimal(10,2) DEFAULT NULL,
  `DefaultSellingPrice` decimal(10,2) DEFAULT NULL,
  `Supplier` varchar(100) DEFAULT NULL,
  `QuantityInStock` decimal(10,2) DEFAULT '0.00',
  `LowStockThreshold` decimal(10,2) DEFAULT '0.00',
  `Notes` text,
  PRIMARY KEY (`PartId`),
  UNIQUE KEY `PartName` (`PartName`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `enquiry` (

  `EnquiryId` int NOT NULL AUTO_INCREMENT,
  `EnquiryDate` date NOT NULL,
  `CustomerName` varchar(100) NOT NULL,
  `ContactNumber` varchar(20) DEFAULT NULL,
  `NatureOfQuery` varchar(255) DEFAULT NULL,
  `QueryDetails` text,
  `NextFollowUpDate` date DEFAULT NULL,
  `FollowUpNotes` text,
  `EnteredBy` varchar(100) DEFAULT NULL,
  `LinkedJobNumber` varchar(50) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` varchar(50) DEFAULT 'New',
  PRIMARY KEY (`EnquiryId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `leads` (

  `LeadId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Phone` varchar(20) NOT NULL,
  `PumpType` varchar(100) DEFAULT NULL,
  `ApproxWeight` varchar(50) DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `Status` enum('New','Contacted','Converted','Closed') DEFAULT 'New',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LeadId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- LEVEL 1: DIRECT DEPENDENCIES
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `customerdetails` (

  `CustomerId` int NOT NULL AUTO_INCREMENT,
  `CustomerName` varchar(100) NOT NULL,
  `CompanyName` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `State` varchar(100) DEFAULT NULL,
  `Pincode` varchar(10) DEFAULT NULL,
  `PrimaryContact` varchar(20) DEFAULT NULL,
  `WhatsappSameAsMobile` tinyint(1) DEFAULT '0',
  `Email` varchar(255) DEFAULT NULL,
  `Designation` varchar(100) DEFAULT NULL,
  `Notes` text,
  `OrganizationId` int DEFAULT NULL,
  `CustomerType` enum('Individual','OrganizationMember') DEFAULT 'Individual',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CustomerId`),
  KEY `fk_customer_org` (`OrganizationId`),
  CONSTRAINT `fk_customer_org` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `assets` (

  `AssetId` int NOT NULL AUTO_INCREMENT,
  `CustomerId` int NOT NULL,
  `InternalTag` varchar(50) NOT NULL,
  `Brand` varchar(100) DEFAULT NULL,
  `AssetType` enum('Pumpset','Motor Only','Pump Only','Others') DEFAULT 'Pumpset',
  `PumpModel` varchar(100) DEFAULT NULL,
  `MotorModel` varchar(100) DEFAULT NULL,
  `PowerRating` decimal(10,2) DEFAULT NULL,
  `Phase` enum('1-PHASE','3-PHASE','') DEFAULT NULL,
  `SerialNumber` varchar(100) DEFAULT NULL,
  `InstallationDate` date DEFAULT NULL,
  `WarrantyExpiry` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `PumpType` varchar(100) DEFAULT NULL,
  `AssetDescription` text,
  `PowerUnit` enum('HP','KW') DEFAULT 'HP',
  PRIMARY KEY (`AssetId`),
  UNIQUE KEY `InternalTag` (`InternalTag`),
  KEY `idx_brand_serial` (`Brand`,`SerialNumber`),
  KEY `fk_asset_customer` (`CustomerId`),
  CONSTRAINT `fk_asset_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- LEVEL 2: SECONDARY DEPENDENCIES
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (

  `UserId` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('Admin','Owner','Worker','Customer') NOT NULL,
  `WorkerId` int DEFAULT NULL,
  `CustomerId` int DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Username` (`Username`),
  KEY `fk_user_worker` (`WorkerId`),
  KEY `fk_user_customer` (`CustomerId`),
  CONSTRAINT `fk_user_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `customermobilenumbers` (

  `MobileId` int NOT NULL AUTO_INCREMENT,
  `CustomerId` int NOT NULL,
  `MobileNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`MobileId`),
  KEY `fk_mobile_customer` (`CustomerId`),
  CONSTRAINT `fk_mobile_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `servicerequest` (

  `JobNumber` varchar(50) NOT NULL,
  `AssetId` int NOT NULL,
  `CustomerId` int NOT NULL,
  `DateReceived` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Intake','Assessing','Awaiting Approval','Approved','In Progress','On Hold','Completed','Ready for Pickup','Fulfilled','Cancelled','Closed') NOT NULL DEFAULT 'Intake',
  `HoldReason` varchar(255) DEFAULT NULL,
  `EstimatedAmount` decimal(10,2) DEFAULT NULL,
  `BilledAmount` decimal(10,2) DEFAULT NULL,
  `PaymentStatus` enum('Unpaid','Partial','Paid') DEFAULT 'Unpaid',
  `ResolutionType` enum('Completed Successfully','Estimate Rejected','Customer Unreachable','Change of Mind','Warranty Denied','Abandoned/Unclaimed','Duplicate','Other') DEFAULT NULL,
  `ResolutionNotes` text,
  `Notes` text,
  `EnquiryId` int DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `FailureReason` varchar(255) DEFAULT NULL,
  `FailureDescription` text,
  `ServicesNeeded` json DEFAULT NULL,
  `IsWarranty` tinyint(1) NOT NULL DEFAULT '0',
  `BillingType` enum('Chargeable','Free of Cost','Split Bill') NOT NULL DEFAULT 'Chargeable',
  PRIMARY KEY (`JobNumber`),
  KEY `fk_sr_asset` (`AssetId`),
  KEY `fk_sr_customer` (`CustomerId`),
  KEY `fk_sr_enquiry` (`EnquiryId`),
  CONSTRAINT `fk_sr_asset` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`AssetId`),
  CONSTRAINT `fk_sr_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`),
  CONSTRAINT `fk_sr_enquiry` FOREIGN KEY (`EnquiryId`) REFERENCES `enquiry` (`EnquiryId`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- LEVEL 3: TRANSACTIONAL & LOGGING
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `servicerequest_history` (

  `HistoryId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `StatusFrom` varchar(50) DEFAULT NULL,
  `StatusTo` varchar(50) NOT NULL,
  `ChangedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ChangeComments` text,
  PRIMARY KEY (`HistoryId`),
  KEY `fk_history_job` (`JobNumber`),
  CONSTRAINT `fk_history_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `partsused` (

  `PartUsedId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `PartId` int DEFAULT NULL,
  `PartName` varchar(100) NOT NULL,
  `Qty` decimal(10,2) DEFAULT '1.00',
  `CostPrice` decimal(10,2) NOT NULL,
  `SellingPrice` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PartUsedId`),
  KEY `fk_parts_job` (`JobNumber`),
  KEY `fk_parts_inventory` (`PartId`),
  CONSTRAINT `fk_parts_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`) ON DELETE SET NULL,
  CONSTRAINT `fk_parts_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `documents` (

  `DocumentId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) DEFAULT NULL,
  `AssetId` int DEFAULT NULL,
  `CustomerId` int DEFAULT NULL,
  `DocumentType` enum('Quote','Invoice','Photo','Other') NOT NULL,
  `EmbedTag` text NOT NULL,
  `CreatedBy` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `IsCustomerVisible` tinyint(1) DEFAULT '1',
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`DocumentId`),
  KEY `fk_doc_job` (`JobNumber`),
  KEY `fk_doc_asset` (`AssetId`),
  KEY `fk_doc_user` (`CreatedBy`),
  CONSTRAINT `fk_doc_asset` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`AssetId`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_user` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `payments` (

  `PaymentId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `PaymentType` enum('Advance','Final','Partial','Refund','Other') NOT NULL,
  `PaymentMode` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`PaymentId`),
  KEY `fk_payment_job` (`JobNumber`),
  CONSTRAINT `fk_payment_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `worklog` (

  `WorkLogId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `WorkerId` int DEFAULT NULL,
  `WorkDone` text,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  `WorkDate` date DEFAULT NULL,
  PRIMARY KEY (`WorkLogId`),
  KEY `fk_worklog_job` (`JobNumber`),
  KEY `fk_worklog_worker` (`WorkerId`),
  CONSTRAINT `fk_worklog_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE,
  CONSTRAINT `fk_worklog_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `purchases` (

  `PurchaseId` int NOT NULL AUTO_INCREMENT,
  `PurchaseDate` datetime NOT NULL,
  `SupplierId` int NOT NULL,
  `PurchasedBy` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `PaymentStatus` enum('Pending','Paid','Partial') DEFAULT 'Pending',
  `Notes` text,
  PRIMARY KEY (`PurchaseId`),
  KEY `fk_purch_supplier` (`SupplierId`),
  KEY `fk_purch_user` (`PurchasedBy`),
  CONSTRAINT `fk_purch_supplier` FOREIGN KEY (`SupplierId`) REFERENCES `suppliers` (`SupplierId`),
  CONSTRAINT `fk_purch_user` FOREIGN KEY (`PurchasedBy`) REFERENCES `users` (`UserId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `attendance` (

  `AttendanceId` int NOT NULL AUTO_INCREMENT,
  `WorkerId` int NOT NULL,
  `AttendanceDate` date NOT NULL,
  `Status` enum('Present','Absent','Half Day','Field Work','On Leave','Week off','Holiday') NOT NULL DEFAULT 'Present',
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  PRIMARY KEY (`AttendanceId`),
  UNIQUE KEY `uq_worker_date` (`WorkerId`,`AttendanceDate`),
  CONSTRAINT `fk_att_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `notifications` (

  `NotificationId` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Type` enum('JobUpdate','LowStock','Payment','System','JobAssignment') NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Message` text,
  `ReferenceId` varchar(50) DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`NotificationId`),
  KEY `idx_user` (`UserId`),
  KEY `idx_isread` (`IsRead`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`UserId`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `auditdetails` (

  `AuditId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) DEFAULT NULL,
  `ChangedDateTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `ActionType` varchar(50) DEFAULT NULL,
  `ChangedBy` varchar(100) DEFAULT NULL,
  `Details` text,
  PRIMARY KEY (`AuditId`),
  KEY `idx_audit_job` (`JobNumber`),
  CONSTRAINT `auditdetails_ibfk_1` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- LEVEL 4: FINAL CHILD TABLES
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `purchaseitems` (

  `PurchaseItemId` int NOT NULL AUTO_INCREMENT,
  `PurchaseId` int NOT NULL,
  `PartId` int NOT NULL,
  `Qty` decimal(10,2) NOT NULL DEFAULT '0.00',
  `UnitPrice` decimal(10,2) NOT NULL DEFAULT '0.00',
  `TotalPrice` decimal(10,2) GENERATED ALWAYS AS ((`Qty` * `UnitPrice`)) STORED,
  PRIMARY KEY (`PurchaseItemId`),
  KEY `fk_pi_purchase` (`PurchaseId`),
  KEY `fk_pi_inventory` (`PartId`),
  CONSTRAINT `fk_pi_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`),
  CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`PurchaseId`) REFERENCES `purchases` (`PurchaseId`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TRIGGER IF EXISTS `trg_update_stock_on_part_used`;
DROP TRIGGER IF EXISTS `trg_restore_stock_on_part_delete`;
DROP TRIGGER IF EXISTS `trg_adjust_stock_on_part_update`;

CREATE TABLE IF NOT EXISTS `inventory_batches` (

  `BatchId` int NOT NULL AUTO_INCREMENT,
  `PartId` int NOT NULL,
  `CostPrice` decimal(10,2) NOT NULL,
  `OriginalQty` decimal(10,2) NOT NULL,
  `QuantityRemaining` decimal(10,2) NOT NULL,
  `SourceType` enum('Purchase','Adjustment','Return') DEFAULT 'Adjustment',
  `SourceId` int DEFAULT NULL,
  `ReceivedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`BatchId`),
  KEY `fk_batch_inventory` (`PartId`),
  CONSTRAINT `fk_batch_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `windingdetails` (

  `id` int NOT NULL AUTO_INCREMENT,
  `AssetId` int NOT NULL,
  `hp` decimal(5,2) NOT NULL,
  `kw` decimal(5,2) DEFAULT NULL,
  `phase` enum('1-PHASE','3-PHASE') NOT NULL,
  `slots` int DEFAULT NULL,
  `connection_type` enum('STAR','DELTA','NONE') DEFAULT 'NONE',
  `swg_run` int DEFAULT NULL,
  `swg_start` int DEFAULT NULL,
  `swg_3phase` int DEFAULT NULL,
  `wire_id_run` decimal(5,3) DEFAULT NULL,
  `wire_od_run` decimal(5,3) DEFAULT NULL,
  `wire_id_start` decimal(5,3) DEFAULT NULL,
  `wire_od_start` decimal(5,3) DEFAULT NULL,
  `wire_id_3phase` decimal(5,3) DEFAULT NULL,
  `wire_od_3phase` decimal(5,3) DEFAULT NULL,
  `turns_run` int DEFAULT NULL,
  `turns_start` int DEFAULT NULL,
  `turns_3phase` int DEFAULT NULL,
  `slot_turns_run` json DEFAULT NULL,
  `slot_turns_start` json DEFAULT NULL,
  `slot_turns_3phase` json DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `weight` decimal(6,3) DEFAULT NULL,
  `weight_run` decimal(6,3) DEFAULT NULL,
  `weight_start` decimal(6,3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_winding_asset` (`AssetId`),
  CONSTRAINT `fk_asset_id` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`AssetId`) ON DELETE CASCADE ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `spare_price_search` (

  `id` bigint NOT NULL AUTO_INCREMENT,
  `pump_category` varchar(50) NOT NULL,
  `pump_type` varchar(120) NOT NULL,
  `pump_size` varchar(50) NOT NULL,
  `spare_name` varchar(200) NOT NULL,
  `basic_material` varchar(150) NOT NULL,
  `part_no` varchar(100) DEFAULT NULL,
  `sap_material` varchar(100) DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `uom` varchar(20) NOT NULL,
  `last_synced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_spare` (`pump_category`,`pump_type`,`pump_size`,`spare_name`,`basic_material`),
  KEY `idx_spare_name` (`spare_name`),
  KEY `idx_part_no` (`part_no`),
  KEY `idx_pump` (`pump_category`,`pump_type`,`pump_size`),
  KEY `idx_price` (`unit_price`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS `warranty_claims` (

  `ClaimId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `OEMManufacturer` varchar(100) DEFAULT NULL,
  `WarrantyStatus` enum('Pending SR Completion','Claim Submitted','FOC Approved','FOC Annexure sent through Post') NOT NULL DEFAULT 'Pending SR Completion',
  `ClaimReferenceNumber` varchar(100) DEFAULT NULL,
  `PartReplacementDetails` json DEFAULT NULL,
  `OEMCreditNoteAmount` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ClaimId`),
  UNIQUE KEY `uk_job_number` (`JobNumber`),
  CONSTRAINT `fk_warranty_sr` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------

DELIMITER //

-- Track Service Request Status Changes
CREATE TRIGGER `trg_after_status_update`
AFTER UPDATE ON `servicerequest`
FOR EACH ROW
BEGIN
    IF OLD.Status <> NEW.Status THEN
        INSERT INTO `servicerequest_history` (JobNumber, StatusFrom, StatusTo, ChangeComments)
        VALUES (NEW.JobNumber, OLD.Status, NEW.Status, CONCAT('Status updated from ', OLD.Status, ' to ', NEW.Status));
    END IF;
END //

-- Generate Readable Internal Tag for Assets
CREATE TRIGGER `trg_before_asset_insert`
BEFORE INSERT ON `assets`
FOR EACH ROW
BEGIN
    IF NEW.InternalTag IS NULL OR NEW.InternalTag = '' THEN
        SET NEW.InternalTag = CONCAT('PUMP-', DATE_FORMAT(NOW(), '%y%m'), '-', LPAD(FLOOR(RAND() * 9999), 4, '0'));
    END IF;
END //

-- Automatically deduct inventory stock when parts are used
DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
CREATE TABLE IF NOT EXISTS `sales_items` (

  `ItemId` int NOT NULL AUTO_INCREMENT,
  `Category` enum('Refurbished Motors','Motor Spares') NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Status` enum('Available','Out of stock') NOT NULL DEFAULT 'Available',
  `Specs` json DEFAULT NULL,
  `Images` json DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ItemId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS `todos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Description` text,
  `RelatedJobNumber` varchar(50) DEFAULT NULL,
  `Priority` enum('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  `Category` enum('Service Request', 'Billing and Payment', 'Administrative', 'Customer Communication', 'Sales and Leads', 'Other') NOT NULL DEFAULT 'Other',
  `Status` enum('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `DueDate` datetime DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `idx_todo_job` (`RelatedJobNumber`),
  CONSTRAINT `fk_todo_job` FOREIGN KEY (`RelatedJobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `subtasks` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `TodoId` int NOT NULL,
  `Title` varchar(255) NOT NULL,
  `IsCompleted` tinyint(1) DEFAULT '0',
  `DueDate` datetime DEFAULT NULL,
  `Status` enum('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `fk_subtask_todo` (`TodoId`),
  CONSTRAINT `fk_subtask_todo_1` FOREIGN KEY (`TodoId`) REFERENCES `todos` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS annexure (
    AnnexNumber VARCHAR(100) PRIMARY KEY,
    InvoiceNumber VARCHAR(100),
    ClaimAmount DECIMAL(12, 2),
    PostService TEXT,
    ConsignmentNumber VARCHAR(255),
    PostDate DATE
);

CREATE TABLE IF NOT EXISTS free_of_cost_claims (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    JobNumber VARCHAR(50),
    SRNumber TEXT NOT NULL,
    SRDate TEXT NOT NULL,
    SRType ENUM('Repair', 'Site Visit'),
    ClaimStatus ENUM('Pending', 'On Hold', 'Submitted', 'Approved', 'Post Sent', 'False'),
    FOCNumber VARCHAR(15),
    ClaimAmount DECIMAL(10, 2),
    Notes TEXT,
    AnnexNumber VARCHAR(100) NULL,
    FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber) ON DELETE SET NULL,
    FOREIGN KEY (AnnexNumber) REFERENCES annexure(AnnexNumber) ON DELETE SET NULL
);
