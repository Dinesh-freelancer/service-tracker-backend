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
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Validation Schemas
const workerSchema = z.object({
  WorkerName: z.string().min(2, 'Name is required'),
  Phone: z.string().min(10, 'Valid phone required'),
  Skills: z.string().optional(),
  Address: z.string().optional(),
  DateOfJoining: z.string().optional(),
  // User Fields (Optional)
  CreateLogin: z.boolean().optional(),
  Username: z.string().optional(),
  Password: z.string().optional()
}).refine((data) => {
    if (data.CreateLogin) {
        return data.Username && data.Username.length >= 3 && data.Password && data.Password.length >= 6;
    }
    return true;
}, {
    message: "Username (min 3) and Password (min 6) are required when creating login",
    path: ["Username"] // Highlight username field
});

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(workerSchema),
    defaultValues: { CreateLogin: false }
  });

  const createLogin = watch('CreateLogin');

  // Fetch Workers
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load workers');
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Filter Workers
  const filteredWorkers = workers.filter(w =>
    w.WorkerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.Phone && w.Phone.includes(searchQuery)) ||
    (w.Skills && w.Skills.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers
  const onSubmitAdd = async (data) => {
    try {
      // Clean payload
      const payload = {
          WorkerName: data.WorkerName,
          Phone: data.Phone,
          Skills: data.Skills,
          Address: data.Address,
          DateOfJoining: data.DateOfJoining
      };
      if (data.CreateLogin) {
          payload.Username = data.Username;
          payload.Password = data.Password;
      }

      const res = await fetch(`${apiUrl}/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create worker');

      toast.success(`Worker ${data.WorkerName} added`);
      setIsAddOpen(false);
      reset();
      fetchWorkers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onEditClick = (worker) => {
    setSelectedWorker(worker);
    setValue('WorkerName', worker.WorkerName);
    setValue('Phone', worker.Phone || worker.MobileNumber);
    setValue('Skills', worker.Skills);
    setValue('Address', worker.Address);
    setValue('DateOfJoining', worker.DateOfJoining ? worker.DateOfJoining.split('T')[0] : '');
    setValue('CreateLogin', false); // Can't create login in edit mode currently (do it in Users page)
    setIsEditOpen(true);
  };

  const onSubmitEdit = async (data) => {
    try {
      const payload = {
          WorkerName: data.WorkerName,
          Phone: data.Phone,
          Skills: data.Skills,
          Address: data.Address,
          DateOfJoining: data.DateOfJoining
      };

      const res = await fetch(`${apiUrl}/workers/${selectedWorker.WorkerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update worker');

      toast.success('Worker updated');
      setIsEditOpen(false);
      reset();
      fetchWorkers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will deactivate the worker.')) return;
    try {
        const res = await fetch(`${apiUrl}/workers/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete');
        toast.success('Worker deactivated');
        fetchWorkers();
    } catch (err) {
        toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="text-blue-600" />
                Staff Directory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage technicians and staff.</p>
        </div>
        <Button onClick={() => { reset(); setIsAddOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} /> Add Worker
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
                type="text"
                placeholder="Search staff..."
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
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Contact</th>
                        <th className="p-4 font-semibold">Skills</th>
                        <th className="p-4 font-semibold">System Access</th>
                        <th className="p-4 font-semibold">Attendance (Today)</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {loading ? (
                        <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                    ) : filteredWorkers.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">No workers found.</td></tr>
                    ) : (
                        filteredWorkers.map(worker => (
                            <tr key={worker.WorkerId} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!worker.IsActive ? 'opacity-50' : ''}`}>
                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                    {worker.WorkerName}
                                    {!worker.IsActive && <span className="ml-2 text-xs text-red-500">(Inactive)</span>}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                    {worker.Phone || worker.MobileNumber}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                    {worker.Skills || '-'}
                                </td>
                                <td className="p-4">
                                    {worker.LinkedUser ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            <CheckCircle2 size={12} /> {worker.LinkedUser}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No Login</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {worker.TodayAttendance ? (
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full
                                            ${worker.TodayAttendance === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {worker.TodayAttendance}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onEditClick(worker)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"><Edit2 size={16}/></button>
                                        {worker.IsActive !== 0 && (
                                            <button onClick={() => handleDelete(worker.WorkerId)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add Worker Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
            <Input label="Full Name *" {...register('WorkerName')} error={errors.WorkerName?.message} />
            <Input label="Phone Number *" {...register('Phone')} error={errors.Phone?.message} />
            <Input label="Skills (e.g. Winding, Fitting)" {...register('Skills')} />
            <Input label="Address" {...register('Address')} />
            <Input label="Date of Joining" type="date" {...register('DateOfJoining')} />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input type="checkbox" {...register('CreateLogin')} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Create System Login</span>
                </label>

                {createLogin && (
                    <div className="space-y-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2">
                        <Input label="Username *" {...register('Username')} error={errors.Username?.message} />
                        <Input label="Password *" type="password" {...register('Password')} error={errors.Password?.message} />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit">Create Worker</Button>
            </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Staff Member">
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
            <Input label="Full Name *" {...register('WorkerName')} error={errors.WorkerName?.message} />
            <Input label="Phone Number *" {...register('Phone')} error={errors.Phone?.message} />
            <Input label="Skills" {...register('Skills')} />
            <Input label="Address" {...register('Address')} />
            <Input label="Date of Joining" type="date" {...register('DateOfJoining')} />

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default Workers;
