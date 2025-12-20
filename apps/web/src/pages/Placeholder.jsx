import React from 'react';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Placeholder = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6 animate-pulse">
        <Construction size={64} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {pageName}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        This module is currently under development. Phase 2 focuses on the Dashboard functionality.
        Check back soon for updates!
      </p>
    </div>
  );
};

export default Placeholder;
