import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import JobsList from './pages/jobs/JobsList';
import CreateJob from './pages/jobs/CreateJob';
import JobDetails from './pages/jobs/JobDetails';
import DashboardLayout from './layout/DashboardLayout';
import { SensitiveInfoProvider } from './context/SensitiveInfoContext';
import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard Routes wrapped in Layout */}
      <Route path="/dashboard" element={
          <ProtectedRoute>
            <SensitiveInfoProvider>
              <DashboardLayout />
            </SensitiveInfoProvider>
          </ProtectedRoute>
      }>
          <Route index element={<Dashboard />} />

          {/* Placeholder Routes for Sidebar Links */}
          <Route path="jobs" element={<JobsList />} />
          <Route path="jobs/new" element={<CreateJob />} />
          <Route path="jobs/:jobNumber" element={<JobDetails />} />
          <Route path="customers" element={<Placeholder />} />
          <Route path="inventory" element={<Placeholder />} />
          <Route path="reports" element={<Placeholder />} />
          <Route path="settings" element={<Placeholder />} />
          <Route path="work-logs" element={<Placeholder />} />
          <Route path="my-jobs" element={<Placeholder />} />
          <Route path="documents" element={<Placeholder />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
