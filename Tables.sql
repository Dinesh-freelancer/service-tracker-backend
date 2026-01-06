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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  PRIMARY KEY (`EnquiryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- LEVEL 1: DIRECT DEPENDENCIES
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `customerdetails` (
  `CustomerId` int NOT NULL AUTO_INCREMENT,
  `CustomerName` varchar(100) NOT NULL,
  `CompanyName` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `PrimaryContact` varchar(20) DEFAULT NULL,
  `WhatsappSameAsMobile` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `OrganizationId` int DEFAULT NULL,
  `CustomerType` enum('Individual','OrganizationMember') DEFAULT 'Individual',
  `Designation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`CustomerId`),
  KEY `idx_customer_name` (`CustomerName`),
  CONSTRAINT `fk_customer_org` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `assets` (
  `AssetId` int NOT NULL AUTO_INCREMENT,
  `CustomerId` int NOT NULL,
  `InternalTag` varchar(50) NOT NULL UNIQUE,
  `PumpBrand` varchar(100) NOT NULL,
  `PumpModel` varchar(100) NOT NULL,
  `MotorBrand` varchar(100) DEFAULT NULL,
  `MotorModel` varchar(100) DEFAULT NULL,
  `HP` decimal(10,2) DEFAULT NULL,
  `SerialNumber` varchar(100) DEFAULT NULL,
  `InstallationDate` date DEFAULT NULL,
  `WarrantyExpiry` date DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AssetId`),
  INDEX `idx_brand_serial` (`PumpBrand`, `SerialNumber`),
  CONSTRAINT `fk_asset_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `Username` (`Username`),
  CONSTRAINT `fk_user_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `customermobilenumbers` (
  `MobileId` int NOT NULL AUTO_INCREMENT,
  `CustomerId` int NOT NULL,
  `MobileNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`MobileId`),
  CONSTRAINT `fk_mobile_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `servicerequest` (
  `JobNumber` varchar(50) NOT NULL,
  `AssetId` int NOT NULL,
  `CustomerId` int NOT NULL,
  `DateReceived` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Intake', 'Assessing', 'Awaiting Approval', 'Approved', 'In Progress', 'On Hold', 'Completed', 'Ready for Pickup', 'Fulfilled', 'Cancelled', 'Closed') NOT NULL DEFAULT 'Intake',
  `HoldReason` varchar(255) DEFAULT NULL,
  `EstimatedAmount` decimal(10,2) DEFAULT NULL,
  `BilledAmount` decimal(10,2) DEFAULT NULL,
  `PaymentStatus` enum('Unpaid', 'Partial', 'Paid') DEFAULT 'Unpaid',
  `ResolutionType` enum('Completed Successfully', 'Estimate Rejected', 'Customer Unreachable', 'Change of Mind', 'Warranty Denied', 'Abandoned/Unclaimed', 'Duplicate', 'Other') DEFAULT NULL,
  `ResolutionNotes` text,
  `Notes` text,
  `EnquiryId` int DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`JobNumber`),
  CONSTRAINT `fk_sr_asset` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`AssetId`),
  CONSTRAINT `fk_sr_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`),
  CONSTRAINT `fk_sr_enquiry` FOREIGN KEY (`EnquiryId`) REFERENCES `enquiry` (`EnquiryId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- LEVEL 3: TRANSACTIONAL & LOGGING
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `servicerequest_history` (
  `HistoryId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `StatusFrom` varchar(50) DEFAULT NULL,
  `StatusTo` varchar(50) NOT NULL,
  `ChangedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ChangeComments` text,
  PRIMARY KEY (`HistoryId`),
  CONSTRAINT `fk_history_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `partsused` (
  `PartUsedId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `PartId` int DEFAULT NULL,
  `PartName` varchar(100) NOT NULL,
  `Qty` decimal(10,2) DEFAULT '1.00',
  `CostPrice` decimal(10,2) NOT NULL,
  `BilledPrice` decimal(10,2) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PartUsedId`),
  CONSTRAINT `fk_parts_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE,
  CONSTRAINT `fk_parts_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `documents` (
  `DocumentId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) DEFAULT NULL,
  `AssetId` int DEFAULT NULL,
  `CustomerId` int DEFAULT NULL,
  `DocumentType` enum('Quote','Invoice','Photo','Other') NOT NULL,
  `EmbedTag` text NOT NULL,
  `CreatedBy` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DocumentId`),
  CONSTRAINT `fk_doc_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_asset` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`AssetId`) ON DELETE SET NULL,
  CONSTRAINT `fk_doc_user` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payments` (
  `PaymentId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `PaymentType` enum('Advance','Final','Partial','Refund','Other') NOT NULL,
  `PaymentMode` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`PaymentId`),
  CONSTRAINT `fk_payment_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `worklog` (
  `WorkLogId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `WorkerId` int DEFAULT NULL,
  `WorkDone` text,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  `WorkDate` date DEFAULT NULL,
  PRIMARY KEY (`WorkLogId`),
  CONSTRAINT `fk_worklog_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE,
  CONSTRAINT `fk_worklog_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `purchases` (
  `PurchaseId` int NOT NULL AUTO_INCREMENT,
  `PurchaseDate` datetime NOT NULL,
  `SupplierId` int NOT NULL,
  `PurchasedBy` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PurchaseId`),
  CONSTRAINT `fk_purch_supplier` FOREIGN KEY (`SupplierId`) REFERENCES `suppliers` (`SupplierId`),
  CONSTRAINT `fk_purch_user` FOREIGN KEY (`PurchasedBy`) REFERENCES `users` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance` (
  `AttendanceId` int NOT NULL AUTO_INCREMENT,
  `WorkerId` int NOT NULL,
  `AttendanceDate` date NOT NULL,
  `Status` enum('Present','Absent','Half Day','Field Work','On Leave') NOT NULL DEFAULT 'Present',
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  PRIMARY KEY (`AttendanceId`),
  UNIQUE KEY `uq_worker_date` (`WorkerId`,`AttendanceDate`),
  CONSTRAINT `fk_att_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  CONSTRAINT `fk_pi_purchase` FOREIGN KEY (`PurchaseId`) REFERENCES `purchases` (`PurchaseId`) ON DELETE CASCADE,
  CONSTRAINT `fk_pi_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
CREATE TRIGGER `trg_update_stock_on_part_used`
AFTER INSERT ON `partsused`
FOR EACH ROW
BEGIN
    IF NEW.PartId IS NOT NULL THEN
        UPDATE `inventory` 
        SET QuantityInStock = QuantityInStock - NEW.Qty
        WHERE PartId = NEW.PartId;
    END IF;
END //

-- Restore stock when a part is removed from a job
CREATE TRIGGER `trg_restore_stock_on_part_delete`
AFTER DELETE ON `partsused`
FOR EACH ROW
BEGIN
    IF OLD.PartId IS NOT NULL THEN
        UPDATE `inventory`
        SET QuantityInStock = QuantityInStock + OLD.Qty
        WHERE PartId = OLD.PartId;
    END IF;
END //

-- Adjust stock when part quantity changes or part is swapped
CREATE TRIGGER `trg_adjust_stock_on_part_update`
AFTER UPDATE ON `partsused`
FOR EACH ROW
BEGIN
    IF OLD.PartId IS NOT NULL THEN
        -- Revert old quantity
        UPDATE `inventory`
        SET QuantityInStock = QuantityInStock + OLD.Qty
        WHERE PartId = OLD.PartId;
    END IF;

    IF NEW.PartId IS NOT NULL THEN
        -- Deduct new quantity
        UPDATE `inventory`
        SET QuantityInStock = QuantityInStock - NEW.Qty
        WHERE PartId = NEW.PartId;
    END IF;
END //

DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;