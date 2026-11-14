import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShoppingCart,
  Tag,
  MapPin,
  X,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const inventorySchema = z.object({
  PartName: z.string().min(2, 'Part Name is required'),
  Make: z.string().optional(),
  Size: z.string().optional(),
  Unit: z.enum(['Nos', 'Kg', 'Ltr', 'Meter', 'Pair'], {
    errorMap: () => ({ message: 'Please select a valid unit' })
  }),
  QuantityInStock: z.string().transform((val) => parseFloat(val) || 0),
  LowStockThreshold: z.string().transform((val) => parseFloat(val) || 0),
  DefaultCostPrice: z.string().transform((val) => parseFloat(val) || 0),
  DefaultSellingPrice: z.string().transform((val) => parseFloat(val) || 0),
  Supplier: z.string().optional()
});

const LOCATION_TYPES = ['Warehouse', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Bin'];
const PACK_TYPES = ['Loose', 'Packet', 'Box', 'Carton', 'Roll', 'Set'];

const Inventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Tag Filter Autocomplete
  const [tagFilterInput, setTagFilterInput] = useState('');
  const [tagFilterSuggestions, setTagFilterSuggestions] = useState([]);
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const tagFilterTimeoutRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Add/Edit Item Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Item Modal Tags
  const [itemTags, setItemTags] = useState([]);
  const [itemTagInput, setItemTagInput] = useState('');
  const [itemTagSuggestions, setItemTagSuggestions] = useState([]);
  const itemTagTimeoutRef = useRef(null);

  // Item Modal Attributes (key/value rows)
  const [itemAttrs, setItemAttrs] = useState([]);
  const [attrKeySuggestions, setAttrKeySuggestions] = useState([]);

  // Stock Locations Modal (per part)
  const [stockModalItem, setStockModalItem] = useState(null);
  const [partStockRows, setPartStockRows] = useState([]);
  const [loadingPartStock, setLoadingPartStock] = useState(false);
  const [stockForm, setStockForm] = useState({
    LocationId: '',
    PackType: 'Loose',
    UnitsPerPack: '1',
    QuantityDelta: '0'
  });

  // Locations Manager Modal
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({
    Name: '',
    LocationType: 'Bin',
    ParentLocationId: '0'
  });

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isOwner = role === 'Owner';
  const canEdit = role === 'Owner' || role === 'Admin';

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      Make: '',
      Size: '',
      QuantityInStock: '0',
      LowStockThreshold: '5',
      DefaultCostPrice: '0',
      DefaultSellingPrice: '0',
      Unit: 'Nos'
    }
  });

  // Fetch Locations
  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const res = await fetch(`${apiUrl}/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load locations');
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/inventory/attribute-keys`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setAttrKeySuggestions(await res.json());
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const attrsToPayload = () => {
    const obj = {};
    itemAttrs.forEach(({ key, value }) => {
      if (key.trim() && String(value).trim()) obj[key.trim()] = String(value).trim();
    });
    return obj;
  };

  const errMsg = (result, fallback) =>
    (typeof result?.error === 'string' ? result.error : result?.error?.message) || result?.message || fallback;

  // Fetch Inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit,
        search: searchQuery
      });
      if (selectedFilterTags.length > 0) {
        query.set('tagIds', selectedFilterTags.map(t => t.TagId).join(','));
      }
      const res = await fetch(`${apiUrl}/inventory?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load inventory');
      const data = await res.json();
      setItems(data.data || []);
      setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchInventory();
    }, 400);
    return () => clearTimeout(delay);
  }, [page, searchQuery, selectedFilterTags]);

  // Tag Autocomplete for Search Filter
  const handleTagFilterInput = (val) => {
    setTagFilterInput(val);
    if (tagFilterTimeoutRef.current) clearTimeout(tagFilterTimeoutRef.current);
    if (!val.trim()) {
      setTagFilterSuggestions([]);
      return;
    }
    tagFilterTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/inventory/tags?q=${encodeURIComponent(val.trim())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const selectedIds = new Set(selectedFilterTags.map(t => t.TagId));
          setTagFilterSuggestions((data || []).filter(t => !selectedIds.has(t.TagId)));
        }
      } catch (err) {
        console.error(err);
      }
    }, 250);
  };

  const addFilterTag = (tag) => {
    setSelectedFilterTags(prev => [...prev, tag]);
    setTagFilterInput('');
    setTagFilterSuggestions([]);
    setPage(1);
  };

  const removeFilterTag = (tagId) => {
    setSelectedFilterTags(prev => prev.filter(t => t.TagId !== tagId));
    setPage(1);
  };

  // Tag Autocomplete inside Add/Edit Modal
  const handleItemTagInput = (val) => {
    setItemTagInput(val);
    if (itemTagTimeoutRef.current) clearTimeout(itemTagTimeoutRef.current);
    if (!val.trim()) {
      setItemTagSuggestions([]);
      return;
    }
    itemTagTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiUrl}/inventory/tags?q=${encodeURIComponent(val.trim())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const existing = new Set(itemTags.map(t => t.toLowerCase()));
          setItemTagSuggestions((data || []).filter(t => !existing.has(t.TagName.toLowerCase())));
        }
      } catch (err) {
        console.error(err);
      }
    }, 250);
  };

  const addItemTag = (tagName) => {
    const clean = String(tagName || '').trim();
    if (!clean) return;
    if (!itemTags.some(t => t.toLowerCase() === clean.toLowerCase())) {
      setItemTags(prev => [...prev, clean]);
    }
    setItemTagInput('');
    setItemTagSuggestions([]);
  };

  const removeItemTag = (tagName) => {
    setItemTags(prev => prev.filter(t => t !== tagName));
  };

  // Add / Edit Item Handlers
  const openAddModal = () => {
    reset({
      PartName: '',
      Make: '',
      Size: '',
      QuantityInStock: '0',
      LowStockThreshold: '5',
      DefaultCostPrice: '0',
      DefaultSellingPrice: '0',
      Unit: 'Nos',
      Supplier: ''
    });
    setItemTags([]);
    setItemAttrs([]);
    setItemTagInput('');
    setItemTagSuggestions([]);
    setIsAddOpen(true);
  };

  const onSubmitAdd = async (data) => {
    try {
      const payload = { ...data, Tags: itemTags, Attributes: attrsToPayload() };
      const res = await fetch(`${apiUrl}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(errMsg(result, 'Failed to add item'));

      toast.success('Item added successfully');
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
    setValue('Make', item.Make || '');
    setValue('Size', item.Size || '');
    setValue('Unit', item.Unit);
    setValue('QuantityInStock', String(item.QuantityInStock));
    setValue('LowStockThreshold', String(item.LowStockThreshold));
    setValue('DefaultCostPrice', String(item.DefaultCostPrice || 0));
    setValue('DefaultSellingPrice', String(item.DefaultSellingPrice || 0));
    setValue('Supplier', item.Supplier || '');
    setItemTags((item.Tags || []).map(t => t.TagName || t));
    setItemAttrs(Object.entries(item.Attributes || {}).map(([key, value]) => ({ key, value: String(value) })));
    setItemTagInput('');
    setItemTagSuggestions([]);
    setIsEditOpen(true);
  };

  const onSubmitEdit = async (data) => {
    try {
      const payload = { ...data, Tags: itemTags, Attributes: attrsToPayload() };
      const res = await fetch(`${apiUrl}/inventory/${selectedItem.PartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errMsg(errData, 'Failed to update item'));
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

  // Per-Part Stock Locations Modal
  const openStockModal = async (item) => {
    setStockModalItem(item);
    setStockForm({
      LocationId: locations[0]?.LocationId ? String(locations[0].LocationId) : '',
      PackType: 'Loose',
      UnitsPerPack: '1',
      QuantityDelta: '0'
    });
    setLoadingPartStock(true);
    try {
      const res = await fetch(`${apiUrl}/inventory/${item.PartId}/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load stock locations');
      const data = await res.json();
      setPartStockRows(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPartStock(false);
    }
  };

  const handleUpsertStock = async (e) => {
    e.preventDefault();
    if (!stockForm.LocationId) {
      toast.error('Please select a location');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/inventory/${stockModalItem.PartId}/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          LocationId: parseInt(stockForm.LocationId, 10),
          PackType: stockForm.PackType,
          UnitsPerPack: parseFloat(stockForm.UnitsPerPack) || 1,
          QuantityDelta: parseFloat(stockForm.QuantityDelta) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stock');
      setPartStockRows(Array.isArray(data) ? data : []);
      setStockForm(prev => ({ ...prev, QuantityDelta: '0' }));
      toast.success('Stock location updated');
      fetchInventory();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Locations Manager Handlers
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locationForm.Name.trim()) {
      toast.error('Location name is required');
      return;
    }
    try {
      const url = editingLocation
        ? `${apiUrl}/locations/${editingLocation.LocationId}`
        : `${apiUrl}/locations`;
      const method = editingLocation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          Name: locationForm.Name.trim(),
          LocationType: locationForm.LocationType,
          ParentLocationId: parseInt(locationForm.ParentLocationId, 10) || 0
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save location');

      toast.success(editingLocation ? 'Location updated' : 'Location created');
      setEditingLocation(null);
      setLocationForm({ Name: '', LocationType: 'Bin', ParentLocationId: '0' });
      fetchLocations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      const res = await fetch(`${apiUrl}/locations/${locationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete location');
      }
      toast.success('Location deleted');
      fetchLocations();
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
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage parts, make/size variants, shared tags, pack locations, and pricing.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLocationsOpen(true)}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
            >
              <MapPin size={18} /> Locations
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/purchases/create')}
              className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
            >
              <ShoppingCart size={18} /> Record Purchase
            </Button>
            <Button onClick={openAddModal} className="flex items-center gap-2">
              <Plus size={18} /> Add Item
            </Button>
          </div>
        )}
      </div>

      {/* Search & Tag Autocomplete Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by part name, make, size, or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>

          <div className="relative w-full md:w-80">
            <Tag size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tags (autocomplete)..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={tagFilterInput}
              onChange={(e) => handleTagFilterInput(e.target.value)}
            />
            {tagFilterSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {tagFilterSuggestions.map(tag => (
                  <button
                    key={tag.TagId}
                    type="button"
                    onClick={() => addFilterTag(tag)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                  >
                    <Tag size={14} className="text-blue-500" />
                    {tag.TagName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedFilterTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Filtered by tags:</span>
            {selectedFilterTags.map(tag => (
              <span
                key={tag.TagId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              >
                {tag.TagName}
                <button type="button" onClick={() => removeFilterTag(tag.TagId)} className="hover:text-blue-900">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Part / Make / Size</th>
                <th className="p-4 font-semibold">Tags</th>
                <th className="p-4 font-semibold">Locations & Packs</th>
                <th className="p-4 font-semibold text-center">Total Stock</th>
                <th className="p-4 font-semibold text-right">Selling Price</th>
                {isOwner && <th className="p-4 font-semibold text-right">Cost Price</th>}
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {loading ? (
                <tr><td colSpan={isOwner ? 7 : 6} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={isOwner ? 7 : 6} className="p-8 text-center text-slate-500">No items found.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.PartId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div>{item.PartName}</div>
                      {(item.Make || item.Size) && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {[item.Make && `Make: ${item.Make}`, item.Size && `Size: ${item.Size}`].filter(Boolean).join(' • ')}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.Supplier || 'No Supplier'}
                        {item.LastUpdated && ` • Updated ${new Date(item.LastUpdated).toLocaleDateString()}`}
                      </div>
                      {Object.keys(item.Attributes || {}).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.Attributes).map(([k, v]) => (
                            <span key={k} className="px-1.5 py-0.5 rounded text-[11px] font-normal bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(item.Tags || []).length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          item.Tags.map(t => (
                            <span
                              key={t.TagId || t.TagName}
                              className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {t.TagName || t}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {(item.StockLocations || []).length === 0 ? (
                        <span className="text-xs text-slate-400">No locations</span>
                      ) : (
                        <div className="space-y-1">
                          {item.StockLocations.slice(0, 3).map(loc => (
                            <div key={loc.StockId} className="text-xs text-slate-600 dark:text-slate-300">
                              <span className="font-medium">{loc.FullPath || loc.LocationName}</span>
                              <span className="text-slate-400"> ({loc.PackType}: {loc.Quantity} {item.Unit})</span>
                            </div>
                          ))}
                          {item.StockLocations.length > 3 && (
                            <div className="text-xs text-blue-600">+{item.StockLocations.length - 3} more</div>
                          )}
                        </div>
                      )}
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
                      {parseFloat(item.DefaultSellingPrice || 0).toFixed(2)}
                    </td>

                    {isOwner && (
                      <td className="p-4 text-right text-slate-600 dark:text-slate-400">
                        {item.DefaultCostPrice ? parseFloat(item.DefaultCostPrice).toFixed(2) : '-'}
                      </td>
                    )}

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => openStockModal(item)}
                              title="Manage Stock Locations & Packs"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-emerald-600"
                            >
                              <Layers size={16} />
                            </button>
                            <button
                              onClick={() => onEditClick(item)}
                              title="Edit Item"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.PartId)}
                              title="Delete Item"
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
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
          <div className="text-slate-500">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => { setIsAddOpen(false); setIsEditOpen(false); reset(); }}
        title={isAddOpen ? 'Add Inventory Item' : 'Edit Inventory Item'}
      >
        <form onSubmit={handleSubmit(isAddOpen ? onSubmitAdd : onSubmitEdit)} className="space-y-4">
          <Input label="Part Name *" {...register('PartName')} error={errors.PartName?.message} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Make" placeholder="e.g. SKF, Bosch" {...register('Make')} />
            <Input label="Size" placeholder="e.g. 6204, M6, 50mfd" {...register('Size')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Unit *</label>
              <select
                {...register('Unit')}
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
              >
                {['Nos', 'Kg', 'Ltr', 'Meter', 'Pair'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <Input label="Total Stock *" type="number" step="0.01" {...register('QuantityInStock')} error={errors.QuantityInStock?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Low Stock Alert *" type="number" step="0.01" {...register('LowStockThreshold')} error={errors.LowStockThreshold?.message} />
            <Input label="Supplier" {...register('Supplier')} />
          </div>

          {/* Tags Input with Autocomplete */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              Tags (Aliases / Categories)
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type tag (e.g. Dewatering, Top Washer)..."
                  value={itemTagInput}
                  onChange={(e) => handleItemTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItemTag(itemTagInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" variant="outline" onClick={() => addItemTag(itemTagInput)}>
                  Add
                </Button>
              </div>
              {itemTagSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {itemTagSuggestions.map(tag => (
                    <button
                      key={tag.TagId}
                      type="button"
                      onClick={() => addItemTag(tag.TagName)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      {tag.TagName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {itemTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {itemTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                  >
                    {tag}
                    <button type="button" onClick={() => removeItemTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Attributes (flat key/value specs) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Attributes (specs)
              </label>
              <button
                type="button"
                onClick={() => setItemAttrs(prev => [...prev, { key: '', value: '' }])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add attribute
              </button>
            </div>
            <datalist id="attr-key-suggestions">
              {attrKeySuggestions.map(k => <option key={k} value={k} />)}
            </datalist>
            {itemAttrs.length === 0 ? (
              <p className="text-xs text-slate-400">e.g. voltage = 440V, bore = 20mm, material = SS304</p>
            ) : (
              <div className="space-y-2">
                {itemAttrs.map((attr, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      list="attr-key-suggestions"
                      placeholder="key"
                      value={attr.key}
                      onChange={(e) => setItemAttrs(prev => prev.map((a, i) => i === idx ? { ...a, key: e.target.value } : a))}
                      className="w-2/5 px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="value"
                      value={attr.value}
                      onChange={(e) => setItemAttrs(prev => prev.map((a, i) => i === idx ? { ...a, value: e.target.value } : a))}
                      className="flex-1 px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setItemAttrs(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white">Pricing</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Selling Price *" type="number" step="0.01" {...register('DefaultSellingPrice')} error={errors.DefaultSellingPrice?.message} />
              {isOwner && (
                <Input label="Cost Price *" type="number" step="0.01" {...register('DefaultCostPrice')} error={errors.DefaultCostPrice?.message} />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
            <Button type="submit">{isAddOpen ? 'Add Item' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Per-Part Stock Locations & Packs Modal */}
      <Modal
        isOpen={!!stockModalItem}
        onClose={() => setStockModalItem(null)}
        title={stockModalItem ? `Stock Locations — ${stockModalItem.PartName}` : 'Stock Locations'}
      >
        <div className="space-y-4">
          {loadingPartStock ? (
            <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto" /></div>
          ) : partStockRows.length === 0 ? (
            <p className="text-sm text-slate-500">No location/pack stock entries yet.</p>
          ) : (
            <div className="border rounded-lg dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Pack</th>
                    <th className="p-2.5 text-right">Qty ({stockModalItem?.Unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {partStockRows.map(row => (
                    <tr key={row.StockId}>
                      <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{row.FullPath || row.LocationName}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.PackType} ({row.UnitsPerPack}/pack)</td>
                      <td className="p-2.5 text-right font-semibold text-slate-900 dark:text-white">{row.Quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form onSubmit={handleUpsertStock} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Add / Adjust Stock at Location</h4>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Location *</label>
              <select
                value={stockForm.LocationId}
                onChange={(e) => setStockForm(prev => ({ ...prev, LocationId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm"
              >
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc.LocationId} value={loc.LocationId}>
                    {loc.FullPath || loc.Name} ({loc.LocationType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">Pack Type</label>
                <select
                  value={stockForm.PackType}
                  onChange={(e) => setStockForm(prev => ({ ...prev, PackType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm"
                >
                  {PACK_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input
                label="Units/Pack"
                type="number"
                step="0.01"
                value={stockForm.UnitsPerPack}
                onChange={(e) => setStockForm(prev => ({ ...prev, UnitsPerPack: e.target.value }))}
              />
              <Input
                label={`Qty Delta (${stockModalItem?.Unit || 'Nos'})`}
                type="number"
                step="0.01"
                value={stockForm.QuantityDelta}
                onChange={(e) => setStockForm(prev => ({ ...prev, QuantityDelta: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm">Update Stock</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Locations Manager Modal */}
      <Modal
        isOpen={isLocationsOpen}
        onClose={() => { setIsLocationsOpen(false); setEditingLocation(null); }}
        title="Manage Storage Locations"
      >
        <div className="space-y-4">
          <form onSubmit={handleSaveLocation} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {editingLocation ? `Edit Location: ${editingLocation.Name}` : 'Add New Location'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Name *"
                placeholder="e.g. Aisle 1, Rack 1"
                value={locationForm.Name}
                onChange={(e) => setLocationForm(prev => ({ ...prev, Name: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={locationForm.LocationType}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, LocationType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm"
                >
                  {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Parent Location</label>
              <select
                value={locationForm.ParentLocationId}
                onChange={(e) => setLocationForm(prev => ({ ...prev, ParentLocationId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-sm"
              >
                <option value="0">(Root / Top-Level)</option>
                {locations
                  .filter(l => !editingLocation || l.LocationId !== editingLocation.LocationId)
                  .map(loc => (
                    <option key={loc.LocationId} value={loc.LocationId}>
                      {loc.FullPath || loc.Name} ({loc.LocationType})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              {editingLocation && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingLocation(null);
                    setLocationForm({ Name: '', LocationType: 'Bin', ParentLocationId: '0' });
                  }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" size="sm">{editingLocation ? 'Save Location' : 'Add Location'}</Button>
            </div>
          </form>

          <div className="max-h-64 overflow-y-auto border rounded-lg dark:border-slate-700">
            {loadingLocations ? (
              <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto" /></div>
            ) : locations.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No locations created yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">Path</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {locations.map(loc => (
                    <tr key={loc.LocationId}>
                      <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{loc.FullPath || loc.Name}</td>
                      <td className="p-2.5 text-slate-500">{loc.LocationType}</td>
                      <td className="p-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLocation(loc);
                              setLocationForm({
                                Name: loc.Name,
                                LocationType: loc.LocationType,
                                ParentLocationId: String(loc.ParentLocationId || 0)
                              });
                            }}
                            className="p-1 text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLocation(loc.LocationId)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
