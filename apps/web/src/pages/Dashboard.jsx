import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This is a placeholder for Phase 2 implementation.
        </p>
        <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
          <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
            Authentication Successful
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
