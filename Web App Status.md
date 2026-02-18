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

### 4. **spare_price_search Table (New)**

```sql
CREATE TABLE spare_price_search (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  pump_category VARCHAR(50),
  pump_type VARCHAR(120),
  pump_size VARCHAR(50),
  spare_name VARCHAR(200),
  basic_material VARCHAR(150),
  unit_price DECIMAL(12,2),
  uom VARCHAR(20),
  UNIQUE KEY uq_spare (pump_category, pump_type, pump_size, spare_name, basic_material)
);
```

**Purpose:** High-performance table for syncing spare part prices from external systems.

*(Other tables like users, customers, inventory, partsused remain similar but updated to support new triggers)*

***

## Authentication \& Authorization

### Roles \& Permissions (RBAC)

The "Hide Sensitive Info" toggle has been removed in favor of strict role-based access.

| Feature Area | Owner | Admin (Manager) | Worker |
| :--- | :--- | :--- | :--- |
| **Operational** (Jobs, Inventory Levels) | Full Access | Full Access | View/Technical |
| **Customer PII** (Name, Phone) | Visible | Visible | Visible |
| **Billing** (Selling Price, Bill Amount) | Visible | Visible | Hidden |
| **Finance** (Cost Price, Profit Reports) | **Visible** | **Hidden** | Hidden |
| **Payments** | Full Access | Record/View | No Access |
| **System** (Settings, User Mgmt) | Full Access | Limited | No Access |

**Rationale (Scenario A):** Admins operate the shop floor and collect payments (Bill Amount) but do not need to know procurement costs or business profit margins.

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

#### `GET /api/jobs/:jobNumber`
- **Returns:** Composite Object `{ ...Job, History: [], Parts: [], Documents: [] }`
- **Filtering:** Financial fields (`CostPrice`, `EstimatedAmount`) are masked based on Role.

#### `PUT /api/jobs/:jobNumber`
- **Status Update:** Logic enforces `ResolutionType` when Status is set to 'Completed' or 'Cancelled'.

### Spares Management

#### `POST /api/spares/upsert`
- **Purpose:** Idempotent synchronization of spare part prices.
- **Security:** Requires `x-api-key` header.
- **Body:** `{ pumpCategory, pumpType, pumpSize, spareName, basicMaterial, unitPrice, uom, ... }`
- **Response:** `{ status: 'ok' }`

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
   - **Job Info Section:** Displays current issue, status, notes.
   - **Parts Used:** Interactive search (Inventory) and list. **Cost Price** is hidden for non-Owners.
   - **Status Workflow:** Update Status with Resolution Type validation.
   - **Audit Log:** View history trail from `servicerequest_history`.

***

## Implementation Status

### ✅ Completed

1. **Database Architecture:**
   - Reconstructed schema with `assets`, `servicerequest_history`.
   - Implemented triggers for Stock Management (Delete/Update) and Status Auditing.
2. **Backend Logic:**
   - `AssetModel` & `AssetController` created.
   - `ServiceRequest` logic refactored to use `AssetId`.
   - **RBAC Implementation:** `responseFilter.js` strictly enforces visibility (Admin vs Owner). `hideSensitive` toggle logic removed.
3. **Frontend Features:**
   - **Dashboard:** Role-based Sidebar.
   - **Job List:** Updated with Internal Tag and Column Visibility (Worker sees Customer, Admin sees Amount).
   - **Job Details:** Full tabbed interface (Docs, Parts, History). Customer Card is hidden for Workers (masked data).
   - **Inventory:** List view masks Cost Price for Admin/Worker.
   - **User Management:** Admin/Owner page for creating system logins and linking to profiles.
   - **Workers:** Staff Directory with seamless login creation.

### ❌ Yet to Do

1. **Reports Module:** Full implementation of Financial Reports (Owner only).
2. **Customer Portal:** Self-service views.

***
