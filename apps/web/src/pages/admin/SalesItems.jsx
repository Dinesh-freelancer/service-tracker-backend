import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const SalesItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            Category: 'Refurbished Motors',
            Name: '',
            Status: 'Available',
            Specs: [],
            Images: []
        }
    });

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control,
        name: "Specs"
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control,
        name: "Images"
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/sales-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch sales items');
            const data = await res.json();
            setItems(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        reset({
            Category: 'Refurbished Motors',
            Name: '',
            Status: 'Available',
            Specs: [],
            Images: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);

        // Transform Specs object back to array of {key, value} for the form
        const specsObj = typeof item.Specs === 'string' ? JSON.parse(item.Specs) : (item.Specs || {});
        const specsArr = Object.entries(specsObj).map(([k, v]) => ({ key: k, value: v }));

        // Ensure images is an array of objects for useFieldArray
        const imagesArr = typeof item.Images === 'string' ? JSON.parse(item.Images) : (item.Images || []);
        const formattedImages = imagesArr.map(url => ({ url }));

        reset({
            Category: item.Category,
            Name: item.Name,
            Status: item.Status,
            Specs: specsArr,
            Images: formattedImages
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sales item?')) return;

        try {
            const res = await fetch(`${apiUrl}/sales-items/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete item');
            toast.success('Item deleted successfully');
            fetchItems();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const onSubmit = async (data) => {
        // Transform specs array back to object
        const specsObj = {};
        data.Specs.forEach(spec => {
            if (spec.key && spec.value) {
                specsObj[spec.key] = spec.value;
            }
        });

        // Transform images array of objects back to array of strings
        const imagesArr = data.Images.map(img => img.url).filter(url => url.trim() !== '');

        const payload = {
            Category: data.Category,
            Name: data.Name,
            Status: data.Status,
            Specs: specsObj,
            Images: imagesArr
        };

        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `${apiUrl}/sales-items/${editingItem.ItemId}` : `${apiUrl}/sales-items`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Failed to ${editingItem ? 'update' : 'create'} item`);
            toast.success(`Item ${editingItem ? 'updated' : 'created'} successfully`);
            setIsModalOpen(false);
            fetchItems();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="text-blue-600" />
                        Sales Portfolio
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage refurbished motors and motor spares for the public site.</p>
                </div>
                <Button onClick={handleAdd} className="flex items-center gap-2">
                    <Plus size={18} /> Add Sales Item
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">No items found.</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.ItemId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">{item.Name}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                                                {item.Category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.Status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {item.Status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.ItemId)} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors">
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Edit Sales Item" : "Add Sales Item"}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name *" {...register('Name', { required: 'Name is required' })} error={errors.Name?.message} />

                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
                            <select
                                {...register('Category')}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="Refurbished Motors">Refurbished Motors</option>
                                <option value="Motor Spares">Motor Spares</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                        <select
                            {...register('Status')}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="Available">Available</option>
                            <option value="Out of stock">Out of stock</option>
                        </select>
                    </div>

                    {/* Specs Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Specifications</label>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: '', value: '' })} className="py-1 px-2 text-xs">
                                <Plus size={14} className="mr-1" /> Add Spec
                            </Button>
                        </div>
                        {specFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 mb-2 items-start">
                                <div className="flex-1">
                                    <Input placeholder="Key (e.g. HP)" {...register(`Specs.${index}.key`)} />
                                </div>
                                <div className="flex-1">
                                    <Input placeholder="Value (e.g. 5)" {...register(`Specs.${index}.value`)} />
                                </div>
                                <button type="button" onClick={() => removeSpec(index)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded mt-0.5">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {specFields.length === 0 && <p className="text-xs text-slate-500 italic">No specifications added.</p>}
                    </div>

                    {/* Images Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image Embed URLs (Max 10)</label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendImage({ url: '' })}
                                disabled={imageFields.length >= 10}
                                className="py-1 px-2 text-xs"
                            >
                                <Plus size={14} className="mr-1" /> Add Image URL
                            </Button>
                        </div>
                        {imageFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 mb-2 items-start">
                                <div className="flex-1">
                                    <Input placeholder="Embed URL" {...register(`Images.${index}.url`)} />
                                </div>
                                <button type="button" onClick={() => removeImage(index)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded mt-0.5">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {imageFields.length === 0 && <p className="text-xs text-slate-500 italic">No images added.</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {editingItem ? 'Update Item' : 'Create Item'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SalesItems;
