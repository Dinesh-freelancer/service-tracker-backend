-- Migration to split Pumpset/Motor fields and rename to Pump/Motor specific fields

ALTER TABLE servicerequest
  DROP COLUMN PumpsetBrand,
  DROP COLUMN PumpsetModel;

ALTER TABLE servicerequest
  ADD COLUMN PumpBrand VARCHAR(100) AFTER CustomerId,
  ADD COLUMN PumpModel VARCHAR(100) AFTER PumpBrand,
  ADD COLUMN MotorBrand VARCHAR(100) AFTER PumpModel,
  ADD COLUMN MotorModel VARCHAR(100) AFTER MotorBrand;
