import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Image, PenTool, Calendar, User, Box, Shield, Wrench, Clock, Plus, Save, X, Search, Activity, Database, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import WindingDetails from '../../components/jobs/WindingDetails';
import { extractUrlFromEmbed, isDirectImageLink } from '../../utils/helpers';

const JobDetails = () => {
    const { jobNumber } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('job-docs'); // 'job-docs', 'asset-docs', 'parts', 'history', 'winding'

    // Modals
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPartModal, setShowPartModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);

    // Status Form
    const [newStatus, setNewStatus] = useState('');
    const [resolutionType, setResolutionType] = useState('');

    // Part Form
    const [partSearch, setPartSearch] = useState('');
    const [inventoryResults, setInventoryResults] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);
    const [partQty, setPartQty] = useState(1);
    const [searchingParts, setSearchingParts] = useState(false);

    // Doc Form
    const [docType, setDocType] = useState('Photo');
    const [docLink, setDocLink] = useState('');
    const [docDescription, setDocDescription] = useState('');
    const [isCustomerVisible, setIsCustomerVisible] = useState(false); // Default to false for photos

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const role = localStorage.getItem('role'); // Assuming role is stored or decoded from token
    const isCustomer = role === 'Customer';

    const [editingJobInfo, setEditingJobInfo] = useState(false);
    const [jobInfoForm, setJobInfoForm] = useState({
        FailureReason: '',
        FailureDescription: '',
        ServicesNeeded: []
    });
    const [newService, setNewService] = useState('');
    const [failureReasonsList, setFailureReasonsList] = useState([]);


    const fetchJob = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Job not found');

            const data = await res.json();
            setJob(data);

            // Fetch unique failure reasons
            try {
                const reasonsRes = await fetch(`${apiUrl}/jobs/failure-reasons`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (reasonsRes.ok) {
                    const reasonsData = await reasonsRes.json();
                    setFailureReasonsList(reasonsData);
                }
            } catch (e) {
                console.error("Error fetching failure reasons", e);
            }

            setJobInfoForm({
                FailureReason: data.FailureReason || '',
                FailureDescription: data.FailureDescription || '',
                ServicesNeeded: Array.isArray(data.ServicesNeeded) ? data.ServicesNeeded : (typeof data.ServicesNeeded === 'string' ? JSON.parse(data.ServicesNeeded) : [])
            });
            setNewStatus(data.Status);
        } catch (err) {
            toast.error('Failed to load job details');
            navigate('/dashboard/jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJob();
    }, [jobNumber, navigate]);

    // Search Inventory Debounce
    useEffect(() => {
        if (!showPartModal || !partSearch) {
            setInventoryResults([]);
            return;
        }
        const delay = setTimeout(async () => {
            setSearchingParts(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/inventory?search=${partSearch}&limit=20`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setInventoryResults(data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearchingParts(false);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [partSearch, showPartModal]);

    const handleSaveJobInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    FailureReason: jobInfoForm.FailureReason,
                    FailureDescription: jobInfoForm.FailureDescription,
                    ServicesNeeded: JSON.stringify(jobInfoForm.ServicesNeeded)
                })
            });

            if (!res.ok) throw new Error('Failed to update job info');

            toast.success('Job info updated successfully');
            setEditingJobInfo(false);
            fetchJob();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const addService = () => {
        if (!newService.trim()) return;
        setJobInfoForm(prev => ({
            ...prev,
            ServicesNeeded: [...prev.ServicesNeeded, { name: newService.trim(), completed: false }]
        }));
        setNewService('');
    };

    const toggleServiceCompletion = (index) => {
        setJobInfoForm(prev => {
            const newServices = [...prev.ServicesNeeded];
            newServices[index].completed = !newServices[index].completed;
            return { ...prev, ServicesNeeded: newServices };
        });
    };

    const removeService = (index) => {
        setJobInfoForm(prev => {
            const newServices = [...prev.ServicesNeeded];
            newServices.splice(index, 1);
            return { ...prev, ServicesNeeded: newServices };
        });
    };

    const handleUpdateStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = { Status: newStatus };

            if (['Completed', 'Cancelled', 'Rejected'].includes(newStatus)) {
                if (!resolutionType) {
                    toast.error('Please select a Resolution Type');
                    return;
                }
                payload.ResolutionType = resolutionType;
            }

            const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update status');

            toast.success('Status updated');
            setShowStatusModal(false);
            fetchJob();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/documents/${docId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete document');

            toast.success('Document deleted');
            fetchJob();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAddPart = async () => {
        if (!selectedPart) return;
        try {
            const token = localStorage.getItem('token');
            const payload = {
                JobNumber: job.JobNumber,
                PartId: selectedPart.PartId,
                PartName: selectedPart.PartName,
                Qty: parseFloat(partQty),
                CostPrice: selectedPart.DefaultCostPrice || 0,
                SellingPrice: selectedPart.DefaultSellingPrice || 0
            };

            const res = await fetch(`${apiUrl}/partsused`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to add part');

            toast.success('Part added to job');
            setShowPartModal(false);
            setSelectedPart(null);
            setPartSearch('');
            setPartQty(1);
            fetchJob();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAddDoc = async () => {
        if (!docLink) return;
        try {
            const token = localStorage.getItem('token');
            const payload = {
                JobNumber: job.JobNumber,
                CustomerId: job.CustomerId,
                DocumentType: docType,
                Description: docDescription,
                EmbedTag: docLink,
                IsCustomerVisible: isCustomerVisible ? 1 : 0
            };

            const res = await fetch(`${apiUrl}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to add document');

            toast.success('Document added');
            setShowDocModal(false);
            setDocLink('');
            setDocDescription('');
            setIsCustomerVisible(false); // Reset
            fetchJob();
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!job) return null;

    // Filter documents
    const documents = job.Documents || [];
    const displayedDocs = activeTab === 'job-docs'
        ? documents.filter(d => d.JobNumber === job.JobNumber)
        : documents.filter(d => d.AssetId === job.AssetId && d.JobNumber !== job.JobNumber);

    const statusOptions = ['Intake', 'Assessing', 'Awaiting Approval', 'Approved', 'In Progress', 'On Hold', 'Completed', 'Ready for Pickup', 'Fulfilled', 'Cancelled', 'Closed'];
    const resolutionOptions = ['Completed Successfully', 'Estimate Rejected', 'Customer Unreachable', 'Change of Mind', 'Warranty Denied', 'Abandoned/Unclaimed', 'Duplicate', 'Other'];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/dashboard/jobs')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Job #{job.JobNumber}
                            <span className={`text-sm px-2 py-1 rounded-full border ${
                                job.Status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                job.Status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                                {job.Status}
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500">Received {new Date(job.DateReceived).toLocaleDateString()}</p>
                    </div>
                </div>


                {/* Customer Approval Flow */}
                {isCustomer && job.Status === 'Awaiting Approval' && (
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        },
                                        body: JSON.stringify({ Status: 'Approved' })
                                    });
                                    if (!res.ok) throw new Error('Failed to approve estimate');
                                    toast.success('Estimate approved successfully');
                                    fetchJob();
                                } catch (err) {
                                    toast.error(err.message);
                                }
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                        >
                            <Activity size={18} />
                            Approve Estimate
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`${apiUrl}/jobs/${jobNumber}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        },
                                        body: JSON.stringify({ Status: 'On Hold', ResolutionType: 'Estimate Rejected' })
                                    });
                                    if (!res.ok) throw new Error('Failed to reject estimate');
                                    toast.success('Estimate rejected');
                                    fetchJob();
                                } catch (err) {
                                    toast.error(err.message);
                                }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                        >
                            <X size={18} />
                            Reject
                        </button>
                    </div>
                )}

                {!isCustomer && (
                    <div className="flex gap-2">
                         <button
                            onClick={() => setShowStatusModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                        >
                            <Activity size={18} />
                            Update Status
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Asset Details Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Box size={20} className="text-blue-500" />
                            Asset Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Internal Tag</div>
                                <div className="font-mono font-medium text-slate-900 dark:text-white">
                                    {isCustomer ? '*****' : (job.InternalTag || 'N/A')}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Brand / Type</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.Brand} <span className="text-xs text-slate-500">({job.AssetType})</span></div>
                            </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Phase</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.Phase || 'N/A'}</div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Models</div>
                                <div className="font-medium text-slate-900 dark:text-white text-xs">
                                    {job.PumpModel && <div>Pump: {job.PumpModel}</div>}
                                    {job.MotorModel && <div>Motor: {job.MotorModel}</div>}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">Serial #</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.SerialNumber || 'N/A'}</div>
                            </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase">HP</div>
                                <div className="font-medium text-slate-900 dark:text-white">{job.HP || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Job Details Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <PenTool size={20} className="text-purple-500" />
                                Job Information
                            </h2>
                            {!isCustomer && (
                                editingJobInfo ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingJobInfo(false)} className="text-sm px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Cancel</button>
                                        <button onClick={handleSaveJobInfo} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"><Save size={14} /> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setEditingJobInfo(true)} className="text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"><PenTool size={14} /> Edit</button>
                                )
                            )}
                        </div>
                        <div className="space-y-4">
                            {!editingJobInfo ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Issue / Notes</label>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-slate-700 dark:text-slate-300 min-h-[60px]">
                                            {job.Notes || 'No notes provided.'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Failure Reason</label>
                                        <div className="text-sm text-slate-800 dark:text-slate-200">{job.FailureReason || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Failure Description</label>
                                        <div className="text-sm text-slate-800 dark:text-slate-200">{job.FailureDescription || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Services Needed</label>
                                        {job.ServicesNeeded && job.ServicesNeeded.length > 0 ? (
                                            <ul className="space-y-2 mt-2">
                                                {job.ServicesNeeded.map((srv, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                                                        <input type="checkbox" checked={srv.completed} readOnly className="rounded border-slate-300" />
                                                        <span className={srv.completed ? 'line-through text-slate-400' : ''}>{srv.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-slate-500">None added</div>
                                        )}
                                    </div>
                                    {job.ResolutionType && (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Resolution</label>
                                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg border border-green-100 dark:border-green-800">
                                                {job.ResolutionType}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Failure Reason</label>
                                        <input
                                            type="text"
                                            list="failure-reasons-list"
                                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={jobInfoForm.FailureReason}
                                            onChange={(e) => setJobInfoForm({...jobInfoForm, FailureReason: e.target.value})}
                                            placeholder="Select or type reason..."
                                        />
                                        <datalist id="failure-reasons-list">
                                            {failureReasonsList.map((reason, i) => <option key={i} value={reason} />)}
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Failure Description</label>
                                        <textarea
                                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            value={jobInfoForm.FailureDescription}
                                            onChange={(e) => setJobInfoForm({...jobInfoForm, FailureDescription: e.target.value})}
                                            rows={3}
                                            placeholder="Detailed description..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Services Needed</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                value={newService}
                                                onChange={(e) => setNewService(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                                                placeholder="e.g. Bearing bush changing"
                                            />
                                            <button type="button" onClick={addService} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
                                        </div>
                                        <ul className="space-y-2">
                                            {jobInfoForm.ServicesNeeded.map((srv, idx) => (
                                                <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={srv.completed}
                                                            onChange={() => toggleServiceCompletion(idx)}
                                                            className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                                                        />
                                                        <span className={`text-sm ${srv.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{srv.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeService(idx)} className="text-red-500 hover:text-red-700"><X size={16}/></button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Unified Tabs Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('job-docs')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'job-docs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Job Documents
                                </button>
                                <button
                                    onClick={() => setActiveTab('parts')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'parts' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Parts Used
                                </button>
                                {!isCustomer && (
                                    <button
                                        onClick={() => setActiveTab('winding')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'winding' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Winding Details
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('asset-history')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'asset-history' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Asset History
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'history' ? 'border-slate-600 text-slate-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Audit Log
                                </button>
                            </div>
                        </div>
                        <div className="p-6">

                            {/* Job Docs View */}
                            {activeTab === 'job-docs' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-slate-900 dark:text-white">Documents</h3>
                                        {!isCustomer && (
                                            <button onClick={() => setShowDocModal(true)} className="text-sm text-blue-600 hover:underline">+ Add Document</button>
                                        )}
                                    </div>
                                    {displayedDocs.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                            No documents found.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {displayedDocs.map(doc => {
                                                const url = extractUrlFromEmbed(doc.EmbedTag);
                                                const isImage = isDirectImageLink(url);
                                                const isEmbeddable = url.includes('drive.google.com') || url.includes('docs.google.com');

                                                return (
                                                    <div key={doc.DocumentId} className="flex flex-col gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                                                        <div className="flex items-start gap-3 w-full">
                                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded shrink-0">
                                                                {doc.DocumentType === 'Photo' ? <Image size={20} className="text-blue-600 dark:text-blue-400" /> : <FileText size={20} className="text-blue-600 dark:text-blue-400" />}
                                                            </div>
                                                            <div className="overflow-hidden flex-1">
                                                                <div className="font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">
                                                                    {doc.DocumentType}
                                                                    {!isCustomer && (
                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${doc.IsCustomerVisible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                            {doc.IsCustomerVisible ? 'Public' : 'Internal'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {doc.Description && (
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                                        {doc.Description}
                                                                    </div>
                                                                )}
                                                                <div className="text-xs text-slate-500 mb-1">{new Date(doc.CreatedAt).toLocaleDateString()}</div>
                                                                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate inline-flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                    Open Fullscreen
                                                                </a>
                                                            </div>
                                                            {!isCustomer && (role === 'Admin' || role === 'Owner') && (
                                                                <button
                                                                    onClick={() => handleDeleteDoc(doc.DocumentId)}
                                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors shrink-0"
                                                                    title="Delete Document"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Inline Viewer */}
                                                        {isImage ? (
                                                            <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 rounded overflow-hidden">
                                                                <img src={url} alt={doc.DocumentType} className="w-full h-full object-contain" />
                                                            </div>
                                                        ) : isEmbeddable ? (
                                                            <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded overflow-hidden relative">
                                                                <iframe src={url} className="w-full h-full border-0" allow="autoplay" title={doc.DocumentType}></iframe>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Parts Used View */}
                            {activeTab === 'parts' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-slate-900 dark:text-white">Spare Parts & Consumables</h3>
                                        {!isCustomer && (
                                            <button onClick={() => setShowPartModal(true)} className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                                                <Plus size={16} /> Add Part
                                            </button>
                                        )}
                                    </div>
                                    {(!job.Parts || job.Parts.length === 0) ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <Wrench size={32} className="mx-auto mb-2 opacity-50" />
                                            No parts used yet.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50">
                                                    <tr>
                                                        <th className="px-4 py-2">Part Name</th>
                                                        <th className="px-4 py-2">Qty</th>
                                                        { !isCustomer && <th className="px-4 py-2 text-right">Cost</th> }
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {job.Parts.map(part => (
                                                        <tr key={part.PartUsedId} className="border-b border-slate-100 dark:border-slate-700">
                                                            <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{part.PartName}</td>
                                                            <td className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-200">{part.Qty}</td>
                                                            { !isCustomer && <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{part.CostPrice}</td> }
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Winding Details View */}
                            {activeTab === 'winding' && !isCustomer && (
                                <WindingDetails assetId={job.AssetId} phase={job.Phase} defaultHp={job.HP} />
                            )}

                            {/* Asset History View */}
                            {activeTab === 'asset-history' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Database size={18} className="text-purple-600" />
                                            Asset Specifications
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div><span className="text-slate-500 block">Internal Tag</span> <span className="font-medium text-slate-900 dark:text-white">{job.InternalTag || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block">Brand</span> <span className="font-medium text-slate-900 dark:text-white">{job.Brand || job.PumpBrand || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block">Motor Model</span> <span className="font-medium text-slate-900 dark:text-white">{job.MotorModel || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block">Pump Model</span> <span className="font-medium text-slate-900 dark:text-white">{job.PumpModel || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block">Serial Number</span> <span className="font-medium text-slate-900 dark:text-white">{job.SerialNumber || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block">HP</span> <span className="font-medium text-slate-900 dark:text-white">{job.HP || 'N/A'}</span></div>
                                            <div><span className="text-slate-500 block">Phase</span> <span className="font-medium text-slate-900 dark:text-white">{job.Phase || 'N/A'}</span></div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Past Repair Timeline</h3>
                                        {(!job.AssetJobs || job.AssetJobs.length === 0) ? (
                                            <div className="text-center py-8 text-slate-400 border border-slate-100 dark:border-slate-700 rounded-lg">
                                                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                                No previous repair history found for this asset.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {job.AssetJobs.map((assetJob, index) => (
                                                    <div key={assetJob.JobNumber} className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-500"></div>
                                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                        Job #{assetJob.JobNumber}
                                                                        {assetJob.JobNumber === job.JobNumber && (
                                                                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold uppercase tracking-wider">Current</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                                        <Calendar size={12} /> Received: {new Date(assetJob.DateReceived).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                                                                        assetJob.Status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                        assetJob.Status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        'bg-slate-50 text-slate-700 border-slate-200'
                                                                    }`}>
                                                                        {assetJob.Status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-slate-700 dark:text-slate-300 mt-3">
                                                                <span className="font-semibold">Issue/Notes:</span> {assetJob.Notes || 'No notes provided.'}
                                                            </div>
                                                            {assetJob.ResolutionType && (
                                                                <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                                                                    <span className="font-semibold">Resolution:</span> {assetJob.ResolutionType}
                                                                </div>
                                                            )}
                                                            {assetJob.JobNumber !== job.JobNumber && (
                                                                <button
                                                                    onClick={() => {
                                                                        navigate(`/dashboard/jobs/${assetJob.JobNumber}`);
                                                                        window.location.reload(); // Force full reload to reset state for new job
                                                                    }}
                                                                    className="mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                                >
                                                                    View Job Details &rarr;
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* History View */}
                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-slate-900 dark:text-white">Status History & Audit Log</h3>
                                    {(!job.History || job.History.length === 0) ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                            No history recorded.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {job.History.map(h => (
                                                <div key={h.HistoryId} className="flex gap-4 p-3 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                                                    <div className="min-w-[100px] text-xs text-slate-500">
                                                        {new Date(h.ChangedAt).toLocaleString()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {h.StatusFrom} &rarr; {h.StatusTo}
                                                        </div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                            {h.ChangeComments}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Customer Info - Only show if not masked (Workers see *****) */}
                    {job.CustomerName !== '*****' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-indigo-500" />
                                Customer
                            </h2>
                            <div className="space-y-3">
                                <div className="font-medium text-slate-900 dark:text-white">{job.CustomerName}</div>
                                {job.OrganizationName && <div className="text-sm text-slate-500">{job.OrganizationName}</div>}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                                    {job.PrimaryContact}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}

            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Update Job Status</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">New Status</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {['Completed', 'Cancelled', 'Rejected'].includes(newStatus) && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Resolution Type *</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                                        value={resolutionType}
                                        onChange={(e) => setResolutionType(e.target.value)}
                                    >
                                        <option value="">-- Select Resolution --</option>
                                        {resolutionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setShowStatusModal(false)} className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-200">Cancel</button>
                                <button onClick={handleUpdateStatus} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 font-medium">Update Status</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Part Modal */}
            {showPartModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add Part</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Search Inventory</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Type part name..."
                                        className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                                        value={partSearch}
                                        onChange={(e) => setPartSearch(e.target.value)}
                                    />
                                    {searchingParts && <div className="absolute right-2 top-2 text-xs text-slate-400">Searching...</div>}
                                </div>
                                {inventoryResults.length > 0 && !selectedPart && (
                                    <div className="mt-2 max-h-40 overflow-y-auto border rounded dark:border-slate-600 bg-white dark:bg-slate-800">
                                        {inventoryResults.map(p => (
                                            <button
                                                key={p.PartId}
                                                onClick={() => { setSelectedPart(p); setPartSearch(p.PartName); setInventoryResults([]); }}
                                                className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 border-b dark:border-slate-600 last:border-0"
                                            >
                                                <div className="font-medium text-slate-900 dark:text-white">{p.PartName}</div>
                                                <div className="text-xs text-slate-500">Stock: {p.QuantityInStock} | Cost: {p.DefaultCostPrice}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedPart && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                                    <div className="font-medium text-blue-800 dark:text-blue-200">{selectedPart.PartName}</div>
                                    <button onClick={() => { setSelectedPart(null); setPartSearch(''); }} className="text-xs text-blue-600 hover:underline">Change</button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Quantity</label>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                                    value={partQty}
                                    onChange={(e) => setPartQty(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setShowPartModal(false)} className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-200">Cancel</button>
                                <button onClick={handleAddPart} disabled={!selectedPart} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 font-medium">Add Part</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Modal */}
            {showDocModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add Document</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Document Type</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                                    value={docType}
                                    onChange={(e) => {
                                        setDocType(e.target.value);
                                        // Auto-toggle visibility for Invoices/Quotes
                                        if (e.target.value === 'Invoice' || e.target.value === 'Quote') {
                                            setIsCustomerVisible(true);
                                        } else {
                                            setIsCustomerVisible(false);
                                        }
                                    }}
                                >
                                    <option value="Photo">Photo</option>
                                    <option value="Invoice">Invoice</option>
                                    <option value="Quote">Quote</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Description / Label</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Impeller side, Cable test result..."
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 mb-4"
                                    value={docDescription}
                                    onChange={(e) => setDocDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Link / URL / Text</label>
                                <input
                                    type="text"
                                    placeholder="Paste image link or text..."
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                                    value={docLink}
                                    onChange={(e) => setDocLink(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <input
                                    type="checkbox"
                                    id="isCustomerVisible"
                                    checked={isCustomerVisible}
                                    onChange={(e) => setIsCustomerVisible(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <label htmlFor="isCustomerVisible" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Visible to Customer
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button onClick={() => setShowDocModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300">Cancel</button>
                                <button onClick={handleAddDoc} disabled={!docLink} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 font-medium">Add Document</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JobDetails;
