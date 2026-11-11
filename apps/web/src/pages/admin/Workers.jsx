import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  Briefcase,
  Wallet,
  Filter,
  IndianRupee,
  Clock,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Helper to get current local datetime string for <input type="datetime-local" />
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
};

// Helper to convert DB datetime into <input type="datetime-local" /> value
const toDateTimeLocalValue = (val) => {
  if (!val) return getCurrentDateTimeLocal();
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(val) && !val.endsWith('Z')) {
    return val.replace(' ', 'T').slice(0, 16);
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return getCurrentDateTimeLocal();
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
};

// Format datetime for display
const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(typeof val === 'string' && !val.includes('T') ? val.replace(' ', 'T') : val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validation Schemas
const workerSchema = z.object({
  WorkerName: z.string().min(2, 'Name is required'),
  MobileNumber: z.string().min(10, 'Valid phone required'),
  Skills: z.string().optional(),
  Address: z.string().optional(),
  DateOfJoining: z.string().optional(),
  CreateLogin: z.boolean().optional(),
  Username: z.string().optional(),
  Password: z.string().optional()
}).refine((data) => {
  if (data.CreateLogin) {
    return data.Username && data.Username.length >= 3 && data.Password && data.Password.length >= 6;
  }
  return true;
}, {
  message: 'Username (min 3) and Password (min 6) are required when creating login',
  path: ['Username']
});

const PAYMENT_TYPES = ['Salary', 'Advance', 'Overtime'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

const Workers = () => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'salary-payments'

  // Workers state
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Worker Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Salary Payments state
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [filterWorkerId, setFilterWorkerId] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    workerId: '',
    amount: '',
    paymentType: 'Salary',
    paymentMode: 'Cash',
    createdtime: getCurrentDateTimeLocal(),
    notes: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || '';
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

  // Fetch Salary Payments
  const fetchSalaryPayments = async (workerIdFilter = filterWorkerId) => {
    setPaymentsLoading(true);
    try {
      const query = workerIdFilter ? `?workerId=${encodeURIComponent(workerIdFilter)}` : '';
      const res = await fetch(`${apiUrl}/salary-payments${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load salary payments');
      const data = await res.json();
      setSalaryPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (activeTab === 'salary-payments') {
      fetchSalaryPayments(filterWorkerId);
    }
  }, [activeTab, filterWorkerId]);

  // Filter Workers
  const filteredWorkers = workers.filter(w =>
    w.WorkerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.Phone && w.Phone.includes(searchQuery)) ||
    (w.MobileNumber && w.MobileNumber.includes(searchQuery)) ||
    (w.Skills && w.Skills.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Payment Summary Statistics
  const paymentSummary = useMemo(() => {
    return salaryPayments.reduce(
      (acc, p) => {
        const amt = Number(p.amount) || 0;
        acc.total += amt;
        if (p.paymentType === 'Salary') acc.salary += amt;
        else if (p.paymentType === 'Advance') acc.advance += amt;
        else if (p.paymentType === 'Overtime') acc.overtime += amt;
        return acc;
      },
      { total: 0, salary: 0, advance: 0, overtime: 0 }
    );
  }, [salaryPayments]);

  // Worker Handlers
  const onSubmitAdd = async (data) => {
    try {
      const payload = {
        WorkerName: data.WorkerName,
        MobileNumber: data.MobileNumber,
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
    setValue('MobileNumber', worker.MobileNumber || worker.Phone);
    setValue('Skills', worker.Skills);
    setValue('Address', worker.Address);
    setValue('DateOfJoining', worker.DateOfJoining ? worker.DateOfJoining.split('T')[0] : '');
    setValue('CreateLogin', false);
    setIsEditOpen(true);
  };

  const onSubmitEdit = async (data) => {
    try {
      const payload = {
        WorkerName: data.WorkerName,
        MobileNumber: data.MobileNumber,
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

  // Salary Payment Handlers
  const openCreatePaymentModal = () => {
    setEditingPayment(null);
    setPaymentForm({
      workerId: filterWorkerId || (workers[0]?.WorkerId ? String(workers[0].WorkerId) : ''),
      amount: '',
      paymentType: 'Salary',
      paymentMode: 'Cash',
      createdtime: getCurrentDateTimeLocal(),
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const openEditPaymentModal = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      workerId: String(payment.workerId),
      amount: String(payment.amount),
      paymentType: payment.paymentType || 'Salary',
      paymentMode: payment.paymentMode || 'Cash',
      createdtime: toDateTimeLocalValue(payment.createdtime),
      notes: payment.notes || ''
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.workerId) {
      toast.error('Please select a worker');
      return;
    }
    const parsedAmount = Number(paymentForm.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    setIsSavingPayment(true);
    try {
      const isEditing = Boolean(editingPayment);
      const url = isEditing
        ? `${apiUrl}/salary-payments/${editingPayment.id}`
        : `${apiUrl}/salary-payments`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          workerId: Number(paymentForm.workerId),
          amount: parsedAmount,
          paymentType: paymentForm.paymentType,
          paymentMode: paymentForm.paymentMode,
          createdtime: paymentForm.createdtime,
          notes: paymentForm.notes
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save salary payment');

      toast.success(isEditing ? 'Salary payment updated' : 'Salary payment recorded');
      setIsPaymentModalOpen(false);
      fetchSalaryPayments(filterWorkerId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDeletePayment = async (payment) => {
    if (!window.confirm(`Delete salary payment of ₹${Number(payment.amount).toLocaleString('en-IN')} for ${payment.WorkerName || 'worker'}?`)) {
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/salary-payments/${payment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete salary payment');
      toast.success('Salary payment deleted');
      fetchSalaryPayments(filterWorkerId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getPaymentTypeBadge = (type) => {
    switch (type) {
      case 'Advance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Overtime':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Salary':
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {activeTab === 'directory' ? (
              <>
                <Briefcase className="text-blue-600" />
                Staff Directory
              </>
            ) : (
              <>
                <Wallet className="text-emerald-600" />
                Worker Salary Payments
              </>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {activeTab === 'directory'
              ? 'Manage technicians and staff.'
              : 'Track and record salary, advance, and overtime payments to workers.'}
          </p>
        </div>

        {activeTab === 'directory' ? (
          <Button onClick={() => { reset(); setIsAddOpen(true); }} className="w-auto flex items-center gap-2">
            <Plus size={18} /> Add Worker
          </Button>
        ) : (
          <Button onClick={openCreatePaymentModal} className="w-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700">
            <Plus size={18} /> Create Payment
          </Button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'directory'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users size={16} />
          Staff Directory
        </button>
        <button
          onClick={() => setActiveTab('salary-payments')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'salary-payments'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Wallet size={16} />
          Salary Payments
        </button>
      </div>

      {/* TAB 1: Staff Directory */}
      {activeTab === 'directory' && (
        <>
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

          {/* Workers Table */}
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
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              worker.TodayAttendance === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {worker.TodayAttendance}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setFilterWorkerId(String(worker.WorkerId));
                                setActiveTab('salary-payments');
                              }}
                              title="View Salary Payments"
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded text-emerald-600"
                            >
                              <Wallet size={16} />
                            </button>
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
        </>
      )}

      {/* TAB 2: Salary Payments */}
      {activeTab === 'salary-payments' && (
        <div className="space-y-6">
          {/* Filter Bar & Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Worker Filter Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Filter size={13} /> Filter by Worker
              </label>
              <select
                value={filterWorkerId}
                onChange={(e) => setFilterWorkerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Workers</option>
                {workers.map(w => (
                  <option key={w.WorkerId} value={w.WorkerId}>
                    {w.WorkerName} {!w.IsActive ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Paid Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <IndianRupee size={22} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Paid (Filtered)</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  ₹{paymentSummary.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400">{salaryPayments.length} payment(s)</div>
              </div>
            </div>

            {/* Salary Total Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <CreditCard size={22} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Regular Salary</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  ₹{paymentSummary.salary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Advance & Overtime Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Clock size={22} />
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">Advance:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{paymentSummary.advance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">Overtime:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{paymentSummary.overtime.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Payments Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Date & Time</th>
                    <th className="p-4 font-semibold">Worker</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Mode</th>
                    <th className="p-4 font-semibold text-right">Amount (₹)</th>
                    <th className="p-4 font-semibold">Notes</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center">
                        <Loader2 className="animate-spin mx-auto text-slate-400" />
                      </td>
                    </tr>
                  ) : salaryPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        No salary payments found.
                      </td>
                    </tr>
                  ) : (
                    salaryPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono text-xs">
                          {formatDateTime(payment.createdtime)}
                        </td>
                        <td className="p-4 font-medium text-slate-900 dark:text-white">
                          {payment.WorkerName || `Worker #${payment.workerId}`}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentTypeBadge(payment.paymentType)}`}>
                            {payment.paymentType || 'Salary'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {payment.paymentMode || 'Cash'}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          ₹{Number(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={payment.notes || ''}>
                          {payment.notes || '-'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditPaymentModal(payment)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"
                              title="Edit payment"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"
                              title="Delete payment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
          <Input label="Full Name *" {...register('WorkerName')} error={errors.WorkerName?.message} />
          <Input label="Phone Number *" {...register('MobileNumber')} error={errors.MobileNumber?.message} />
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
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Worker</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Staff Member">
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          <Input label="Full Name *" {...register('WorkerName')} error={errors.WorkerName?.message} />
          <Input label="Phone Number *" {...register('MobileNumber')} error={errors.MobileNumber?.message} />
          <Input label="Skills" {...register('Skills')} />
          <Input label="Address" {...register('Address')} />
          <Input label="Date of Joining" type="date" {...register('DateOfJoining')} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Create / Edit Salary Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={editingPayment ? 'Edit Salary Payment' : 'Record Salary Payment'}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Worker *
            </label>
            <select
              required
              value={paymentForm.workerId}
              onChange={(e) => setPaymentForm({ ...paymentForm, workerId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a worker</option>
              {workers.map(w => (
                <option key={w.WorkerId} value={w.WorkerId}>
                  {w.WorkerName} {!w.IsActive ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Type *
              </label>
              <select
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentForm.paymentMode}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAYMENT_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Payment Date & Time"
            type="datetime-local"
            value={paymentForm.createdtime}
            onChange={(e) => setPaymentForm({ ...paymentForm, createdtime: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Optional payment notes..."
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSavingPayment}>
              {editingPayment ? 'Save Changes' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Workers;
