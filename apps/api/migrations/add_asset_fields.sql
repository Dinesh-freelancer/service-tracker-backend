-- Add new fields to the assets table
ALTER TABLE assets MODIFY COLUMN AssetType ENUM('Pumpset', 'Motor Only', 'Pump Only', 'Others') DEFAULT 'Pumpset';

-- Add PumpType column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'assets';
SET @columnname = 'PumpType';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE assets ADD COLUMN PumpType VARCHAR(100) DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add AssetDescription column if it doesn't exist
SET @columnname = 'AssetDescription';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE assets ADD COLUMN AssetDescription TEXT DEFAULT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
