# Submersible Motor Service Center – Complete Frontend Documentation

The frontend is a React-based, role-aware, responsive web application built to manage all operations of the Submersible Motor Service Center while strictly enforcing data visibility rules for Admin/Owner, Worker, and Customer roles.

***

## Web app overview

- **Goal:** Provide a secure, fast, and intuitive interface for managing motor service jobs from enquiry to delivery, including winding details, inventory, purchases, documents, and reports, with strict role-based visibility and a sensitive‑info toggle for Admin/Owner.
- **New Requirement:** A portfolio site for the company which will include the login page.
- **Primary users:**
    - Admin & Owner: Full operational and financial control.
    - Worker: Operational view only; no sensitive info.
    - Customer: Self-service portal for own jobs, quotes, invoices, and payments only.
- **Key UX principles:**
    - Desktop‑first, then responsive down to tablet and mobile.
    - Clear separation of “operational” vs “sensitive” information.
    - Minimal, focused views for Worker/Customer (only what they need).

***

## Tech stack & architecture

- **Framework:** React 18 (Vite-based SPA).
- **UI library:** Material UI (MUI) for components, layout grid, responsive design, and theming.
- **Routing:** React Router v6.
- **State management:** React Context + Hooks.
- **HTTP client:** Axios.
- **Forms:** React Hook Form + Yup.

***

## Frontend implementation status

### ❌ Starting Phase

The frontend implementation is starting from scratch. No phases have been completed yet.

### Key interfaces / screens (Planned)

#### Public Portfolio Site
- **Home Page**: Company overview, services, contact info.
- **Login Page**: Entry point for the web application (`/login`).

#### Web Application (Authenticated)
1. **Dashboard**
    - Role-specific widgets and metrics.
2. **Jobs (Service Requests)**
    - List and Detail views with role-based filtering and sensitive data toggling.
3. **Customer Portal**
    - My Jobs, My Documents, Profile.
4. **Inventory & Purchases**
    - Stock management, supplier tracking.
5. **Winding Details**
    - Technical specifications for motor winding.
6. **Documents**
    - Quote and Invoice management.
7. **Workers & Attendance**
    - Staff management and tracking.
8. **Reports**
    - Financial and operational reports.
9. **Settings & Audit Logs**
    - System configuration and security logs.

***

This document serves as the master blueprint for the frontend implementation.
