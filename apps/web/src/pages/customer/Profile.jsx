import React, { useState, useEffect } from 'react';
import { User, Shield, MapPin, Phone, Mail, Loader2, Briefcase } from 'lucide-react';
import { parseJwt } from '../../utils/auth';
import toast from 'react-hot-toast';

const Profile = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const user = parseJwt(token);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.CustomerId) return;

      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/customers/${user.CustomerId}`, {
             headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to load profile');

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        toast.error('Could not load profile details');
      } finally {
        setLoading(false);
      }
    };

    if (role === 'Customer') {
        fetchProfile();
    }
  }, []);

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
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold uppercase">
                        {profile?.CustomerName ? profile.CustomerName.charAt(0) : (user?.Username ? user.Username.charAt(0) : 'U')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {profile?.CustomerName || user?.Username || 'User'}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                                <Shield size={12} />
                                {role}
                            </span>
                            {profile?.CustomerType === 'OrganizationMember' && (
                                <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                                    <Briefcase size={12} />
                                    {profile.OrganizationName || 'Organization'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-slate-400" />
                    </div>
                ) : (
                    <>
                        {/* Contact Details (Customer Only) */}
                        {profile && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase text-slate-400 font-semibold mb-1 flex items-center gap-1">
                                            <Phone size={12} /> Primary Contact
                                        </label>
                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                            {profile.PrimaryContact || profile.MobileNumber || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase text-slate-400 font-semibold mb-1 flex items-center gap-1">
                                            <Mail size={12} /> Email
                                        </label>
                                        <div className="text-slate-700 dark:text-slate-300 font-medium break-all">
                                            {profile.Email || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase text-slate-400 font-semibold mb-1 flex items-center gap-1">
                                            <MapPin size={12} /> Address
                                        </label>
                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                            {profile.Address ? (
                                                <>
                                                    {profile.Address}<br />
                                                    {profile.City}, {profile.State} - {profile.Pincode}
                                                </>
                                            ) : 'No address provided'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System IDs */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1">User ID</label>
                                <div className="font-mono text-slate-600 dark:text-slate-400">{user?.UserId}</div>
                            </div>
                            {user?.CustomerId && (
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1">Customer ID</label>
                                    <div className="font-mono text-slate-600 dark:text-slate-400">{user.CustomerId}</div>
                                </div>
                            )}
                            {user?.WorkerId && (
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1">Worker ID</label>
                                    <div className="font-mono text-slate-600 dark:text-slate-400">{user.WorkerId}</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
             <div className="bg-slate-50 dark:bg-slate-700/30 p-4 text-center text-xs text-slate-500">
                To update your profile details, please contact the administrator.
            </div>
        </div>
    </div>
  );
};

export default Profile;
