import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateJob = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, control, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            DateReceived: new Date().toISOString().split('T')[0],
            Notes: '',
            Brand: '',
            PumpModel: '',
            MotorModel: '',
            SerialNumber: '',
            PowerRating: '',
            PowerUnit: 'HP',
            AssetType: 'Pumpset',
            Phase: ''
        }
    });

    // Steps: 1. Select Customer, 2. Select/Create Asset, 3. Job Details
    const [step, setStep] = useState(1);

    // Data States
    const [selectionMode, setSelectionMode] = useState('Individual'); // 'Individual' or 'Organization'
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
    const [customers, setCustomers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [isNewAsset, setIsNewAsset] = useState(false);

    // UI States
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || '';

    // Fetch Organizations if mode is 'Organization'
    useEffect(() => {
        if (selectionMode === 'Organization' && organizations.length === 0) {
            const fetchOrgs = async () => {
                setLoadingOrgs(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${apiUrl}/organizations`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setOrganizations(data);
                    }
                } catch (err) {
                    toast.error('Failed to load organizations');
                } finally {
                    setLoadingOrgs(false);
                }
            };
            fetchOrgs();
        }
    }, [selectionMode, organizations.length, apiUrl]);

    // Fetch Customers (Filtered by Search and Selection Mode)
    useEffect(() => {
        if (step === 1) {
            const fetchCustomers = async () => {
                setLoadingCustomers(true);
                try {
                    const token = localStorage.getItem('token');
                    let queryParams = new URLSearchParams({ limit: 100, hideSensitive: 'false' });
                    if (customerSearch) queryParams.append('search', customerSearch);

                    const res = await fetch(`${apiUrl}/customers?${queryParams.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    let fetchedCustomers = data.data || [];

                    if (selectionMode === 'Individual') {
                        // Only show individuals
                        fetchedCustomers = fetchedCustomers.filter(c => c.CustomerType === 'Individual');
                    } else if (selectionMode === 'Organization') {
                        // Only show members of the selected organization
                        if (selectedOrganizationId) {
                            fetchedCustomers = fetchedCustomers.filter(c => c.OrganizationId === Number(selectedOrganizationId));
                        } else {
                            fetchedCustomers = []; // Don't show any until org is selected
                        }
                    }

                    setCustomers(fetchedCustomers);
                } catch (err) {
                    toast.error('Failed to load customers');
                } finally {
                    setLoadingCustomers(false);
                }
            };
            const debounce = setTimeout(fetchCustomers, 500);
            return () => clearTimeout(debounce);
        }
    }, [customerSearch, step, selectionMode, selectedOrganizationId, apiUrl]);

    // Fetch Assets when customer is selected (or when an organization is active for that customer)
    useEffect(() => {
        if (selectedCustomer) {
            const fetchAssets = async () => {
                setLoadingAssets(true);
                try {
                    const token = localStorage.getItem('token');

                    // If the customer belongs to an organization, fetch all assets for that organization
                    // so they can share assets between organization members
                    let url = `${apiUrl}/assets?customerId=${selectedCustomer.CustomerId}`;
                    if (selectionMode === 'Organization' && selectedOrganizationId) {
                        url = `${apiUrl}/assets?organizationId=${selectedOrganizationId}`;
                    }

                    const res = await fetch(url, {
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
    }, [selectedCustomer, selectionMode, selectedOrganizationId, apiUrl]);

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

    const onSubmit = async () => {
        // Use getValues() to ensure we capture all form state regardless of unmounting behavior
        // The handleSubmit wrapper has already validated the fields.
        const data = getValues();

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
                    Brand: data.Brand || null,
                    AssetType: data.AssetType || 'Pumpset',
                    PumpType: data.PumpType || null,
                    AssetDescription: data.AssetDescription || null,
                    PumpModel: data.PumpModel || null,
                    MotorModel: data.MotorModel || null,
                    SerialNumber: data.SerialNumber || null,
                    PowerRating: data.PowerRating || null,
                    PowerUnit: data.PowerUnit || 'HP',
                    Phase: data.Phase || null, // Added Phase field
                    WarrantyExpiry: data.WarrantyExpiry || null,
                    InstallationDate: data.InstallationDate || null
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
                    <div className={step === 1 ? 'space-y-4' : 'hidden'}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Find Customer</h3>
                                <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => {
                                            setSelectionMode('Individual');
                                            setSelectedOrganizationId('');
                                            setCustomerSearch('');
                                        }}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${selectionMode === 'Individual' ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Individual
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectionMode('Organization');
                                            setCustomerSearch('');
                                        }}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${selectionMode === 'Organization' ? 'bg-white shadow-sm text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Organization
                                    </button>
                                </div>
                            </div>

                            {selectionMode === 'Organization' && (
                                <div className="p-4 bg-blue-50/50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Organization</label>
                                    {loadingOrgs ? (
                                        <div className="text-sm text-slate-500">Loading organizations...</div>
                                    ) : (
                                        <select
                                            value={selectedOrganizationId}
                                            onChange={(e) => setSelectedOrganizationId(e.target.value)}
                                            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Choose Organization --</option>
                                            {organizations.map(org => (
                                                <option key={org.OrganizationId} value={org.OrganizationId}>
                                                    {org.OrganizationName}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

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
                    </div>

                    {/* Step 2: Asset Selection */}
                    <div className={step === 2 ? 'space-y-6' : 'hidden'}>
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
                                                {a.InternalTag} - {a.AssetType} {a.PumpType ? `(${a.PumpType})` : ''} - {a.Brand} {a.PumpModel} (Serial: {a.SerialNumber})
                                            </option>
                                        ))}
                                        <option value="NEW">+ Register New Asset</option>
                                    </select>

                                    {/* Selected Asset Details Card */}
                                    {!isNewAsset && selectedAssetId && (
                                        <div className="mt-4 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-100 dark:border-slate-600 animate-in fade-in">
                                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Selected Asset Details</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 text-sm">
                                                {assets.filter(a => a.AssetId === parseInt(selectedAssetId)).map(a => (
                                                    <React.Fragment key={a.AssetId}>
                                                        <div><span className="text-slate-500 block text-xs">Asset Type</span> <span className="font-medium dark:text-slate-200">{a.AssetType || 'N/A'}</span></div>
                                                        <div><span className="text-slate-500 block text-xs">Pump Type</span> <span className="font-medium dark:text-slate-200">{a.PumpType || 'N/A'}</span></div>
                                                        <div><span className="text-slate-500 block text-xs">Brand</span> <span className="font-medium dark:text-slate-200">{a.Brand || 'N/A'}</span></div>
                                                        <div><span className="text-slate-500 block text-xs">Pump Model</span> <span className="font-medium dark:text-slate-200">{a.PumpModel || 'N/A'}</span></div>
                                                        <div><span className="text-slate-500 block text-xs">Motor Model</span> <span className="font-medium dark:text-slate-200">{a.MotorModel || 'N/A'}</span></div>
                                                        <div><span className="text-slate-500 block text-xs">Power Rating</span> <span className="font-medium dark:text-slate-200">{a.PowerRating ? `${a.PowerRating} ${a.PowerUnit || 'HP'}` : 'N/A'}</span></div>
                                                        <div><span className="text-slate-500 block text-xs">Serial Number</span> <span className="font-medium dark:text-slate-200">{a.SerialNumber || 'N/A'}</span></div>
                                                        {a.AssetDescription && (
                                                            <div className="col-span-2"><span className="text-slate-500 block text-xs">Description</span> <span className="font-medium dark:text-slate-200">{a.AssetDescription}</span></div>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Asset Form */}
                                    <div className={isNewAsset ? "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2" : "hidden"}>
                                            <div className="md:col-span-2">
                                                <h4 className="font-medium text-blue-600 mb-2">New Asset Details</h4>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Asset Type</label>
                                                <select {...register('AssetType')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                                                    <option value="Pumpset">Pumpset (Combined)</option>
                                                    <option value="Motor Only">Motor Only</option>
                                                    <option value="Pump Only">Pump Only</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            </div>
                                            {watch('AssetType') !== 'Others' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Pump Type</label>
                                                    <select {...register('PumpType')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                                                        <option value="">-- Select Pump Type --</option>
                                                        <option value="V3 Borewell">V3 Borewell</option>
                                                        <option value="V4 Borewell">V4 Borewell</option>
                                                        <option value="V6 Borewell">V6 Borewell</option>
                                                        <option value="Dewatering">Dewatering</option>
                                                        <option value="Sewage">Sewage</option>
                                                        <option value="Others">Others</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Asset Description</label>
                                                <textarea {...register('AssetDescription')} rows={2} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder="Provide extra details for this asset..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Phase</label>
                                                <select {...register('Phase')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                                                    <option value="">-- Select Phase --</option>
                                                    <option value="1-PHASE">1-PHASE</option>
                                                    <option value="3-PHASE">3-PHASE</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Brand</label>
                                                <input {...register('Brand')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" placeholder="Manufacturer (e.g. Kirloskar)" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Pump Model</label>
                                                <input {...register('PumpModel')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Motor Model</label>
                                                <input {...register('MotorModel')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Serial Number</label>
                                                <input {...register('SerialNumber')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Power Rating</label>
                                                    <input {...register('PowerRating')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                                                    <select {...register('PowerUnit')} className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                                                        <option value="HP">HP</option>
                                                        <option value="KW">KW</option>
                                                    </select>
                                                </div>
                                            </div>
                                    </div>

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
                    </div>

                    {/* Step 3: Job Details */}
                    <div className={step === 3 ? 'block' : 'hidden'}>
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

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Is Warranty</label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            {...register('IsWarranty')}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                        <span className="text-sm dark:text-white">Under Warranty</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Type</label>
                                    <select
                                        {...register('BillingType')}
                                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-white"
                                    >
                                        <option value="Chargeable">Chargeable</option>
                                        <option value="Free of Cost">Free of Cost</option>
                                        <option value="Split Bill">Split Bill</option>
                                    </select>
                                </div>
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
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateJob;
