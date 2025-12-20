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

- **Frontend:** React, Vite, Tailwind CSS (v4), React Router (v6), React Helmet Async
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

**Purpose:** Store user credentials, roles, and link to worker or customer records.

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
  PRIMARY KEY (CustomerId),
  INDEX idx_phone (Phone1),
  INDEX idx_email (Email)
);
```

**Purpose:** Store customer profile information and contact details.

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
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId),
  INDEX idx_customer (CustomerId)
);
```

**Purpose:** Track customer enquiries before job creation.

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
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId),
  INDEX idx_customer (CustomerId),
  INDEX idx_status (Status),
  INDEX idx_date (DateReceived)
);
```

**Purpose:** Core table storing service request/job details.

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
  FOREIGN KEY (AssignedWorker) REFERENCES worker(WorkerId),
  INDEX idx_job (JobNumber),
  INDEX idx_worker (AssignedWorker)
);
```

**Purpose:** Track work done on each service request with substatus and assignee.

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
  PRIMARY KEY (WorkerId),
  INDEX idx_name (WorkerName)
);
```

**Purpose:** Store worker/technician profile information.

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
  FOREIGN KEY (WorkerId) REFERENCES worker(WorkerId),
  INDEX idx_worker_date (WorkerId, AttendanceDate)
);
```

**Purpose:** Track daily worker attendance.

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
  FOREIGN KEY (SupplierId) REFERENCES suppliers(SupplierId),
  INDEX idx_supplier (SupplierId),
  INDEX idx_stock (QuantityInStock)
);
```

**Purpose:** Manage parts/materials inventory with stock levels and pricing.

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
  FOREIGN KEY (PartId) REFERENCES inventory(PartId),
  INDEX idx_job (JobNumber),
  INDEX idx_part (PartId)
);
```

**Purpose:** Track parts used in specific service requests with cost breakdowns.

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
  FOREIGN KEY (ReceivedBy) REFERENCES users(UserId),
  INDEX idx_job (JobNumber),
  INDEX idx_date (PaymentDate)
);
```

**Purpose:** Track all payments received for service requests.

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
  PRIMARY KEY (SupplierId),
  INDEX idx_name (SupplierName)
);
```

**Purpose:** Store supplier information for parts procurement.

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
  FOREIGN KEY (PurchasedBy) REFERENCES users(UserId),
  INDEX idx_supplier (SupplierId),
  INDEX idx_date (PurchaseDate)
);
```

**Purpose:** Record purchase events from suppliers.

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
  FOREIGN KEY (PartId) REFERENCES inventory(PartId),
  INDEX idx_purchase (PurchaseId)
);
```

**Purpose:** Track individual items within each purchase.

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

  wire_id_run DECIMAL(5,3),
  wire_od_run DECIMAL(5,3),

  wire_id_start DECIMAL(5,3),
  wire_od_start DECIMAL(5,3),

  wire_id_3phase DECIMAL(5,3),
  wire_od_3phase DECIMAL(5,3),

  turns_run INT,
  turns_start INT,
  turns_3phase INT,

  slot_turns_run JSON,
  slot_turns_start JSON,
  slot_turns_3phase JSON,

  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_winding_job FOREIGN KEY (jobNumber) REFERENCES servicerequest(JobNumber),
  INDEX idx_jobNumber (jobNumber)
);
```

**Purpose:** Store technical winding specifications for motor rewinding.

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

**Purpose:** Store embed tags for quotes, invoices, and documents linked to jobs/customers.

### 16. **auditdetails Table**

```sql
CREATE TABLE auditdetails (
  AuditId INT NOT NULL AUTO_INCREMENT,
  ActionType VARCHAR(255) NOT NULL,
  ChangedBy INT NOT NULL,
  Details TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (AuditId),
  FOREIGN KEY (ChangedBy) REFERENCES users(UserId),
  INDEX idx_user (ChangedBy),
  INDEX idx_date (CreatedAt)
);
```

**Purpose:** Log all system actions for compliance and troubleshooting.

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

**Purpose:** Cache aggregated summary data for reporting efficiency.

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

## Authentication \& Authorization

### JWT Configuration

- **JWT_SECRET:** Stored in environment variables
- **Token Expiry:** 24 hours
- **Token Structure:** `{ UserId, Role }`


### Roles \& Permissions

| Role | Access Level | Key Permissions |
| :-- | :-- | :-- |
| Admin | Full | All operations, user management, settings |
| Owner | Full | All operations (same as Admin) |
| Worker | Partial | View jobs, work logs, inventory (limited) |
| Customer | Minimal | View own jobs, quotes, invoices, payments |

### Middleware Stack

1. **authenticateToken** – Verify JWT and extract user
2. **sensitiveInfoToggle** – Process hide sensitive flag
3. **authorize** – Check role-based permissions

***

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`

**Role:** Admin/Owner only

**Request:**

```json
{
  "Username": "worker1",
  "Password": "secure_pass123",
  "Role": "Worker",
  "WorkerId": 5,
  "CustomerId": null
}
```

**Response:** 201 Created

```json
{
  "UserId": 45,
  "Username": "worker1",
  "Role": "Worker"
}
```

**Error:** 400 (duplicate username), 403 (unauthorized role)

***

#### `POST /api/auth/login`

**Role:** Public

**Request:**

```json
{
  "Username": "worker1",
  "Password": "secure_pass123"
}
```

**Response:** 200 OK

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Role": "Worker"
}
```

**Error:** 401 (invalid credentials)

***

#### `POST /api/auth/reset-password`

**Role:** Public (but requires username)

**Request:**

```json
{
  "Username": "worker1",
  "NewPassword": "new_secure_pass"
}
```

**Response:** 200 OK

```json
{
  "message": "Password reset successful"
}
```


***

### Customer Management Endpoints

#### `GET /api/customers`

**Role:** Admin/Owner

**Query Params:**

- `hideSensitive=true|false` (default: true for workers/customers)

**Response:** 200 OK

```json
[
  {
    "CustomerId": 1,
    "CustomerName": "John Doe",
    "CompanyName": "Doe Motors",
    "Phone1": "9876543210",
    "Email": "john@example.com",
    "City": "Mumbai"
  }
]
```

**With hideSensitive=true (Worker view):**

```json
[
  {
    "CustomerId": 1,
    "CustomerName": "Hidden",
    "CompanyName": "Hidden",
    "Phone1": "Hidden",
    "Email": "Hidden"
  }
]
```


***

#### `GET /api/customers/:id`

**Role:** Admin/Owner (+ Customer viewing own profile)

**Response:** 200 OK

```json
{
  "CustomerId": 1,
  "CustomerName": "John Doe",
  "CompanyName": "Doe Motors",
  "Address": "123 Motor Street",
  "Phone1": "9876543210",
  "Phone2": "9876543211",
  "WhatsApp": "9876543210",
  "Email": "john@example.com",
  "Notes": "Loyal customer"
}
```


***

#### `POST /api/customers`

**Role:** Admin/Owner

**Request:**

```json
{
  "CustomerName": "John Doe",
  "CompanyName": "Doe Motors",
  "Address": "123 Motor Street",
  "Phone1": "9876543210",
  "Email": "john@example.com"
}
```

**Response:** 201 Created

```json
{
  "CustomerId": 1,
  "CustomerName": "John Doe",
  ...
}
```


***

#### `PUT /api/customers/:id`

**Role:** Admin/Owner

**Response:** 200 OK (updated customer)

***

#### `DELETE /api/customers/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

### Enquiry Management Endpoints

#### `GET /api/enquiries`

**Role:** Admin/Owner

**Query Params:**

- `customerId=1` (optional filter)
- `status=New|Contacted|Quoted|Closed` (optional filter)

**Response:** 200 OK

```json
[
  {
    "EnquiryId": 1,
    "CustomerId": 1,
    "MotorDetails": "3 HP, 3-phase submersible motor",
    "EnquiryDate": "2025-11-15T10:00:00Z",
    "Status": "Quoted"
  }
]
```


***

#### `POST /api/enquiries`

**Role:** Admin/Owner

**Request:**

```json
{
  "CustomerId": 1,
  "MotorDetails": "5 HP motor with overheating issue",
  "Status": "New"
}
```

**Response:** 201 Created

***

#### `PUT /api/enquiries/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

### Service Request (Job) Endpoints

#### `GET /api/jobs`

**Role:** Admin/Owner (all jobs), Worker (no customer info), Customer (own jobs only)

**Query Params:**

- `status=Received|Estimated|Approved By Customer|...` (optional)
- `dateFrom=YYYY-MM-DD` (optional)
- `dateTo=YYYY-MM-DD` (optional)
- `hideSensitive=true|false` (default: true for workers)
- `page=1` (optional, default 1)
- `limit=10` (optional, default 10)

**Response for Admin/Owner with hideSensitive=false:** 200 OK

```json
{
  "data": [
    {
      "JobNumber": "20251115001",
      "CustomerId": 1,
      "CustomerName": "John Doe",
      "PumpBrand": "Grundfos",
      "PumpModel": "SP5A",
      "MotorBrand": "Crompton",
      "MotorModel": "MB4",
      "HP": 5.5,
      "KW": 4.1,
      "DateReceived": "2025-11-15T09:30:00Z",
      "Status": "Work In Progress",
      "EstimatedAmount": 5000,
      "BilledAmount": null,
      "Notes": "Motor bearing replacement required"
    }
  ],
  "pagination": {
      "totalItems": 150,
      "totalPages": 15,
      "currentPage": 1,
      "itemsPerPage": 10
  }
}
```

**Response for Worker with hideSensitive=true:**

```json
{
  "data": [
    {
      "JobNumber": "20251115001",
      "CustomerName": "Hidden",
      "PumpBrand": "Grundfos",
      "PumpModel": "SP5A",
      "MotorBrand": "Crompton",
      "MotorModel": "MB4",
      "HP": 5.5,
      "Status": "Work In Progress",
      "EstimatedAmount": "Hidden",
      "BilledAmount": "Hidden"
    }
  ],
  "pagination": { ... }
}
```

**Response for Customer (own jobs only):**

```json
{
  "data": [
    {
      "JobNumber": "20251115001",
      "PumpBrand": "Grundfos",
      "PumpModel": "SP5A",
      "MotorBrand": "Crompton",
      "MotorModel": "MB4",
      "Status": "Work In Progress",
      "DateReceived": "2025-11-15T09:30:00Z"
    }
  ],
  "pagination": { ... }
}
```


***

#### `GET /api/jobs/:jobNumber`

**Role:** Admin/Owner (full), Worker (limited), Customer (own only)

**Response for Admin/Owner:**

```json
{
  "JobNumber": "20251115001",
  "CustomerId": 1,
  "CustomerName": "John Doe",
  "MotorBrand": "Grundfos",
  "MotorModel": "SP5A",
  "MotorSerialNo": "GR12345",
  "HP": 5.5,
  "KW": 4.1,
  "Phase": "3-PHASE",
  "Poles": 4,
  "DateReceived": "2025-11-15T09:30:00Z",
  "Status": "Work In Progress",
  "EstimatedAmount": 5000,
  "BilledAmount": null,
  "Notes": "Motor bearing replacement required",
  "WorkLogs": [ {...} ],
  "PartsUsed": [ {...} ],
  "Payments": [ {...} ],
  "WindingDetails": [ {...} ],
  "Documents": [ {...} ]
}
```

**Response for Worker (hideSensitive=true, no customer name):**

```json
{
  "JobNumber": "20251115001",
  "MotorBrand": "Grundfos",
  "HP": 5.5,
  "Status": "Work In Progress",
  "WorkLogs": [
    {
      "WorkLogId": 1,
      "SubStatus": "Inspection",
      "AssignedWorker": 5,
      "WorkerName": "Raj Kumar"
    }
  ],
  "PartsUsed": "Hidden",
  "Payments": "Hidden",
  "WindingDetails": {...}  // Only if status is "Approved By Customer" or "Work In Progress"
}
```


***

#### `POST /api/jobs`

**Role:** Admin/Owner

**Request:**

```json
{
  "CustomerId": 1,
  "PumpBrand": "Grundfos",
  "PumpModel": "SP5A",
  "MotorBrand": "Crompton",
  "MotorModel": "MB4",
  "HP": 5.5,
  "KW": 4.1,
  "Phase": "3-PHASE",
  "DateReceived": "2025-11-15T09:30:00Z",
  "EstimatedAmount": 5000,
  "Notes": "Motor bearing replacement"
}
```

**Response:** 201 Created

```json
{
  "JobNumber": "20251115001",
  "CustomerId": 1,
  "Status": "Received",
  ...
}
```

**Note:** JobNumber auto-generated as YYYYMMDDNN format.

***

#### `PUT /api/jobs/:jobNumber`

**Role:** Admin/Owner

**Request:**

```json
{
  "Status": "Approved By Customer",
  "BilledAmount": 5500,
  "Notes": "Customer approved estimate"
}
```

**Response:** 200 OK (updated job)

***

### Work Log Endpoints

#### `GET /api/work-logs`

**Role:** Admin/Owner (all), Worker (can see all, but limited fields), Customer (hidden)

**Query Params:**

- `jobNumber=20251115001` (optional)
- `workerId=5` (optional, Admin/Owner only)

**Response for Admin/Owner:**

```json
[
  {
    "WorkLogId": 1,
    "JobNumber": "20251115001",
    "WorkDescription": "Bearing inspection completed",
    "SubStatus": "Inspection",
    "AssignedWorker": 5,
    "WorkerName": "Raj Kumar",
    "StartTime": "2025-11-15T09:00:00Z",
    "EndTime": "2025-11-15T11:30:00Z",
    "Notes": "Bearing wear detected, replacement recommended"
  }
]
```

**Response for Worker (hideSensitive=true, no times/notes):**

```json
[
  {
    "WorkLogId": 1,
    "JobNumber": "20251115001",
    "SubStatus": "Inspection",
    "AssignedWorker": 5,
    "WorkerName": "Raj Kumar"
  }
]
```


***

#### `POST /api/work-logs`

**Role:** Admin/Owner

**Request:**

```json
{
  "JobNumber": "20251115001",
  "WorkDescription": "Bearing inspection completed",
  "SubStatus": "Inspection",
  "AssignedWorker": 5,
  "StartTime": "2025-11-15T09:00:00Z",
  "EndTime": "2025-11-15T11:30:00Z",
  "Notes": "Bearing wear detected"
}
```

**Response:** 201 Created

***

#### `PUT /api/work-logs/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

#### `DELETE /api/work-logs/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

### Worker \& Attendance Endpoints

#### `GET /api/workers`

**Role:** Admin/Owner

**Query Params:**

- `isActive=true|false` (optional)

**Response:** 200 OK

```json
[
  {
    "WorkerId": 5,
    "WorkerName": "Raj Kumar",
    "Phone": "9876543210",
    "Skills": "Winding, Lathe machining",
    "DateOfJoining": "2020-01-15",
    "IsActive": 1
  }
]
```


***

#### `GET /api/workers/:id`

**Role:** Admin/Owner

**Response:** 200 OK (worker profile with job history)

***

#### `POST /api/workers`

**Role:** Admin/Owner

**Request:**

```json
{
  "WorkerName": "Raj Kumar",
  "Phone": "9876543210",
  "Skills": "Winding, Lathe machining",
  "DateOfJoining": "2020-01-15"
}
```

**Response:** 201 Created

***

#### `PUT /api/workers/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

#### `DELETE /api/workers/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

#### `GET /api/attendance`

**Role:** Admin/Owner (all), Worker (can view own \& others), Customer (hidden)

**Query Params:**

- `workerId=5` (optional)
- `dateFrom=YYYY-MM-DD` (optional)
- `dateTo=YYYY-MM-DD` (optional)

**Response:** 200 OK

```json
[
  {
    "AttendanceId": 1,
    "WorkerId": 5,
    "WorkerName": "Raj Kumar",
    "AttendanceDate": "2025-11-15",
    "Status": "Present",
    "Notes": null
  }
]
```


***

#### `POST /api/attendance`

**Role:** Admin/Owner (only they can create/update)

**Request:**

```json
{
  "WorkerId": 5,
  "AttendanceDate": "2025-11-15",
  "Status": "Present",
  "Notes": "On-site"
}
```

**Response:** 201 Created

***

#### `PUT /api/attendance/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

### Inventory \& Parts Endpoints

#### `GET /api/inventory`

**Role:** Admin/Owner (full), Worker (no costs, only names/quantities), Customer (hidden)

**Query Params:**

- `supplierId=2` (optional)
- `lowStock=true` (optional - alert items)
- `hideSensitive=true|false` (default: true for workers)

**Response for Admin/Owner with hideSensitive=false:**

```json
[
  {
    "PartId": 5,
    "PartName": "Winding Wire (SWG 24)",
    "Unit": "Kg",
    "QuantityInStock": 25.5,
    "LowStockThreshold": 10,
    "CostPrice": 450,
    "SellingPrice": 600,
    "SupplierId": 2,
    "SupplierName": "Sharma Supplies"
  }
]
```

**Response for Worker with hideSensitive=true:**

```json
[
  {
    "PartId": 5,
    "PartName": "Winding Wire (SWG 24)",
    "Unit": "Kg",
    "QuantityInStock": 25.5
  }
]
```


***

#### `GET /api/inventory/:id`

**Role:** Admin/Owner (full), Worker (limited)

**Response:** 200 OK (part details)

***

#### `POST /api/inventory`

**Role:** Admin/Owner

**Request:**

```json
{
  "PartName": "Winding Wire (SWG 24)",
  "Unit": "Kg",
  "QuantityInStock": 25.5,
  "LowStockThreshold": 10,
  "CostPrice": 450,
  "SellingPrice": 600,
  "SupplierId": 2
}
```

**Response:** 201 Created

***

#### `PUT /api/inventory/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

#### `DELETE /api/inventory/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

### Parts Used Endpoints

#### `GET /api/parts-used`

**Role:** Admin/Owner (all), Worker (limited - no costs), Customer (hidden)

**Query Params:**

- `jobNumber=20251115001` (optional)
- `hideSensitive=true|false` (default: true for workers)

**Response for Admin/Owner:**

```json
[
  {
    "PartUsedId": 1,
    "JobNumber": "20251115001",
    "PartId": 5,
    "PartName": "Winding Wire (SWG 24)",
    "Qty": 2.5,
    "Unit": "Kg",
    "CostPrice": 450,
    "SellingPrice": 600,
    "TotalCost": 1125,
    "TotalSelling": 1500
  }
]
```

**Response for Worker with hideSensitive=true:**

```json
[
  {
    "PartUsedId": 1,
    "JobNumber": "20251115001",
    "PartName": "Winding Wire (SWG 24)",
    "Qty": 2.5,
    "Unit": "Kg"
  }
]
```


***

#### `POST /api/parts-used`

**Role:** Admin/Owner

**Request:**

```json
{
  "JobNumber": "20251115001",
  "PartId": 5,
  "Qty": 2.5,
  "CostPrice": 450,
  "SellingPrice": 600
}
```

**Response:** 201 Created (also updates inventory stock)

***

#### `DELETE /api/parts-used/:id`

**Role:** Admin/Owner

**Response:** 204 No Content (also reverts inventory stock)

***

### Payment Endpoints

#### `GET /api/payments`

**Role:** Admin/Owner (all), Customer (own only), Worker (hidden)

**Query Params:**

- `jobNumber=20251115001` (optional)
- `dateFrom=YYYY-MM-DD` (optional)
- `dateTo=YYYY-MM-DD` (optional)
- `hideSensitive=true|false` (default: true for workers)

**Response for Admin/Owner with hideSensitive=false:**

```json
[
  {
    "PaymentId": 1,
    "JobNumber": "20251115001",
    "PaymentDate": "2025-11-15T14:00:00Z",
    "Amount": 2500,
    "PaymentType": "Advance",
    "PaymentMode": "Online",
    "ReceivedBy": 1,
    "ReceivedByName": "Admin User"
  }
]
```

**Response for Customer (own jobs):**

```json
[
  {
    "PaymentId": 1,
    "JobNumber": "20251115001",
    "PaymentDate": "2025-11-15T14:00:00Z",
    "Amount": 2500,
    "PaymentType": "Advance",
    "PaymentMode": "Online"
  }
]
```


***

#### `POST /api/payments`

**Role:** Admin/Owner

**Request:**

```json
{
  "JobNumber": "20251115001",
  "PaymentDate": "2025-11-15T14:00:00Z",
  "Amount": 2500,
  "PaymentType": "Advance",
  "PaymentMode": "Online",
  "Notes": "Advance received online"
}
```

**Response:** 201 Created

***

#### `PUT /api/payments/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

#### `DELETE /api/payments/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

### Supplier \& Purchase Endpoints

#### `GET /api/suppliers`

**Role:** Admin/Owner

**Response:** 200 OK

```json
[
  {
    "SupplierId": 2,
    "SupplierName": "Sharma Supplies",
    "ContactName": "Sharma Ji",
    "ContactPhone": "9876543210",
    "ContactEmail": "sharma@supplies.com",
    "Address": "123 Business Street, Mumbai"
  }
]
```


***

#### `POST /api/suppliers`

**Role:** Admin/Owner

**Request:**

```json
{
  "SupplierName": "Sharma Supplies",
  "ContactName": "Sharma Ji",
  "ContactPhone": "9876543210",
  "ContactEmail": "sharma@supplies.com",
  "Address": "123 Business Street, Mumbai"
}
```

**Response:** 201 Created

***

#### `PUT /api/suppliers/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

#### `DELETE /api/suppliers/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

#### `GET /api/purchases`

**Role:** Admin/Owner

**Query Params:**

- `supplierId=2` (optional)
- `dateFrom=YYYY-MM-DD` (optional)
- `hideSensitive=true|false` (default: true for workers)

**Response for Admin/Owner with hideSensitive=false:**

```json
[
  {
    "PurchaseId": 1,
    "PurchaseDate": "2025-11-19T10:00:00Z",
    "SupplierId": 2,
    "SupplierName": "Sharma Supplies",
    "PurchasedBy": 1,
    "PurchasedByName": "Admin User",
    "TotalAmount": 12500,
    "Items": [
      {
        "PartId": 5,
        "PartName": "Winding Wire (SWG 24)",
        "Qty": 10.5,
        "UnitPrice": 450,
        "TotalPrice": 4725
      }
    ]
  }
]
```

**Response for Worker with hideSensitive=true:**

```json
[
  {
    "PurchaseId": 1,
    "PurchaseDate": "2025-11-19T10:00:00Z",
    "SupplierName": "Sharma Supplies",
    "Items": [
      {
        "PartName": "Winding Wire (SWG 24)",
        "Qty": 10.5
      }
    ]
  }
]
```


***

#### `GET /api/purchases/:id`

**Role:** Admin/Owner

**Response:** 200 OK (detailed purchase with items)

***

#### `POST /api/purchases`

**Role:** Admin/Owner

**Request:**

```json
{
  "purchase": {
    "PurchaseDate": "2025-11-19T10:00:00Z",
    "SupplierId": 2,
    "Notes": "Purchased for repair work"
  },
  "items": [
    {
      "PartId": 5,
      "Qty": 10.5,
      "UnitPrice": 450,
      "Notes": "Winding Wire"
    }
  ]
}
```

**Response:** 201 Created (also updates inventory stock)

***

### Winding Details Endpoints

#### `GET /api/winding-details`

**Role:** Admin/Owner (all), Worker (status filtered), Customer (hidden)

**Query Params:**

- `jobNumber=20251115001` (optional)

**Response for Admin/Owner:**

```json
[
  {
    "id": 1,
    "jobNumber": "20251115001",
    "hp": 5.5,
    "kw": 4.1,
    "phase": "3-PHASE",
    "connection_type": "STAR",
    "swg_run": 24,
    "swg_start": 26,
    "swg_3phase": 28,
    "wire_id_run": 0.457,
    "wire_od_run": 0.510,
    "turns_run": 120,
    "turns_start": 150,
    "turns_3phase": 100,
    "slot_turns_run": { "1-6": 20, "7-12": 25, ... },
    "notes": "Rewound stator with new wire"
  }
]
```

**Response for Worker (job status Approved/In Progress only):**

```json
[
  {
    "id": 1,
    "jobNumber": "20251115001",
    "hp": 5.5,
    "phase": "3-PHASE",
    "turns_run": 120,
    "turns_start": 150,
    "slot_turns_run": { "1-6": 20, "7-12": 25, ... }
  }
]
```

**Response for Worker (job status not Approved/In Progress):** Empty or 403

***

#### `GET /api/winding-details/job/:jobNumber`

**Role:** Admin/Owner (all), Worker (status filtered), Customer (hidden)

**Response:** 200 OK (winding records for job)

***

#### `POST /api/winding-details`

**Role:** Admin/Owner

**Request:**

```json
{
  "jobNumber": "20251115001",
  "hp": 5.5,
  "kw": 4.1,
  "phase": "3-PHASE",
  "connection_type": "STAR",
  "swg_run": 24,
  "swg_start": 26,
  "turns_run": 120,
  "turns_start": 150,
  "slot_turns_run": { "1-6": 20, "7-12": 25 },
  "notes": "Rewound stator"
}
```

**Response:** 201 Created

***

#### `PUT /api/winding-details/:id`

**Role:** Admin/Owner

**Response:** 200 OK

***

#### `DELETE /api/winding-details/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

### Document Endpoints

#### `GET /api/documents`

**Role:** Admin/Owner, Customer (own only)

**Query Params:**

- `jobNumber=20251115001` (optional)
- `customerId=1` (optional, for customer docs)
- `documentType=Quote|Invoice|Photo|Other` (optional)

**Response:** 200 OK

```json
[
  {
    "DocumentId": 1,
    "JobNumber": "20251115001",
    "CustomerId": 1,
    "DocumentType": "Quote",
    "EmbedTag": "<iframe src='https://onedrive.live.com/embed?...'/></iframe>",
    "CreatedBy": 1,
    "CreatedAt": "2025-11-15T10:00:00Z"
  }
]
```


***

#### `GET /api/documents/job/:jobNumber`

**Role:** Admin/Owner, Customer (own only)

**Response:** 200 OK (documents for job)

***

#### `GET /api/documents/customer/:customerId`

**Role:** Admin/Owner, Customer (own only)

**Response:** 200 OK (documents for customer)

***

#### `POST /api/documents`

**Role:** Admin/Owner

**Request:**

```json
{
  "JobNumber": "20251115001",
  "CustomerId": null,
  "DocumentType": "Quote",
  "EmbedTag": "<iframe src='https://onedrive.live.com/embed?...'/></iframe>"
}
```

**Response:** 201 Created

***

#### `DELETE /api/documents/:id`

**Role:** Admin/Owner

**Response:** 204 No Content

***

### Reporting Endpoints

#### `GET /api/reports/job-status`

**Role:** Admin/Owner (all), Worker (operational only), Customer (hidden)

**Query Params:**

- `dateFrom=YYYY-MM-DD` (optional)
- `dateTo=YYYY-MM-DD` (optional)
- `hideSensitive=true|false`

**Response:** 200 OK

```json
{
  "totalJobs": 150,
  "jobsByStatus": {
    "Received": 10,
    "Estimated": 15,
    "Approved By Customer": 30,
    "Work In Progress": 50,
    "Completed": 35,
    "Delivered": 8,
    "Closed": 2
  }
}
```


***

#### `GET /api/reports/financial`

**Role:** Admin/Owner (only)

**Query Params:**

- `dateFrom=YYYY-MM-DD` (optional)
- `dateTo=YYYY-MM-DD` (optional)

**Response:** 200 OK

```json
{
  "totalJobs": 150,
  "totalEstimatedAmount": 750000,
  "totalBilledAmount": 700000,
  "totalPaymentsReceived": 650000,
  "outstandingPayments": 50000,
  "profitMargin": 120000
}
```


***

#### `GET /api/reports/technician`

**Role:** Admin/Owner (all), Worker (own only)

**Query Params:**

- `workerId=5` (optional)
- `dateFrom=YYYY-MM-DD` (optional)

**Response:** 200 OK

```json
[
  {
    "WorkerId": 5,
    "WorkerName": "Raj Kumar",
    "JobsCompleted": 25,
    "JobsInProgress": 3,
    "AverageTurnaroundTime": "3.5 days"
  }
]
```


***

#### `GET /api/reports/inventory-alerts`

**Role:** Admin/Owner (all), Worker (hidden), Customer (hidden)

**Response:** 200 OK

```json
[
  {
    "PartId": 5,
    "PartName": "Winding Wire (SWG 24)",
    "QuantityInStock": 8,
    "LowStockThreshold": 10,
    "Unit": "Kg",
    "SupplierId": 2
  }
]
```


***

#### `GET /api/reports/summary`

**Role:** Admin/Owner (all), Worker (operational), Customer (hidden)

**Query Params:**

- `reportType=Daily|Weekly|Monthly` (default: Daily)
- `date=YYYY-MM-DD` (for daily/weekly)
- `yearMonth=YYYY-MM` (for monthly)
- `hideSensitive=true|false`

**Response:** 200 OK

```json
{
  "reportType": "Daily",
  "reportDate": "2025-11-15",
  "summary": [
    {
      "Type": "Jobs",
      "Count": 5,
      "Amount": 25000  // Hidden if hideSensitive=true
    },
    {
      "Type": "Payments",
      "Count": 3,
      "Amount": 15000  // Hidden if hideSensitive=true
    },
    {
      "Type": "Attendance",
      "Count": 12,
      "Amount": null
    },
    {
      "Type": "PartsUsed",
      "Count": 7,
      "Amount": 8500  // Hidden if hideSensitive=true
    }
  ]
}
```


***

#### `GET /api/summary-reports/daily?date=2025-11-15`

**Role:** Admin/Owner

**Response:** 200 OK (aggregated daily summary)

***

#### `GET /api/summary-reports/weekly?startDate=2025-11-10&endDate=2025-11-16`

**Role:** Admin/Owner

**Response:** 200 OK (aggregated weekly summary)

***

#### `GET /api/summary-reports/monthly?yearMonth=2025-11`

**Role:** Admin/Owner

**Response:** 200 OK (aggregated monthly summary)

***

### Audit Trail Endpoints

#### `GET /api/audit-logs`

**Role:** Admin/Owner (all), Others (hidden)

**Query Params:**

- `userId=1` (optional)
- `actionType=...` (optional)
- `dateFrom=YYYY-MM-DD` (optional)
- `dateTo=YYYY-MM-DD` (optional)

**Response:** 200 OK

```json
[
  {
    "AuditId": 1,
    "ActionType": "Job Created",
    "ChangedBy": 1,
    "ChangedByName": "Admin User",
    "Details": "Job 20251115001 created for customer ID 1",
    "CreatedAt": "2025-11-15T09:30:00Z"
  },
  {
    "AuditId": 2,
    "ActionType": "Sensitive Info Viewed",
    "ChangedBy": 5,
    "ChangedByName": "Raj Kumar",
    "Details": "Worker viewed customer details for job 20251115001",
    "CreatedAt": "2025-11-15T10:00:00Z"
  }
]
```


***

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

## Frontend Integration Guide \& Data Visibility

This section outlines the interface contract, role-specific constraints, and data visibility rules for Frontend integration.

### Role-Based Access Control (RBAC) \& Visibility

The backend strictly enforces data visibility based on roles.

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Admin** | Full | Full access to all data and features. |
| **Owner** | Full | Same as Admin. |
| **Worker** | Operational | Access to Jobs, Inventory, Work Logs. **No Financials.** **No Customer PII.** |
| **Customer** | Personal | Read-only access to own Jobs, Quotes, Invoices. |

### API Layer Filtering (Global Behavior)

- **`hideSensitive` Flag:** By default, all responses are "masked" (`hideSensitive=true`) for safety.
- **"Hidden" Values:** Sensitive fields (e.g., `CustomerName`, `EstimatedAmount`) are replaced with the string `"Hidden"`.
- **Admin Override:** Admins/Owners can request raw data by passing `?hideSensitive=false` in the query string or `x-hide-sensitive: false` header. **Note:** This action is logged in the Audit Trail.

### Role-Specific Constraints

#### 👷 Worker Role
The Frontend should expect the following limitations for logged-in Workers:

1.  **Service Requests (Jobs):**
    -   **Visible:** `JobNumber`, `MotorBrand` (mapped from `PumpsetBrand`), `MotorModel` (mapped from `PumpsetModel`), `HP`, `Warranty`, `DateReceived`, `Status`, `Notes`.
    -   **Hidden:** `CustomerName` (PII), `CustomerId`, `EstimatedAmount`, `BilledAmount`.
2.  **Winding Details:**
    -   **Conditional Visibility:** Full technical details are **only** returned if the Job Status is:
        -   `Approved By Customer`
        -   `Work In Progress`
    -   **Otherwise:** The API returns a filtered object with `message: "Winding details not available at this stage"`.
3.  **Payments:**
    -   **Access Blocked:** `GET /api/payments` returns `[]` (empty list). `GET /api/payments/:id` returns `403 Forbidden`.
    -   *Frontend Action:* Hide "Payments" tab/section for Workers.
4.  **Inventory & Parts:**
    -   **Visible:** `PartName`, `QuantityInStock`, `Unit`.
    -   **Hidden:** `CostPrice`, `SellingPrice`, `Supplier` info.
5.  **Documents:**
    -   **Visible:** Metadata (`DocumentId`, `DocumentType`, `CreatedAt`).
    -   **Hidden:** Content (`EmbedTag`).

#### 👤 Customer Role
1.  **Scope:** Can only access data linked to their `CustomerId`.
2.  **Fields:** Can see Estimates, Billed Amounts, and Documents (Quotes/Invoices).
3.  **Hiding:** Internal fields might be hidden, but generally they see their own transaction data.

### Entity Field Mappings (Frontend Reference)

Please verify the Frontend binds to these exact keys returned by the API:

-   **Service Request:** `JobNumber`, `PumpsetBrand`, `PumpsetModel`, `SerialNumber`, `HP`, `Warranty`, `Status`, `Notes`.
-   **Customer:** `CustomerId`, `CustomerName`, `WhatsappNumber`, `Address`.
-   **Inventory:** `PartId`, `PartName`, `QuantityInStock`, `Unit`.

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
2. **Dashboard** – In Progress (Widgets, Quick Actions).
3. **End-to-End Testing** – Manual verification required for DB integration (Localhost environment).

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
