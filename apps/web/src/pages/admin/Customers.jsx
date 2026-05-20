import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, Search, Loader2, Mail, Phone, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Validation Schema
const customerSchema = z.object({
  CustomerType: z.enum(['Individual', 'OrganizationMember']).default('Individual'),
  CustomerName: z.string().min(2, 'Name is required'),
  PrimaryContact: z.string().min(10, 'Valid contact number required'),
  Email: z.string().email('Invalid email address').or(z.literal('')),
  Address: z.string().optional(),
  City: z.string().optional(),
  State: z.string().optional(),
  Pincode: z.string().optional(),
  Notes: z.string().optional(),
});

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      CustomerType: 'Individual',
      Email: '',
      Notes: ''
    }
  });

  const customerType = watch('CustomerType');

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchCustomers();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, searchQuery]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();

      // Handle pagination wrapper
      setCustomers(data.data || data.rows || data);
      if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAdd = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add customer');

      toast.success('Customer added successfully');
      setIsAddOpen(false);
      reset();
      fetchCustomers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-blue-600" />
                Customers
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage customer profiles and contact details.</p>
        </div>
        <Button onClick={() => { reset(); setIsAddOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} /> Add Customer
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Customer ID</th>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Contact Details</th>
                        <th className="p-4 font-semibold">Location</th>
                        <th className="p-4 font-semibold">Joined</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td>
                        </tr>
                    ) : customers.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-500">No customers found.</td>
                        </tr>
                    ) : (
                        customers.map((c) => (
                            <tr key={c.CustomerId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="p-4 font-medium text-slate-500">CUST-{c.CustomerId.toString().padStart(4, '0')}</td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {c.CustomerName}
                                        {c.CustomerType === 'OrganizationMember' && (
                                            <span className="p-1 bg-purple-100 text-purple-700 rounded" title="Organization">
                                                <Building2 size={12} />
                                            </span>
                                        )}
                                    </div>
                                    {c.OrganizationName && (
                                        <div className="text-xs text-slate-500 mt-1">{c.OrganizationName}</div>
                                    )}
                                </td>
                                <td className="p-4 space-y-1">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Phone size={14} className="text-slate-400"/> {c.PrimaryContact || 'N/A'}
                                    </div>
                                    {c.Email && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail size={14} className="text-slate-400"/> {c.Email}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0"/>
                                        <span>
                                            {c.City ? `${c.City}${c.State ? `, ${c.State}` : ''}` : (c.Address || 'N/A')}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500 text-xs">
                                    {new Date(c.CreatedAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-500">
                Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); reset(); }}
        title="Add New Customer"
      >
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">

            <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="radio" value="Individual" {...register('CustomerType')} className="text-blue-600" />
                    Individual
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="radio" value="OrganizationMember" {...register('CustomerType')} className="text-blue-600" />
                    Organization
                </label>
            </div>

            <Input label="Full Name *" {...register('CustomerName')} error={errors.CustomerName?.message} />

            <div className="grid grid-cols-2 gap-4">
                <Input label="Primary Phone *" {...register('PrimaryContact')} error={errors.PrimaryContact?.message} />
                <Input label="Email Address" type="email" {...register('Email')} error={errors.Email?.message} />
            </div>

            <Input label="Street Address" {...register('Address')} />

            <div className="grid grid-cols-3 gap-4">
                <Input label="City" {...register('City')} />
                <Input label="State" {...register('State')} />
                <Input label="Pincode" {...register('Pincode')} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                <textarea
                    {...register('Notes')}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[80px]"
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Create Profile
                </Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default Customers;
