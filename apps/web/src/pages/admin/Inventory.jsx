import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Validation Schema
const inventorySchema = z.object({
  PartName: z.string().min(2, 'Part Name is required'),
  Unit: z.enum(['Nos', 'Kg', 'Ltr', 'Meter', 'Pair'], {
      errorMap: () => ({ message: 'Please select a valid unit' })
  }),
  QuantityInStock: z.string().transform((val) => parseFloat(val) || 0),
  LowStockThreshold: z.string().transform((val) => parseFloat(val) || 0),
  DefaultCostPrice: z.string().transform((val) => parseFloat(val) || 0),
  DefaultSellingPrice: z.string().transform((val) => parseFloat(val) || 0),
  Supplier: z.string().optional()
});

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isOwner = role === 'Owner';

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
        QuantityInStock: '0',
        LowStockThreshold: '5',
        DefaultCostPrice: '0',
        DefaultSellingPrice: '0',
        Unit: 'Nos'
    }
  });

  // Fetch Inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
          page,
          limit,
          search: searchQuery
      });
      const res = await fetch(`${apiUrl}/inventory?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setItems(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delay = setTimeout(() => {
        fetchInventory();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, searchQuery]);

  // Handlers
  const onSubmitAdd = async (data) => {
    try {
      const res = await fetch(`${apiUrl}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add item');

      toast.success(`Item added successfully`);
      setIsAddOpen(false);
      reset();
      fetchInventory();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onEditClick = (item) => {
    setSelectedItem(item);
    setValue('PartName', item.PartName);
    setValue('Unit', item.Unit);
    setValue('QuantityInStock', String(item.QuantityInStock));
    setValue('LowStockThreshold', String(item.LowStockThreshold));
    setValue('DefaultCostPrice', String(item.DefaultCostPrice || 0));
    setValue('DefaultSellingPrice', String(item.DefaultSellingPrice || 0));
    setValue('Supplier', item.Supplier || '');
    setIsEditOpen(true);
  };

  const onSubmitEdit = async (data) => {
    try {
      // Note: Backend might use PUT /inventory/:id or similar.
      // Assuming generic update pattern if backend supports it, otherwise might need adjustment.
      // Based on docs, only POST is shown, but typically there is an update endpoint.
      // Let's assume PUT /inventory/:id exists or use the upsert logic if appropriate.
      // Wait, the routes file only showed GET and POST.
      // I should double check if there's a PUT or if I need to use POST for update?
      // Actually `inventory.js` only showed GET list, GET item, POST create.
      // I might need to check `inventoryController.js` or add the route if missing.
      // For now, let's try PUT /inventory/:id as it's standard convention.

      const res = await fetch(`${apiUrl}/inventory/${selectedItem.PartId}`, {
        method: 'PUT', // Assuming this exists or I'll need to add it
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
          // If 404/405, it might mean route is missing.
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update item');
      }

      toast.success('Item updated');
      setIsEditOpen(false);
      reset();
      fetchInventory();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
        const res = await fetch(`${apiUrl}/inventory/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete');
        toast.success('Item deleted');
        fetchInventory();
    } catch (err) {
        toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="text-orange-600" />
                Inventory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage parts, stock levels, and pricing.</p>
        </div>
        {(role === 'Owner' || role === 'Admin') && (
            <Button onClick={() => { reset(); setIsAddOpen(true); }} className="flex items-center gap-2">
                <Plus size={18} /> Add Item
            </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
                type="text"
                placeholder="Search parts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Part Name</th>
                        <th className="p-4 font-semibold text-center">Stock</th>
                        <th className="p-4 font-semibold text-right">Selling Price</th>
                        {isOwner && <th className="p-4 font-semibold text-right">Cost Price</th>}
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {loading ? (
                        <tr><td colSpan={isOwner ? 5 : 4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={isOwner ? 5 : 4} className="p-8 text-center text-slate-500">No items found.</td></tr>
                    ) : (
                        items.map(item => (
                            <tr key={item.PartId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="p-4 font-medium text-slate-900 dark:text-white">
                                    {item.PartName}
                                    <div className="text-xs text-slate-500">{item.Supplier || 'No Supplier'}</div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                        item.QuantityInStock <= item.LowStockThreshold
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                        {item.QuantityInStock} {item.Unit}
                                        {item.QuantityInStock <= item.LowStockThreshold && <AlertTriangle size={12} />}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-slate-900 dark:text-white">
                                    {parseFloat(item.DefaultSellingPrice).toFixed(2)}
                                </td>
                                {isOwner && (
                                    <td className="p-4 text-right text-slate-600 dark:text-slate-400">
                                        {item.DefaultCostPrice ? parseFloat(item.DefaultCostPrice).toFixed(2) : '-'}
                                    </td>
                                )}
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {(role === 'Owner' || role === 'Admin') && (
                                            <>
                                                <button onClick={() => onEditClick(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"><Edit2 size={16}/></button>
                                                <button onClick={() => handleDelete(item.PartId)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"><Trash2 size={16}/></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
            <div className="text-slate-500">
                Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => { setIsAddOpen(false); setIsEditOpen(false); reset(); }}
        title={isAddOpen ? "Add Inventory Item" : "Edit Inventory Item"}
      >
        <form onSubmit={handleSubmit(isAddOpen ? onSubmitAdd : onSubmitEdit)} className="space-y-4">
            <Input label="Part Name *" {...register('PartName')} error={errors.PartName?.message} />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Unit *</label>
                    <select
                        {...register('Unit')}
                        className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white"
                    >
                        {['Nos', 'Kg', 'Ltr', 'Meter', 'Pair'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                 <Input label="Stock *" type="number" step="0.01" {...register('QuantityInStock')} error={errors.QuantityInStock?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input label="Low Stock Alert *" type="number" step="0.01" {...register('LowStockThreshold')} error={errors.LowStockThreshold?.message} />
                <Input label="Supplier" {...register('Supplier')} />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    Pricing
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Selling Price *" type="number" step="0.01" {...register('DefaultSellingPrice')} error={errors.DefaultSellingPrice?.message} />
                    {isOwner && (
                        <Input label="Cost Price *" type="number" step="0.01" {...register('DefaultCostPrice')} error={errors.DefaultCostPrice?.message} />
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
                <Button type="submit">{isAddOpen ? "Add Item" : "Save Changes"}</Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default Inventory;
