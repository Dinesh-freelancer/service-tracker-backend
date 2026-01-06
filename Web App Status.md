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

The project uses an **Asset-Centric Model**, where pumps/motors are treated as permanent assets linked to customers, tracking their entire repair history over time.

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

### 1. **assets Table (New Core Entity)**

```sql
CREATE TABLE assets (
  AssetId INT AUTO_INCREMENT PRIMARY KEY,
  CustomerId INT NOT NULL,
  InternalTag VARCHAR(50) NOT NULL UNIQUE, -- Generated e.g., PUMP-2401-1234
  PumpBrand VARCHAR(100) NOT NULL,
  PumpModel VARCHAR(100) NOT NULL,
  MotorBrand VARCHAR(100),
  MotorModel VARCHAR(100),
  HP DECIMAL(10,2),
  SerialNumber VARCHAR(100),
  InstallationDate DATE,
  WarrantyExpiry DATE,
  IsActive TINYINT(1) DEFAULT 1,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerId) REFERENCES customerdetails(CustomerId)
);
```

**Purpose:** Store permanent equipment details. Service Requests now link to this table instead of storing pump details directly.

### 2. **servicerequest Table (Updated)**

```sql
CREATE TABLE servicerequest (
  JobNumber VARCHAR(50) NOT NULL PRIMARY KEY,
  AssetId INT NOT NULL, -- Links to Asset
  CustomerId INT NOT NULL,
  DateReceived DATETIME NOT NULL,
  Status ENUM(...) DEFAULT 'Intake',
  ResolutionType ENUM('Completed Successfully', 'Estimate Rejected', ...),
  ResolutionNotes TEXT,
  Notes TEXT,
  ...
  FOREIGN KEY (AssetId) REFERENCES assets(AssetId)
);
```

**Purpose:** Transactional record of a specific repair job.

### 3. **servicerequest_history Table (New)**

```sql
CREATE TABLE servicerequest_history (
  HistoryId INT AUTO_INCREMENT PRIMARY KEY,
  JobNumber VARCHAR(50) NOT NULL,
  StatusFrom VARCHAR(50),
  StatusTo VARCHAR(50) NOT NULL,
  ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ChangeComments TEXT
);
```

**Purpose:** Audit trail for job status changes to calculate turnaround times.

*(Other tables like users, customers, inventory, partsused remain similar but updated to support new triggers)*

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

***

## API Endpoints

### Asset Management

#### `GET /api/assets`
- **Query:** `customerId` (optional)
- **Returns:** List of assets.

#### `POST /api/assets`
- **Body:** `{ CustomerId, PumpBrand, PumpModel, ... }`
- **Returns:** Created Asset.

### Service Request (Job) Endpoints

#### `GET /api/jobs`
- **Returns:** Jobs list with JOINed Asset details (InternalTag, PumpBrand, etc.).

#### `POST /api/jobs`
- **Hybrid Flow:**
  - **Option A (Existing Asset):** `{ AssetId: 123, DateReceived: ... }`
  - **Option B (New Asset):** `{ NewAsset: { PumpBrand: ..., ... }, CustomerId: ..., DateReceived: ... }`
- **Returns:** Created Job.

*(Other endpoints for Customers, Inventory, WorkLogs remain standard)*

***

## Frontend Integration Guide \& Data Visibility

### Asset-Centric UI Flow

1. **Job Creation:**
   - User selects **Customer**.
   - System fetches **Customer's Assets**.
   - User selects an **Existing Asset** OR **Creates New Asset** inline.
   - Job is created for that Asset.

2. **Job Details:**
   - **Asset Info Section:** Displays permanent details (Tag, Serial, Specs) from `assets` table.
   - **Job Info Section:** Displays current issue, status, notes from `servicerequest` table.
   - **Documents:** Split into "Job Specific" (Quote/Invoice) and "Asset History" (Manuals/Past Photos).

### Role-Specific Constraints

#### 👷 Worker Role
- **Visible:** `JobNumber`, `InternalTag`, `PumpBrand`, `Status`, `WorkLogs`.
- **Hidden:** `CustomerName`, `EstimatedAmount`.

#### 👤 Customer Role
- **Visible:** Own jobs, own assets, financial estimates.

***

## Implementation Status

### ✅ Completed

1. **Database Architecture:**
   - Reconstructed schema with `assets`, `servicerequest_history`, `organizations`.
   - Implemented triggers for Stock Management (Delete/Update) and Status Auditing.
2. **Backend Logic:**
   - `AssetModel` & `AssetController` created.
   - `ServiceRequest` logic refactored to use `AssetId` and support Hybrid Creation.
   - Search logic updated to join `assets` table (search by Internal Tag).
3. **Frontend Features:**
   - **Create Job:** New wizard-style flow (Customer -> Asset -> Job).
   - **Job List:** Updated with Internal Tag column and advanced search.
   - **Job Details:** Comprehensive view with Asset details and split Document tabs.

### 🟡 Partially Completed

1. **Testing:** Unit tests need updates to match new schema.

### ❌ Yet to Do

1. **End-to-End Testing:** Full flow verification on production DB.

***
