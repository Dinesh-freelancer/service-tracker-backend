# Submersible Motor Service Center – Complete Web App Status

***

## Table of Contents

1. [System Overview](#system-overview)
2. [Portfolio \& Landing Page](#portfolio--landing-page)
3. [Database Schema](#database-schema)
4. [Authentication \& Authorization](#authentication--authorization)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration Guide \& Data Visibility](#frontend-integration-guide--data-visibility)
7. [Implementation Status](#implementation-status)
8. [Yet To Do](#yet-to-do)

***

## System Overview

The Submersible Motor Service Center backend is a comprehensive REST API system built with Node.js, Express, and MySQL. It manages the complete lifecycle of motor service requests, from initial enquiry to final delivery, with role-based access control (Admin, Owner, Worker, Customer).

The project includes a **Public Portfolio Site** (Landing Page) to attract customers and convert leads, which integrates seamlessly with the internal portal.

**Tech Stack:**

- **Frontend:** React, Vite, Tailwind CSS (v3), React Router (v6), React Helmet Async
- **Backend:** Node.js with Express.js
- **Database:** MySQL with connection pooling (Lowercase table names)
- **Authentication:** JWT (Bearer Token)
- **Role-based access control (RBAC):** Admin, Owner, Worker, Customer

**Base API Path:** `/api`

***

## Portfolio \& Landing Page

A high-conversion landing page has been implemented at the root path (`/`).

**Key Features:**
- **Hero Section:** "Expert Pump Repair & Service" with calls to action.
- **Trust Section:** Highlighting "20-Year Legacy", Genuine Spares, and Warranty.
- **Services Grid:** Showcase of Borewell, Dewatering, Sewage, and Pressure Pumps.
- **Location Section:** Map placeholder and service radius information.
- **Schedule Pickup Form:** Integrated lead generation form posting to `/api/leads/pickup`.
- **WhatsApp Integration:** Floating chat button.
- **SEO:** JSON-LD Schema implementation for LocalBusiness.
- **PWA:** Configured for offline capabilities and installability.

***

## Database Schema

**Note:** All table names are strictly **lowercase** to ensure compatibility with Linux-based MySQL environments (e.g., Aiven).

### 1. **users Table**

```sql
CREATE TABLE users (
  UserId INT NOT NULL AUTO_INCREMENT,
  Username VARCHAR(255) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Role ENUM('Admin', 'Owner', 'Worker', 'Customer') NOT NULL,
  WorkerId INT DEFAULT NULL,
  CustomerId INT DEFAULT NULL,
  IsActive TINYINT(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (UserId),
  FOREIGN KEY (WorkerId) REFERENCES worker(WorkerId),
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId)
);
```

### 2. **customerdetails Table**

```sql
CREATE TABLE customerdetails (
  CustomerId INT NOT NULL AUTO_INCREMENT,
  CustomerName VARCHAR(255) NOT NULL,
  CompanyName VARCHAR(255),
  Address TEXT,
  City VARCHAR(100),
  State VARCHAR(100),
  ZipCode VARCHAR(20),
  Phone1 VARCHAR(20),
  Phone2 VARCHAR(20),
  WhatsApp VARCHAR(20),
  Email VARCHAR(255),
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (CustomerId)
);
```

### 3. **enquiry Table**

```sql
CREATE TABLE enquiry (
  EnquiryId INT NOT NULL AUTO_INCREMENT,
  CustomerId INT NOT NULL,
  MotorDetails TEXT,
  EnquiryDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('New', 'Contacted', 'Quoted', 'Closed') DEFAULT 'New',
  FollowUpNotes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (EnquiryId),
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId)
);
```

### 4. **servicerequest Table**

```sql
CREATE TABLE servicerequest (
  JobNumber VARCHAR(50) NOT NULL PRIMARY KEY,
  CustomerId INT NOT NULL,
  PumpBrand VARCHAR(100),
  PumpModel VARCHAR(100),
  MotorBrand VARCHAR(100),
  MotorModel VARCHAR(100),
  MotorSerialNo VARCHAR(100),
  HP DECIMAL(5,2),
  KW DECIMAL(5,2),
  Phase VARCHAR(50),
  Poles INT,
  DateReceived DATETIME NOT NULL,
  EstimatedCompletionDate DATE,
  EstimatedAmount DECIMAL(12,2),
  BilledAmount DECIMAL(12,2),
  Status ENUM('Received', 'Estimated', 'Approved By Customer', 'Declined By Customer', 'Work In Progress', 'Completed', 'Delivered', 'Closed') DEFAULT 'Received',
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId)
);
```

### 5. **worklog Table**

```sql
CREATE TABLE worklog (
  WorkLogId INT NOT NULL AUTO_INCREMENT,
  JobNumber VARCHAR(50) NOT NULL,
  WorkDescription VARCHAR(255),
  SubStatus ENUM('Inspection', 'Winding', 'Lathe Machining', 'Assembling', 'Testing', 'Delivery Prep') NOT NULL,
  AssignedWorker INT NOT NULL,
  StartTime DATETIME,
  EndTime DATETIME,
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (WorkLogId),
  FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
  FOREIGN KEY (AssignedWorker) REFERENCES worker(WorkerId)
);
```

### 6. **worker Table**

```sql
CREATE TABLE worker (
  WorkerId INT NOT NULL AUTO_INCREMENT,
  WorkerName VARCHAR(255) NOT NULL,
  Phone VARCHAR(20),
  Skills TEXT,
  DateOfJoining DATE,
  IsActive TINYINT(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (WorkerId)
);
```

### 7. **attendance Table**

```sql
CREATE TABLE attendance (
  AttendanceId INT NOT NULL AUTO_INCREMENT,
  WorkerId INT NOT NULL,
  AttendanceDate DATE NOT NULL,
  Status ENUM('Present', 'Absent', 'Leave', 'Holiday') DEFAULT 'Present',
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (AttendanceId),
  FOREIGN KEY (WorkerId) REFERENCES worker(WorkerId)
);
```

### 8. **inventory Table**

```sql
CREATE TABLE inventory (
  PartId INT NOT NULL AUTO_INCREMENT,
  PartName VARCHAR(255) NOT NULL UNIQUE,
  Unit ENUM('Nos', 'Kg', 'Ltr', 'Meter', 'Pair') NOT NULL,
  QuantityInStock DECIMAL(10,2) NOT NULL DEFAULT 0,
  LowStockThreshold DECIMAL(10,2) NOT NULL DEFAULT 0,
  CostPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
  SellingPrice DECIMAL(10,2),
  SupplierId INT,
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PartId),
  FOREIGN KEY (SupplierId) REFERENCES suppliers(SupplierId)
);
```

### 9. **partsused Table**

```sql
CREATE TABLE partsused (
  PartUsedId INT NOT NULL AUTO_INCREMENT,
  JobNumber VARCHAR(50) NOT NULL,
  PartId INT NOT NULL,
  Qty DECIMAL(10,2) NOT NULL DEFAULT 0,
  CostPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
  SellingPrice DECIMAL(10,2),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PartUsedId),
  FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
  FOREIGN KEY (PartId) REFERENCES inventory(PartId)
);
```

### 10. **payments Table**

```sql
CREATE TABLE payments (
  PaymentId INT NOT NULL AUTO_INCREMENT,
  JobNumber VARCHAR(50) NOT NULL,
  PaymentDate DATETIME NOT NULL,
  Amount DECIMAL(12,2) NOT NULL,
  PaymentType ENUM('Advance', 'Partial', 'Final') DEFAULT 'Final',
  PaymentMode ENUM('Cash', 'Cheque', 'Online', 'Credit') DEFAULT 'Cash',
  ReceivedBy INT,
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PaymentId),
  FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
  FOREIGN KEY (ReceivedBy) REFERENCES users(UserId)
);
```

### 11. **suppliers Table**

```sql
CREATE TABLE suppliers (
  SupplierId INT NOT NULL AUTO_INCREMENT,
  SupplierName VARCHAR(255) NOT NULL UNIQUE,
  ContactName VARCHAR(255),
  ContactPhone VARCHAR(50),
  ContactEmail VARCHAR(255),
  Address TEXT,
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (SupplierId)
);
```

### 12. **purchases Table**

```sql
CREATE TABLE purchases (
  PurchaseId INT NOT NULL AUTO_INCREMENT,
  PurchaseDate DATETIME NOT NULL,
  SupplierId INT NOT NULL,
  PurchasedBy INT NOT NULL,
  Notes TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PurchaseId),
  FOREIGN KEY (SupplierId) REFERENCES suppliers(SupplierId),
  FOREIGN KEY (PurchasedBy) REFERENCES users(UserId)
);
```

### 13. **purchaseitems Table**

```sql
CREATE TABLE purchaseitems (
  PurchaseItemId INT NOT NULL AUTO_INCREMENT,
  PurchaseId INT NOT NULL,
  PartId INT NOT NULL,
  Qty DECIMAL(10,2) NOT NULL DEFAULT 0,
  UnitPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
  TotalPrice DECIMAL(10,2) AS (Qty * UnitPrice) STORED,
  Notes TEXT,
  PRIMARY KEY (PurchaseItemId),
  FOREIGN KEY (PurchaseId) REFERENCES purchases(PurchaseId) ON DELETE CASCADE,
  FOREIGN KEY (PartId) REFERENCES inventory(PartId)
);
```

### 14. **windingdetails Table**

```sql
CREATE TABLE windingdetails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobNumber VARCHAR(50) NOT NULL,
  hp DECIMAL(5,2) NOT NULL,
  kw DECIMAL(5,2),
  phase ENUM('1-PHASE', '3-PHASE') NOT NULL,
  connection_type ENUM('STAR', 'DELTA', 'NONE') DEFAULT 'NONE',
  swg_run INT,
  swg_start INT,
  swg_3phase INT,
  turns_run INT,
  turns_start INT,
  turns_3phase INT,
  slot_turns_run JSON,
  slot_turns_start JSON,
  slot_turns_3phase JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_winding_job FOREIGN KEY (jobNumber) REFERENCES servicerequest(JobNumber)
);
```

### 15. **documents Table**

```sql
CREATE TABLE documents (
  DocumentId INT AUTO_INCREMENT PRIMARY KEY,
  JobNumber VARCHAR(50) NULL,
  CustomerId INT NULL,
  DocumentType ENUM('Quote', 'Invoice', 'Photo', 'Other') NOT NULL,
  EmbedTag TEXT NOT NULL,
  CreatedBy INT NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (JobNumber) REFERENCES servicerequest(JobNumber),
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId),
  FOREIGN KEY (CreatedBy) REFERENCES users(UserId)
);
```

### 16. **auditdetails Table**

```sql
CREATE TABLE auditdetails (
  AuditId INT NOT NULL AUTO_INCREMENT,
  ActionType VARCHAR(255) NOT NULL,
  ChangedBy INT NOT NULL,
  Details TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (AuditId),
  FOREIGN KEY (ChangedBy) REFERENCES users(UserId)
);
```

### 17. **summaryreports Table (Optional, for caching)**

```sql
CREATE TABLE summaryreports (
  ReportId INT NOT NULL AUTO_INCREMENT,
  ReportDate DATE NOT NULL,
  ReportType ENUM('Daily', 'Weekly', 'Monthly') NOT NULL,
  JobsCount INT DEFAULT 0,
  PaymentsCount INT DEFAULT 0,
  PaymentsTotal DECIMAL(12,2) DEFAULT 0,
  AttendanceCount INT DEFAULT 0,
  PartsUsedCount INT DEFAULT 0,
  PartsUsedTotal DECIMAL(12,2) DEFAULT 0,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ReportId),
  UNIQUE KEY uk_report (ReportDate, ReportType)
);
```

### 18. **leads Table (New)**

```sql
CREATE TABLE leads (
    LeadId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    PumpType VARCHAR(100),
    ApproxWeight VARCHAR(50),
    Location VARCHAR(255),
    Status ENUM('New', 'Contacted', 'Converted', 'Closed') DEFAULT 'New',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Store pickup requests generated from the Landing Page.

***

[... Authentication, Roles, Middleware Sections ...]

## API Endpoints

[... Previous Endpoints ...]

### Leads Endpoints

#### `POST /api/leads/pickup`

**Role:** Public

**Request:**

```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "pumpType": "Borewell",
  "approxWeight": "50",
  "location": "Guindy"
}
```

**Response:** 201 Created

```json
{
  "message": "Pickup request received successfully",
  "data": { ... }
}
```

***

## Implementation Status

### ✅ Completed

1. **Portfolio / Landing Page** – Fully implemented with React/Tailwind.
2. **Leads System** – Database schema, Backend API, and Frontend Form integration.
3. **Database Schema** – All 18 tables designed (including Leads) with strictly lowercase names.
4. **Authentication** – Login, registration, password reset with JWT.
5. **Authorization** – Role-based middleware (Admin, Owner, Worker, Customer).
6. **Core Modules** – Customer, Enquiry, Jobs, Work Logs, Inventory, Parts, Payments, Suppliers, Purchases, Winding Details, Documents.
7. **Audit Logging** – Comprehensive logging of all actions.
8. **Summary Reports** – Daily/Weekly/Monthly aggregations.
9. **API Documentation** – Swagger UI integrated.
10. **Testing Infrastructure** – Jest and Supertest setup configured.

### 🟡 Partially Completed

1. **Frontend Phase 1** – Internal portal views are currently placeholders.
2. **End-to-End Testing** – Manual verification required for DB integration (Localhost environment).

### ❌ Yet to Do

1. **Comprehensive Testing** – Complete coverage pending (Unit & Integration).
2. **Performance Optimization** – Query optimization, caching.
3. **File Upload** – Cloud storage migration.

***

## Configuration Files \& Environment Variables

### `.env` Example

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=service_db
JWT_SECRET=your_super_secret_key_here_change_in_production
NODE_ENV=development
```

### Setup Instructions (Leads Table)

To enable the Leads feature, run the provided script:

```bash
node apps/api/scripts/setup_leads.js
```

***
