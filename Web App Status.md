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

- **Frontend:** React, Vite, Tailwind CSS, React Router, React Helmet Async
- **Backend:** Node.js with Express.js
- **Database:** MySQL with connection pooling
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

[... Previous Schema Sections 1-17 ...]

### 18. **Leads Table (New)**

```sql
CREATE TABLE Leads (
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
3. **Database Schema** – All 18 tables designed (including Leads).
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
