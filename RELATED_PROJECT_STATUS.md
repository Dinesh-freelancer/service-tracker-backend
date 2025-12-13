# Backend Service Status & Integration Guide

*Last Updated: [Current Date]*

This document serves as the interface contract and status update for the Frontend application integrating with the Submersible Motor Service Center Backend.

## 1. System Overview
- **Tech Stack:** Node.js, Express, MySQL.
- **Base API Path:** `/api`
- **Authentication:** JWT (Bearer Token).
- **Header:** `Authorization: Bearer <token>`

## 2. Role-Based Access Control (RBAC)
The system supports 4 roles. The backend strictly enforces data visibility based on these roles.

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Admin** | Full | Full access to all data and features. |
| **Owner** | Full | Same as Admin. |
| **Worker** | Operational | Access to Jobs, Inventory, Work Logs. **No Financials.** **No Customer PII.** |
| **Customer** | Personal | Read-only access to own Jobs, Quotes, Invoices. |

## 3. Data Visibility & API Filtering (Implemented)

The backend now applies **API Layer Filtering** to all responses.

### Global Behavior
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

## 4. Entity Field Mappings (Frontend Reference)

Please verify the Frontend binds to these exact keys returned by the API:

-   **Service Request:** `JobNumber`, `PumpsetBrand`, `PumpsetModel`, `SerialNumber`, `HP`, `Warranty`, `Status`, `Notes`.
-   **Customer:** `CustomerId`, `CustomerName`, `WhatsappNumber`, `Address`.
-   **Inventory:** `PartId`, `PartName`, `QuantityInStock`, `Unit`.

## 5. Audit Logging
- **Sensitive Access:** The backend logs an "Unauthorized Sensitive Toggle Attempt" if a Worker/Customer tries to force `hideSensitive=false`.
- **View Logging:** When an Admin views sensitive data (unmasked), an audit log "Sensitive Data Viewed" is created.

## 6. Recent Changes (Backend)
- **[Feature] API Layer Filtering:** Centralized response masking implemented.
- **[Feature] Audit Extension:** Added logging for sensitive views and blocked payment access.
- **[Fix] Winding Details:** Logic added to check Job Status before revealing winding data.
- **[Feature] Error Handling:** Centralized error handling middleware implemented.
- **[Feature] Input Validation:** Added request validation for Auth, Customer, and Job creation endpoints using `express-validator`.
- **[Feature] Pagination:** Implemented pagination for `Jobs`, `Inventory`, `Customers`, and `WorkLogs`.
    -   **Response Format Change:** List endpoints now return an object `{ data: [...], pagination: { ... } }` instead of a direct array.
    -   **Query Params:** Support `?page=1&limit=10`.

---
*Refer to this document when updating Frontend components to handle "Hidden" values, 403 states, and Paginated responses.*
