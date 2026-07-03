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
