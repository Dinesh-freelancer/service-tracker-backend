import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateJob = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm({
        defaultValues: {
            DateReceived: new Date().toISOString().split('T')[0],
            Notes: ''
        }
    });

    // Steps: 1. Select Customer, 2. Select/Create Asset, 3. Job Details
    const [step, setStep] = useState(1);

    // Data States
    const [customers, setCustomers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [isNewAsset, setIsNewAsset] = useState(false);

    // UI States
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // Fetch Customers (Debounced search ideally, but simple for now)
    useEffect(() => {
        if (step === 1) {
            const fetchCustomers = async () => {
                setLoadingCustomers(true);
                try {
                    const token = localStorage.getItem('token');
                    // Assuming endpoint /api/customers?search=... exists, or just fetch all
                    const res = await fetch(`${apiUrl}/customers?limit=100&search=${customerSearch}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    setCustomers(data.data || []);
                } catch (err) {
                    toast.error('Failed to load customers');
                } finally {
                    setLoadingCustomers(false);
                }
            };
            const debounce = setTimeout(fetchCustomers, 500);
            return () => clearTimeout(debounce);
        }
    }, [customerSearch, step]);

    // Fetch Assets when customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            const fetchAssets = async () => {
                setLoadingAssets(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${apiUrl}/assets?customerId=${selectedCustomer.CustomerId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    setAssets(data || []);
                } catch (err) {
                    toast.error('Failed to load assets');
                } finally {
                    setLoadingAssets(false);
                }
            };
            fetchAssets();
        }
    }, [selectedCustomer]);

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setValue('CustomerId', customer.CustomerId);
        setStep(2);
    };

    const handleAssetChange = (e) => {
        const val = e.target.value;
        if (val === 'NEW') {
            setIsNewAsset(true);
            setSelectedAssetId(null);
            setValue('AssetId', null);
        } else {
            setIsNewAsset(false);
            setSelectedAssetId(val);
            setValue('AssetId', val);
        }
    };

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');

            // Construct Payload
            const payload = {
                CustomerId: selectedCustomer.CustomerId,
                DateReceived: data.DateReceived,
                Notes: data.Notes
            };

            if (isNewAsset) {
                payload.NewAsset = {
                    InternalTag: data.InternalTag, // Optional, auto-generated if empty
                    PumpBrand: data.PumpBrand,
                    PumpModel: data.PumpModel,
                    MotorBrand: data.MotorBrand,
                    MotorModel: data.MotorModel,
                    SerialNumber: data.SerialNumber,
                    HP: data.HP,
                    WarrantyExpiry: data.WarrantyExpiry,
                    InstallationDate: data.InstallationDate
                };
            } else {
                if (!selectedAssetId) {
                    toast.error('Please select an asset');
                    return;
                }
                payload.AssetId = selectedAssetId;
            }

            const res = await fetch(`${apiUrl}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to create job');
            }

            toast.success('Job created successfully');
            navigate('/dashboard/jobs');

        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Job</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Steps Sidebar */}
                <div className="col-span-1 space-y-4">
                    <div className={`p-4 rounded-lg border ${step === 1 ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
                        <div className="font-medium text-slate-900 dark:text-white">1. Select Customer</div>
                        {selectedCustomer && <div className="text-sm text-green-600 mt-1">Selected: {selectedCustomer.CustomerName}</div>}
                    </div>
                    <div className={`p-4 rounded-lg border ${step === 2 ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
                        <div className="font-medium text-slate-900 dark:text-white">2. Select Asset</div>
                        {selectedAssetId && !isNewAsset && <div className="text-sm text-green-600 mt-1">Asset Selected</div>}
                        {isNewAsset && <div className="text-sm text-green-600 mt-1">New Asset Details</div>}
                    </div>
                    <div className={`p-4 rounded-lg border ${step === 3 ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
                         <div className="font-medium text-slate-900 dark:text-white">3. Job Details</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">

                    {/* Step 1: Customer Selection */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Find Customer</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by Name or Phone..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {loadingCustomers ? (
                                    <div className="text-center py-4 text-slate-500">Loading...</div>
                                ) : customers.length === 0 ? (
                                    <div className="text-center py-4 text-slate-500">No customers found.</div>
                                ) : (
                                    customers.map(c => (
                                        <button
                                            key={c.CustomerId}
                                            onClick={() => handleCustomerSelect(c)}
                                            className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className="font-medium text-slate-900 dark:text-white">{c.CustomerName}</div>
                                            <div className="text-sm text-slate-500">{c.PrimaryContact}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Asset Selection */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Select Equipment (Asset)</h3>

                            {loadingAssets ? (
                                <div>Loading assets...</div>
                            ) : (
                                <div className="space-y-4">
                                    <select
                                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={handleAssetChange}
                                        value={isNewAsset ? 'NEW' : selectedAssetId || ''}
                                    >
                                        <option value="" disabled>-- Select an Asset --</option>
                                        {assets.map(a => (
                                            <option key={a.AssetId} value={a.AssetId}>
                                                {a.InternalTag} - {a.PumpBrand} {a.PumpModel} (Serial: {a.SerialNumber})
                                            </option>
                                        ))}
                                        <option value="NEW">+ Register New Asset</option>
                                    </select>

                                    {/* New Asset Form */}
                                    {isNewAsset && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                                            <div className="md:col-span-2">
                                                <h4 className="font-medium text-blue-600 mb-2">New Asset Details</h4>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Pump Brand *</label>
                                                <input {...register('PumpBrand', { required: isNewAsset })} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                                {errors.PumpBrand && <span className="text-red-500 text-xs">Required</span>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Pump Model *</label>
                                                <input {...register('PumpModel', { required: isNewAsset })} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                                {errors.PumpModel && <span className="text-red-500 text-xs">Required</span>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Motor Brand</label>
                                                <input {...register('MotorBrand')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Motor Model</label>
                                                <input {...register('MotorModel')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Serial Number</label>
                                                <input {...register('SerialNumber')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">HP / Power</label>
                                                <input {...register('HP')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setStep(3)}
                                            disabled={!selectedAssetId && !isNewAsset}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next: Job Details
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Job Details */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Job Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date Received</label>
                                <input
                                    type="date"
                                    {...register('DateReceived', { required: true })}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Description / Notes</label>
                                <textarea
                                    rows={4}
                                    {...register('Notes')}
                                    placeholder="Describe the issue..."
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Create Job
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CreateJob;
