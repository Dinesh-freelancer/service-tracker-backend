import React from 'react';
import { User, Shield } from 'lucide-react';
import { parseJwt } from '../../utils/auth';

const Profile = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const user = parseJwt(token);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-blue-600" />
                Profile
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your account information.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
                        {role ? role.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {user?.Username || role || 'User'}
                        </h2>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Shield size={14} />
                            {role}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">User ID</label>
                        <div className="font-mono text-slate-700 dark:text-slate-300">{user?.UserId}</div>
                    </div>
                     <div>
                        <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Customer ID</label>
                        <div className="font-mono text-slate-700 dark:text-slate-300">{user?.CustomerId || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Worker ID</label>
                        <div className="font-mono text-slate-700 dark:text-slate-300">{user?.WorkerId || 'N/A'}</div>
                    </div>
                </div>
            </div>
             <div className="bg-slate-50 dark:bg-slate-700/30 p-4 text-center text-xs text-slate-500">
                To update your profile details, please contact the administrator.
            </div>
        </div>
    </div>
  );
};

export default Profile;
