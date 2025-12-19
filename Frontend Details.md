# Submersible Motor Service Center – Complete Frontend Documentation

The frontend is a React-based, role-aware, responsive web application built to manage all operations of the Submersible Motor Service Center while strictly enforcing data visibility rules for Admin/Owner, Worker, and Customer roles.

***

## Web app overview

- **Goal:** Provide a secure, fast, and intuitive interface for managing motor service jobs from enquiry to delivery, including winding details, inventory, purchases, documents, and reports, with strict role-based visibility and a sensitive‑info toggle for Admin/Owner.
- **Requirement:** A portfolio site for the company which includes the login page.
- **Primary users:**
    - Admin & Owner: Full operational and financial control.
    - Worker: Operational view only; no sensitive info.
    - Customer: Self-service portal for own jobs, quotes, invoices, and payments only.

***

## Tech stack & architecture

- **Framework:** React 18 (Vite-based SPA).
- **Styling:** Tailwind CSS v3 (configured with Deep Navy & Slate Blue).
- **UI library:** Lucide React (Icons).
- **Routing:** React Router v6.
- **State management:** React Hooks.
- **Forms:** React Hook Form.
- **SEO:** React Helmet Async (JSON-LD Schema).
- **PWA:** Vite Plugin PWA.

***

## Frontend implementation status

### ✅ Completed Phase 1: Portfolio Site

The public-facing Landing Page has been implemented.

- **Landing Page (`/`)**:
    - Hero Section with CTA ("Track My Repair").
    - "Schedule a Pickup" Form (POSTs to `/api/leads/pickup`).
    - Trust Section (Legacy, Warranty).
    - Services Grid (Pump Types).
    - Location Section (Google Maps Placeholder).
    - WhatsApp Integration (Floating Button).
    - Footer with Quick Links.
    - **SEO:** JSON-LD Schema for LocalBusiness.
    - **PWA:** Basic manifest configuration.

- **Login Page (`/login`)**:
    - Placeholder component connected via React Router.

### ❌ Upcoming Phase 2: Internal Portal Integration

The following screens are planned but not yet implemented (currently placeholders):

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
