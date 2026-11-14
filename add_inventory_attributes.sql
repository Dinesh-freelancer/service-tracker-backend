-- Run once (after restructure_inventory.sql): adds the JSON attributes column to inventory.
ALTER TABLE `inventory`
  ADD COLUMN `Attributes` JSON NULL AFTER `Size`;

-- Optional: index a frequently filtered attribute via a generated column, e.g. voltage
-- ALTER TABLE `inventory`
--   ADD COLUMN `attr_voltage` VARCHAR(50) GENERATED ALWAYS AS (`Attributes`->>'$.voltage') STORED,
--   ADD INDEX `idx_attr_voltage` (`attr_voltage`);
