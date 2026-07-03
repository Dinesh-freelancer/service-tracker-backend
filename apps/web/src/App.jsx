import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import JobsList from './pages/jobs/JobsList';
import CreateJob from './pages/jobs/CreateJob';
import JobDetails from './pages/jobs/JobDetails';
import TodoList from './pages/todo/TodoList';
import DashboardLayout from './layout/DashboardLayout';
import UserManagement from './pages/settings/UserManagement';
import Workers from './pages/admin/Workers';
import Customers from './pages/admin/Customers';
import Inventory from './pages/admin/Inventory';
import Settings from './pages/settings/Settings';
import GlobalSettings from './pages/settings/GlobalSettings';
import MyJobs from './pages/customer/MyJobs';
import MyDocuments from './pages/customer/MyDocuments';
import Profile from './pages/customer/Profile';
import WorkLogs from './pages/worker/WorkLogs';
import Reports from './pages/reports/Reports';
import Purchases from './pages/admin/Purchases';
import CreatePurchase from './pages/admin/CreatePurchase';
import Attendance from './pages/admin/Attendance';
import SalesItems from './pages/admin/SalesItems';
import Enquiries from './pages/admin/Enquiries';
import Buy from './pages/public/Buy';
import BuyDetails from './pages/public/BuyDetails';
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
      <Route path="/buy" element={<Buy />} />
      <Route path="/buy/:itemId" element={<BuyDetails />} />

      {/* Dashboard Routes wrapped in Layout */}
      <Route path="/dashboard" element={
          <ProtectedRoute>
              <DashboardLayout />
          </ProtectedRoute>
      }>
          <Route index element={<Dashboard />} />

          {/* Placeholder Routes for Sidebar Links */}
          <Route path="jobs" element={<JobsList />} />
          <Route path="jobs/new" element={<CreateJob />} />
          <Route path="jobs/:jobNumber" element={<JobDetails />} />
            <Route path="todos" element={<ProtectedRoute allowedRoles={['Admin', 'Owner']}><TodoList /></ProtectedRoute>} />
          <Route path="users" element={<UserManagement />} />
          <Route path="workers" element={<Workers />} />
          <Route path="attendance" element={<Attendance />} />

          <Route path="customers" element={<Customers />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales-items" element={<SalesItems />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/create" element={<CreatePurchase />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/global" element={<GlobalSettings />} />
          <Route path="work-logs" element={<WorkLogs />} />
          <Route path="my-jobs" element={<MyJobs />} />
          <Route path="documents" element={<MyDocuments />} />
          <Route path="profile" element={<Profile />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
