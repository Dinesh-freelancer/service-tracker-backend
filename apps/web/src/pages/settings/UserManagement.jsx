import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Validation Schemas
const userSchema = z.object({
  Username: z.string().min(3, 'Username must be at least 3 characters'),
  Role: z.enum(['Admin', 'Owner', 'Worker', 'Customer']),
  Password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  // Link Fields
  LinkType: z.enum(['None', 'Worker', 'Customer']).optional(),
  LinkId: z.string().optional() // Will be parsed to int
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { Role: 'Worker', LinkType: 'None' }
  });

  const linkType = watch('LinkType');

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
      try {
          const [wRes, cRes] = await Promise.all([
              fetch(`${apiUrl}/workers`, { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`${apiUrl}/customers?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }) // Fetch all for dropdown
          ]);
          if (wRes.ok) setWorkers(await wRes.json());
          if (cRes.ok) {
              const cData = await cRes.json();
              setCustomers(cData.data || []);
          }
      } catch (err) {
          console.error("Failed to fetch profiles", err);
      }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
      if (isEditOpen) fetchProfiles();
  }, [isEditOpen]);

  // Filter Users
  const filteredUsers = users.filter(u =>
    u.Username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.Role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const onSubmitAdd = async (data) => {
    if (!data.Password) {
      toast.error('Password is required for new users');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create user');

      toast.success(`User ${data.Username} created`);
      setIsAddOpen(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onEditClick = (user) => {
    setSelectedUser(user);
    setValue('Username', user.Username);
    setValue('Role', user.Role);
    setValue('Password', '');

    // Set Link Fields
    if (user.WorkerId) {
        setValue('LinkType', 'Worker');
        setValue('LinkId', String(user.WorkerId));
    } else if (user.CustomerId) {
        setValue('LinkType', 'Customer');
        setValue('LinkId', String(user.CustomerId));
    } else {
        setValue('LinkType', 'None');
        setValue('LinkId', '');
    }

    setIsEditOpen(true);
  };

  const onSubmitEdit = async (data) => {
    try {
      const payload = { Role: data.Role };
      if (data.Password) payload.Password = data.Password;

      // Handle Linking
      if (data.LinkType === 'Worker') {
          payload.WorkerId = parseInt(data.LinkId);
          payload.CustomerId = null;
      } else if (data.LinkType === 'Customer') {
          payload.CustomerId = parseInt(data.LinkId);
          payload.WorkerId = null;
      } else {
          payload.WorkerId = null;
          payload.CustomerId = null;
      }

      const res = await fetch(`${apiUrl}/users/${selectedUser.UserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update user');

      toast.success('User updated');
      setIsEditOpen(false);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
        const res = await fetch(`${apiUrl}/users/${user.UserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ IsActive: !user.IsActive })
        });
        if (!res.ok) throw new Error('Failed to update status');
        fetchUsers();
        toast.success(`User ${user.Username} ${user.IsActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
        toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
        const res = await fetch(`${apiUrl}/users/${userId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete');
        }
        toast.success('User deleted');
        fetchUsers();
    } catch (err) {
        toast.error(err.message);
    }
  };

  // Role Badges
  const getRoleBadge = (role) => {
    switch (role) {
        case 'Owner': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium"><ShieldAlert size={12}/> Owner</span>;
        case 'Admin': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium"><ShieldCheck size={12}/> Admin</span>;
        case 'Worker': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-medium"><UserIcon size={12}/> Worker</span>;
        default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-medium"><Users size={12}/> Customer</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-blue-600" />
                User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage system access and roles.</p>
        </div>
        <Button onClick={() => { reset(); setIsAddOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} /> Add User
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Linked Profile</th>
                        <th className="p-4 font-semibold">Created</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {loading ? (
                        <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">No users found.</td></tr>
                    ) : (
                        filteredUsers.map(user => (
                            <tr key={user.UserId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">{user.Username}</td>
                                <td className="p-4">{getRoleBadge(user.Role)}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggleActive(user)}
                                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${user.IsActive
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'}`}
                                    >
                                        {user.IsActive ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                                        {user.IsActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="p-4 text-slate-500">
                                    {user.WorkerName ? `Worker: ${user.WorkerName}` : user.CustomerName ? `Customer: ${user.CustomerName}` : '-'}
                                </td>
                                <td className="p-4 text-slate-500 text-xs">
                                    {new Date(user.CreatedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEditClick(user)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDelete(user.UserId)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New User">
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
            <Input label="Username" {...register('Username')} error={errors.Username?.message} />
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Role</label>
                <select {...register('Role')} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <option value="Worker">Worker</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="Customer">Customer</option>
                </select>
            </div>
            <Input label="Password" type="password" {...register('Password')} error={errors.Password?.message} />
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit">Create User</Button>
            </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit ${selectedUser?.Username}`}>
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-sm text-slate-600 dark:text-slate-400">
                Editing Role and Password for <strong>{selectedUser?.Username}</strong>.
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Role</label>
                <select {...register('Role')} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <option value="Worker">Worker</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                    <option value="Customer">Customer</option>
                </select>
            </div>

            {/* Profile Linking */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-semibold mb-2 text-slate-900 dark:text-white">Link Profile</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Profile Type</label>
                        <select {...register('LinkType')} className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm">
                            <option value="None">None</option>
                            <option value="Worker">Worker</option>
                            <option value="Customer">Customer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Select Profile</label>
                        <select
                            {...register('LinkId')}
                            className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                            disabled={linkType === 'None'}
                        >
                            <option value="">-- Select --</option>
                            {linkType === 'Worker' && workers.map(w => (
                                <option key={w.WorkerId} value={w.WorkerId}>{w.WorkerName}</option>
                            ))}
                            {linkType === 'Customer' && customers.map(c => (
                                <option key={c.CustomerId} value={c.CustomerId}>{c.CustomerName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <Input label="New Password (Optional)" type="password" placeholder="Leave blank to keep current" {...register('Password')} />

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default UserManagement;
