-- Allow NULL values for Phase, Brand, PumpModel, MotorModel, SerialNumber
ALTER TABLE assets MODIFY COLUMN Brand VARCHAR(100) DEFAULT NULL;

-- If Phase column exists, update it to allow empty string. Note: It's an ENUM ('1-PHASE', '3-PHASE')
-- We can add empty string to the ENUM or just let it be NULL.
SET @dbname = DATABASE();
SET @tablename = 'assets';
SET @columnname = 'Phase';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'ALTER TABLE assets MODIFY COLUMN Phase ENUM(''1-PHASE'', ''3-PHASE'', '''') DEFAULT NULL',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
