-- Migration 011: Restructure inventory with Make, Size, LastUpdated, shared Tags, hierarchical Locations, and secondary Stock table

-- 1. Update inventory master table
ALTER TABLE `inventory`
  ADD COLUMN `Make` varchar(100) NOT NULL DEFAULT '' AFTER `PartName`,
  ADD COLUMN `Size` varchar(100) NOT NULL DEFAULT '' AFTER `Make`,
  ADD COLUMN `LastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `Notes`,
  DROP INDEX `PartName`,
  ADD UNIQUE KEY `uq_part_make_size` (`PartName`, `Make`, `Size`);

-- 2. Master tags dictionary (shared across inventory items)
CREATE TABLE IF NOT EXISTS `tags` (
  `TagId` int NOT NULL AUTO_INCREMENT,
  `TagName` varchar(100) NOT NULL,
  PRIMARY KEY (`TagId`),
  UNIQUE KEY `uq_tag_name` (`TagName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Many-to-many junction table between inventory and tags
CREATE TABLE IF NOT EXISTS `inventory_tags` (
  `PartId` int NOT NULL,
  `TagId` int NOT NULL,
  PRIMARY KEY (`PartId`, `TagId`),
  KEY `idx_tag_part` (`TagId`, `PartId`),
  CONSTRAINT `fk_it_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`) ON DELETE CASCADE,
  CONSTRAINT `fk_it_tag` FOREIGN KEY (`TagId`) REFERENCES `tags` (`TagId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Hierarchical locations table (ParentLocationId = 0 for root locations)
CREATE TABLE IF NOT EXISTS `locations` (
  `LocationId` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `LocationType` enum('Warehouse','Zone','Aisle','Rack','Shelf','Bin') NOT NULL DEFAULT 'Bin',
  `ParentLocationId` int NOT NULL DEFAULT '0',
  `FullPath` varchar(500) NOT NULL DEFAULT '',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`LocationId`),
  UNIQUE KEY `uq_parent_name` (`ParentLocationId`, `Name`),
  KEY `idx_parent_location` (`ParentLocationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Secondary inventory stock table (tracks PackType, UnitsPerPack, LocationId, Quantity in base units)
CREATE TABLE IF NOT EXISTS `inventory_stock` (
  `StockId` int NOT NULL AUTO_INCREMENT,
  `PartId` int NOT NULL,
  `LocationId` int NOT NULL,
  `PackType` varchar(50) NOT NULL DEFAULT 'Loose',
  `UnitsPerPack` decimal(10,2) NOT NULL DEFAULT '1.00',
  `Quantity` decimal(10,2) NOT NULL DEFAULT '0.00',
  `LastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`StockId`),
  UNIQUE KEY `uq_part_loc_pack` (`PartId`, `LocationId`, `PackType`, `UnitsPerPack`),
  KEY `idx_stock_location` (`LocationId`),
  CONSTRAINT `fk_stock_inventory` FOREIGN KEY (`PartId`) REFERENCES `inventory` (`PartId`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_location` FOREIGN KEY (`LocationId`) REFERENCES `locations` (`LocationId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Track which secondary stock row was deducted in partsused
ALTER TABLE `partsused`
  ADD COLUMN `StockId` int DEFAULT NULL AFTER `PartId`,
  ADD KEY `fk_parts_stock` (`StockId`),
  ADD CONSTRAINT `fk_parts_stock` FOREIGN KEY (`StockId`) REFERENCES `inventory_stock` (`StockId`) ON DELETE SET NULL;
