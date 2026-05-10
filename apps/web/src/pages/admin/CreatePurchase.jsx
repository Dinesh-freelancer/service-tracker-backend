import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingCart, Save, Plus, Trash2, ArrowLeft, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const itemSchema = z.object({
  PartId: z.number().min(1, 'Part is required'),
  PartName: z.string().min(1, 'Part Name is required'),
  Qty: z.number().min(0.01, 'Quantity must be greater than 0'),
  UnitPrice: z.number().min(0, 'Unit Price must be 0 or greater')
});

const purchaseSchema = z.object({
  SupplierId: z.string().min(1, 'Supplier is required'),
  PurchaseDate: z.string().min(1, 'Purchase Date is required'),
  PaymentStatus: z.enum(['Pending', 'Paid', 'Partial']),
  Notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required')
});

const CreatePurchase = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Inventory logic
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryResults, setInventoryResults] = useState([]);
  const [searchingInventory, setSearchingInventory] = useState(false);
  const searchTimeoutRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      PurchaseDate: new Date().toISOString().split('T')[0],
      PaymentStatus: 'Pending',
      items: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");

  // Calculate Subtotal dynamically
  const subtotal = watchItems.reduce((acc, item) => acc + ((item.Qty || 0) * (item.UnitPrice || 0)), 0);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${apiUrl}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleInventorySearch = (query) => {
    setInventorySearch(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 2) {
      setInventoryResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingInventory(true);
      try {
        const res = await fetch(`${apiUrl}/inventory?search=${encodeURIComponent(query)}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInventoryResults(data.rows || data); // handle pagination wrapper
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingInventory(false);
      }
    }, 300);
  };

  const addItemToGrid = (part) => {
    // Check if part is already in grid
    const existingIndex = watchItems.findIndex(i => i.PartId === part.PartId);
    if (existingIndex >= 0) {
       // Increment qty
       const currentQty = getValues(`items.${existingIndex}.Qty`);
       setValue(`items.${existingIndex}.Qty`, currentQty + 1);
       toast.success(`Increased quantity for ${part.PartName}`);
    } else {
       // Add new row
       append({
         PartId: part.PartId,
         PartName: part.PartName,
         Qty: 1,
         UnitPrice: parseFloat(part.DefaultCostPrice) || 0
       });
       toast.success(`Added ${part.PartName}`);
    }

    // Clear search
    setInventorySearch('');
    setInventoryResults([]);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Structure payload for backend
      const payload = {
        purchase: {
          SupplierId: parseInt(data.SupplierId),
          PurchaseDate: data.PurchaseDate,
          PaymentStatus: data.PaymentStatus,
          Notes: data.Notes
        },
        items: data.items.map(item => ({
          PartId: item.PartId,
          Qty: item.Qty,
          UnitPrice: item.UnitPrice
        }))
      };

      const res = await fetch(`${apiUrl}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create purchase');
      }

      toast.success('Purchase recorded successfully');
      // Ideally redirect to purchases list. For now, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
        >
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="text-blue-600" />
                Record Purchase Order
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Add stock and record supplier invoices.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Section: Meta Data */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Purchase Details</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supplier *
                </label>
                {loadingSuppliers ? (
                     <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading...</div>
                ) : (
                    <select
                        {...register('SupplierId')}
                        className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg text-sm text-slate-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.SupplierId ? 'border-red-300 dark:border-red-500/50' : 'border-slate-200 dark:border-slate-700'}`}
                    >
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => (
                            <option key={s.SupplierId} value={s.SupplierId}>{s.SupplierName}</option>
                        ))}
                    </select>
                )}
                {errors.SupplierId && <p className="mt-1 text-xs text-red-500">{errors.SupplierId.message}</p>}
              </div>

              <Input
                 label="Purchase Date *"
                 type="date"
                 {...register('PurchaseDate')}
                 error={errors.PurchaseDate?.message}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status
                </label>
                <select
                    {...register('PaymentStatus')}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                </select>
              </div>

           </div>

           <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
              </label>
              <textarea
                  {...register('Notes')}
                  placeholder="Invoice #, Delivery terms, or other details..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
              />
           </div>
        </div>

        {/* Middle Section: Item Grid */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Items</h2>

            {/* Search Inventory Add Tool */}
            <div className="mb-6 relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search inventory to add items..."
                        value={inventorySearch}
                        onChange={(e) => handleInventorySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    {searchingInventory && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />}
                </div>

                {/* Search Results Dropdown */}
                {inventoryResults.length > 0 && inventorySearch.trim().length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {inventoryResults.map(part => (
                            <button
                                type="button"
                                key={part.PartId}
                                onClick={() => addItemToGrid(part)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 last:border-0"
                            >
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">{part.PartName}</div>
                                    <div className="text-xs text-slate-500">Current Stock: {part.QuantityInStock}</div>
                                </div>
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <Plus size={14} /> Add
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                            <th className="p-3 font-semibold rounded-tl-lg">Part Name</th>
                            <th className="p-3 font-semibold w-24">Qty</th>
                            <th className="p-3 font-semibold w-32">Unit Price (Cost)</th>
                            <th className="p-3 font-semibold w-32 text-right">Total</th>
                            <th className="p-3 font-semibold w-16 text-center rounded-tr-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {fields.length === 0 ? (
                             <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                    No items added yet. Search above to add parts.
                                </td>
                             </tr>
                        ) : (
                            fields.map((field, index) => (
                                <tr key={field.id} className="group">
                                    <td className="p-3">
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">{field.PartName}</div>
                                        <input type="hidden" {...register(`items.${index}.PartId`)} />
                                        <input type="hidden" {...register(`items.${index}.PartName`)} />
                                    </td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register(`items.${index}.Qty`, { valueAsNumber: true })}
                                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                        {errors.items?.[index]?.Qty && <span className="text-xs text-red-500">{errors.items[index].Qty.message}</span>}
                                    </td>
                                    <td className="p-3">
                                         <input
                                            type="number"
                                            step="0.01"
                                            {...register(`items.${index}.UnitPrice`, { valueAsNumber: true })}
                                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                        {errors.items?.[index]?.UnitPrice && <span className="text-xs text-red-500">{errors.items[index].UnitPrice.message}</span>}
                                    </td>
                                    <td className="p-3 text-right font-medium text-slate-900 dark:text-white text-sm">
                                        ₹{((watchItems[index]?.Qty || 0) * (watchItems[index]?.UnitPrice || 0)).toFixed(2)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {errors.items?.root && <p className="mt-2 text-sm text-red-500">{errors.items.root.message}</p>}
            </div>
        </div>

        {/* Bottom Section: Summary & Submit */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
               <div className="text-sm text-slate-500">Total Items: <span className="font-bold text-slate-900 dark:text-white">{fields.length}</span></div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="text-right flex-grow">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Purchase Total</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="flex items-center gap-2 py-3 px-6 h-auto"
                    disabled={isSubmitting || fields.length === 0}
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Record Purchase
                </Button>
            </div>
        </div>

      </form>
    </div>
  );
};

export default CreatePurchase;
