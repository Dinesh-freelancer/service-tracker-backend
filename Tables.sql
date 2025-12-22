
-- Server version	8.0.35

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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '99493f2d-db01-11f0-b696-42aef85b59f9:1-130,
cf1a96a2-dbe3-11f0-b33e-e2393bd26711:1-51';

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
  `Status` enum('Present','Absent','Half Day','Field Work','On Leave') NOT NULL DEFAULT 'Present',
  `CheckInTime` time DEFAULT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `Notes` text,
  `MarkedBy` varchar(100) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AttendanceId`),
  UNIQUE KEY `uq_worker_date` (`WorkerId`,`AttendanceDate`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `PrimaryContact` varchar(20) DEFAULT NULL,
  `WhatsappSameAsMobile` tinyint(1) DEFAULT '0',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `OrganizationId` int DEFAULT NULL,
  `CustomerType` enum('Individual','OrganizationMember') DEFAULT 'Individual',
  `Designation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`CustomerId`),
  KEY `idx_customer_name` (`CustomerName`),
  KEY `OrganizationId` (`OrganizationId`),
  CONSTRAINT `customerdetails_ibfk_1` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`OrganizationId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  KEY `CustomerId` (`CustomerId`),
  CONSTRAINT `customermobilenumbers_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `CustomerId` int DEFAULT NULL,
  `DocumentType` enum('Quote','Invoice','Photo','Other') NOT NULL,
  `EmbedTag` text NOT NULL,
  `CreatedBy` int NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`DocumentId`),
  KEY `JobNumber` (`JobNumber`),
  KEY `CustomerId` (`CustomerId`),
  KEY `CreatedBy` (`CreatedBy`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`),
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`),
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  PRIMARY KEY (`EnquiryId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `Role` varchar(100) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrganizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `PartName` varchar(100) NOT NULL,
  `Unit` varchar(10) DEFAULT 'Nos',
  `Qty` decimal(10,2) DEFAULT '0.00',
  `CostPrice` decimal(10,2) NOT NULL,
  `BilledPrice` decimal(10,2) DEFAULT NULL,
  `Supplier` varchar(100) DEFAULT NULL,
  `Notes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PartUsedId`),
  KEY `JobNumber` (`JobNumber`),
  CONSTRAINT `partsused_ibfk_1` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `Notes` text,
  PRIMARY KEY (`PaymentId`),
  KEY `idx_payments_job` (`JobNumber`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `Notes` text,
  PRIMARY KEY (`PurchaseItemId`),
  KEY `PurchaseId` (`PurchaseId`),
  KEY `PartId` (`PartId`),
  CONSTRAINT `purchaseitems_ibfk_1` FOREIGN KEY (`PurchaseId`) REFERENCES `purchases` (`PurchaseId`) ON DELETE CASCADE,
  CONSTRAINT `purchaseitems_ibfk_2` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `Notes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PurchaseId`),
  KEY `SupplierId` (`SupplierId`),
  KEY `PurchasedBy` (`PurchasedBy`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`SupplierId`) REFERENCES `suppliers` (`SupplierId`),
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`PurchasedBy`) REFERENCES `users` (`UserId`)
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
  `CustomerId` int NOT NULL,
  `PumpBrand` varchar(100) NOT NULL,
  `PumpModel` varchar(100) NOT NULL,
  `MotorBrand` varchar(100) DEFAULT NULL,
  `MotorModel` varchar(100) DEFAULT NULL,
  `HP` decimal(5,2) DEFAULT NULL,
  `Warranty` enum('Yes','No','Not Applicable') NOT NULL,
  `SerialNumber` varchar(50) DEFAULT NULL,
  `DateReceived` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notes` text,
  `Status` enum('Estimation in Progress','Pending Approval','Approved by Customer','Not Approved','Ready for Return','Work In Progress','Work Complete','Delivered','Returned to Customer','Closed') NOT NULL DEFAULT 'Estimation in Progress',
  `EstimationDate` datetime DEFAULT NULL,
  `EstimateLink` varchar(255) DEFAULT NULL,
  `EstimatedAmount` decimal(10,2) DEFAULT NULL,
  `BilledAmount` decimal(10,2) DEFAULT NULL,
  `ApprovalDate` datetime DEFAULT NULL,
  `DeclinedReason` enum('Estimate too high','Customer not reachable','Change of mind','Duplicate service request','Other') DEFAULT NULL,
  `DeclinedNotes` text,
  `WorkStartDate` datetime DEFAULT NULL,
  `WorkEndDate` datetime DEFAULT NULL,
  `InvoiceLink` varchar(255) DEFAULT NULL,
  `DeliveryDate` datetime DEFAULT NULL,
  `DeliveryNotes` text,
  `ReturnDate` datetime DEFAULT NULL,
  `ReturnNotes` text,
  `ClosureDate` datetime DEFAULT NULL,
  `ClosureNotes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `EnquiryId` int DEFAULT NULL,
  PRIMARY KEY (`JobNumber`),
  KEY `idx_service_customer` (`CustomerId`),
  KEY `EnquiryId` (`EnquiryId`),
  CONSTRAINT `servicerequest_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`) ON DELETE RESTRICT,
  CONSTRAINT `servicerequest_ibfk_2` FOREIGN KEY (`EnquiryId`) REFERENCES `enquiry` (`EnquiryId`)
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  KEY `WorkerId` (`WorkerId`),
  KEY `CustomerId` (`CustomerId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`CustomerId`) REFERENCES `customerdetails` (`CustomerId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `windingdetails`
--

DROP TABLE IF EXISTS `windingdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `windingdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jobNumber` varchar(50) NOT NULL,
  `hp` decimal(5,2) NOT NULL,
  `kw` decimal(5,2) DEFAULT NULL,
  `phase` enum('1-PHASE','3-PHASE') NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `idx_jobNumber` (`jobNumber`),
  CONSTRAINT `fk_winding_job` FOREIGN KEY (`jobNumber`) REFERENCES `servicerequest` (`JobNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `Notes` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WorkerId`),
  KEY `idx_worker_name` (`WorkerName`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `SubStatus` varchar(100) DEFAULT NULL,
  `WorkerId` int DEFAULT NULL,
  `WorkDone` text,
  `WorkerName` varchar(100) DEFAULT NULL,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  `Notes` text,
  `WorkDate` date DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WorkLogId`),
  KEY `idx_worklog_job` (`JobNumber`),
  KEY `fk_worklog_worker` (`WorkerId`),
  CONSTRAINT `fk_worklog_worker` FOREIGN KEY (`WorkerId`) REFERENCES `worker` (`WorkerId`) ON DELETE SET NULL,
  CONSTRAINT `worklog_ibfk_1` FOREIGN KEY (`JobNumber`) REFERENCES `servicerequest` (`JobNumber`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-22 20:26:38
