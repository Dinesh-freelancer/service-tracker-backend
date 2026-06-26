-- Check if HP column exists before renaming
SET @dbname = DATABASE();
SET @tablename = 'assets';
SET @columnname = 'HP';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'ALTER TABLE assets RENAME COLUMN HP TO PowerRating',
  'SELECT 1'
));
PREPARE renameCol FROM @preparedStatement;
EXECUTE renameCol;
DEALLOCATE PREPARE renameCol;

-- Add PowerUnit column if it doesn't exist
SET @columnname = 'PowerUnit';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE assets ADD COLUMN PowerUnit ENUM(''HP'', ''KW'') DEFAULT ''HP'''
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
