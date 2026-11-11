CREATE TABLE IF NOT EXISTS `salarypayments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workerId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentType` enum('Salary','Advance','Overtime') NOT NULL DEFAULT 'Salary',
  `paymentMode` varchar(30) DEFAULT 'Cash',
  `notes` text,
  `createdtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_salarypayment_worker` (`workerId`),
  KEY `idx_salarypayment_createdtime` (`createdtime`),
  CONSTRAINT `fk_salarypayment_worker` FOREIGN KEY (`workerId`) REFERENCES `worker` (`WorkerId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
