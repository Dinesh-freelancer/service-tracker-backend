-- Add weight fields to windingdetails table
ALTER TABLE windingdetails ADD COLUMN weight DECIMAL(6,3) DEFAULT NULL;
ALTER TABLE windingdetails ADD COLUMN weight_run DECIMAL(6,3) DEFAULT NULL;
ALTER TABLE windingdetails ADD COLUMN weight_start DECIMAL(6,3) DEFAULT NULL;
