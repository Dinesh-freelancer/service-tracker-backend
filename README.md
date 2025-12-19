# Monorepo Project

This repository is configured as a monorepo containing both the backend and frontend applications.

## Structure

*   `apps/api`: Backend application (Node.js/Express)
*   `apps/web`: Frontend application (React + Vite)

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (v7 or higher for workspaces support)

### Installation

Install dependencies for all workspaces from the root:

```bash
npm install
```

### Running the Backend

The backend is located in `apps/api`. To run it:

```bash
# From the root
npm start --workspace=apps/api

# Or directly
cd apps/api
npm start
```

### Running the Frontend

The frontend is located in `apps/web`. To run the development server:

```bash
# From the root
npm run dev --workspace=apps/web

# Or directly
cd apps/web
npm run dev
```

## Deployment & Configuration

### 1. Database (Aiven MySQL)

Your database is hosted on Aiven. You will need the **Service URI** or the individual connection details (Host, Port, User, Password) from the Aiven console.

### 2. Backend (Render)

Deploy the `apps/api` directory to Render as a **Web Service**.

*   **Root Directory**: `apps/api`
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   **Environment Variables**:
    Go to the **Environment** tab in your Render dashboard and add the following:

    | Variable | Description | Example Value |
    | :--- | :--- | :--- |
    | `DB_HOST` | Aiven Hostname | `mysql-service.aivencloud.com` |
    | `DB_PORT` | Aiven Port | `12345` |
    | `DB_USER` | Aiven Username | `avnadmin` |
    | `DB_PASSWORD` | Aiven Password | `secret-password` |
    | `DB_NAME` | Database Name | `service_db` |
    | `JWT_SECRET` | Secret for auth tokens | `your-secure-random-string` |
    | `PORT` | (Optional) | Render sets this automatically (usually 10000) |

### 3. Frontend (Vercel)

Deploy the `apps/web` directory to Vercel.

*   **Root Directory**: `apps/web`
*   **Framework Preset**: Vite
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Environment Variables**:
    Go to **Settings > Environment Variables** in your Vercel project and add:

    | Variable | Description | Example Value |
    | :--- | :--- | :--- |
    | `VITE_API_URL` | URL of your deployed Backend | `https://your-app-name.onrender.com/api` |

    *Note: The frontend code must use `import.meta.env.VITE_API_URL` to access this value.*
