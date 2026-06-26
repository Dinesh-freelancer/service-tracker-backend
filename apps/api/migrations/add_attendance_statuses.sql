ALTER TABLE attendance MODIFY COLUMN Status ENUM('Present','Absent','Half Day','Field Work','On Leave','Week off','Holiday') NOT NULL DEFAULT 'Present';
