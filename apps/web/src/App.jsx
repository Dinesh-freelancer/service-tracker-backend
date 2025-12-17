import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css';

// Placeholder Login Component
const Login = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <p className="text-gray-600">This is the placeholder for the internal portal login.</p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
