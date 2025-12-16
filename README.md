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

## Deployment

### Backend (Render)

*   **Root Directory**: Set to `apps/api` in your Render service settings.
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   **Environment Variables**: Ensure all required environment variables (DB credentials, JWT secrets, etc.) are set in the Render dashboard.

### Frontend (Vercel)

*   **Framework Preset**: Vite (Auto-detected).
*   **Root Directory**: `apps/web` (You may need to configure this in Vercel settings if it doesn't auto-detect the monorepo structure correctly, but usually Vercel handles this well).
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
