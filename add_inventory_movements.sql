-- Run once (after restructure_inventory.sql): adds inventory_movements audit ledger table.
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `MovementId` int NOT NULL AUTO_INCREMENT,
  `PartId` int NOT NULL,
  `StockId` int DEFAULT NULL,
  `LocationId` int DEFAULT NULL,
  `PackType` varchar(50) DEFAULT NULL,
  `QuantityDelta` decimal(10,2) NOT NULL,
  `QuantityAfter` decimal(10,2) DEFAULT NULL,
  `MovementType` enum('Purchase','JobUsed','JobReturn','Adjustment','TransferOut','TransferIn') NOT NULL,
  `ReferenceType` varchar(50) DEFAULT NULL,
  `ReferenceId` varchar(100) DEFAULT NULL,
  `Notes` varchar(255) DEFAULT NULL,
  `CreatedBy` int DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MovementId`),
  KEY `idx_mov_part_date` (`PartId`, `CreatedAt`),
  KEY `idx_mov_location` (`LocationId`),
  CONSTRAINT `fk_mov_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`) ON DELETE CASCADE,
  CONSTRAINT `fk_mov_stock` FOREIGN KEY (`StockId`) REFERENCES `inventory_stock` (`StockId`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_location` FOREIGN KEY (`LocationId`) REFERENCES `locations` (`LocationId`) ON DELETE SET NULL,
  CONSTRAINT `fk_mov_user` FOREIGN KEY (`CreatedBy`) REFERENCES `users` (`UserId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
