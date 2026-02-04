import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Users, User, Shield, Sun } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const isOwner = role === 'Owner';

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SettingsIcon className="text-slate-600 dark:text-slate-400" />
                Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">System configuration and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* User Management (Owner Only) */}
            {isOwner && (
                <div
                    onClick={() => navigate('/dashboard/users')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group"
                >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 w-fit mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <Users size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">User Management</h3>
                    <p className="text-sm text-slate-500">Manage system users, roles, and access permissions.</p>
                </div>
            )}

            {/* Profile Settings */}
            <div
                onClick={() => navigate('/dashboard/profile')}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group"
            >
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 w-fit mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                    <User size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">My Profile</h3>
                <p className="text-sm text-slate-500">View and update your personal account details.</p>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 w-fit mb-4">
                    <Sun size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Appearance</h3>
                <p className="text-sm text-slate-500 mb-4">Toggle between light and dark mode.</p>
                <div className="text-xs text-slate-400 italic">
                    Use the toggle in the top navigation bar.
                </div>
            </div>

             {/* System Info */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-600 w-fit mb-4">
                    <Shield size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">System Info</h3>
                <div className="text-sm text-slate-500 space-y-1">
                    <div className="flex justify-between"><span>Version</span> <span>2.1.0 (Phase 2)</span></div>
                    <div className="flex justify-between"><span>Environment</span> <span>Production</span></div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default Settings;
