-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: mysql-rassi-service-tracker.j.aivencloud.com    Database: servicedb
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1cb62ad3-43e0-11f1-9bd8-325bbb381810:1-291,
6deea0ff-72e9-11f1-9b0d-62a377758cee:1-64,
7ed52750-04e6-11f1-8da4-421ce11ba5cc:1-45,
99493f2d-db01-11f0-b696-42aef85b59f9:1-130,
a4557bd7-2515-11f1-a7dd-0a2de8bf3ce8:1-16,
cf1a96a2-dbe3-11f0-b33e-e2393bd26711:1-353';

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `AttendanceId` int NOT NULL AUTO_INCREMENT,
  `WorkerId` int NOT NULL,
  `AttendanceDate` date NOT NULL,
  `Status` enum('Present','Absent','Half Day','Field Work','On Leave','Week off','Holiday') NOT NULL DEFAULT 'Present',
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  PRIMARY KEY (`AttendanceId`),
  UNIQUE KEY `uq_worker_date` (`WorkerId`,`AttendanceDate`),
  CONSTRAINT `fk_att_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auditdetails`
--

DROP TABLE IF EXISTS `auditdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditdetails` (
  `AuditId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) DEFAULT NULL,
  `ChangedDateTime` datetime DEFAULT CURRENT_TIMESTAMP,
  `ActionType` varchar(50) DEFAULT NULL,
  `ChangedBy` varchar(100) DEFAULT NULL,
  `Details` text,
  PRIMARY KEY (`AuditId`),
  KEY `idx_audit_job` (`JobNumber`),
  CONSTRAINT `auditdetails_ibfk_1` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customerdetails`
--

DROP TABLE IF EXISTS `customerdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customerdetails` (
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customermobilenumbers`
--

DROP TABLE IF EXISTS `customermobilenumbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customermobilenumbers` (
  `MobileId` int NOT NULL AUTO_INCREMENT,
  `CustomerId` int NOT NULL,
  `MobileNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`MobileId`),
  KEY `fk_mobile_customer` (`CustomerId`),
  CONSTRAINT `fk_mobile_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enquiry`
--

DROP TABLE IF EXISTS `enquiry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enquiry` (
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_batches`
--

DROP TABLE IF EXISTS `inventory_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_batches` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leads`
--

DROP TABLE IF EXISTS `leads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leads` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
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
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partsused`
--

DROP TABLE IF EXISTS `partsused`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partsused` (
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchaseitems`
--

DROP TABLE IF EXISTS `purchaseitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseitems` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sales_items`
--

DROP TABLE IF EXISTS `sales_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_items` (
  `ItemId` int NOT NULL AUTO_INCREMENT,
  `Category` enum('Refurbished Motors','Motor Spares') NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Status` enum('Available','Out of stock') NOT NULL DEFAULT 'Available',
  `Specs` json DEFAULT NULL,
  `Images` json DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ItemId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servicerequest`
--

DROP TABLE IF EXISTS `servicerequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicerequest` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servicerequest_history`
--

DROP TABLE IF EXISTS `servicerequest_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicerequest_history` (
  `HistoryId` int NOT NULL AUTO_INCREMENT,
  `JobNumber` varchar(50) NOT NULL,
  `StatusFrom` varchar(50) DEFAULT NULL,
  `StatusTo` varchar(50) NOT NULL,
  `ChangedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ChangeComments` text,
  PRIMARY KEY (`HistoryId`),
  KEY `fk_history_job` (`JobNumber`),
  CONSTRAINT `fk_history_job` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `SettingKey` varchar(100) NOT NULL,
  `SettingValue` text,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SettingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spare_price_search`
--

DROP TABLE IF EXISTS `spare_price_search`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spare_price_search` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `warranty_claims`
--

DROP TABLE IF EXISTS `warranty_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranty_claims` (
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `windingdetails`
--

DROP TABLE IF EXISTS `windingdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `windingdetails` (
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `worker`
--

DROP TABLE IF EXISTS `worker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker` (
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `worklog`
--

DROP TABLE IF EXISTS `worklog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worklog` (
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
/*!40101 SET character_set_client = @saved_cs_client */;
