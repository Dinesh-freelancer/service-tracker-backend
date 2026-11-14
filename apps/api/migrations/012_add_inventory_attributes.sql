-- Migration 012: flat key/value attributes (JSON) on inventory
-- e.g. {"voltage":"440V","bore":"20mm","material":"SS304"}
ALTER TABLE `inventory`
  ADD COLUMN `Attributes` JSON NULL AFTER `Size`;
