# Submersible Motor Service Center – Complete Frontend Documentation

The frontend is a React-based, role-aware, responsive web application built to manage all operations of the Submersible Motor Service Center while strictly enforcing data visibility rules for Admin/Owner, Worker, and Customer roles.[^1][^2]

***

## Web app overview

- **Goal:** Provide a secure, fast, and intuitive interface for managing motor service jobs from enquiry to delivery, including winding details, inventory, purchases, documents, and reports, with strict role-based visibility and a sensitive‑info toggle for Admin/Owner.
- **Primary users:**
    - Admin \& Owner: Full operational and financial control.
    - Worker: Operational view only; no sensitive info.
    - Customer: Self-service portal for own jobs, quotes, invoices, and payments only.
- **Key UX principles:**
    - Desktop‑first, then responsive down to tablet and mobile using MUI’s Grid, breakpoints, and layout components.[^3][^1]
    - Clear separation of “operational” vs “sensitive” information.
    - Minimal, focused views for Worker/Customer (only what they need).

***

## Tech stack \& architecture

- **Framework:** React 18 (CRA-based SPA).
- **UI library:** Material UI (MUI) for components, layout grid, responsive design, and theming.[^2][^1]
- **Routing:** React Router v6 – nested routes for layout + pages.
- **State management:**
    - React Context for:
        - `AuthContext` – user and auth state (token, role).
        - `SensitiveInfoContext` – global sensitive info toggle.
    - Local state/hooks for page-level UI.
- **HTTP client:** Axios instance with:
    - Base URL from `REACT_APP_API_URL`.
    - Request interceptor adding JWT `Authorization: Bearer <token>`.
    - Response interceptor handling 401 (auto logout).
- **Forms \& validation:** React Hook Form + Yup.
- **Layout:**

```
- Persistent `<Navbar>` + `<Sidebar>` + `<MainLayout>` shell for authenticated routes.
```

    - Responsive MUI AppBar and Drawer (sidebar collapses on smaller screens).[^1][^3]
- **Role-based access control (frontend):**
    - `PrivateRoute` component checks `AuthContext.user.Role`.
    - Menu items and page access restricted by allowed roles.
- **Sensitive info toggle:**
    - Owned by `SensitiveInfoContext`, visible only for Admin/Owner in Navbar.
    - Used by UI to hide/show sensitive fields.
    - Will be mirrored in API calls (e.g., `?hideSensitive=true`).

***

## Global navigation \& tabs

Main navigation is role‑aware; items are filtered based on `user.Role`:

- **Common (Admin/Owner/Worker/Customer):**
    - Dashboard
    - Jobs
- **Admin/Owner only:**
    - Customers
    - Inventory
    - Purchases
    - Winding Details
    - Documents
    - Reports
    - Workers
    - Attendance
    - Settings / User management
    - Audit Logs
- **Worker:**
    - Jobs (all jobs, limited fields)
    - Winding Details (only for allowed job statuses)
- **Customer:**
    - My Jobs
    - My Documents (quotes/invoices)
    - My Payments

Sidebar items (example mapping):


| Tab | Route | Roles |
| :-- | :-- | :-- |
| Dashboard | `/dashboard` | Admin, Owner, Worker, Customer |
| Jobs | `/jobs` | Admin, Owner, Worker, Customer |
| Customers | `/customers` | Admin, Owner |
| Inventory | `/inventory` | Admin, Owner, Worker (limited) |
| Purchases | `/purchases` | Admin, Owner |
| Winding Details | `/winding-details` | Admin, Owner, Worker (limited) |
| Documents | `/documents` | Admin, Owner, Customer (limited) |
| Reports | `/reports` | Admin, Owner |
| Workers | `/workers` | Admin, Owner |
| Attendance | `/attendance` | Admin, Owner, Worker (view only) |
| Settings | `/settings` | Admin, Owner |
| Audit Logs | `/audit-logs` | Admin, Owner |


***

## Key interfaces / screens (by phase)

### Phase 1 – Core shell \& authentication (partially implemented)

**1. Login page**

- **Route:** `/login`
- **Features:**
    - Username, password fields.
    - On submit:
        - `POST /api/auth/login` → get `{ token, Role }`.
        - Store token \& user object in `localStorage`.
        - Update `AuthContext` and redirect to `/dashboard`.
    - Error messages from backend.

**2. App shell / layout**

- **Components:** `MainLayout`, `Navbar`, `Sidebar`.
- **Navbar:**
    - App title.
    - Hamburger for sidebar on mobile.
    - Sensitive info toggle for Admin/Owner (`Sensitive Info: Hidden/Visible`).
    - Profile menu with role display and Logout.
- **Sidebar:**
    - Role-filtered menu items.
    - MUI `Drawer`, responsive; closes automatically on small screens.

**3. Auth \& sensitive contexts**

- **AuthContext:**
    - `user`, `login(userData, token)`, `logout()`, `isAuthenticated`.
- **SensitiveInfoContext:**
    - `showSensitiveInfo`, `toggleSensitiveInfo()`.
    - Default: false (hidden) even for Admin/Owner.

**Status:**

- Project scaffolding created.
- Authentication wiring (contexts, login, layout, protected routes) defined and partially coded.

***

### Phase 2 – Dashboard

**Dashboard page (`/dashboard`)**

- Role‑aware widgets:
    - Admin/Owner:
        - Job counts by status.
        - Today’s jobs.
        - Revenue/payments summary (hidden if sensitive toggle = hidden).
        - Low stock alerts.
    - Worker:
        - Jobs in progress.
        - Jobs assigned to me.
        - Simple counts only, no financials.
    - Customer:
        - My jobs summary.
        - Pending payment total.
- Implementation:
    - Uses MUI Grid and Cards to layout metrics, with responsive breakpoints.[^3][^1]

***

### Phase 3 – Jobs (Service Requests)

**1. Jobs list (`/jobs`)**

- **Admin/Owner:**
    - Filterable table: JobNumber, CustomerName, MotorBrand/HP, Status, DateReceived, Amounts.
    - Actions: View, Edit, Update status.
    - Sensitive toggle hides: Customer info, amounts when off.
- **Worker:**
    - Sees all jobs, but:
        - Customer names masked.
        - No amounts, payments, profits.
        - Basic motor info, status, substatus (from work logs), assignee.
- **Customer:**
    - Sees only own jobs.
    - Columns: JobNumber, Motor info, overall status, high-level estimate \& invoice links.
    - No work logs, parts used, internal notes.

**2. Job detail (`/jobs/:jobNumber`)**

- Tabs/sections:
    - Overview (motor + status timeline).
    - Work status (substatus + assignee; times/notes hidden from worker).
    - Estimates \& invoices (Admin/Owner full; Customer only own; Worker none).
    - Payments (Admin/Owner full; Customer own; Worker none).
    - Parts used (Admin/Owner full; Worker names/qty only; Customer none).
    - Winding details (Admin/Owner full; Worker only when job status Approved/Work In Progress).
    - Documents (quotes/invoices embedding; Customer see own).
- Sensitive toggle impacts:
    - Admin/Owner hide/show customer info, monetary fields, winding details.

***

### Phase 4 – Customer portal

**1. Customers list \& detail (`/customers`, `/customers/:id`)**

- Admin/Owner:
    - List, create, edit customers.
    - Detail page with jobs, payments, documents.
- Customers:
    - Only a “My Profile” view (likely `/profile`) using same data but restricted route.
- Sensitive toggle:
    - Hides customer’s own contact info when showing screen to others (for Owner/Admin demonstration scenarios).

***

### Phase 5 – Inventory, parts, suppliers \& purchases

**Inventory list (`/inventory`)**

- Admin/Owner:
    - Full table with stock levels, costs, supplier.
    - Add/edit part.
- Worker:
    - Only sees part name, unit, quantity (no cost, supplier).
- Sensitive toggle:
    - Additional hiding for Admin/Owner when showing screen publicly.

**Suppliers (`/suppliers`)**

- Admin/Owner only.

**Purchases (`/purchases`)**

- Admin/Owner:
    - View/add purchases, items, costs.
- Worker:
    - No direct access (or optional read-only with limited fields).
- Customer:
    - No access.

***

### Phase 6 – Winding details (`/winding-details`)

- Admin/Owner:
    - List, view, add/edit winding records per job.
    - Full detail view with HP, SWG, wire sizes, turns, slot_turns JSON rendered nicely.
- Worker:
    - Read-only access limited to:
        - Jobs where status is `Approved By Customer` or `Work In Progress`.
        - No customer info, no financials.
- Customer:
    - No access.
- Sensitive toggle:
    - Admin/Owner can quickly hide winding section when toggled off.

***

### Phase 7 – Documents (`/documents`)

- Admin/Owner:
    - List all documents with filters (job, customer, type).
    - Add document form with OneDrive embed tag.
- Customer:
    - “My Documents” view: only quotes/invoices for their jobs.
- Worker:
    - No direct documents access.
- UI:
    - Uses iframe/modal to show embed tags.

***

### Phase 8 – Workers \& Attendance (`/workers`, `/attendance`)

- Workers list (Admin/Owner):
    - Create/edit worker, view profile, skills, jobs.
- Attendance:
    - Admin/Owner log attendance; workers view only (for all workers, read-only).
- Customer:
    - No access.

***

### Phase 9 – Payments \& reports

**Payments (`/payments`)** – optional separate screen (or via job detail)

- Admin/Owner:
    - Full list and job-level filters.
- Customer:
    - Payments related to own jobs (via job detail or `/my-payments`).
- Worker:
    - No access.

**Reports (`/reports`)**

- Admin/Owner:
    - Job status, financial, technician, inventory alerts, summary reports with charts.
- Worker:
    - At most, an operational view (counts) without amounts.
- Customer:
    - No reports.

***

### Phase 10 – Settings \& audit logs

**Settings (`/settings`)**

- Admin/Owner:
    - Company info, branding, global configurations.
    - Potential future toggle defaults.

**Audit logs (`/audit-logs`)**

- Admin/Owner:
    - Table with log entries (user, action, time, details).
    - Filters by user/date/type.

***

## Role-based UI behavior

### Admin \& Owner

- Full access to all screens.
- Can toggle sensitive info visibility.
- Can create/edit/delete most entities.
- See all financials, customer data, winding details.


### Worker

- Can see all jobs but:
    - No customer details (only job number and motor data).
    - No financial info (quotes, invoices, payments, profits).
    - Work logs: only substatus and assignee (no times, notes).
    - Winding details: only for jobs with status Approved/Work In Progress.
    - Inventory: only parts used per job (where applicable), or read-only inventory names and quantities.
    - Attendance: read-only for all workers.


### Customer

- Only sees:
    - Own jobs and limited fields (motor info, overall status).
    - Quotes, invoices, and payments for their own jobs.
    - Their own documents.
- Does not see:
    - Worker details/attendance.
    - Parts used, inventory.
    - Internal work logs or statuses beyond overall state.

***

## Responsive design strategy

- **Layout:**
    - Desktop: sidebar pinned, content area wide.
    - Tablet: sidebar collapsible, fewer columns in tables.
    - Mobile: sidebar as temporary drawer; tables rendered as stacked cards; forms full-width.[^1][^3]
- **MUI grid \& breakpoints:**
    - Use `Grid` with `xs`/`sm`/`md`/`lg` props for cards and layouts.
    - Typography and padding adjust with screen size.
- **Navigation:**
    - Navbar always visible; sidebar toggled via menu icon on narrow viewports.

***

## Frontend implementation status

### ✅ Completed / Implemented (Phase 1 foundations)

1. **Project setup**
    - CRA project created.
    - MUI, React Router, Axios, React Hook Form, Yup installed.[^2]
2. **API service layer**
    - `api.js` Axios instance with base URL and token interceptor.
3. **Auth service**
    - `authService.js` with `login`, `logout`, `getCurrentUser`, `isAuthenticated`.
4. **AuthContext**
    - Stores `user`, handles login/logout, reads from localStorage.
5. **SensitiveInfoContext**
    - Stores `showSensitiveInfo` and `toggleSensitiveInfo`.
6. **Navbar**
    - Shows title, profile menu, and sensitive info toggle for Admin/Owner.
7. **Sidebar**
    - Role-based menu items (Dashboard, Jobs, etc.).
8. **MainLayout**
    - Combines Navbar, Sidebar, and main content using React Router’s `<Outlet>`.
9. **PrivateRoute**
    - Protects routes and supports `allowedRoles` check.
10. **Login page**
    - Form tied to backend login, sets user context and token.

### 🟡 Partially done / Scaffolding present

1. **Placeholder pages:**
    - Dashboard, Jobs, Customers placeholders wired to routes.
2. **Routing structure:**
    - Base routes in `App.js` with nested layout.
3. **Role-based menu filtering:**
    - Implemented for major modules (to be refined as modules grow).

### ❌ Yet to do (frontend)

1. **Dashboard UI**
    - Build role-specific dashboard cards and charts.
    - Connect to backend summary \& job status endpoints.
2. **Jobs module**
    - Implement Jobs list with filters, pagination, and role-specific columns.
    - Implement Job detail with tabs and role-based visibility.
    - Implement Create/Edit job forms (Admin/Owner only).
3. **Customer module**
    - Customer list and detail screens.
    - My Profile screen for customers.
4. **Inventory \& parts**
    - Inventory list cards/tables (role-based fields).
    - Part create/edit dialogs.
5. **Suppliers \& purchases**
    - Supplier list/edit screens.
    - Purchase entry form and listing.
6. **Winding details**
    - Winding list and detail views with JSON slot turns visualized.
    - Status-based access for workers.
7. **Documents**
    - Document list and add forms with embed tag input.
    - Viewer in modal/iframe.
8. **Workers \& attendance**
    - Worker list/detail.
    - Attendance calendar/table with Admin/Owner edit and Worker view-only.
9. **Payments \& customer portal**
    - My Jobs, My Documents, My Payments screens for customers.
    - Payment history components (role-restricted).
10. **Reports**
    - Job status, financial, technician, inventory alerts, and summary report pages with charts.
11. **Settings \& audit logs**
    - Settings UI and Audit log viewer.
12. **Sensitive info integration**
    - Ensure all sensitive fields in UI respect `showSensitiveInfo` and role.
    - Add `hideSensitive` parameter in API calls where necessary.
13. **Validation and UX enhancements**
    - Form validations with React Hook Form + Yup.
    - Consistent error handling and toast notifications.
14. **Testing**
    - Component tests and integration testing for critical flows.
15. **Performance \& optimization**
    - Code splitting, lazy loading for heavy routes.
    - Memoization where needed.

***

This document outlines the entire frontend architecture, goals, key screens per role, tech stack, responsive strategy, and a clear status of what is built vs pending. It can be used by UI/UX designers and frontend developers as the master blueprint for implementing the web application.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://mui.com/material-ui/guides/responsive-ui/

[^2]: https://www.zipy.ai/blog/material-ui-guide

[^3]: https://smartters.in/blog/creating-responsive-layouts-in-react-using-material-ui-grid

[^4]: https://www.browserstack.com/guide/how-to-make-react-app-responsive

[^5]: https://www.reddit.com/r/reactnative/comments/y41bet/best_practicesapproach_for_responsive_design_in/

[^6]: https://www.reddit.com/r/reactjs/comments/14v6599/how_does_everyone_handle_responsive_layouts/

[^7]: https://nareshit.com/blogs/responsive-ui-in-react-using-modern-css

[^8]: https://www.dhiwise.com/post/the-ultimate-guide-to-achieving-react-mobile-responsiveness

[^9]: https://marmelab.com/react-admin/AuthRBAC.html

[^10]: https://blog.pixelfreestudio.com/responsive-web-design-with-react-a-practical-guide/

[^11]: https://www.permit.io/blog/implementing-react-rbac-authorization

[^12]: https://www.reddit.com/r/react/comments/1ewnyxo/best_methods_for_responsive_design_across_all/

[^13]: https://www.reddit.com/r/reactjs/comments/1aur1fz/best_practices_for_implementing_rolebased_access/

[^14]: https://www.coders.dev/blog/revolutionize-with-responsive-react-design.html

[^15]: https://mui.com/material-ui/getting-started/usage/

[^16]: https://www.cerbos.dev/blog/how-to-use-react-js-for-secure-role-based-access-control

[^17]: https://www.uxpin.com/studio/blog/best-practices-examples-of-excellent-responsive-design/

[^18]: https://m1.material.io/layout/responsive-ui.html

[^19]: https://dev.to/veaceslav/implementing-role-based-access-control-in-react-a-deep-dive-into-userolemanagement-hook-129i

[^20]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design

