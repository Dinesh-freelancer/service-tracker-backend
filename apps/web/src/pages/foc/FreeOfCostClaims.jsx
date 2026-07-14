import React, { useState, useEffect } from 'react';
import { Search, Plus, X, FileText, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const FreeOfCostClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingClaim, setEditingClaim] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('SRNumber');
    const [sortOrder, setSortOrder] = useState('desc');

    // Job search state for the modal
    const [jobSearch, setJobSearch] = useState('');
    const [jobResults, setJobResults] = useState([]);
    const [showJobDropdown, setShowJobDropdown] = useState(false);
    const [isSearchingJobs, setIsSearchingJobs] = useState(false);

    // Form state
    const [jobNumber, setJobNumber] = useState('');
    const [srNumber, setSrNumber] = useState('');
    const [srDate, setSrDate] = useState('');
    const [srType, setSrType] = useState('Repair');
    const [claimStatus, setClaimStatus] = useState('Pending');
    const [claimAmount, setClaimAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [annexNumberField, setAnnexNumberField] = useState('');
    const [focNumber, setFocNumber] = useState('');

    // Annexure Form State
    const [activeTab, setActiveTab] = useState('claims');
    const [annexures, setAnnexures] = useState([]);
    const [showAnnexModal, setShowAnnexModal] = useState(false);
    const [editingAnnex, setEditingAnnex] = useState(null);
    const [annexNumber, setAnnexNumber] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [annexClaimAmount, setAnnexClaimAmount] = useState('');
    const [postService, setPostService] = useState('');
    const [consignmentNumber, setConsignmentNumber] = useState('');
    const [postDate, setPostDate] = useState('');

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const statuses = ['Pending', 'On Hold', 'Submitted', 'Approved', 'Post Sent', 'False'];
    const srTypes = ['Repair', 'Site Visit'];

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = `${apiUrl}/foc-claims`;
            if (filterStatus) {
                url += `?status=${filterStatus}`;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch FOC claims');
            const data = await response.json();
            setClaims(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [filterStatus, sortBy, sortOrder]);

    const fetchAnnexures = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/annexures`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch annexures');
            const data = await response.json();
            setAnnexures(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'annexures') {
            fetchAnnexures();
        }
    }, [activeTab]);

    // Job Search Effect
    useEffect(() => {
        const searchJobs = async () => {
            if (jobSearch.length < 2) {
                setJobResults([]);
                return;
            }
            setIsSearchingJobs(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/jobs?search=${encodeURIComponent(jobSearch)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setJobResults(data.data || data);
                }
            } catch (err) {
                console.error("Failed to search jobs:", err);
            } finally {
                setIsSearchingJobs(false);
            }
        };
        const timeoutId = setTimeout(searchJobs, 300);
        return () => clearTimeout(timeoutId);
    }, [jobSearch, apiUrl]);

    const handleOpenModal = (claim = null) => {
        if (claim) {
            setEditingClaim(claim);
            setJobNumber(claim.JobNumber || '');
            setJobSearch(claim.JobNumber || '');
            setSrNumber(claim.SRNumber);
            setSrDate(claim.SRDate);
            setSrType(claim.SRType);
            setClaimStatus(claim.ClaimStatus);
            setClaimAmount(claim.ClaimAmount || '');
            setNotes(claim.Notes || '');
            setAnnexNumberField(claim.AnnexNumber || '');
            setFocNumber(claim.FOCNumber || '');
        } else {
            setEditingClaim(null);
            setJobNumber('');
            setJobSearch('');
            setSrNumber('');
            setSrDate('');
            setSrType('Repair');
            setClaimStatus('Pending');
            setClaimAmount('');
            setNotes('');
            setAnnexNumberField('');
            setFocNumber('');
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const method = editingClaim ? 'PUT' : 'POST';
            const url = editingClaim
                ? `${apiUrl}/foc-claims/${editingClaim.Id}`
                : `${apiUrl}/foc-claims`;

            const payload = {
                JobNumber: jobNumber || null,
                SRNumber: srNumber,
                SRDate: srDate,
                SRType: srType,
                ClaimStatus: claimStatus,
                ClaimAmount: claimAmount ? parseFloat(claimAmount) : null,
                Notes: notes,
                AnnexNumber: annexNumberField || null,
                FOCNumber: focNumber || null
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save claim');

            setShowModal(false);
            fetchClaims();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this claim?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/foc-claims/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete claim');
            fetchClaims();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleOpenAnnexModal = (annex = null) => {
        if (annex) {
            setEditingAnnex(annex);
            setAnnexNumber(annex.AnnexNumber);
            setInvoiceNumber(annex.InvoiceNumber || '');
            setAnnexClaimAmount(annex.ClaimAmount || '');
            setPostService(annex.PostService || '');
            setConsignmentNumber(annex.ConsignmentNumber || '');
            setPostDate(annex.PostDate ? annex.PostDate.split('T')[0] : '');
        } else {
            setEditingAnnex(null);
            setAnnexNumber('');
            setInvoiceNumber('');
            setAnnexClaimAmount('');
            setPostService('');
            setConsignmentNumber('');
            setPostDate('');
        }
        setShowAnnexModal(true);
    };

    const handleAnnexSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const method = editingAnnex ? 'PUT' : 'POST';
            const url = editingAnnex
                ? `${apiUrl}/annexures/${encodeURIComponent(editingAnnex.AnnexNumber)}`
                : `${apiUrl}/annexures`;

            const payload = {
                AnnexNumber: annexNumber,
                InvoiceNumber: invoiceNumber,
                ClaimAmount: annexClaimAmount ? parseFloat(annexClaimAmount) : null,
                PostService: postService,
                ConsignmentNumber: consignmentNumber,
                PostDate: postDate || null
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to save annexure');
            setShowAnnexModal(false);
            fetchAnnexures();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAnnexDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this annexure?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/annexures/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete annexure');
            fetchAnnexures();
        } catch (err) {
            alert(err.message);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'Submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'On Hold': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'Post Sent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'False': return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Free Of Cost Claims</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track FOC service requests and claims</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mt-4 mb-6">
                <button onClick={() => setActiveTab('claims')} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'claims' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}>Claims</button>
                <button onClick={() => setActiveTab('annexures')} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'annexures' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}>Annexures</button>
            </div>

            {activeTab === 'claims' && (
                <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div></div>
                <div className="flex gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="SRNumber">Sort: SR Number</option>
                            <option value="Id">Sort: Default</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
                        >
                            <span className="font-bold">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                        </button>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} /> New Claim
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center">
                    {error}
                </div>
            ) : claims.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <FileText size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No FOC claims found</h3>
                    <p className="text-slate-500 mt-1">Create a new claim to get started</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {claims.map((claim) => (
                        <div key={claim.Id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all hover:shadow-md">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">SR: {claim.SRNumber}</h3>
                                    {claim.FOCNumber && (
                                        <span className="font-medium text-sm text-slate-600 dark:text-slate-400">
                                            FOC: {claim.FOCNumber}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusStyle(claim.ClaimStatus)}`}>
                                        {claim.ClaimStatus}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        {claim.SRType}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    {claim.JobNumber && (
                                        <div className="flex items-center gap-1.5">
                                            <FileText size={14} />
                                            <span className="font-medium text-blue-600 dark:text-blue-400">{claim.JobNumber}</span>
                                        </div>
                                    )}
                                    {claim.AnnexNumber && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold">
                                            Annex: {claim.AnnexNumber}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span>{claim.SRDate}</span>
                                    </div>
                                    {claim.ClaimAmount && (
                                        <div className="font-medium text-slate-700 dark:text-slate-300">
                                            ₹{parseFloat(claim.ClaimAmount).toLocaleString('en-IN')}
                                        </div>
                                    )}
                                </div>
                                {claim.Notes && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                                        {claim.Notes}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
                                <button
                                    onClick={() => handleOpenModal(claim)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(claim.Id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {editingClaim ? 'Edit FOC Claim' : 'New FOC Claim'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mandatory Fields */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SR Number *</label>
                                    <input
                                        type="text"
                                        value={srNumber}
                                        onChange={(e) => setSrNumber(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SR Date *</label>
                                    <input
                                        type="date"
                                        value={srDate}
                                        onChange={(e) => setSrDate(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">FOC Number</label>
                                    <input
                                        type="text"
                                        maxLength="15"
                                        value={focNumber}
                                        onChange={(e) => setFocNumber(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Optional/Enum Fields */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select
                                        value={srType}
                                        onChange={(e) => setSrType(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {srTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={claimStatus}
                                        onChange={(e) => setClaimStatus(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Claim Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={claimAmount}
                                        onChange={(e) => setClaimAmount(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2 relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Number (Optional)</label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={jobSearch}
                                            onChange={(e) => {
                                                setJobSearch(e.target.value);
                                                setShowJobDropdown(true);
                                                if (e.target.value !== jobNumber) {
                                                    setJobNumber(e.target.value); // Allow free text if not found
                                                }
                                            }}
                                            onFocus={() => setShowJobDropdown(true)}
                                            className="w-full pl-9 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Search by Job # or Customer..."
                                        />
                                    </div>

                                    {showJobDropdown && (jobResults.length > 0 || isSearchingJobs) && (
                                        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {isSearchingJobs ? (
                                                <div className="p-3 text-sm text-slate-500 text-center">Searching...</div>
                                            ) : (
                                                jobResults.map(job => (
                                                    <div
                                                        key={job.JobNumber}
                                                        onClick={() => {
                                                            setJobNumber(job.JobNumber);
                                                            setJobSearch(job.JobNumber);
                                                            setShowJobDropdown(false);
                                                        }}
                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                                                    >
                                                        <div className="font-medium text-slate-900 dark:text-white text-sm">{job.JobNumber}</div>
                                                        <div className="text-xs text-slate-500">{job.CustomerName || job.PrimaryContact} - {job.PumpModel || job.AssetType}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annexure Number (Optional)</label>
                                    <input
                                        type="text"
                                        list="annexuresList"
                                        value={annexNumberField}
                                        onChange={(e) => setAnnexNumberField(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Type or select annexure"
                                    />
                                    <datalist id="annexuresList">
                                        {annexures.map(a => <option key={a.AnnexNumber} value={a.AnnexNumber} />)}
                                    </datalist>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm"
                                >
                                    {editingClaim ? 'Update Claim' : 'Create Claim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </>
            )}

            {activeTab === 'annexures' && (
                <>
                <div className="flex justify-end gap-3 mb-4">
                    <button
                        onClick={() => handleOpenAnnexModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 font-medium transition-colors"
                    >
                        <Plus size={18} /> New Annexure
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center">{error}</div>
                ) : annexures.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <FileText size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Annexures found</h3>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {annexures.map((annex) => (
                            <div key={annex.AnnexNumber} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-all">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{annex.AnnexNumber}</h3>
                                        {annex.InvoiceNumber && <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Inv: {annex.InvoiceNumber}</span>}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        {annex.ClaimAmount && <div className="font-medium text-slate-700 dark:text-slate-300">₹{parseFloat(annex.ClaimAmount).toLocaleString('en-IN')}</div>}
                                        {annex.PostDate && <div><Clock size={14} className="inline mr-1" />{annex.PostDate.split('T')[0]}</div>}
                                        {annex.ConsignmentNumber && <div>Tracking: {annex.ConsignmentNumber}</div>}
                                    </div>
                                    {annex.PostService && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Post Service: {annex.PostService}</p>}
                                </div>
                                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-3 md:pt-0 md:pl-4">
                                    <button onClick={() => handleOpenAnnexModal(annex)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit size={18} /></button>
                                    <button onClick={() => handleAnnexDelete(annex.AnnexNumber)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showAnnexModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{editingAnnex ? 'Edit Annexure' : 'New Annexure'}</h2>
                                <button onClick={() => setShowAnnexModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleAnnexSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annexure Number *</label>
                                    <input type="text" value={annexNumber} onChange={(e) => setAnnexNumber(e.target.value)} required disabled={!!editingAnnex} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label>
                                    <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Claim Amount</label>
                                    <input type="number" step="0.01" value={annexClaimAmount} onChange={(e) => setAnnexClaimAmount(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Post Service</label>
                                    <input type="text" value={postService} onChange={(e) => setPostService(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Consignment Number</label>
                                    <input type="text" value={consignmentNumber} onChange={(e) => setConsignmentNumber(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Post Date</label>
                                    <input type="date" value={postDate} onChange={(e) => setPostDate(e.target.value)} className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <button type="button" onClick={() => setShowAnnexModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm">{editingAnnex ? 'Update Annexure' : 'Create Annexure'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </>
            )}
        </div>
    );
};

export default FreeOfCostClaims;
