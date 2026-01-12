# Submersible Motor Service Center – Complete Frontend Documentation

The frontend is a React-based, role-aware, responsive web application built to manage all operations of the Submersible Motor Service Center while strictly enforcing data visibility rules for Admin/Owner, Worker, and Customer roles.

***

## Web app overview

- **Goal:** Provide a secure, fast, and intuitive interface for managing motor service jobs from enquiry to delivery, including winding details, inventory, purchases, documents, and reports, with strict role-based visibility.
- **Requirement:** A portfolio site for the company which includes the login page.
- **Primary users:**
    - **Owner:** Full operational and financial control (Finance, Reports, Costs).
    - **Admin (Manager):** Operational control (Jobs, Inventory, Attendance) but NO access to Cost Prices or Profit/Loss reports.
    - **Worker:** Technical view only (Job Details, Parts Usage); NO access to financial data or customer billing.
    - **Customer:** Self-service portal for own jobs, quotes, invoices, and payments only.

***

## Tech stack & architecture

- **Framework:** React 18 (Vite-based SPA).
- **Styling:** Tailwind CSS v4 (configured with Deep Navy & Slate Blue).
- **UI library:** Lucide React (Icons).
- **Routing:** React Router v6.
- **State management:** React Hooks.
- **Forms:** React Hook Form + Zod.
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
    - Fully implemented split-screen login.
    - Unified single login form.
    - Features: Dark Mode, Forgot Password Modal, Remember Me.

### ✅ Completed Phase 2: Internal Portal Core

1. **Dashboard Layout**
    - Responsive Sidebar with Role-Based Navigation.
    - **Security:** Strict Role-Based Access Control (RBAC). No manual "Hide Sensitive" toggle.
    - Global Notifications (Toaster) and Dark Mode.

2. **Jobs (Service Requests)**
    - **Create Job:** Wizard-style form supporting Customer Selection and Asset Creation (Hybrid Transaction).
    - **Jobs List:** Paginated, Filterable (Status/Search).
        - Admin/Owner see Financials (Bill Amount) and Customer Name.
        - Workers see Job Info and Customer Name but NO Financials.
    - **Job Details:** Tabbed Interface.
        - **Status Workflow:** Update Status with Resolution Type validation.
        - **Parts Used:** Add/List parts. Search Inventory. (Cost hidden for Non-Owners).
        - **Documents:** Add/View links.
        - **Audit Log:** View history trail.
        - **Asset Details:** View linked asset specs.

3. **User Management & HR**
    - **Workers Directory:** List staff, view attendance, create profiles. Support for seamless User Login creation.
    - **User Management:** Create/Edit System Logins. Link Users to Worker/Customer Profiles.

4. **Inventory** (Partial)
    - List View (Cost Price hidden for Non-Owners).

### 🟡 Pending Integration

1. **Customer Portal**
    - My Jobs, My Documents, Profile.
2. **Winding Details**
    - Technical specifications for motor winding.
3. **Attendance**
    - Detailed tracking (Calendar/Check-in).
4. **Reports**
    - Financial and operational reports (Restricted to Owner).
5. **Settings**
    - System configuration.

***

This document serves as the master blueprint for the frontend implementation.
