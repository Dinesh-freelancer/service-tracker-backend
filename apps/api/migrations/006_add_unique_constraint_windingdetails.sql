-- Add a unique constraint to AssetId so ON DUPLICATE KEY UPDATE works correctly
ALTER TABLE windingdetails ADD UNIQUE KEY uk_winding_asset (AssetId);
