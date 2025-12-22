-- Generated Sample Data for Phase 2 Jobs Testing
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO organizations (OrganizationId, OrganizationName, Email, PrimaryContact, Address, City, State, OrganizationType) VALUES (1, 'Org_1_Solutions', 'contact@Org_1_Solutions.com', '9988776651', 'Address 1', 'CityA', 'StateA', 'Other');
INSERT INTO organizations (OrganizationId, OrganizationName, Email, PrimaryContact, Address, City, State, OrganizationType) VALUES (2, 'Org_2_Solutions', 'contact@Org_2_Solutions.com', '9988776652', 'Address 2', 'CityA', 'StateA', 'Company');
INSERT INTO organizations (OrganizationId, OrganizationName, Email, PrimaryContact, Address, City, State, OrganizationType) VALUES (3, 'Org_3_Solutions', 'contact@Org_3_Solutions.com', '9988776653', 'Address 3', 'CityA', 'StateA', 'Electricals');
INSERT INTO organizations (OrganizationId, OrganizationName, Email, PrimaryContact, Address, City, State, OrganizationType) VALUES (4, 'Org_4_Solutions', 'contact@Org_4_Solutions.com', '9988776654', 'Address 4', 'CityA', 'StateA', 'Other');
INSERT INTO organizations (OrganizationId, OrganizationName, Email, PrimaryContact, Address, City, State, OrganizationType) VALUES (5, 'Org_5_Solutions', 'contact@Org_5_Solutions.com', '9988776655', 'Address 5', 'CityA', 'StateA', 'Other');

INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (1, 'Customer_1', NULL, 'Street 1, Area', '9876543201', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (1, '9876543201');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (1, '8876543201');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (2, 'Customer_2', NULL, 'Street 2, Area', '9876543202', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (2, '9876543202');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (2, '8876543202');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (3, 'Customer_3', 'Customer_3 Corp', 'Street 3, Area', '9876543203', 2, 'OrganizationMember');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (3, '9876543203');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (4, 'Customer_4', NULL, 'Street 4, Area', '9876543204', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (4, '9876543204');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (4, '8876543204');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (5, 'Customer_5', NULL, 'Street 5, Area', '9876543205', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (5, '9876543205');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (6, 'Customer_6', 'Customer_6 Corp', 'Street 6, Area', '9876543206', 2, 'OrganizationMember');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (6, '9876543206');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (7, 'Customer_7', NULL, 'Street 7, Area', '9876543207', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (7, '9876543207');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (7, '8876543207');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (8, 'Customer_8', NULL, 'Street 8, Area', '9876543208', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (8, '9876543208');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (9, 'Customer_9', 'Customer_9 Corp', 'Street 9, Area', '9876543209', 5, 'OrganizationMember');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (9, '9876543209');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (9, '8876543209');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (10, 'Customer_10', NULL, 'Street 10, Area', '9876543210', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (10, '9876543210');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (11, 'Customer_11', NULL, 'Street 11, Area', '9876543211', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (11, '9876543211');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (12, 'Customer_12', 'Customer_12 Corp', 'Street 12, Area', '9876543212', 3, 'OrganizationMember');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (12, '9876543212');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (12, '8876543212');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (13, 'Customer_13', NULL, 'Street 13, Area', '9876543213', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (13, '9876543213');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (13, '8876543213');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (14, 'Customer_14', NULL, 'Street 14, Area', '9876543214', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (14, '9876543214');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (15, 'Customer_15', 'Customer_15 Corp', 'Street 15, Area', '9876543215', 4, 'OrganizationMember');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (15, '9876543215');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (16, 'Customer_16', NULL, 'Street 16, Area', '9876543216', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (16, '9876543216');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (17, 'Customer_17', NULL, 'Street 17, Area', '9876543217', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (17, '9876543217');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (18, 'Customer_18', 'Customer_18 Corp', 'Street 18, Area', '9876543218', 3, 'OrganizationMember');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (18, '9876543218');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (19, 'Customer_19', NULL, 'Street 19, Area', '9876543219', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (19, '9876543219');
INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES (20, 'Customer_20', NULL, 'Street 20, Area', '9876543220', NULL, 'Individual');
INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES (20, '9876543220');

INSERT INTO worker (WorkerId, WorkerName, MobileNumber, Skills) VALUES (1, 'Worker_1', '9000000001', 'Winding');
INSERT INTO worker (WorkerId, WorkerName, MobileNumber, Skills) VALUES (2, 'Worker_2', '9000000002', 'Winding');
INSERT INTO worker (WorkerId, WorkerName, MobileNumber, Skills) VALUES (3, 'Worker_3', '9000000003', 'Lathe Work');
INSERT INTO worker (WorkerId, WorkerName, MobileNumber, Skills) VALUES (4, 'Worker_4', '9000000004', 'Lathe Work');
INSERT INTO worker (WorkerId, WorkerName, MobileNumber, Skills) VALUES (5, 'Worker_5', '9000000005', 'Winding');

INSERT INTO users (UserId, Username, PasswordHash, Role) VALUES (1, 'admin', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Admin');
INSERT INTO users (UserId, Username, PasswordHash, Role) VALUES (2, 'owner', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Owner');
INSERT INTO users (UserId, Username, PasswordHash, Role, WorkerId) VALUES (3, 'worker1', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Worker', 1);
INSERT INTO users (UserId, Username, PasswordHash, Role, WorkerId) VALUES (4, 'worker2', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Worker', 2);
INSERT INTO users (UserId, Username, PasswordHash, Role, WorkerId) VALUES (5, 'worker3', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Worker', 3);
INSERT INTO users (UserId, Username, PasswordHash, Role, WorkerId) VALUES (6, 'worker4', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Worker', 4);
INSERT INTO users (UserId, Username, PasswordHash, Role, WorkerId) VALUES (7, 'worker5', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Worker', 5);
INSERT INTO users (UserId, Username, PasswordHash, Role, CustomerId) VALUES (8, 'customer1', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Customer', 1);
INSERT INTO users (UserId, Username, PasswordHash, Role, CustomerId) VALUES (9, 'customer2', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Customer', 2);
INSERT INTO users (UserId, Username, PasswordHash, Role, CustomerId) VALUES (10, 'customer3', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Customer', 3);
INSERT INTO users (UserId, Username, PasswordHash, Role, CustomerId) VALUES (11, 'customer4', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Customer', 4);
INSERT INTO users (UserId, Username, PasswordHash, Role, CustomerId) VALUES (12, 'customer5', '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p', 'Customer', 5);

INSERT INTO suppliers (SupplierId, SupplierName) VALUES (1, 'Supplier_1');
INSERT INTO suppliers (SupplierId, SupplierName) VALUES (2, 'Supplier_2');
INSERT INTO suppliers (SupplierId, SupplierName) VALUES (3, 'Supplier_3');
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (1, 'Copper Wire 24SWG', 'Kg', 850.0, 1275.0, 100);
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (2, 'Ball Bearing 6204', 'Nos', 250.0, 375.0, 100);
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (3, 'Insulation Paper', 'Kg', 150.0, 225.0, 100);
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (4, 'Varnish', 'Ltr', 400.0, 600.0, 100);
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (5, 'Capacitor 50mfd', 'Nos', 120.0, 180.0, 100);
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (6, 'Oil Seal', 'Nos', 45.0, 67.5, 100);
INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES (7, 'Cooling Fan', 'Nos', 180.0, 270.0, 100);

INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-001', 5, 'V-Guard', 'Max',
        'Bharat Bijlee', 'X-100', 1.0,
        'Yes', '2024-07-20 17:13:20', 'Pending Approval',
        '2024-07-21 17:13:20', NULL, NULL, NULL, 7838
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-001', 5, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-002', 19, 'KSB', 'Pro-Series',
        'ABB', 'Eco', 5.0,
        'Yes', '2024-12-20 18:46:50', 'Estimation in Progress',
        '2024-12-21 18:46:50', NULL, NULL, NULL, 2931
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-002', 19, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-003', 13, 'V-Guard', 'X-100',
        'Havells', 'Pro-Series', 1.5,
        'Yes', '2024-03-26 08:09:03', 'Returned to Customer',
        '2024-03-27 08:09:03', '2024-03-28 08:09:03', NULL, NULL, 8255
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-003', 2, 'Disassembly and Inspection', '2024-03-26 08:09:03', '2024-03-26 08:09:03');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-003', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-003', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-003', 13, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-004', 14, 'KSB', 'Pro-Series',
        'Bharat Bijlee', 'Pro-Series', 5.0,
        'No', '2024-05-23 00:53:53', 'Work Complete',
        '2024-05-24 00:53:53', '2024-05-25 00:53:53', NULL, NULL, 4449
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-004', 3, 'Disassembly and Inspection', '2024-05-23 00:53:53', '2024-05-23 00:53:53');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-004', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-004', 14, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-005', 19, 'Kirloskar', 'Pro-Series',
        'Siemens', 'X-100', 5.0,
        'Yes', '2024-04-06 03:20:28', 'Work In Progress',
        '2024-04-07 03:20:28', '2024-04-08 03:20:28', NULL, NULL, 4113
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-005', 5, 'Disassembly and Inspection', '2024-04-06 03:20:28', '2024-04-06 03:20:28');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-005', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-005', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-005', 19, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-006', 13, 'V-Guard', 'Titan',
        'Siemens', 'Pro-Series', 1.5,
        'No', '2024-05-11 01:17:21', 'Not Approved',
        '2024-05-12 01:17:21', NULL, 'Customer not reachable', 'Customer decided not to proceed', 6992
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-006', 13, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-007', 2, 'KSB', 'Superflow',
        'ABB', 'X-100', 1.5,
        'Yes', '2024-02-16 22:10:19', 'Delivered',
        '2024-02-17 22:10:19', '2024-02-18 22:10:19', NULL, NULL, 1113
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-007', 5, 'Disassembly and Inspection', '2024-02-16 22:10:19', '2024-02-16 22:10:19');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-007', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-007', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-007', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-007', 2, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-008', 17, 'Texmo', 'Eco',
        'Crompton', 'Titan', 5.0,
        'No', '2024-04-01 22:13:38', 'Delivered',
        '2024-04-02 22:13:38', '2024-04-03 22:13:38', NULL, NULL, 7963
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-008', 4, 'Disassembly and Inspection', '2024-04-01 22:13:38', '2024-04-01 22:13:38');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-008', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-008', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-008', 17, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-009', 8, 'Grundfos', 'Max',
        'Crompton', 'Eco', 0.5,
        'Yes', '2024-03-25 08:34:21', 'Work In Progress',
        '2024-03-26 08:34:21', '2024-03-27 08:34:21', NULL, NULL, 7121
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-009', 3, 'Disassembly and Inspection', '2024-03-25 08:34:21', '2024-03-25 08:34:21');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-009', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-009', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-009', 8, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-010', 17, 'KSB', 'X-100',
        'Havells', 'Max', 1.5,
        'No', '2024-04-15 18:01:47', 'Work Complete',
        '2024-04-16 18:01:47', '2024-04-17 18:01:47', NULL, NULL, 5002
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-010', 2, 'Disassembly and Inspection', '2024-04-15 18:01:47', '2024-04-15 18:01:47');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-010', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-010', 17, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-011', 13, 'Grundfos', 'Titan',
        'Bharat Bijlee', 'Titan', 0.5,
        'Yes', '2024-04-27 16:07:31', 'Approved by Customer',
        '2024-04-28 16:07:31', '2024-04-29 16:07:31', NULL, NULL, 1319
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-011', 13, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-012', 7, 'KSB', 'Pro-Series',
        'Siemens', 'Max', 1.5,
        'No', '2024-05-15 05:46:06', 'Closed',
        '2024-05-16 05:46:06', '2024-05-17 05:46:06', NULL, NULL, 5321
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-012', 5, 'Disassembly and Inspection', '2024-05-15 05:46:06', '2024-05-15 05:46:06');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-012', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-012', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-012', 7, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-013', 7, 'KSB', 'Pro-Series',
        'Crompton', 'Max', 5.0,
        'Yes', '2024-08-19 18:52:07', 'Work Complete',
        '2024-08-20 18:52:07', '2024-08-21 18:52:07', NULL, NULL, 3657
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-013', 4, 'Disassembly and Inspection', '2024-08-19 18:52:07', '2024-08-19 18:52:07');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-013', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-013', 7, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-014', 14, 'Texmo', 'Max',
        'ABB', 'Titan', 0.5,
        'No', '2024-10-03 21:57:30', 'Estimation in Progress',
        '2024-10-04 21:57:30', NULL, NULL, NULL, 8318
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-014', 14, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-015', 6, 'KSB', 'Titan',
        'Siemens', 'Titan', 0.5,
        'Yes', '2024-10-04 12:32:48', 'Work In Progress',
        '2024-10-05 12:32:48', '2024-10-06 12:32:48', NULL, NULL, 2009
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-015', 2, 'Disassembly and Inspection', '2024-10-04 12:32:48', '2024-10-04 12:32:48');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-015', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-015', 6, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-016', 15, 'Kirloskar', 'Pro-Series',
        'Bharat Bijlee', 'X-100', 0.5,
        'Yes', '2024-12-29 01:41:45', 'Ready for Return',
        '2024-12-30 01:41:45', '2024-12-31 01:41:45', NULL, NULL, 4162
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-016', 2, 'Disassembly and Inspection', '2024-12-29 01:41:45', '2024-12-29 01:41:45');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-016', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-016', 15, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-017', 19, 'V-Guard', 'Superflow',
        'Siemens', 'Max', 5.0,
        'Yes', '2024-11-13 13:44:07', 'Delivered',
        '2024-11-14 13:44:07', '2024-11-15 13:44:07', NULL, NULL, 3366
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-017', 1, 'Disassembly and Inspection', '2024-11-13 13:44:07', '2024-11-13 13:44:07');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-017', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-017', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-017', 19, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-018', 13, 'Texmo', 'Pro-Series',
        'Bharat Bijlee', 'X-100', 2.0,
        'Yes', '2024-09-14 00:19:03', 'Delivered',
        '2024-09-15 00:19:03', '2024-09-16 00:19:03', NULL, NULL, 1130
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-018', 3, 'Disassembly and Inspection', '2024-09-14 00:19:03', '2024-09-14 00:19:03');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-018', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-018', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-018', 13, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-019', 13, 'Kirloskar', 'Superflow',
        'ABB', 'X-100', 2.0,
        'Yes', '2024-01-17 02:19:43', 'Estimation in Progress',
        '2024-01-18 02:19:43', NULL, NULL, NULL, 3711
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-019', 13, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-020', 14, 'Crompton', 'Max',
        'Bharat Bijlee', 'X-100', 0.5,
        'Yes', '2024-03-26 08:55:36', 'Closed',
        '2024-03-27 08:55:36', '2024-03-28 08:55:36', NULL, NULL, 1576
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-020', 3, 'Disassembly and Inspection', '2024-03-26 08:55:36', '2024-03-26 08:55:36');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-020', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-020', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-020', 14, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-021', 20, 'Crompton', 'Max',
        'Siemens', 'Titan', 1.0,
        'No', '2024-01-25 14:33:27', 'Closed',
        '2024-01-26 14:33:27', '2024-01-27 14:33:27', NULL, NULL, 6154
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-021', 2, 'Disassembly and Inspection', '2024-01-25 14:33:27', '2024-01-25 14:33:27');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-021', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-021', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-021', 20, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-022', 3, 'Kirloskar', 'Superflow',
        'Havells', 'Pro-Series', 2.0,
        'No', '2024-08-15 15:52:46', 'Pending Approval',
        '2024-08-16 15:52:46', NULL, NULL, NULL, 9216
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-022', 3, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-023', 1, 'Texmo', 'Eco',
        'Siemens', 'Max', 1.0,
        'Yes', '2024-01-22 19:11:00', 'Work Complete',
        '2024-01-23 19:11:00', '2024-01-24 19:11:00', NULL, NULL, 9609
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-023', 5, 'Disassembly and Inspection', '2024-01-22 19:11:00', '2024-01-22 19:11:00');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-023', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-023', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-023', 1, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-024', 16, 'V-Guard', 'Pro-Series',
        'Bharat Bijlee', 'Eco', 1.5,
        'No', '2024-03-05 16:05:52', 'Estimation in Progress',
        '2024-03-06 16:05:52', NULL, NULL, NULL, 6573
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-024', 16, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-025', 8, 'V-Guard', 'Pro-Series',
        'ABB', 'Eco', 2.0,
        'No', '2024-04-08 21:33:09', 'Work In Progress',
        '2024-04-09 21:33:09', '2024-04-10 21:33:09', NULL, NULL, 9877
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-025', 1, 'Disassembly and Inspection', '2024-04-08 21:33:09', '2024-04-08 21:33:09');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-025', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-025', 8, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-026', 2, 'V-Guard', 'Superflow',
        'Bharat Bijlee', 'Pro-Series', 1.5,
        'No', '2024-10-02 00:44:16', 'Work In Progress',
        '2024-10-03 00:44:16', '2024-10-04 00:44:16', NULL, NULL, 7533
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-026', 3, 'Disassembly and Inspection', '2024-10-02 00:44:16', '2024-10-02 00:44:16');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-026', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-026', 2, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-027', 16, 'Kirloskar', 'Superflow',
        'Siemens', 'Superflow', 5.0,
        'No', '2024-10-24 22:24:13', 'Approved by Customer',
        '2024-10-25 22:24:13', '2024-10-26 22:24:13', NULL, NULL, 5450
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-027', 16, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-028', 14, 'Kirloskar', 'Max',
        'ABB', 'X-100', 5.0,
        'Yes', '2024-08-08 14:03:02', 'Not Approved',
        '2024-08-09 14:03:02', NULL, 'Other', 'Customer decided not to proceed', 5093
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-028', 14, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-029', 5, 'V-Guard', 'Superflow',
        'Siemens', 'Eco', 2.0,
        'Yes', '2024-06-23 09:12:26', 'Pending Approval',
        '2024-06-24 09:12:26', NULL, NULL, NULL, 8271
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-029', 5, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-030', 3, 'Grundfos', 'Titan',
        'Crompton', 'Pro-Series', 5.0,
        'No', '2024-01-26 10:24:16', 'Approved by Customer',
        '2024-01-27 10:24:16', '2024-01-28 10:24:16', NULL, NULL, 5545
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-030', 3, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-031', 8, 'V-Guard', 'X-100',
        'Bharat Bijlee', 'Eco', 0.5,
        'No', '2024-06-11 06:04:51', 'Approved by Customer',
        '2024-06-12 06:04:51', '2024-06-13 06:04:51', NULL, NULL, 9204
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-031', 8, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-032', 11, 'Crompton', 'Superflow',
        'Bharat Bijlee', 'Titan', 1.5,
        'No', '2024-09-02 09:08:51', 'Returned to Customer',
        '2024-09-03 09:08:51', '2024-09-04 09:08:51', NULL, NULL, 3267
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-032', 2, 'Disassembly and Inspection', '2024-09-02 09:08:51', '2024-09-02 09:08:51');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-032', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-032', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-032', 11, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-033', 9, 'Grundfos', 'Superflow',
        'Bharat Bijlee', 'X-100', 1.0,
        'Yes', '2024-10-20 05:27:04', 'Delivered',
        '2024-10-21 05:27:04', '2024-10-22 05:27:04', NULL, NULL, 5810
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-033', 5, 'Disassembly and Inspection', '2024-10-20 05:27:04', '2024-10-20 05:27:04');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-033', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-033', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-033', 9, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-034', 6, 'V-Guard', 'X-100',
        'Siemens', 'X-100', 1.0,
        'No', '2024-11-05 21:47:26', 'Closed',
        '2024-11-06 21:47:26', '2024-11-07 21:47:26', NULL, NULL, 9247
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-034', 4, 'Disassembly and Inspection', '2024-11-05 21:47:26', '2024-11-05 21:47:26');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-034', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-034', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-034', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-034', 6, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-035', 10, 'Grundfos', 'X-100',
        'Havells', 'Titan', 1.5,
        'No', '2024-11-23 02:22:17', 'Estimation in Progress',
        '2024-11-24 02:22:17', NULL, NULL, NULL, 9019
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-035', 10, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-036', 15, 'Texmo', 'Max',
        'Crompton', 'Eco', 1.0,
        'No', '2024-08-07 05:28:26', 'Delivered',
        '2024-08-08 05:28:26', '2024-08-09 05:28:26', NULL, NULL, 3839
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-036', 2, 'Disassembly and Inspection', '2024-08-07 05:28:26', '2024-08-07 05:28:26');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-036', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-036', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-036', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-036', 15, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-037', 14, 'Crompton', 'Superflow',
        'Siemens', 'X-100', 2.0,
        'Yes', '2024-09-27 00:47:20', 'Returned to Customer',
        '2024-09-28 00:47:20', '2024-09-29 00:47:20', NULL, NULL, 3157
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-037', 4, 'Disassembly and Inspection', '2024-09-27 00:47:20', '2024-09-27 00:47:20');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-037', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-037', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-037', 14, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-038', 19, 'Kirloskar', 'Titan',
        'Crompton', 'Eco', 0.5,
        'Yes', '2024-02-08 02:45:24', 'Work In Progress',
        '2024-02-09 02:45:24', '2024-02-10 02:45:24', NULL, NULL, 5785
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-038', 1, 'Disassembly and Inspection', '2024-02-08 02:45:24', '2024-02-08 02:45:24');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-038', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-038', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-038', 19, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-039', 18, 'Grundfos', 'Pro-Series',
        'Havells', 'X-100', 5.0,
        'Yes', '2024-05-31 08:12:17', 'Closed',
        '2024-06-01 08:12:17', '2024-06-02 08:12:17', NULL, NULL, 8985
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-039', 5, 'Disassembly and Inspection', '2024-05-31 08:12:17', '2024-05-31 08:12:17');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-039', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-039', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-039', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-039', 18, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-040', 15, 'Kirloskar', 'Titan',
        'Crompton', 'Max', 2.0,
        'No', '2024-11-19 12:53:42', 'Not Approved',
        '2024-11-20 12:53:42', NULL, 'Customer not reachable', 'Customer decided not to proceed', 9674
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-040', 15, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-041', 11, 'Texmo', 'X-100',
        'Siemens', 'Pro-Series', 1.0,
        'No', '2024-04-19 05:03:33', 'Pending Approval',
        '2024-04-20 05:03:33', NULL, NULL, NULL, 9363
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-041', 11, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-042', 11, 'Crompton', 'Superflow',
        'Siemens', 'Pro-Series', 0.5,
        'Yes', '2024-04-20 08:44:54', 'Not Approved',
        '2024-04-21 08:44:54', NULL, 'Estimate too high', 'Customer decided not to proceed', 3495
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-042', 11, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-043', 7, 'V-Guard', 'Eco',
        'Bharat Bijlee', 'Eco', 1.5,
        'Yes', '2024-07-12 12:37:54', 'Closed',
        '2024-07-13 12:37:54', '2024-07-14 12:37:54', NULL, NULL, 7631
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-043', 2, 'Disassembly and Inspection', '2024-07-12 12:37:54', '2024-07-12 12:37:54');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-043', 'Some Part', 'Nos', 1, 100);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-043', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-043', 7, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-044', 4, 'V-Guard', 'Max',
        'Siemens', 'X-100', 2.0,
        'Yes', '2024-08-05 10:14:51', 'Approved by Customer',
        '2024-08-06 10:14:51', '2024-08-07 10:14:51', NULL, NULL, 8105
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-044', 4, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-045', 8, 'Grundfos', 'Pro-Series',
        'Bharat Bijlee', 'Superflow', 5.0,
        'No', '2024-11-14 17:12:38', 'Work Complete',
        '2024-11-15 17:12:38', '2024-11-16 17:12:38', NULL, NULL, 3190
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-045', 3, 'Disassembly and Inspection', '2024-11-14 17:12:38', '2024-11-14 17:12:38');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-045', 'Some Part', 'Nos', 1, 100);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-045', 8, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-046', 1, 'Crompton', 'X-100',
        'Havells', 'Titan', 1.5,
        'Yes', '2024-04-30 01:48:24', 'Pending Approval',
        '2024-05-01 01:48:24', NULL, NULL, NULL, 8339
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-046', 1, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-047', 1, 'Kirloskar', 'X-100',
        'Crompton', 'Superflow', 5.0,
        'No', '2024-11-05 22:26:31', 'Pending Approval',
        '2024-11-06 22:26:31', NULL, NULL, NULL, 6044
    );
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-047', 1, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-048', 9, 'Kirloskar', 'Max',
        'Crompton', 'Superflow', 1.5,
        'Yes', '2024-10-21 12:43:40', 'Ready for Return',
        '2024-10-22 12:43:40', '2024-10-23 12:43:40', NULL, NULL, 3269
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-048', 1, 'Disassembly and Inspection', '2024-10-21 12:43:40', '2024-10-21 12:43:40');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-048', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-048', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-048', 9, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-049', 5, 'Kirloskar', 'X-100',
        'Havells', 'Pro-Series', 5.0,
        'No', '2024-03-11 23:04:24', 'Delivered',
        '2024-03-12 23:04:24', '2024-03-13 23:04:24', NULL, NULL, 9894
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-049', 1, 'Disassembly and Inspection', '2024-03-11 23:04:24', '2024-03-11 23:04:24');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-049', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-049', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('JOB-2024-049', 2000.00, 'Final', 'Cash');
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-049', 5, 'Quote', 'link_to_quote', 1);
INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        'JOB-2024-050', 18, 'Crompton', 'Titan',
        'Bharat Bijlee', 'Eco', 1.5,
        'No', '2024-12-20 11:13:11', 'Work Complete',
        '2024-12-21 11:13:11', '2024-12-22 11:13:11', NULL, NULL, 5678
    );
INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('JOB-2024-050', 4, 'Disassembly and Inspection', '2024-12-20 11:13:11', '2024-12-20 11:13:11');
INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('JOB-2024-050', 'Some Part', 'Nos', 1, 100);
INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('JOB-2024-050', 1.0, '1-PHASE', 'NONE', 24, 60);
INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('JOB-2024-050', 18, 'Quote', 'link_to_quote', 1);

SET FOREIGN_KEY_CHECKS = 1;
